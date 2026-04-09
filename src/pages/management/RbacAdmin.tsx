import { useCallback, useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { RbacAdminService } from '@/services/rbacAdminService';
import { UserService } from '@/services/userService';
import { PERMISSION_MAP } from '@/constants/permissions';
import type { RbacRole, RbacPermission } from '@/types/rbac';
import type { UserDto } from '@/types/users';
import {
  Shield, Plus, Search, ChevronRight, Check, X, Users,
  LayoutDashboard, Building2, CalendarClock, DollarSign, FilePlus2,
  BookOpen, Building, Truck, UserCog, Settings, CreditCard,
  Loader2, UserPlus, UserMinus, AlertTriangle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, CalendarClock, DollarSign, FilePlus2,
  BookOpen, Building, Users, Truck, UserCog, Settings, CreditCard,
};

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);--green:#1E8449;--green-bg:#E8F5E9;--red:#C0392B;--red-bg:#FDEDEC;}
.rbac{font-family:'DM Sans',sans-serif;color:var(--ink);display:flex;flex-direction:column;gap:20px;}

.rbac-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px;}
.rbac-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(22px,3vw,32px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);display:flex;align-items:center;gap:10px;}
.rbac-sub{font-size:13px;color:var(--ink3);font-weight:300;}

.rbac-layout{display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:start;}
@media(max-width:900px){.rbac-layout{grid-template-columns:1fr;}}

.rbac-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.rbac-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.rbac-card-header{padding:16px 20px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;gap:8px;}
.rbac-card-title{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;}
.rbac-card-body{padding:16px 20px;}

.rbac-role-list{display:flex;flex-direction:column;gap:2px;}
.rbac-role-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:8px;cursor:pointer;transition:all 0.16s;border:1px solid transparent;}
.rbac-role-item:hover{background:var(--cream);}
.rbac-role-item.active{background:rgba(184,146,42,0.08);border-color:rgba(184,146,42,0.25);color:var(--gold);}
.rbac-role-item.active .rbac-role-name{color:var(--gold);}
.rbac-role-name{font-size:13px;font-weight:500;color:var(--ink2);}
.rbac-role-desc{font-size:11px;color:var(--ink3);font-weight:300;margin-top:1px;}
.rbac-role-count{font-size:10px;background:var(--cream2);color:var(--ink3);padding:2px 7px;border-radius:10px;white-space:nowrap;}

.rbac-module{margin-bottom:20px;}
.rbac-module:last-child{margin-bottom:0;}
.rbac-module-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(26,24,20,0.06);}
.rbac-module-icon{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,var(--gold-light),var(--cream2));display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0;}
.rbac-module-name{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;color:var(--ink);}
.rbac-module-toggle{margin-left:auto;font-size:11px;color:var(--ink3);cursor:pointer;padding:3px 10px;border-radius:5px;border:1px solid var(--bdr);background:#fff;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
.rbac-module-toggle:hover{border-color:var(--gold);color:var(--gold);}

.rbac-perm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;}
.rbac-perm-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:7px;border:1px solid var(--bdr);cursor:pointer;transition:all 0.18s;background:#fff;user-select:none;}
.rbac-perm-item:hover{border-color:rgba(184,146,42,0.3);background:rgba(247,244,239,0.4);}
.rbac-perm-item.granted{border-color:rgba(30,132,73,0.3);background:rgba(232,245,233,0.5);}
.rbac-perm-check{width:18px;height:18px;border-radius:4px;border:1.5px solid var(--bdr);display:flex;align-items:center;justify-content:center;transition:all 0.18s;flex-shrink:0;background:#fff;}
.rbac-perm-item.granted .rbac-perm-check{background:var(--green);border-color:var(--green);}
.rbac-perm-label{font-size:12px;font-weight:500;color:var(--ink2);}
.rbac-perm-key{font-size:10px;color:var(--ink3);font-weight:300;font-family:'DM Sans',monospace;}

.rbac-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.rbac-btn-dark{background:var(--ink);color:#fff;}
.rbac-btn-dark:hover{background:var(--gold);}
.rbac-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.rbac-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.rbac-btn-danger{background:#fff;color:var(--red);border:1px solid rgba(192,57,43,0.2);}
.rbac-btn-danger:hover{background:var(--red-bg);}
.rbac-btn-sm{padding:4px 10px;font-size:11px;}
.rbac-btn:disabled{opacity:0.45;cursor:not-allowed;}

.rbac-users-section{margin-top:24px;padding-top:20px;border-top:1px solid var(--bdr);}
.rbac-user-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(26,24,20,0.04);}
.rbac-user-row:last-child{border-bottom:none;}
.rbac-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--gold-light),var(--cream2));border:1px solid var(--bdr);display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--gold);flex-shrink:0;}

