import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Package,
  AlertCircle,
  DollarSign,
  Hash,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { InventoryService } from '../../services/inventoryService';
import { CategoryService } from '../../services/productService';
import { Product } from '../../types/inventory';
import { ProdutoRequest, CategoriaDto } from '../../types/category';

const unidadesMedida = [
  { value: 'un', label: 'Unidade' },
  { value: 'kg', label: 'Quilograma' },
  { value: 'g', label: 'Grama' },
  { value: 'l', label: 'Litro' },
  { value: 'ml', label: 'Mililitro' },
  { value: 'm', label: 'Metro' },
  { value: 'cm', label: 'Centímetro' },
  { value: 'cx', label: 'Caixa' },
  { value: 'pct', label: 'Pacote' },
  { value: 'dz', label: 'Dúzia' }
];

export function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<CategoriaDto[]>([]);
  const [formData, setFormData] = useState<ProdutoRequest>({
    nome: '',
    sku: '',
    precoCusto: 0,
    precoVenda: 0,
    quantidadeEstoque: 0,
    quantidadeMinima: 0,
    unidadeMedida: 'un',
    marca: '',
    categoriaId: ''
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    // Primeiro carrega as categorias
    await loadCategories();
    // Depois carrega o produto (que precisa das categorias para encontrar o categoriaId)
    await loadProduct();
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      const productData = await InventoryService.getProductById(id!);
      setProduct(productData);
      
      // Encontra a categoria pelo nome para obter o ID
      const categoria = categories.find(cat => cat.nome === productData.category);
      
      // Preenche o formulário com os dados do produto
      setFormData({
        nome: productData.name,
        sku: productData.sku,
        precoCusto: productData.costPrice,
        precoVenda: productData.price,
        quantidadeEstoque: productData.quantity,
        quantidadeMinima: productData.minQuantity,
        marca: productData.brand,
        categoriaId: categoria?.id || '',
        unidadeMedida: 'un' // Valor padrão, pois não temos essa informação no Product
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produto';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      navigate('/inventory');
    } finally {
      setLoadingProduct(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do produto é obrigatório';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }

    if (formData.precoCusto <= 0) {
      newErrors.precoCusto = 'Preço de custo deve ser maior que zero';
    }

    if (formData.precoVenda <= 0) {
      newErrors.precoVenda = 'Preço de venda deve ser maior que zero';
    }

    if (formData.precoVenda < formData.precoCusto) {
      newErrors.precoVenda = 'Preço de venda não pode ser menor que o preço de custo';
    }

    if (formData.quantidadeEstoque < 0) {
      newErrors.quantidadeEstoque = 'Quantidade em estoque não pode ser negativa';
    }

    if (formData.quantidadeMinima < 0) {
      newErrors.quantidadeMinima = 'Quantidade mínima não pode ser negativa';
    }

    if (!formData.marca.trim()) {
      newErrors.marca = 'Marca é obrigatória';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Categoria é obrigatória';
    }

    if (!formData.unidadeMedida.trim()) {
      newErrors.unidadeMedida = 'Unidade de medida é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      await InventoryService.updateProduct(id!, formData);
      
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
        variant: "default",
      });
      
      navigate(`/inventory/view/${id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCurrency = (value: number): string => {
    if (value === 0) return '';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Remove tudo exceto números
    const cleanValue = value.replace(/\D/g, '');
    // Divide por 100 para converter centavos em reais
    return parseFloat(cleanValue) / 100;
  };

  const handleCurrencyChange = (field: 'precoCusto' | 'precoVenda', value: string) => {
    const numericValue = parseCurrency(value);
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    // Remove erro quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loadingProduct || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Produto não encontrado</h3>
          <p className="text-gray-600 mb-4">O produto solicitado não foi encontrado.</p>
          <Button onClick={() => navigate('/inventory')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Estoque
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/inventory/view/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
            <p className="text-gray-600">Modifique as informações do produto</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Principal - Informações Básicas */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais do produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={errors.nome ? 'border-red-500' : ''}
                    placeholder="Digite o nome do produto"
                  />
                  {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className={errors.sku ? 'border-red-500' : ''}
                      placeholder="Ex: PROD-001"
                    />
                    {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => handleInputChange('marca', e.target.value)}
                      className={errors.marca ? 'border-red-500' : ''}
                      placeholder="Ex: Samsung"
                    />
                    {errors.marca && <p className="text-red-500 text-sm mt-1">{errors.marca}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoriaId">Categoria *</Label>
                    <Select 
                      value={formData.categoriaId} 
                      onValueChange={(value) => handleInputChange('categoriaId', value)}
                    >
                      <SelectTrigger className={errors.categoriaId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoriaId && <p className="text-red-500 text-sm mt-1">{errors.categoriaId}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="unidadeMedida">Unidade de Medida *</Label>
                    <Select 
                      value={formData.unidadeMedida} 
                      onValueChange={(value) => handleInputChange('unidadeMedida', value)}
                    >
                      <SelectTrigger className={errors.unidadeMedida ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {unidadesMedida.map((unidade) => (
                          <SelectItem key={unidade.value} value={unidade.value}>
                            {unidade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unidadeMedida && <p className="text-red-500 text-sm mt-1">{errors.unidadeMedida}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Financeiras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Informações Financeiras
                </CardTitle>
                <CardDescription>
                  Preços e custos do produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="precoCusto">Preço de Custo *</Label>
                    <Input
                      id="precoCusto"
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(formData.precoCusto)}
                      onChange={(e) => handleCurrencyChange('precoCusto', e.target.value)}
                      className={errors.precoCusto ? 'border-red-500' : ''}
                    />
                    {errors.precoCusto && <p className="text-red-500 text-sm mt-1">{errors.precoCusto}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="precoVenda">Preço de Venda *</Label>
                    <Input
                      id="precoVenda"
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(formData.precoVenda)}
                      onChange={(e) => handleCurrencyChange('precoVenda', e.target.value)}
                      className={errors.precoVenda ? 'border-red-500' : ''}
                    />
                    {errors.precoVenda && <p className="text-red-500 text-sm mt-1">{errors.precoVenda}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Controle de Estoque */}
          <div className="space-y-6">
            {/* Controle de Estoque */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Controle de Estoque
                </CardTitle>
                <CardDescription>
                  Quantidades e limites de estoque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quantidadeEstoque">Quantidade em Estoque *</Label>
                  <Input
                    id="quantidadeEstoque"
                    type="number"
                    min="0"
                    value={formData.quantidadeEstoque}
                    onChange={(e) => handleInputChange('quantidadeEstoque', parseInt(e.target.value) || 0)}
                    className={errors.quantidadeEstoque ? 'border-red-500' : ''}
                    placeholder="0"
                  />
                  {errors.quantidadeEstoque && <p className="text-red-500 text-sm mt-1">{errors.quantidadeEstoque}</p>}
                </div>
                
                <div>
                  <Label htmlFor="quantidadeMinima">Quantidade Mínima *</Label>
                  <Input
                    id="quantidadeMinima"
                    type="number"
                    min="0"
                    value={formData.quantidadeMinima}
                    onChange={(e) => handleInputChange('quantidadeMinima', parseInt(e.target.value) || 0)}
                    className={errors.quantidadeMinima ? 'border-red-500' : ''}
                    placeholder="0"
                  />
                  {errors.quantidadeMinima && <p className="text-red-500 text-sm mt-1">{errors.quantidadeMinima}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Margem de Lucro</label>
                    <p className="text-xl font-semibold text-purple-600">
                      {formatCurrency(formData.precoVenda - formData.precoCusto)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Margem Percentual</label>
                    <p className="text-xl font-semibold text-purple-600">
                      {formData.precoCusto > 0 ? 
                        ((formData.precoVenda - formData.precoCusto) / formData.precoCusto * 100).toFixed(1) + '%' 
                        : '0%'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Total em Estoque</label>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(formData.quantidadeEstoque * formData.precoCusto)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/inventory/view/${id}`)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProductEdit;
