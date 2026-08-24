/**
 * LdDateInput — Calendário customizado no padrão visual Liderum.
 * Props compatíveis com <input type="date">: value (YYYY-MM-DD) e onChange.
 *
 * Variantes:
 *   size="default"  → formulários (padding 9px, fonte 13px)
 *   size="sm"       → filtros em toolbar (padding 6px, fonte 12px)
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromYMD(s: string): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(s: string) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function buildCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: { date: Date; current: boolean }[] = [];

  for (let i = first - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), current: false });
  }
  return cells;
}

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
.ldd-wrap{display:inline-block;}
.ldd-wrap.full{width:100%;}

.ldd-trigger{
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
  user-select:none;outline:none;text-align:left;
}
.ldd-trigger:hover{border-color:rgba(26,24,20,0.28);}
.ldd-trigger.open,.ldd-trigger:focus{
  border-color:rgba(184,146,42,0.55);
  box-shadow:0 0 0 3px rgba(184,146,42,0.10);
}
.ldd-trigger.sm{padding:6px 10px;font-size:12px;border-radius:7px;border:1px solid rgba(26,24,20,0.12);}
.ldd-placeholder{color:var(--ink3,#7A7670);}
.ldd-icon{flex-shrink:0;color:#B8922A;}

/* Popover — renderizado via portal no body, posição calculada via JS */
.ldd-pop{
  position:fixed;z-index:99999;
  background:#fff;
  border:1px solid rgba(26,24,20,0.12);
  border-radius:12px;
  box-shadow:0 12px 40px rgba(26,24,20,0.18);
  padding:16px;
  width:288px;
  animation:lddIn 0.14s ease;
}
@keyframes lddIn{from{opacity:0;transform:translateY(-5px);}to{opacity:1;transform:translateY(0);}}

