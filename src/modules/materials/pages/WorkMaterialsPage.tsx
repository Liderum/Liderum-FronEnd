import { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, DollarSign, Plus, Pencil, Trash2, Package, ChevronDown, ChevronUp, History } from 'lucide-react';
import { WorkMaterialService } from '@/services/works';
import type { WorkMaterialDto, WorkMaterialHistoryDto } from '@/services/works';
import { MaterialService, SupplierService, CompanyService } from '@/services/managementService';
import type { Material, Supplier, Company, CreateMaterialDto, MaterialUnit, MaterialCategory } from '@/types/management';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { LdConfirmDialog } from '@/components/LdConfirmDialog';
import { LdDateInput } from '@/components/LdDateInput';
import { LdSelect } from '@/components/LdSelect';
import { LdModal } from '@/components/LdModal';
import { WORK_MATERIAL_STATUS_CONFIG } from '@/modules/shared/types';
import type { WorkMaterialWorkflowStatus } from '@/modules/shared/types';

const CSS = `
.wm{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.wm-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;}
.wm-summary-card{background:var(--card-bg,#fff);border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(26,24,20,0.03);}
.wm-summary-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.wm-summary-val{font-family:var(--font-numeric);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.wm-summary-label{font-size:10.5px;color:var(--ink3,#7A7670);font-weight:500;text-transform:uppercase;letter-spacing:0.3px;}
.wm-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.wm-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:var(--card-bg,#fff);color:var(--ink,#1A1814);font-family:'DM Sans',sans-serif;transition:all 0.18s;white-space:nowrap;}
.wm-btn:hover{background:var(--cream,#F7F4EF);}
.wm-btn.primary{background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));color:#fff;border:none;box-shadow:0 2px 10px rgba(184,146,42,0.25);}
.wm-btn.primary:hover{background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
.wm-btn.danger{background:#FDEDEC;color:#C0392B;border-color:rgba(192,57,43,0.2);}
.wm-btn.danger:hover{background:#f8d5d0;}
.wm-btn:disabled{opacity:0.5;cursor:not-allowed;}
.wm-btn-sm{padding:6px 12px;font-size:11.5px;}
.wm-card{background:var(--card-bg,#fff);border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:0;overflow:hidden;box-shadow:0 2px 10px rgba(26,24,20,0.04);}
.wm-table{width:100%;border-collapse:collapse;font-size:12.5px;}
.wm-table thead th{text-align:left;font-size:10px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:var(--ink3,#7A7670);padding:10px 14px;border-bottom:1px solid var(--bdr,rgba(26,24,20,0.10));background:var(--cream,#F7F4EF);}
.wm-table tbody td{padding:11px 14px;border-bottom:1px solid rgba(26,24,20,0.05);color:var(--ink2,#4A473F);vertical-align:top;}
.wm-table tbody tr:hover{background:rgba(184,146,42,0.03);}
.wm-table tbody td:first-child{font-weight:500;color:var(--ink,#1A1814);}
.wm-material-meta{font-size:11px;font-weight:400;color:var(--ink3,#7A7670);margin-top:2px;}
.wm-num{font-family:var(--font-numeric);font-variant-numeric:tabular-nums;}
.wm-empty{text-align:center;padding:40px 0;color:var(--ink3,#7A7670);font-size:12.5px;}
.wm-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:10.5px;font-weight:500;white-space:nowrap;}
.wm-progress{font-size:11px;color:var(--ink3,#7A7670);margin-top:4px;}
.wm-progress-value{font-weight:600;color:var(--ink,#1A1814);}
.wm-row-actions{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
.wm-row-actions-top{display:flex;justify-content:flex-end;gap:4px;}
.wm-history-toggle{display:inline-flex;align-items:center;gap:4px;padding:0;border:none;background:none;color:var(--ink3,#7A7670);font-size:10.5px;font-family:'DM Sans',sans-serif;cursor:pointer;}
.wm-history-toggle:hover{color:var(--ink,#1A1814);}
.wm-history-row td{background:var(--cream,#F7F4EF);padding:14px 20px;}
.wm-history-title{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--ink3,#7A7670);margin-bottom:10px;}
.wm-history-item{display:flex;gap:12px;padding:8px 0;}
.wm-history-item+.wm-history-item{border-top:1px solid rgba(26,24,20,0.06);}
.wm-history-dot{width:7px;height:7px;border-radius:50%;background:var(--gold,#B8922A);margin-top:5px;flex-shrink:0;}
.wm-history-info{flex:1;}
.wm-history-action{font-size:12.5px;font-weight:500;color:var(--ink,#1A1814);}
.wm-history-user{font-size:11.5px;color:var(--ink3,#7A7670);margin-top:1px;}
.wm-history-notes{font-size:11.5px;color:var(--ink3,#7A7670);font-style:italic;margin-top:3px;}
.wm-history-date{font-size:10.5px;color:rgba(26,24,20,0.4);flex-shrink:0;margin-top:3px;}
.wm-history-empty{font-size:11.5px;color:var(--ink3,#7A7670);}
.wm-select-row{display:flex;gap:8px;align-items:flex-start;}
.wm-select-row > :first-child{flex:1;min-width:0;}
`;

