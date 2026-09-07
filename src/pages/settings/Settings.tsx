import React, { useRef, useState } from 'react';
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Save, User, AlertTriangle,
  Loader2, RefreshCw, Lock, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserService, TenantService } from "@/services/authService";
import { WorksService } from "@/services/works/worksService";
import { useAuth } from "@/contexts/AuthContext";
import { formatCnpj, cleanCnpj, isValidCnpj } from "@/utils/cnpj";

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream2:#EDE9E1;--gold-light:#F0E4C4;}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(22px,3vw,32px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;margin-bottom:16px;}
.ld-sub{font-size:13px;color:var(--ink3);font-weight:300;}
.ld-card{background:var(--card-bg, #fff);border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:20px 24px;}
.ld-layout{display:grid;grid-template-columns:220px 1fr;gap:20px;}
.ld-sidebar{background:var(--sidebar-bg, #fff);border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);overflow:hidden;position:relative;}
.ld-sidebar::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-sidebar-header{padding:16px 18px 12px;border-bottom:1px solid var(--bdr);}
.ld-sidebar-title{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:700;color:var(--ink3);}
.ld-nav-item{display:flex;align-items:center;gap:10px;padding:11px 18px;cursor:pointer;font-size:13px;color:var(--ink2);transition:all 0.18s;border-right:2px solid transparent;width:100%;background:none;border-left:none;border-top:none;border-bottom:none;text-align:left;font-family:'DM Sans',sans-serif;}
.ld-nav-item:hover{background:rgb(var(--cream-rgb, 247 244 239) / 0.6);color:var(--ink);}
.ld-nav-item.active{background:rgba(184,146,42,0.06);color:var(--gold);border-right-color:var(--gold);font-weight:500;}
.ld-section{display:flex;flex-direction:column;gap:16px;}
.ld-form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ld-form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.ld-field{display:flex;flex-direction:column;gap:5px;}
.ld-lbl{font-size:11.5px;font-weight:500;color:var(--ink2);}
.ld-divider{border:none;border-top:1px solid var(--bdr);margin:16px 0;}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.ld-btn-dark{background:var(--brand-dark);color:#fff;}
.ld-btn-dark:hover:not(:disabled){background:var(--brand-gold);}
.ld-btn-outline{background:var(--card-bg, #fff);color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-btn-sm{padding:5px 10px;font-size:11.5px;}
.ld-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ld-banner{display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border-radius:10px;font-size:13px;line-height:1.5;}
.ld-banner-warning{background:#FFF8E1;color:#7A5B0A;border:1px solid rgba(184,146,42,0.25);}
.ld-banner-info{background:#EBF5FB;color:#1A5276;border:1px solid rgba(26,82,118,0.15);}
.ld-cep-wrap{position:relative;}
.ld-cep-wrap input{padding-right:34px;}
.ld-cep-icon{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:var(--ink3);display:flex;align-items:center;pointer-events:none;}
.ld-cep-icon.loading{color:var(--gold);animation:ld-cep-spin 0.8s linear infinite;}
@keyframes ld-cep-spin{to{transform:translateY(-50%) rotate(360deg);}}
.ld-cep-hint{font-size:11px;margin-top:2px;}
.ld-cep-hint.ok{color:#1E8449;}
.ld-cep-hint.err{color:#C0392B;}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
@media(max-width:768px){.ld-layout{grid-template-columns:1fr;}.ld-form-grid-2,.ld-form-grid-3{grid-template-columns:1fr;}}
`;

interface UserProfileForm {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
}

interface TenantProfileForm {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  addressZipCode: string;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressComplement: string;
}

const emptyUserProfile: UserProfileForm = { name: '', email: '', phone: '', cnpj: '' };
const emptyTenantProfile: TenantProfileForm = {
  name: '', cnpj: '', email: '', phone: '',
  addressZipCode: '', addressStreet: '', addressNumber: '', addressNeighborhood: '', addressCity: '', addressState: '', addressComplement: '',
};

export function Settings() {
  const { toast } = useToast();
  const { isOnboardingComplete, isTenantAdmin, setOnboardingComplete } = useAuth();

  // Se o onboarding da PJ ainda não foi concluído, a página sempre abre na
  // aba Geral — é a única forma de completar o cadastro obrigatório.
  const [activeTab, setActiveTab] = useState(isOnboardingComplete === false ? 'general' : 'profile');

  const [tenantForm, setTenantForm] = useState<TenantProfileForm>(emptyTenantProfile);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [tenantSaving, setTenantSaving] = useState(false);
  const [tenantLoaded, setTenantLoaded] = useState(false);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [cepMessage, setCepMessage] = useState('');
  const cepDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [userForm, setUserForm] = useState<UserProfileForm>(emptyUserProfile);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const loadTenantProfile = async () => {
    setTenantLoading(true);
    try {
      const data = await TenantService.getProfile();
      setTenantForm({
        name: data.name || '',
        cnpj: data.cnpj ? formatCnpj(data.cnpj) : '',
        email: data.email || '',
        phone: data.phone ? formatPhone(data.phone) : '',
        addressZipCode: data.addressZipCode || '',
        addressStreet: data.addressStreet || '',
        addressNumber: data.addressNumber || '',
        addressNeighborhood: data.addressNeighborhood || '',
        addressCity: data.addressCity || '',
        addressState: data.addressState || '',
        addressComplement: data.addressComplement || '',
      });
      setTenantLoaded(true);
    } catch (e: unknown) {
      toast({ title: "Erro ao carregar empresa", description: e instanceof Error ? e.message : 'Não foi possível carregar os dados da empresa.', variant: "destructive" });
    } finally {
      setTenantLoading(false);
    }
  };

  const loadUserProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await UserService.getProfile();
      setUserForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone ? formatPhone(data.phone) : '',
        cnpj: data.cnpj ? formatCnpj(data.cnpj) : '',
      });
      setProfileLoaded(true);
    } catch (e: unknown) {
      toast({ title: "Erro ao carregar perfil", description: e instanceof Error ? e.message : 'Não foi possível carregar seu perfil.', variant: "destructive" });
    } finally {
      setProfileLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'general' && !tenantLoaded) loadTenantProfile();
    if (activeTab === 'profile' && !profileLoaded) loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const formatPhone = (value: string): string => {
    const n = value.replace(/\D/g, '');
    return n.length <= 10 ? n.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3') : n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Mesmo padrão de busca de CEP usado em "Nova Obra" — CEP inválido não bloqueia
  // nada, só não preenche os campos automaticamente; o usuário sempre pode digitar
  // o endereço manualmente.
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    setTenantForm(prev => ({ ...prev, addressZipCode: digits }));
    setCepStatus('idle');
    setCepMessage('');

    if (cepDebounceRef.current) clearTimeout(cepDebounceRef.current);

    if (digits.length === 8) {
      cepDebounceRef.current = setTimeout(async () => {
        setCepLoading(true);
        try {
          const result = await WorksService.lookupCep(digits);
          setTenantForm(prev => ({
            ...prev,
            addressStreet: result.street,
            addressNeighborhood: result.neighborhood,
            addressCity: result.city,
            addressState: result.state,
          }));
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

  const handleSaveTenant = async () => {
    if (!tenantForm.name.trim()) {
      toast({ title: "Campo obrigatório", description: "Informe o nome da empresa.", variant: "destructive" });
      return;
    }
    if (tenantForm.cnpj && !isValidCnpj(tenantForm.cnpj)) {
      toast({ title: "CNPJ inválido", description: "Confira o CNPJ informado.", variant: "destructive" });
      return;
    }
    setTenantSaving(true);
    try {
      const updated = await TenantService.updateProfile({
        name: tenantForm.name.trim(),
        cnpj: tenantForm.cnpj ? cleanCnpj(tenantForm.cnpj) : undefined,
        email: tenantForm.email || undefined,
        phone: tenantForm.phone ? tenantForm.phone.replace(/\D/g, '') : undefined,
        addressZipCode: tenantForm.addressZipCode || undefined,
        addressStreet: tenantForm.addressStreet || undefined,
        addressNumber: tenantForm.addressNumber || undefined,
        addressNeighborhood: tenantForm.addressNeighborhood || undefined,
        addressCity: tenantForm.addressCity || undefined,
        addressState: tenantForm.addressState || undefined,
        addressComplement: tenantForm.addressComplement || undefined,
      });
      setTenantForm({
        name: updated.name || '',
        cnpj: updated.cnpj ? formatCnpj(updated.cnpj) : '',
        email: updated.email || '',
        phone: updated.phone ? formatPhone(updated.phone) : '',
        addressZipCode: updated.addressZipCode || '',
        addressStreet: updated.addressStreet || '',
        addressNumber: updated.addressNumber || '',
        addressNeighborhood: updated.addressNeighborhood || '',
        addressCity: updated.addressCity || '',
        addressState: updated.addressState || '',
        addressComplement: updated.addressComplement || '',
      });
      setOnboardingComplete(updated.isOnboardingComplete);
      toast({ title: "Dados da empresa salvos", description: "As informações da empresa foram atualizadas com sucesso." });
    } catch (e: unknown) {
      toast({ title: "Erro ao salvar", description: e instanceof Error ? e.message : 'Não foi possível salvar os dados da empresa.', variant: "destructive" });
    } finally {
      setTenantSaving(false);
    }
  };

  const handleSaveUserProfile = async () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast({ title: "Campos obrigatórios", description: "Informe nome e e-mail.", variant: "destructive" });
      return;
    }
    if (userForm.cnpj && !isValidCnpj(userForm.cnpj)) {
      toast({ title: "CNPJ inválido", description: "Confira o CNPJ informado.", variant: "destructive" });
      return;
    }
    setProfileSaving(true);
    try {
      const updated = await UserService.updateProfile({
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        phone: userForm.phone ? userForm.phone.replace(/\D/g, '') : undefined,
        cnpj: userForm.cnpj ? cleanCnpj(userForm.cnpj) : undefined,
      });
      setUserForm({
        name: updated.name || '',
        email: updated.email || '',
        phone: updated.phone ? formatPhone(updated.phone) : '',
        cnpj: updated.cnpj ? formatCnpj(updated.cnpj) : '',
      });
      toast({ title: "Perfil salvo", description: "Suas informações foram atualizadas com sucesso." });
    } catch (e: unknown) {
      toast({ title: "Erro ao salvar", description: e instanceof Error ? e.message : 'Não foi possível salvar seu perfil.', variant: "destructive" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSave = () => {
    if (activeTab === 'general') handleSaveTenant();
    else if (activeTab === 'profile') handleSaveUserProfile();
  };

  const saving = activeTab === 'general' ? tenantSaving : profileSaving;
  const canEditTenant = isTenantAdmin;

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'profile', label: 'Meu Perfil', icon: User },
  ];

  return (
    <>
      <style>{LDCSS}</style>
      <div className="ld" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <div className="ld-a1" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="ld-tag">Preferências</span>
            <h1 className="ld-h1" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SettingsIcon size={22} color="var(--gold)" />
              Configurações
            </h1>
            <p className="ld-sub" style={{ marginTop: 4 }}>Gerencie os dados da empresa e da sua conta</p>
          </div>
          {(activeTab !== 'general' || canEditTenant) && (
            <button className="ld-btn ld-btn-dark" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={13} className="animate-spin" />Salvando...</> : <><Save size={13} />Salvar</>}
            </button>
          )}
        </div>

        {isOnboardingComplete === false && (
          <div className="ld-a1 ld-banner ld-banner-warning">
            <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              {canEditTenant ? (
                <>
                  <strong>Cadastro da empresa incompleto.</strong> Preencha Nome, CNPJ, Rua, Cidade e UF abaixo para liberar o
                  acesso ao restante do sistema.
                </>
              ) : (
                <>
                  <strong>Cadastro da empresa incompleto.</strong> Aguardando o administrador da conta completar o
                  cadastro da empresa para liberar o acesso ao restante do sistema.
                </>
              )}
            </div>
          </div>
        )}

        {/* Layout */}
        <div className="ld-layout ld-a2">

          {/* Sidebar */}
          <div className="ld-sidebar">
            <div className="ld-sidebar-header">
              <div className="ld-sidebar-title">Categorias</div>
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const disabled = isOnboardingComplete === false && tab.id !== 'general';
              return (
                <button
                  key={tab.id}
                  className={`ld-nav-item${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => !disabled && setActiveTab(tab.id)}
                  disabled={disabled}
                  style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                  title={disabled ? 'Complete o cadastro da empresa para acessar' : undefined}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>

            {/* GERAL — Perfil da PJ / empresa do tenant */}
            {activeTab === 'general' && (
              <div className="ld-section">
                <div className="ld-card">
                  <div className="ld-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                      <h2 className="ld-h2" style={{ marginBottom: 0 }}><SettingsIcon size={15} color="var(--gold)" /> Informações da Empresa</h2>
                      <button className="ld-btn ld-btn-outline ld-btn-sm" onClick={loadTenantProfile} disabled={tenantLoading}>
                        <RefreshCw size={12} className={tenantLoading ? 'animate-spin' : ''} /> Atualizar
                      </button>
                    </div>

                    {!canEditTenant && (
                      <div className="ld-banner ld-banner-info" style={{ marginBottom: 16 }}>
                        <Lock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>Somente o administrador da conta pode editar os dados da empresa. Os campos abaixo estão em modo leitura.</div>
                      </div>
                    )}

                    <div className="ld-form-grid-2">
                      <div className="ld-field">
                        <label className="ld-lbl">Razão Social *</label>
                        <Input
                          value={tenantForm.name}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!canEditTenant}
                        />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">CNPJ</label>
                        <Input
                          value={tenantForm.cnpj}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, cnpj: formatCnpj(e.target.value) }))}
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                          disabled={!canEditTenant}
                        />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">E-mail da Empresa</label>
                        <Input
                          type="email"
                          value={tenantForm.email}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!canEditTenant}
                        />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Telefone</label>
                        <Input
                          value={tenantForm.phone}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                          placeholder="(11) 99999-9999"
                          disabled={!canEditTenant}
                        />
                      </div>
                    </div>

                    <div className="ld-divider" />
                    <h2 className="ld-h2" style={{ fontSize: 14 }}>Endereço</h2>
                    <div className="ld-form-grid-3">
                      <div className="ld-field">
                        <label className="ld-lbl">CEP</label>
                        <div className="ld-cep-wrap">
                          <Input
                            value={tenantForm.addressZipCode}
                            onChange={handleCepChange}
                            placeholder="00000000"
                            inputMode="numeric"
                            maxLength={8}
                            disabled={!canEditTenant}
                          />
                          <span className={`ld-cep-icon${cepLoading ? ' loading' : ''}`}>
                            {cepLoading ? <Loader2 size={14} /> : <Search size={14} />}
                          </span>
                        </div>
                        {cepMessage && <span className={`ld-cep-hint ${cepStatus}`}>{cepMessage}</span>}
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Número</label>
                        <Input
                          value={tenantForm.addressNumber}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, addressNumber: e.target.value }))}
                          placeholder="Ex: 123"
                          disabled={!canEditTenant}
                        />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Complemento</label>
                        <Input
                          value={tenantForm.addressComplement}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, addressComplement: e.target.value }))}
                          placeholder="Sala, andar... (opcional)"
                          disabled={!canEditTenant}
                        />
                      </div>
                      <div className="ld-field" style={{ gridColumn: '1/-1' }}>
                        <label className="ld-lbl">Rua *</label>
                        <Input
                          value={tenantForm.addressStreet}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, addressStreet: e.target.value }))}
                          disabled={!canEditTenant}
                        />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Bairro</label>
                        <Input
                          value={tenantForm.addressNeighborhood}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, addressNeighborhood: e.target.value }))}
                          disabled={!canEditTenant}
                        />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Cidade *</label>
                        <Input
                          value={tenantForm.addressCity}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, addressCity: e.target.value }))}
                          disabled={!canEditTenant}
                        />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">UF *</label>
                        <Input
                          value={tenantForm.addressState}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, addressState: e.target.value.toUpperCase() }))}
                          maxLength={2}
                          placeholder="SP"
                          disabled={!canEditTenant}
                        />
                      </div>
                    </div>

                    {canEditTenant && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <button className="ld-btn ld-btn-dark" onClick={handleSaveTenant} disabled={tenantSaving}>
                          {tenantSaving ? <><Loader2 size={13} className="animate-spin" />Salvando...</> : <><Save size={13} />Salvar Alterações</>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PERFIL — dados da pessoa logada */}
            {activeTab === 'profile' && (
              <div className="ld-section">
                <div className="ld-card">
                  <div className="ld-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                      <h2 className="ld-h2" style={{ marginBottom: 0 }}><User size={15} color="var(--gold)" /> Informações Pessoais</h2>
                      <button className="ld-btn ld-btn-outline ld-btn-sm" onClick={loadUserProfile} disabled={profileLoading}>
                        <RefreshCw size={12} className={profileLoading ? 'animate-spin' : ''} /> Atualizar
                      </button>
                    </div>

                    <div className="ld-form-grid-2">
                      <div className="ld-field">
                        <label className="ld-lbl">Nome Completo *</label>
                        <Input value={userForm.name} onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">E-mail *</label>
                        <Input type="email" value={userForm.email} onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Telefone</label>
                        <Input value={userForm.phone} onChange={(e) => setUserForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))} placeholder="(00) 00000-0000" />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">CNPJ</label>
                        <Input value={userForm.cnpj} onChange={(e) => setUserForm(prev => ({ ...prev, cnpj: formatCnpj(e.target.value) }))} placeholder="00.000.000/0000-00" maxLength={18} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                      <button className="ld-btn ld-btn-dark" onClick={handleSaveUserProfile} disabled={profileSaving}>
                        {profileSaving ? <><Loader2 size={13} className="animate-spin" />Salvando...</> : <><Save size={13} />Salvar Alterações</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>

      </div>
    </>
  );
}

export default Settings;
