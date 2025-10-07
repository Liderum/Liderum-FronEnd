import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ExternalLink,
  Zap,
  RefreshCw,
  Settings,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Download,
  Upload,
  Filter,
  Search
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

interface Sale {
  id: string;
  orderId: string;
  marketplace: 'mercadolivre' | 'amazon' | 'shopee';
  productName: string;
  customerName: string;
  quantity: number;
  price: number;
  totalValue: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingDate?: string;
  deliveryDate?: string;
  trackingCode?: string;
}

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0
  });
  const { toast } = useToast();

  // Dados mockados para demonstração
  const mockSales: Sale[] = [
    {
      id: '1',
      orderId: 'ML123456789',
      marketplace: 'mercadolivre',
      productName: 'Smartphone Samsung Galaxy S23',
      customerName: 'João Silva',
      quantity: 1,
      price: 2999.99,
      totalValue: 2999.99,
      status: 'delivered',
      orderDate: '2024-01-15',
      shippingDate: '2024-01-16',
      deliveryDate: '2024-01-18',
      trackingCode: 'BR123456789BR'
    },
    {
      id: '2',
      orderId: 'AMZ987654321',
      marketplace: 'amazon',
      productName: 'Notebook Dell Inspiron 15',
      customerName: 'Maria Santos',
      quantity: 1,
      price: 4599.99,
      totalValue: 4599.99,
      status: 'shipped',
      orderDate: '2024-01-14',
      shippingDate: '2024-01-15',
      trackingCode: 'AMZ987654321'
    },
    {
      id: '3',
      orderId: 'ML987654321',
      marketplace: 'mercadolivre',
      productName: 'Cadeira Gamer RGB',
      customerName: 'Pedro Costa',
      quantity: 1,
      price: 899.99,
      totalValue: 899.99,
      status: 'processing',
      orderDate: '2024-01-13'
    },
    {
      id: '4',
      orderId: 'SHOP123456789',
      marketplace: 'shopee',
      productName: 'Monitor LG 24" Full HD',
      customerName: 'Ana Oliveira',
      quantity: 2,
      price: 799.99,
      totalValue: 1599.98,
      status: 'pending',
      orderDate: '2024-01-12'
    },
    {
      id: '5',
      orderId: 'ML555666777',
      marketplace: 'mercadolivre',
      productName: 'Mesa Escritório Branca',
      customerName: 'Carlos Lima',
      quantity: 1,
      price: 599.99,
      totalValue: 599.99,
      status: 'delivered',
      orderDate: '2024-01-10',
      shippingDate: '2024-01-11',
      deliveryDate: '2024-01-13',
      trackingCode: 'BR555666777BR'
    }
  ];

  const marketplaces = ['Mercado Livre', 'Amazon', 'Shopee'];
  const statusOptions = ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'];

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      // Simulando chamada da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSales(mockSales);
      setFilteredSales(mockSales);
      
      // Calculando estatísticas
      const totalRevenue = mockSales.reduce((sum, sale) => sum + sale.totalValue, 0);
      const averageOrderValue = totalRevenue / mockSales.length;
      const pendingOrders = mockSales.filter(s => s.status === 'pending').length;
      const shippedOrders = mockSales.filter(s => s.status === 'shipped').length;
      const deliveredOrders = mockSales.filter(s => s.status === 'delivered').length;
      
      setStats({
        totalSales: mockSales.length,
        totalRevenue,
        averageOrderValue,
        conversionRate: 3.2, // Mock
        pendingOrders,
        shippedOrders,
        deliveredOrders
      });
    } catch (err) {
      setError('Erro ao carregar vendas');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtros e busca
  useEffect(() => {
    let filtered = [...sales];

    // Busca por texto
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por marketplace
    if (selectedMarketplace !== 'all') {
      const marketplaceMap: { [key: string]: string } = {
        'Mercado Livre': 'mercadolivre',
        'Amazon': 'amazon',
        'Shopee': 'shopee'
      };
      filtered = filtered.filter(sale => sale.marketplace === marketplaceMap[selectedMarketplace]);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      const statusMap: { [key: string]: string } = {
        'Pendente': 'pending',
        'Processando': 'processing',
        'Enviado': 'shipped',
        'Entregue': 'delivered',
        'Cancelado': 'cancelled'
      };
      filtered = filtered.filter(sale => sale.status === statusMap[selectedStatus]);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'orderDate':
          aValue = new Date(a.orderDate);
          bValue = new Date(b.orderDate);
          break;
        case 'totalValue':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case 'customerName':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.orderDate);
          bValue = new Date(b.orderDate);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [sales, searchTerm, selectedMarketplace, selectedStatus, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Pendente',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle
        };
      case 'processing':
        return {
          text: 'Processando',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: RefreshCw
        };
      case 'shipped':
        return {
          text: 'Enviado',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Package
        };
      case 'delivered':
        return {
          text: 'Entregue',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'cancelled':
        return {
          text: 'Cancelado',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      default:
        return {
          text: 'Desconhecido',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertTriangle
        };
    }
  };

  const getMarketplaceInfo = (marketplace: string) => {
    switch (marketplace) {
      case 'mercadolivre':
        return {
          name: 'Mercado Livre',
          color: 'bg-yellow-100 text-yellow-800',
          icon: 'ML'
        };
      case 'amazon':
        return {
          name: 'Amazon',
          color: 'bg-orange-100 text-orange-800',
          icon: 'AZ'
        };
      case 'shopee':
        return {
          name: 'Shopee',
          color: 'bg-red-100 text-red-800',
          icon: 'SH'
        };
      default:
        return {
          name: 'Desconhecido',
          color: 'bg-gray-100 text-gray-800',
          icon: '?'
        };
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const syncMarketplace = (marketplace: string) => {
    toast({
      title: "Sincronizando vendas",
      description: `Buscando novas vendas do ${marketplace}...`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Carregando vendas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar vendas</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadSales}>
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Vendas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas vendas em todos os marketplaces</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => syncMarketplace('Mercado Livre')}>
            <Zap className="h-4 w-4 mr-2" />
            Sincronizar ML
          </Button>
          <Button variant="outline" onClick={() => syncMarketplace('Amazon')}>
            <Zap className="h-4 w-4 mr-2" />
            Sincronizar Amazon
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
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
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> vs mês anterior
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
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> vs mês anterior
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
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor médio por pedido
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
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2%</span> vs mês anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-purple-600">{stats.shippedOrders}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
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
                  placeholder="ID do pedido, produto, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Marketplace</Label>
              <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os marketplaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os marketplaces</SelectItem>
                  {marketplaces.map(marketplace => (
                    <SelectItem key={marketplace} value={marketplace}>{marketplace}</SelectItem>
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
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ordenar por</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orderDate">Data do pedido</SelectItem>
                  <SelectItem value="totalValue">Valor total</SelectItem>
                  <SelectItem value="customerName">Cliente</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedMarketplace('all');
                setSelectedStatus('all');
              }}
            >
              Limpar filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Vendas ({filteredSales.length} de {sales.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Pedido</th>
                  <th className="text-left py-3 px-2 font-semibold">Marketplace</th>
                  <th className="text-left py-3 px-2 font-semibold">Produto</th>
                  <th className="text-left py-3 px-2 font-semibold">Cliente</th>
                  <th className="text-left py-3 px-2 font-semibold">Valor</th>
                  <th className="text-left py-3 px-2 font-semibold">Status</th>
                  <th className="text-left py-3 px-2 font-semibold">Data</th>
                  <th className="text-left py-3 px-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentSales.map((sale) => {
                  const statusInfo = getStatusInfo(sale.status);
                  const marketplaceInfo = getMarketplaceInfo(sale.marketplace);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium">{sale.orderId}</div>
                          <div className="text-sm text-gray-500">#{sale.id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className={marketplaceInfo.color}>
                          {marketplaceInfo.icon}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium">{sale.productName}</div>
                          <div className="text-sm text-gray-500">Qtd: {sale.quantity}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">{sale.customerName}</td>
                      <td className="py-3 px-2 text-sm">
                        <div className="font-medium">R$ {sale.totalValue.toFixed(2)}</div>
                        <div className="text-gray-500">R$ {sale.price.toFixed(2)} cada</div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <div>{new Date(sale.orderDate).toLocaleDateString('pt-BR')}</div>
                        {sale.trackingCode && (
                          <div className="text-xs text-gray-500">Rastreamento: {sale.trackingCode}</div>
                        )}
                      </td>
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
                              Editar status
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver no marketplace
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
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredSales.length)} de {filteredSales.length} vendas
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
