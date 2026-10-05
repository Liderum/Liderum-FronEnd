import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  QueryClient, keepPreviousData, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import {
  AlertTriangle, ArrowDown, ArrowUp, Ban, CalendarPlus, CheckCircle2, ChevronLeft, ChevronRight, Loader2,
  Paperclip, Pencil, Plus, RefreshCw, Search, Trash2, Wallet, X,
} from 'lucide-react';
import { LdSelect } from '@/components/LdSelect';
import { LdDateInput } from '@/components/LdDateInput';
import { LdConfirmDialog } from '@/components/LdConfirmDialog';
import { usePermission } from '@/hooks/usePermission';
import { useToast } from '@/hooks/use-toast';
import { WorkPaymentsService, PaymentsApiError } from '@/services/works/workPaymentsService';
import {
  PAYMENT_TYPE_LABEL, PaymentStatus,
  type MarkPaidInput, type PagedResult, type PaymentSort, type WorkPayment, type WorkPaymentFilters,
} from '@/modules/shared/types/payments';
import { FilterBar, FilterField } from '../components/FilterBar';
import { SummaryCards } from '../components/SummaryCards';
import { PaymentFormModal } from '../components/PaymentFormModal';
import { InstallmentsModal } from '../components/InstallmentsModal';
import { MarkPaidModal } from '../components/MarkPaidModal';
import { ReceiptsDialog } from '../components/ReceiptsDialog';
import { paymentsAdapter } from '../receiptAdapters';
import { STATUS_UI, brl, displayStatus, fmtDate, qk, todayYMD } from '../paymentUtils';

const PAGE_SIZE = 25;

// Cliente próprio da aba Comprovantes: o app ainda não tem QueryClientProvider global.
export const paymentsQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      retry: (count, err) => {
        const status = err instanceof PaymentsApiError ? err.status : undefined;
        return count < 2 && (status === undefined || status >= 500);
      },
    },
  },
});

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'overdue', label: 'Atrasado' },
  { value: 'cancelled', label: 'Cancelado' },
];
const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos os tipos' },
  ...Object.entries(PAYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label })),
];
const RECEIPT_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'with', label: 'Com comprovante' },
  { value: 'without', label: 'Sem comprovante' },
];

function useUrlFilters() {
  const [sp, setSp] = useSearchParams();
  const get = (k: string, d = '') => sp.get(k) ?? d;
  const filters = {
    status: get('status', 'all'),
    type: get('type', 'all'),
    from: get('from'),
    to: get('to'),
    receipt: get('receipt', 'all'),
    q: get('q'),
    sort: get('sort', 'dueDate') as PaymentSort,
    page: Math.max(1, Number(get('page', '1')) || 1),
  };
  const patch = (changes: Record<string, string | number | undefined>, keepPage = false) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([k, v]) => {
        if (v === undefined || v === '' || v === 'all' || (k === 'page' && v === 1) || (k === 'sort' && v === 'dueDate')) next.delete(k);
        else next.set(k, String(v));
      });
      if (!keepPage && !('page' in changes)) next.delete('page');
      return next;
    }, { replace: true });
  };
  const clear = () => setSp((prev) => {
    const next = new URLSearchParams();
    if (prev.has('mode')) next.set('mode', prev.get('mode') as string);
    return next;
  }, { replace: true });
  const active = ['status', 'type', 'from', 'to', 'receipt', 'q'].some((k) => sp.has(k));
  return { filters, patch, clear, active };
}

function toApiFilters(f: ReturnType<typeof useUrlFilters>['filters']): WorkPaymentFilters {
  let to = f.to || undefined;
  let status: number | undefined;
  if (f.status === 'pending') status = PaymentStatus.Pending;
  if (f.status === 'paid') status = PaymentStatus.Paid;
  if (f.status === 'cancelled') status = PaymentStatus.Cancelled;
  if (f.status === 'overdue') {
    // Atrasado não é persistido: pendente com vencimento anterior a hoje.
    status = PaymentStatus.Pending;
    const yesterday = todayYMD(-1);
    to = !to || to > yesterday ? yesterday : to;
  }
  return {
    status,
    type: f.type === 'all' ? undefined : Number(f.type),
    from: f.from || undefined,
    to,
    search: f.q || undefined,
    hasReceipt: f.receipt === 'with' ? true : f.receipt === 'without' ? false : undefined,
    page: f.page,
    pageSize: PAGE_SIZE,
    sort: f.sort,
  };
}

