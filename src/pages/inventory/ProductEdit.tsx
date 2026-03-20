import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Package, AlertCircle, DollarSign, Hash, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { InventoryService } from '../../services/inventoryService';
import { CategoryService } from '../../services/productService';
import { Product } from '../../types/inventory';
import { ProdutoRequest, CategoriaDto } from '../../types/category';

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(20px,3vw,28px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:7px;margin-bottom:14px;}
.ld-sub{font-size:13px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:20px 24px;}
.ld-form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ld-field{display:flex;flex-direction:column;gap:5px;}
.ld-lbl{font-size:11.5px;font-weight:500;color:var(--ink2);}
.ld-err{font-size:11px;color:#C0392B;display:flex;align-items:center;gap:4px;}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:7px;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover:not(:disabled){background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ld-divider{border:none;border-top:1px solid var(--bdr);margin:16px 0;}
.ld-summary-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bdr);}
.ld-summary-row:last-child{border-bottom:none;}
.ld-summary-lbl{font-size:12px;color:var(--ink3);}
.ld-summary-val{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;}
.ld-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:12px;color:var(--ink3);}
.ld-not-found{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:12px;text-align:center;}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
@media(max-width:640px){.ld-form-grid-2{grid-template-columns:1fr;}}
`;

const unidadesMedida = [
  { value: 'un', label: 'Unidade' }, { value: 'kg', label: 'Quilograma' }, { value: 'g', label: 'Grama' },
  { value: 'l', label: 'Litro' }, { value: 'ml', label: 'Mililitro' }, { value: 'm', label: 'Metro' },
  { value: 'cm', label: 'Centímetro' }, { value: 'cx', label: 'Caixa' }, { value: 'pct', label: 'Pacote' }, { value: 'dz', label: 'Dúzia' }
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
    nome: '', sku: '', precoCusto: 0, precoVenda: 0,
    quantidadeEstoque: 0, quantidadeMinima: 0, unidadeMedida: 'un', marca: '', categoriaId: ''
  });

  useEffect(() => { if (id) loadData(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => { await loadCategories(); await loadProduct(); };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : 'Erro ao carregar categorias', variant: "destructive" });
    } finally { setLoadingCategories(false); }
  };

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      const data = await InventoryService.getProductById(id!);
      setProduct(data);
      const categoria = categories.find(c => c.nome === data.category);
      setFormData({
        nome: data.name, sku: data.sku, precoCusto: data.costPrice, precoVenda: data.price,
        quantidadeEstoque: data.quantity, quantidadeMinima: data.minQuantity,
        marca: data.brand, categoriaId: categoria?.id || '', unidadeMedida: 'un'
      });
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : 'Erro ao carregar produto', variant: "destructive" });
      navigate('/inventory');
    } finally { setLoadingProduct(false); }
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.nome.trim()) e.nome = 'Nome obrigatório';
    if (!formData.sku.trim()) e.sku = 'SKU obrigatório';
    if (formData.precoCusto <= 0) e.precoCusto = 'Deve ser maior que zero';
    if (formData.precoVenda <= 0) e.precoVenda = 'Deve ser maior que zero';
    if (formData.precoVenda < formData.precoCusto) e.precoVenda = 'Deve ser maior que o custo';
    if (formData.quantidadeEstoque < 0) e.quantidadeEstoque = 'Não pode ser negativo';
    if (formData.quantidadeMinima < 0) e.quantidadeMinima = 'Não pode ser negativo';
    if (!formData.marca.trim()) e.marca = 'Marca obrigatória';
    if (!formData.categoriaId) e.categoriaId = 'Categoria obrigatória';
    if (!formData.unidadeMedida.trim()) e.unidadeMedida = 'Unidade obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast({ title: "Erro de Validação", description: "Corrija os erros no formulário", variant: "destructive" }); return; }
    try {
      setLoading(true);
      await InventoryService.updateProduct(id!, formData);
      toast({ title: "Sucesso", description: "Produto atualizado com sucesso", variant: "default" });
      navigate(`/inventory/view/${id}`);
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : 'Erro ao atualizar', variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const formatCurrency = (v: number) => v === 0 ? '' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  const parseCurrency = (v: string) => !v ? 0 : parseFloat(v.replace(/\D/g, '')) / 100;
  const handleCurrencyChange = (field: 'precoCusto' | 'precoVenda', v: string) => {
    setFormData(prev => ({ ...prev, [field]: parseCurrency(v) }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const margin = formData.precoVenda - formData.precoCusto;
  const marginPct = formData.precoCusto > 0 ? (margin / formData.precoCusto * 100).toFixed(1) : '0';

  if (loadingProduct || loadingCategories) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-loading">
          <Package size={36} color="var(--gold)" style={{ opacity: 0.5 }} className="animate-pulse" />
          <span style={{ fontSize: 13 }}>Carregando dados do produto...</span>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-not-found">
          <AlertCircle size={40} style={{ color: '#C0392B' }} />
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700 }}>Produto não encontrado</h3>
          <p style={{ fontSize: 13, color: 'var(--ink3)' }}>O produto solicitado não foi encontrado.</p>
          <button className="ld-btn ld-btn-outline" onClick={() => navigate('/inventory')}>
            <ArrowLeft size={14} /> Voltar ao Estoque
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
        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <button className="ld-btn ld-btn-outline" style={{ padding: '8px 10px', marginTop: 2 }} onClick={() => navigate(`/inventory/view/${id}`)}>
            <ArrowLeft size={14} />
          </button>
          <div>
            <span className="ld-tag">Estoque</span>
            <h1 className="ld-h1">Editar Produto</h1>
            <p className="ld-sub" style={{ marginTop: 4 }}>Modificando: <strong>{product.name}</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }} className="ld-a2">

            {/* Coluna Principal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Informações Básicas */}
              <div className="ld-card">
                <div className="ld-card-body">
                  <h2 className="ld-h2"><Package size={14} color="var(--gold)" /> Informações Básicas</h2>
                  <div className="ld-form-grid-2">
                    <div className="ld-field" style={{ gridColumn: '1/-1' }}>
                      <label className="ld-lbl">Nome do Produto *</label>
                      <Input value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} style={errors.nome ? { borderColor: '#C0392B' } : {}} />
                      {errors.nome && <span className="ld-err"><AlertCircle size={11} />{errors.nome}</span>}
                    </div>
                    <div className="ld-field">
                      <label className="ld-lbl">SKU *</label>
                      <Input value={formData.sku} onChange={(e) => handleInputChange('sku', e.target.value)} style={errors.sku ? { borderColor: '#C0392B' } : {}} placeholder="Ex: PROD-001" />
                      {errors.sku && <span className="ld-err"><AlertCircle size={11} />{errors.sku}</span>}
                    </div>
                    <div className="ld-field">
                      <label className="ld-lbl">Marca *</label>
                      <Input value={formData.marca} onChange={(e) => handleInputChange('marca', e.target.value)} style={errors.marca ? { borderColor: '#C0392B' } : {}} placeholder="Ex: Samsung" />
                      {errors.marca && <span className="ld-err"><AlertCircle size={11} />{errors.marca}</span>}
                    </div>
                    <div className="ld-field">
                      <label className="ld-lbl">Categoria *</label>
                      <Select value={formData.categoriaId} onValueChange={(v) => handleInputChange('categoriaId', v)}>
                        <SelectTrigger style={errors.categoriaId ? { borderColor: '#C0392B' } : {}}><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.categoriaId && <span className="ld-err"><AlertCircle size={11} />{errors.categoriaId}</span>}
                    </div>
                    <div className="ld-field">
                      <label className="ld-lbl">Unidade de Medida *</label>
                      <Select value={formData.unidadeMedida} onValueChange={(v) => handleInputChange('unidadeMedida', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{unidadesMedida.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preços */}
              <div className="ld-card">
                <div className="ld-card-body">
                  <h2 className="ld-h2"><DollarSign size={14} color="var(--gold)" /> Informações Financeiras</h2>
                  <div className="ld-form-grid-2">
                    <div className="ld-field">
                      <label className="ld-lbl">Preço de Custo *</label>
                      <Input type="text" placeholder="R$ 0,00" value={formatCurrency(formData.precoCusto)} onChange={(e) => handleCurrencyChange('precoCusto', e.target.value)} style={errors.precoCusto ? { borderColor: '#C0392B' } : {}} />
                      {errors.precoCusto && <span className="ld-err"><AlertCircle size={11} />{errors.precoCusto}</span>}
                    </div>
                    <div className="ld-field">
                      <label className="ld-lbl">Preço de Venda *</label>
                      <Input type="text" placeholder="R$ 0,00" value={formatCurrency(formData.precoVenda)} onChange={(e) => handleCurrencyChange('precoVenda', e.target.value)} style={errors.precoVenda ? { borderColor: '#C0392B' } : {}} />
                      {errors.precoVenda && <span className="ld-err"><AlertCircle size={11} />{errors.precoVenda}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estoque */}
              <div className="ld-card">
                <div className="ld-card-body">
                  <h2 className="ld-h2"><Hash size={14} color="var(--gold)" /> Controle de Estoque</h2>
                  <div className="ld-form-grid-2">
                    <div className="ld-field">
                      <label className="ld-lbl">Quantidade em Estoque *</label>
                      <Input type="number" min="0" value={formData.quantidadeEstoque} onChange={(e) => handleInputChange('quantidadeEstoque', parseInt(e.target.value) || 0)} style={errors.quantidadeEstoque ? { borderColor: '#C0392B' } : {}} />
                      {errors.quantidadeEstoque && <span className="ld-err"><AlertCircle size={11} />{errors.quantidadeEstoque}</span>}
                    </div>
                    <div className="ld-field">
                      <label className="ld-lbl">Quantidade Mínima *</label>
                      <Input type="number" min="0" value={formData.quantidadeMinima} onChange={(e) => handleInputChange('quantidadeMinima', parseInt(e.target.value) || 0)} style={errors.quantidadeMinima ? { borderColor: '#C0392B' } : {}} />
                      {errors.quantidadeMinima && <span className="ld-err"><AlertCircle size={11} />{errors.quantidadeMinima}</span>}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Coluna Lateral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="ld-card">
                <div className="ld-card-body">
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ink)' }}>
                    <TrendingUp size={14} color="var(--gold)" /> Resumo Financeiro
                  </div>
                  {[
                    { label: 'Margem bruta', value: formatCurrency(margin) || 'R$ 0,00', color: margin > 0 ? '#1E8449' : 'var(--ink3)' },
                    { label: 'Margem %', value: `${marginPct}%`, color: parseFloat(marginPct) > 0 ? '#1E8449' : 'var(--ink3)' },
                    { label: 'Valor em estoque', value: formatCurrency(formData.quantidadeEstoque * formData.precoCusto) || 'R$ 0,00', color: 'var(--ink)' },
                  ].map(item => (
                    <div key={item.label} className="ld-summary-row">
                      <span className="ld-summary-lbl">{item.label}</span>
                      <span className="ld-summary-val" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(247,244,239,0.6)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.6 }}>
                  As alterações serão aplicadas imediatamente ao produto no estoque.
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--bdr)' }}>
            <button type="button" className="ld-btn ld-btn-outline" onClick={() => navigate(`/inventory/view/${id}`)} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="ld-btn ld-btn-dark" disabled={loading} style={{ minWidth: 160 }}>
              {loading ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : <><Save size={14} />Salvar Alterações</>}
            </button>
          </div>
        </form>

      </div>
    </>
  );
}

export default ProductEdit;
