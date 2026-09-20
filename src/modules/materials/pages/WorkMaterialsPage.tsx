import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, DollarSign, Plus, Pencil, Trash2, X, Package } from 'lucide-react';
import { WorkMaterialService } from '@/services/works';
import type { WorkMaterialDto } from '@/services/works';
import { MaterialService, SupplierService, CompanyService } from '@/services/managementService';
import type { Material, Supplier, Company } from '@/types/management';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleToast } from '@/hooks/useSimpleToast';

const CSS = `
.wm{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.wm-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;}
.wm-summary-card{background:var(--card-bg,#fff);border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(26,24,20,0.03);}
.wm-summary-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.wm-summary-val{font-family:var(--font-numeric);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.wm-summary-label{font-size:10.5px;color:var(--ink3,#7A7670);font-weight:500;text-transform:uppercase;letter-spacing:0.3px;}
.wm-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.wm-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:var(--card-bg,#fff);color:var(--ink,#1A1814);font-family:'DM Sans',sans-serif;transition:all 0.14s;}
.wm-btn:hover{background:var(--cream,#F7F4EF);}
.wm-btn.primary{background:var(--brand-gold);color:#fff;border-color:var(--brand-gold);}
.wm-btn.primary:hover{background:#a07e1f;}
.wm-btn.danger{background:var(--card-bg,#fff);color:#C0392B;border-color:rgba(192,57,43,0.15);}
.wm-btn.danger:hover{background:#FDEDEC;}
.wm-btn:disabled{opacity:0.5;cursor:not-allowed;}
.wm-btn-sm{padding:5px 9px;font-size:11px;}
.wm-card{background:var(--card-bg,#fff);border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:0;overflow:hidden;box-shadow:0 2px 10px rgba(26,24,20,0.04);}
.wm-table{width:100%;border-collapse:collapse;font-size:12.5px;}
.wm-table thead th{text-align:left;font-size:10px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:var(--ink3,#7A7670);padding:10px 14px;border-bottom:1px solid var(--bdr,rgba(26,24,20,0.10));background:var(--cream,#F7F4EF);}
.wm-table tbody td{padding:11px 14px;border-bottom:1px solid rgba(26,24,20,0.05);color:var(--ink2,#4A473F);}
.wm-table tbody tr:hover{background:rgba(184,146,42,0.03);}
.wm-table tbody td:first-child{font-weight:500;color:var(--ink,#1A1814);}
.wm-empty{text-align:center;padding:40px 0;color:var(--ink3,#7A7670);font-size:12.5px;}
.wm-modal{position:fixed;inset:0;background:rgba(26,24,20,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
.wm-modal-card{background:var(--card-bg,#fff);border-radius:14px;max-width:520px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.25);max-height:90vh;overflow-y:auto;}
.wm-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink,#1A1814);margin-bottom:16px;}
.wm-modal-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--ink3,#7A7670);margin-bottom:6px;display:block;}
.wm-modal-input,.wm-modal-select{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:14px;box-sizing:border-box;background:#fff;}
.wm-modal-textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;min-height:64px;box-sizing:border-box;resize:vertical;margin-bottom:14px;}
.wm-currency-wrap{position:relative;}
.wm-currency-wrap .wm-prefix{position:absolute;left:12px;top:10px;font-size:13px;font-weight:500;color:var(--ink3,#7A7670);pointer-events:none;}
.wm-currency-wrap .wm-modal-input{padding-left:36px;}
.wm-modal-actions{display:flex;gap:10px;justify-content:flex-end;}
`;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
}

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrencyToNumber(formatted: string): number {
  if (!formatted) return 0;
  const clean = formatted.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
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

  const totalItems = items.length;
  const totalCost = useMemo(() => items.reduce((sum, i) => sum + i.totalPrice, 0), [items]);

  function openCreate() {
    setEditingItem(null);
    const defaultCompanyId = companies.length > 0 ? companies[0].id : '';
    setForm({ ...emptyForm, companyId: defaultCompanyId });
    if (defaultCompanyId) loadCatalogFor(defaultCompanyId);
    setShowForm(true);
  }

  function openEdit(item: WorkMaterialDto) {
    setEditingItem(item);
    const defaultCompanyId = companies.length > 0 ? companies[0].id : '';
    setForm({
      companyId: defaultCompanyId,
      materialId: item.materialId,
      supplierId: item.supplierId ?? '',
      quantity: String(item.quantity),
      unitPrice: item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      notes: item.notes ?? '',
    });
    if (defaultCompanyId) loadCatalogFor(defaultCompanyId);
    setShowForm(true);
  }

  function handleCompanyChange(companyId: string) {
    setForm((f) => ({ ...f, companyId, materialId: '', supplierId: '' }));
    loadCatalogFor(companyId);
  }

  async function submitForm() {
    const quantity = Number(form.quantity.replace(',', '.'));
    const unitPrice = parseCurrencyToNumber(form.unitPrice);
    if (!editingItem && !form.materialId) { showToast('Selecione um material', 'error'); return; }
    if (!Number.isFinite(quantity) || quantity <= 0) { showToast('Informe uma quantidade válida', 'error'); return; }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) { showToast('Informe um preço unitário válido', 'error'); return; }

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
      setShowForm(false);
      setForm(emptyForm);
      setEditingItem(null);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar material', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: WorkMaterialDto) {
    if (!window.confirm(`Remover ${item.materialName} desta obra?`)) return;
    try {
      await WorkMaterialService.delete(workId, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast('Material removido', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao remover material', 'error');
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink3, #7A7670)', fontFamily: 'DM Sans' }}>
        Carregando materiais…
      </div>
    );
  }

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
            <button className="wm-btn primary" onClick={openCreate}>
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
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                  >
                    <td>{item.materialName}</td>
                    <td>{item.materialUnit}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ fontFamily: 'var(--font-numeric)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(item.totalPrice)}</td>
                    <td>{item.supplierName || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        {canUpdate && (
                          <button className="wm-btn wm-btn-sm" onClick={() => openEdit(item)}><Pencil size={11} /></button>
                        )}
                        {canDelete && (
                          <button className="wm-btn danger wm-btn-sm" onClick={() => handleDelete(item)}><Trash2 size={11} /></button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="wm-modal" onClick={() => setShowForm(false)}>
          <div className="wm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="wm-modal-title">
              {editingItem ? 'Editar Material da Obra' : 'Adicionar Material'}
            </div>

            {!editingItem && companies.length > 1 && (
              <>
                <label className="wm-modal-label">Empresa</label>
                <select
                  className="wm-modal-select"
                  value={form.companyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </>
            )}

            {!editingItem && (
              <>
                <label className="wm-modal-label">Material</label>
                <select
                  className="wm-modal-select"
                  value={form.materialId}
                  onChange={(e) => setForm({ ...form, materialId: e.target.value })}
                  disabled={catalogLoading || !form.companyId}
                >
                  <option value="">
                    {catalogLoading ? 'Carregando...' : 'Selecione um material'}
                  </option>
                  {catalog.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                  ))}
                </select>
              </>
            )}

            {editingItem && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'var(--ink3,#7A7670)', fontSize: 12.5 }}>
                <Package size={14} /> {editingItem.materialName} ({editingItem.materialUnit})
              </div>
            )}

            <label className="wm-modal-label">Fornecedor</label>
            <select
              className="wm-modal-select"
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              disabled={catalogLoading || !editingItem && !form.companyId}
            >
              <option value="">Nenhum</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="wm-modal-label">Quantidade</label>
                <input
                  className="wm-modal-input"
                  inputMode="decimal"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="wm-modal-label">Preço unitário (R$)</label>
                <div className="wm-currency-wrap">
                  <span className="wm-prefix">R$</span>
                  <input
                    className="wm-modal-input"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: formatCurrencyInput(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <label className="wm-modal-label">Observações</label>
            <textarea
              className="wm-modal-textarea"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Observações opcionais"
            />

            <div className="wm-modal-actions">
              <button className="wm-btn" onClick={() => setShowForm(false)}>
                <X size={14} /> Cancelar
              </button>
              <button className="wm-btn primary" onClick={submitForm} disabled={saving}>
                {editingItem ? 'Salvar alterações' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
