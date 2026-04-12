import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, CloudSun, Users, Camera,
  AlertTriangle, Wrench, Plus, X, Upload, Filter,
} from 'lucide-react';
import { DailyLogService } from '@/services/works';
import { useAuth } from '@/contexts/AuthContext';
import type { DailyLogEntry } from '@/modules/shared/types';

const CSS = `
.dl{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.dl-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
.dl-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--ink,#1A1814);}
.dl-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:1px solid rgba(26,24,20,0.12);background:#fff;color:var(--ink);transition:all 0.18s;}
.dl-btn:hover{background:var(--cream);}
.dl-btn.primary{background:linear-gradient(135deg,var(--gold,#B8922A),var(--gold2,#D4A843));color:#fff;border:none;box-shadow:0 2px 10px rgba(184,146,42,0.25);}
.dl-btn.primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
.dl-filters{background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.08);padding:12px 16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
.dl-filter-input{padding:6px 10px;border-radius:6px;border:1px solid rgba(26,24,20,0.12);font-size:12px;font-family:'DM Sans',sans-serif;}
.dl-filter-chk{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--ink);cursor:pointer;}
.dl-timeline{position:relative;padding-left:24px;}
.dl-timeline::before{content:'';position:absolute;left:9px;top:0;bottom:0;width:2px;background:rgba(26,24,20,0.08);border-radius:2px;}
.dl-entry{position:relative;margin-bottom:24px;}
.dl-entry-dot{position:absolute;left:-19px;top:18px;width:10px;height:10px;border-radius:50%;background:var(--gold,#B8922A);border:2px solid #fff;box-shadow:0 0 0 2px rgba(184,146,42,0.2);}
.dl-entry-card{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));box-shadow:0 2px 10px rgba(26,24,20,0.04);overflow:hidden;transition:all 0.18s;}
.dl-entry-card:hover{box-shadow:0 6px 24px rgba(26,24,20,0.08);}
.dl-entry-header{padding:16px 22px;border-bottom:1px solid rgba(26,24,20,0.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;}
.dl-entry-date{font-family:var(--font-numeric);font-size:16px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.dl-entry-meta{display:flex;gap:14px;flex-wrap:wrap;}
.dl-entry-meta-item{display:flex;align-items:center;gap:4px;font-size:11.5px;color:var(--ink3,#7A7670);}
.dl-entry-body{padding:18px 22px;display:flex;flex-direction:column;gap:14px;}
.dl-entry-desc{font-size:13px;color:var(--ink,#1A1814);line-height:1.65;}
.dl-entry-section{display:flex;gap:10px;padding:12px 14px;border-radius:9px;}
.dl-entry-section-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dl-entry-section-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:3px;}
.dl-entry-section-text{font-size:12.5px;line-height:1.5;}
.dl-photos{display:flex;gap:8px;flex-wrap:wrap;}
.dl-photo{width:72px;height:72px;border-radius:8px;background:var(--cream2,#EDE9E1);border:1px solid var(--bdr,rgba(26,24,20,0.10));display:flex;align-items:center;justify-content:center;overflow:hidden;}
.dl-photo img{width:100%;height:100%;object-fit:cover;}
.dl-modal{position:fixed;inset:0;background:rgba(26,24,20,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
.dl-modal-card{background:#fff;border-radius:14px;max-width:600px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.25);max-height:92vh;overflow-y:auto;}
.dl-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:16px;}
.dl-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--ink3);margin-bottom:6px;display:block;}
.dl-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:14px;box-sizing:border-box;}
.dl-textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;min-height:70px;box-sizing:border-box;resize:vertical;margin-bottom:14px;}
.dl-photo-upload{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center;}
.dl-photo-preview{width:64px;height:64px;border-radius:6px;object-fit:cover;border:1px solid rgba(26,24,20,0.1);}
`;

