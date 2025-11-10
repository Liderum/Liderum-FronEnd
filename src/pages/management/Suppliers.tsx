import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { SupplierService, CompanyService } from '@/services/managementService';
import { Supplier, CreateSupplierDto, UpdateSupplierDto, Company } from '@/types/management';
import { Plus, Pencil, Trash2, Truck, RefreshCw, Building2 } from 'lucide-react';

export function Suppliers() {
  const { showToast } = useSimpleToast();

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<CreateSupplierDto>({
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

  async function loadSuppliers() {
    if (!selectedCompanyId) {
      setSuppliers([]);
      return;
    }

    setLoading(true);
    try {
      const data = await SupplierService.list(selectedCompanyId);
      setSuppliers(data);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar fornecedores', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [selectedCompanyId]);

  function openCreate() {
    if (!selectedCompanyId) {
      showToast('Selecione uma empresa primeiro', 'error');
      return;
    }
    setEditingSupplier(null);
    setForm({ nome: '', documento: '', email: '' });
    setIsModalOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditingSupplier(supplier);
    setForm({
      nome: supplier.nome || '',
      documento: supplier.documento || '',
      email: supplier.email || '',
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

      if (!editingSupplier) {
        await SupplierService.create(selectedCompanyId, form);
        showToast('Fornecedor criado com sucesso', 'success');
      } else {
        const payload: UpdateSupplierDto = {
          ...form,
          rowVersion: editingSupplier.rowVersion,
        };
        await SupplierService.update(selectedCompanyId, editingSupplier.id, payload);
        showToast('Fornecedor atualizado com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error');
    }
  }

  async function handleDelete(supplier: Supplier) {
    if (!selectedCompanyId) return;

    const confirmed = window.confirm(`Excluir fornecedor ${supplier.nome}?`);
    if (!confirmed) return;
    try {
      await SupplierService.delete(selectedCompanyId, supplier.id);
      showToast('Fornecedor excluído com sucesso', 'success');
      loadSuppliers();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600 mt-1">Gerencie os fornecedores cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSuppliers} variant="outline" className="gap-2" disabled={!selectedCompanyId}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={openCreate} className="gap-2" disabled={!selectedCompanyId}>
            <Plus className="h-4 w-4" />
            Novo Fornecedor
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
            <Truck className="h-5 w-5" />
            Lista de Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !selectedCompanyId ? (
            <div className="text-center py-8 text-gray-500">
              Selecione uma empresa para visualizar os fornecedores
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
                  {suppliers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                        Nenhum fornecedor encontrado
                      </TableCell>
                    </TableRow>
                  )}
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.nome}</TableCell>
                      <TableCell>{supplier.documento}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(supplier)}
                            className="gap-1"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(supplier)}
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
            <DialogTitle>{editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome completo ou razão social"
              />
            </div>
            <div>
              <Label>Documento (CPF/CNPJ) *</Label>
              <Input
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
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

