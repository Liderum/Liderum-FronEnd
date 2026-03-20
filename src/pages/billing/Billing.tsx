import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api/axios';
import { AlertCircle, BarChart3, FileText, Plus, RefreshCw, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
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
.ld-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.ld-stat-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);padding:18px 20px;position:relative;overflow:hidden;}
.ld-stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-stat-ico{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
.ld-stat-val{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);line-height:1.1;}
.ld-stat-lbl{font-size:11px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;color:var(--ink3);margin-top:5px;}
.ld-table{width:100%;border-collapse:collapse;}
.ld-table th{font-size:10.5px;font-weight:500;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink3);padding:11px 16px;text-align:left;border-bottom:1px solid var(--bdr);background:rgba(247,244,239,0.45);}
.ld-table td{font-size:13px;color:var(--ink2);padding:13px 16px;border-bottom:1px solid rgba(26,24,20,0.05);transition:background 0.15s;}
.ld-table tbody tr:hover td{background:rgba(247,244,239,0.5);}
.ld-table tbody tr:last-child td{border-bottom:none;}
.ld-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap;}
.ld-badge-green{background:#E8F5E9;color:#1E8449;}
.ld-badge-yellow{background:#FFF8E1;color:#B7770D;}
.ld-badge-red{background:#FDEDEC;color:#C0392B;}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;text-decoration:none;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover{background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.ld-link{color:var(--gold);text-decoration:none;font-size:12.5px;font-weight:500;}
.ld-link:hover{text-decoration:underline;}
.ld-loading{display:flex;align-items:center;justify-content:center;min-height:280px;gap:10px;color:var(--ink3);font-size:14px;}
.ld-error-card{padding:60px 20px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;}
.ld-empty{padding:48px 20px;text-align:center;color:var(--ink3);}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
.ld-a3{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.14s both;}
@media(max-width:640px){.ld-stat-grid{grid-template-columns:1fr;}}
`;

interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate: string;
}

export function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/billing/invoices');
      setInvoices(response.data);
    } catch {
      setError(DEFAULT_LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  if (loading) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-loading">
          <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--gold)' }} />
          <span>Carregando faturas...</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld">
          <div className="ld-card">
            <div className="ld-error-card">
              <AlertCircle size={40} style={{ color: '#C0392B' }} />
              <p style={{ fontSize: 13, color: 'var(--ink3)' }}>{error}</p>
              <button className="ld-btn ld-btn-outline" onClick={loadInvoices}>
                <RefreshCw size={13} /> Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalCancelled = invoices.filter(i => i.status === 'cancelled').length;

  const getStatusBadge = (status: Invoice['status']) => {
    if (status === 'paid') return <span className="ld-badge ld-badge-green"><CheckCircle size={10} /> Pago</span>;
    if (status === 'pending') return <span className="ld-badge ld-badge-yellow"><Clock size={10} /> Pendente</span>;
    return <span className="ld-badge ld-badge-red"><XCircle size={10} /> Cancelado</span>;
  };

  return (
    <>
      <style>{LDCSS}</style>
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="ld-tag">Financeiro</span>
            <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 size={22} color="var(--gold)" />
              Faturamento
            </h1>
            <p className="ld-sub" style={{ marginTop: 4 }}>Gerencie suas faturas e cobranças</p>
          </div>
          <Link to="/billing/new" className="ld-btn ld-btn-dark">
            <Plus size={14} /> Nova Fatura
          </Link>
        </div>

        {/* Stats */}
        <div className="ld-stat-grid ld-a2">
          <div className="ld-stat-card">
            <div className="ld-stat-ico" style={{ background: '#E8F5E9' }}><DollarSign size={18} color="#27AE60" /></div>
            <div className="ld-stat-val">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="ld-stat-lbl">Total Recebido</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-ico" style={{ background: '#FFF8E1' }}><Clock size={18} color="#B7770D" /></div>
            <div className="ld-stat-val">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="ld-stat-lbl">A Receber</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-ico" style={{ background: '#FDEDEC' }}><XCircle size={18} color="#C0392B" /></div>
            <div className="ld-stat-val">{totalCancelled}</div>
            <div className="ld-stat-lbl">Canceladas</div>
          </div>
        </div>

        {/* Tabela */}
        <div className="ld-card ld-a3">
          <div className="ld-card-body" style={{ paddingBottom: 0 }}>
            <div style={{ marginBottom: 16 }}>
              <span className="ld-section-title">
                <FileText size={16} color="var(--gold)" />
                Lista de Faturas
              </span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ld-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="ld-empty">
                        <FileText size={36} style={{ color: 'var(--bdr)', margin: '0 auto 12px' }} />
                        <div style={{ fontWeight: 500, color: 'var(--ink2)' }}>Nenhuma fatura encontrada</div>
                        <div style={{ fontSize: 12 }}>Crie sua primeira fatura clicando em "Nova Fatura"</div>
                      </div>
                    </td>
                  </tr>
                )}
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{invoice.number}</td>
                    <td>{invoice.customer}</td>
                    <td style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      R$ {invoice.amount.toFixed(2)}
                    </td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/billing/${invoice.id}`} className="ld-link">
                        Ver detalhes →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ height: 4 }} />
        </div>

      </div>
    </>
  );
}
