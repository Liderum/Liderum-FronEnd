import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Package,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Hash,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Product } from '../../types/inventory';
import { InventoryService } from '../../services/inventoryService';

export function ProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      const product = await InventoryService.getProductById(id!);
      setProduct(product);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produto';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/inventory/edit/${id}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'discontinued':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'discontinued':
        return 'Descontinuado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'destructive';
      case 'discontinued':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar produto</h3>
          <p className="text-gray-600 mb-4">{error}</p>
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
            onClick={() => navigate('/inventory')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">Detalhes do produto</p>
          </div>
        </div>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Editar Produto
        </Button>
      </div>

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
                <label className="text-sm font-medium text-gray-500">Nome do Produto</label>
                <p className="text-lg font-semibold text-gray-900">{product.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU</label>
                  <p className="text-lg font-mono text-gray-900">{product.sku}</p>
                </div>
                {product.barcode && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Código de Barras</label>
                    <p className="text-lg font-mono text-gray-900">{product.barcode}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Categoria</label>
                  <p className="text-lg text-gray-900">{product.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Marca</label>
                  <p className="text-lg text-gray-900">{product.brand}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(product.status)}
                  <Badge variant={getStatusVariant(product.status)}>
                    {getStatusLabel(product.status)}
                  </Badge>
                </div>
              </div>
              
              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-900 mt-1">{product.description}</p>
                </div>
              )}
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
                  <label className="text-sm font-medium text-gray-500">Preço de Venda</label>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(product.price)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Preço de Custo</label>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(product.costPrice)}</p>
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
                <label className="text-sm font-medium text-gray-500">Quantidade Atual</label>
                <p className="text-3xl font-bold text-gray-900">{product.quantity}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Quantidade Mínima</label>
                <p className="text-lg text-gray-900">{product.minQuantity}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Quantidade Máxima</label>
                <p className="text-lg text-gray-900">{product.maxQuantity}</p>
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
                    {formatCurrency(product.price - product.costPrice)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Margem Percentual</label>
                  <p className="text-xl font-semibold text-purple-600">
                    {((product.price - product.costPrice) / product.costPrice * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor Total em Estoque</label>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(product.quantity * product.costPrice)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProductView;
