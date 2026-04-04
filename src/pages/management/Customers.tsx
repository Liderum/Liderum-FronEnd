import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { CustomerService, CompanyService } from '@/services/managementService';
import { Customer, CreateCustomerDto, UpdateCustomerDto, Company } from '@/types/management';
import { Plus, Pencil, Trash2, Users, RefreshCw, Building2 } from 'lucide-react';

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.10);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:9.5px;font-weight:500;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:4px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.5vw,24px);font-weight:700;line-height:1.15;letter-spacing:-0.3px;color:var(--ink);}
.ld-sub{font-size:12px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:10px;border:1px solid var(--bdr);box-shadow:0 2px 12px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:14px 16px;}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:13.5px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px;margin-bottom:10px;}
.ld-table{width:100%;border-collapse:collapse;font-size:12.5px;}
.ld-table thead th{text-align:left;font-size:10px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:var(--ink3);padding:8px 10px;border-bottom:1px solid var(--bdr);background:rgba(247,244,239,0.4);}
.ld-table tbody td{padding:9px 10px;border-bottom:1px solid rgba(26,24,20,0.05);color:var(--ink2);}
.ld-table tbody tr:hover{background:rgba(247,244,239,0.3);}
.ld-table tbody td:first-child{font-weight:500;color:var(--ink);}
.ld-field{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}
.ld-lbl{font-size:11px;font-weight:500;color:var(--ink2);}
.ld-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.18s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover:not(:disabled){background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-btn-sm{padding:4px 8px;font-size:11px;}
.ld-btn-danger{background:#fff;color:#C0392B;border:1px solid rgba(192,57,43,0.15);}
.ld-btn-danger:hover{background:#FDEDEC;}
.ld-btn:disabled{opacity:0.4;cursor:not-allowed;}
.ld-empty{text-align:center;padding:28px 0;color:var(--ink3);font-size:12.5px;}
@keyframes ld-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.3s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.3s cubic-bezier(0.22,1,0.36,1) 0.06s both;}
`;

export function Customers() {
  const { showToast } = useSimpleToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CreateCustomerDto>({ nome: '', documento: '', email: '' });

  async function loadCompanies() {
    try {
      const data = await CompanyService.list();
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) setSelectedCompanyId(data[0].id);
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Falha ao carregar empresas', 'error'); }
  }

  async function loadCustomers() {
    if (!selectedCompanyId) { setCustomers([]); return; }
    setLoading(true);
    try { setCustomers(await CustomerService.list(selectedCompanyId)); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Falha ao carregar clientes', 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCompanies(); }, []);
  useEffect(() => { loadCustomers(); }, [selectedCompanyId]);

  function openCreate() {
    if (!selectedCompanyId) { showToast('Selecione uma empresa primeiro', 'error'); return; }
    setEditingCustomer(null);
    setForm({ nome: '', documento: '', email: '' });
    setIsModalOpen(true);
  }

  function openEdit(c: Customer) {
    setEditingCustomer(c);
    setForm({ nome: c.nome || '', documento: c.documento || '', email: c.email || '' });
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!selectedCompanyId) { showToast('Selecione uma empresa primeiro', 'error'); return; }
    try {
      if (!form.nome || !form.documento) { showToast('Preencha Nome e Documento', 'error'); return; }
      if (!editingCustomer) {
        await CustomerService.create(selectedCompanyId, form);
        showToast('Cliente criado com sucesso', 'success');
      } else {
        const payload: UpdateCustomerDto = { ...form, rowVersion: editingCustomer.rowVersion };
        await CustomerService.update(selectedCompanyId, editingCustomer.id, payload);
        showToast('Cliente atualizado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error'); }
  }

  async function handleDelete(c: Customer) {
    if (!selectedCompanyId) return;
    if (!window.confirm(`Excluir cliente ${c.nome}?`)) return;
    try {
      await CustomerService.delete(selectedCompanyId, c.id);
      showToast('Cliente excluído com sucesso', 'success');
      loadCustomers();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error'); }
  }

  return (
    <>
      <style>{LDCSS}</style>
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span className="ld-tag">Gestão</span>
            <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={17} color="var(--gold)" /> Clientes
            </h1>
            <p className="ld-sub" style={{ marginTop: 2 }}>Gerencie os clientes cadastrados</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="ld-btn ld-btn-outline" onClick={loadCustomers} disabled={!selectedCompanyId}><RefreshCw size={12} /> Atualizar</button>
            <button className="ld-btn ld-btn-dark" onClick={openCreate} disabled={!selectedCompanyId}><Plus size={12} /> Novo Cliente</button>
          </div>
        </div>

        {/* Seletor de empresa */}
        <div className="ld-card ld-a2">
          <div className="ld-card-body">
            <h2 className="ld-h2"><Building2 size={12} color="var(--gold)" /> Empresa</h2>
            <div className="ld-field" style={{ marginBottom: 0 }}>
              <Select value={selectedCompanyId?.toString() || ''} onValueChange={(v) => setSelectedCompanyId(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Selecione uma empresa" /></SelectTrigger>
                <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razaoSocial}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="ld-card ld-a2">
          <div className="ld-card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="ld-empty"><RefreshCw size={18} color="var(--gold)" className="animate-spin" style={{ margin: '0 auto 6px', display: 'block' }} />Carregando...</div>
            ) : !selectedCompanyId ? (
              <div className="ld-empty">Selecione uma empresa para visualizar os clientes</div>
            ) : customers.length === 0 ? (
              <div className="ld-empty">Nenhum cliente encontrado</div>
            ) : (
              <table className="ld-table">
                <thead><tr><th>Nome</th><th>Documento</th><th>E-mail</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td>{c.nome}</td>
                      <td>{c.documento}</td>
                      <td>{c.email || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          <button className="ld-btn ld-btn-outline ld-btn-sm" onClick={() => openEdit(c)}><Pencil size={10} /></button>
                          <button className="ld-btn ld-btn-danger ld-btn-sm" onClick={() => handleDelete(c)}><Trash2 size={10} /></button>
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
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="ld-field"><label className="ld-lbl">Nome *</label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" /></div>
              <div className="ld-field"><label className="ld-lbl">Documento (CPF/CNPJ) *</label><Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="000.000.000-00" /></div>
              <div className="ld-field"><label className="ld-lbl">E-mail</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" /></div>
            </div>
            <DialogFooter style={{ marginTop: 4 }}>
              <button className="ld-btn ld-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="ld-btn ld-btn-dark" onClick={handleSubmit}>Salvar</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
