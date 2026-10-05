import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { LdModal } from '@/components/LdModal';
import { LdSelect } from '@/components/LdSelect';
import { LdDateInput } from '@/components/LdDateInput';
import { useToast } from '@/hooks/use-toast';
import { IncidentsService } from '@/services/works/incidentsService';
import { WorkVouchersService } from '@/services/works/workVouchersService';
import { PaymentsApiError } from '@/services/works/workPaymentsService';
import { PAYMENT_METHOD_LABEL } from '@/modules/shared/types/payments';
import { VOUCHER_CATEGORY_LABEL, type WorkVoucher, type WorkVoucherInput } from '@/modules/shared/types/vouchers';
import { MoneyInput } from '@/modules/payments/components/MoneyInput';
import { moneyToInput, parseMoney, todayYMD, uuid, validateReceiptFile } from '@/modules/payments/paymentUtils';
import { PendingFilesField, type PendingFile } from './PendingFilesField';
import { vk } from '@/modules/payments/receiptAdapters';

const schema = z.object({
  category: z.string().min(1),
  description: z.string().trim().min(1, 'Informe a descrição').max(200, 'Máximo de 200 caracteres'),
  amount: z.string().refine((v) => parseMoney(v) > 0, 'Informe um valor maior que zero'),
  occurredOn: z.string().min(1, 'Informe a data').refine((v) => v <= todayYMD(1), 'A data não pode ser futura'),
  supplierName: z.string().max(120, 'Máximo de 120 caracteres').optional(),
  documentNumber: z.string().max(60, 'Máximo de 60 caracteres').optional(),
  method: z.string().optional(),
  incidentId: z.string().optional(),
  notes: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
});
type FormValues = z.infer<typeof schema>;

const methodOptions = [
  { value: 'none', label: 'Não informar' },
  ...Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => ({ value, label })),
];

const empty = (incidentId?: string): FormValues => ({
  category: '1', description: '', amount: '', occurredOn: todayYMD(), supplierName: '',
  documentNumber: '', method: 'none', incidentId: incidentId ?? 'none', notes: '',
});

const fromVoucher = (v: WorkVoucher): FormValues => ({
  category: String(v.category),
  description: v.description,
  amount: moneyToInput(v.amount),
  occurredOn: v.occurredOn,
  supplierName: v.supplierName ?? '',
  documentNumber: v.documentNumber ?? '',
  method: v.method ? String(v.method) : 'none',
  incidentId: v.incidentId ?? 'none',
  notes: v.notes ?? '',
});

interface Props {
  open: boolean;
  workId: string;
  editing?: WorkVoucher | null;
  presetIncidentId?: string;
  onClose: () => void;
  onSaved: (voucher: WorkVoucher, created: boolean) => void;
}

