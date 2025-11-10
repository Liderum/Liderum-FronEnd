import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { CompanyService } from '@/services/managementService';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '@/types/management';
import { Plus, Pencil, Trash2, Building2, RefreshCw } from 'lucide-react';

export function Companies() {
  const { showToast } = useSimpleToast();

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<CreateCompanyDto>({
    razaoSocial: '',
    nomeFantasia: '',
    documento: '',
  });

  async function loadCompanies() {
    setLoading(true);
    try {
      const data = await CompanyService.list();
      setCompanies(data);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar empresas', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  function openCreate() {
    setEditingCompany(null);
    setForm({ razaoSocial: '', nomeFantasia: '', documento: '' });
    setIsModalOpen(true);
  }

  function openEdit(company: Company) {
    setEditingCompany(company);
    setForm({
      razaoSocial: company.razaoSocial || '',
      nomeFantasia: company.nomeFantasia || '',
      documento: company.documento || '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (!form.razaoSocial || !form.documento) {
        showToast('Preencha os campos obrigatórios (Razão Social e Documento)', 'error');
        return;
      }

      if (!editingCompany) {
        await CompanyService.create(form);
        showToast('Empresa criada com sucesso', 'success');
      } else {
        const payload: UpdateCompanyDto = {
          ...form,
          rowVersion: editingCompany.rowVersion,
        };
        await CompanyService.update(editingCompany.id, payload);
        showToast('Empresa atualizada com sucesso', 'success');
      }
      setIsModalOpen(false);
      loadCompanies();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error');
    }
  }

  async function handleDelete(company: Company) {
    const confirmed = window.confirm(`Excluir empresa ${company.razaoSocial}?`);
    if (!confirmed) return;
    try {
      showToast('Funcionalidade de exclusão não disponível na API', 'info');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-1">Gerencie as empresas cadastradas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadCompanies} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Empresa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Lista de Empresas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                        Nenhuma empresa encontrada
                      </TableCell>
                    </TableRow>
                  )}
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.razaoSocial}</TableCell>
                      <TableCell>{company.nomeFantasia || '-'}</TableCell>
                      <TableCell>{company.documento}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(company)}
                            className="gap-1"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(company)}
                            className="gap-1"
                            disabled
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
            <DialogTitle>
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Razão Social *</Label>
              <Input
                value={form.razaoSocial}
                onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
                placeholder="Razão Social"
              />
            </div>
            <div>
              <Label>Nome Fantasia</Label>
              <Input
                value={form.nomeFantasia}
                onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
                placeholder="Nome Fantasia"
              />
            </div>
            <div>
              <Label>Documento (CNPJ) *</Label>
              <Input
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
                placeholder="00.000.000/0000-00"
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

