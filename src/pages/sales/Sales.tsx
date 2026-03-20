import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  ExternalLink,
  Zap,
  RefreshCw,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpDown,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_LOAD_ERROR_MESSAGE } from '@/lib/errorMessages';

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(22px,3vw,32px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);}
.ld-sub{font-size:13px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:20px 24px;}
.ld-section-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;}
.ld-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
.ld-stat-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 10px rgba(26,24,20,0.04);padding:18px 20px;position:relative;overflow:hidden;}
.ld-stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-stat-ico{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
.ld-stat-val{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);line-height:1.1;}
.ld-stat-lbl{font-size:11px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;color:var(--ink3);margin-top:5px;}
.ld-stat-sub{font-size:11px;color:var(--ink3);margin-top:4px;}
.ld-status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.ld-status-card{background:#fff;border-radius:10px;border:1px solid var(--bdr);padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}
.ld-table{width:100%;border-collapse:collapse;}
.ld-table th{font-size:10.5px;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink3);padding:11px 14px;text-align:left;border-bottom:1px solid var(--bdr);background:rgba(247,244,239,0.45);}
.ld-table td{font-size:13px;color:var(--ink2);padding:13px 14px;border-bottom:1px solid rgba(26,24,20,0.05);transition:background 0.15s;}
.ld-table tbody tr:hover td{background:rgba(247,244,239,0.5);}
.ld-table tbody tr:last-child td{border-bottom:none;}
.ld-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap;}
.ld-badge-green{background:#E8F5E9;color:#1E8449;}
.ld-badge-yellow{background:#FFF8E1;color:#B7770D;}
.ld-badge-red{background:#FDEDEC;color:#C0392B;}
.ld-badge-blue{background:#EBF5FB;color:#1A5276;}
.ld-badge-purple{background:#F3E5F5;color:#7D3C98;}
.ld-badge-gray{background:#F2F2F2;color:var(--ink3);}
.ld-badge-ml{background:#FFF9C4;color:#B7770D;}
.ld-badge-az{background:#FFF3E0;color:#E67E22;}
.ld-badge-sh{background:#FDEDEC;color:#C0392B;}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover{background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.ld-btn-sm{padding:5px 12px;font-size:12px;}
.ld-filter-row{background:rgba(247,244,239,0.4);border:1px solid var(--bdr);border-radius:10px;padding:16px 20px;}
.ld-filter-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:12px;align-items:end;}
.ld-lbl{font-size:11.5px;font-weight:500;color:var(--ink2);display:block;margin-bottom:5px;}
.ld-inp-ico-wrap{position:relative;}
.ld-inp-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
.ld-pagination{display:flex;align-items:center;gap:6px;}
.ld-pg-btn{height:30px;min-width:30px;padding:0 8px;border-radius:6px;border:1px solid var(--bdr);background:#fff;cursor:pointer;font-size:12px;color:var(--ink2);font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;justify-content:center;transition:all 0.2s;}
.ld-pg-btn:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-pg-btn.active{background:var(--ink);color:#fff;border-color:var(--ink);}
.ld-pg-btn:disabled{opacity:0.35;cursor:not-allowed;}
.ld-loading{display:flex;align-items:center;justify-content:center;min-height:300px;gap:10px;color:var(--ink3);font-size:14px;}
.ld-error{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:12px;text-align:center;}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
.ld-a3{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.14s both;}
.ld-a4{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.21s both;}
.ld-a5{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.28s both;}
@media(max-width:900px){.ld-stat-grid{grid-template-columns:repeat(2,1fr);}.ld-status-grid{grid-template-columns:1fr 1fr;}.ld-filter-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:640px){.ld-stat-grid{grid-template-columns:1fr 1fr;}.ld-filter-grid{grid-template-columns:1fr;}.ld-status-grid{grid-template-columns:1fr;}}
`;

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

  const mockSales: Sale[] = [
    { id: '1', orderId: 'ML123456789', marketplace: 'mercadolivre', productName: 'Smartphone Samsung Galaxy S23', customerName: 'João Silva', quantity: 1, price: 2999.99, totalValue: 2999.99, status: 'delivered', orderDate: '2024-01-15', shippingDate: '2024-01-16', deliveryDate: '2024-01-18', trackingCode: 'BR123456789BR' },
    { id: '2', orderId: 'AMZ987654321', marketplace: 'amazon', productName: 'Notebook Dell Inspiron 15', customerName: 'Maria Santos', quantity: 1, price: 4599.99, totalValue: 4599.99, status: 'shipped', orderDate: '2024-01-14', shippingDate: '2024-01-15', trackingCode: 'AMZ987654321' },
    { id: '3', orderId: 'ML987654321', marketplace: 'mercadolivre', productName: 'Cadeira Gamer RGB', customerName: 'Pedro Costa', quantity: 1, price: 899.99, totalValue: 899.99, status: 'processing', orderDate: '2024-01-13' },
    { id: '4', orderId: 'SHOP123456789', marketplace: 'shopee', productName: 'Monitor LG 24" Full HD', customerName: 'Ana Oliveira', quantity: 2, price: 799.99, totalValue: 1599.98, status: 'pending', orderDate: '2024-01-12' },
    { id: '5', orderId: 'ML555666777', marketplace: 'mercadolivre', productName: 'Mesa Escritório Branca', customerName: 'Carlos Lima', quantity: 1, price: 599.99, totalValue: 599.99, status: 'delivered', orderDate: '2024-01-10', shippingDate: '2024-01-11', deliveryDate: '2024-01-13', trackingCode: 'BR555666777BR' },
  ];

  const marketplaces = ['Mercado Livre', 'Amazon', 'Shopee'];
  const statusOptions = ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'];

  useEffect(() => { loadSales(); }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSales(mockSales);
      setFilteredSales(mockSales);
      const totalRevenue = mockSales.reduce((sum, s) => sum + s.totalValue, 0);
      setStats({
        totalSales: mockSales.length,
        totalRevenue,
        averageOrderValue: totalRevenue / mockSales.length,
        conversionRate: 3.2,
        pendingOrders: mockSales.filter(s => s.status === 'pending').length,
        shippedOrders: mockSales.filter(s => s.status === 'shipped').length,
        deliveredOrders: mockSales.filter(s => s.status === 'delivered').length,
      });
    } catch {
      setError(DEFAULT_LOAD_ERROR_MESSAGE);
      toast({ title: "Erro", description: DEFAULT_LOAD_ERROR_MESSAGE, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...sales];
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedMarketplace !== 'all') {
      const mp: Record<string, string> = { 'Mercado Livre': 'mercadolivre', 'Amazon': 'amazon', 'Shopee': 'shopee' };
      filtered = filtered.filter(s => s.marketplace === mp[selectedMarketplace]);
    }
    if (selectedStatus !== 'all') {
      const st: Record<string, string> = { 'Pendente': 'pending', 'Processando': 'processing', 'Enviado': 'shipped', 'Entregue': 'delivered', 'Cancelado': 'cancelled' };
      filtered = filtered.filter(s => s.status === st[selectedStatus]);
    }
    filtered.sort((a, b) => {
      let aV: string | number | Date = sortBy === 'orderDate' ? new Date(a.orderDate) : sortBy === 'totalValue' ? a.totalValue : sortBy === 'customerName' ? a.customerName : new Date(a.orderDate);
      let bV: string | number | Date = sortBy === 'orderDate' ? new Date(b.orderDate) : sortBy === 'totalValue' ? b.totalValue : sortBy === 'customerName' ? b.customerName : new Date(b.orderDate);
      return sortOrder === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1);
    });
    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [sales, searchTerm, selectedMarketplace, selectedStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      pending: { cls: 'ld-badge ld-badge-yellow', label: '⏳ Pendente' },
      processing: { cls: 'ld-badge ld-badge-blue', label: '⚡ Processando' },
      shipped: { cls: 'ld-badge ld-badge-purple', label: '📦 Enviado' },
      delivered: { cls: 'ld-badge ld-badge-green', label: '✓ Entregue' },
      cancelled: { cls: 'ld-badge ld-badge-red', label: '✕ Cancelado' },
    };
    const s = map[status] || { cls: 'ld-badge ld-badge-gray', label: status };
    return <span className={s.cls}>{s.label}</span>;
  };

  const getMpBadge = (mp: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      mercadolivre: { cls: 'ld-badge ld-badge-ml', label: 'ML' },
      amazon: { cls: 'ld-badge ld-badge-az', label: 'AZ' },
      shopee: { cls: 'ld-badge ld-badge-sh', label: 'SH' },
    };
    const m = map[mp] || { cls: 'ld-badge ld-badge-gray', label: mp };
    return <span className={m.cls}>{m.label}</span>;
  };

  const syncMarketplace = (mp: string) => {
    toast({ title: "Sincronizando vendas", description: `Buscando novas vendas do ${mp}...` });
  };

  if (loading) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-loading">
          <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--gold)' }} />
          <span>Carregando vendas...</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-error">
          <XCircle size={40} style={{ color: '#C0392B' }} />
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700 }}>Não foi possível carregar</h3>
          <p style={{ color: 'var(--ink3)', fontSize: 13 }}>{error}</p>
          <button className="ld-btn ld-btn-outline" onClick={loadSales}>
            <RefreshCw size={13} /> Tentar novamente
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{LDCSS}</style>
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="ld-tag">Comercial</span>
            <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 size={22} color="var(--gold)" />
              Gestão de Vendas
            </h1>
            <p className="ld-sub" style={{ marginTop: 4 }}>Gerencie suas vendas em todos os marketplaces</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="ld-btn ld-btn-outline" onClick={() => syncMarketplace('Mercado Livre')}>
              <Zap size={13} /> Sincronizar ML
            </button>
            <button className="ld-btn ld-btn-outline" onClick={() => syncMarketplace('Amazon')}>
              <Zap size={13} /> Sincronizar Amazon
            </button>
            <button className="ld-btn ld-btn-dark">
              <Plus size={13} /> Nova Venda
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="ld-stat-grid ld-a2">
          {[
            { label: 'Total de Vendas', value: String(stats.totalSales), sub: '+12% vs mês anterior', ico: ShoppingCart, icoStyle: { background: 'var(--gold-light)' }, icoColor: 'var(--gold)' },
            { label: 'Receita Total', value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: '+8% vs mês anterior', ico: TrendingUp, icoStyle: { background: '#E8F5E9' }, icoColor: '#27AE60' },
            { label: 'Ticket Médio', value: `R$ ${stats.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: 'Valor médio por pedido', ico: DollarSign, icoStyle: { background: '#EBF5FB' }, icoColor: '#2980B9' },
            { label: 'Taxa de Conversão', value: `${stats.conversionRate}%`, sub: '+2% vs mês anterior', ico: BarChart3, icoStyle: { background: '#F3E5F5' }, icoColor: '#8E44AD' },
          ].map((s) => {
            const Icon = s.ico;
            return (
              <div key={s.label} className="ld-stat-card">
                <div className="ld-stat-ico" style={s.icoStyle}><Icon size={18} color={s.icoColor} /></div>
                <div className="ld-stat-val">{s.value}</div>
                <div className="ld-stat-lbl">{s.label}</div>
                <div className="ld-stat-sub">{s.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Status Cards */}
        <div className="ld-status-grid ld-a3">
          <div className="ld-status-card">
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink3)' }}>Pedidos Pendentes</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: '#B7770D', marginTop: 4 }}>{stats.pendingOrders}</div>
            </div>
            <AlertTriangle size={28} color="#F0C050" />
          </div>
          <div className="ld-status-card">
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink3)' }}>Enviados</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: '#7D3C98', marginTop: 4 }}>{stats.shippedOrders}</div>
            </div>
            <Package size={28} color="#C39BD3" />
          </div>
          <div className="ld-status-card">
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink3)' }}>Entregues</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: '#1E8449', marginTop: 4 }}>{stats.deliveredOrders}</div>
            </div>
            <CheckCircle size={28} color="#82E0AA" />
          </div>
        </div>

        {/* Filtros */}
        <div className="ld-filter-row ld-a4">
          <div className="ld-filter-grid">
            <div>
              <label className="ld-lbl">Buscar</label>
              <div className="ld-inp-ico-wrap">
                <Search size={14} className="ld-inp-ico" />
                <Input
                  placeholder="ID do pedido, produto, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>
            <div>
              <label className="ld-lbl">Marketplace</label>
              <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os marketplaces</SelectItem>
                  {marketplaces.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="ld-lbl">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="ld-lbl">Ordenar</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="orderDate">Data do pedido</SelectItem>
                  <SelectItem value="totalValue">Valor total</SelectItem>
                  <SelectItem value="customerName">Cliente</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="ld-btn ld-btn-outline ld-btn-sm" onClick={() => { setSearchTerm(''); setSelectedMarketplace('all'); setSelectedStatus('all'); }}>
              Limpar filtros
            </button>
            <button className="ld-btn ld-btn-outline ld-btn-sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              <ArrowUpDown size={12} /> {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="ld-card ld-a5">
          <div className="ld-card-body" style={{ paddingBottom: 0 }}>
            <div style={{ marginBottom: 16 }}>
              <span className="ld-section-title">
                <ShoppingCart size={16} color="var(--gold)" />
                Vendas ({filteredSales.length} de {sales.length})
              </span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ld-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Marketplace</th>
                  <th>Produto</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13 }}>{sale.orderId}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>#{sale.id}</div>
                    </td>
                    <td>{getMpBadge(sale.marketplace)}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{sale.productName}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>Qtd: {sale.quantity}</div>
                    </td>
                    <td>{sale.customerName}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>R$ {sale.totalValue.toFixed(2)}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)' }}>R$ {sale.price.toFixed(2)} cada</div>
                    </td>
                    <td>{getStatusBadge(sale.status)}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>{new Date(sale.orderDate).toLocaleDateString('pt-BR')}</div>
                      {sale.trackingCode && (
                        <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{sale.trackingCode}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="ld-btn ld-btn-outline ld-btn-sm" style={{ padding: '5px 8px' }}>
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye size={13} style={{ marginRight: 8 }} />Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem><Edit size={13} style={{ marginRight: 8 }} />Editar status</DropdownMenuItem>
                          <DropdownMenuItem><ExternalLink size={13} style={{ marginRight: 8 }} />Ver no marketplace</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="ld-card-body" style={{ paddingTop: 14, borderTop: '1px solid var(--bdr)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--ink3)' }}>
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredSales.length)} de {filteredSales.length}
                </span>
                <div className="ld-pagination">
                  <button className="ld-pg-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>←</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`ld-pg-btn${currentPage === p ? ' active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                  ))}
                  <button className="ld-pg-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>→</button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
