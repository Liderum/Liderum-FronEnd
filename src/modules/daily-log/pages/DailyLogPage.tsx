import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudSun, Users, Camera, AlertTriangle, Wrench, Plus, X, Upload,
  Filter, FileDown, Pencil, Trash2, Loader2, BookOpen, ChevronLeft,
  ChevronRight, CheckCircle, NotebookPen, CalendarClock,
} from 'lucide-react';
import { LdSelect } from '@/components/LdSelect';
import { LdDateInput } from '@/components/LdDateInput';
import { DailyLogService } from '@/services/works';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { DailyLogEntry, DailyLogOccurrence } from '@/modules/shared/types';

/* ─── CSS ─────────────────────────────────────────────────────────────── */
const CSS = `
.dl{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.dl-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
.dl-header-left{display:flex;align-items:center;gap:12px;}
.dl-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink,#1A1814);}
.dl-header-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}

.dl-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:1px solid rgba(26,24,20,0.12);background:#fff;color:var(--ink);transition:all 0.18s;white-space:nowrap;}
.dl-btn:hover{background:var(--cream,#F7F4EF);}
.dl-btn:disabled{opacity:0.5;cursor:not-allowed;}
.dl-btn.primary{background:linear-gradient(135deg,var(--gold,#B8922A),var(--gold2,#D4A843));color:#fff;border:none;box-shadow:0 2px 10px rgba(184,146,42,0.25);}
.dl-btn.primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
.dl-btn.danger{background:#FDEDEC;color:#C0392B;border-color:rgba(192,57,43,0.2);}
.dl-btn.danger:hover{background:#f8d5d0;}
.dl-btn.outline-gold{border-color:rgba(184,146,42,0.4);color:var(--gold,#B8922A);background:rgba(184,146,42,0.04);}
.dl-btn.outline-gold:hover{background:rgba(184,146,42,0.1);}
.dl-btn.sm{padding:6px 12px;font-size:11.5px;}

.dl-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;}
.dl-stat{background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.08);padding:14px 16px;display:flex;align-items:center;gap:10px;}
.dl-stat-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dl-stat-val{font-family:var(--font-numeric,'IBM Plex Sans');font-size:18px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;}
.dl-stat-label{font-size:10.5px;color:#7A7670;text-transform:uppercase;letter-spacing:0.3px;font-weight:500;}

.dl-filters{background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.08);padding:12px 16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
.dl-filter-input{padding:6px 10px;border-radius:6px;border:1px solid rgba(26,24,20,0.12);font-size:12px;font-family:'DM Sans',sans-serif;background:#fff;color:var(--ink);}
.dl-filter-chk{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--ink);cursor:pointer;}

.dl-timeline{position:relative;padding-left:24px;}
.dl-timeline::before{content:'';position:absolute;left:9px;top:0;bottom:0;width:2px;background:rgba(26,24,20,0.08);border-radius:2px;}
.dl-entry{position:relative;margin-bottom:20px;}
.dl-entry-dot{position:absolute;left:-19px;top:20px;width:10px;height:10px;border-radius:50%;background:var(--gold,#B8922A);border:2px solid var(--cream,#F7F4EF);box-shadow:0 0 0 2px rgba(184,146,42,0.25);}
.dl-entry-card{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));box-shadow:0 2px 8px rgba(26,24,20,0.04);overflow:hidden;transition:box-shadow 0.18s;}
.dl-entry-card:hover{box-shadow:0 6px 24px rgba(26,24,20,0.08);}

.dl-entry-header{padding:14px 20px;border-bottom:1px solid rgba(26,24,20,0.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;}
.dl-entry-date{font-family:var(--font-numeric,'IBM Plex Sans');font-size:15px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink);}
.dl-entry-meta{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
.dl-entry-meta-item{display:flex;align-items:center;gap:4px;font-size:11.5px;color:var(--ink3,#7A7670);}
.dl-entry-actions{display:flex;gap:6px;align-items:center;}

.dl-entry-body{padding:16px 20px;display:flex;flex-direction:column;gap:12px;}
.dl-entry-desc{font-size:13px;color:var(--ink);line-height:1.65;}
.dl-entry-section{display:flex;gap:10px;padding:10px 12px;border-radius:9px;}
.dl-entry-section-icon{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dl-entry-section-title{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:3px;}
.dl-entry-section-text{font-size:12.5px;line-height:1.5;}

.dl-photos{display:flex;gap:8px;flex-wrap:wrap;}
.dl-photo{width:76px;height:76px;border-radius:8px;background:rgba(26,24,20,0.05);border:1px solid rgba(26,24,20,0.10);overflow:hidden;cursor:pointer;transition:transform 0.15s;}
.dl-photo:hover{transform:scale(1.04);}
.dl-photo img{width:100%;height:100%;object-fit:cover;}

.dl-empty{padding:48px 20px;text-align:center;background:#fff;border-radius:12px;border:1px solid rgba(26,24,20,0.08);}
.dl-empty-icon{width:48px;height:48px;border-radius:12px;background:rgba(184,146,42,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;}

.dl-pagination{display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 0;}
.dl-page-info{font-size:12px;color:#7A7670;}

/* Modal */
.dl-overlay{position:fixed;inset:0;background:rgba(26,24,20,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px;backdrop-filter:blur(3px);}
.dl-modal{background:#fff;border-radius:16px;max-width:620px;width:100%;padding:28px;box-shadow:0 24px 64px rgba(0,0,0,0.22);max-height:93vh;overflow-y:auto;}
.dl-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:4px;color:var(--ink);}
.dl-modal-subtitle{font-size:12px;color:#7A7670;margin-bottom:20px;}

.dl-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#7A7670;margin-bottom:6px;display:block;}
.dl-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:14px;box-sizing:border-box;background:#fff;color:var(--ink);transition:border-color 0.15s;}
.dl-input:focus{outline:none;border-color:rgba(184,146,42,0.5);}
.dl-textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;min-height:72px;box-sizing:border-box;resize:vertical;margin-bottom:14px;background:#fff;color:var(--ink);transition:border-color 0.15s;}
.dl-textarea:focus{outline:none;border-color:rgba(184,146,42,0.5);}

.dl-photo-upload{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center;}
.dl-photo-preview{width:64px;height:64px;border-radius:6px;object-fit:cover;border:1px solid rgba(26,24,20,0.1);}
.dl-upload-label{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px dashed rgba(26,24,20,0.25);background:rgba(26,24,20,0.02);color:#7A7670;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.dl-upload-label:hover{border-color:rgba(184,146,42,0.5);color:var(--gold);background:rgba(184,146,42,0.04);}

.dl-photo-uploading{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#7A7670;}

/* Export modal */
.dl-export-row{display:flex;gap:12px;align-items:flex-end;margin-bottom:16px;flex-wrap:wrap;}
.dl-export-field{flex:1;min-width:140px;}

/* Occurrences */
.dl-occ-list{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
.dl-occ-item{background:rgba(184,146,42,0.05);border:1px solid rgba(184,146,42,0.18);border-radius:8px;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:start;}
.dl-occ-item.card{grid-template-columns:1fr;background:#FFF8E1;border-color:rgba(184,146,42,0.25);}
.dl-occ-add{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gold,#B8922A);cursor:pointer;background:none;border:1px dashed rgba(184,146,42,0.4);border-radius:7px;padding:6px 12px;font-family:'DM Sans',sans-serif;transition:all 0.15s;margin-bottom:14px;}
.dl-occ-add:hover{background:rgba(184,146,42,0.06);}
.dl-occ-row{display:grid;grid-template-columns:1fr 1fr 160px auto;gap:8px;align-items:end;background:rgba(184,146,42,0.04);border:1px solid rgba(184,146,42,0.18);border-radius:8px;padding:10px 12px;margin-bottom:8px;}
.dl-occ-del{width:28px;height:28px;border-radius:6px;border:1px solid rgba(192,57,43,0.2);background:#FDEDEC;color:#C0392B;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dl-occ-del:hover{background:#f8d5d0;}
`;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const WEATHER_OPTIONS = [
  'Ensolarado',
  'Parcialmente nublado',
  'Nublado com chuva leve',
  'Nublado',
  'Chuva leve',
  'Chuva forte',
  'Tempestade',
  'Vento forte',
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return `${weekdays[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const PAGE_SIZE = 20;

/* ─── Form types ──────────────────────────────────────────────────────── */
interface FormState {
  date: string;
  description: string;
  weather: string;
  workersCount: string;
  problems: string;
  actions: string;
}

interface OccurrenceFormItem {
  description: string;
  responsible: string;
  deadline: string;
}

const emptyOccurrence = (): OccurrenceFormItem => ({
  description: '',
  responsible: '',
  deadline: '',
});

const emptyForm: FormState = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  weather: '',
  workersCount: '',
  problems: '',
  actions: '',
};

type ModalMode = 'create' | 'edit' | null;

/* ─── Component ───────────────────────────────────────────────────────── */
export default function DailyLogPage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions } = useAuth();
  const { toast } = useToast();

  // Usuários autenticados com acesso à obra podem criar registros;
  // editar/deletar exige permissões granulares.
  const canCreate = true;
  const canUpdate = permissions.includes('daily-log.update') || permissions.includes('daily-log.create') || permissions.includes('works.update');
  const canDelete = permissions.includes('daily-log.delete') || permissions.includes('works.update');

  const [entries, setEntries] = useState<DailyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterProblemsOnly, setFilterProblemsOnly] = useState(false);

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [occurrenceForms, setOccurrenceForms] = useState<OccurrenceFormItem[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [pendingPhotosPreviews, setPendingPhotosPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);

  // Export modal
  const [showExport, setShowExport] = useState(false);
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');
  const [exporting, setExporting] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  /* ── Load ── */
  const loadPage = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const result = await DailyLogService.listPaged(workId, p, PAGE_SIZE);
        setEntries(result.items);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
        setPage(result.page);
      } finally {
        setLoading(false);
      }
    },
    [workId],
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  /* ── Client-side filters ── */
  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        if (filterFrom && e.date < filterFrom) return false;
        if (filterTo && e.date > filterTo) return false;
        if (filterProblemsOnly && !e.problems) return false;
        return true;
      }),
    [entries, filterFrom, filterTo, filterProblemsOnly],
  );

  const statsTotal = totalCount;
  const statsProblems = entries.filter((e) => !!e.problems).length;
  const statsPhotos = entries.reduce((acc, e) => acc + e.photos.length, 0);

  /* ── Modal helpers ── */
  const openCreate = () => {
    setForm(emptyForm);
    setOccurrenceForms([]);
    setPendingPhotos([]);
    setPendingPhotosPreviews([]);
    setEditingEntry(null);
    setModalMode('create');
  };

  const openEdit = (entry: DailyLogEntry) => {
    setForm({
      date: entry.date,
      description: entry.description,
      weather: entry.weather ?? '',
      workersCount: entry.workersCount?.toString() ?? '',
      problems: entry.problems ?? '',
      actions: entry.actions ?? '',
    });
    setOccurrenceForms(
      entry.occurrences?.map((o) => ({
        description: o.description,
        responsible: o.responsible,
        deadline: o.deadline,
      })) ?? [],
    );
    setPendingPhotos([]);
    setPendingPhotosPreviews([]);
    setEditingEntry(entry);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingEntry(null);
    setOccurrenceForms([]);
    setPendingPhotos([]);
    setPendingPhotosPreviews([]);
  };

  /* ── Photo selection ── */
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setPendingPhotos((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setPendingPhotosPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePendingPhoto = (index: number) => {
    setPendingPhotos((prev) => prev.filter((_, i) => i !== index));
    setPendingPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Upload photos to an entry ── */
  const uploadPhotosToEntry = async (entryId: string) => {
    if (pendingPhotos.length === 0) return;
    setUploadingPhotos(true);
    try {
      const urls = await Promise.all(
        pendingPhotos.map((file) => DailyLogService.uploadPhoto(workId, entryId, file)),
      );
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, photos: [...e.photos, ...urls] } : e,
        ),
      );
    } finally {
      setUploadingPhotos(false);
    }
  };

  /* ── Create ── */
  const handleCreate = async () => {
    if (!form.description.trim()) return;
    setSaving(true);
    try {
      const validOccurrences = occurrenceForms.filter(
        (o) => o.description.trim() && o.responsible.trim() && o.deadline,
      );
      const created = await DailyLogService.create(workId, {
        date: form.date,
        description: form.description.trim(),
        responsible: '',
        weather: form.weather || undefined,
        workersCount: form.workersCount ? Number(form.workersCount) : undefined,
        problems: form.problems.trim() || undefined,
        actions: form.actions.trim() || undefined,
        photos: [],
        occurrences: validOccurrences.length > 0
          ? validOccurrences.map((o) => ({ id: '', description: o.description.trim(), responsible: o.responsible.trim(), deadline: o.deadline }))
          : undefined,
      });
      setEntries((prev) => [created, ...prev]);
      setTotalCount((n) => n + 1);
      if (pendingPhotos.length > 0) await uploadPhotosToEntry(created.id);
      closeModal();
      toast({
        title: 'Registro salvo',
        description: `Diário de ${formatDate(created.date)} adicionado com sucesso.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const is409 = msg.includes('409') || msg.toLowerCase().includes('já existe') || msg.toLowerCase().includes('conflict');
      toast({
        title: is409 ? 'Registro duplicado' : 'Erro ao salvar',
        description: is409
          ? 'Já existe um registro para essa data nesta obra.'
          : msg,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  /* ── Update ── */
  const handleUpdate = async () => {
    if (!editingEntry || !form.description.trim()) return;
    setSaving(true);
    try {
      const validOccurrences = occurrenceForms.filter(
        (o) => o.description.trim() && o.responsible.trim() && o.deadline,
      );
      const updated = await DailyLogService.update(workId, editingEntry.id, {
        description: form.description.trim(),
        weather: form.weather || undefined,
        workersCount: form.workersCount ? Number(form.workersCount) : undefined,
        problems: form.problems.trim() || undefined,
        actions: form.actions.trim() || undefined,
        occurrences: validOccurrences.map((o) => ({
          id: '',
          description: o.description.trim(),
          responsible: o.responsible.trim(),
          deadline: o.deadline,
        })),
      });
      setEntries((prev) => prev.map((e) => (e.id === editingEntry.id ? updated : e)));
      if (pendingPhotos.length > 0) await uploadPhotosToEntry(editingEntry.id);
      closeModal();
      toast({ title: 'Registro atualizado', description: 'Alterações salvas com sucesso.' });
    } catch (err: unknown) {
      toast({
        title: 'Erro ao atualizar',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (entryId: string) => {
    setDeletingId(entryId);
    try {
      await DailyLogService.remove(workId, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setTotalCount((n) => n - 1);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Export PDF ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      await DailyLogService.exportPdf(workId, exportFrom || undefined, exportTo || undefined);
      setShowExport(false);
      toast({ title: 'PDF gerado', description: 'O download foi iniciado automaticamente.' });
    } catch (err: unknown) {
      setShowExport(false);
      setTimeout(() => {
        toast({
          title: 'Nenhum registro encontrado',
          description: err instanceof Error ? err.message : 'Não há registros para o período informado.',
          variant: 'destructive',
        });
      }, 150);
    } finally {
      setExporting(false);
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60, color: '#7A7670' }}>
        <Loader2 size={22} className="animate-spin" style={{ marginRight: 10, color: 'var(--gold, #B8922A)' }} />
        <span style={{ fontFamily: 'DM Sans', fontSize: 13 }}>Carregando diário…</span>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="dl">

        {/* ── Header ── */}
        <div className="dl-header">
          <div className="dl-header-left">
            <div className="dl-title">Diário de Obra</div>
          </div>
          <div className="dl-header-actions">
            <button className="dl-btn outline-gold" onClick={() => setShowExport(true)}>
              <FileDown size={14} /> Exportar PDF
            </button>
            <button className="dl-btn primary" onClick={openCreate}>
              <Plus size={14} /> Novo Registro
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="dl-stats">
          <div className="dl-stat">
            <div className="dl-stat-icon" style={{ background: 'rgba(184,146,42,0.10)' }}>
              <BookOpen size={15} color="var(--gold,#B8922A)" />
            </div>
            <div>
              <div className="dl-stat-val">{statsTotal}</div>
              <div className="dl-stat-label">Registros</div>
            </div>
          </div>
          <div className="dl-stat">
            <div className="dl-stat-icon" style={{ background: '#FDEDEC' }}>
              <AlertTriangle size={15} color="#C0392B" />
            </div>
            <div>
              <div className="dl-stat-val">{statsProblems}</div>
              <div className="dl-stat-label">Com problemas</div>
            </div>
          </div>
          <div className="dl-stat">
            <div className="dl-stat-icon" style={{ background: '#E8F5E9' }}>
              <Camera size={15} color="#1E8449" />
            </div>
            <div>
              <div className="dl-stat-val">{statsPhotos}</div>
              <div className="dl-stat-label">Fotos</div>
            </div>
          </div>
          <div className="dl-stat">
            <div className="dl-stat-icon" style={{ background: '#EBF5FB' }}>
              <Users size={15} color="#1A5276" />
            </div>
            <div>
              <div className="dl-stat-val">
                {entries.length > 0
                  ? Math.round(
                      entries.reduce((a, e) => a + (e.workersCount ?? 0), 0) / entries.length,
                    )
                  : 0}
              </div>
              <div className="dl-stat-label">Média efetivo</div>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="dl-filters">
          <Filter size={13} color="#7A7670" />
          <span style={{ fontSize: 11.5, color: '#7A7670', fontWeight: 500 }}>Filtros</span>
          <LdDateInput
            size="sm"
            value={filterFrom}
            onChange={setFilterFrom}
            placeholder="De"
            style={{ width: 140 }}
          />
          <span style={{ fontSize: 11, color: '#7A7670' }}>até</span>
          <LdDateInput
            size="sm"
            value={filterTo}
            onChange={setFilterTo}
            placeholder="Até"
            style={{ width: 140 }}
          />
          <label className="dl-filter-chk">
            <input
              type="checkbox"
              checked={filterProblemsOnly}
              onChange={(e) => setFilterProblemsOnly(e.target.checked)}
            />
            Só com problemas
          </label>
          {(filterFrom || filterTo || filterProblemsOnly) && (
            <button
              className="dl-btn sm"
              onClick={() => { setFilterFrom(''); setFilterTo(''); setFilterProblemsOnly(false); }}
            >
              <X size={12} /> Limpar
            </button>
          )}
        </div>

        {/* ── Timeline ── */}
        {filtered.length === 0 ? (
          filterProblemsOnly || filterFrom || filterTo ? (
            /* Estado vazio com filtros ativos */
            <div className="dl-empty">
              <div className="dl-empty-icon">
                <Filter size={20} color="var(--gold,#B8922A)" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                Nenhum registro encontrado
              </div>
              <div style={{ fontSize: 12, color: '#7A7670', marginBottom: 16 }}>
                Nenhum registro corresponde aos filtros selecionados.
              </div>
              <button
                className="dl-btn sm"
                onClick={() => { setFilterFrom(''); setFilterTo(''); setFilterProblemsOnly(false); }}
              >
                <X size={12} /> Limpar filtros
              </button>
            </div>
          ) : (
            /* Estado vazio sem filtros — CTA principal */
            <motion.div
              className="dl-empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: '56px 32px' }}
            >
              <motion.div
                className="dl-empty-icon"
                style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 16 }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <NotebookPen size={28} color="var(--gold,#B8922A)" />
              </motion.div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                Diário ainda sem registros
              </div>
              <div style={{ fontSize: 13, color: '#7A7670', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                Documente as atividades diárias da obra, condições climáticas,
                efetivo e intercorrências. Comece agora.
              </div>
              <motion.button
                className="dl-btn primary"
                style={{ padding: '12px 24px', fontSize: 13, borderRadius: 10 }}
                onClick={openCreate}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus size={15} /> Registrar primeiro dia
              </motion.button>
            </motion.div>
          )
        ) : (
          <div className="dl-timeline">
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                className="dl-entry"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="dl-entry-dot" />
                <div className="dl-entry-card">
                  {/* Header */}
                  <div className="dl-entry-header">
                    <div className="dl-entry-date">{formatDate(entry.date)}</div>
                    <div className="dl-entry-meta">
                      {entry.weather && (
                        <div className="dl-entry-meta-item">
                          <CloudSun size={12} /> {entry.weather}
                        </div>
                      )}
                      {entry.workersCount != null && (
                        <div className="dl-entry-meta-item">
                          <Users size={12} /> {entry.workersCount} trabalhadores
                        </div>
                      )}
                      {entry.photos.length > 0 && (
                        <div className="dl-entry-meta-item">
                          <Camera size={12} /> {entry.photos.length}
                        </div>
                      )}
                    </div>
                    {(canUpdate || canDelete) && (
                      <div className="dl-entry-actions">
                        {canUpdate && (
                          <button
                            className="dl-btn sm"
                            onClick={() => openEdit(entry)}
                            title="Editar registro"
                          >
                            <Pencil size={11} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="dl-btn sm danger"
                            onClick={() => setConfirmDeleteId(entry.id)}
                            title="Excluir registro"
                            disabled={deletingId === entry.id}
                          >
                            {deletingId === entry.id ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <Trash2 size={11} />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="dl-entry-body">
                    <div className="dl-entry-desc">{entry.description}</div>

                    {entry.problems && (
                      <div className="dl-entry-section" style={{ background: '#FDEDEC' }}>
                        <div className="dl-entry-section-icon" style={{ background: '#fff' }}>
                          <AlertTriangle size={13} color="#C0392B" />
                        </div>
                        <div>
                          <div className="dl-entry-section-title" style={{ color: '#C0392B' }}>
                            Problema identificado
                          </div>
                          <div className="dl-entry-section-text" style={{ color: '#922B21' }}>
                            {entry.problems}
                          </div>
                        </div>
                      </div>
                    )}

                    {entry.actions && (
                      <div className="dl-entry-section" style={{ background: '#E8F5E9' }}>
                        <div className="dl-entry-section-icon" style={{ background: '#fff' }}>
                          <Wrench size={13} color="#1E8449" />
                        </div>
                        <div>
                          <div className="dl-entry-section-title" style={{ color: '#1E8449' }}>
                            Observações / Ações
                          </div>
                          <div className="dl-entry-section-text" style={{ color: '#186A3B' }}>
                            {entry.actions}
                          </div>
                        </div>
                      </div>
                    )}

                    {entry.occurrences && entry.occurrences.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#7A7670', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CalendarClock size={11} /> Ocorrências ({entry.occurrences.length})
                        </div>
                        <div className="dl-occ-list">
                          {entry.occurrences.map((occ: DailyLogOccurrence, oi: number) => (
                            <div key={oi} className="dl-occ-item card">
                              <div style={{ fontSize: 12.5, color: '#1A1814', marginBottom: 4 }}>{occ.description}</div>
                              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, color: '#7A7670' }}>
                                  <strong style={{ color: '#B8922A' }}>Responsável:</strong> {occ.responsible}
                                </span>
                                <span style={{ fontSize: 11, color: '#7A7670' }}>
                                  <strong style={{ color: '#B8922A' }}>Prazo:</strong>{' '}
                                  {occ.deadline ? new Date(occ.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.photos.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#7A7670', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Camera size={11} /> Fotos ({entry.photos.length})
                        </div>
                        <div className="dl-photos">
                          {entry.photos.map((photo, pi) => (
                            <div
                              key={pi}
                              className="dl-photo"
                              onClick={() => setLightboxSrc(photo)}
                            >
                              {(photo.startsWith('data:') || photo.startsWith('http') || photo.startsWith('blob:')) ? (
                                <img src={photo} alt={`Foto ${pi + 1}`} />
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                  <Camera size={20} color="#7A7670" />
                                </div>
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
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="dl-pagination">
            <button
              className="dl-btn sm"
              onClick={() => loadPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft size={13} />
            </button>
            <span className="dl-page-info">
              Página {page} de {totalPages}
            </span>
            <button
              className="dl-btn sm"
              onClick={() => loadPage(page + 1)}
              disabled={page >= totalPages || loading}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            className="dl-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="dl-modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dl-modal-title">
                {modalMode === 'create' ? 'Novo registro de diário' : 'Editar registro'}
              </div>
              <div className="dl-modal-subtitle">
                {modalMode === 'create'
                  ? 'Preencha as informações do dia de trabalho.'
                  : `Editando registro de ${editingEntry ? formatDate(editingEntry.date) : '—'}`}
              </div>

              {modalMode === 'create' && (
                <>
                  <label className="dl-label">Data *</label>
                  <LdDateInput
                    value={form.date}
                    onChange={(v) => setForm({ ...form, date: v })}
                    clearable={false}
                    style={{ marginBottom: 14 }}
                  />
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="dl-label">Clima</label>
                  <LdSelect
                    value={form.weather}
                    onChange={(val) => setForm({ ...form, weather: val })}
                    options={WEATHER_OPTIONS.map((w) => ({ value: w, label: w }))}
                    style={{ marginBottom: 14 }}
                  />
                </div>
                <div>
                  <label className="dl-label">Efetivo (trabalhadores)</label>
                  <input
                    className="dl-input"
                    type="number"
                    min={0}
                    value={form.workersCount}
                    onChange={(e) => setForm({ ...form, workersCount: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <label className="dl-label">Atividades realizadas *</label>
              <textarea
                className="dl-textarea"
                style={{ minHeight: 90 }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descreva as atividades executadas no dia…"
              />

              <label className="dl-label">Problemas / Intercorrências</label>
              <textarea
                className="dl-textarea"
                value={form.problems}
                onChange={(e) => setForm({ ...form, problems: e.target.value })}
                placeholder="Descreva problemas identificados (opcional)…"
              />

              <label className="dl-label">Observações / Notas</label>
              <textarea
                className="dl-textarea"
                value={form.actions}
                onChange={(e) => setForm({ ...form, actions: e.target.value })}
                placeholder="Notas adicionais, ações tomadas… (opcional)"
              />

              <label className="dl-label">Ocorrências / Pendências</label>
              {occurrenceForms.map((occ, idx) => (
                <div key={idx} className="dl-occ-row">
                  <div>
                    <label className="dl-label" style={{ marginBottom: 3 }}>Descrição *</label>
                    <input
                      className="dl-input"
                      style={{ marginBottom: 0 }}
                      value={occ.description}
                      onChange={(e) => {
                        const next = [...occurrenceForms];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setOccurrenceForms(next);
                      }}
                      placeholder="Descreva a ocorrência…"
                    />
                  </div>
                  <div>
                    <label className="dl-label" style={{ marginBottom: 3 }}>Responsável *</label>
                    <input
                      className="dl-input"
                      style={{ marginBottom: 0 }}
                      value={occ.responsible}
                      onChange={(e) => {
                        const next = [...occurrenceForms];
                        next[idx] = { ...next[idx], responsible: e.target.value };
                        setOccurrenceForms(next);
                      }}
                      placeholder="Nome do responsável…"
                    />
                  </div>
                  <div>
                    <label className="dl-label" style={{ marginBottom: 3 }}>Prazo *</label>
                    <LdDateInput
                      value={occ.deadline}
                      onChange={(v) => {
                        const next = [...occurrenceForms];
                        next[idx] = { ...next[idx], deadline: v };
                        setOccurrenceForms(next);
                      }}
                      clearable={false}
                    />
                  </div>
                  <button
                    type="button"
                    className="dl-occ-del"
                    onClick={() => setOccurrenceForms((prev) => prev.filter((_, i) => i !== idx))}
                    title="Remover"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="dl-occ-add"
                onClick={() => setOccurrenceForms((prev) => [...prev, emptyOccurrence()])}
              >
                <Plus size={12} /> Adicionar ocorrência
              </button>

              <label className="dl-label">Fotos</label>
              <div className="dl-photo-upload">
                {pendingPhotosPreviews.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={p} className="dl-photo-preview" alt="" />
                    <button
                      onClick={() => removePendingPhoto(i)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#C0392B', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {modalMode === 'edit' && editingEntry && editingEntry.photos.length > 0 && (
                  <div style={{ fontSize: 11, color: '#7A7670', alignSelf: 'center' }}>
                    + {editingEntry.photos.length} foto(s) já anexada(s)
                  </div>
                )}
                <label className="dl-upload-label">
                  <Upload size={13} /> Adicionar fotos
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </label>
                {uploadingPhotos && (
                  <div className="dl-photo-uploading">
                    <Loader2 size={13} className="animate-spin" /> Enviando…
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="dl-btn" onClick={closeModal} disabled={saving}>
                  <X size={13} /> Cancelar
                </button>
                <button
                  className="dl-btn primary"
                  onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                  disabled={saving || !form.description.trim()}
                >
                  {saving ? (
                    <><Loader2 size={13} className="animate-spin" /> Salvando…</>
                  ) : (
                    <><CheckCircle size={13} /> {modalMode === 'create' ? 'Salvar registro' : 'Salvar alterações'}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            className="dl-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              className="dl-modal"
              style={{ maxWidth: 400 }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={18} color="#C0392B" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700 }}>
                    Excluir registro?
                  </div>
                  <div style={{ fontSize: 12, color: '#7A7670', marginTop: 2 }}>
                    Esta ação não pode ser desfeita. Fotos também serão removidas.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="dl-btn" onClick={() => setConfirmDeleteId(null)}>
                  Cancelar
                </button>
                <button
                  className="dl-btn danger"
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={!!deletingId}
                >
                  {deletingId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Export PDF Modal ── */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            className="dl-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExport(false)}
          >
            <motion.div
              className="dl-modal"
              style={{ maxWidth: 440 }}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dl-modal-title">Exportar Diário de Obra</div>
              <div className="dl-modal-subtitle">
                Gera um PDF com todos os registros no período selecionado.
                Deixe em branco para exportar tudo.
              </div>
              <div className="dl-export-row">
                <div className="dl-export-field">
                  <label className="dl-label">De</label>
                  <LdDateInput
                    value={exportFrom}
                    onChange={setExportFrom}
                  />
                </div>
                <div className="dl-export-field">
                  <label className="dl-label">Até</label>
                  <LdDateInput
                    value={exportTo}
                    onChange={setExportTo}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="dl-btn" onClick={() => setShowExport(false)}>
                  <X size={13} /> Cancelar
                </button>
                <button
                  className="dl-btn primary"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? (
                    <><Loader2 size={13} className="animate-spin" /> Gerando…</>
                  ) : (
                    <><FileDown size={13} /> Baixar PDF</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}
          >
            <motion.img
              src={lightboxSrc}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxSrc(null)}
              style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            >
              <X size={16} color="#fff" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
