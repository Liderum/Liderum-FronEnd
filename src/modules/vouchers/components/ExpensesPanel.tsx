import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Loader2, Paperclip, Pencil, Plus, RefreshCw,
  Receipt, Search, Trash2, X,
} from 'lucide-react';
import { LdSelect } from '@/components/LdSelect';
import { LdDateInput } from '@/components/LdDateInput';
import { LdConfirmDialog } from '@/components/LdConfirmDialog';
import { usePermission } from '@/hooks/usePermission';
import { useToast } from '@/hooks/use-toast';
import { IncidentsService } from '@/services/works/incidentsService';
import { WorkVouchersService } from '@/services/works/workVouchersService';
import {
  VOUCHER_CATEGORY_LABEL, type VoucherPage, type VoucherSort, type WorkVoucher,
} from '@/modules/shared/types/vouchers';
import { brl, fmtDate } from '@/modules/payments/paymentUtils';
import { vk, vouchersAdapter } from '@/modules/payments/receiptAdapters';
import { ReceiptsDialog } from '@/modules/payments/components/ReceiptsDialog';
import { FilterBar, FilterField } from '@/modules/payments/components/FilterBar';
import { VoucherFormModal } from './VoucherFormModal';

const PAGE_SIZE = 25;

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Todas as categorias' },
  ...Object.entries(VOUCHER_CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
];
const FILE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'with', label: 'Com arquivo' },
  { value: 'without', label: 'Sem arquivo' },
];