/* Header do mês */
.ldd-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.ldd-nav-btn{
  width:28px;height:28px;border-radius:7px;border:1px solid rgba(26,24,20,0.10);
  background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:var(--ink3,#7A7670);transition:all 0.13s;
}
.ldd-nav-btn:hover{border-color:var(--gold,#B8922A);color:var(--gold,#B8922A);background:rgba(184,146,42,0.05);}
.ldd-month-label{
  font-family:'Cormorant Garamond',serif;
  font-size:15px;font-weight:700;color:var(--ink,#1A1814);
  cursor:pointer;padding:2px 8px;border-radius:5px;transition:background 0.12s;
}
.ldd-month-label:hover{background:rgba(184,146,42,0.07);}

/* Grid de dias */
.ldd-weekdays{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}
.ldd-wd{
  text-align:center;font-size:10px;font-weight:600;
  text-transform:uppercase;letter-spacing:0.5px;
  color:var(--ink3,#7A7670);padding:3px 0;
}
.ldd-days{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.ldd-day{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  font-family:'DM Sans',sans-serif;font-size:12.5px;
  border-radius:7px;cursor:pointer;
  color:var(--ink,#1A1814);
  transition:background 0.12s,color 0.12s;
  border:none;background:transparent;
  position:relative;
}
.ldd-day:hover:not(.selected):not(.other-month){background:var(--cream,#F7F4EF);}
.ldd-day.other-month{color:rgba(26,24,20,0.25);}
.ldd-day.today:not(.selected)::after{
  content:'';position:absolute;bottom:4px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:50%;background:var(--gold,#B8922A);
}
.ldd-day.selected{
  background:linear-gradient(135deg,var(--gold,#B8922A),var(--gold2,#D4A843));
  color:#fff;font-weight:600;
  box-shadow:0 2px 8px rgba(184,146,42,0.35);
}
.ldd-day.other-month:hover{background:rgba(26,24,20,0.04);}
.ldd-day.disabled{color:rgba(26,24,20,0.2);cursor:not-allowed;pointer-events:none;}

/* Ação rápida de hoje */
.ldd-footer{margin-top:10px;padding-top:10px;border-top:1px solid rgba(26,24,20,0.06);display:flex;justify-content:space-between;align-items:center;}
.ldd-today-btn{
  font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:500;
  color:var(--gold,#B8922A);background:none;border:none;cursor:pointer;padding:0;
}
.ldd-today-btn:hover{text-decoration:underline;}
.ldd-clear-btn{
  font-family:'DM Sans',sans-serif;font-size:11.5px;
  color:var(--ink3,#7A7670);background:none;border:none;cursor:pointer;padding:0;
}
.ldd-clear-btn:hover{color:var(--ink,#1A1814);}

/* Seletor de ano */
.ldd-year-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:8px;}
.ldd-year-btn{
  font-family:'DM Sans',sans-serif;font-size:12px;
  padding:6px 2px;border-radius:6px;border:none;background:transparent;
  cursor:pointer;color:var(--ink,#1A1814);text-align:center;transition:background 0.12s;
}
.ldd-year-btn:hover{background:var(--cream,#F7F4EF);}
.ldd-year-btn.selected{background:linear-gradient(135deg,var(--gold,#B8922A),var(--gold2,#D4A843));color:#fff;font-weight:600;}
`;

let cssInjected = false;
function injectCss() {
  if (cssInjected) return;
  const tag = document.createElement('style');
  tag.textContent = CSS;
  document.head.appendChild(tag);
  cssInjected = true;
}

/* ─── Componente ────────────────────────────────────────────────────────────── */
interface LdDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'default' | 'sm';
  style?: React.CSSProperties;
  className?: string;
  clearable?: boolean;
  /** Data mínima selecionável (YYYY-MM-DD, inclusive) */
  min?: string;
}

export function LdDateInput({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  size = 'default',
  style,
  className = '',
  clearable = true,
  min,
}: LdDateInputProps) {
  injectCss();

  const today = new Date();
  const todayStr = toYMD(today);

  const selected = fromYMD(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const [pickingYear, setPickingYear] = useState(false);
  const [popPos, setPopPos] = useState({ top: 0, left: 0, width: 288 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Calcula posição do popover baseado no trigger (suporta scroll + modal)
  function calcPos() {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const popH = 340; // altura estimada do calendário
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= popH
      ? rect.bottom + 6
      : rect.top - popH - 6;
    setPopPos({ top, left: rect.left, width: Math.max(rect.width, 288) });
  }

  // Fecha ao clicar fora (trigger + popover)
  useEffect(() => {
    function onOut(e: MouseEvent) {
      const target = e.target as Node;
      const inWrap = wrapRef.current?.contains(target);
      const inPop = popRef.current?.contains(target);
      if (!inWrap && !inPop) {
        setOpen(false);
        setPickingYear(false);
      }
    }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, []);

  // Recalcula posição ao abrir e ao rolar/redimensionar
  useLayoutEffect(() => {
    if (!open) return;
    calcPos();
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);
    return () => {
      window.removeEventListener('scroll', calcPos, true);
      window.removeEventListener('resize', calcPos);
    };
  }, [open]);

  // Sincroniza view com value externo
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]);

  function selectDay(date: Date) {
    if (min && toYMD(date) < min) return;
    onChange(toYMD(date));
    setOpen(false);
    setPickingYear(false);
  }

  function goToday() {
    if (min && todayStr < min) return;
    onChange(todayStr);
    setOpen(false);
    setPickingYear(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells = buildCalendarDays(viewYear, viewMonth);
  const isSm = size === 'sm';

  // Anos para o seletor: atual ± 10
  const yearRange = Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i);

  return (
    <div ref={wrapRef} className={`ldd-wrap full ${className}`} style={style}>
      <button
        type="button"
        className={`ldd-trigger${open ? ' open' : ''}${isSm ? ' sm' : ''}`}
        onClick={() => { setOpen(v => !v); setPickingYear(false); }}
      >
        <span className={value ? '' : 'ldd-placeholder'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarDays size={isSm ? 13 : 14} className="ldd-icon" />
      </button>

      {open && createPortal(
        <div
          ref={popRef}
          className="ldd-pop"
          style={{ top: popPos.top, left: popPos.left, minWidth: popPos.width }}
        >
          {pickingYear ? (
            <>
              <div className="ldd-nav">
                <button className="ldd-nav-btn" onClick={() => setPickingYear(false)}>
                  <ChevronLeft size={13} />
                </button>
                <span className="ldd-month-label">Selecionar ano</span>
                <div style={{ width: 28 }} />
              </div>
              <div className="ldd-year-grid">
                {yearRange.map(y => (
                  <button
                    key={y}
                    className={`ldd-year-btn${y === viewYear ? ' selected' : ''}`}
                    onClick={() => { setViewYear(y); setPickingYear(false); }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="ldd-nav">
                <button className="ldd-nav-btn" onClick={prevMonth}>
                  <ChevronLeft size={13} />
                </button>
                <span
                  className="ldd-month-label"
                  onClick={() => setPickingYear(true)}
                  title="Clique para escolher o ano"
                >
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button className="ldd-nav-btn" onClick={nextMonth}>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="ldd-weekdays">
                {WEEK.map(d => <div key={d} className="ldd-wd">{d}</div>)}
              </div>

              <div className="ldd-days">
                {cells.map((cell, i) => {
                  const cellStr = toYMD(cell.date);
                  const isSelected = cellStr === value;
                  const isToday = cellStr === todayStr;
                  const isDisabled = !!min && cellStr < min;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isDisabled}
                      className={[
                        'ldd-day',
                        !cell.current ? 'other-month' : '',
                        isSelected ? 'selected' : '',
                        isToday && !isSelected ? 'today' : '',
                        isDisabled ? 'disabled' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => selectDay(cell.date)}
                    >
                      {cell.date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="ldd-footer">
                <button className="ldd-today-btn" onClick={goToday}>Hoje</button>
                {clearable && value && (
                  <button className="ldd-clear-btn" onClick={() => { onChange(''); setOpen(false); }}>
                    Limpar
                  </button>
                )}
              </div>
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
