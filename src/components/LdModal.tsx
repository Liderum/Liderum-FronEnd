import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';

// Modal de formulário no padrão Liderum (mesmo visual do DailyLog). Usa overlay próprio
// em vez do Dialog do Radix porque o calendário do LdDateInput renderiza em portal no body.
const CSS = `
.ldm-overlay{position:fixed;inset:0;background:rgba(26,24,20,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px;backdrop-filter:blur(3px);}
.ldm-card{background:var(--card-bg,#fff);border-radius:16px;width:100%;padding:28px;box-shadow:0 24px 64px rgba(0,0,0,0.22);max-height:93vh;overflow-y:auto;font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);}
.ldm-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:4px;color:var(--ink,#1A1814);}
.ldm-sub{font-size:12px;color:var(--ink3,#7A7670);margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.ldm-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--ink3,#7A7670);margin-bottom:6px;display:block;}
.ldm-field{margin-bottom:14px;}
.ldm-input,.ldm-textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;box-sizing:border-box;background:var(--card-bg,#fff);color:var(--ink,#1A1814);transition:border-color 0.15s;}
.ldm-textarea{min-height:64px;resize:vertical;}
.ldm-input:focus,.ldm-textarea:focus{outline:none;border-color:rgba(184,146,42,0.5);}
.ldm-input.invalid,.ldm-textarea.invalid{border-color:rgba(192,57,43,0.6);}
.ldm-input:disabled{opacity:0.6;cursor:not-allowed;}
.ldm-error{font-size:11px;color:#C0392B;margin-top:4px;}
.ldm-hint{font-size:11px;color:var(--ink3,#7A7670);margin-top:4px;}
.ldm-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:520px){.ldm-grid{grid-template-columns:1fr;}}
.ldm-currency{position:relative;}
.ldm-currency span{position:absolute;left:12px;top:10px;font-size:13px;font-weight:500;color:var(--ink3,#7A7670);pointer-events:none;}
.ldm-currency .ldm-input{padding-left:36px;}
.ldm-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:6px;}
.ldm-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:1px solid rgba(26,24,20,0.12);background:var(--card-bg,#fff);color:var(--ink,#1A1814);transition:all 0.18s;white-space:nowrap;}
.ldm-btn:hover:not(:disabled){background:var(--cream,#F7F4EF);}
.ldm-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ldm-btn.primary{background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));color:#fff;border:none;box-shadow:0 2px 10px rgba(184,146,42,0.25);}
.ldm-btn.primary:hover:not(:disabled){background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
.ldm-btn.danger{background:#FDEDEC;color:#C0392B;border-color:rgba(192,57,43,0.2);}
.ldm-btn.danger:hover:not(:disabled){background:#f8d5d0;}
.ldm-btn.outline-gold{border-color:rgba(184,146,42,0.4);color:var(--gold,#B8922A);background:rgba(184,146,42,0.04);}
.ldm-btn.outline-gold:hover:not(:disabled){background:rgba(184,146,42,0.1);}
.ldm-btn.sm{padding:6px 12px;font-size:11.5px;}
`;

interface LdModalProps {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  busy?: boolean;
  maxWidth?: number;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  cancelLabel?: string;
  /** Não fecha por clique fora nem ESC; só por Cancelar/Salvar. */
  lockOutside?: boolean;
  /** Com alterações não salvas, Cancelar pede confirmação. */
  dirty?: boolean;
}

export function LdModal({
  open,
  title,
  subtitle,
  onClose,
  busy = false,
  maxWidth = 520,
  children,
  confirmLabel,
  onConfirm,
  confirmDisabled = false,
  cancelLabel = 'Cancelar',
  lockOutside = false,
  dirty = false,
}: LdModalProps) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  useEffect(() => { if (!open) setConfirmDiscard(false); }, [open]);
  const requestClose = () => {
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy && !lockOutside) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onClose, lockOutside]);

  return (
    <>
    <AnimatePresence>
      {open && (
        <>
          <style>{CSS}</style>
          <motion.div
            className="ldm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!busy && !lockOutside) onClose(); }}
          >
            <motion.div
              className="ldm-card"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              style={{ maxWidth }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ldm-title">{title}</div>
              {subtitle && <div className="ldm-sub">{subtitle}</div>}
              {children}
              {confirmDiscard ? (
                <div className="ldm-actions" role="alertdialog" aria-label="Descartar alterações?" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="ldm-hint" style={{ marginTop: 0, marginRight: 'auto' }}>Há alterações não salvas. Descartar?</span>
                  <button type="button" className="ldm-btn" onClick={() => setConfirmDiscard(false)}>Continuar editando</button>
                  <button type="button" className="ldm-btn danger" onClick={() => { setConfirmDiscard(false); onClose(); }}>Descartar</button>
                </div>
              ) : (
              <div className="ldm-actions">
                <button type="button" className="ldm-btn" onClick={lockOutside ? requestClose : onClose} disabled={busy}>
                  <X size={14} /> {cancelLabel}
                </button>
                <button type="button" className="ldm-btn primary" onClick={onConfirm} disabled={busy || confirmDisabled}>
                  {busy && <Loader2 size={13} className="animate-spin" />}
                  {confirmLabel}
                </button>
              </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
