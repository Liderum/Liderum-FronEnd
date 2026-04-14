import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import type { CreateWorkDto } from '@/modules/shared/types';
import { WorksService } from '@/services/works/worksService';

const CSS = `
.nw{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:24px;max-width:720px;}
.nw-header{display:flex;align-items:center;gap:14px;}
.nw-back{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;border:1px solid var(--bdr,rgba(26,24,20,0.10));background:#fff;cursor:pointer;transition:all 0.16s;flex-shrink:0;}
.nw-back:hover{border-color:var(--gold,#B8922A);color:var(--gold,#B8922A);}
.nw-title-wrap{}
.nw-tag{font-size:10px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold,#B8922A);margin-bottom:2px;}
.nw-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink,#1A1814);letter-spacing:-0.5px;}
.nw-card{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:28px 28px 24px;box-shadow:0 2px 10px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.nw-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold,#B8922A),var(--gold2,#D4A843));}
.nw-section{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink,#1A1814);margin-bottom:16px;}
.nw-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.nw-field{display:flex;flex-direction:column;gap:5px;}
.nw-field.full{grid-column:1/-1;}
.nw-label{font-size:12px;font-weight:500;color:var(--ink3,#7A7670);}
.nw-label span{color:#C0392B;}
.nw-input{padding:9px 13px;border-radius:8px;border:1px solid var(--bdr,rgba(26,24,20,0.10));font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);background:#fff;transition:border-color 0.16s;outline:none;width:100%;box-sizing:border-box;}
.nw-input:focus{border-color:var(--gold,#B8922A);}
.nw-input::placeholder{color:var(--ink3,#7A7670);opacity:0.6;}
.nw-textarea{resize:vertical;min-height:80px;}
.nw-currency-wrap{position:relative;}
.nw-currency-wrap .nw-prefix{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:500;color:var(--ink3,#7A7670);pointer-events:none;}
.nw-currency-wrap .nw-input{padding-left:38px;}
.nw-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding-top:8px;}
.nw-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;transition:all 0.2s;}
.nw-btn-cancel{background:#fff;border:1px solid var(--bdr,rgba(26,24,20,0.10));color:var(--ink3,#7A7670);}
.nw-btn-cancel:hover{border-color:var(--ink3,#7A7670);}
.nw-btn-save{background:linear-gradient(135deg,var(--gold,#B8922A),var(--gold2,#D4A843));color:#fff;box-shadow:0 2px 10px rgba(184,146,42,0.25);}
.nw-btn-save:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
.nw-btn-save:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none;}
.nw-error{color:#C0392B;font-size:12px;margin-top:4px;padding:8px 14px;background:#FDEDEC;border-radius:8px;}
@media(max-width:640px){.nw-grid{grid-template-columns:1fr;}}
`;

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrencyToNumber(formatted: string): number {
  if (!formatted) return 0;
  const clean = formatted.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

export default function NewWorkPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [totalBudgetDisplay, setTotalBudgetDisplay] = useState('');

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalBudgetDisplay(formatCurrencyInput(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Nome da obra é obrigatório.'); return; }
    if (!address.trim()) { setError('Endereço é obrigatório.'); return; }
    if (!startDate) { setError('Data de início é obrigatória.'); return; }

    const totalBudget = parseCurrencyToNumber(totalBudgetDisplay);
    if (totalBudget <= 0) { setError('Orçamento total deve ser maior que zero.'); return; }

    // Envia datas sem sufixo Z para evitar conversão de fuso horário pelo browser.
    // O backend trata "YYYY-MM-DDT00:00:00" como DateTime sem timezone especificado.
    const payload: CreateWorkDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      address: address.trim(),
      startDate: startDate + 'T00:00:00',
      expectedEndDate: expectedEndDate ? expectedEndDate + 'T00:00:00' : undefined,
      totalBudget,
    };

    try {
      setSaving(true);
      const created = await WorksService.create(payload);
      navigate(`/works/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar obra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <form className="nw" onSubmit={handleSubmit}>
        {/* Header */}
        <div className="nw-header">
          <button type="button" className="nw-back" onClick={() => navigate('/works')}>
            <ArrowLeft size={16} />
          </button>
          <div className="nw-title-wrap">
            <div className="nw-tag">Cadastro</div>
            <h1 className="nw-title">Nova Obra</h1>
          </div>
        </div>

        {/* Card principal */}
        <div className="nw-card">
          <div className="nw-section">Informações da Obra</div>
          <div className="nw-grid">
            <div className="nw-field full">
              <label className="nw-label">Nome da Obra <span>*</span></label>
              <input
                className="nw-input"
                placeholder="Ex: Residencial Vila Nova"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="nw-field full">
              <label className="nw-label">Descrição</label>
              <textarea
                className="nw-input nw-textarea"
                placeholder="Descrição geral da obra (opcional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="nw-field full">
              <label className="nw-label">Endereço <span>*</span></label>
              <input
                className="nw-input"
                placeholder="Rua, número, bairro, cidade - UF"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Datas e Valores */}
        <div className="nw-card">
          <div className="nw-section">Datas e Valores</div>
          <div className="nw-grid">
            <div className="nw-field">
              <label className="nw-label">Data de Início <span>*</span></label>
              <input
                className="nw-input"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className="nw-field">
              <label className="nw-label">Data Prevista de Término</label>
              <input
                className="nw-input"
                type="date"
                value={expectedEndDate}
                onChange={e => setExpectedEndDate(e.target.value)}
              />
            </div>

            <div className="nw-field">
              <label className="nw-label">Orçamento Total <span>*</span></label>
              <div className="nw-currency-wrap">
                <span className="nw-prefix">R$</span>
                <input
                  className="nw-input"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={totalBudgetDisplay}
                  onChange={handleBudgetChange}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Erro e ações */}
        {error && <div className="nw-error">{error}</div>}

        <div className="nw-actions">
          <button type="button" className="nw-btn nw-btn-cancel" onClick={() => navigate('/works')}>
            Cancelar
          </button>
          <button type="submit" className="nw-btn nw-btn-save" disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Salvando...' : 'Criar Obra'}
          </button>
        </div>
      </form>
    </>
  );
}
