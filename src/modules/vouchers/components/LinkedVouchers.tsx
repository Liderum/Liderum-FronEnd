import { Link } from 'react-router-dom';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Paperclip, Plus, Receipt } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { WorkVouchersService } from '@/services/works/workVouchersService';
import { VOUCHER_CATEGORY_LABEL } from '@/modules/shared/types/vouchers';
import { PAYMENTS_CSS } from '@/modules/payments/paymentStyles';
import { paymentsQueryClient } from '@/modules/payments/pages/WorkPaymentsPage';
import { vk } from '@/modules/payments/receiptAdapters';
import { brl, fmtDate } from '@/modules/payments/paymentUtils';

function Content({ workId, incidentId }: { workId: string; incidentId: string }) {
  const canRead = usePermission('workvouchers.read');
  const canWrite = usePermission('workvouchers.write');
  const filters = { incidentId, page: 1, pageSize: 5, sort: '-occurredOn' as const };
  const q = useQuery({
    queryKey: vk.list(workId, filters),
    queryFn: ({ signal }) => WorkVouchersService.list(workId, filters, signal),
    enabled: canRead,
  });
  if (!canRead) return null;

  const base = `/works/${workId}/vouchers?mode=expenses&incident=${encodeURIComponent(incidentId)}`;
  const items = q.data?.items ?? [];
  const total = q.data?.totalCount ?? 0;

  return (
    <div className="pg" style={{ padding: '12px 24px', gap: 8, borderTop: '1px solid rgba(26,24,20,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ink3, #7A7670)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Receipt size={12} /> Comprovantes ligados {q.data ? `(${total})` : ''}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {total > items.length && <Link className="pg-btn sm" to={base}>Ver todos</Link>}
          {canWrite && <Link className="pg-btn sm" to={`${base}&new=1`}><Plus size={12} /> Adicionar comprovante</Link>}
        </span>
      </div>
      {q.isLoading && <div className="pg-skel" style={{ width: '60%' }} />}
      {q.isError && (
        <div className="pg-sub" role="alert">
          Não foi possível carregar os comprovantes. <button type="button" className="pg-clip" onClick={() => q.refetch()}>Tentar novamente</button>
        </div>
      )}
      {q.data && items.length === 0 && <div className="pg-sub">Nenhum comprovante ligado a este incidente.</div>}
      {items.map((v) => (
        <Link key={v.id} to={`/works/${workId}/vouchers?mode=expenses&q=${encodeURIComponent(v.description)}`}
          style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5, color: 'inherit', textDecoration: 'none' }}>
          <span className="pg-type">{VOUCHER_CATEGORY_LABEL[v.category] ?? '—'}</span>
          <span className="pg-desc" style={{ flex: 1, maxWidth: 'none' }}>{v.description}</span>
          <span className="pg-sub">{fmtDate(v.occurredOn)}</span>
          <span className="pg-num">{brl(v.amount)}</span>
          <span className="pg-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Paperclip size={11} />{v.fileCount}</span>
        </Link>
      ))}
    </div>
  );
}

/** Bloco "Comprovantes ligados" do detalhe do incidente. */
export function LinkedVouchers({ workId, incidentId }: { workId: string; incidentId: string }) {
  return (
    <QueryClientProvider client={paymentsQueryClient}>
      <style>{PAYMENTS_CSS}</style>
      <Content workId={workId} incidentId={incidentId} />
    </QueryClientProvider>
  );
}
