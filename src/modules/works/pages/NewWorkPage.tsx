import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Search } from 'lucide-react';
import type { CreateWorkDto } from '@/modules/shared/types';
import { LdDateInput } from '@/components/LdDateInput';
import { WorksService } from '@/services/works/worksService';

const CSS = `
.nw{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:24px;max-width:720px;width:100%;margin:0 auto;}
.nw-header{display:flex;align-items:center;gap:14px;}
.nw-back{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;border:1px solid var(--bdr,rgba(26,24,20,0.10));background:var(--card-bg,#fff);cursor:pointer;transition:all 0.16s;flex-shrink:0;}
.nw-back:hover{border-color:var(--gold,#B8922A);color:var(--gold,#B8922A);}
.nw-title-wrap{}
.nw-tag{font-size:10px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold,#B8922A);margin-bottom:2px;}
.nw-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink,#1A1814);letter-spacing:-0.5px;}
.nw-card{background:var(--card-bg,#fff);border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:28px 28px 24px;box-shadow:0 2px 10px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.nw-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold,#B8922A),var(--gold2,#D4A843));}
.nw-section{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink,#1A1814);margin-bottom:16px;}
.nw-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.nw-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
.nw-field{display:flex;flex-direction:column;gap:5px;}
.nw-field.full{grid-column:1/-1;}
.nw-field.col2{grid-column:span 2;}
.nw-label{font-size:12px;font-weight:500;color:var(--ink3,#7A7670);}
.nw-label span{color:#C0392B;}
.nw-input{padding:9px 13px;border-radius:8px;border:1px solid var(--bdr,rgba(26,24,20,0.10));font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);background:var(--card-bg,#fff);transition:border-color 0.16s;outline:none;width:100%;box-sizing:border-box;}
.nw-input:focus{border-color:var(--gold,#B8922A);}
.nw-input:disabled{background:#F8F7F5;color:var(--ink3,#7A7670);cursor:not-allowed;}
.nw-input::placeholder{color:var(--ink3,#7A7670);opacity:0.6;}
.nw-textarea{resize:vertical;min-height:80px;}
.nw-currency-wrap{position:relative;}
.nw-currency-wrap .nw-prefix{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:500;color:var(--ink3,#7A7670);pointer-events:none;}
.nw-currency-wrap .nw-input{padding-left:38px;}
.nw-cep-wrap{position:relative;}
.nw-cep-wrap .nw-input{padding-right:38px;}
.nw-cep-icon{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:var(--ink3,#7A7670);display:flex;align-items:center;pointer-events:none;}
.nw-cep-icon.loading{color:var(--gold,#B8922A);animation:nw-spin 0.8s linear infinite;}
@keyframes nw-spin{to{transform:translateY(-50%) rotate(360deg);}}
.nw-cep-hint{font-size:11px;color:var(--ink3,#7A7670);margin-top:2px;}
.nw-cep-hint.ok{color:#1E8449;}
.nw-cep-hint.err{color:#C0392B;}
.nw-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding-top:8px;}
.nw-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;transition:all 0.2s;}
.nw-btn-cancel{background:var(--card-bg,#fff);border:1px solid var(--bdr,rgba(26,24,20,0.10));color:var(--ink3,#7A7670);}
.nw-btn-cancel:hover{border-color:var(--ink3,#7A7670);}
.nw-btn-save{background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));color:#fff;box-shadow:0 2px 10px rgba(184,146,42,0.25);}
.nw-btn-save:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
.nw-btn-save:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none;}
.nw-error{color:#C0392B;font-size:12px;margin-top:4px;padding:8px 14px;background:#FDEDEC;border-radius:8px;}
@media(max-width:640px){.nw-grid{grid-template-columns:1fr;}.nw-grid-3{grid-template-columns:1fr;}.nw-field.col2{grid-column:1/-1;}}
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

function formatCep(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

export default function NewWorkPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [totalBudgetDisplay, setTotalBudgetDisplay] = useState('');

  // Campos de endereço estruturados
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [cepMessage, setCepMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalBudgetDisplay(formatCurrencyInput(e.target.value));
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = formatCep(e.target.value);
    setCep(digits);
    setCepStatus('idle');
    setCepMessage('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (digits.length === 8) {
      debounceRef.current = setTimeout(async () => {
        setCepLoading(true);
        try {
          const result = await WorksService.lookupCep(digits);
          setStreet(result.street);
          setNeighborhood(result.neighborhood);
          setCity(result.city);
          setState(result.state);
          setCepStatus('ok');
          setCepMessage('Endereço encontrado');
        } catch (err) {
          setCepStatus('error');
          setCepMessage(err instanceof Error ? err.message : 'CEP não encontrado.');
        } finally {
          setCepLoading(false);
        }
      }, 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const totalBudget = parseCurrencyToNumber(totalBudgetDisplay);

    // Junta todos os erros de uma vez em vez de parar no primeiro campo
    // vazio — evita que o usuário precise clicar em "Criar Obra" várias
    // vezes seguidas só pra descobrir o próximo campo faltando.
    const errors: string[] = [];
    if (!name.trim()) errors.push('Nome da obra é obrigatório.');
    if (!street.trim() || !city.trim()) errors.push('Informe ao menos rua e cidade no endereço.');
    if (!startDate) errors.push('Data de início é obrigatória.');
    if (totalBudget <= 0) errors.push('Orçamento total deve ser maior que zero.');

    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }

    // Envia datas sem sufixo Z para evitar conversão de fuso horário pelo browser.
    // O backend trata "YYYY-MM-DDT00:00:00" como DateTime sem timezone especificado.
    const payload: CreateWorkDto = {
      name: name.trim(),
      description: description.trim() || null,
      address: {
        zipCode: cep,
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        complement: complement.trim() || null,
      },
      startDate: startDate + 'T00:00:00',
      expectedEndDate: expectedEndDate ? expectedEndDate + 'T00:00:00' : null,
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

          </div>
        </div>

        {/* Endereço */}
        <div className="nw-card">
          <div className="nw-section">Endereço da Obra</div>
          <div className="nw-grid">
            {/* CEP */}
            <div className="nw-field">
              <label className="nw-label">CEP</label>
              <div className="nw-cep-wrap">
                <input
                  className="nw-input"
                  placeholder="00000000"
                  inputMode="numeric"
                  maxLength={8}
                  value={cep}
                  onChange={handleCepChange}
                />
                <span className={`nw-cep-icon${cepLoading ? ' loading' : ''}`}>
                  {cepLoading ? <Loader2 size={14} /> : <Search size={14} />}
                </span>
              </div>
              {cepMessage && (
                <span className={`nw-cep-hint ${cepStatus}`}>{cepMessage}</span>
              )}
            </div>

            {/* Número */}
            <div className="nw-field">
              <label className="nw-label">Número</label>
              <input
                className="nw-input"
                placeholder="Ex: 123"
                value={number}
                onChange={e => setNumber(e.target.value)}
              />
            </div>

            {/* Rua */}
            <div className="nw-field full">
              <label className="nw-label">Rua / Logradouro <span>*</span></label>
              <input
                className="nw-input"
                placeholder="Rua, Avenida, Estrada..."
                value={street}
                onChange={e => setStreet(e.target.value)}
                disabled={cepLoading}
              />
            </div>

            {/* Complemento */}
            <div className="nw-field full">
              <label className="nw-label">Complemento</label>
              <input
                className="nw-input"
                placeholder="Apto, Bloco, Sala... (opcional)"
                value={complement}
                onChange={e => setComplement(e.target.value)}
              />
            </div>

            {/* Bairro */}
            <div className="nw-field">
              <label className="nw-label">Bairro</label>
              <input
                className="nw-input"
                placeholder="Bairro"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                disabled={cepLoading}
              />
            </div>

            {/* Cidade */}
            <div className="nw-field">
              <label className="nw-label">Cidade <span>*</span></label>
              <input
                className="nw-input"
                placeholder="Cidade"
                value={city}
                onChange={e => setCity(e.target.value)}
                disabled={cepLoading}
              />
            </div>

            {/* UF */}
            <div className="nw-field">
              <label className="nw-label">UF</label>
              <input
                className="nw-input"
                placeholder="SP"
                maxLength={2}
                style={{ textTransform: 'uppercase' }}
                value={state}
                onChange={e => setState(e.target.value.toUpperCase())}
                disabled={cepLoading}
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
              <LdDateInput
                value={startDate}
                onChange={setStartDate}
                clearable={false}
              />
            </div>

            <div className="nw-field">
              <label className="nw-label">Data Prevista de Término</label>
              <LdDateInput
                value={expectedEndDate}
                onChange={setExpectedEndDate}
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