export function VoucherFormModal({ open, workId, editing, presetIncidentId, onClose, onSaved }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [conflict, setConflict] = useState(false);
  const [rowVersion, setRowVersion] = useState('');
  const idem = useRef<{ key: string; sig: string } | null>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const filesRef = useRef<PendingFile[]>([]);
  filesRef.current = files;
  // Registro já criado/atualizado: a partir daqui só os arquivos são (re)enviados, sem recriar o voucher.
  const [saved, setSaved] = useState<WorkVoucher | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: empty(),
  });

  const incidents = useQuery({
    queryKey: ['work-incident-options', workId],
    queryFn: () => IncidentsService.list(workId),
    enabled: open,
    staleTime: 60_000,
  });
  const incidentOptions = [
    { value: 'none', label: 'Nenhum incidente' },
    ...(incidents.data ?? []).map((i) => ({ value: i.id, label: i.title })),
  ];

  const existing = useQuery({
    queryKey: vk.files(workId, editing?.id ?? ''),
    queryFn: async () => (await WorkVouchersService.getById(workId, editing!.id)).files,
    enabled: open && !!editing,
    placeholderData: editing?.files,
  });

  const revokeAll = (list: PendingFile[]) => list.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
  useEffect(() => () => revokeAll(filesRef.current), []);

  useEffect(() => {
    if (!open) return;
    setConflict(false);
    idem.current = null;
    revokeAll(filesRef.current);
    setFiles([]);
    setSaved(null);
    setUploading(false);
    setRemovingId(null);
    if (editing) {
      reset(fromVoucher(editing));
      setRowVersion(editing.rowVersion);
    } else {
      reset(empty(presetIncidentId));
    }
  }, [open, editing, presetIncidentId, reset]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: vk.lists(workId) });
    qc.invalidateQueries({ queryKey: vk.summaries(workId) });
  };

  const patchFile = (id: string, patch: Partial<PendingFile>) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  function addFiles(list: File[]) {
    const rejected: string[] = [];
    const accepted: PendingFile[] = [];
    list.forEach((file) => {
      const problem = validateReceiptFile(file);
      if (problem) { rejected.push(file.name + ': ' + problem); return; }
      accepted.push({
        id: uuid(), file, key: uuid(), status: 'queued', progress: 0,
        preview: file.type.startsWith('image/') && !/hei[cf]/i.test(file.type) ? URL.createObjectURL(file) : undefined,
      });
    });
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    if (rejected.length) toast({ title: 'Arquivo não aceito', description: rejected.join('\n'), variant: 'destructive' });
  }

  function removeFile(id: string) {
    const f = filesRef.current.find((x) => x.id === id);
    if (f?.preview) URL.revokeObjectURL(f.preview);
    setFiles((prev) => prev.filter((x) => x.id !== id));
  }

  const refreshFiles = (voucherId: string) => {
    invalidate();
    qc.invalidateQueries({ queryKey: vk.files(workId, voucherId) });
  };

  /** Envia em sequência os arquivos ainda não enviados; devolve quantos falharam. */
  async function uploadPending(voucher: WorkVoucher, only?: string): Promise<number> {
    setUploading(true);
    let failed = 0;
    const todo = filesRef.current.filter((f) => f.status !== 'done' && (!only || f.id === only));
    for (const f of todo) {
      patchFile(f.id, { status: 'uploading', progress: 0, error: undefined });
      try {
        await WorkVouchersService.uploadFile(workId, voucher.id, f.file, {
          idempotencyKey: f.key,
          onProgress: (p) => patchFile(f.id, { progress: p }),
        });
        patchFile(f.id, { status: 'done', progress: 100 });
      } catch (e) {
        failed++;
        patchFile(f.id, { status: 'error', error: (e as Error).message });
      }
    }
    setUploading(false);
    refreshFiles(voucher.id);
    return failed;
  }

  function finish(voucher: WorkVoucher, created: boolean) {
    idem.current = null;
    onSaved(voucher, created);
  }

  async function retryFailed(only?: string) {
    if (!saved) return;
    const failed = await uploadPending(saved, only);
    const remaining = filesRef.current.filter((f) => f.status !== 'done');
    if (failed === 0 && remaining.length === 0) finish(saved, !editing);
  }

  function discardFailed(id: string) {
    removeFile(id);
    // Nada mais pendente: encerra.
    if (saved && filesRef.current.filter((f) => f.id !== id && f.status !== 'done').length === 0) finish(saved, !editing);
  }

  async function removeExisting(fileId: string) {
    setRemovingId(fileId);
    try {
      await WorkVouchersService.removeFile(workId, editing!.id, fileId);
      refreshFiles(editing!.id);
      toast({ title: 'Comprovante removido' });
    } catch (e) {
      toast({ title: 'Não foi possível remover', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setRemovingId(null);
    }
  }

  const save = useMutation({
    mutationFn: async (v: FormValues) => {
      const input: WorkVoucherInput = {
        category: Number(v.category),
        description: v.description.trim(),
        amount: parseMoney(v.amount),
        occurredOn: v.occurredOn,
        supplierName: v.supplierName?.trim() || undefined,
        documentNumber: v.documentNumber?.trim() || undefined,
        method: v.method && v.method !== 'none' ? Number(v.method) : undefined,
        notes: v.notes?.trim() || undefined,
        incidentId: v.incidentId && v.incidentId !== 'none' ? v.incidentId : undefined,
      };
      if (editing) return WorkVouchersService.update(workId, editing.id, { ...input, rowVersion });
      // Mesma chave enquanto o payload não muda (retry seguro); payload novo → chave nova.
      const sig = JSON.stringify(input);
      if (!idem.current || idem.current.sig !== sig) idem.current = { key: uuid(), sig };
      return WorkVouchersService.create(workId, input, idem.current.key);
    },
    onSuccess: async (voucher) => {
      refreshFiles(voucher.id);
      toast({ title: editing ? 'Registro atualizado' : 'Registro criado' });
      if (filesRef.current.length === 0) { finish(voucher, !editing); return; }
      setSaved(voucher);
      const failed = await uploadPending(voucher);
      if (failed === 0) finish(voucher, !editing);
    },
    onError: (err) => {
      if (err instanceof PaymentsApiError && err.status === 409) { setConflict(true); return; }
      toast({ title: 'Não foi possível salvar', description: err.message, variant: 'destructive' });
    },
  });

  async function reloadLatest() {
    if (!editing) return;
    try {
      const fresh = await WorkVouchersService.getById(workId, editing.id);
      reset(fromVoucher(fresh));
      setRowVersion(fresh.rowVersion);
      setConflict(false);
      invalidate();
    } catch (e) {
      toast({ title: 'Falha ao recarregar', description: (e as Error).message, variant: 'destructive' });
    }
  }

  const category = watch('category');
  const failedCount = files.filter((f) => f.status === 'error').length;
  const busy = save.isPending || uploading;

  return (
    <LdModal
      open={open}
      title={editing ? 'Editar compra ou serviço' : 'Nova compra ou serviço'}
      subtitle={saved
        ? (uploading ? 'Enviando comprovantes…' : `Registro salvo — ${failedCount} arquivo(s) não enviado(s)`)
        : undefined}
      onClose={saved ? () => finish(saved, !editing) : onClose}
      busy={busy}
      cancelLabel={saved ? 'Fechar assim mesmo' : 'Cancelar'}
      confirmLabel={saved ? 'Tentar de novo' : editing ? 'Salvar' : 'Salvar registro'}
      onConfirm={saved ? () => void retryFailed() : handleSubmit((v) => save.mutate(v))}
      confirmDisabled={saved ? failedCount === 0 : conflict}
      lockOutside
      dirty={saved ? false : isDirty || files.length > 0}
    >
      {saved ? (
        <PendingFilesField files={files} onAdd={addFiles} onRemove={discardFailed} onRetry={(id) => void retryFailed(id)} hideDropzone disabled={uploading} />
      ) : (
      <>
      {conflict && (
        <div className="pg-alert err" role="alert" style={{ marginBottom: 14 }}>
          <span>Este registro foi alterado por outra pessoa. Recarregue para ver a versão atual.</span>
          <button type="button" onClick={reloadLatest}><RefreshCw size={12} style={{ verticalAlign: -1 }} /> Recarregar</button>
        </div>
      )}

      <div className="ldm-field">
        <span className="ldm-label" id="vc-cat">Categoria</span>
        <div className="pg-chips" role="radiogroup" aria-labelledby="vc-cat" style={{ marginBottom: 0 }}>
          {Object.entries(VOUCHER_CATEGORY_LABEL).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={category === value}
              className="pg-chip"
              style={category === value ? { background: 'var(--gold,#B8922A)', color: '#fff' } : undefined}
              onClick={() => setValue('category', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="ldm-field">
        <label className="ldm-label" htmlFor="vc-desc">Descrição</label>
        <input id="vc-desc" className={`ldm-input${errors.description ? ' invalid' : ''}`} placeholder="Ex.: 20 sacos de cimento" {...register('description')} />
        {errors.description && <div className="ldm-error" role="alert">{errors.description.message}</div>}
      </div>

      <div className="ldm-grid">
        <div className="ldm-field">
          <label className="ldm-label" htmlFor="vc-amount">Valor</label>
          <Controller control={control} name="amount" render={({ field }) => (
            <MoneyInput id="vc-amount" value={field.value} onChange={field.onChange} invalid={!!errors.amount} />
          )} />
          {errors.amount && <div className="ldm-error" role="alert">{errors.amount.message}</div>}
        </div>
        <div className="ldm-field">
          <label className="ldm-label">Data</label>
          <Controller control={control} name="occurredOn" render={({ field }) => (
            <LdDateInput value={field.value} onChange={field.onChange} />
          )} />
          {errors.occurredOn && <div className="ldm-error" role="alert">{errors.occurredOn.message}</div>}
        </div>
      </div>

      <div className="ldm-grid">
        <div className="ldm-field">
          <label className="ldm-label" htmlFor="vc-supplier">Fornecedor</label>
          <input id="vc-supplier" className="ldm-input" {...register('supplierName')} />
          {errors.supplierName && <div className="ldm-error">{errors.supplierName.message}</div>}
        </div>
        <div className="ldm-field">
          <label className="ldm-label" htmlFor="vc-doc">Nº da nota/recibo</label>
          <input id="vc-doc" className="ldm-input" {...register('documentNumber')} />
          {errors.documentNumber && <div className="ldm-error">{errors.documentNumber.message}</div>}
        </div>
      </div>

      <div className="ldm-grid">
        <div className="ldm-field">
          <label className="ldm-label">Forma de pagamento</label>
          <Controller control={control} name="method" render={({ field }) => (
            <LdSelect className="full" value={field.value ?? 'none'} onChange={field.onChange} options={methodOptions} />
          )} />
        </div>
        <div className="ldm-field">
          <label className="ldm-label">Incidente (opcional)</label>
          <Controller control={control} name="incidentId" render={({ field }) => (
            <LdSelect className="full" searchable value={field.value ?? 'none'} onChange={field.onChange} options={incidentOptions} />
          )} />
          {incidents.isError && <div className="ldm-hint">Não foi possível carregar os incidentes.</div>}
        </div>
      </div>

      <div className="ldm-field">
        <label className="ldm-label" htmlFor="vc-notes">Observações</label>
        <textarea id="vc-notes" className="ldm-textarea" {...register('notes')} />
        {errors.notes && <div className="ldm-error">{errors.notes.message}</div>}
      </div>
      <div className="ldm-field">
        <span className="ldm-label">Comprovantes</span>
        {editing && (existing.data?.length ?? 0) > 0 && (
          <div className="pg-rows" style={{ marginTop: 0, marginBottom: 8 }}>
            {existing.data!.map((f) => (
              <div className="pg-row" key={f.id}>
                <div className="pg-row-info">
                  <div className="pg-row-name" title={f.fileName}>{f.fileName}</div>
                  <div className="pg-sub">Já anexado</div>
                </div>
                <button type="button" className="pg-iconbtn" aria-label={`Remover ${f.fileName}`} title="Remover" disabled={busy || removingId === f.id}
                  onClick={() => void removeExisting(f.id)}>
                  {removingId === f.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            ))}
          </div>
        )}
        <PendingFilesField files={files} onAdd={addFiles} onRemove={removeFile} disabled={busy} />
        <div className="ldm-hint">Os arquivos são enviados ao salvar.</div>
      </div>
      </>
      )}
    </LdModal>
  );
}