.rbac-empty{text-align:center;padding:40px 20px;color:var(--ink3);}
.rbac-empty-icon{width:48px;height:48px;border-radius:50%;background:var(--cream2);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;}

.rbac-search-wrap{position:relative;margin-bottom:12px;}
.rbac-search-wrap .rbac-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}

.rbac-lbl{font-size:11.5px;font-weight:500;color:var(--ink2);display:block;margin-bottom:5px;}
.rbac-field{display:flex;flex-direction:column;gap:5px;margin-bottom:12px;}

.rbac-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
.rbac-stat{background:#fff;border-radius:10px;border:1px solid var(--bdr);padding:14px 16px;text-align:center;}
.rbac-stat-val{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:var(--ink);}
.rbac-stat-lbl{font-size:11px;color:var(--ink3);margin-top:2px;}

.rbac-saving{position:fixed;bottom:20px;right:20px;background:var(--ink);color:#fff;padding:10px 18px;border-radius:8px;font-size:12px;display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:1000;animation:rbac-slide-up 0.3s ease-out;}
@keyframes rbac-slide-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes rbac-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.rbac-a1{animation:rbac-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.rbac-a2{animation:rbac-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
.rbac-a3{animation:rbac-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.14s both;}
`;

export function RbacAdmin() {
  const { showToast } = useSimpleToast();

  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [backendPermissions, setBackendPermissions] = useState<RbacPermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [rolePermissionIds, setRolePermissionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<UserDto[]>([]);
  const [roleUsers, setRoleUsers] = useState<UserDto[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [showAssignUser, setShowAssignUser] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');

  const permNameToId = useMemo(() => {
    const map = new Map<string, string>();
    backendPermissions.forEach((p) => map.set(p.name, p.id));
    return map;
  }, [backendPermissions]);

  const permIdToName = useMemo(() => {
    const map = new Map<string, string>();
    backendPermissions.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [backendPermissions]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        RbacAdminService.listRoles(),
        RbacAdminService.listPermissions(),
      ]);
      setRoles(rolesData);
      setBackendPermissions(permsData);

      try {
        const usersData = await UserService.list({ page: 1, pageSize: 200 });
        setUsers(usersData.items);
      } catch {
        // non-fatal
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar dados RBAC', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const selectRole = useCallback(
    async (role: RbacRole) => {
      setSelectedRole(role);
      setRolePermissionIds(new Set());
      setRoleUsers([]);

      // TODO: the API might return role permissions separately;
      // for now we use the permissions attached to the role or a dedicated endpoint
      // Simulating by trying to load permissions for this role
      // The backend's /my-permissions returns data for the current user;
      // for admin view we need the role's permissions
      // We'll track toggled permissions via API calls (assign/remove)
    },
    [],
  );

  const isPermGranted = useCallback(
    (permKey: string): boolean => {
      const permId = permNameToId.get(permKey);
      return permId ? rolePermissionIds.has(permId) : false;
    },
    [rolePermissionIds, permNameToId],
  );

  const togglePermission = useCallback(
    async (permKey: string) => {
      if (!selectedRole) return;
      const permId = permNameToId.get(permKey);
      if (!permId) {
        showToast(`Permissão "${permKey}" não encontrada no backend. Cadastre-a primeiro.`, 'warning');
        return;
      }

      const wasGranted = rolePermissionIds.has(permId);
      setSaving(true);

      try {
        if (wasGranted) {
          await RbacAdminService.removePermissionFromRole(selectedRole.id, permId);
          setRolePermissionIds((prev) => {
            const next = new Set(prev);
            next.delete(permId);
            return next;
          });
        } else {
          await RbacAdminService.assignPermissionToRole(selectedRole.id, permId);
          setRolePermissionIds((prev) => new Set(prev).add(permId));
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Erro ao atualizar permissão', 'error');
      } finally {
        setSaving(false);
      }
    },
    [selectedRole, permNameToId, rolePermissionIds, showToast],
  );

  const toggleAllModule = useCallback(
    async (modulePerms: string[]) => {
      if (!selectedRole) return;
      const allGranted = modulePerms.every((p) => isPermGranted(p));
      setSaving(true);

      try {
        for (const permKey of modulePerms) {
          const permId = permNameToId.get(permKey);
          if (!permId) continue;

          if (allGranted) {
            await RbacAdminService.removePermissionFromRole(selectedRole.id, permId);
            setRolePermissionIds((prev) => {
              const next = new Set(prev);
              next.delete(permId);
              return next;
            });
          } else if (!rolePermissionIds.has(permId)) {
            await RbacAdminService.assignPermissionToRole(selectedRole.id, permId);
            setRolePermissionIds((prev) => new Set(prev).add(permId));
          }
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Erro ao atualizar permissões', 'error');
      } finally {
        setSaving(false);
      }
    },
    [selectedRole, permNameToId, rolePermissionIds, isPermGranted, showToast],
  );

  const handleCreateRole = useCallback(async () => {
    if (!newRoleName.trim()) {
      showToast('Informe o nome da role', 'error');
      return;
    }
    try {
      const created = await RbacAdminService.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim() || undefined,
      });
      setRoles((prev) => [...prev, created]);
      setShowCreateRole(false);
      setNewRoleName('');
      setNewRoleDesc('');
      showToast('Role criada com sucesso', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erro ao criar role', 'error');
    }
  }, [newRoleName, newRoleDesc, showToast]);

  const handleAssignUser = useCallback(
    async (user: UserDto) => {
      if (!selectedRole) return;
      try {
        await RbacAdminService.assignRoleToUser(selectedRole.id, user.id);
        setRoleUsers((prev) => [...prev, user]);
        setShowAssignUser(false);
        showToast(`${user.fullName} adicionado à role`, 'success');
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Erro ao atribuir role', 'error');
      }
    },
    [selectedRole, showToast],
  );

  const handleRemoveUser = useCallback(
    async (user: UserDto) => {
      if (!selectedRole) return;
      if (!window.confirm(`Remover ${user.fullName} da role ${selectedRole.name}?`)) return;
      try {
        await RbacAdminService.removeRoleFromUser(selectedRole.id, user.id);
        setRoleUsers((prev) => prev.filter((u) => u.id !== user.id));
        showToast(`${user.fullName} removido da role`, 'success');
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Erro ao remover da role', 'error');
      }
    },
    [selectedRole, showToast],
  );

  const filteredAssignUsers = useMemo(() => {
    const roleUserIds = new Set(roleUsers.map((u) => u.id));
    const q = assignSearch.toLowerCase();
    return users.filter(
      (u) =>
        !roleUserIds.has(u.id) &&
        (u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    );
  }, [users, roleUsers, assignSearch]);

  const grantedCount = rolePermissionIds.size;
  const totalCount = backendPermissions.length;

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="rbac" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={32} color="var(--gold)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 12, color: 'var(--ink3)', fontSize: 13 }}>Carregando RBAC...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{LDCSS}</style>
      <div className="rbac">
        {/* Header */}
        <div className="rbac-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="rbac-tag">Administração</span>
            <h1 className="rbac-h1">
              <Shield size={22} color="var(--gold)" />
              Controle de Acesso (RBAC)
            </h1>
            <p className="rbac-sub" style={{ marginTop: 4 }}>
              Gerencie roles, permissões por módulo e atribua acessos aos usuários
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="rbac-stat-row rbac-a2">
          <div className="rbac-stat">
            <div className="rbac-stat-val">{roles.length}</div>
            <div className="rbac-stat-lbl">Roles</div>
          </div>
          <div className="rbac-stat">
            <div className="rbac-stat-val">{totalCount}</div>
            <div className="rbac-stat-lbl">Permissões</div>
          </div>
          <div className="rbac-stat">
            <div className="rbac-stat-val">{users.length}</div>
            <div className="rbac-stat-lbl">Usuários</div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="rbac-layout rbac-a3">
          {/* Roles panel */}
          <div className="rbac-card">
            <div className="rbac-card-header">
              <span className="rbac-card-title">
                <Shield size={14} color="var(--gold)" />
                Roles
              </span>
              <button className="rbac-btn rbac-btn-dark rbac-btn-sm" onClick={() => setShowCreateRole(true)}>
                <Plus size={12} /> Nova
              </button>
            </div>
            <div className="rbac-card-body">
              {roles.length === 0 ? (
                <div className="rbac-empty">
                  <div className="rbac-empty-icon">
                    <Shield size={20} color="var(--ink3)" />
                  </div>
                  <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--ink2)', fontSize: 13 }}>
                    Nenhuma role cadastrada
                  </div>
                  <div style={{ fontSize: 12 }}>Crie uma role para começar</div>
                </div>
              ) : (
                <div className="rbac-role-list">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`rbac-role-item${selectedRole?.id === role.id ? ' active' : ''}`}
                      onClick={() => selectRole(role)}
                    >
                      <div>
                        <div className="rbac-role-name">{role.name}</div>
                        {role.description && <div className="rbac-role-desc">{role.description}</div>}
                      </div>
                      <ChevronRight size={14} style={{ opacity: 0.4 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Permissions panel */}
          <div className="rbac-card">
            <div className="rbac-card-header">
              <span className="rbac-card-title">
                {selectedRole ? (
                  <>
                    <Shield size={14} color="var(--gold)" />
                    Permissões — {selectedRole.name}
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} color="var(--ink3)" />
                    Selecione uma role
                  </>
                )}
              </span>
              {selectedRole && (
                <span style={{ fontSize: 11, color: 'var(--ink3)' }}>
                  {grantedCount} de {totalCount} ativas
                </span>
              )}
            </div>
            <div className="rbac-card-body">
              {!selectedRole ? (
                <div className="rbac-empty">
                  <div className="rbac-empty-icon">
                    <Shield size={20} color="var(--ink3)" />
                  </div>
                  <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--ink2)', fontSize: 13 }}>
                    Selecione uma role à esquerda
                  </div>
                  <div style={{ fontSize: 12 }}>
                    Para gerenciar permissões e usuários
                  </div>
                </div>
              ) : (
                <>
                  {PERMISSION_MAP.map((mod) => {
                    const IconComp = ICON_MAP[mod.icon] || Shield;
                    const modPermKeys = mod.permissions.map((p) => p.key);
                    const allGranted = modPermKeys.every((k) => isPermGranted(k));
                    const someGranted = modPermKeys.some((k) => isPermGranted(k));

                    return (
                      <div key={mod.module} className="rbac-module">
                        <div className="rbac-module-header">
                          <div className="rbac-module-icon">
                            <IconComp size={14} />
                          </div>
                          <span className="rbac-module-name">{mod.label}</span>
                          <button
                            className="rbac-module-toggle"
                            disabled={saving}
                            onClick={() => toggleAllModule(modPermKeys)}
                          >
                            {allGranted ? 'Remover todos' : someGranted ? 'Marcar todos' : 'Marcar todos'}
                          </button>
                        </div>
                        <div className="rbac-perm-grid">
                          {mod.permissions.map((perm) => {
                            const granted = isPermGranted(perm.key);
                            const exists = permNameToId.has(perm.key);
                            return (
                              <div
                                key={perm.key}
                                className={`rbac-perm-item${granted ? ' granted' : ''}`}
                                onClick={() => togglePermission(perm.key)}
                                title={!exists ? `Permissão "${perm.key}" ainda não cadastrada no backend` : perm.description}
                                style={!exists ? { opacity: 0.5, borderStyle: 'dashed' } : undefined}
                              >
                                <div className="rbac-perm-check">
                                  {granted && <Check size={12} color="#fff" strokeWidth={3} />}
                                </div>
                                <div>
                                  <div className="rbac-perm-label">{perm.label}</div>
                                  <div className="rbac-perm-key">{perm.key}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Users assigned to role */}
                  <div className="rbac-users-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span className="rbac-card-title" style={{ fontSize: 15 }}>
                        <Users size={14} color="var(--gold)" />
                        Usuários com esta role
                      </span>
                      <button
                        className="rbac-btn rbac-btn-outline rbac-btn-sm"
                        onClick={() => { setShowAssignUser(true); setAssignSearch(''); }}
                      >
                        <UserPlus size={12} /> Adicionar
                      </button>
                    </div>

                    {roleUsers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink3)', fontSize: 12 }}>
                        Nenhum usuário atribuído a esta role
                      </div>
                    ) : (
                      roleUsers.map((u) => (
                        <div key={u.id} className="rbac-user-row">
                          <span className="rbac-avatar">{getInitials(u.fullName)}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{u.fullName}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{u.email}</div>
                          </div>
                          <button
                            className="rbac-btn rbac-btn-danger rbac-btn-sm"
                            onClick={() => handleRemoveUser(u)}
                          >
                            <UserMinus size={12} /> Remover
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Saving indicator */}
        {saving && (
          <div className="rbac-saving">
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Salvando...
          </div>
        )}

        {/* Create Role Dialog */}
        <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Role</DialogTitle>
            </DialogHeader>
            <div className="rbac-field">
              <label className="rbac-lbl">Nome da role *</label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Ex: Gerente de Obras"
              />
            </div>
            <div className="rbac-field">
              <label className="rbac-lbl">Descrição</label>
              <Input
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="Descrição opcional da role"
              />
            </div>
            <DialogFooter style={{ marginTop: 4 }}>
              <button className="rbac-btn rbac-btn-outline" onClick={() => setShowCreateRole(false)}>
                Cancelar
              </button>
              <button className="rbac-btn rbac-btn-dark" onClick={handleCreateRole}>
                <Plus size={14} /> Criar Role
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign User Dialog */}
        <Dialog open={showAssignUser} onOpenChange={setShowAssignUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Usuário à Role</DialogTitle>
            </DialogHeader>
            <div className="rbac-search-wrap">
              <Search size={14} className="rbac-search-icon" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                style={{ paddingLeft: 32 }}
              />
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {filteredAssignUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink3)', fontSize: 12 }}>
                  Nenhum usuário disponível
                </div>
              ) : (
                filteredAssignUsers.map((u) => (
                  <div key={u.id} className="rbac-user-row" style={{ cursor: 'pointer' }} onClick={() => handleAssignUser(u)}>
                    <span className="rbac-avatar">{getInitials(u.fullName)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{u.fullName}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{u.email}</div>
                    </div>
                    <Plus size={14} color="var(--gold)" />
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default RbacAdmin;
