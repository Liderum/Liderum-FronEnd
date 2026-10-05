import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LdModal } from '@/components/LdModal';
import { LdDateInput } from '@/components/LdDateInput';
import { useToast } from '@/hooks/use-toast';
import { WorkPaymentsService } from '@/services/works/workPaymentsService';
import { PaymentType } from '@/modules/shared/types/payments';
import { MoneyInput } from './MoneyInput';
import { addMonthsYMD, brl, moneyToInput, parseMoney, qk, todayYMD, uuid } from '../paymentUtils';

interface Props {
  open: boolean;
  workId: string;
  defaultTotal: number;
  onClose: () => void;
}

/** Gera N parcelas mensais iguais (a última absorve os centavos). */
export function InstallmentsModal({ open, workId, defaultTotal, onClose }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [total, setTotal] = useState('');
  const [count, setCount] = useState('4');
  const [first, setFirst] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  // Uma chave por parcela por tentativa; reaproveitadas no retry (parcelas já criadas não duplicam).
  const keys = useRef<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setTotal(moneyToInput(defaultTotal > 0 ? defaultTotal : undefined));
    setCount('4');
    setFirst(addMonthsYMD(todayYMD(), 1));
    setError('');
    setDirty(false);
    keys.current = [];
  }, [open, defaultTotal]);

  const n = Number.parseInt(count, 10);
  const totalNum = parseMoney(total);
  const valid = Number.isInteger(n) && n >= 2 && n <= 36 && totalNum > 0 && !!first;

  const plan = useMemo(() => {
    if (!valid) return [];
    const cents = Math.round(totalNum * 100);
    const base = Math.floor(cents / n);
    return Array.from({ length: n }, (_, i) => ({
      amount: (i === n - 1 ? cents - base * (n - 1) : base) / 100,
      dueDate: addMonthsYMD(first, i),
    }));
  }, [valid, totalNum, n, first]);

  async function submit() {
    if (!valid) {
      setError('Informe valor total, 2 a 36 parcelas e a primeira data.');
      return;
    }
    setBusy(true);
    setError('');
    let created = 0;
    try {
      while (keys.current.length < plan.length) keys.current.push(uuid());
      for (let i = 0; i < plan.length; i++) {
        await WorkPaymentsService.create(
          workId,
          {
            type: PaymentType.Installment,
            description: `Parcela ${i + 1}/${plan.length}`,
            amount: plan[i].amount,
            dueDate: plan[i].dueDate,
          },
          keys.current[i],
        );
        created++;
      }
      toast({ title: `${created} parcelas criadas` });
      onClose();
    } catch (e) {
      setError(`${created} de ${plan.length} parcelas criadas. ${(e as Error).message} Clique em criar para tentar de novo sem duplicar.`);
    } finally {
      setBusy(false);
      qc.invalidateQueries({ queryKey: qk.lists(workId) });
      qc.invalidateQueries({ queryKey: qk.summary(workId) });
    }
  }

  return (
    <LdModal
      open={open}
      title="Gerar parcelas"
      subtitle="Divide o valor em parcelas mensais iguais"
      onClose={onClose}
      busy={busy}
      lockOutside
      dirty={dirty}
      confirmLabel={valid ? `Criar ${n} parcelas` : 'Criar parcelas'}
      confirmDisabled={!valid}
      onConfirm={submit}
    >
      <div className="ldm-grid">
        <div className="ldm-field">
          <label className="ldm-label" htmlFor="pg-it-total">Valor total</label>
          <MoneyInput id="pg-it-total" value={total} onChange={(v) => { setTotal(v); setDirty(true); }} disabled={busy} />
        </div>
        <div className="ldm-field">
          <label className="ldm-label" htmlFor="pg-it-n">Nº de parcelas</label>
          <input id="pg-it-n" inputMode="numeric" className="ldm-input" value={count} onChange={(e) => { setDirty(true); setCount(e.target.value.replace(/\D/g, '')); }} disabled={busy} />
        </div>
      </div>
      <div className="ldm-field">
        <label className="ldm-label">Primeiro vencimento</label>
        <LdDateInput value={first} onChange={(v) => { setFirst(v); setDirty(true); }} />
      </div>
      {plan.length > 0 && (
        <div className="ldm-hint" style={{ marginBottom: 12 }}>
          {plan.length}x de {brl(plan[0].amount)}
          {plan[plan.length - 1].amount !== plan[0].amount && ` (última de ${brl(plan[plan.length - 1].amount)})`}
          , até {plan[plan.length - 1].dueDate.split('-').reverse().join('/')}
        </div>
      )}
      {error && <div className="pg-alert err" role="alert">{error}</div>}
    </LdModal>
  );
}
