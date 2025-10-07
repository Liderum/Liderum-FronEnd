import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Package, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import api from '../../services/api/axios';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  costPrice: number;
  category: string;
  brand: string;
  supplier: string;
  location: string;
  status: 'active' | 'inactive' | 'discontinued';
  lastMovement: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  weight?: number;
  dimensions?: string;
  image?: string;
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoriesCount: number;
  suppliersCount: number;
}

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categoriesCount: 0,
    suppliersCount: 0
  });
  const { toast } = useToast();

  // Dados mockados para demonstração
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Smartphone Samsung Galaxy S23',
      sku: 'SAM-GS23-128',
      barcode: '7891234567890',
      quantity: 15,
      minQuantity: 5,
      maxQuantity: 50,
      price: 2999.99,
      costPrice: 2200.00,
      category: 'Eletrônicos',
      brand: 'Samsung',
      supplier: 'Tech Distribuidora',
      location: 'A1-B2',
      status: 'active',
      lastMovement: '2024-01-15',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
      description: 'Smartphone Android com 128GB',
      weight: 0.168,
      dimensions: '15.6 x 7.6 x 0.8 cm'
    },
    {
      id: '2',
      name: 'Notebook Dell Inspiron 15',
      sku: 'DEL-IN15-512',
      barcode: '7891234567891',
      quantity: 3,
      minQuantity: 5,
      maxQuantity: 20,
      price: 4599.99,
      costPrice: 3800.00,
      category: 'Eletrônicos',
      brand: 'Dell',
      supplier: 'Computer World',
      location: 'B1-C3',
      status: 'active',
      lastMovement: '2024-01-14',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-14',
      description: 'Notebook com Intel i7 e 512GB SSD',
      weight: 1.8,
      dimensions: '35.8 x 24.9 x 1.9 cm'
    },
    {
      id: '3',
      name: 'Cadeira Gamer RGB',
      sku: 'GAM-CHAIR-001',
      barcode: '7891234567892',
      quantity: 0,
      minQuantity: 3,
      maxQuantity: 15,
      price: 899.99,
      costPrice: 650.00,
      category: 'Móveis',
      brand: 'GamerTech',
      supplier: 'Furniture Plus',
      location: 'C2-D1',
      status: 'active',
      lastMovement: '2024-01-10',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-10',
      description: 'Cadeira gamer com iluminação RGB',
      weight: 15.5,
      dimensions: '60 x 60 x 120 cm'
    },
    {
      id: '4',
      name: 'Monitor LG 24" Full HD',
      sku: 'LG-MON-24FHD',
      barcode: '7891234567893',
      quantity: 8,
      minQuantity: 4,
      maxQuantity: 25,
      price: 799.99,
      costPrice: 580.00,
      category: 'Eletrônicos',
      brand: 'LG',
      supplier: 'Tech Distribuidora',
      location: 'A2-B1',
      status: 'active',
      lastMovement: '2024-01-12',
      createdAt: '2024-01-04',
      updatedAt: '2024-01-12',
      description: 'Monitor LED 24 polegadas Full HD',
      weight: 3.2,
      dimensions: '55.2 x 32.4 x 5.0 cm'
    },
    {
      id: '5',
      name: 'Mesa Escritório Branca',
      sku: 'DESK-WHT-120',
      barcode: '7891234567894',
      quantity: 12,
      minQuantity: 2,
      maxQuantity: 10,
      price: 599.99,
      costPrice: 420.00,
      category: 'Móveis',
      brand: 'OfficeMax',
      supplier: 'Furniture Plus',
      location: 'D1-E2',
      status: 'active',
      lastMovement: '2024-01-13',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-13',
      description: 'Mesa de escritório branca 120cm',
      weight: 25.0,
      dimensions: '120 x 60 x 75 cm'
    }
  ];

  const categories = ['Eletrônicos', 'Móveis', 'Acessórios', 'Software', 'Livros'];
  const suppliers = ['Tech Distribuidora', 'Computer World', 'Furniture Plus', 'Office Supply'];
  const brands = ['Samsung', 'Dell', 'GamerTech', 'LG', 'OfficeMax'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Simulando chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      
      // Calculando estatísticas
      const totalValue = mockProducts.reduce((sum, product) => sum + (product.quantity * product.price), 0);
      const lowStockItems = mockProducts.filter(p => p.quantity <= p.minQuantity && p.quantity > 0).length;
      const outOfStockItems = mockProducts.filter(p => p.quantity === 0).length;
      
      setStats({
        totalProducts: mockProducts.length,
        totalValue,
        lowStockItems,
        outOfStockItems,
        categoriesCount: new Set(mockProducts.map(p => p.category)).size,
        suppliersCount: new Set(mockProducts.map(p => p.supplier)).size
      });
      } catch (err) {
        setError('Erro ao carregar produtos');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos do estoque",
        variant: "destructive",
      });
      } finally {
        setLoading(false);
      }
  };

  // Filtros e busca
  useEffect(() => {
    let filtered = [...products];

    // Busca por texto
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    // Filtro por fornecedor
    if (selectedSupplier !== 'all') {
      filtered = filtered.filter(product => product.supplier === selectedSupplier);
    }

    // Filtro estoque baixo
    if (showLowStockOnly) {
      filtered = filtered.filter(product => product.quantity <= product.minQuantity && product.quantity > 0);
    }

    // Filtro sem estoque
    if (showOutOfStockOnly) {
      filtered = filtered.filter(product => product.quantity === 0);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'lastMovement':
          aValue = new Date(a.lastMovement);
          bValue = new Date(b.lastMovement);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedSupplier, showLowStockOnly, showOutOfStockOnly, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) {
      return {
        text: 'Sem estoque',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      };
    }
    if (quantity <= minQuantity) {
      return {
        text: 'Estoque baixo',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertTriangle
      };
    }
    return {
      text: 'Em estoque',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle
    };
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportData = () => {
    toast({
      title: "Exportando dados",
      description: "Preparando arquivo para download...",
    });
  };

  const importData = () => {
    toast({
      title: "Importar dados",
      description: "Funcionalidade de importação será implementada em breve",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Carregando estoque...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar estoque</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadProducts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-gray-600 mt-1">Gerencie seu inventário de forma eficiente</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={importData}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.categoriesCount} categorias
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor em estoque
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Produtos com estoque baixo
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Produtos sem estoque
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome, SKU, código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="discontinued">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os fornecedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
      </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowStock"
                checked={showLowStockOnly}
                onCheckedChange={(checked) => setShowLowStockOnly(checked as boolean)}
              />
              <Label htmlFor="lowStock" className="text-sm">Apenas estoque baixo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="outOfStock"
                checked={showOutOfStockOnly}
                onCheckedChange={(checked) => setShowOutOfStockOnly(checked as boolean)}
              />
              <Label htmlFor="outOfStock" className="text-sm">Apenas sem estoque</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSelectedSupplier('all');
                  setShowLowStockOnly(false);
                  setShowOutOfStockOnly(false);
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Produtos ({filteredProducts.length} de {products.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Ordenar por:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="quantity">Quantidade</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                  <SelectItem value="lastMovement">Última movimentação</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
                  <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Produto</th>
                  <th className="text-left py-3 px-2 font-semibold">SKU</th>
                  <th className="text-left py-3 px-2 font-semibold">Categoria</th>
                  <th className="text-left py-3 px-2 font-semibold">Marca</th>
                  <th className="text-left py-3 px-2 font-semibold">Quantidade</th>
                  <th className="text-left py-3 px-2 font-semibold">Status</th>
                  <th className="text-left py-3 px-2 font-semibold">Preço</th>
                  <th className="text-left py-3 px-2 font-semibold">Localização</th>
                  <th className="text-left py-3 px-2 font-semibold">Ações</th>
                    </tr>
                  </thead>
              <tbody>
                {currentProducts.map((product) => {
                  const status = getStockStatus(product.quantity, product.minQuantity);
                  const StatusIcon = status.icon;
                  
                      return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                          </td>
                      <td className="py-3 px-2 text-sm text-gray-600">{product.sku}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">{product.category}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">{product.brand}</td>
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          <div className="font-medium">{product.quantity}</div>
                          <div className="text-gray-500">Min: {product.minQuantity}</div>
                        </div>
                          </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                              {status.text}
                        </Badge>
                          </td>
                      <td className="py-3 px-2 text-sm">
                        <div>
                          <div className="font-medium">R$ {product.price.toFixed(2)}</div>
                          <div className="text-gray-500">Custo: R$ {product.costPrice.toFixed(2)}</div>
                        </div>
                          </td>
                      <td className="py-3 px-2 text-sm text-gray-600">{product.location}</td>
                      <td className="py-3 px-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                          </td>
                    </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} produtos
            </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
          </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
        </div>
      </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 