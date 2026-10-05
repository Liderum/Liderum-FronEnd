import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { LdModal } from '@/components/LdModal';
import { LdSelect } from '@/components/LdSelect';
import { LdDateInput } from '@/components/LdDateInput';
import { useToast } from '@/hooks/use-toast';
import { WorkPaymentsService, PaymentsApiError } from '@/services/works/workPaymentsService';
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_TYPE_LABEL,
  PaymentStatus,
  type CreateWorkPaymentInput,
  type WorkPayment,
} from '@/modules/shared/types/payments';
import { MoneyInput } from './MoneyInput';
import { brl, moneyToInput, parseMoney, qk, todayYMD, uuid } from '../paymentUtils';

const schema = z
  .object({
    type: z.string().min(1),
    description: z.string().max(200, 'Máximo de 200 caracteres').optional(),
    amount: z.string().optional(),
    percent: z.string().optional(),
    dueDate: z.string().min(1, 'Informe o vencimento'),
    notes: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
    markAsPaid: z.boolean(),
    paidAt: z.string().optional(),
    method: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const pct = v.percent?.trim() ? parseMoney(v.percent) : undefined;
    if (pct !== undefined) {
      if (!(pct > 0 && pct <= 100)) ctx.addIssue({ code: 'custom', path: ['percent'], message: 'Informe de 0,01 a 100' });
    } else {
      const amt = parseMoney(v.amount ?? '');
      if (!(amt > 0)) ctx.addIssue({ code: 'custom', path: ['amount'], message: 'Informe um valor maior que zero' });
    }
    if (v.markAsPaid) {
      if (!v.paidAt) ctx.addIssue({ code: 'custom', path: ['paidAt'], message: 'Informe a data do pagamento' });
      else if (v.paidAt > todayYMD(1)) ctx.addIssue({ code: 'custom', path: ['paidAt'], message: 'A data não pode ser futura' });
      if (!v.method) ctx.addIssue({ code: 'custom', path: ['method'], message: 'Informe a forma de pagamento' });
    }
  });
type FormValues = z.infer<typeof schema>;

const typeOptions = Object.entries(PAYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label }));
const methodOptions = Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => ({ value, label }));

const emptyValues = (): FormValues => ({
  type: '2', description: '', amount: '', percent: '', dueDate: '', notes: '', markAsPaid: false, paidAt: todayYMD(), method: '',
});

function fromPayment(p: WorkPayment): FormValues {
  return {
    type: String(p.type),
    description: p.description ?? '',
    amount: moneyToInput(p.amount),
    percent: '',
    dueDate: p.dueDate,
    notes: p.notes ?? '',
    markAsPaid: false,
    paidAt: todayYMD(),
    method: p.method ? String(p.method) : '',
  };
}

interface Props {
  open: boolean;
  workId: string;
  contractAmount: number;
  editing?: WorkPayment | null;
  /** pré-preenchimento (ex.: atalho "Sinal de 50%") */
  preset?: Partial<FormValues>;
  onClose: () => void;
}

