import { useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, FileText, Loader2, RotateCw, Trash2, UploadCloud } from 'lucide-react';
import { ACCEPT_ATTR, fmtBytes } from '@/modules/payments/paymentUtils';

export interface PendingFile {
  id: string;
  file: File;
  key: string; // Idempotency-Key: reaproveitada no retry
  preview?: string; // object URL (somente imagens que o browser renderiza)
  status: 'queued' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

const STATUS_LABEL: Record<PendingFile['status'], string> = {
  queued: 'Aguardando',
  uploading: 'Enviando',
  done: 'Enviado',
  error: 'Falhou',
};

interface Props {
  files: PendingFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  /** Esconde a área de seleção (ex.: depois que o registro foi salvo). */
  hideDropzone?: boolean;
  disabled?: boolean;
}

/** Seleção de comprovantes antes de salvar: arrastar e soltar, arquivo/câmera, miniatura e status por arquivo. */
export function PendingFilesField({ files, onAdd, onRemove, onRetry, hideDropzone, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const pick = (list: FileList | null) => {
    if (list && list.length) onAdd(Array.from(list));
  };

  return (
    <div>
      {!hideDropzone && (
        <>
          <div
            className={`pg-drop${over ? ' over' : ''}`}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-label="Adicionar comprovantes: arraste arquivos ou pressione Enter para escolher"
            onClick={() => !disabled && fileRef.current?.click()}
            onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fileRef.current?.click(); } }}
            onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled) pick(e.dataTransfer.files); }}
            style={{ padding: '16px 12px' }}
          >
            <UploadCloud size={22} color="#B8922A" />
            <strong>Arraste os comprovantes ou clique para escolher</strong>
            <span>PDF, JPG, PNG, WEBP ou HEIC · até 10 MB cada</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="pg-btn sm" disabled={disabled} onClick={() => camRef.current?.click()}><Camera size={13} /> Tirar foto</button>
            <button type="button" className="pg-btn sm" disabled={disabled} onClick={() => fileRef.current?.click()}><FileText size={13} /> Escolher arquivos</button>
          </div>
          <input ref={fileRef} type="file" hidden multiple accept={ACCEPT_ATTR}
            onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
          <input ref={camRef} type="file" hidden accept="image/*" capture="environment"
            onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
        </>
      )}

      {files.length > 0 && (
        <div className="pg-rows" aria-live="polite">
          {files.map((f) => (
            <div className="pg-row" key={f.id}>
              {f.preview ? (
                <img src={f.preview} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <FileText size={22} color="#7A7670" style={{ flexShrink: 0 }} />
              )}
              <div className="pg-row-info">
                <div className="pg-row-name" title={f.file.name}>{f.file.name}</div>
                <div className="pg-sub">
                  {fmtBytes(f.file.size)} · {STATUS_LABEL[f.status]}{f.status === 'uploading' ? ` ${f.progress}%` : ''}
                </div>
                {f.status === 'uploading' && (
                  <div className="pg-prog" role="progressbar" aria-valuenow={f.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Enviando ${f.file.name}`}>
                    <i style={{ width: `${f.progress}%` }} />
                  </div>
                )}
                {f.status === 'error' && <div className="pg-err" role="alert">{f.error}</div>}
              </div>
              {f.status === 'uploading' && <Loader2 size={16} className="animate-spin" color="#B8922A" />}
              {f.status === 'done' && <CheckCircle2 size={16} color="#1E8449" aria-label="Enviado" />}
              {f.status === 'error' && <AlertTriangle size={16} color="#C0392B" aria-hidden />}
              {f.status === 'error' && onRetry && (
                <button type="button" className="pg-iconbtn" aria-label={`Tentar de novo ${f.file.name}`} title="Tentar de novo" disabled={disabled} onClick={() => onRetry(f.id)}>
                  <RotateCw size={15} />
                </button>
              )}
              {f.status !== 'uploading' && f.status !== 'done' && (
                <button type="button" className="pg-iconbtn" aria-label={`Remover ${f.file.name}`} title="Remover" disabled={disabled} onClick={() => onRemove(f.id)}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