export function ExpensesPanel() {
  const { id: workId = '' } = useParams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const canWrite = usePermission('workvouchers.write');
  const canDelete = usePermission('workvouchers.delete');
  const [sp, setSp] = useSearchParams();

  const get = (k: string, d = '') => sp.get(k) ?? d;
  const f = {
    category: get('category', 'all'),
    from: get('from'),
    to: get('to'),
    file: get('file', 'all'),
    incident: get('incident', 'all'),
    q: get('q'),
    sort: get('sort', '-occurredOn') as VoucherSort,
    page: Math.max(1, Number(get('page', '1')) || 1),
  };
  const patch = (changes: Record<string, string | number | undefined>, keepPage = false) =>
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([k, v]) => {
        if (v === undefined || v === '' || v === 'all' || (k === 'page' && v === 1) || (k === 'sort' && v === '-occurredOn')) next.delete(k);
        else next.set(k, String(v));
      });
      if (!keepPage && !('page' in changes)) next.delete('page');
      return next;
    }, { replace: true });
  const filterKeys = ['category', 'from', 'to', 'file', 'incident', 'q'];
  const active = filterKeys.some((k) => sp.has(k));
  const clear = () => setSp((prev) => {
    const next = new URLSearchParams();
    next.set('mode', prev.get('mode') ?? 'expenses');
    return next;
  }, { replace: true });

  const [searchText, setSearchText] = useState(f.q);
  useEffect(() => setSearchText(f.q), [f.q]);
  useEffect(() => {
    if (searchText === f.q) return;
    const t = setTimeout(() => patch({ q: searchText.trim() }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const apiFilters = useMemo(() => ({
    category: f.category === 'all' ? undefined : Number(f.category),
    from: f.from || undefined,
    to: f.to || undefined,
    search: f.q || undefined,
    incidentId: f.incident === 'all' ? undefined : f.incident,
    hasFile: f.file === 'with' ? true : f.file === 'without' ? false : undefined,
    page: f.page,
    pageSize: PAGE_SIZE,
    sort: f.sort,
  }), [f.category, f.from, f.to, f.q, f.incident, f.file, f.page, f.sort]);
  const range = useMemo(() => ({ from: f.from || undefined, to: f.to || undefined }), [f.from, f.to]);

  const summary = useQuery({
    queryKey: vk.summary(workId, range),
    queryFn: () => WorkVouchersService.summary(workId, range),
    enabled: !!workId,
  });
  const list = useQuery({
    queryKey: vk.list(workId, apiFilters),
    queryFn: ({ signal }) => WorkVouchersService.list(workId, apiFilters, signal),
    enabled: !!workId,
    placeholderData: keepPreviousData,
  });
  const incidents = useQuery({
    queryKey: ['work-incident-options', workId],
    queryFn: () => IncidentsService.list(workId),
    enabled: !!workId,
    staleTime: 60_000,
  });
  const incidentOptions = [
    { value: 'all', label: 'Todos os incidentes' },
    ...(incidents.data ?? []).map((i) => ({ value: i.id, label: i.title })),
  ];

  const adapter = useMemo(() => vouchersAdapter(workId), [workId]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkVoucher | null>(null);
  const [deleting, setDeleting] = useState<WorkVoucher | null>(null);
  const [filesFor, setFilesFor] = useState<WorkVoucher | null>(null);
  const presetIncident = sp.get('incident') ?? undefined;

  // Atalho vindo do incidente: ?new=1&incident=ID abre o formulário já preenchido.
  useEffect(() => {
    if (sp.get('new') === '1' && canWrite) {
      setEditing(null);
      setFormOpen(true);
      setSp((prev) => { const n = new URLSearchParams(prev); n.delete('new'); return n; }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeVoucher = useMutation({
    mutationFn: ({ id }: { id: string }) => WorkVouchersService.remove(workId, id),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: vk.lists(workId) });
      const snapshot = qc.getQueriesData<VoucherPage>({ queryKey: vk.lists(workId) });
      qc.setQueriesData<VoucherPage>({ queryKey: vk.lists(workId) }, (l) =>
        l ? { ...l, items: l.items.filter((v) => v.id !== id), totalCount: Math.max(0, l.totalCount - 1) } : l);
      setDeleting(null);
      return { snapshot };
    },
    onError: (err, _v, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
      toast({ title: 'Não foi possível excluir', description: err.message, variant: 'destructive' });
    },
    onSuccess: () => toast({ title: 'Registro excluído' }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: vk.lists(workId) });
      qc.invalidateQueries({ queryKey: vk.summaries(workId) });
    },
  });

  const data = list.data;
  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / (data.pageSize || PAGE_SIZE))) : 1;
  const nothingAtAll = !active && !list.isLoading && !list.isError && (data?.totalCount ?? 0) === 0;

  const toggleSort = (field: 'occurredOn' | 'amount') =>
    patch({ sort: f.sort === field ? `-${field}` : f.sort === `-${field}` ? field : `-${field}` });
  const sortIcon = (field: 'occurredOn' | 'amount') =>
    f.sort === field ? <ArrowUp size={11} /> : f.sort === `-${field}` ? <ArrowDown size={11} /> : null;
  const ariaSort = (field: 'occurredOn' | 'amount') =>
    f.sort === field ? 'ascending' : f.sort === `-${field}` ? 'descending' : 'none';

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const s = summary.data;

  if (!workId) return null;

  return (
    <>
      {summary.isError ? (
        <div className="pg-alert err" role="alert">
          <AlertTriangle size={16} />
          <span>Não foi possível carregar o resumo de gastos.</span>
          <button type="button" onClick={() => summary.refetch()}><RefreshCw size={12} style={{ verticalAlign: -1 }} /> Tentar novamente</button>
        </div>
      ) : (
        <div className="pg-cards" aria-busy={summary.isLoading}>
          <div className="pg-card" style={{ background: 'linear-gradient(135deg,#1A1814,#2C2820)', color: '#fff', border: 'none' }}>
            <div className="pg-card-label" style={{ color: 'rgba(255,255,255,0.55)' }}>Total gasto</div>
            <div className="pg-card-val" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26 }}>{s ? brl(s.totalSpent) : '—'}</div>
            <div className="pg-card-sub" style={{ color: 'rgba(255,255,255,0.55)' }}>{s ? `${s.count} registro${s.count === 1 ? '' : 's'}` : ' '}</div>
          </div>
          {Object.entries(VOUCHER_CATEGORY_LABEL).map(([cat, label]) => {
            const row = s?.byCategory.find((c) => String(c.category) === cat);
            return (
              <div className="pg-card" key={cat}>
                <div className="pg-card-label">{label}</div>
                <div className="pg-card-val">{s ? brl(row?.total ?? 0) : '—'}</div>
                <div className="pg-card-sub">{s ? `${row?.count ?? 0} registro${row?.count === 1 ? '' : 's'}` : ' '}</div>
              </div>
            );
          })}
        </div>
      )}

      <FilterBar>
        <FilterField label="Buscar" htmlFor="vc-q">
          <div className="pg-search">
            <Search size={14} aria-hidden />
            <input id="vc-q" className="pg-input" placeholder="Descrição, fornecedor, nota ou arquivo"
              value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>
        </FilterField>
        <FilterField label="Categoria">
          <LdSelect className="full" value={f.category} onChange={(v) => patch({ category: v })} options={CATEGORY_OPTIONS} />
        </FilterField>
        <FilterField label="Incidente">
          <LdSelect className="full" searchable value={f.incident} onChange={(v) => patch({ incident: v })} options={incidentOptions} />
        </FilterField>
        <FilterField label="Comprovante">
          <LdSelect className="full" value={f.file} onChange={(v) => patch({ file: v })} options={FILE_OPTIONS} />
        </FilterField>
        <FilterField label="Data de">
          <LdDateInput
            value={f.from}
            onChange={(v) => patch(v && f.to && v > f.to ? { from: v, to: '' } : { from: v })}
            placeholder="dd/mm/aaaa"
            clearable
          />
        </FilterField>
        <FilterField label="Data até">
          <LdDateInput value={f.to} onChange={(v) => patch({ to: v })} min={f.from || undefined} placeholder="dd/mm/aaaa" clearable />
        </FilterField>
      </FilterBar>

      <div className="pg-toolbar">
        {active && <button type="button" className="pg-btn" onClick={clear}><X size={13} /> Limpar filtros</button>}
        {canWrite && (
          <div style={{ marginLeft: 'auto' }}>
            <button type="button" className="pg-btn primary" onClick={openNew}><Plus size={14} /> Nova compra ou serviço</button>
          </div>
        )}
      </div>

      <div className="pg-tablewrap" aria-busy={list.isFetching}>
        {list.isError && !data ? (
          <div className="pg-empty" role="alert">
            <AlertTriangle size={30} color="#C0392B" />
            <h3>Não foi possível carregar os registros</h3>
            <p style={{ fontSize: 12.5 }}>{(list.error as Error).message}</p>
            <button type="button" className="pg-btn" style={{ marginTop: 10 }} onClick={() => list.refetch()}><RefreshCw size={13} /> Tentar novamente</button>
          </div>
        ) : list.isLoading ? (
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }} aria-label="Carregando registros">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="pg-skel" style={{ height: 18 }} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="pg-empty">
            <Receipt size={32} color="#B8922A" />
            <h3>{nothingAtAll ? 'Nenhuma compra ou serviço registrado' : 'Nenhum registro encontrado'}</h3>
            <p style={{ fontSize: 12.5 }}>
              {nothingAtAll ? 'Guarde notas e recibos de materiais e serviços da obra.' : 'Ajuste ou limpe os filtros para ver outros registros.'}
            </p>
            {nothingAtAll && canWrite
              ? <button type="button" className="pg-btn primary" style={{ marginTop: 12 }} onClick={openNew}><Plus size={14} /> Registrar primeiro</button>
              : !nothingAtAll && <button type="button" className="pg-btn" style={{ marginTop: 12 }} onClick={clear}>Limpar filtros</button>}
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
                <caption className="sr-only">Compras e serviços da obra</caption>
                <thead>
                  <tr>
                    <th scope="col">Descrição</th>
                    <th scope="col">Categoria</th>
                    <th scope="col">Fornecedor</th>
                    <th scope="col" className="num" aria-sort={ariaSort('amount')}>
                      <button type="button" onClick={() => toggleSort('amount')}>Valor {sortIcon('amount')}</button>
                    </th>
                    <th scope="col" aria-sort={ariaSort('occurredOn')}>
                      <button type="button" onClick={() => toggleSort('occurredOn')}>Data {sortIcon('occurredOn')}</button>
                    </th>
                    <th scope="col">Incidente</th>
                    <th scope="col">Arquivos</th>
                    <th scope="col"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((v) => {
                    const busy = removeVoucher.isPending && removeVoucher.variables?.id === v.id;
                    return (
                      <tr key={v.id}>
                        <td>
                          <div className="pg-desc" title={v.description}>{v.description}</div>
                          {v.documentNumber && <div className="pg-sub">Nº {v.documentNumber}</div>}
                        </td>
                        <td><span className="pg-type">{VOUCHER_CATEGORY_LABEL[v.category] ?? '—'}</span></td>
                        <td>{v.supplierName || '—'}</td>
                        <td className="num pg-num">{brl(v.amount)}</td>
                        <td className="pg-num" style={{ fontWeight: 400 }}>{fmtDate(v.occurredOn)}</td>
                        <td><div className="pg-desc" style={{ maxWidth: 160, fontWeight: 400 }} title={v.incidentTitle}>{v.incidentTitle || '—'}</div></td>
                        <td>
                          <button type="button" className={`pg-clip${v.fileCount === 0 ? ' none' : ''}`} onClick={() => setFilesFor(v)}
                            aria-label={`${v.fileCount} arquivos. Abrir comprovantes`}>
                            <Paperclip size={12} /> {v.fileCount === 0 ? (canWrite ? 'Anexar' : 'Nenhum') : v.fileCount}
                          </button>
                        </td>
                        <td>
                          <div className="pg-actions">
                            {busy && <Loader2 size={15} className="animate-spin" style={{ margin: 8 }} />}
                            {canWrite && (
                              <button type="button" className="pg-iconbtn" title="Editar" aria-label="Editar registro" disabled={busy}
                                onClick={() => { setEditing(v); setFormOpen(true); }}><Pencil size={15} /></button>
                            )}
                            {canDelete && (
                              <button type="button" className="pg-iconbtn" title="Excluir" aria-label="Excluir registro" disabled={busy}
                                onClick={() => setDeleting(v)}><Trash2 size={15} /></button>
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
                {data?.totalCount} {data?.totalCount === 1 ? 'registro' : 'registros'} · página {f.page} de {totalPages}
                {list.isFetching && ' · atualizando…'}
              </span>
              <span style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="pg-btn sm" disabled={!data?.hasPreviousPage} onClick={() => patch({ page: f.page - 1 }, true)}><ChevronLeft size={13} /> Anterior</button>
                <button type="button" className="pg-btn sm" disabled={!data?.hasNextPage} onClick={() => patch({ page: f.page + 1 }, true)}>Próxima <ChevronRight size={13} /></button>
              </span>
            </div>
          </>
        )}
      </div>

      <VoucherFormModal
        open={formOpen}
        workId={workId}
        editing={editing}
        presetIncidentId={presetIncident && presetIncident !== 'all' ? presetIncident : undefined}
        onClose={() => setFormOpen(false)}
        onSaved={() => setFormOpen(false)}
      />
      <ReceiptsDialog
        adapter={adapter}
        target={filesFor && {
          id: filesFor.id,
          files: filesFor.files,
          subtitle: `${filesFor.description} · ${brl(filesFor.amount)} · ${fmtDate(filesFor.occurredOn)}`,
        }}
        canWrite={canWrite}
        canDelete={canDelete}
        onClose={() => setFilesFor(null)}
      />
      <LdConfirmDialog
        open={!!deleting}
        title="Excluir registro?"
        description={deleting ? `“${deleting.description}” (${brl(deleting.amount)}) e seus arquivos serão removidos.` : undefined}
        loading={removeVoucher.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeVoucher.mutate({ id: deleting.id })}
      />
    </>
  );
}