const WEATHER_OPTIONS = [
  'Ensolarado',
  'Parcialmente nublado',
  'Nublado',
  'Chuva leve',
  'Chuva forte',
  'Tempestade',
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return `${weekdays[d.getDay()]}, ${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

interface FormState {
  date: string;
  description: string;
  responsible: string;
  weather: string;
  workersCount: string;
  problems: string;
  actions: string;
  photos: string[];
}

const emptyForm: FormState = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  responsible: '',
  weather: '',
  workersCount: '',
  problems: '',
  actions: '',
  photos: [],
};

export default function DailyLogPage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions, user } = useAuth();
  const canCreate = permissions.includes('daily-log.create');

  const [entries, setEntries] = useState<DailyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filterResponsible, setFilterResponsible] = useState<string>('');
  const [filterProblemsOnly, setFilterProblemsOnly] = useState(false);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    DailyLogService.list(workId)
      .then((data) => active && setEntries(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [workId]);

  const responsibles = useMemo(
    () => Array.from(new Set(entries.map((e) => e.responsible))),
    [entries],
  );

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        if (filterResponsible && e.responsible !== filterResponsible) return false;
        if (filterProblemsOnly && !e.problems) return false;
        if (filterFrom && e.date < filterFrom) return false;
        if (filterTo && e.date > filterTo) return false;
        return true;
      }),
    [entries, filterResponsible, filterProblemsOnly, filterFrom, filterTo],
  );

  const submit = async () => {
    if (!form.description.trim() || !form.responsible.trim()) return;
    const created = await DailyLogService.create(workId, {
      date: form.date,
      description: form.description.trim(),
      responsible: form.responsible.trim(),
      weather: form.weather || undefined,
      workersCount: form.workersCount ? Number(form.workersCount) : undefined,
      problems: form.problems.trim() || undefined,
      actions: form.actions.trim() || undefined,
      photos: form.photos,
    });
    setEntries((prev) => [created, ...prev]);
    setForm({ ...emptyForm, responsible: user?.name ?? '' });
    setShowForm(false);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await DailyLogService.uploadPhoto(workId, file);
      urls.push(url);
    }
    setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }));
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#7A7670', fontFamily: 'DM Sans' }}>
        Carregando diário…
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="dl">
        <div className="dl-header">
          <div className="dl-title">Diário de Obra</div>
          {canCreate && (
            <button className="dl-btn primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Novo Registro
            </button>
          )}
        </div>

        <div className="dl-filters">
          <Filter size={14} color="#7A7670" />
          <select
            className="dl-filter-input"
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
          >
            <option value="">Todos responsáveis</option>
            {responsibles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            type="date"
            className="dl-filter-input"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            aria-label="De"
          />
          <input
            type="date"
            className="dl-filter-input"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            aria-label="Até"
          />
          <label className="dl-filter-chk">
            <input
              type="checkbox"
              checked={filterProblemsOnly}
              onChange={(e) => setFilterProblemsOnly(e.target.checked)}
            />
            Só com problemas
          </label>
        </div>

        <div className="dl-timeline">
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#7A7670' }}>Nenhum registro nesta visão.</div>
          )}
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              className="dl-entry"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="dl-entry-dot" />
              <div className="dl-entry-card">
                <div className="dl-entry-header">
                  <div className="dl-entry-date">{formatDate(entry.date)}</div>
                  <div className="dl-entry-meta">
                    <div className="dl-entry-meta-item">
                      <User size={12} /> {entry.responsible}
                    </div>
                    {entry.weather && (
                      <div className="dl-entry-meta-item">
                        <CloudSun size={12} /> {entry.weather}
                      </div>
                    )}
                    {entry.workersCount && (
                      <div className="dl-entry-meta-item">
                        <Users size={12} /> {entry.workersCount} trabalhadores
                      </div>
                    )}
                  </div>
                </div>
                <div className="dl-entry-body">
                  <div className="dl-entry-desc">{entry.description}</div>

                  {entry.problems && (
                    <div className="dl-entry-section" style={{ background: '#FDEDEC' }}>
                      <div className="dl-entry-section-icon" style={{ background: '#fff' }}>
                        <AlertTriangle size={14} color="#C0392B" />
                      </div>
                      <div>
                        <div className="dl-entry-section-title" style={{ color: '#C0392B' }}>Problema Identificado</div>
                        <div className="dl-entry-section-text" style={{ color: '#922B21' }}>{entry.problems}</div>
                      </div>
                    </div>
                  )}

                  {entry.actions && (
                    <div className="dl-entry-section" style={{ background: '#E8F5E9' }}>
                      <div className="dl-entry-section-icon" style={{ background: '#fff' }}>
                        <Wrench size={14} color="#1E8449" />
                      </div>
                      <div>
                        <div className="dl-entry-section-title" style={{ color: '#1E8449' }}>Ação Tomada</div>
                        <div className="dl-entry-section-text" style={{ color: '#186A3B' }}>{entry.actions}</div>
                      </div>
                    </div>
                  )}

                  {entry.photos.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ink3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Camera size={12} /> Fotos ({entry.photos.length})
                      </div>
                      <div className="dl-photos">
                        {entry.photos.map((photo, pi) => (
                          <div key={pi} className="dl-photo">
                            {photo.startsWith('data:') || photo.startsWith('http') ? (
                              <img src={photo} alt="" />
                            ) : (
                              <Camera size={20} color="var(--ink3)" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="dl-modal" onClick={() => setShowForm(false)}>
          <div className="dl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dl-modal-title">Novo registro de diário</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="dl-label">Data</label>
                <input className="dl-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="dl-label">Responsável</label>
                <input className="dl-input" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} placeholder={user?.name ?? ''} />
              </div>
            </div>
            <label className="dl-label">Descrição das atividades</label>
            <textarea className="dl-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="dl-label">Clima</label>
                <select className="dl-input" value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })}>
                  <option value="">—</option>
                  {WEATHER_OPTIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="dl-label">Efetivo (trabalhadores)</label>
                <input className="dl-input" type="number" min={0} value={form.workersCount} onChange={(e) => setForm({ ...form, workersCount: e.target.value })} />
              </div>
            </div>

            <label className="dl-label">Problemas identificados</label>
            <textarea className="dl-textarea" value={form.problems} onChange={(e) => setForm({ ...form, problems: e.target.value })} />

            <label className="dl-label">Ações tomadas</label>
            <textarea className="dl-textarea" value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} />

            <label className="dl-label">Fotos</label>
            <div className="dl-photo-upload">
              {form.photos.map((p, i) => (
                <img key={i} src={p} className="dl-photo-preview" alt="" />
              ))}
              <label className="dl-btn" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> Anexar
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="dl-btn" onClick={() => setShowForm(false)}>
                <X size={14} /> Cancelar
              </button>
              <button
                className="dl-btn primary"
                onClick={submit}
                disabled={!form.description.trim() || !form.responsible.trim()}
              >
                Salvar registro
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