export function PaymentFormModal({ open, workId, contractAmount, editing, preset, onClose }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [conflict, setConflict] = useState(false);
  const [rowVersion, setRowVersion] = useState('');
  const idem = useRef<{ key: string; sig: string } | null>(null);

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  const lockedFinancials = !!editing && editing.status === PaymentStatus.Paid;
  const percent = watch('percent');
  const markAsPaid = watch('markAsPaid');
  const pctNum = percent?.trim() ? parseMoney(percent) : NaN;
  const usingPercent = Number.isFinite(pctNum);
  const computed = usingPercent ? Math.round(contractAmount * pctNum) / 100 : NaN;

  useEffect(() => {
    if (!open) return;
    setConflict(false);
    idem.current = null;
    if (editing) {
      reset(fromPayment(editing));
      setRowVersion(editing.rowVersion);
    } else {
      reset({ ...emptyValues(), ...preset });
    }
  }, [open, editing, preset, reset]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.lists(workId) });
    qc.invalidateQueries({ queryKey: qk.summary(workId) });
  };

  const save = useMutation({
    mutationFn: async (v: FormValues) => {
      const common = {
        type: Number(v.type),
        description: v.description?.trim() || undefined,
        dueDate: v.dueDate,
        method: v.method ? Number(v.method) : undefined,
        notes: v.notes?.trim() || undefined,
      };
      if (editing) {
        return WorkPaymentsService.update(workId, editing.id, {
          ...common,
          amount: lockedFinancials ? editing.amount : parseMoney(v.amount ?? ''),
          rowVersion,
        });
      }
      const payload: CreateWorkPaymentInput = {
        ...common,
        ...(v.percent?.trim() ? { percentOfContract: parseMoney(v.percent) } : { amount: parseMoney(v.amount ?? '') }),
        ...(v.markAsPaid ? { markAsPaid: true, paidAt: v.paidAt } : {}),
      };
      // Mesma chave enquanto o payload não muda (retry seguro); payload novo → chave nova.
      const sig = JSON.stringify(payload);
      if (!idem.current || idem.current.sig !== sig) idem.current = { key: uuid(), sig };
      return WorkPaymentsService.create(workId, payload, idem.current.key);
    },
    onSuccess: () => {
      invalidate();
      if (editing) qc.invalidateQueries({ queryKey: qk.detail(workId, editing.id) });
      toast({ title: editing ? 'Pagamento atualizado' : 'Pagamento criado' });
      idem.current = null;
      onClose();
    },
    onError: (err) => {
      if (err instanceof PaymentsApiError && err.status === 409) {
        setConflict(true);
        return;
      }
      toast({ title: 'Não foi possível salvar', description: err.message, variant: 'destructive' });
    },
  });

  async function reloadLatest() {
    if (!editing) return;
    try {
      const fresh = await WorkPaymentsService.getById(workId, editing.id);
      reset(fromPayment(fresh));
      setRowVersion(fresh.rowVersion);
      setConflict(false);
      invalidate();
    } catch (e) {
      toast({ title: 'Falha ao recarregar', description: (e as Error).message, variant: 'destructive' });
    }
  }

  return (
    <LdModal
      open={open}
      title={editing ? 'Editar pagamento' : 'Novo pagamento'}
      subtitle={editing ? undefined : `Contrato: ${brl(contractAmount)}`}
      onClose={onClose}
      busy={save.isPending}
      confirmLabel={editing ? 'Salvar' : 'Criar pagamento'}
      onConfirm={handleSubmit((v) => save.mutate(v))}
      confirmDisabled={conflict}
      lockOutside
      dirty={isDirty}
    >
      {conflict && (
        <div className="pg-alert err" role="alert" style={{ marginBottom: 14 }}>
          <span>Este pagamento foi alterado por outra pessoa. Recarregue para ver a versão atual antes de salvar.</span>
          <button type="button" onClick={reloadLatest}><RefreshCw size={12} style={{ verticalAlign: -1 }} /> Recarregar</button>
        </div>
      )}
      {lockedFinancials && (
        <div className="pg-alert info" style={{ marginBottom: 14 }}>
          Pagamento já pago: valor, vencimento e tipo não podem ser alterados.
        </div>
      )}

      {!editing && (
        <div className="pg-chips" aria-label="Atalhos">
          <button type="button" className="pg-chip" onClick={() => { setValue('type', '1'); setValue('percent', '50'); setValue('amount', ''); }}>
            Sinal de 50%
          </button>
          <button type="button" className="pg-chip" onClick={() => { setValue('percent', ''); }}>
            Informar valor
          </button>
        </div>
      )}

      <div className="ldm-grid">
        <div className="ldm-field">
          <label className="ldm-label" htmlFor="pg-type">Tipo</label>
          <Controller control={control} name="type" render={({ field }) => (
            <LdSelect className="full" value={field.value} onChange={field.onChange} options={typeOptions} disabled={lockedFinancials} />
          )} />
        </div>
        <div className="ldm-field">
          <label className="ldm-label" htmlFor="pg-due">Vencimento</label>
          <Controller control={control} name="dueDate" render={({ field }) => (
            <LdDateInput value={field.value} onChange={field.onChange} placeholder="Selecione" />
          )} />
          {errors.dueDate && <div className="ldm-error" role="alert">{errors.dueDate.message}</div>}
        </div>
      </div>

      <div className="ldm-grid">
        <div className="ldm-field">
          <label className="ldm-label" htmlFor="pg-amount">Valor</label>
          <Controller control={control} name="amount" render={({ field }) => (
            <MoneyInput
              id="pg-amount"
              value={usingPercent ? moneyToInput(computed) : field.value ?? ''}
              onChange={field.onChange}
              invalid={!!errors.amount}
              disabled={lockedFinancials || usingPercent}
              readOnly={usingPercent}
            />
          )} />
          {errors.amount && <div className="ldm-error" role="alert">{errors.amount.message}</div>}
        </div>
        {!editing && (
          <div className="ldm-field">
            <label className="ldm-label" htmlFor="pg-pct">% do contrato (opcional)</label>
            <input id="pg-pct" inputMode="decimal" className={`ldm-input${errors.percent ? ' invalid' : ''}`} placeholder="Ex.: 50" {...register('percent')} />
            {errors.percent
              ? <div className="ldm-error" role="alert">{errors.percent.message}</div>
              : usingPercent && <div className="ldm-hint">= {brl(computed)}</div>}
          </div>
        )}
      </div>

      <div className="ldm-field">
        <label className="ldm-label" htmlFor="pg-desc">Descrição</label>
        <input id="pg-desc" className="ldm-input" placeholder="Ex.: Sinal da obra" {...register('description')} />
        {errors.description && <div className="ldm-error">{errors.description.message}</div>}
      </div>

      {!editing && (
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, margin: '4px 0 12px', cursor: 'pointer' }}>
          <input type="checkbox" {...register('markAsPaid')} /> Já foi pago
        </label>
      )}

      {(markAsPaid || editing) && (
        <div className="ldm-grid">
          {!editing && (
            <div className="ldm-field">
              <label className="ldm-label">Pago em</label>
              <Controller control={control} name="paidAt" render={({ field }) => (
                <LdDateInput value={field.value ?? ''} onChange={field.onChange} />
              )} />
              {errors.paidAt && <div className="ldm-error" role="alert">{errors.paidAt.message}</div>}
            </div>
          )}
          <div className="ldm-field">
            <label className="ldm-label">Forma de pagamento</label>
            <Controller control={control} name="method" render={({ field }) => (
              <LdSelect className="full" value={field.value ?? ''} onChange={field.onChange} options={methodOptions} placeholder="Selecione" />
            )} />
            {errors.method && <div className="ldm-error" role="alert">{errors.method.message}</div>}
          </div>
        </div>
      )}

      <div className="ldm-field">
        <label className="ldm-label" htmlFor="pg-notes">Observações</label>
        <textarea id="pg-notes" className="ldm-textarea" {...register('notes')} />
        {errors.notes && <div className="ldm-error">{errors.notes.message}</div>}
      </div>
    </LdModal>
  );
}

export type PaymentPreset = Partial<FormValues>;
