import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Upload,
  Plus,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  BarChart3,
  RefreshCw,
  DollarSign,
  Layers
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Product, InventoryStats } from '../../types/inventory';
import { InventoryService } from '../../services/inventoryService';
import { CategoryModal } from '../../components/CategoryModal';
import { CategoriaDto } from '../../types/category';

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
.ld-stat-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);padding:18px 20px;position:relative;overflow:hidden;display:flex;align-items:flex-start;gap:14px;}
.ld-stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-stat-ico{width:40px;height:40px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ld-stat-val{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);line-height:1.1;}
.ld-stat-lbl{font-size:11px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;color:var(--ink3);margin-top:4px;}
.ld-table{width:100%;border-collapse:collapse;}
.ld-table th{font-size:10.5px;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink3);padding:11px 14px;text-align:left;border-bottom:1px solid var(--bdr);background:rgba(247,244,239,0.45);}
.ld-table td{font-size:13px;color:var(--ink2);padding:13px 14px;border-bottom:1px solid rgba(26,24,20,0.05);transition:background 0.15s;}
.ld-table tbody tr:hover td{background:rgba(247,244,239,0.5);}
.ld-table tbody tr:last-child td{border-bottom:none;}
.ld-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap;}
.ld-badge-green{background:#E8F5E9;color:#1E8449;}
.ld-badge-yellow{background:#FFF8E1;color:#B7770D;}
.ld-badge-orange{background:#FFF3E0;color:#E67E22;}
.ld-badge-red{background:#FDEDEC;color:#C0392B;}
.ld-badge-gray{background:#F2F2F2;color:var(--ink3);}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover{background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.ld-btn-danger-soft{background:#fff;color:#C0392B;border:1px solid rgba(192,57,43,0.2);}
.ld-btn-danger-soft:hover{background:#FDEDEC;}
.ld-btn-sm{padding:5px 10px;font-size:12px;}
.ld-filter-row{background:rgba(247,244,239,0.4);border:1px solid var(--bdr);border-radius:10px;padding:16px 20px;}
.ld-filter-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:12px;align-items:end;}
.ld-lbl{font-size:11.5px;font-weight:500;color:var(--ink2);display:block;margin-bottom:5px;}
.ld-inp-ico-wrap{position:relative;}
.ld-inp-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
.ld-pagination{display:flex;align-items:center;gap:6px;}
.ld-pg-btn{height:30px;min-width:30px;padding:0 8px;border-radius:6px;border:1px solid var(--bdr);background:#fff;cursor:pointer;font-size:12px;color:var(--ink2);font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;justify-content:center;transition:all 0.2s;}
.ld-pg-btn:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-pg-btn:disabled{opacity:0.35;cursor:not-allowed;}
.ld-loading{display:flex;align-items:center;justify-content:center;min-height:300px;gap:10px;color:var(--ink3);font-size:14px;}
.ld-empty{padding:48px 20px;text-align:center;color:var(--ink3);}
.ld-product-name{font-weight:600;color:var(--ink);font-size:13px;}
.ld-product-sub{font-size:11px;color:var(--ink3);margin-top:2px;}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
.ld-a3{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.14s both;}
.ld-a4{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.21s both;}
@media(max-width:900px){.ld-stat-grid{grid-template-columns:repeat(2,1fr);}.ld-filter-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:640px){.ld-stat-grid{grid-template-columns:1fr 1fr;}.ld-filter-grid{grid-template-columns:1fr;}}
`;

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
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { loadProducts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProducts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const { products, stats, pagination, message } = await InventoryService.getInventoryData(page, itemsPerPage);
      setProducts(products);
      setFilteredProducts(products);
      setStats(stats);
      if (pagination) {
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
        setCurrentPage(pagination.page);
      }
      if (message) {
        toast({ title: "Informação", description: message, variant: "default" });
      } else {
        toast({ title: "Sucesso", description: "Produtos carregados com sucesso", variant: "default" });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      setError(errorMessage);
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => navigate(`/inventory/view/${product.id}`);
  const handleEditProduct = (product: Product) => navigate(`/inventory/edit/${product.id}`);
  const handleDeleteProduct = (product: Product) => { setProductToDelete(product); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await InventoryService.deleteProduct(productToDelete.id);
      toast({ title: "Sucesso", description: "Produto excluído com sucesso", variant: "default" });
      await loadProducts();
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produto';
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleCategorySelected = (category: CategoriaDto) => {
    navigate('/inventory/new-product', { state: { category } });
  };

  useEffect(() => {
    let filtered = [...products];
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') filtered = filtered.filter(p => p.category === selectedCategory);
    if (selectedStatus !== 'all') filtered = filtered.filter(p => p.status === selectedStatus);
    if (selectedSupplier !== 'all') filtered = filtered.filter(p => p.supplier === selectedSupplier);
    if (showLowStockOnly) filtered = filtered.filter(p => p.quantity <= p.minQuantity && p.quantity > 0);
    if (showOutOfStockOnly) filtered = filtered.filter(p => p.quantity === 0);
    filtered.sort((a, b) => {
      let aV: string | number = a[sortBy as keyof Product] as string | number;
      let bV: string | number = b[sortBy as keyof Product] as string | number;
      if (typeof aV === 'string') { aV = aV.toLowerCase(); bV = (bV as string).toLowerCase(); }
      return sortOrder === 'asc' ? (aV < bV ? -1 : aV > bV ? 1 : 0) : (aV > bV ? -1 : aV < bV ? 1 : 0);
    });
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedSupplier, sortBy, sortOrder, showLowStockOnly, showOutOfStockOnly]);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))).sort(), [products]);
  const suppliers = useMemo(() => Array.from(new Set(products.map(p => p.supplier))).sort(), [products]);

  const getStockBadge = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return <span className="ld-badge ld-badge-red">Sem Estoque</span>;
    if (quantity <= minQuantity) return <span className="ld-badge ld-badge-orange">Baixo ({quantity})</span>;
    return <span className="ld-badge ld-badge-green">Em Estoque ({quantity})</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <span className="ld-badge ld-badge-green">Ativo</span>;
    if (status === 'inactive') return <span className="ld-badge ld-badge-gray">Inativo</span>;
    return <span className="ld-badge ld-badge-red">Descontinuado</span>;
  };

  if (loading) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-loading">
          <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--gold)' }} />
          <span>Carregando estoque...</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, textAlign: 'center' }}>
          <XCircle size={40} style={{ color: '#C0392B' }} />
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700 }}>Erro ao carregar estoque</h3>
          <p style={{ color: 'var(--ink3)', fontSize: 13 }}>{error}</p>
          <button className="ld-btn ld-btn-outline" onClick={() => loadProducts()}>
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
            <span className="ld-tag">Operações</span>
            <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Package size={22} color="var(--gold)" />
              Estoque
            </h1>
            <p className="ld-sub" style={{ marginTop: 4 }}>Gerencie produtos, categorias e movimentações</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="ld-btn ld-btn-outline">
              <Download size={13} /> Exportar
            </button>
            <button className="ld-btn ld-btn-outline">
              <Upload size={13} /> Importar
            </button>
            <button className="ld-btn ld-btn-dark" onClick={() => setShowCategoryModal(true)}>
              <Plus size={13} /> Novo Produto
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="ld-stat-grid ld-a2">
          {[
            { label: 'Total de Produtos', value: String(stats.totalProducts), ico: Package, icoStyle: { background: 'var(--gold-light)' }, icoColor: 'var(--gold)' },
            { label: 'Valor Total', value: `R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, ico: DollarSign, icoStyle: { background: '#E8F5E9' }, icoColor: '#27AE60' },
            { label: 'Estoque Baixo', value: String(stats.lowStockItems), ico: AlertTriangle, icoStyle: { background: '#FFF3E0' }, icoColor: '#E67E22' },
            { label: 'Sem Estoque', value: String(stats.outOfStockItems), ico: XCircle, icoStyle: { background: '#FDEDEC' }, icoColor: '#C0392B' },
          ].map((s) => {
            const Icon = s.ico;
            return (
              <div key={s.label} className="ld-stat-card">
                <div className="ld-stat-ico" style={s.icoStyle}><Icon size={18} color={s.icoColor} /></div>
                <div>
                  <div className="ld-stat-val">{s.value}</div>
                  <div className="ld-stat-lbl">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtros */}
        <div className="ld-filter-row ld-a3">
          <div className="ld-filter-grid">
            <div>
              <label className="ld-lbl">Buscar produto</label>
              <div className="ld-inp-ico-wrap">
                <Search size={14} className="ld-inp-ico" />
                <Input
                  placeholder="Nome, SKU ou marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>
            <div>
              <label className="ld-lbl">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="ld-lbl">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="discontinued">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="ld-lbl">Fornecedor</label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink2)', cursor: 'pointer' }}>
              <Checkbox checked={showLowStockOnly} onCheckedChange={(c) => setShowLowStockOnly(c as boolean)} />
              Apenas estoque baixo
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink2)', cursor: 'pointer' }}>
              <Checkbox checked={showOutOfStockOnly} onCheckedChange={(c) => setShowOutOfStockOnly(c as boolean)} />
              Apenas sem estoque
            </label>
          </div>
        </div>

        {/* Tabela */}
        <div className="ld-card ld-a4">
          <div className="ld-card-body" style={{ paddingBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span className="ld-section-title">
                  <Layers size={16} color="var(--gold)" />
                  Produtos
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink3)', marginLeft: 10 }}>
                  {filteredProducts.length} de {totalItems}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger style={{ width: 140, height: 32, fontSize: 12 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                    <SelectItem value="quantity">Quantidade</SelectItem>
                    <SelectItem value="price">Preço</SelectItem>
                    <SelectItem value="category">Categoria</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  className="ld-btn ld-btn-outline ld-btn-sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{ padding: '5px 8px' }}
                >
                  <ArrowUpDown size={13} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {filteredProducts.length > 0 ? (
              <table className="ld-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>SKU</th>
                    <th>Categoria</th>
                    <th>Marca</th>
                    <th>Estoque</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="ld-product-name">{product.name}</div>
                        <div className="ld-product-sub">{product.supplier}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{product.sku}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td>{getStockBadge(product.quantity, product.maxQuantity)}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
                          Custo: R$ {product.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td>{getStatusBadge(product.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="ld-btn ld-btn-outline ld-btn-sm" style={{ padding: '5px 8px' }}>
                              <MoreHorizontal size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                              <Eye size={13} style={{ marginRight: 8 }} /> Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit size={13} style={{ marginRight: 8 }} /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(product)}>
                              <Trash2 size={13} style={{ marginRight: 8 }} /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="ld-empty">
                <Package size={40} style={{ color: 'var(--bdr)', margin: '0 auto 16px' }} />
                <div style={{ fontWeight: 600, fontSize: 15, fontFamily: "'Cormorant Garamond',serif", color: 'var(--ink2)', marginBottom: 6 }}>
                  Nenhum produto encontrado
                </div>
                <p style={{ fontSize: 12, marginBottom: 16 }}>
                  {products.length === 0
                    ? 'Não há produtos cadastrados no estoque ainda.'
                    : 'Nenhum produto corresponde aos filtros aplicados.'}
                </p>
                <button className="ld-btn ld-btn-dark" onClick={() => setShowCategoryModal(true)}>
                  <Plus size={13} /> Adicionar Produto
                </button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="ld-card-body" style={{ paddingTop: 14, borderTop: '1px solid var(--bdr)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--ink3)' }}>
                  Página {currentPage} de {totalPages} — {totalItems} produtos no total
                </span>
                <div className="ld-pagination">
                  <button className="ld-pg-btn" disabled={currentPage === 1} onClick={() => loadProducts(currentPage - 1)}>←</button>
                  <span style={{ fontSize: 12, color: 'var(--ink3)', padding: '0 4px' }}>{currentPage} / {totalPages}</span>
                  <button className="ld-pg-btn" disabled={currentPage === totalPages} onClick={() => loadProducts(currentPage + 1)}>→</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Modal */}
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategorySelected={handleCategorySelected}
        />

        {/* Delete Confirm */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir <strong>{productToDelete?.name}</strong>?{' '}
                <span style={{ color: '#C0392B', fontWeight: 500 }}>Esta ação não pode ser desfeita.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button className="ld-btn ld-btn-outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancelar
              </button>
              <button
                className="ld-btn"
                style={{ background: '#C0392B', color: '#fff' }}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir Produto'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}