const UNIT_OPTIONS: { value: MaterialUnit; label: string }[] = [
  { value: 'saco', label: 'Saco' },
  { value: 'm3', label: 'm³' },
  { value: 'm2', label: 'm²' },
  { value: 'kg', label: 'Kg' },
  { value: 'un', label: 'Unidade' },
  { value: 'lata', label: 'Lata' },
  { value: 'barra', label: 'Barra' },
  { value: 'rolo', label: 'Rolo' },
  { value: 'litro', label: 'Litro' },
  { value: 'ton', label: 'Tonelada' },
];

const CATEGORY_OPTIONS: { value: MaterialCategory; label: string }[] = [
  { value: 'Estrutura', label: 'Estrutura' },
  { value: 'Acabamento', label: 'Acabamento' },
  { value: 'Hidraulica', label: 'Hidráulica' },
  { value: 'Eletrica', label: 'Elétrica' },
  { value: 'Ferramentas', label: 'Ferramentas' },
  { value: 'EPI', label: 'EPI' },
  { value: 'Outros', label: 'Outros' },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
}

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function currencyToInput(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrencyToNumber(formatted: string): number {
  if (!formatted) return 0;
  const clean = formatted.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

function parseQuantity(value: string): number {
  return Number(value.replace(',', '.'));
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = dateStr.substring(0, 10);
  const [year, month, day] = d.split('-');
  return `${day}/${month}/${year}`;
}

function todayYMD(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function statusConfig(status: string) {
  return WORK_MATERIAL_STATUS_CONFIG[status as WorkMaterialWorkflowStatus] ?? { label: status, color: '#7A7670', bg: '#F5F5F5' };
}

type Errors = Record<string, string>;

function FieldError({ message }: { message?: string }) {
  return message ? <div className="ldm-error">{message}</div> : null;
}

interface FormState {
  companyId: string;
  materialId: string;
  supplierId: string;
  quantity: string;
  unitPrice: string;
  notes: string;
}

const emptyForm: FormState = { companyId: '', materialId: '', supplierId: '', quantity: '', unitPrice: '', notes: '' };

const emptyCatalogForm: CreateMaterialDto = { name: '', unit: '', category: '', brand: '', description: '' };

// Ação de transição de workflow em andamento (modal aberto para o item).
type ActionType = 'orcar' | 'comprar' | 'receber' | 'consumir';

interface OrcarForm { unitPrice: string; supplierId: string }
interface ComprarForm { orderNumber: string; unitPrice: string; expectedDeliveryDate: string }
interface ReceberForm { receivedQuantity: string; invoiceNumber: string }
interface ConsumirForm { quantity: string; notes: string }

const emptyOrcarForm: OrcarForm = { unitPrice: '', supplierId: '' };
const emptyComprarForm: ComprarForm = { orderNumber: '', unitPrice: '', expectedDeliveryDate: '' };
const emptyReceberForm: ReceberForm = { receivedQuantity: '', invoiceNumber: '' };
const emptyConsumirForm: ConsumirForm = { quantity: '', notes: '' };

const ACTION_TEXT: Record<ActionType, { title: string; confirm: string }> = {
  orcar: { title: 'Orçar Material', confirm: 'Confirmar orçamento' },
  comprar: { title: 'Registrar Compra', confirm: 'Confirmar compra' },
  receber: { title: 'Registrar Recebimento', confirm: 'Confirmar recebimento' },
  consumir: { title: 'Registrar Consumo', confirm: 'Confirmar consumo' },
};

function materialLabel(m: Material): string {
  return `${m.code ? `${m.code} · ` : ''}${m.name}${m.brand ? ` — ${m.brand}` : ''} (${m.unit})`;
}

export default function WorkMaterialsPage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions } = useAuth();
  const { showToast } = useSimpleToast();
  const canCreate = permissions.includes('materials.create');
  const canUpdate = permissions.includes('materials.update');
  const canDelete = permissions.includes('materials.delete');

  const [items, setItems] = useState<WorkMaterialDto[]>([]);
  const [loading, setLoading] = useState(true);

  // A obra atual não expõe companyId no DTO do frontend, então o modal de criação
  // deixa o usuário escolher a empresa (com fallback para a única/primeira disponível),
  // consistente com a realidade atual de single-company-per-tenant da aplicação.
  const [companies, setCompanies] = useState<Company[]>([]);
  const [catalog, setCatalog] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkMaterialDto | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkMaterialDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Cadastro do catálogo dentro do próprio modal de "Adicionar Material".
  const [catalogMode, setCatalogMode] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Material | null>(null);
  const [catalogForm, setCatalogForm] = useState<CreateMaterialDto>(emptyCatalogForm);
  const [catalogSubmitted, setCatalogSubmitted] = useState(false);
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [catalogDeleteTarget, setCatalogDeleteTarget] = useState<Material | null>(null);
  const [catalogDeleting, setCatalogDeleting] = useState(false);

  // Histórico de transições por item (carregado sob demanda ao expandir).
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [historyData, setHistoryData] = useState<Record<string, WorkMaterialHistoryDto[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<string, boolean>>({});

  // Modal de transição de workflow (orçar/comprar/receber/consumir).
  const [action, setAction] = useState<{ type: ActionType; item: WorkMaterialDto } | null>(null);
  const [orcarForm, setOrcarForm] = useState<OrcarForm>(emptyOrcarForm);
  const [comprarForm, setComprarForm] = useState<ComprarForm>(emptyComprarForm);
  const [receberForm, setReceberForm] = useState<ReceberForm>(emptyReceberForm);
  const [consumirForm, setConsumirForm] = useState<ConsumirForm>(emptyConsumirForm);
  const [actionSaving, setActionSaving] = useState(false);
  const [actionSubmitted, setActionSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    WorkMaterialService.list(workId)
      .then((data) => { if (active) setItems(data); })
      .catch((e: unknown) => showToast(e instanceof Error ? e.message : 'Falha ao carregar materiais da obra', 'error'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workId]);

  useEffect(() => {
    CompanyService.list()
      .then((data) => setCompanies(data))
      .catch((e: unknown) => showToast(e instanceof Error ? e.message : 'Falha ao carregar empresas', 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCatalogFor(companyId: string) {
    if (!companyId) { setCatalog([]); setSuppliers([]); return; }
    setCatalogLoading(true);
    try {
      const [materialsData, suppliersData] = await Promise.all([
        MaterialService.list(companyId),
        SupplierService.list(companyId),
      ]);
      setCatalog(materialsData);
      setSuppliers(suppliersData);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar catálogo de materiais', 'error');
    } finally {
      setCatalogLoading(false);
    }
  }

  // Garante que a lista de fornecedores esteja disponível para o modal de "Orçar",
  // reaproveitando o mesmo carregamento usado pelo modal de criação.
  async function ensureSuppliersLoaded() {
    if (suppliers.length > 0 || catalogLoading) return;
    const defaultCompanyId = companies.length > 0 ? companies[0].id : '';
    if (defaultCompanyId) await loadCatalogFor(defaultCompanyId);
  }

  const totalItems = items.length;
  const totalCost = useMemo(() => items.reduce((sum, i) => sum + i.totalPrice, 0), [items]);

  const supplierOptions = useMemo(() => suppliers.map((s) => ({ value: s.id, label: s.name })), [suppliers]);
  const materialOptions = useMemo(() => catalog.map((m) => ({ value: m.id, label: materialLabel(m) })), [catalog]);
  const companyOptions = useMemo(() => companies.map((c) => ({ value: c.id, label: c.name })), [companies]);
  const selectedCatalogMaterial = catalog.find((m) => m.id === form.materialId);

  function openCreate() {
    setEditingItem(null);
    setFormSubmitted(false);
    setCatalogMode(false);
    const defaultCompanyId = companies.length > 0 ? companies[0].id : '';
    setForm({ ...emptyForm, companyId: defaultCompanyId });
    if (defaultCompanyId) loadCatalogFor(defaultCompanyId);
    setShowForm(true);
  }

  function openEdit(item: WorkMaterialDto) {
    setEditingItem(item);
    setFormSubmitted(false);
    setCatalogMode(false);
    const defaultCompanyId = companies.length > 0 ? companies[0].id : '';
    setForm({
      companyId: defaultCompanyId,
      materialId: item.materialId,
      supplierId: item.supplierId ?? '',
      quantity: String(item.quantity),
      unitPrice: currencyToInput(item.unitPrice),
      notes: item.notes ?? '',
    });
    if (defaultCompanyId) loadCatalogFor(defaultCompanyId);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setCatalogMode(false);
  }

  function handleCompanyChange(companyId: string) {
    setForm((f) => ({ ...f, companyId, materialId: '', supplierId: '' }));
    loadCatalogFor(companyId);
  }

  function formErrors(): Errors {
    const errors: Errors = {};
    const quantity = parseQuantity(form.quantity);
    const unitPrice = parseCurrencyToNumber(form.unitPrice);
    if (!editingItem && !form.materialId) errors.materialId = 'Selecione um material';
    if (!form.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) errors.quantity = 'Informe uma quantidade válida';
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) errors.unitPrice = 'Informe um preço unitário válido';
    return errors;
  }

  async function submitForm() {
    setFormSubmitted(true);
    if (Object.keys(formErrors()).length > 0) return;
    const quantity = parseQuantity(form.quantity);
    const unitPrice = parseCurrencyToNumber(form.unitPrice);

    setSaving(true);
    try {
      if (!editingItem) {
        const created = await WorkMaterialService.create(workId, {
          materialId: form.materialId,
          supplierId: form.supplierId || undefined,
          quantity,
          unitPrice,
          notes: form.notes.trim() || undefined,
        });
        setItems((prev) => [created, ...prev]);
        showToast('Material adicionado à obra', 'success');
      } else {
        const updated = await WorkMaterialService.update(workId, editingItem.id, {
          supplierId: form.supplierId || undefined,
          quantity,
          unitPrice,
          notes: form.notes.trim() || undefined,
        });
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        showToast('Material atualizado', 'success');
      }
      closeForm();
      setForm(emptyForm);
      setEditingItem(null);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar material', 'error');
    } finally {
      setSaving(false);
    }
  }

  function openCatalogForm(material: Material | null) {
    setEditingCatalog(material);
    setCatalogSubmitted(false);
    setCatalogForm(material
      ? {
        name: material.name || '',
        unit: material.unit || '',
        category: material.category || '',
        brand: material.brand || '',
        description: material.description || '',
        defaultSupplierId: material.defaultSupplierId,
      }
      : emptyCatalogForm);
    setCatalogMode(true);
  }

  function catalogErrors(): Errors {
    const errors: Errors = {};
    if (!catalogForm.name.trim()) errors.name = 'Informe o nome';
    if (!catalogForm.unit) errors.unit = 'Selecione a unidade';
    return errors;
  }

  async function submitCatalog() {
    setCatalogSubmitted(true);
    if (Object.keys(catalogErrors()).length > 0) return;
    if (!form.companyId) { showToast('Selecione uma empresa', 'error'); return; }
    const payload: CreateMaterialDto = {
      ...catalogForm,
      name: catalogForm.name.trim(),
      brand: catalogForm.brand?.trim() || undefined,
      description: catalogForm.description?.trim() || undefined,
      category: catalogForm.category || undefined,
    };
    setCatalogSaving(true);
    try {
      if (editingCatalog) {
        await MaterialService.update(form.companyId, editingCatalog.id, payload);
        showToast('Material atualizado no catálogo', 'success');
        await loadCatalogFor(form.companyId);
      } else {
        const created = await MaterialService.create(form.companyId, payload);
        showToast('Material criado no catálogo', 'success');
        await loadCatalogFor(form.companyId);
        setForm((f) => ({ ...f, materialId: created.id }));
      }
      setCatalogMode(false);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar material', 'error');
    } finally {
      setCatalogSaving(false);
    }
  }

  async function handleCatalogDelete() {
    if (!catalogDeleteTarget || !form.companyId) return;
    const target = catalogDeleteTarget;
    setCatalogDeleting(true);
    try {
      await MaterialService.delete(form.companyId, target.id);
      showToast('Material removido do catálogo', 'success');
      setForm((f) => (f.materialId === target.id ? { ...f, materialId: '' } : f));
      setCatalogDeleteTarget(null);
      await loadCatalogFor(form.companyId);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao remover material do catálogo', 'error');
    } finally {
      setCatalogDeleting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const item = deleteTarget;
    setDeleting(true);
    try {
      await WorkMaterialService.delete(workId, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast('Material removido', 'success');
      setDeleteTarget(null);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao remover material', 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function toggleHistory(item: WorkMaterialDto) {
    const isOpen = !!expandedHistory[item.id];
    setExpandedHistory((prev) => ({ ...prev, [item.id]: !isOpen }));
    if (!isOpen && !historyData[item.id]) {
      setHistoryLoading((prev) => ({ ...prev, [item.id]: true }));
      try {
        const data = await WorkMaterialService.getHistory(workId, item.id);
        setHistoryData((prev) => ({ ...prev, [item.id]: data }));
      } catch (e: unknown) {
        showToast(e instanceof Error ? e.message : 'Falha ao carregar histórico', 'error');
      } finally {
        setHistoryLoading((prev) => ({ ...prev, [item.id]: false }));
      }
    }
  }

  function openAction(type: ActionType, item: WorkMaterialDto) {
    setAction({ type, item });
    setActionSubmitted(false);
    if (type === 'orcar') {
      setOrcarForm({ unitPrice: '', supplierId: item.supplierId ?? '' });
      ensureSuppliersLoaded();
    } else if (type === 'comprar') {
      setComprarForm({ orderNumber: '', unitPrice: item.budgetedUnitPrice ? currencyToInput(item.budgetedUnitPrice) : '', expectedDeliveryDate: '' });
    } else if (type === 'receber') {
      setReceberForm({ receivedQuantity: String(item.quantity), invoiceNumber: '' });
    } else {
      setConsumirForm(emptyConsumirForm);
    }
  }

  function closeAction() {
    setAction(null);
  }

  function updateItem(updated: WorkMaterialDto) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function actionErrors(): Errors {
    const errors: Errors = {};
    if (!action) return errors;
    if (action.type === 'orcar') {
      if (parseCurrencyToNumber(orcarForm.unitPrice) <= 0) errors.unitPrice = 'Informe um preço orçado válido';
    } else if (action.type === 'comprar') {
      if (!comprarForm.orderNumber.trim()) errors.orderNumber = 'Informe o número do pedido';
      if (parseCurrencyToNumber(comprarForm.unitPrice) <= 0) errors.unitPrice = 'Informe um preço fechado válido';
    } else if (action.type === 'receber') {
      const q = parseQuantity(receberForm.receivedQuantity);
      if (!receberForm.receivedQuantity.trim() || !Number.isFinite(q) || q <= 0) errors.receivedQuantity = 'Informe uma quantidade recebida válida';
    } else {
      const q = parseQuantity(consumirForm.quantity);
      if (!consumirForm.quantity.trim() || !Number.isFinite(q) || q <= 0) {
        errors.quantity = 'Informe uma quantidade a consumir válida';
      } else if (action.item.availableQuantity != null && q > action.item.availableQuantity) {
        errors.quantity = `Quantidade maior que o saldo disponível (${action.item.availableQuantity} ${action.item.materialUnit})`;
      }
    }
    return errors;
  }

  async function submitAction() {
    if (!action) return;
    setActionSubmitted(true);
    if (Object.keys(actionErrors()).length > 0) return;
    const { type, item } = action;
    setActionSaving(true);
    try {
      let updated: WorkMaterialDto;
      let message: string;
      if (type === 'orcar') {
        updated = await WorkMaterialService.orcar(workId, item.id, {
          unitPrice: parseCurrencyToNumber(orcarForm.unitPrice),
          supplierId: orcarForm.supplierId || undefined,
        });
        message = 'Material orçado';
      } else if (type === 'comprar') {
        updated = await WorkMaterialService.comprar(workId, item.id, {
          orderNumber: comprarForm.orderNumber.trim(),
          unitPrice: parseCurrencyToNumber(comprarForm.unitPrice),
          expectedDeliveryDate: comprarForm.expectedDeliveryDate || undefined,
        });
        message = 'Compra registrada';
      } else if (type === 'receber') {
        updated = await WorkMaterialService.receber(workId, item.id, {
          receivedQuantity: parseQuantity(receberForm.receivedQuantity),
          invoiceNumber: receberForm.invoiceNumber.trim() || undefined,
        });
        message = 'Recebimento registrado';
      } else {
        updated = await WorkMaterialService.consumir(workId, item.id, {
          quantity: parseQuantity(consumirForm.quantity),
          notes: consumirForm.notes.trim() || undefined,
        });
        message = 'Consumo registrado';
      }
      updateItem(updated);
      showToast(message, 'success');
      // Histórico do item pode ter mudado — invalida cache para recarregar na próxima expansão.
      setHistoryData((prev) => { const next = { ...prev }; delete next[item.id]; return next; });
      closeAction();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao registrar ação', 'error');
    } finally {
      setActionSaving(false);
    }
  }

  function primaryAction(item: WorkMaterialDto): { type: ActionType; label: string } | null {
    switch (item.status) {
      case 'Necessidade': return { type: 'orcar', label: 'Orçar' };
      case 'Orcado': return { type: 'comprar', label: 'Comprar' };
      case 'Comprado': return { type: 'receber', label: 'Receber' };
      case 'Recebido':
      case 'Consumindo': return { type: 'consumir', label: 'Registrar Consumo' };
      default: return null;
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink3, #7A7670)', fontFamily: 'DM Sans' }}>
        Carregando materiais…
      </div>
    );
  }

  const errs = formSubmitted ? formErrors() : {};
  const catErrs = catalogSubmitted ? catalogErrors() : {};
  const actErrs = actionSubmitted ? actionErrors() : {};
  const itemSubtitle = action && (
    <><Package size={14} /> {action.item.materialName} ({action.item.materialUnit})</>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="wm">
        <div className="wm-summary">
          <div className="wm-summary-card">
            <div className="wm-summary-icon" style={{ background: '#FFF3E0' }}>
              <Boxes size={16} color="#E67E22" />
            </div>
            <div>
              <div className="wm-summary-val">{totalItems}</div>
              <div className="wm-summary-label">Total de Itens</div>
            </div>
          </div>
          <div className="wm-summary-card">
            <div className="wm-summary-icon" style={{ background: '#FDEDEC' }}>
              <DollarSign size={16} color="#C0392B" />
            </div>
            <div>
              <div className="wm-summary-val">{formatCurrency(totalCost)}</div>
              <div className="wm-summary-label">Custo Total</div>
            </div>
          </div>
        </div>

        <div className="wm-toolbar">
          <div style={{ flex: 1 }} />
          {canCreate && (
            <button type="button" className="wm-btn primary" onClick={openCreate}>
              <Plus size={14} /> Adicionar Material
            </button>
          )}
        </div>

        <div className="wm-card">
          {items.length === 0 ? (
            <div className="wm-empty">Nenhum material registrado nesta obra.</div>
          ) : (
            <table className="wm-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unidade</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Total</th>
                  <th>Fornecedor</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const cfg = statusConfig(item.status);
                  const nextAction = primaryAction(item);
                  const canFreeEdit = item.status === 'Necessidade';
                  const isHistoryOpen = !!expandedHistory[item.id];
                  const history = historyData[item.id];
                  const isHistoryLoading = !!historyLoading[item.id];
                  return (
                    <Fragment key={item.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.25 }}
                      >
                        <td>{item.materialName}</td>
                        <td>{item.materialUnit}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td className="wm-num">{formatCurrency(item.totalPrice)}</td>
                        <td>{item.supplierName || '—'}</td>
                        <td>
                          <span className="wm-pill" style={{ background: cfg.bg, color: cfg.color }}>● {cfg.label}</span>
                          {item.receivedQuantity != null && (
                            <div className="wm-progress">
                              <span className="wm-progress-value">{item.consumedQuantity}</span> de <span className="wm-progress-value">{item.receivedQuantity}</span> consumidos
                            </div>
                          )}
                          <button type="button" className="wm-history-toggle" onClick={() => toggleHistory(item)} style={{ marginTop: 6 }}>
                            <History size={11} /> Histórico {isHistoryOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="wm-row-actions">
                            <div className="wm-row-actions-top">
                              {canFreeEdit && canUpdate && (
                                <button type="button" className="wm-btn wm-btn-sm" title="Editar" aria-label="Editar material da obra" onClick={() => openEdit(item)}><Pencil size={11} /></button>
                              )}
                              {canFreeEdit && canDelete && (
                                <button type="button" className="wm-btn danger wm-btn-sm" title="Remover" aria-label="Remover material da obra" onClick={() => setDeleteTarget(item)}><Trash2 size={11} /></button>
                              )}
                            </div>
                            {nextAction && canUpdate && (
                              <button type="button" className="wm-btn primary wm-btn-sm" onClick={() => openAction(nextAction.type, item)}>
                                {nextAction.label}
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {isHistoryOpen && (
                          <tr className="wm-history-row">
                            <td colSpan={8}>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div className="wm-history-title">Histórico</div>
                                {isHistoryLoading && <div className="wm-history-empty">Carregando histórico…</div>}
                                {!isHistoryLoading && history && history.length === 0 && (
                                  <div className="wm-history-empty">Nenhuma transição registrada.</div>
                                )}
                                {!isHistoryLoading && history && history.map((h) => (
                                  <div key={h.id} className="wm-history-item">
                                    <div className="wm-history-dot" />
                                    <div className="wm-history-info">
                                      <div className="wm-history-action">
                                        {statusConfig(h.fromStatus).label} → {statusConfig(h.toStatus).label}
                                      </div>
                                      <div className="wm-history-user">{h.changedBy}</div>
                                      {h.notes && <div className="wm-history-notes">"{h.notes}"</div>}
                                    </div>
                                    <div className="wm-history-date">{formatDate(h.changedAt)}</div>
                                  </div>
                                ))}
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <LdModal
        open={showForm && !catalogMode}
        title={editingItem ? 'Editar Material da Obra' : 'Adicionar Material'}
        subtitle={editingItem ? <><Package size={14} /> {editingItem.materialName} ({editingItem.materialUnit})</> : 'Escolha um material do catálogo ou cadastre um novo.'}
        onClose={closeForm}
        busy={saving}
        confirmLabel={editingItem ? 'Salvar alterações' : 'Adicionar'}
        onConfirm={submitForm}
      >
        {!editingItem && companies.length > 1 && (
          <div className="ldm-field">
            <label className="ldm-label">Empresa</label>
            <LdSelect
              value={form.companyId}
              onChange={handleCompanyChange}
              options={companyOptions}
              placeholder="Selecione uma empresa"
            />
          </div>
        )}

        {!editingItem && (
          <div className="ldm-field">
            <label className="ldm-label">Material *</label>
            <div className="wm-select-row">
              <LdSelect
                value={form.materialId}
                onChange={(v) => setForm({ ...form, materialId: v })}
                options={materialOptions}
                placeholder={catalogLoading ? 'Carregando…' : 'Selecione um material'}
                disabled={catalogLoading || !form.companyId}
                searchable
              />
              {canCreate && (
                <button type="button" className="ldm-btn outline-gold" disabled={!form.companyId || catalogLoading} onClick={() => openCatalogForm(null)}>
                  <Plus size={13} /> Novo
                </button>
              )}
            </div>
            <FieldError message={errs.materialId} />
            {selectedCatalogMaterial && (canUpdate || canDelete) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {canUpdate && (
                  <button type="button" className="ldm-btn sm" onClick={() => openCatalogForm(selectedCatalogMaterial)}>
                    <Pencil size={11} /> Editar no catálogo
                  </button>
                )}
                {canDelete && (
                  <button type="button" className="ldm-btn danger sm" onClick={() => setCatalogDeleteTarget(selectedCatalogMaterial)}>
                    <Trash2 size={11} /> Excluir do catálogo
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="ldm-field">
          <label className="ldm-label">Fornecedor</label>
          <LdSelect
            value={form.supplierId}
            onChange={(v) => setForm({ ...form, supplierId: v })}
            options={supplierOptions}
            placeholder="Nenhum"
            disabled={catalogLoading || (!editingItem && !form.companyId)}
          />
        </div>

        <div className="ldm-grid">
          <div className="ldm-field">
            <label className="ldm-label">Quantidade *</label>
            <input
              className={`ldm-input${errs.quantity ? ' invalid' : ''}`}
              inputMode="decimal"
              placeholder="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <FieldError message={errs.quantity} />
          </div>
          <div className="ldm-field">
            <label className="ldm-label">Preço unitário (R$) *</label>
            <div className="ldm-currency">
              <span>R$</span>
              <input
                className={`ldm-input${errs.unitPrice ? ' invalid' : ''}`}
                inputMode="decimal"
                placeholder="0,00"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: formatCurrencyInput(e.target.value) })}
              />
            </div>
            <FieldError message={errs.unitPrice} />
          </div>
        </div>

        <div className="ldm-field">
          <label className="ldm-label">Observações</label>
          <textarea
            className="ldm-textarea"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Observações opcionais"
          />
        </div>
      </LdModal>

      <LdModal
        open={showForm && catalogMode}
        title={editingCatalog ? 'Editar Material do Catálogo' : 'Novo Material'}
        subtitle={editingCatalog ? `Código ${editingCatalog.code}` : 'O código é gerado automaticamente.'}
        onClose={() => setCatalogMode(false)}
        busy={catalogSaving}
        cancelLabel="Voltar"
        confirmLabel="Salvar material"
        onConfirm={submitCatalog}
      >
        <div className="ldm-field">
          <label className="ldm-label">Nome *</label>
          <input
            className={`ldm-input${catErrs.name ? ' invalid' : ''}`}
            value={catalogForm.name}
            onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
            placeholder="Nome do material"
          />
          <FieldError message={catErrs.name} />
        </div>
        <div className="ldm-grid">
          <div className="ldm-field">
            <label className="ldm-label">Unidade *</label>
            <LdSelect
              value={catalogForm.unit}
              onChange={(v) => setCatalogForm({ ...catalogForm, unit: v })}
              options={UNIT_OPTIONS}
              placeholder="Selecione a unidade"
            />
            <FieldError message={catErrs.unit} />
          </div>
          <div className="ldm-field">
            <label className="ldm-label">Categoria</label>
            <LdSelect
              value={catalogForm.category || ''}
              onChange={(v) => setCatalogForm({ ...catalogForm, category: v })}
              options={CATEGORY_OPTIONS}
              placeholder="Selecione a categoria"
            />
          </div>
        </div>
        <div className="ldm-field">
          <label className="ldm-label">Marca</label>
          <input
            className="ldm-input"
            value={catalogForm.brand || ''}
            onChange={(e) => setCatalogForm({ ...catalogForm, brand: e.target.value })}
            placeholder="Ex.: Votoran"
          />
        </div>
        <div className="ldm-field">
          <label className="ldm-label">Fornecedor padrão</label>
          <LdSelect
            value={catalogForm.defaultSupplierId || ''}
            onChange={(v) => setCatalogForm({ ...catalogForm, defaultSupplierId: v || undefined })}
            options={supplierOptions}
            placeholder="Nenhum"
          />
        </div>
        <div className="ldm-field">
          <label className="ldm-label">Descrição</label>
          <textarea
            className="ldm-textarea"
            value={catalogForm.description || ''}
            onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })}
            placeholder="Observações sobre o material"
          />
        </div>
      </LdModal>

      <LdModal
        open={!!action}
        title={action ? ACTION_TEXT[action.type].title : ''}
        subtitle={itemSubtitle}
        onClose={closeAction}
        busy={actionSaving}
        confirmLabel={action ? ACTION_TEXT[action.type].confirm : ''}
        onConfirm={submitAction}
      >
        {action?.type === 'orcar' && (
          <>
            <div className="ldm-field">
              <label className="ldm-label">Preço unitário orçado (R$) *</label>
              <div className="ldm-currency">
                <span>R$</span>
                <input
                  className={`ldm-input${actErrs.unitPrice ? ' invalid' : ''}`}
                  inputMode="decimal"
                  placeholder="0,00"
                  value={orcarForm.unitPrice}
                  onChange={(e) => setOrcarForm({ ...orcarForm, unitPrice: formatCurrencyInput(e.target.value) })}
                />
              </div>
              <FieldError message={actErrs.unitPrice} />
            </div>
            <div className="ldm-field">
              <label className="ldm-label">Fornecedor</label>
              <LdSelect
                value={orcarForm.supplierId}
                onChange={(v) => setOrcarForm({ ...orcarForm, supplierId: v })}
                options={supplierOptions}
                placeholder="Nenhum"
                disabled={catalogLoading}
              />
            </div>
          </>
        )}

        {action?.type === 'comprar' && (
          <>
            <div className="ldm-field">
              <label className="ldm-label">Número do pedido *</label>
              <input
                className={`ldm-input${actErrs.orderNumber ? ' invalid' : ''}`}
                value={comprarForm.orderNumber}
                onChange={(e) => setComprarForm({ ...comprarForm, orderNumber: e.target.value })}
                placeholder="Ex.: PED-2026-0042"
              />
              <FieldError message={actErrs.orderNumber} />
            </div>
            <div className="ldm-field">
              <label className="ldm-label">Preço fechado (R$) *</label>
              <div className="ldm-currency">
                <span>R$</span>
                <input
                  className={`ldm-input${actErrs.unitPrice ? ' invalid' : ''}`}
                  inputMode="decimal"
                  placeholder="0,00"
                  value={comprarForm.unitPrice}
                  onChange={(e) => setComprarForm({ ...comprarForm, unitPrice: formatCurrencyInput(e.target.value) })}
                />
              </div>
              <FieldError message={actErrs.unitPrice} />
            </div>
            <div className="ldm-field">
              <label className="ldm-label">Previsão de entrega</label>
              <LdDateInput
                value={comprarForm.expectedDeliveryDate}
                onChange={(v) => setComprarForm({ ...comprarForm, expectedDeliveryDate: v })}
                min={todayYMD()}
              />
            </div>
          </>
        )}

        {action?.type === 'receber' && (
          <>
            <div className="ldm-field">
              <label className="ldm-label">Quantidade recebida *</label>
              <input
                className={`ldm-input${actErrs.receivedQuantity ? ' invalid' : ''}`}
                inputMode="decimal"
                placeholder="0"
                value={receberForm.receivedQuantity}
                onChange={(e) => setReceberForm({ ...receberForm, receivedQuantity: e.target.value })}
              />
              <FieldError message={actErrs.receivedQuantity} />
            </div>
            <div className="ldm-field">
              <label className="ldm-label">Nota fiscal</label>
              <input
                className="ldm-input"
                value={receberForm.invoiceNumber}
                onChange={(e) => setReceberForm({ ...receberForm, invoiceNumber: e.target.value })}
                placeholder="Número da nota fiscal (opcional)"
              />
            </div>
          </>
        )}

        {action?.type === 'consumir' && (
          <>
            <div className="ldm-field">
              <label className="ldm-label">Quantidade a consumir *</label>
              <input
                className={`ldm-input${actErrs.quantity ? ' invalid' : ''}`}
                inputMode="decimal"
                placeholder="0"
                value={consumirForm.quantity}
                onChange={(e) => setConsumirForm({ ...consumirForm, quantity: e.target.value })}
              />
              <FieldError message={actErrs.quantity} />
              {action.item.availableQuantity != null && (
                <div className="ldm-hint">Saldo disponível: {action.item.availableQuantity} {action.item.materialUnit}</div>
              )}
            </div>
            <div className="ldm-field">
              <label className="ldm-label">Observações</label>
              <textarea
                className="ldm-textarea"
                value={consumirForm.notes}
                onChange={(e) => setConsumirForm({ ...consumirForm, notes: e.target.value })}
                placeholder="Observações opcionais"
              />
            </div>
          </>
        )}
      </LdModal>

      <LdConfirmDialog
        open={!!deleteTarget}
        title="Remover material da obra?"
        description={<><strong>{deleteTarget?.materialName}</strong> será removido desta obra. Esta ação não pode ser desfeita.</>}
        confirmLabel="Remover"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <LdConfirmDialog
        open={!!catalogDeleteTarget}
        title="Excluir material do catálogo?"
        description={<><strong>{catalogDeleteTarget?.name}</strong> será removido do catálogo. Esta ação não pode ser desfeita.</>}
        loading={catalogDeleting}
        onConfirm={handleCatalogDelete}
        onCancel={() => setCatalogDeleteTarget(null)}
      />
    </>
  );
}