export function PaymentsContent() {
  const { id: workId = '' } = useParams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const canWrite = usePermission('workpayments.write');
  const canDelete = usePermission('workpayments.delete');
  const { filters, patch, clear, active } = useUrlFilters();

  const [searchText, setSearchText] = useState(filters.q);
  useEffect(() => setSearchText(filters.q), [filters.q]);
  useEffect(() => {
    if (searchText === filters.q) return;
    const t = setTimeout(() => patch({ q: searchText.trim() }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const apiFilters = useMemo(() => toApiFilters(filters), [filters]);

  const summary = useQuery({
    queryKey: qk.summary(workId),
    queryFn: () => WorkPaymentsService.summary(workId),
    enabled: !!workId,
  });
  const list = useQuery({
    queryKey: qk.list(workId, apiFilters),
    queryFn: ({ signal }) => WorkPaymentsService.list(workId, apiFilters, signal),
    enabled: !!workId,
    placeholderData: keepPreviousData,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkPayment | null>(null);
  const [installmentsOpen, setInstallmentsOpen] = useState(false);
  const [paying, setPaying] = useState<WorkPayment | null>(null);
  const [cancelling, setCancelling] = useState<WorkPayment | null>(null);
  const [deleting, setDeleting] = useState<WorkPayment | null>(null);
  const [receiptsFor, setReceiptsFor] = useState<WorkPayment | null>(null);

  const contractAmount = summary.data?.contractAmount ?? 0;
  const adapter = useMemo(() => paymentsAdapter(workId), [workId]);

  /** Optimistic update nas listas em cache, com rollback no erro e revalidação ao final. */
  function optimistic<V extends { id: string }>(
    fn: (v: V) => Promise<unknown>,
    patchItem: ((p: WorkPayment, v: V) => WorkPayment | null) | null,
    messages: { ok: string; fail: string },
    after?: () => void,
  ) {
    return {
      mutationFn: fn,
      onMutate: async (v: V) => {
        await qc.cancelQueries({ queryKey: qk.lists(workId) });
        const snapshot = qc.getQueriesData<PagedResult<WorkPayment>>({ queryKey: qk.lists(workId) });
        if (patchItem) {
          qc.setQueriesData<PagedResult<WorkPayment>>({ queryKey: qk.lists(workId) }, (l) => {
            if (!l) return l;
            const items = l.items.flatMap((p) => (p.id === v.id ? [patchItem(p, v)].filter(Boolean) as WorkPayment[] : [p]));
            return { ...l, items, totalCount: l.totalCount - (l.items.length - items.length) };
          });
        }
        return { snapshot };
      },
      onError: (err: Error, _v: V, ctx?: { snapshot: [readonly unknown[], PagedResult<WorkPayment> | undefined][] }) => {
        ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
        toast({ title: messages.fail, description: err.message, variant: 'destructive' });
      },
      onSuccess: () => { toast({ title: messages.ok }); after?.(); },
      onSettled: () => {
        qc.invalidateQueries({ queryKey: qk.lists(workId) });
        qc.invalidateQueries({ queryKey: qk.summary(workId) });
      },
    };
  }

  const markPaid = useMutation(optimistic<{ id: string } & MarkPaidInput>(
    ({ id, ...input }) => WorkPaymentsService.markPaid(workId, id, input),
    (p, v) => ({ ...p, status: PaymentStatus.Paid, isOverdue: false, paidAt: v.paidAt, method: v.method, paidAmount: v.paidAmount ?? p.amount }),
    { ok: 'Pagamento marcado como pago', fail: 'Não foi possível marcar como pago' },
    () => setPaying(null),
  ));
  const cancelPay = useMutation(optimistic<{ id: string }>(
    ({ id }) => WorkPaymentsService.cancel(workId, id),
    (p) => ({ ...p, status: PaymentStatus.Cancelled, isOverdue: false }),
    { ok: 'Pagamento cancelado', fail: 'Não foi possível cancelar' },
    () => setCancelling(null),
  ));
  const removePay = useMutation(optimistic<{ id: string }>(
    ({ id }) => WorkPaymentsService.remove(workId, id),
    () => null,
    { ok: 'Pagamento excluído', fail: 'Não foi possível excluir' },
    () => setDeleting(null),
  ));

  const data = list.data;
  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / (data.pageSize || PAGE_SIZE))) : 1;
  const noPaymentsAtAll = !active && !list.isLoading && !list.isError && (data?.totalCount ?? 0) === 0;

  function toggleSort(field: 'dueDate' | 'amount') {
    const next: PaymentSort = filters.sort === field ? (`-${field}` as PaymentSort) : field;
    patch({ sort: next });
  }
  const sortIcon = (field: 'dueDate' | 'amount') =>
    filters.sort === field ? <ArrowUp size={11} /> : filters.sort === `-${field}` ? <ArrowDown size={11} /> : null;
  const ariaSort = (field: 'dueDate' | 'amount') =>
    filters.sort === field ? 'ascending' : filters.sort === `-${field}` ? 'descending' : 'none';

  if (!workId) return null;

  return (
    <div className="pg">
      <SummaryCards
        summary={summary.data}
        loading={summary.isLoading}
        error={summary.isError}
        onRetry={() => summary.refetch()}
      />

      <FilterBar>
        <FilterField label="Buscar" htmlFor="pg-q">
          <div className="pg-search">
            <Search size={14} aria-hidden />
            <input
              id="pg-q"
              className="pg-input"
              placeholder="Descrição, observação ou arquivo"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </FilterField>
        <FilterField label="Situação">
          <LdSelect className="full" value={filters.status} onChange={(v) => patch({ status: v })} options={STATUS_OPTIONS} />
        </FilterField>
        <FilterField label="Tipo">
          <LdSelect className="full" value={filters.type} onChange={(v) => patch({ type: v })} options={TYPE_OPTIONS} />
        </FilterField>
        <FilterField label="Comprovante">
          <LdSelect className="full" value={filters.receipt} onChange={(v) => patch({ receipt: v })} options={RECEIPT_OPTIONS} />
        </FilterField>
        <FilterField label="Vencimento de">
          <LdDateInput
            value={filters.from}
            onChange={(v) => patch(v && filters.to && v > filters.to ? { from: v, to: '' } : { from: v })}
            placeholder="dd/mm/aaaa"
            clearable
          />
        </FilterField>
        <FilterField label="Vencimento até">
          <LdDateInput value={filters.to} onChange={(v) => patch({ to: v })} min={filters.from || undefined} placeholder="dd/mm/aaaa" clearable />
        </FilterField>
      </FilterBar>

      <div className="pg-toolbar">
        {active && (
          <button type="button" className="pg-btn" onClick={clear}><X size={13} /> Limpar filtros</button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canWrite && (
            <>
              <button type="button" className="pg-btn" onClick={() => setInstallmentsOpen(true)}>
                <CalendarPlus size={14} /> Gerar parcelas
              </button>
              <button type="button" className="pg-btn primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus size={14} /> Novo pagamento
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pg-tablewrap" aria-busy={list.isFetching}>
        {list.isError && !data ? (
          <div className="pg-empty" role="alert">
            <AlertTriangle size={30} color="#C0392B" />
            <h3>Não foi possível carregar os pagamentos</h3>
            <p style={{ fontSize: 12.5 }}>{(list.error as Error).message}</p>
            <button type="button" className="pg-btn" style={{ marginTop: 10 }} onClick={() => list.refetch()}>
              <RefreshCw size={13} /> Tentar novamente
            </button>
          </div>
        ) : list.isLoading ? (
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }} aria-label="Carregando pagamentos">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="pg-skel" style={{ height: 18 }} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="pg-empty">
            <Wallet size={32} color="#B8922A" />
            <h3>{noPaymentsAtAll ? 'Nenhum pagamento registrado' : 'Nenhum pagamento encontrado'}</h3>
            <p style={{ fontSize: 12.5 }}>
              {noPaymentsAtAll
                ? 'Registre o sinal e as parcelas para acompanhar o que já foi recebido.'
                : 'Ajuste ou limpe os filtros para ver outros pagamentos.'}
            </p>
            {noPaymentsAtAll && canWrite && (
              <button type="button" className="pg-btn primary" style={{ marginTop: 12 }} onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus size={14} /> Registrar primeiro pagamento
              </button>
            )}
            {!noPaymentsAtAll && <button type="button" className="pg-btn" style={{ marginTop: 12 }} onClick={clear}>Limpar filtros</button>}
          </div>
        ) : (
          <>
            {list.isError && (
              <div className="pg-alert err" role="alert" style={{ margin: 10 }}>
                <span>Falha ao atualizar a lista; exibindo dados anteriores.</span>
                <button type="button" onClick={() => list.refetch()}>Tentar novamente</button>
              </div>
            )}
            <div className="pg-scroll">
              <table className="pg-table">
                <caption className="sr-only">Pagamentos da obra</caption>
                <thead>
                  <tr>
                    <th scope="col">Descrição</th>
                    <th scope="col">Tipo</th>
                    <th scope="col" className="num" aria-sort={ariaSort('amount')}>
                      <button type="button" onClick={() => toggleSort('amount')}>Valor {sortIcon('amount')}</button>
                    </th>
                    <th scope="col" aria-sort={ariaSort('dueDate')}>
                      <button type="button" onClick={() => toggleSort('dueDate')}>Vencimento {sortIcon('dueDate')}</button>
                    </th>
                    <th scope="col">Pago em</th>
                    <th scope="col">Status</th>
                    <th scope="col">Comprovantes</th>
                    <th scope="col"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => {
                    const ds = displayStatus(p);
                    const ui = STATUS_UI[ds];
                    const rowBusy =
                      (markPaid.isPending && markPaid.variables?.id === p.id) ||
                      (cancelPay.isPending && cancelPay.variables?.id === p.id) ||
                      (removePay.isPending && removePay.variables?.id === p.id);
                    const isPending = p.status === PaymentStatus.Pending;
                    return (
                      <tr key={p.id} className={ds === 'cancelled' ? 'cancelled' : ''}>
                        <td>
                          <div className="pg-desc" title={p.description}>{p.description || PAYMENT_TYPE_LABEL[p.type]}</div>
                          {p.notes && <div className="pg-sub" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes}</div>}
                        </td>
                        <td><span className="pg-type">{PAYMENT_TYPE_LABEL[p.type] ?? '—'}</span></td>
                        <td className="num pg-num">{brl(p.amount)}</td>
                        <td className="pg-num" style={{ fontWeight: 500, color: ds === 'overdue' ? '#C0392B' : undefined }}>{fmtDate(p.dueDate)}</td>
                        <td className="pg-num" style={{ fontWeight: 400 }}>{fmtDate(p.paidAt)}</td>
                        <td>
                          <span className="pg-badge" style={{ background: ui.bg, color: ui.color }}>
                            {rowBusy ? <Loader2 size={11} className="animate-spin" /> : <span aria-hidden>●</span>} {ui.label}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`pg-clip${p.receiptCount === 0 ? ' none' : ''}`}
                            onClick={() => setReceiptsFor(p)}
                            aria-label={`${p.receiptCount} comprovantes. Abrir comprovantes`}
                          >
                            <Paperclip size={12} /> {p.receiptCount === 0 ? (canWrite ? 'Anexar' : 'Nenhum') : p.receiptCount}
                          </button>
                        </td>
                        <td>
                          <div className="pg-actions">
                            {canWrite && isPending && (
                              <button type="button" className="pg-iconbtn" title="Marcar como pago" aria-label="Marcar como pago" disabled={rowBusy} onClick={() => setPaying(p)}>
                                <CheckCircle2 size={16} color="#1E8449" />
                              </button>
                            )}
                            {canWrite && p.status !== PaymentStatus.Cancelled && (
                              <button type="button" className="pg-iconbtn" title="Editar" aria-label="Editar pagamento" disabled={rowBusy} onClick={() => { setEditing(p); setFormOpen(true); }}>
                                <Pencil size={15} />
                              </button>
                            )}
                            {canWrite && isPending && (
                              <button type="button" className="pg-iconbtn" title="Cancelar pagamento" aria-label="Cancelar pagamento" disabled={rowBusy} onClick={() => setCancelling(p)}>
                                <Ban size={15} />
                              </button>
                            )}
                            {canDelete && (
                              <button type="button" className="pg-iconbtn" title="Excluir" aria-label="Excluir pagamento" disabled={rowBusy} onClick={() => setDeleting(p)}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pg-pager">
              <span aria-live="polite">
                {data?.totalCount} {data?.totalCount === 1 ? 'pagamento' : 'pagamentos'} · página {filters.page} de {totalPages}
                {list.isFetching && ' · atualizando…'}
              </span>
              <span style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="pg-btn sm" disabled={!data?.hasPreviousPage} onClick={() => patch({ page: filters.page - 1 }, true)}>
                  <ChevronLeft size={13} /> Anterior
                </button>
                <button type="button" className="pg-btn sm" disabled={!data?.hasNextPage} onClick={() => patch({ page: filters.page + 1 }, true)}>
                  Próxima <ChevronRight size={13} />
                </button>
              </span>
            </div>
          </>
        )}
      </div>

      <PaymentFormModal
        open={formOpen}
        workId={workId}
        contractAmount={contractAmount}
        editing={editing}
        onClose={() => setFormOpen(false)}
      />
      <InstallmentsModal
        open={installmentsOpen}
        workId={workId}
        defaultTotal={summary.data?.remainingToSchedule ?? 0}
        onClose={() => setInstallmentsOpen(false)}
      />
      <MarkPaidModal
        payment={paying}
        busy={markPaid.isPending}
        onClose={() => setPaying(null)}
        onConfirm={(input) => paying && markPaid.mutate({ id: paying.id, ...input })}
      />
      <ReceiptsDialog
        adapter={adapter}
        target={receiptsFor && {
          id: receiptsFor.id,
          files: receiptsFor.receipts,
          subtitle: `${receiptsFor.description || PAYMENT_TYPE_LABEL[receiptsFor.type]} · ${brl(receiptsFor.amount)} · vence ${fmtDate(receiptsFor.dueDate)}`,
        }}
        canWrite={canWrite}
        canDelete={canDelete}
        onClose={() => setReceiptsFor(null)}
      />
      <LdConfirmDialog
        open={!!cancelling}
        title="Cancelar pagamento?"
        description="O pagamento deixa de contar no valor agendado. Esta ação não pode ser desfeita."
        confirmLabel="Cancelar pagamento"
        cancelLabel="Voltar"
        loading={cancelPay.isPending}
        onCancel={() => setCancelling(null)}
        onConfirm={() => cancelling && cancelPay.mutate({ id: cancelling.id })}
      />
      <LdConfirmDialog
        open={!!deleting}
        title="Excluir pagamento?"
        description={deleting ? `“${deleting.description || PAYMENT_TYPE_LABEL[deleting.type]}” (${brl(deleting.amount)}) e seus comprovantes serão removidos.` : undefined}
        loading={removePay.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removePay.mutate({ id: deleting.id })}
      />
    </div>
  );
}
