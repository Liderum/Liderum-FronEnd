import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { WorkPaymentSummary } from '@/modules/shared/types/payments';
import { brl, fmtDate } from '../paymentUtils';

interface Props {
  summary?: WorkPaymentSummary;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export function SummaryCards({ summary, loading, error, onRetry }: Props) {
  if (error) {
    return (
      <div className="pg-alert err" role="alert">
        <AlertTriangle size={16} />
        <span>Não foi possível carregar o resumo financeiro.</span>
        <button type="button" onClick={onRetry}><RefreshCw size={12} style={{ verticalAlign: -1 }} /> Tentar novamente</button>
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div aria-busy="true" aria-label="Carregando resumo">
        <div className="pg-ledger" style={{ minHeight: 120 }} />
        <div className="pg-cards" style={{ marginTop: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div className="pg-card" key={i}><div className="pg-skel" style={{ width: '50%' }} /><div className="pg-skel" style={{ width: '80%', height: 22, marginTop: 10 }} /></div>
          ))}
        </div>
      </div>
    );
  }

  const s = summary;
  const received = Math.max(0, Math.min(100, s.percentPaid));
  const scheduled = Math.max(received, Math.min(100, s.percentScheduled));
  const receivable = Math.max(0, s.totalScheduled - s.totalPaid);

  return (
    <>
      <section className="pg-ledger" aria-label="Resumo financeiro do contrato">
        <div className="pg-ledger-head">
          <div>
            <div className="pg-eyebrow">Valor do contrato</div>
            <div className="pg-contract">{brl(s.contractAmount)}</div>
          </div>
          <div className="pg-pct">
            <strong>{received.toFixed(received % 1 === 0 ? 0 : 1)}%</strong>
            recebido
          </div>
        </div>
        <div
          className="pg-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(received)}
          aria-label="Percentual recebido do contrato"
        >
          <div className="pg-bar-sched" style={{ width: `${scheduled}%` }} />
          <div className="pg-bar-paid" style={{ width: `${received}%` }} />
        </div>
        <div className="pg-bar-legend">
          <span><i className="pg-dot" style={{ background: '#D4A843' }} />Recebido {brl(s.totalPaid)}</span>
          <span><i className="pg-dot" style={{ background: 'rgba(212,168,67,0.4)' }} />Agendado {scheduled.toFixed(0)}%</span>
        </div>
      </section>

      <div className="pg-cards">
        <div className="pg-card">
          <div className="pg-card-label">Recebido</div>
          <div className="pg-card-val" style={{ color: '#1E8449' }}>{brl(s.totalPaid)}</div>
          <div className="pg-card-sub">{s.paidCount} {s.paidCount === 1 ? 'pagamento' : 'pagamentos'}</div>
        </div>
        <div className="pg-card">
          <div className="pg-card-label">A receber</div>
          <div className="pg-card-val">{brl(s.totalPending || receivable)}</div>
          <div className="pg-card-sub">{s.pendingCount} pendente{s.pendingCount === 1 ? '' : 's'}</div>
        </div>
        <div className="pg-card">
          <div className="pg-card-label">Em atraso</div>
          <div className="pg-card-val" style={{ color: s.totalOverdue > 0 ? '#C0392B' : undefined }}>{brl(s.totalOverdue)}</div>
          <div className="pg-card-sub">{s.overdueCount} vencido{s.overdueCount === 1 ? '' : 's'}</div>
        </div>
        <div className="pg-card">
          <div className="pg-card-label">Próximo vencimento</div>
          <div className="pg-card-val">{s.nextDue ? fmtDate(s.nextDue.dueDate) : '—'}</div>
          <div className="pg-card-sub">{s.nextDue ? brl(s.nextDue.amount) : 'Nada agendado'}</div>
        </div>
      </div>

      {s.contractAmount > 0 && s.totalScheduled > s.contractAmount + 0.009 && (
        <div className="pg-alert warn" role="status">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            A soma dos pagamentos agendados ({brl(s.totalScheduled)}) ultrapassa o valor do contrato em{' '}
            <strong>{brl(s.totalScheduled - s.contractAmount)}</strong>. Revise os valores.
          </span>
        </div>
      )}
      {s.remainingToSchedule > 0.009 && s.paymentsCount > 0 && (
        <div className="pg-alert info" role="status">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Ainda faltam <strong>{brl(s.remainingToSchedule)}</strong> do contrato para agendar.
          </span>
        </div>
      )}
    </>
  );
}
