import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { PaymentsAdminService, type CustomerStatus } from '@/services/billing';
import { ErrorBanner } from '@/modules/billing/components/Feedback';
import { formatBRL, formatDate } from '@/modules/billing/lib';

const STATUS_LABEL: Record<CustomerStatus, string> = {
  Active: 'Ativo', Trial: 'Teste', PastDue: 'Em atraso', Churned: 'Cancelado', Suspended: 'Suspenso', Unknown: '—',
};
// Sem trial: não há dias grátis (pagamento obrigatório no cadastro).
const FILTERABLE: CustomerStatus[] = ['Active', 'PastDue', 'Suspended', 'Churned'];
const PAGE_SIZE = 10;

export function CustomersTable() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ['billing-admin', 'customers', status, page],
    queryFn: () => PaymentsAdminService.listCustomers(status || undefined, page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });
  const rows = q.data?.items ?? [];
  const totalPages = Math.max(1, q.data?.totalPages ?? 1);

  return (
    <section className="bl-card" aria-labelledby="bl-cust-h" style={{ overflow: 'hidden' }}>
      <div className="bl-toolbar" style={{ padding: '18px 20px 12px' }}>
        <div>
          <h2 className="bl-h2" id="bl-cust-h">Clientes</h2>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{q.data ? `${q.data.totalRecords} no total` : ' '}</div>
        </div>
        <div style={{ minWidth: 180 }}>
          <label className="bl-label" htmlFor="bl-cust-status">Status</label>
          <select id="bl-cust-status" className="bl-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Todos</option>
            {FILTERABLE.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </div>

      {q.isError && <div style={{ padding: '0 20px 16px' }}><ErrorBanner error={q.error as Error} onRetry={() => q.refetch()} /></div>}

      {q.isLoading ? (
        <div style={{ padding: 20, display: 'grid', gap: 10 }} aria-busy="true" aria-label="Carregando clientes">
          {[0, 1, 2, 3].map((i) => <div key={i} className="bl-skel" style={{ height: 34 }} />)}
        </div>
      ) : rows.length === 0 && !q.isError ? (
        <div className="bl-empty">Nenhum cliente encontrado{status ? ' para este status' : ''}.</div>
      ) : (
        <div className="bl-table-wrap" aria-busy={q.isFetching}>
          <table className="bl-table">
            <caption className="bl-sr">Clientes e assinaturas</caption>
            <thead>
              <tr>
                <th scope="col">Cliente</th><th scope="col">Plano</th><th scope="col">Status</th>
                <th scope="col">Desde</th><th scope="col">Vence em</th><th scope="col" className="r">LTV</th><th scope="col">Último pgto.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.tenantId}>
                  <td style={{ fontWeight: 500 }}>{c.tenantName}</td>
                  <td>{c.planCode ?? '—'}</td>
                  <td><span className={`bl-status ${c.status}`}>{STATUS_LABEL[c.status]}</span></td>
                  <td>{formatDate(c.since)}</td>
                  <td>{formatDate(c.currentPeriodEnd)}</td>
                  <td className="r bl-num">{formatBRL(c.lifetimeValueInCents)}</td>
                  <td>{formatDate(c.lastPaymentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className="bl-pager" aria-label="Paginação de clientes">
        <span className="bl-num">Página {page} de {totalPages}</span>
        <span style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="bl-btn" disabled={page <= 1 || q.isFetching} onClick={() => setPage((p) => p - 1)}>Anterior</button>
          <button type="button" className="bl-btn" disabled={page >= totalPages || q.isFetching} onClick={() => setPage((p) => p + 1)}>Próxima</button>
        </span>
      </nav>
    </section>
  );
}
