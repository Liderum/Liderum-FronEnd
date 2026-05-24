import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface LdSelectOption {
  value: string;
  label: string;
}

interface LdSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LdSelectOption[];
  placeholder?: string;
  size?: 'default' | 'sm';
  style?: React.CSSProperties;
  className?: string;
}

const CSS = `
.lds-wrap{position:relative;display:inline-block;}
.lds-wrap.full{width:100%;}

.lds-trigger{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  width:100%;box-sizing:border-box;cursor:pointer;
  font-family:'DM Sans',sans-serif;
  background:#fff;
  border:1px solid rgba(26,24,20,0.15);
  border-radius:8px;
  padding:9px 12px;
  font-size:13px;
  color:var(--ink,#1A1814);
  transition:border-color 0.15s,box-shadow 0.15s;
  user-select:none;
  outline:none;
}
.lds-trigger:hover{border-color:rgba(26,24,20,0.28);}
.lds-trigger.open,.lds-trigger:focus{
  border-color:rgba(184,146,42,0.55);
  box-shadow:0 0 0 3px rgba(184,146,42,0.10);
}
.lds-trigger.sm{padding:6px 10px;font-size:12px;border-radius:7px;border:1px solid rgba(26,24,20,0.12);}
.lds-trigger-placeholder{color:var(--ink3,#7A7670);}
.lds-chevron{flex-shrink:0;color:#B8922A;transition:transform 0.2s;}
.lds-chevron.open{transform:rotate(180deg);}

.lds-dropdown{
  position:absolute;top:calc(100% + 5px);left:0;right:0;z-index:9999;
  background:#fff;
  border:1px solid rgba(26,24,20,0.12);
  border-radius:10px;
  box-shadow:0 8px 32px rgba(26,24,20,0.14);
  overflow:hidden;
  animation:ldsFadeIn 0.14s ease;
}
@keyframes ldsFadeIn{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}

.lds-list{max-height:220px;overflow-y:auto;padding:4px;}
.lds-list::-webkit-scrollbar{width:4px;}
.lds-list::-webkit-scrollbar-track{background:transparent;}
.lds-list::-webkit-scrollbar-thumb{background:rgba(184,146,42,0.3);border-radius:4px;}

.lds-option{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  padding:8px 12px;border-radius:7px;
  font-family:'DM Sans',sans-serif;font-size:13px;
  color:var(--ink,#1A1814);cursor:pointer;
  transition:background 0.12s;
}
.lds-option:hover{background:var(--cream,#F7F4EF);}
.lds-option.selected{
  background:rgba(184,146,42,0.08);
  color:var(--gold,#B8922A);
  font-weight:500;
}
.lds-option.sm{font-size:12px;padding:6px 10px;}
`;

let cssInjected = false;

export function LdSelect({
  value,
  onChange,
  options,
  placeholder = '— Selecionar —',
  size = 'default',
  style,
  className = '',
}: LdSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  if (!cssInjected) {
    const tag = document.createElement('style');
    tag.textContent = CSS;
    document.head.appendChild(tag);
    cssInjected = true;
  }

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const isSm = size === 'sm';

  return (
    <div
      ref={wrapRef}
      className={`lds-wrap full ${className}`}
      style={style}
    >
      <button
        type="button"
        className={`lds-trigger${open ? ' open' : ''}${isSm ? ' sm' : ''}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); }
        }}
      >
        <span className={selected ? '' : 'lds-trigger-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={isSm ? 13 : 14} className={`lds-chevron${open ? ' open' : ''}`} />
      </button>

      {open && (
        <div className="lds-dropdown">
          <div className="lds-list" role="listbox">
            {placeholder && (
              <div
                className={`lds-option${isSm ? ' sm' : ''}${value === '' ? ' selected' : ''}`}
                role="option"
                aria-selected={value === ''}
                onClick={() => { onChange(''); setOpen(false); }}
              >
                <span style={{ color: 'var(--ink3,#7A7670)', fontStyle: 'italic' }}>{placeholder}</span>
                {value === '' && <Check size={12} />}
              </div>
            )}
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`lds-option${isSm ? ' sm' : ''}${value === opt.value ? ' selected' : ''}`}
                role="option"
                aria-selected={value === opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check size={12} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
