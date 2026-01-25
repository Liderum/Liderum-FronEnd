import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Package,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from '../../services/productService';
import { ProdutoRequest } from '../../types/category';
import { CategoriaDto } from '../../types/category';

interface ProductFormProps {
  selectedCategory: CategoriaDto;
}

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

export function ProductForm({ selectedCategory }: ProductFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [product, setProduct] = useState<ProdutoRequest>({
    nome: '',
    sku: '',
    precoCusto: 0,
    precoVenda: 0,
    quantidadeEstoque: 0,
    quantidadeMinima: 0,
    unidadeMedida: 'un',
    marca: '',
    categoriaId: selectedCategory.id
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!product.nome.trim()) {
      newErrors.nome = 'Nome do produto é obrigatório';
    }

    if (!product.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }

    if (product.precoCusto <= 0) {
      newErrors.precoCusto = 'Preço de custo deve ser maior que zero';
    }

    if (product.precoVenda <= 0) {
      newErrors.precoVenda = 'Preço de venda deve ser maior que zero';
    }

    if (product.precoVenda <= product.precoCusto) {
      newErrors.precoVenda = 'Preço de venda deve ser maior que o preço de custo';
    }

    if (product.quantidadeEstoque < 0) {
      newErrors.quantidadeEstoque = 'Quantidade não pode ser negativa';
    }

    if (product.quantidadeMinima < 0) {
      newErrors.quantidadeMinima = 'Quantidade mínima não pode ser negativa';
    }

    if (!product.marca.trim()) {
      newErrors.marca = 'Marca é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      await ProductService.createProduct(product);
      
      toast({
        title: "Sucesso",
        description: "Produto cadastrado com sucesso!",
        variant: "default",
      });

      // Redireciona para a listagem de produtos
      navigate('/inventory');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar produto';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProdutoRequest, value: string | number) => {
    setProduct(prev => ({ ...prev, [field]: value }));
    // Remove erro quando usuário começa a digitar
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
    setProduct(prev => ({ ...prev, [field]: numericValue }));
    // Remove erro quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate('/inventory')}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
                <p className="text-gray-600 mt-1">Cadastre um novo produto no estoque</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-500" />
              Dados do Produto
            </CardTitle>
            <CardDescription>
              Categoria selecionada: <span className="font-medium text-blue-600">{selectedCategory.nome}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Produto */}
                <div className="md:col-span-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Cadeira Gamer"
                    value={product.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    disabled={loading}
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    placeholder="Ex: KWOE-38"
                    value={product.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    disabled={loading}
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.sku}
                    </p>
                  )}
                </div>

                {/* Marca */}
                <div>
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    placeholder="Ex: Kabum"
                    value={product.marca}
                    onChange={(e) => handleInputChange('marca', e.target.value)}
                    disabled={loading}
                    className={errors.marca ? 'border-red-500' : ''}
                  />
                  {errors.marca && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.marca}
                    </p>
                  )}
                </div>

                {/* Preço de Custo */}
                <div>
                  <Label htmlFor="precoCusto">Preço de Custo *</Label>
                  <Input
                    id="precoCusto"
                    type="text"
                    placeholder="R$ 0,00"
                    value={formatCurrency(product.precoCusto)}
                    onChange={(e) => handleCurrencyChange('precoCusto', e.target.value)}
                    disabled={loading}
                    className={errors.precoCusto ? 'border-red-500' : ''}
                  />
                  {errors.precoCusto && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.precoCusto}
                    </p>
                  )}
                </div>

                {/* Preço de Venda */}
                <div>
                  <Label htmlFor="precoVenda">Preço de Venda *</Label>
                  <Input
                    id="precoVenda"
                    type="text"
                    placeholder="R$ 0,00"
                    value={formatCurrency(product.precoVenda)}
                    onChange={(e) => handleCurrencyChange('precoVenda', e.target.value)}
                    disabled={loading}
                    className={errors.precoVenda ? 'border-red-500' : ''}
                  />
                  {errors.precoVenda && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.precoVenda}
                    </p>
                  )}
                </div>

                {/* Quantidade em Estoque */}
                <div>
                  <Label htmlFor="quantidadeEstoque">Quantidade em Estoque</Label>
                  <Input
                    id="quantidadeEstoque"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={product.quantidadeEstoque || ''}
                    onChange={(e) => handleInputChange('quantidadeEstoque', parseInt(e.target.value) || 0)}
                    disabled={loading}
                    className={errors.quantidadeEstoque ? 'border-red-500' : ''}
                  />
                  {errors.quantidadeEstoque && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.quantidadeEstoque}
                    </p>
                  )}
                </div>

                {/* Quantidade Mínima */}
                <div>
                  <Label htmlFor="quantidadeMinima">Quantidade Mínima</Label>
                  <Input
                    id="quantidadeMinima"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={product.quantidadeMinima || ''}
                    onChange={(e) => handleInputChange('quantidadeMinima', parseInt(e.target.value) || 0)}
                    disabled={loading}
                    className={errors.quantidadeMinima ? 'border-red-500' : ''}
                  />
                  {errors.quantidadeMinima && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.quantidadeMinima}
                    </p>
                  )}
                </div>

                {/* Unidade de Medida */}
                <div>
                  <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                  <Select 
                    value={product.unidadeMedida} 
                    onValueChange={(value) => handleInputChange('unidadeMedida', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesMedida.map(unidade => (
                        <SelectItem key={unidade.value} value={unidade.value}>
                          {unidade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/inventory')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Produto
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
