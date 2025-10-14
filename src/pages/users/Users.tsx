import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { UserService } from '@/services/userService';
import { CreateUserRequest, PagedResponse, UpdateUserRequest, UserDto, UserStatus } from '@/types/users';
import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
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
    setForm({ fullName: user.fullName, email: user.email, role: user.role, password: '', confirmPassword: '', permissions: user.permissions || [] });
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
        const message = await UserService.create(form);
        showToast(message || 'Usuário criado com sucesso', 'success');
      } else {
        const payload: UpdateUserRequest = {
          id: editingUser.id,
          fullName: form.fullName,
          email: form.email,
          role: form.role,
          status: editingUser.status,
          permissions: form.permissions,
          password: form.password || undefined,
          confirmPassword: form.confirmPassword || undefined,
        };
        const message = await UserService.update(payload);
        showToast(message || 'Usuário atualizado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error');
    }
  }

  async function handleDelete(user: UserDto) {
    const confirmed = window.confirm(`Excluir usuário ${user.fullName}?`);
    if (!confirmed) return;
    try {
      const message = await UserService.remove(user.id);
      showToast(message || 'Usuário excluído com sucesso', 'success');
      loadUsers();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <Button onClick={openCreate} className="gap-2">
          <UserPlus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Busca e Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <Label>Buscar</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome ou e-mail"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={() => { setPage(1); loadUsers(); }}>Buscar</Button>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as UserStatus); setPage(1); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cargo</Label>
              <Select value={roleFilter} onValueChange={(v: string) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome completo</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-gray-500">Nenhum usuário encontrado</TableCell>
                  </TableRow>
                )}
                {data.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>
                        {u.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(u)} className="gap-1">
                          <Pencil className="h-4 w-4" /> Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(u)} className="gap-1">
                          <Trash2 className="h-4 w-4" /> Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {data.total > 0 && (
                <span>
                  Exibindo {(data.page - 1) * data.pageSize + 1} - {Math.min(data.page * data.pageSize, data.total)} de {data.total}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
              <span className="text-sm">Página {page} de {totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-24">
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
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome completo</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            {!editingUser && (
              <>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div>
                  <Label>Confirmar senha</Label>
                  <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <Label>Permissões (separe por vírgula)</Label>
              <Input
                value={(form.permissions || []).join(', ')}
                onChange={(e) => setForm({ ...form, permissions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Users;


