import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api/axios';
import { ArrowDownCircle, ArrowUpCircle, BarChart3, Plus, RefreshCw, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
.ld-stat-val{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:var(--ink);line-height:1.1;}
.ld-stat-lbl{font-size:11px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;color:var(--ink3);margin-top:5px;}
.ld-tx-list{list-style:none;padding:0;margin:0;}
.ld-tx-item{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(26,24,20,0.05);}
.ld-tx-item:last-child{border-bottom:none;}
.ld-tx-ico{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ld-tx-ico-income{background:#E8F5E9;}
.ld-tx-ico-expense{background:#FDEDEC;}
.ld-tx-body{flex:1;min-width:0;}
.ld-tx-desc{font-weight:500;color:var(--ink);font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ld-tx-date{font-size:12px;color:var(--ink3);margin-top:2px;}
.ld-tx-amount{font-weight:700;font-size:14px;font-family:'Cormorant Garamond',serif;white-space:nowrap;}
.ld-tx-amount-income{color:#1E8449;}
.ld-tx-amount-expense{color:#C0392B;}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;text-decoration:none;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover{background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.ld-loading{display:flex;align-items:center;justify-content:center;min-height:280px;gap:10px;color:var(--ink3);font-size:14px;}
.ld-error-card{padding:60px 20px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;}
.ld-empty{padding:48px 20px;text-align:center;color:var(--ink3);}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
.ld-a3{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.14s both;}
@media(max-width:640px){.ld-stat-grid{grid-template-columns:1fr;}}
`;

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export function Financial() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/financial/transactions');
      setTransactions(response.data);
    } catch {
      setError(DEFAULT_LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  if (loading) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-loading">
          <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--gold)' }} />
          <span>Carregando transações...</span>
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
              <button className="ld-btn ld-btn-outline" onClick={loadTransactions}>
                <RefreshCw size={13} /> Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpense;

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
              Fluxo Financeiro
            </h1>
            <p className="ld-sub" style={{ marginTop: 4 }}>Acompanhe entradas, saídas e saldo da operação</p>
          </div>
          <Link to="/financial/new" className="ld-btn ld-btn-dark">
            <Plus size={14} /> Nova Transação
          </Link>
        </div>

        {/* Stats */}
        <div className="ld-stat-grid ld-a2">
          <div className="ld-stat-card">
            <div className="ld-stat-ico" style={{ background: '#E8F5E9' }}><TrendingUp size={18} color="#27AE60" /></div>
            <div className="ld-stat-val" style={{ color: '#1E8449' }}>
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="ld-stat-lbl">Total de Entradas</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-ico" style={{ background: '#FDEDEC' }}><TrendingDown size={18} color="#C0392B" /></div>
            <div className="ld-stat-val" style={{ color: '#C0392B' }}>
              R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="ld-stat-lbl">Total de Saídas</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-ico" style={{ background: 'var(--gold-light)' }}><DollarSign size={18} color="var(--gold)" /></div>
            <div className="ld-stat-val" style={{ color: balance >= 0 ? '#1E8449' : '#C0392B' }}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="ld-stat-lbl">Saldo Atual</div>
          </div>
        </div>

        {/* Transações */}
        <div className="ld-card ld-a3">
          <div className="ld-card-body" style={{ paddingBottom: 0 }}>
            <div style={{ marginBottom: 16 }}>
              <span className="ld-section-title">
                <DollarSign size={16} color="var(--gold)" />
                Transações Recentes
              </span>
            </div>
          </div>
          <div className="ld-card-body" style={{ paddingTop: 0 }}>
            {transactions.length === 0 ? (
              <div className="ld-empty">
                <DollarSign size={36} style={{ color: 'var(--bdr)', margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 500, color: 'var(--ink2)' }}>Nenhuma transação registrada</div>
                <div style={{ fontSize: 12 }}>Registre sua primeira transação financeira</div>
              </div>
            ) : (
              <ul className="ld-tx-list">
                {transactions.map((tx) => (
                  <li key={tx.id} className="ld-tx-item">
                    <div className={`ld-tx-ico ${tx.type === 'income' ? 'ld-tx-ico-income' : 'ld-tx-ico-expense'}`}>
                      {tx.type === 'income'
                        ? <ArrowUpCircle size={18} color="#27AE60" />
                        : <ArrowDownCircle size={18} color="#C0392B" />
                      }
                    </div>
                    <div className="ld-tx-body">
                      <div className="ld-tx-desc">{tx.description}</div>
                      <div className="ld-tx-date">{new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className={`ld-tx-amount ${tx.type === 'income' ? 'ld-tx-amount-income' : 'ld-tx-amount-expense'}`}>
                      {tx.type === 'income' ? '+' : '−'} R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
