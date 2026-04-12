import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { UserService } from '@/services/userService';
import { PERMISSION_MAP } from '@/constants/permissions';
import { CreateUserRequest, PagedResponse, UpdateUserRequest, UserDto, UserStatus } from '@/types/users';
import {
  Pencil, Plus, Trash2, UserPlus, Search, Users as UsersIcon, Shield, UserCheck, Check,
  LayoutDashboard, Building2, CalendarClock, DollarSign, FilePlus2,
  BookOpen, Building, Truck, UserCog, Settings, CreditCard,
} from 'lucide-react';

const MODULE_ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, CalendarClock, DollarSign, FilePlus2,
  BookOpen, Building, Users: UsersIcon, Truck, UserCog, Settings, CreditCard,
};

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(22px,3vw,32px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);}
.ld-sub{font-size:13px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:20px 24px;}
.ld-section-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;}
.ld-table{width:100%;border-collapse:collapse;}
.ld-table th{font-size:10.5px;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink3);padding:11px 16px;text-align:left;border-bottom:1px solid var(--bdr);background:rgba(247,244,239,0.45);}
.ld-table td{font-size:13px;color:var(--ink2);padding:13px 16px;border-bottom:1px solid rgba(26,24,20,0.05);transition:background 0.15s;}
.ld-table tbody tr:hover td{background:rgba(247,244,239,0.5);}
.ld-table tbody tr:last-child td{border-bottom:none;}
.ld-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap;}
.ld-badge-green{background:#E8F5E9;color:#1E8449;}
.ld-badge-gray{background:#F2F2F2;color:var(--ink3);}
.ld-badge-gold{background:var(--gold-light);color:var(--gold);}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover{background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.ld-btn-danger{background:#fff;color:#C0392B;border:1px solid rgba(192,57,43,0.2);}
.ld-btn-danger:hover{background:#FDEDEC;}
.ld-btn-sm{padding:5px 12px;font-size:12px;}
.ld-filter-row{background:rgba(247,244,239,0.4);border:1px solid var(--bdr);border-radius:10px;padding:16px 20px;}
.ld-filter-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;align-items:end;}
.ld-lbl{font-size:11.5px;font-weight:500;color:var(--ink2);display:block;margin-bottom:5px;}
.ld-inp-wrap{position:relative;}
.ld-inp-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
.ld-pagination{display:flex;align-items:center;gap:6px;}
.ld-pg-btn{height:30px;min-width:30px;padding:0 8px;border-radius:6px;border:1px solid var(--bdr);background:#fff;cursor:pointer;font-size:12px;color:var(--ink2);font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;justify-content:center;transition:all 0.2s;}
.ld-pg-btn:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-pg-btn.active{background:var(--ink);color:#fff;border-color:var(--ink);}
.ld-pg-btn:disabled{opacity:0.35;cursor:not-allowed;}
.ld-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold-light),var(--cream2));border:1px solid var(--bdr);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--gold);flex-shrink:0;}
.ld-empty{text-align:center;padding:48px 20px;color:var(--ink3);}
.ld-empty-icon{width:48px;height:48px;border-radius:50%;background:var(--cream2);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;}
.ld-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ld-field{display:flex;flex-direction:column;gap:5px;}
.ld-field.full{grid-column:1/-1;}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
.ld-a3{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.14s both;}
@media(max-width:640px){.ld-filter-grid{grid-template-columns:1fr;}.ld-form-grid{grid-template-columns:1fr;}}
.ld-modules-section{margin-top:4px;}
.ld-modules-section-title{font-size:11.5px;font-weight:500;color:var(--ink2);margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.ld-modules-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;}
.ld-module-chip{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;border:1px solid var(--bdr);cursor:pointer;transition:all 0.18s;background:#fff;user-select:none;}
.ld-module-chip:hover{border-color:rgba(184,146,42,0.3);background:rgba(247,244,239,0.4);}
.ld-module-chip.selected{border-color:rgba(30,132,73,0.35);background:rgba(232,245,233,0.5);}
.ld-module-check{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--bdr);display:flex;align-items:center;justify-content:center;transition:all 0.18s;flex-shrink:0;background:#fff;}
.ld-module-chip.selected .ld-module-check{background:#1E8449;border-color:#1E8449;}
.ld-module-icon{width:24px;height:24px;border-radius:5px;background:linear-gradient(135deg,var(--gold-light),var(--cream2));display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0;}
.ld-module-name{font-size:12px;font-weight:500;color:var(--ink2);}
.ld-perm-group{margin-top:10px;padding:10px 12px;border-radius:8px;background:rgba(247,244,239,0.4);border:1px solid var(--bdr);}
.ld-perm-group-title{font-size:11px;font-weight:600;color:var(--ink2);margin-bottom:6px;display:flex;align-items:center;gap:6px;}
.ld-perm-list{display:flex;flex-wrap:wrap;gap:4px;}
.ld-perm-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:5px;font-size:11px;font-weight:500;border:1px solid var(--bdr);cursor:pointer;transition:all 0.15s;background:#fff;color:var(--ink2);user-select:none;}
.ld-perm-chip:hover{border-color:rgba(184,146,42,0.3);}
.ld-perm-chip.active{background:rgba(232,245,233,0.6);border-color:rgba(30,132,73,0.3);color:#1E8449;}
.ld-perm-mini-check{width:12px;height:12px;border-radius:3px;border:1.5px solid var(--bdr);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:#fff;transition:all 0.15s;}
.ld-perm-chip.active .ld-perm-mini-check{background:#1E8449;border-color:#1E8449;}
`;

export function Users() {
  const { showToast } = useSimpleToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [roleFilter, setRoleFilter] = useState<string | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<PagedResponse<UserDto>>({ items: [], total: 0, page: 1, pageSize: 10 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [form, setForm] = useState<CreateUserRequest>({ fullName: '', email: '', role: '', password: '', confirmPassword: '', permissions: [] });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.total / data.pageSize)), [data.total, data.pageSize]);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await UserService.list({ page, pageSize, search, status: statusFilter, role: roleFilter });
      setData(res);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter, roleFilter]);

  function openCreate() {
    setEditingUser(null);
    setForm({ fullName: '', email: '', role: '', password: '', confirmPassword: '', permissions: [] });
    setIsModalOpen(true);
  }

  function openEdit(user: UserDto) {
    setEditingUser(user);
    setForm({ fullName: user.name, email: user.email, role: user.role || '', password: '', confirmPassword: '', permissions: user.permissions || [] });
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (!form.fullName || !form.email || !form.role) {
        showToast('Preencha os campos obrigatórios', 'error');
        return;
      }
      if (!editingUser) {
        if (!form.password || form.password !== form.confirmPassword) {
          showToast('Senha e confirmação devem coincidir', 'error');
          return;
        }
        await UserService.create(form);
        showToast('Usuário criado com sucesso', 'success');
      } else {
        const payload: UpdateUserRequest = {
          id: editingUser.identifier,
          fullName: form.fullName,
          email: form.email,
          role: form.role,
          status: editingUser.status,
          permissions: form.permissions,
          password: form.password || undefined,
          confirmPassword: form.confirmPassword || undefined,
        };
        await UserService.update(payload);
        showToast('Usuário atualizado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error');
    }
  }

  async function handleDelete(user: UserDto) {
    const confirmed = window.confirm(`Excluir usuário ${user.name}?`);
    if (!confirmed) return;
    try {
      await UserService.remove(user.identifier);
      showToast('Usuário excluído com sucesso', 'success');
      loadUsers();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error');
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getRoleBadge = (role: string) => {
    if (role.toLowerCase() === 'admin') return <span className="ld-badge ld-badge-gold"><Shield size={10} /> Admin</span>;
    return <span className="ld-badge ld-badge-gray">{role}</span>;
  };

  return (
    <>
      <style>{LDCSS}</style>
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="ld-tag">Gestão</span>
            <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UsersIcon size={22} color="var(--gold)" />
              Usuários
            </h1>
            <p className="ld-sub" style={{ marginTop: 4 }}>Gerencie os membros e permissões do sistema</p>
          </div>
          <button className="ld-btn ld-btn-dark" onClick={openCreate}>
            <UserPlus size={14} /> Novo Usuário
          </button>
        </div>

        {/* Filtros */}
        <div className="ld-filter-row ld-a2">
          <div className="ld-filter-grid">
            <div>
              <label className="ld-lbl">Buscar usuário</label>
              <div className="ld-inp-wrap">
                <Search size={14} className="ld-inp-ico" />
                <Input
                  placeholder="Nome ou e-mail..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>
            <div>
              <label className="ld-lbl">Status</label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as UserStatus); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="ld-lbl">Cargo</label>
              <Select value={roleFilter} onValueChange={(v: string) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Cargo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className="ld-btn ld-btn-outline ld-btn-sm"
              onClick={() => { setPage(1); loadUsers(); }}
            >
              <Search size={12} /> Buscar
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="ld-card ld-a3">
          <div className="ld-card-body" style={{ paddingBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <span className="ld-section-title">
                <UserCheck size={16} color="var(--gold)" />
                Lista de Usuários
              </span>
              {data.total > 0 && (
                <span style={{ fontSize: 12, color: 'var(--ink3)' }}>
                  {data.total} usuário{data.total !== 1 ? 's' : ''} encontrado{data.total !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="ld-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Cargo</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--ink3)' }}>
                      Carregando...
                    </td>
                  </tr>
                )}
                {!loading && data.items.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="ld-empty">
                        <div className="ld-empty-icon">
                          <UsersIcon size={20} color="var(--ink3)" />
                        </div>
                        <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--ink2)' }}>Nenhum usuário encontrado</div>
                        <div style={{ fontSize: 12 }}>Tente ajustar os filtros ou crie um novo usuário</div>
                      </div>
                    </td>
                  </tr>
                )}
                {data.items.map((u) => (
                  <tr key={u.identifier}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="ld-avatar">{getInitials(u.name)}</span>
                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--ink3)' }}>{u.email}</td>
                    <td>{getRoleBadge(u.role || '')}</td>
                    <td>
                      <span className={u.status === 'active' ? 'ld-badge ld-badge-green' : 'ld-badge ld-badge-gray'}>
                        {u.status === 'active' ? '● Ativo' : '○ Inativo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="ld-btn ld-btn-outline ld-btn-sm" onClick={() => openEdit(u)}>
                          <Pencil size={12} /> Editar
                        </button>
                        <button className="ld-btn ld-btn-danger ld-btn-sm" onClick={() => handleDelete(u)}>
                          <Trash2 size={12} /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="ld-card-body" style={{ paddingTop: 14, paddingBottom: 16, borderTop: data.items.length > 0 ? '1px solid var(--bdr)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
                {data.total > 0 && (
                  <span>
                    Exibindo {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} de {data.total}
                  </span>
                )}
              </div>
              <div className="ld-pagination">
                <button className="ld-pg-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>←</button>
                <span style={{ fontSize: 12, color: 'var(--ink3)', padding: '0 4px' }}>Pág. {page} / {totalPages}</span>
                <button className="ld-pg-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>→</button>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger style={{ height: 30, fontSize: 12, width: 72 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent style={{ maxWidth: 620, maxHeight: '85vh', overflow: 'auto' }}>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <div className="ld-form-grid">
              <div className="ld-field">
                <label className="ld-lbl">Nome completo *</label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="ld-field">
                <label className="ld-lbl">E-mail *</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="ld-field">
                <label className="ld-lbl">Cargo / Role *</label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Gerente de Obras" />
              </div>
              {!editingUser && (
                <>
                  <div className="ld-field">
                    <label className="ld-lbl">Senha *</label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">Confirmar senha *</label>
                    <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                  </div>
                </>
              )}

              {/* Seleção de Módulos (Criar) ou Permissões (Editar) */}
              <div className="ld-field full ld-modules-section">
                {!editingUser ? (
                  <>
                    <label className="ld-modules-section-title">
                      <Shield size={13} color="var(--gold)" />
                      Módulos de acesso *
                    </label>
                    <p style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 10 }}>
                      Selecione os módulos que este usuário poderá acessar. Todas as permissões do módulo serão concedidas.
                    </p>
                    <div className="ld-modules-grid">
                      {PERMISSION_MAP.map((mod) => {
                        const IconComp = MODULE_ICON_MAP[mod.icon] || Shield;
                        const isSelected = form.permissions.includes(mod.module);
                        return (
                          <div
                            key={mod.module}
                            className={`ld-module-chip${isSelected ? ' selected' : ''}`}
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                permissions: isSelected
                                  ? prev.permissions.filter((p) => p !== mod.module)
                                  : [...prev.permissions, mod.module],
                              }));
                            }}
                          >
                            <div className="ld-module-check">
                              {isSelected && <Check size={10} color="#fff" strokeWidth={3} />}
                            </div>
                            <div className="ld-module-icon">
                              <IconComp size={12} />
                            </div>
                            <span className="ld-module-name">{mod.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    {form.permissions.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--ink3)' }}>
                          {form.permissions.length} módulo{form.permissions.length !== 1 ? 's' : ''} selecionado{form.permissions.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          className="ld-btn ld-btn-outline ld-btn-sm"
                          style={{ padding: '2px 8px', fontSize: 10 }}
                          onClick={() => setForm((prev) => ({ ...prev, permissions: PERMISSION_MAP.map((m) => m.module) }))}
                        >
                          Selecionar todos
                        </button>
                        <button
                          type="button"
                          className="ld-btn ld-btn-outline ld-btn-sm"
                          style={{ padding: '2px 8px', fontSize: 10 }}
                          onClick={() => setForm((prev) => ({ ...prev, permissions: [] }))}
                        >
                          Limpar
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <label className="ld-modules-section-title">
                      <Shield size={13} color="var(--gold)" />
                      Permissões por módulo
                    </label>
                    <p style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 10 }}>
                      Selecione as permissões individuais para este usuário.
                    </p>
                    {PERMISSION_MAP.map((mod) => {
                      const IconComp = MODULE_ICON_MAP[mod.icon] || Shield;
                      const modPerms = mod.permissions.map((p) => p.key);
                      const selectedPerms = modPerms.filter((k) => form.permissions.includes(k));
                      const allSelected = selectedPerms.length === modPerms.length;

                      return (
                        <div key={mod.module} className="ld-perm-group">
                          <div className="ld-perm-group-title">
                            <div className="ld-module-icon" style={{ width: 20, height: 20 }}>
                              <IconComp size={10} />
                            </div>
                            {mod.label}
                            <span style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 400 }}>
                              ({selectedPerms.length}/{modPerms.length})
                            </span>
                            <button
                              type="button"
                              style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--gold)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', fontWeight: 500 }}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  permissions: allSelected
                                    ? prev.permissions.filter((p) => !modPerms.includes(p))
                                    : [...prev.permissions.filter((p) => !modPerms.includes(p)), ...modPerms],
                                }));
                              }}
                            >
                              {allSelected ? 'Remover todos' : 'Marcar todos'}
                            </button>
                          </div>
                          <div className="ld-perm-list">
                            {mod.permissions.map((perm) => {
                              const isActive = form.permissions.includes(perm.key);
                              return (
                                <div
                                  key={perm.key}
                                  className={`ld-perm-chip${isActive ? ' active' : ''}`}
                                  title={perm.description}
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      permissions: isActive
                                        ? prev.permissions.filter((p) => p !== perm.key)
                                        : [...prev.permissions, perm.key],
                                    }));
                                  }}
                                >
                                  <span className="ld-perm-mini-check">
                                    {isActive && <Check size={8} color="#fff" strokeWidth={3} />}
                                  </span>
                                  {perm.label}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
            <DialogFooter style={{ marginTop: 4 }}>
              <button className="ld-btn ld-btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="ld-btn ld-btn-dark" onClick={handleSubmit}>
                <Plus size={14} /> Salvar
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}

export default Users;
