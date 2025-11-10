import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { CustomerService, CompanyService } from '@/services/managementService';
import { Customer, CreateCustomerDto, UpdateCustomerDto, Company } from '@/types/management';
import { Plus, Pencil, Trash2, Users, RefreshCw, Building2 } from 'lucide-react';

export function Customers() {
  const { showToast } = useSimpleToast();

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CreateCustomerDto>({
    nome: '',
    documento: '',
    email: '',
  });

  async function loadCompanies() {
    try {
      const data = await CompanyService.list();
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar empresas', 'error');
    }
  }

  async function loadCustomers() {
    if (!selectedCompanyId) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    try {
      const data = await CustomerService.list(selectedCompanyId);
      setCustomers(data);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar clientes', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [selectedCompanyId]);

  function openCreate() {
    if (!selectedCompanyId) {
      showToast('Selecione uma empresa primeiro', 'error');
      return;
    }
    setEditingCustomer(null);
    setForm({ nome: '', documento: '', email: '' });
    setIsModalOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setForm({
      nome: customer.nome || '',
      documento: customer.documento || '',
      email: customer.email || '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    if (!selectedCompanyId) {
      showToast('Selecione uma empresa primeiro', 'error');
      return;
    }

    try {
      if (!form.nome || !form.documento) {
        showToast('Preencha os campos obrigatórios (Nome e Documento)', 'error');
        return;
      }

      if (!editingCustomer) {
        await CustomerService.create(selectedCompanyId, form);
        showToast('Cliente criado com sucesso', 'success');
      } else {
        const payload: UpdateCustomerDto = {
          ...form,
          rowVersion: editingCustomer.rowVersion,
        };
        await CustomerService.update(selectedCompanyId, editingCustomer.id, payload);
        showToast('Cliente atualizado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error');
    }
  }

  async function handleDelete(customer: Customer) {
    if (!selectedCompanyId) return;

    const confirmed = window.confirm(`Excluir cliente ${customer.nome}?`);
    if (!confirmed) return;
    try {
      await CustomerService.delete(selectedCompanyId, customer.id);
      showToast('Cliente excluído com sucesso', 'success');
      loadCustomers();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie os clientes cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadCustomers} variant="outline" className="gap-2" disabled={!selectedCompanyId}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={openCreate} className="gap-2" disabled={!selectedCompanyId}>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Selecionar Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Empresa</Label>
              <Select
                value={selectedCompanyId?.toString() || ''}
                onValueChange={(value) => setSelectedCompanyId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !selectedCompanyId ? (
            <div className="text-center py-8 text-gray-500">
              Selecione uma empresa para visualizar os clientes
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  )}
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.nome}</TableCell>
                      <TableCell>{customer.documento}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(customer)}
                            className="gap-1"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(customer)}
                            className="gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label>Documento (CPF/CNPJ) *</Label>
              <Input
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

