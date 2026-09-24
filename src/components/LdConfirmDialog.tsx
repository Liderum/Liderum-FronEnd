import { ReactNode } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

// Modal de confirmação no padrão Liderum — substitui window.confirm em ações destrutivas
const CSS = `
.ldc-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:1px solid rgba(26,24,20,0.12);background:var(--card-bg,#fff);color:var(--ink);transition:all 0.18s;white-space:nowrap;}
.ldc-btn:hover{background:var(--cream,#F7F4EF);}
.ldc-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ldc-btn.danger{background:#FDEDEC;color:#C0392B;border-color:rgba(192,57,43,0.2);}
.ldc-btn.danger:hover:not(:disabled){background:#f8d5d0;}
`;

interface LdConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LdConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: LdConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !loading) onCancel(); }}>
      <DialogContent style={{ maxWidth: 400 }}>
        <style>{CSS}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={18} color="#C0392B" />
          </div>
          <div>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription style={{ fontSize: 12, color: 'var(--ink3, #7A7670)', marginTop: 2 }}>
                {description}
              </DialogDescription>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="ldc-btn" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="ldc-btn danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
