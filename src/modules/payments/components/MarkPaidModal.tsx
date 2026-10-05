import { useEffect, useState } from 'react';
import { LdModal } from '@/components/LdModal';
import { LdSelect } from '@/components/LdSelect';
import { LdDateInput } from '@/components/LdDateInput';
import { PAYMENT_METHOD_LABEL, type MarkPaidInput, type WorkPayment } from '@/modules/shared/types/payments';
import { MoneyInput } from './MoneyInput';
import { brl, moneyToInput, parseMoney, todayYMD } from '../paymentUtils';

const methodOptions = Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => ({ value, label }));

interface Props {
  payment: WorkPayment | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (input: MarkPaidInput) => void;
}

export function MarkPaidModal({ payment, busy, onClose, onConfirm }: Props) {
  const [paidAt, setPaidAt] = useState(todayYMD());
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!payment) return;
    setPaidAt(todayYMD());
    setMethod(payment.method ? String(payment.method) : '');
    setAmount(moneyToInput(payment.amount));
    setTouched(false);
    setDirty(false);
  }, [payment]);

  const amountNum = parseMoney(amount);
  const errs = {
    paidAt: !paidAt ? 'Informe a data' : paidAt > todayYMD(1) ? 'A data não pode ser futura' : '',
    method: method ? '' : 'Informe a forma de pagamento',
    amount: amountNum > 0 ? '' : 'Valor inválido',
  };
  const ok = !errs.paidAt && !errs.method && !errs.amount;

  return (
    <LdModal
      open={!!payment}
      title="Marcar como pago"
      subtitle={payment ? `${payment.description || 'Pagamento'} · previsto ${brl(payment.amount)}` : undefined}
      onClose={onClose}
      busy={busy}
      lockOutside
      dirty={dirty}
      confirmLabel="Confirmar pagamento"
      onConfirm={() => {
        setTouched(true);
        if (!ok || !payment) return;
        onConfirm({
          paidAt,
          method: Number(method),
          paidAmount: Math.abs(amountNum - payment.amount) < 0.005 ? undefined : amountNum,
        });
      }}
    >
      <div className="ldm-grid">
        <div className="ldm-field">
          <label className="ldm-label">Pago em</label>
          <LdDateInput value={paidAt} onChange={(v) => { setPaidAt(v); setDirty(true); }} />
          {touched && errs.paidAt && <div className="ldm-error" role="alert">{errs.paidAt}</div>}
        </div>
        <div className="ldm-field">
          <label className="ldm-label">Forma de pagamento</label>
          <LdSelect className="full" value={method} onChange={(v) => { setMethod(v); setDirty(true); }} options={methodOptions} placeholder="Selecione" />
          {touched && errs.method && <div className="ldm-error" role="alert">{errs.method}</div>}
        </div>
      </div>
      <div className="ldm-field">
        <label className="ldm-label" htmlFor="pg-mp-amount">Valor pago</label>
        <MoneyInput id="pg-mp-amount" value={amount} onChange={(v) => { setAmount(v); setDirty(true); }} />
        {touched && errs.amount && <div className="ldm-error" role="alert">{errs.amount}</div>}
      </div>
    </LdModal>
  );
}
