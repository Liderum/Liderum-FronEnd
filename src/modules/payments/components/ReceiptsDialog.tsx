import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Camera, Download, Eye, FileText, Image as ImageIcon, Loader2, RotateCw, Trash2, UploadCloud, X, AlertTriangle,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { LdConfirmDialog } from '@/components/LdConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import type { FilesAdapter } from '../receiptAdapters';
import type { PaymentReceipt } from '@/modules/shared/types/payments';
import { ACCEPT_ATTR, fmtBytes, fmtDate, isImage, isPdf, uuid, validateReceiptFile } from '../paymentUtils';

interface UploadItem {
  id: string;
  file: File;
  key: string; // Idempotency-Key: gerada por arquivo e reaproveitada no retry
  status: 'uploading' | 'error';
  progress: number;
  error?: string;
}

export interface FilesTarget {
  id: string;
  subtitle: string;
  files: PaymentReceipt[];
}

interface Props {
  adapter: FilesAdapter;
  target: FilesTarget | null;
  canWrite: boolean;
  canDelete: boolean;
  onClose: () => void;
}

export function ReceiptsDialog({ adapter, target, canWrite, canDelete, onClose }: Props) {
  const open = !!target;
  const paymentId = target?.id ?? '';
  const qc = useQueryClient();
  const { toast } = useToast();

  const detail = useQuery({
    queryKey: adapter.filesKey(paymentId),
    queryFn: () => adapter.fetchFiles(paymentId),
    enabled: open,
    placeholderData: target?.files,
  });
  const receipts = detail.data ?? target?.files ?? [];

  const [items, setItems] = useState<UploadItem[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<PaymentReceipt | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ receipt: PaymentReceipt; url: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);

  // Fechou o diálogo / trocou de pagamento: cancela envios e limpa estado local.
  useEffect(() => {
    if (open) return;
    controllers.current.forEach((c) => c.abort());
    controllers.current.clear();
    setItems([]);
    setPreview((p) => { if (p) URL.revokeObjectURL(p.url); return null; });
  }, [open]);
  useEffect(() => () => { controllers.current.forEach((c) => c.abort()); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  const uploading = items.some((i) => i.status === 'uploading');
  const [confirmClose, setConfirmClose] = useState(false);
  // Fechar com envio em andamento cancelaria os uploads: pede confirmação.
  const requestClose = () => { if (uploading) setConfirmClose(true); else onClose(); };

  const refreshAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: adapter.filesKey(paymentId) });
    qc.invalidateQueries({ queryKey: adapter.listsKey });
  }, [qc, adapter, paymentId]);

  const patchItem = (id: string, patch: Partial<UploadItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const runUpload = useCallback(async (item: UploadItem) => {
    const ctrl = new AbortController();
    controllers.current.set(item.id, ctrl);
    patchItem(item.id, { status: 'uploading', progress: 0, error: undefined });
    try {
      await adapter.upload(paymentId, item.file, {
        idempotencyKey: item.key,
        signal: ctrl.signal,
        onProgress: (p) => patchItem(item.id, { progress: p }),
      });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      refreshAll();
    } catch (e) {
      const err = e as { canceled?: boolean; message: string };
      if (err.canceled) setItems((prev) => prev.filter((i) => i.id !== item.id));
      else patchItem(item.id, { status: 'error', error: err.message });
    } finally {
      controllers.current.delete(item.id);
    }
  }, [adapter, paymentId, refreshAll]);

  function addFiles(list: FileList | File[]) {
    if (!canWrite) return;
    const rejected: string[] = [];
    Array.from(list).forEach((file) => {
      const problem = validateReceiptFile(file);
      if (problem) { rejected.push(`${file.name}: ${problem}`); return; }
      const item: UploadItem = { id: uuid(), file, key: uuid(), status: 'uploading', progress: 0 };
      setItems((prev) => [...prev, item]);
      void runUpload(item);
    });
    if (rejected.length) toast({ title: 'Arquivo não aceito', description: rejected.join('\n'), variant: 'destructive' });
  }

  const cancelItem = (item: UploadItem) => {
    if (item.status === 'uploading') controllers.current.get(item.id)?.abort();
    else setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const removeReceipt = useMutation({
    mutationFn: (r: PaymentReceipt) => adapter.remove(paymentId, r.id),
    onMutate: async (r) => {
      await qc.cancelQueries({ queryKey: adapter.filesKey(paymentId) });
      const prevFiles = qc.getQueryData<PaymentReceipt[]>(adapter.filesKey(paymentId));
      qc.setQueryData<PaymentReceipt[]>(adapter.filesKey(paymentId), (d) => d?.filter((x) => x.id !== r.id));
      adapter.adjustListCount?.(qc, paymentId, -1);
      setToDelete(null);
      return { prevFiles };
    },
    onError: (err, _r, ctx) => {
      if (ctx?.prevFiles) qc.setQueryData(adapter.filesKey(paymentId), ctx.prevFiles);
      adapter.adjustListCount?.(qc, paymentId, 1);
      toast({ title: 'Não foi possível remover', description: err.message, variant: 'destructive' });
    },
    onSuccess: () => toast({ title: 'Comprovante removido' }),
    onSettled: refreshAll,
  });

  async function download(r: PaymentReceipt) {
    setBusyId(r.id);
    try {
      const blob = await adapter.download(paymentId, r.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = r.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      toast({ title: 'Falha no download', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  }

  async function openPreview(r: PaymentReceipt) {
    if (!isImage(r.contentType) && !isPdf(r.contentType)) { void download(r); return; }
    setPreviewLoading(r.id);
    try {
      const blob = await adapter.download(paymentId, r.id);
      const typed = blob.type ? blob : new Blob([blob], { type: r.contentType });
      setPreview({ receipt: r, url: URL.createObjectURL(typed) });
    } catch (e) {
      toast({ title: 'Falha ao abrir', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setPreviewLoading(null);
    }
  }

  
  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) requestClose(); }}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => { if (uploading || preview) e.preventDefault(); }}
          style={{ maxWidth: preview ? 900 : 560, maxHeight: '92vh', overflowY: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
          {preview ? (
            <>
              <div className="pg-preview-bar" style={{ color: 'var(--ink)', paddingTop: 0 }}>
                <button type="button" className="pg-btn sm" onClick={() => setPreview(null)}><ArrowLeft size={13} /> Voltar</button>
                <DialogTitle style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {preview.receipt.fileName}
                </DialogTitle>
                <button type="button" className="pg-btn sm" onClick={() => download(preview.receipt)}><Download size={13} /> Baixar</button>
              </div>
              <DialogDescription className="sr-only">Visualização do comprovante</DialogDescription>
              <div className="pg-preview-body" style={{ height: '70vh', background: '#F7F4EF' }}>
                {isPdf(preview.receipt.contentType)
                  ? <iframe src={preview.url} title={preview.receipt.fileName} />
                  : <img src={preview.url} alt={`Comprovante ${preview.receipt.fileName}`} />}
              </div>
            </>
          ) : (
            <>
              <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700 }}>Comprovantes</DialogTitle>
              <DialogDescription style={{ fontSize: 12, marginTop: -6 }}>{target?.subtitle}</DialogDescription>

              {canWrite && (
                <>
                  <div
                    className={`pg-drop${over ? ' over' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label="Adicionar comprovante: arraste arquivos ou pressione Enter para escolher"
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
                    onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                    onDragLeave={() => setOver(false)}
                    onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
                  >
                    <UploadCloud size={26} color="#B8922A" />
                    <strong>Arraste o comprovante ou clique para escolher</strong>
                    <span>PDF, JPG, PNG, WEBP ou HEIC · até 10 MB</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="button" className="pg-btn sm" onClick={() => camRef.current?.click()}><Camera size={13} /> Tirar foto</button>
                    <button type="button" className="pg-btn sm" onClick={() => fileRef.current?.click()}><FileText size={13} /> Escolher arquivo</button>
                  </div>
                  <input ref={fileRef} type="file" hidden multiple accept={ACCEPT_ATTR}
                    onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
                  <input ref={camRef} type="file" hidden accept="image/*" capture="environment"
                    onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
                </>
              )}

              <div className="pg-rows" aria-live="polite">
                {items.map((it) => (
                  <div className="pg-row" key={it.id}>
                    {it.status === 'error' ? <AlertTriangle size={18} color="#C0392B" /> : <Loader2 size={18} className="animate-spin" color="#B8922A" />}
                    <div className="pg-row-info">
                      <div className="pg-row-name">{it.file.name}</div>
                      {it.status === 'uploading' ? (
                        <div className="pg-prog" role="progressbar" aria-valuenow={it.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Enviando ${it.file.name}`}>
                          <i style={{ width: `${it.progress}%` }} />
                        </div>
                      ) : (
                        <div className="pg-err" role="alert">{it.error}</div>
                      )}
                    </div>
                    {it.status === 'error' && (
                      <button type="button" className="pg-iconbtn" aria-label="Tentar novamente" title="Tentar novamente" onClick={() => void runUpload(it)}>
                        <RotateCw size={15} />
                      </button>
                    )}
                    <button type="button" className="pg-iconbtn" aria-label={it.status === 'uploading' ? 'Cancelar envio' : 'Descartar'} title={it.status === 'uploading' ? 'Cancelar envio' : 'Descartar'} onClick={() => cancelItem(it)}>
                      <X size={15} />
                    </button>
                  </div>
                ))}

                {detail.isError && !receipts.length && (
                  <div className="pg-alert err" role="alert">
                    <span>Não foi possível carregar os comprovantes.</span>
                    <button type="button" onClick={() => detail.refetch()}>Tentar novamente</button>
                  </div>
                )}

                {receipts.map((r) => (
                  <div className="pg-row" key={r.id}>
                    {isImage(r.contentType) ? <ImageIcon size={18} color="#7A7670" /> : <FileText size={18} color="#7A7670" />}
                    <div className="pg-row-info">
                      <div className="pg-row-name" title={r.fileName}>{r.fileName}</div>
                      <div className="pg-sub">{fmtBytes(r.sizeBytes)}{r.uploadedAt ? ` · ${fmtDate(r.uploadedAt)}` : ''}</div>
                    </div>
                    <button type="button" className="pg-iconbtn" aria-label={`Visualizar ${r.fileName}`} title="Visualizar" disabled={previewLoading === r.id} onClick={() => openPreview(r)}>
                      {previewLoading === r.id ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                    </button>
                    <button type="button" className="pg-iconbtn" aria-label={`Baixar ${r.fileName}`} title="Baixar" disabled={busyId === r.id} onClick={() => download(r)}>
                      {busyId === r.id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                    </button>
                    {canDelete && (
                      <button type="button" className="pg-iconbtn" aria-label={`Remover ${r.fileName}`} title="Remover" disabled={removeReceipt.isPending} onClick={() => setToDelete(r)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}

                {!receipts.length && !items.length && !detail.isError && (
                  <div className="pg-sub" style={{ textAlign: 'center', padding: '14px 0' }}>
                    {detail.isFetching ? 'Carregando…' : 'Nenhum comprovante anexado.'}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <LdConfirmDialog
        open={confirmClose}
        title="Cancelar envios em andamento?"
        description="Fechar agora interrompe os arquivos que ainda estão sendo enviados."
        confirmLabel="Fechar e cancelar"
        cancelLabel="Continuar enviando"
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => { setConfirmClose(false); onClose(); }}
      />
      <LdConfirmDialog
        open={!!toDelete}
        title="Remover comprovante?"
        description={toDelete ? `“${toDelete.fileName}” será removido deste pagamento.` : undefined}
        confirmLabel="Remover"
        loading={removeReceipt.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && removeReceipt.mutate(toDelete)}
      />
    </>
  );
}
