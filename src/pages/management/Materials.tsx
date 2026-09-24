import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { LdConfirmDialog } from '@/components/LdConfirmDialog';
import { MaterialService, SupplierService, CompanyService } from '@/services/managementService';
import { Material, CreateMaterialDto, UpdateMaterialDto, Supplier, Company, MaterialUnit, MaterialCategory } from '@/types/management';
import { Plus, Pencil, Trash2, Boxes, RefreshCw, Building2 } from 'lucide-react';

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream2:#EDE9E1;--gold-light:#F0E4C4;}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:9.5px;font-weight:500;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:4px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.5vw,24px);font-weight:700;line-height:1.15;letter-spacing:-0.3px;color:var(--ink);}
.ld-sub{font-size:12px;color:var(--ink3);font-weight:300;}
.ld-card{background:var(--card-bg, #fff);border-radius:10px;border:1px solid var(--bdr);box-shadow:0 2px 12px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:14px 16px;}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:13.5px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px;margin-bottom:10px;}
.ld-table{width:100%;border-collapse:collapse;font-size:12.5px;}
.ld-table thead th{text-align:left;font-size:10px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:var(--ink3);padding:8px 10px;border-bottom:1px solid var(--bdr);background:rgb(var(--cream-rgb, 247 244 239) / 0.4);}
.ld-table tbody td{padding:9px 10px;border-bottom:1px solid rgba(26,24,20,0.05);color:var(--ink2);}
.ld-table tbody tr:hover{background:rgb(var(--cream-rgb, 247 244 239) / 0.3);}
.ld-table tbody td:first-child{font-weight:500;color:var(--ink);}
.ld-field{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}
.ld-lbl{font-size:11px;font-weight:500;color:var(--ink2);}
.ld-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.18s;}
.ld-btn-dark{background:var(--brand-dark);color:#fff;}
.ld-btn-dark:hover:not(:disabled){background:var(--brand-gold);}
.ld-btn-outline{background:var(--card-bg, #fff);color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-btn-sm{padding:4px 8px;font-size:11px;}
.ld-btn-danger{background:var(--card-bg, #fff);color:#C0392B;border:1px solid rgba(192,57,43,0.15);}
.ld-btn-danger:hover{background:#FDEDEC;}
.ld-btn:disabled{opacity:0.4;cursor:not-allowed;}
.ld-empty{text-align:center;padding:28px 0;color:var(--ink3);font-size:12.5px;}
@keyframes ld-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.3s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.3s cubic-bezier(0.22,1,0.36,1) 0.06s both;}
`;

const emptyForm: CreateMaterialDto = { name: '', unit: '', category: '', brand: '', description: '', defaultSupplierId: undefined };

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

export function Materials() {
  const { showToast } = useSimpleToast();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState<CreateMaterialDto>(emptyForm);

  async function loadCompanies() {
    try {
      const data = await CompanyService.list();
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) setSelectedCompanyId(data[0].id);
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Falha ao carregar empresas', 'error'); }
  }

  async function loadMaterials() {
    if (!selectedCompanyId) { setMaterials([]); return; }
    setLoading(true);
    try {
      const [materialsData, suppliersData] = await Promise.all([
        MaterialService.list(selectedCompanyId),
        SupplierService.list(selectedCompanyId),
      ]);
      setMaterials(materialsData);
      setSuppliers(suppliersData);
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Falha ao carregar materiais', 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCompanies(); }, []);
  useEffect(() => { loadMaterials(); }, [selectedCompanyId]);

  function supplierName(id?: string): string {
    if (!id) return '—';
    return suppliers.find((s) => s.id === id)?.name ?? '—';
  }

  function unitLabel(unit?: string): string {
    if (!unit) return '—';
    return UNIT_OPTIONS.find((u) => u.value === unit)?.label ?? unit;
  }

  function categoryLabel(category?: string): string {
    if (!category) return '—';
    return CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category;
  }

  function openCreate() {
    if (!selectedCompanyId) { showToast('Selecione uma empresa primeiro', 'error'); return; }
    setEditingMaterial(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEdit(m: Material) {
    setEditingMaterial(m);
    setForm({ name: m.name || '', unit: m.unit || '', category: m.category || '', brand: m.brand || '', description: m.description || '', defaultSupplierId: m.defaultSupplierId });
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!selectedCompanyId) { showToast('Selecione uma empresa primeiro', 'error'); return; }
    try {
      if (!form.name) { showToast('Preencha o Nome', 'error'); return; }
      if (!form.unit) { showToast('Preencha a Unidade', 'error'); return; }
      if (!editingMaterial) {
        await MaterialService.create(selectedCompanyId, form);
        showToast('Material criado com sucesso', 'success');
      } else {
        await MaterialService.update(selectedCompanyId, editingMaterial.id, form as UpdateMaterialDto);
        showToast('Material atualizado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadMaterials();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error'); }
  }

  async function handleDelete() {
    if (!selectedCompanyId || !deleteTarget) return;
    setDeleting(true);
    try {
      await MaterialService.delete(selectedCompanyId, deleteTarget.id);
      showToast('Material excluído com sucesso', 'success');
      setDeleteTarget(null);
      loadMaterials();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error'); }
    finally { setDeleting(false); }
  }

  return (
    <>
      <style>{LDCSS}</style>
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span className="ld-tag">Gestão</span>
            <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Boxes size={17} color="var(--gold)" /> Materiais
            </h1>
            <p className="ld-sub" style={{ marginTop: 2 }}>Gerencie o catálogo de materiais cadastrados</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="ld-btn ld-btn-outline" onClick={loadMaterials} disabled={!selectedCompanyId}><RefreshCw size={12} /> Atualizar</button>
            <button className="ld-btn ld-btn-dark" onClick={openCreate} disabled={!selectedCompanyId}><Plus size={12} /> Novo Material</button>
          </div>
        </div>

        <div className="ld-card ld-a2">
          <div className="ld-card-body">
            <h2 className="ld-h2"><Building2 size={12} color="var(--gold)" /> Empresa</h2>
            <div className="ld-field" style={{ marginBottom: 0 }}>
              <Select value={selectedCompanyId || ''} onValueChange={(v) => setSelectedCompanyId(v)}>
                <SelectTrigger><SelectValue placeholder="Selecione uma empresa" /></SelectTrigger>
                <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="ld-card ld-a2">
          <div className="ld-card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="ld-empty"><RefreshCw size={18} color="var(--gold)" className="animate-spin" style={{ margin: '0 auto 6px', display: 'block' }} />Carregando...</div>
            ) : !selectedCompanyId ? (
              <div className="ld-empty">Selecione uma empresa para visualizar os materiais</div>
            ) : materials.length === 0 ? (
              <div className="ld-empty">Nenhum material encontrado</div>
            ) : (
              <table className="ld-table">
                <thead><tr><th>Código</th><th>Nome</th><th>Unidade</th><th>Categoria</th><th>Fornecedor Padrão</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11.5, color: 'var(--ink3)' }}>{m.code}</td>
                      <td>
                        {m.name}
                        {m.brand ? <span style={{ color: 'var(--ink3)', fontWeight: 300 }}> — {m.brand}</span> : null}
                      </td>
                      <td>{unitLabel(m.unit)}</td>
                      <td>{categoryLabel(m.category)}</td>
                      <td>{supplierName(m.defaultSupplierId)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          <button className="ld-btn ld-btn-outline ld-btn-sm" onClick={() => openEdit(m)}><Pencil size={10} /></button>
                          <button className="ld-btn ld-btn-danger ld-btn-sm" onClick={() => setDeleteTarget(m)}><Trash2 size={10} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Editar Material' : 'Novo Material'}
              </DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="ld-field"><label className="ld-lbl">Nome *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do material" /></div>
              {editingMaterial ? (
                <div className="ld-field"><label className="ld-lbl">Código</label><Input value={editingMaterial.code} disabled readOnly /></div>
              ) : null}
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="ld-field" style={{ flex: 1 }}>
                  <label className="ld-lbl">Unidade *</label>
                  <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                    <SelectContent>{UNIT_OPTIONS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="ld-field" style={{ flex: 1 }}>
                  <label className="ld-lbl">Categoria</label>
                  <Select value={form.category || ''} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    <SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="ld-field"><label className="ld-lbl">Marca</label><Input value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ex.: Votoran" /></div>
              <div className="ld-field">
                <label className="ld-lbl">Fornecedor Padrão</label>
                <Select value={form.defaultSupplierId || ''} onValueChange={(v) => setForm({ ...form, defaultSupplierId: v || undefined })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="ld-field"><label className="ld-lbl">Descrição</label><Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Observações sobre o material" rows={3} /></div>
            </div>
            <DialogFooter style={{ marginTop: 4 }}>
              <button className="ld-btn ld-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="ld-btn ld-btn-dark" onClick={handleSubmit}>Salvar</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <LdConfirmDialog
          open={!!deleteTarget}
          title="Excluir material?"
          description={<>O material <strong>{deleteTarget?.name}</strong> será removido do catálogo. Esta ação não pode ser desfeita.</>}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </>
  );
}
