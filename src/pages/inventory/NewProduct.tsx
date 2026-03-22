import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Package, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from '../../services/productService';
import { ProdutoRequest, CategoriaDto } from '../../types/category';

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.10);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:9.5px;font-weight:500;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:4px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.5vw,24px);font-weight:700;line-height:1.15;letter-spacing:-0.3px;color:var(--ink);}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px;margin-bottom:12px;}
.ld-sub{font-size:12px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:10px;border:1px solid var(--bdr);box-shadow:0 2px 12px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:16px 18px;}
.ld-form-section{border-bottom:1px solid var(--bdr);padding:14px 18px;}
.ld-form-section:last-of-type{border-bottom:none;}
.ld-form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.ld-field{display:flex;flex-direction:column;gap:4px;}
.ld-field.full{grid-column:1/-1;}
.ld-lbl{font-size:11px;font-weight:500;color:var(--ink2);}
.ld-err{font-size:10.5px;color:#C0392B;display:flex;align-items:center;gap:3px;margin-top:1px;}
.ld-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.18s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover:not(:disabled){background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ld-cat-tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;background:var(--gold-light);color:var(--gold);border-radius:16px;font-size:11px;font-weight:500;}
.ld-summary-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bdr);}
.ld-summary-row:last-child{border-bottom:none;}
.ld-summary-lbl{font-size:11.5px;color:var(--ink3);}
.ld-summary-val{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:700;}
@keyframes ld-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.3s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.3s cubic-bezier(0.22,1,0.36,1) 0.06s both;}
@media(max-width:768px){.ld-form-grid-2{grid-template-columns:1fr;}.ld-pg-grid{grid-template-columns:1fr!important;}}
`;

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

interface ProductFormProps {
  selectedCategory: CategoriaDto;
}

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
    if (!product.nome.trim()) newErrors.nome = 'Nome do produto é obrigatório';
    if (!product.sku.trim()) newErrors.sku = 'SKU é obrigatório';
    if (product.precoCusto <= 0) newErrors.precoCusto = 'Preço de custo deve ser maior que zero';
    if (product.precoVenda <= 0) newErrors.precoVenda = 'Preço de venda deve ser maior que zero';
    if (product.precoVenda <= product.precoCusto) newErrors.precoVenda = 'Preço de venda deve ser maior que o preço de custo';
    if (product.quantidadeEstoque < 0) newErrors.quantidadeEstoque = 'Quantidade não pode ser negativa';
    if (product.quantidadeMinima < 0) newErrors.quantidadeMinima = 'Quantidade mínima não pode ser negativa';
    if (!product.marca.trim()) newErrors.marca = 'Marca é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Erro", description: "Por favor, corrija os erros no formulário", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await ProductService.createProduct(product);
      toast({ title: "Sucesso", description: "Produto cadastrado com sucesso!", variant: "default" });
      navigate('/inventory');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar produto';
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProdutoRequest, value: string | number) => {
    setProduct(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const formatCurrency = (value: number): string => {
    if (value === 0) return '';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  };

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/\D/g, '')) / 100;
  };

  const handleCurrencyChange = (field: 'precoCusto' | 'precoVenda', value: string) => {
    const numericValue = parseCurrency(value);
    setProduct(prev => ({ ...prev, [field]: numericValue }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const margin = product.precoVenda - product.precoCusto;
  const marginPct = product.precoCusto > 0 ? (margin / product.precoCusto * 100).toFixed(1) : '0';

  return (
    <>
      <style>{LDCSS}</style>
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Header */}
        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <button className="ld-btn ld-btn-outline" style={{ padding: '6px 8px' }} onClick={() => navigate('/inventory')}>
              <ArrowLeft size={13} />
            </button>
            <div>
              <span className="ld-tag">Estoque</span>
              <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={17} color="var(--gold)" />
                Novo Produto
              </h1>
              <p className="ld-sub" style={{ marginTop: 2 }}>Cadastre um novo produto no estoque</p>
            </div>
          </div>
          <span className="ld-cat-tag">
            <Package size={10} />
            {selectedCategory.nome}
          </span>
        </div>

        <div className="ld-pg-grid ld-a2" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 14 }}>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            <div className="ld-card" style={{ marginBottom: 12 }}>
              <div className="ld-form-section">
                <h2 className="ld-h2">
                  <Package size={13} color="var(--gold)" /> Dados do Produto
                </h2>
                <div className="ld-form-grid-2">
                  <div className="ld-field full">
                    <label className="ld-lbl">Nome do Produto *</label>
                    <Input placeholder="Ex: Cadeira Gamer RGB" value={product.nome} onChange={(e) => handleInputChange('nome', e.target.value)} disabled={loading} style={errors.nome ? { borderColor: '#C0392B' } : {}} />
                    {errors.nome && <span className="ld-err"><AlertCircle size={10} />{errors.nome}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">SKU *</label>
                    <Input placeholder="Ex: KWOE-38" value={product.sku} onChange={(e) => handleInputChange('sku', e.target.value)} disabled={loading} style={errors.sku ? { borderColor: '#C0392B' } : {}} />
                    {errors.sku && <span className="ld-err"><AlertCircle size={10} />{errors.sku}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">Marca *</label>
                    <Input placeholder="Ex: Kabum" value={product.marca} onChange={(e) => handleInputChange('marca', e.target.value)} disabled={loading} style={errors.marca ? { borderColor: '#C0392B' } : {}} />
                    {errors.marca && <span className="ld-err"><AlertCircle size={10} />{errors.marca}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">Unidade de Medida</label>
                    <Select value={product.unidadeMedida} onValueChange={(v) => handleInputChange('unidadeMedida', v)} disabled={loading}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {unidadesMedida.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="ld-form-section">
                <h2 className="ld-h2">
                  <span style={{ color: 'var(--gold)' }}>R$</span> Preços
                </h2>
                <div className="ld-form-grid-2">
                  <div className="ld-field">
                    <label className="ld-lbl">Preço de Custo *</label>
                    <Input type="text" placeholder="R$ 0,00" value={formatCurrency(product.precoCusto)} onChange={(e) => handleCurrencyChange('precoCusto', e.target.value)} disabled={loading} style={errors.precoCusto ? { borderColor: '#C0392B' } : {}} />
                    {errors.precoCusto && <span className="ld-err"><AlertCircle size={10} />{errors.precoCusto}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">Preço de Venda *</label>
                    <Input type="text" placeholder="R$ 0,00" value={formatCurrency(product.precoVenda)} onChange={(e) => handleCurrencyChange('precoVenda', e.target.value)} disabled={loading} style={errors.precoVenda ? { borderColor: '#C0392B' } : {}} />
                    {errors.precoVenda && <span className="ld-err"><AlertCircle size={10} />{errors.precoVenda}</span>}
                  </div>
                </div>
              </div>

              <div className="ld-form-section">
                <h2 className="ld-h2">
                  <span style={{ color: 'var(--gold)' }}>#</span> Controle de Estoque
                </h2>
                <div className="ld-form-grid-2">
                  <div className="ld-field">
                    <label className="ld-lbl">Quantidade Inicial</label>
                    <Input type="number" min="0" placeholder="0" value={product.quantidadeEstoque || ''} onChange={(e) => handleInputChange('quantidadeEstoque', parseInt(e.target.value) || 0)} disabled={loading} />
                    {errors.quantidadeEstoque && <span className="ld-err"><AlertCircle size={10} />{errors.quantidadeEstoque}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">Quantidade Mínima (alerta)</label>
                    <Input type="number" min="0" placeholder="0" value={product.quantidadeMinima || ''} onChange={(e) => handleInputChange('quantidadeMinima', parseInt(e.target.value) || 0)} disabled={loading} />
                    {errors.quantidadeMinima && <span className="ld-err"><AlertCircle size={10} />{errors.quantidadeMinima}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="ld-btn ld-btn-outline" onClick={() => navigate('/inventory')} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="ld-btn ld-btn-dark" disabled={loading} style={{ minWidth: 120 }}>
                {loading ? <><Loader2 size={13} className="animate-spin" />Salvando...</> : <><Save size={13} />Salvar Produto</>}
              </button>
            </div>
          </form>

          {/* Painel Lateral */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="ld-card">
              <div className="ld-card-body">
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
                  Resumo Financeiro
                </div>
                {[
                  { label: 'Margem bruta', value: formatCurrency(margin) || 'R$ 0,00', color: margin > 0 ? '#1E8449' : 'var(--ink3)' },
                  { label: 'Margem %', value: `${marginPct}%`, color: parseFloat(marginPct) > 0 ? '#1E8449' : 'var(--ink3)' },
                  { label: 'Valor em estoque', value: formatCurrency(product.quantidadeEstoque * product.precoCusto) || 'R$ 0,00', color: 'var(--ink)' },
                ].map(item => (
                  <div key={item.label} className="ld-summary-row">
                    <span className="ld-summary-lbl">{item.label}</span>
                    <span className="ld-summary-val" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--gold-light)', border: '1px solid rgba(184,146,42,0.18)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Dica</div>
              <p style={{ fontSize: '11.5px', color: 'var(--ink2)', lineHeight: 1.5 }}>
                O preço de venda deve ser maior que o custo para garantir margem de lucro positiva.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
