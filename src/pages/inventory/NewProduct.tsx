import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Package, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from '../../services/productService';
import { ProdutoRequest, CategoriaDto } from '../../types/category';

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(22px,3vw,30px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;}
.ld-sub{font-size:13px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:22px 24px;}
.ld-form-section{border-bottom:1px solid var(--bdr);padding:20px 24px;}
.ld-form-section:last-of-type{border-bottom:none;}
.ld-form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.ld-field{display:flex;flex-direction:column;gap:5px;}
.ld-field.full{grid-column:1/-1;}
.ld-lbl{font-size:11.5px;font-weight:500;color:var(--ink2);}
.ld-err{font-size:11px;color:#C0392B;display:flex;align-items:center;gap:4px;margin-top:2px;}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:7px;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover:not(:disabled){background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ld-cat-tag{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:var(--gold-light);color:var(--gold);border-radius:20px;font-size:12px;font-weight:500;}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
@media(max-width:640px){.ld-form-grid-2{grid-template-columns:1fr;}}
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
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <button className="ld-btn ld-btn-outline" style={{ padding: '8px 10px', marginTop: 2 }} onClick={() => navigate('/inventory')}>
              <ArrowLeft size={14} />
            </button>
            <div>
              <span className="ld-tag">Estoque</span>
              <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={20} color="var(--gold)" />
                Novo Produto
              </h1>
              <p className="ld-sub" style={{ marginTop: 4 }}>Cadastre um novo produto no estoque</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ld-cat-tag">
              <Package size={11} />
              {selectedCategory.nome}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }} className="ld-a2">

          {/* Formulário Principal */}
          <form onSubmit={handleSubmit}>
            <div className="ld-card" style={{ marginBottom: 16 }}>
              <div className="ld-form-section">
                <h2 className="ld-h2" style={{ marginBottom: 16 }}>
                  <Package size={15} color="var(--gold)" /> Dados do Produto
                </h2>
                <div className="ld-form-grid-2">
                  <div className="ld-field full">
                    <label className="ld-lbl">Nome do Produto *</label>
                    <Input
                      placeholder="Ex: Cadeira Gamer RGB"
                      value={product.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      disabled={loading}
                      style={errors.nome ? { borderColor: '#C0392B' } : {}}
                    />
                    {errors.nome && <span className="ld-err"><AlertCircle size={11} />{errors.nome}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">SKU *</label>
                    <Input
                      placeholder="Ex: KWOE-38"
                      value={product.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      disabled={loading}
                      style={errors.sku ? { borderColor: '#C0392B' } : {}}
                    />
                    {errors.sku && <span className="ld-err"><AlertCircle size={11} />{errors.sku}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">Marca *</label>
                    <Input
                      placeholder="Ex: Kabum"
                      value={product.marca}
                      onChange={(e) => handleInputChange('marca', e.target.value)}
                      disabled={loading}
                      style={errors.marca ? { borderColor: '#C0392B' } : {}}
                    />
                    {errors.marca && <span className="ld-err"><AlertCircle size={11} />{errors.marca}</span>}
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
                <h2 className="ld-h2" style={{ marginBottom: 16 }}>
                  <span style={{ color: 'var(--gold)' }}>R$</span> Preços
                </h2>
                <div className="ld-form-grid-2">
                  <div className="ld-field">
                    <label className="ld-lbl">Preço de Custo *</label>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(product.precoCusto)}
                      onChange={(e) => handleCurrencyChange('precoCusto', e.target.value)}
                      disabled={loading}
                      style={errors.precoCusto ? { borderColor: '#C0392B' } : {}}
                    />
                    {errors.precoCusto && <span className="ld-err"><AlertCircle size={11} />{errors.precoCusto}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">Preço de Venda *</label>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(product.precoVenda)}
                      onChange={(e) => handleCurrencyChange('precoVenda', e.target.value)}
                      disabled={loading}
                      style={errors.precoVenda ? { borderColor: '#C0392B' } : {}}
                    />
                    {errors.precoVenda && <span className="ld-err"><AlertCircle size={11} />{errors.precoVenda}</span>}
                  </div>
                </div>
              </div>

              <div className="ld-form-section">
                <h2 className="ld-h2" style={{ marginBottom: 16 }}>
                  <span style={{ color: 'var(--gold)' }}>#</span> Controle de Estoque
                </h2>
                <div className="ld-form-grid-2">
                  <div className="ld-field">
                    <label className="ld-lbl">Quantidade Inicial</label>
                    <Input
                      type="number" min="0" placeholder="0"
                      value={product.quantidadeEstoque || ''}
                      onChange={(e) => handleInputChange('quantidadeEstoque', parseInt(e.target.value) || 0)}
                      disabled={loading}
                    />
                    {errors.quantidadeEstoque && <span className="ld-err"><AlertCircle size={11} />{errors.quantidadeEstoque}</span>}
                  </div>
                  <div className="ld-field">
                    <label className="ld-lbl">Quantidade Mínima (alerta)</label>
                    <Input
                      type="number" min="0" placeholder="0"
                      value={product.quantidadeMinima || ''}
                      onChange={(e) => handleInputChange('quantidadeMinima', parseInt(e.target.value) || 0)}
                      disabled={loading}
                    />
                    {errors.quantidadeMinima && <span className="ld-err"><AlertCircle size={11} />{errors.quantidadeMinima}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="ld-btn ld-btn-outline" onClick={() => navigate('/inventory')} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="ld-btn ld-btn-dark" disabled={loading} style={{ minWidth: 140 }}>
                {loading ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : <><Save size={14} />Salvar Produto</>}
              </button>
            </div>
          </form>

          {/* Painel Lateral */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Resumo Financeiro */}
            <div className="ld-card">
              <div className="ld-card-body">
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>
                  Resumo Financeiro
                </div>
                {[
                  { label: 'Margem bruta', value: formatCurrency(margin) || 'R$ 0,00', color: margin > 0 ? '#1E8449' : 'var(--ink3)' },
                  { label: 'Margem %', value: `${marginPct}%`, color: parseFloat(marginPct) > 0 ? '#1E8449' : 'var(--ink3)' },
                  { label: 'Valor em estoque', value: formatCurrency(product.quantidadeEstoque * product.precoCusto) || 'R$ 0,00', color: 'var(--ink)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bdr)' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{item.label}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dica */}
            <div style={{ background: 'var(--gold-light)', border: '1px solid rgba(184,146,42,0.2)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Dica</div>
              <p style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.6 }}>
                O preço de venda deve ser maior que o custo para garantir margem de lucro positiva.
              </p>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
