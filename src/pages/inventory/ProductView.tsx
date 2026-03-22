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
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.10);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:9.5px;font-weight:500;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:4px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(17px,2.5vw,24px);font-weight:700;line-height:1.15;letter-spacing:-0.3px;color:var(--ink);}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:13.5px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px;margin-bottom:10px;}
.ld-sub{font-size:12px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:10px;border:1px solid var(--bdr);box-shadow:0 2px 12px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:14px 16px;}
.ld-field-row{margin-bottom:10px;}
.ld-field-lbl{font-size:10px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;color:var(--ink3);margin-bottom:3px;}
.ld-field-val{font-size:13px;color:var(--ink);font-weight:500;}
.ld-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;}
.ld-price-box{background:rgba(247,244,239,0.5);border:1px solid var(--bdr);border-radius:8px;padding:10px 12px;text-align:center;}
.ld-price-lbl{font-size:9.5px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;color:var(--ink3);margin-bottom:4px;}
.ld-price-val{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;}
.ld-badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:16px;font-size:10.5px;font-weight:500;}
.ld-badge-green{background:#E8F5E9;color:#1E8449;}
.ld-badge-red{background:#FDEDEC;color:#C0392B;}
.ld-badge-gray{background:#F2F2F2;color:var(--ink3);}
.ld-badge-orange{background:#FFF3E0;color:#E67E22;}
.ld-stock-big{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:700;color:var(--ink);line-height:1;}
.ld-summary-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--bdr);}
.ld-summary-row:last-child{border-bottom:none;}
.ld-summary-lbl{font-size:11px;color:var(--ink3);}
.ld-summary-val{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:700;}
.ld-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.18s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover{background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.ld-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:220px;gap:10px;color:var(--ink3);}
.ld-error{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:220px;gap:10px;text-align:center;}
.ld-detail-grid{display:grid;grid-template-columns:1fr 260px;gap:14px;}
@keyframes ld-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.3s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.3s cubic-bezier(0.22,1,0.36,1) 0.06s both;}
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
    if (status === 'active') return <span className="ld-badge ld-badge-green"><CheckCircle size={9} /> Ativo</span>;
    if (status === 'inactive') return <span className="ld-badge ld-badge-red"><XCircle size={9} /> Inativo</span>;
    return <span className="ld-badge ld-badge-gray"><AlertCircle size={9} /> Descontinuado</span>;
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
          <Package size={28} color="var(--gold)" style={{ opacity: 0.5 }} className="animate-pulse" />
          <span style={{ fontSize: 12 }}>Carregando produto...</span>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-error">
          <AlertCircle size={32} style={{ color: '#C0392B' }} />
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700 }}>Erro ao carregar produto</h3>
          <p style={{ fontSize: 12, color: 'var(--ink3)' }}>{error}</p>
          <button className="ld-btn ld-btn-outline" onClick={() => navigate('/inventory')}>
            <ArrowLeft size={13} /> Voltar ao Estoque
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
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Header */}
        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <button className="ld-btn ld-btn-outline" style={{ padding: '6px 8px' }} onClick={() => navigate('/inventory')}>
              <ArrowLeft size={13} />
            </button>
            <div>
              <span className="ld-tag">Estoque</span>
              <h1 className="ld-h1">{product.name}</h1>
              <p className="ld-sub" style={{ marginTop: 2 }}>Detalhes e informações do produto</p>
            </div>
          </div>
          <button className="ld-btn ld-btn-dark" onClick={() => navigate(`/inventory/edit/${id}`)}>
            <Edit size={12} /> Editar
          </button>
        </div>

        <div className="ld-detail-grid ld-a2">

          {/* Coluna Principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Informações Básicas */}
            <div className="ld-card">
              <div className="ld-card-body">
                <h2 className="ld-h2"><Package size={12} color="var(--gold)" /> Informações Básicas</h2>
                <div className="ld-grid-2">
                  <div className="ld-field-row" style={{ gridColumn: '1/-1' }}>
                    <div className="ld-field-lbl">Nome do Produto</div>
                    <div className="ld-field-val" style={{ fontSize: 14 }}>{product.name}</div>
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
                    <div className="ld-field-val" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Tag size={11} color="var(--gold)" />{product.category}
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
                <h2 className="ld-h2"><DollarSign size={12} color="var(--gold)" /> Preços</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Estoque */}
            <div className="ld-card">
              <div className="ld-card-body">
                <h2 className="ld-h2"><Hash size={12} color="var(--gold)" /> Controle de Estoque</h2>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 4 }}>
                    Quantidade Atual
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <div className="ld-stock-big">{product.quantity}</div>
                    <div style={{ marginBottom: 4 }}>{getStockBadge(product.quantity, product.minQuantity)}</div>
                  </div>
                </div>
                <div className="ld-grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <div className="ld-field-lbl">Mínimo</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{product.minQuantity}</div>
                  </div>
                  <div>
                    <div className="ld-field-lbl">Máximo</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{product.maxQuantity}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="ld-card">
              <div className="ld-card-body">
                <h2 className="ld-h2"><TrendingUp size={12} color="var(--gold)" /> Resumo Financeiro</h2>
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

            {/* Data */}
            {product.createdAt && (
              <div style={{ background: 'rgba(247,244,239,0.5)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '10px 12px' }}>
                <div className="ld-field-lbl" style={{ marginBottom: 4 }}>Cadastrado em</div>
                <div style={{ fontSize: 12, color: 'var(--ink2)' }}>{formatDate(product.createdAt)}</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default ProductView;
