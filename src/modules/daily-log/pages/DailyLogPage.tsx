import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, User, CloudSun, Users, Camera,
  AlertTriangle, Wrench, Plus,
} from 'lucide-react';
import { mockDailyLogs } from '@/modules/shared/data/mockData';

const CSS = `
.dl{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.dl-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
.dl-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--ink,#1A1814);}
.dl-btn-new{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;background:linear-gradient(135deg,var(--gold,#B8922A),var(--gold2,#D4A843));color:#fff;transition:all 0.2s;box-shadow:0 2px 10px rgba(184,146,42,0.25);}
.dl-btn-new:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
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
.dl-photo{width:72px;height:72px;border-radius:8px;background:var(--cream2,#EDE9E1);border:1px solid var(--bdr,rgba(26,24,20,0.10));display:flex;align-items:center;justify-content:center;overflow:hidden;transition:all 0.18s;cursor:pointer;}
.dl-photo:hover{transform:scale(1.05);box-shadow:0 4px 12px rgba(26,24,20,0.12);}
.dl-photo img{width:100%;height:100%;object-fit:cover;}
`;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const weekday = weekdays[d.getDay()];
  return `${weekday}, ${day} ${month} ${year}`;
}

export default function DailyLogPage() {
  const { id } = useParams();

  return (
    <>
      <style>{CSS}</style>
      <div className="dl">
        <div className="dl-header">
          <div className="dl-title">Diário de Obra</div>
          <button className="dl-btn-new">
            <Plus size={14} /> Novo Registro
          </button>
        </div>

        <div className="dl-timeline">
          {mockDailyLogs.map((entry, i) => (
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
                            <Camera size={20} color="var(--ink3)" />
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
    </>
  );
}
