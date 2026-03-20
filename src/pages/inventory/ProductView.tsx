import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Edit, AlertCircle, CheckCircle,
  XCircle, DollarSign, Hash, TrendingUp, Tag, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from '../../types/inventory';
import { InventoryService } from '../../services/inventoryService';

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(20px,3vw,30px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:7px;margin-bottom:14px;}
.ld-sub{font-size:13px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:20px 24px;}
.ld-field-row{margin-bottom:16px;}
.ld-field-lbl{font-size:11px;font-weight:500;letter-spacing:0.6px;text-transform:uppercase;color:var(--ink3);margin-bottom:4px;}
.ld-field-val{font-size:14px;color:var(--ink);font-weight:500;}
.ld-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px 24px;}
.ld-price-box{background:rgba(247,244,239,0.5);border:1px solid var(--bdr);border-radius:10px;padding:14px 16px;text-align:center;}
.ld-price-lbl{font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:var(--ink3);margin-bottom:6px;}
.ld-price-val{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;}
.ld-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:500;}
.ld-badge-green{background:#E8F5E9;color:#1E8449;}
.ld-badge-red{background:#FDEDEC;color:#C0392B;}
.ld-badge-gray{background:#F2F2F2;color:var(--ink3);}
.ld-badge-orange{background:#FFF3E0;color:#E67E22;}
.ld-stock-big{font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:700;color:var(--ink);line-height:1;}
.ld-summary-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bdr);}
.ld-summary-row:last-child{border-bottom:none;}
.ld-summary-lbl{font-size:12px;color:var(--ink3);}
.ld-summary-val{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:7px;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover{background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.ld-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:12px;color:var(--ink3);}
.ld-error{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:12px;text-align:center;}
.ld-detail-grid{display:grid;grid-template-columns:1fr 300px;gap:20px;}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
@media(max-width:900px){.ld-detail-grid{grid-template-columns:1fr;}.ld-grid-2{grid-template-columns:1fr;}}
`;

export function ProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (id) loadProduct(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const p = await InventoryService.getProductById(id!);
      setProduct(p);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar produto';
      setError(msg);
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <span className="ld-badge ld-badge-green"><CheckCircle size={10} /> Ativo</span>;
    if (status === 'inactive') return <span className="ld-badge ld-badge-red"><XCircle size={10} /> Inativo</span>;
    return <span className="ld-badge ld-badge-gray"><AlertCircle size={10} /> Descontinuado</span>;
  };

  const getStockBadge = (qty: number, min: number) => {
    if (qty === 0) return <span className="ld-badge ld-badge-red">Sem Estoque</span>;
    if (qty <= min) return <span className="ld-badge ld-badge-orange">Estoque Baixo</span>;
    return <span className="ld-badge ld-badge-green">Em Estoque</span>;
  };

  if (loading) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-loading">
          <Package size={36} color="var(--gold)" style={{ opacity: 0.5 }} className="animate-pulse" />
          <span style={{ fontSize: 13 }}>Carregando produto...</span>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-error">
          <AlertCircle size={40} style={{ color: '#C0392B' }} />
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700 }}>Erro ao carregar produto</h3>
          <p style={{ fontSize: 13, color: 'var(--ink3)' }}>{error}</p>
          <button className="ld-btn ld-btn-outline" onClick={() => navigate('/inventory')}>
            <ArrowLeft size={14} /> Voltar ao Estoque
          </button>
        </div>
      </>
    );
  }

  const margin = product.price - product.costPrice;
  const marginPct = product.costPrice > 0 ? (margin / product.costPrice * 100).toFixed(1) : '0';

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
              <h1 className="ld-h1">{product.name}</h1>
              <p className="ld-sub" style={{ marginTop: 4 }}>Detalhes e informações do produto</p>
            </div>
          </div>
          <button className="ld-btn ld-btn-dark" onClick={() => navigate(`/inventory/edit/${id}`)}>
            <Edit size={14} /> Editar Produto
          </button>
        </div>

        <div className="ld-detail-grid ld-a2">

          {/* Coluna Principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Informações Básicas */}
            <div className="ld-card">
              <div className="ld-card-body">
                <h2 className="ld-h2"><Package size={14} color="var(--gold)" /> Informações Básicas</h2>
                <div className="ld-grid-2">
                  <div className="ld-field-row" style={{ gridColumn: '1/-1' }}>
                    <div className="ld-field-lbl">Nome do Produto</div>
                    <div className="ld-field-val" style={{ fontSize: 16 }}>{product.name}</div>
                  </div>
                  <div className="ld-field-row">
                    <div className="ld-field-lbl">SKU</div>
                    <div className="ld-field-val" style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{product.sku}</div>
                  </div>
                  {product.barcode && (
                    <div className="ld-field-row">
                      <div className="ld-field-lbl">Código de Barras</div>
                      <div className="ld-field-val" style={{ fontFamily: 'monospace' }}>{product.barcode}</div>
                    </div>
                  )}
                  <div className="ld-field-row">
                    <div className="ld-field-lbl">Categoria</div>
                    <div className="ld-field-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag size={12} color="var(--gold)" />{product.category}
                    </div>
                  </div>
                  <div className="ld-field-row">
                    <div className="ld-field-lbl">Marca</div>
                    <div className="ld-field-val">{product.brand}</div>
                  </div>
                  <div className="ld-field-row">
                    <div className="ld-field-lbl">Status</div>
                    <div>{getStatusBadge(product.status)}</div>
                  </div>
                  {product.description && (
                    <div className="ld-field-row" style={{ gridColumn: '1/-1' }}>
                      <div className="ld-field-lbl">Descrição</div>
                      <div className="ld-field-val">{product.description}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preços */}
            <div className="ld-card">
              <div className="ld-card-body">
                <h2 className="ld-h2"><DollarSign size={14} color="var(--gold)" /> Preços</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="ld-price-box">
                    <div className="ld-price-lbl">Preço de Venda</div>
                    <div className="ld-price-val" style={{ color: '#1E8449' }}>{formatCurrency(product.price)}</div>
                  </div>
                  <div className="ld-price-box">
                    <div className="ld-price-lbl">Preço de Custo</div>
                    <div className="ld-price-val" style={{ color: '#2980B9' }}>{formatCurrency(product.costPrice)}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Coluna Lateral */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Estoque */}
            <div className="ld-card">
              <div className="ld-card-body">
                <h2 className="ld-h2"><Hash size={14} color="var(--gold)" /> Controle de Estoque</h2>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>
                    Quantidade Atual
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                    <div className="ld-stock-big">{product.quantity}</div>
                    <div style={{ marginBottom: 6 }}>{getStockBadge(product.quantity, product.minQuantity)}</div>
                  </div>
                </div>
                <div className="ld-grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <div className="ld-field-lbl">Mínimo</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{product.minQuantity}</div>
                  </div>
                  <div>
                    <div className="ld-field-lbl">Máximo</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{product.maxQuantity}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="ld-card">
              <div className="ld-card-body">
                <h2 className="ld-h2"><TrendingUp size={14} color="var(--gold)" /> Resumo Financeiro</h2>
                {[
                  { label: 'Margem bruta', value: formatCurrency(margin), color: margin > 0 ? '#1E8449' : '#C0392B' },
                  { label: 'Margem %', value: `${marginPct}%`, color: parseFloat(marginPct) > 0 ? '#1E8449' : '#C0392B' },
                  { label: 'Valor em estoque', value: formatCurrency(product.quantity * product.costPrice), color: 'var(--ink)' },
                ].map(item => (
                  <div key={item.label} className="ld-summary-row">
                    <span className="ld-summary-lbl">{item.label}</span>
                    <span className="ld-summary-val" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Datas */}
            {product.createdAt && (
              <div style={{ background: 'rgba(247,244,239,0.5)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '14px 16px' }}>
                <div className="ld-field-lbl" style={{ marginBottom: 6 }}>Cadastrado em</div>
                <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{formatDate(product.createdAt)}</div>
              </div>
            )}
          </div>

        </div>

      </div>
    </>
  );
}

export default ProductView;
