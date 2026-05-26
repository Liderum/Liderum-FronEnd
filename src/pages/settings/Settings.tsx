import React, { useState } from 'react';
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Save, Bell, CreditCard, User, AlertTriangle,
  CheckCircle, Loader2, Plus, Edit, Trash2, Eye, EyeOff, Clock,
  TrendingUp, TrendingDown, Minus, Copy, Smartphone, Upload, RefreshCw,
  Shield, BarChart3
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSimpleToast } from "@/hooks/useSimpleToast";
import { ProfileService } from "@/services/managementService";
import { Profile, UpdateMyProfileDto } from "@/types/management";

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-tag{font-size:10.5px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px;}
.ld-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(22px,3vw,32px);font-weight:700;line-height:1.1;letter-spacing:-0.5px;color:var(--ink);}
.ld-h2{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;margin-bottom:16px;}
.ld-sub{font-size:13px;color:var(--ink3);font-weight:300;}
.ld-card{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);position:relative;overflow:hidden;}
.ld-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-card-body{padding:20px 24px;}
.ld-layout{display:grid;grid-template-columns:220px 1fr;gap:20px;}
.ld-sidebar{background:#fff;border-radius:12px;border:1px solid var(--bdr);box-shadow:0 2px 16px rgba(26,24,20,0.05);overflow:hidden;position:relative;}
.ld-sidebar::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-sidebar-header{padding:16px 18px 12px;border-bottom:1px solid var(--bdr);}
.ld-sidebar-title{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:700;color:var(--ink3);}
.ld-nav-item{display:flex;align-items:center;gap:10px;padding:11px 18px;cursor:pointer;font-size:13px;color:var(--ink2);transition:all 0.18s;border-right:2px solid transparent;width:100%;background:none;border-left:none;border-top:none;border-bottom:none;text-align:left;font-family:'DM Sans',sans-serif;}
.ld-nav-item:hover{background:rgba(247,244,239,0.6);color:var(--ink);}
.ld-nav-item.active{background:rgba(184,146,42,0.06);color:var(--gold);border-right-color:var(--gold);font-weight:500;}
.ld-section{display:flex;flex-direction:column;gap:16px;}
.ld-form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ld-form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.ld-field{display:flex;flex-direction:column;gap:5px;}
.ld-lbl{font-size:11.5px;font-weight:500;color:var(--ink2);}
.ld-divider{border:none;border-top:1px solid var(--bdr);margin:16px 0;}
.ld-notif-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--bdr);}
.ld-notif-row:last-child{border-bottom:none;}
.ld-notif-label{font-size:13.5px;font-weight:500;color:var(--ink);}
.ld-notif-desc{font-size:12px;color:var(--ink3);margin-top:2px;}
.ld-payment-card{background:#fff;border:1px solid var(--bdr);border-radius:10px;padding:16px;transition:box-shadow 0.2s;}
.ld-payment-card:hover{box-shadow:0 3px 16px rgba(26,24,20,0.08);}
.ld-tx-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(26,24,20,0.05);}
.ld-tx-item:last-child{border-bottom:none;}
.ld-tx-ico{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ld-avatar{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--gold-light),var(--cream2));border:2px solid rgba(184,146,42,0.2);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--gold);}
.ld-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;}
.ld-badge-gold{background:var(--gold-light);color:var(--gold);}
.ld-badge-green{background:#E8F5E9;color:#1E8449;}
.ld-badge-red{background:#FDEDEC;color:#C0392B;}
.ld-badge-yellow{background:#FFF8E1;color:#B7770D;}
.ld-badge-gray{background:#F2F2F2;color:var(--ink3);}
.ld-badge-blue{background:#EBF5FB;color:#1A5276;}
.ld-badge-outline{background:transparent;color:var(--ink3);border:1px solid var(--bdr);}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:12.5px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover:not(:disabled){background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);}
.ld-btn-outline:hover:not(:disabled){border-color:var(--gold);color:var(--gold);}
.ld-btn-danger{background:#fff;color:#C0392B;border:1px solid rgba(192,57,43,0.2);}
.ld-btn-danger:hover{background:#FDEDEC;}
.ld-btn-sm{padding:5px 10px;font-size:11.5px;}
.ld-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ld-card-logo{width:44px;height:30px;background:linear-gradient(135deg,#2563EB,#1d4ed8);border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;letter-spacing:0.5px;}
@keyframes ld-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) both;}
.ld-a2{animation:ld-in 0.4s cubic-bezier(0.22,1,0.36,1) 0.07s both;}
@media(max-width:768px){.ld-layout{grid-template-columns:1fr;}.ld-form-grid-2,.ld-form-grid-3{grid-template-columns:1fr;}}
`;

interface CreditCard {
  id: string; cardNumber: string; cardholderName: string; expiryDate: string;
  cvv: string; brand: 'visa' | 'mastercard' | 'amex' | 'elo'; isDefault: boolean; isActive: boolean;
}
interface PixKey {
  id: string; keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  keyValue: string; bankName: string; accountHolder: string; isActive: boolean;
}
interface PaymentTransaction {
  id: string; method: 'credit_card' | 'pix'; amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'; date: string;
  customer: string; description: string; reference: string;
}
interface PaymentMethod {
  id: string; name: string; type: 'credit_card' | 'pix'; isActive: boolean;
  fee: number; processingTime: string; creditCards?: CreditCard[];
  pixKeys?: PixKey[]; transactions?: PaymentTransaction[];
}
interface UserProfile {
  name: string; email: string; phone: string; position: string;
  department: string; avatar: string; cnpj?: string;
}
interface SettingsData {
  companyName: string; companyEmail: string; companyPhone: string;
  address: { street: string; number: string; neighborhood: string; city: string; state: string; zipCode: string; };
  emailNotifications: boolean; pushNotifications: boolean; delayAlerts: boolean;
  extrasAlerts: boolean; systemAlerts: boolean; paymentMethods: PaymentMethod[]; userProfile: UserProfile;
}

const initialSettings: SettingsData = {
  companyName: "Liderum", companyEmail: "contato@liderum.com", companyPhone: "(11) 99999-9999",
  address: { street: "Rua das Empresas", number: "123", neighborhood: "Centro", city: "São Paulo", state: "SP", zipCode: "01000-000" },
  emailNotifications: true, pushNotifications: true, delayAlerts: true, extrasAlerts: true, systemAlerts: false,
  paymentMethods: [
    {
      id: "1", name: "Cartão de Crédito", type: "credit_card", isActive: true, fee: 3.5, processingTime: "Imediato",
      creditCards: [
        { id: "cc1", cardNumber: "**** **** **** 1234", cardholderName: "João Silva", expiryDate: "12/25", cvv: "***", brand: "visa", isDefault: true, isActive: true },
        { id: "cc2", cardNumber: "**** **** **** 5678", cardholderName: "João Silva", expiryDate: "08/26", cvv: "***", brand: "mastercard", isDefault: false, isActive: true }
      ],
      transactions: [
        { id: "t1", method: "credit_card", amount: 150.00, status: "approved", date: "2025-01-15T10:30:00Z", customer: "Maria Santos", description: "Venda de produto", reference: "V001" },
        { id: "t2", method: "credit_card", amount: 89.90, status: "pending", date: "2025-01-15T14:20:00Z", customer: "Pedro Costa", description: "Serviço prestado", reference: "S002" }
      ]
    },
    {
      id: "2", name: "PIX", type: "pix", isActive: true, fee: 0.0, processingTime: "Imediato",
      pixKeys: [
        { id: "pix1", keyType: "email", keyValue: "contato@liderum.com", bankName: "Banco do Brasil", accountHolder: "Liderum Ltda", isActive: true },
        { id: "pix2", keyType: "cpf", keyValue: "123.456.789-00", bankName: "Banco do Brasil", accountHolder: "Liderum Ltda", isActive: false }
      ],
      transactions: [
        { id: "t3", method: "pix", amount: 250.00, status: "approved", date: "2025-01-15T09:15:00Z", customer: "Ana Lima", description: "Pagamento de fatura", reference: "F001" },
        { id: "t4", method: "pix", amount: 75.50, status: "rejected", date: "2025-01-15T16:45:00Z", customer: "Carlos Oliveira", description: "Transferência", reference: "T001" }
      ]
    }
  ],
  userProfile: { name: "João Silva", email: "joao.silva@liderum.com", phone: "(11) 99999-9999", position: "Engenheiro de Obras", department: "Operações", avatar: "" }
};

export function Settings() {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const { showToast } = useSimpleToast();

  const [creditCardModalOpen, setCreditCardModalOpen] = useState(false);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingPix, setEditingPix] = useState<PixKey | null>(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof SettingsData['address'], value: string) => {
    setSettings(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setSettings(prev => ({ ...prev, userProfile: { ...prev.userProfile, [field]: value } }));
  };

  const formatPhone = (value: string): string => {
    const n = value.replace(/\D/g, '');
    return n.length <= 10 ? n.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3') : n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };
  const formatZipCode = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await ProfileService.get();
      setProfile(data);
      setSettings(prev => ({
        ...prev,
        userProfile: { name: data.name || prev.userProfile.name, email: data.email || prev.userProfile.email, phone: data.phone || prev.userProfile.phone, position: prev.userProfile.position, department: prev.userProfile.department, avatar: prev.userProfile.avatar, cnpj: data.cnpj }
      }));
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar perfil', 'error');
    } finally { setProfileLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      const payload: UpdateMyProfileDto = { name: settings.userProfile.name, email: settings.userProfile.email, phone: settings.userProfile.phone, cnpj: settings.userProfile.cnpj, rowVersion: profile?.rowVersion };
      await ProfileService.update(payload);
      if (avatarFile && profile?.rowVersion) {
        const updated = await ProfileService.get();
        if (updated.rowVersion) await ProfileService.updateAvatar(avatarFile, updated.rowVersion);
      }
      showToast('Perfil atualizado com sucesso', 'success');
      loadProfile();
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao salvar perfil', 'error');
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile) return;
    if (!window.confirm('Remover foto de perfil?')) return;
    try {
      await ProfileService.deleteAvatar();
      showToast('Foto removida com sucesso', 'success');
      loadProfile();
      setAvatarPreview(null);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao remover foto', 'error');
    }
  };

  React.useEffect(() => {
    if (activeTab === 'profile' && !profile) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const deleteCreditCard = (cardId: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(m => m.type === 'credit_card' ? { ...m, creditCards: m.creditCards?.filter(c => c.id !== cardId) } : m)
    }));
    toast({ title: "Cartão removido", description: "Cartão de crédito removido com sucesso." });
  };

  const deletePixKey = (pixId: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(m => m.type === 'pix' ? { ...m, pixKeys: m.pixKeys?.filter(p => p.id !== pixId) } : m)
    }));
    toast({ title: "Chave PIX removida", description: "Chave PIX removida com sucesso." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Texto copiado para a área de transferência." });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Configurações salvas", description: "Suas configurações foram atualizadas com sucesso." });
    } catch {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar as configurações.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const getStatusBadge = (status: PaymentTransaction['status']) => {
    const map = { pending: 'ld-badge ld-badge-yellow', approved: 'ld-badge ld-badge-green', rejected: 'ld-badge ld-badge-red', cancelled: 'ld-badge ld-badge-gray' };
    const labels = { pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado', cancelled: 'Cancelado' };
    return <span className={map[status]}>{labels[status]}</span>;
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    /* { id: 'payments', label: 'Pagamentos', icon: CreditCard }, */
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
            <p className="ld-sub" style={{ marginTop: 4 }}>Gerencie configurações do sistema e sua conta</p>
          </div>
          <button className="ld-btn ld-btn-dark" onClick={handleSave} disabled={loading}>
            {loading ? <><Loader2 size={13} className="animate-spin" />Salvando...</> : <><Save size={13} />Salvar</>}
          </button>
        </div>

        {/* Layout */}
        <div className="ld-layout ld-a2">

          {/* Sidebar */}
          <div className="ld-sidebar">
            <div className="ld-sidebar-header">
              <div className="ld-sidebar-title">Categorias</div>
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`ld-nav-item${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>

            {/* GERAL */}
            {activeTab === 'general' && (
              <div className="ld-section">
                <div className="ld-card">
                  <div className="ld-card-body">
                    <h2 className="ld-h2"><SettingsIcon size={15} color="var(--gold)" /> Informações da Empresa</h2>
                    <div className="ld-form-grid-2">
                      <div className="ld-field">
                        <label className="ld-lbl">Nome da Empresa</label>
                        <Input value={settings.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">E-mail da Empresa</label>
                        <Input type="email" value={settings.companyEmail} onChange={(e) => handleInputChange('companyEmail', e.target.value)} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Telefone</label>
                        <Input value={settings.companyPhone} onChange={(e) => handleInputChange('companyPhone', formatPhone(e.target.value))} placeholder="(11) 99999-9999" />
                      </div>
                    </div>

                    <div className="ld-divider" />
                    <h2 className="ld-h2" style={{ fontSize: 14 }}>Endereço</h2>
                    <div className="ld-form-grid-3">
                      <div className="ld-field" style={{ gridColumn: '1/-1' }}>
                        <label className="ld-lbl">Rua</label>
                        <Input value={settings.address.street} onChange={(e) => handleAddressChange('street', e.target.value)} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Número</label>
                        <Input value={settings.address.number} onChange={(e) => handleAddressChange('number', e.target.value)} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Bairro</label>
                        <Input value={settings.address.neighborhood} onChange={(e) => handleAddressChange('neighborhood', e.target.value)} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Cidade</label>
                        <Input value={settings.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Estado</label>
                        <Input value={settings.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} maxLength={2} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">CEP</label>
                        <Input value={settings.address.zipCode} onChange={(e) => handleAddressChange('zipCode', formatZipCode(e.target.value))} placeholder="00000-000" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICAÇÕES */}
            {activeTab === 'notifications' && (
              <div className="ld-section">
                <div className="ld-card">
                  <div className="ld-card-body">
                    <h2 className="ld-h2"><Bell size={15} color="var(--gold)" /> Canais de Notificação</h2>
                    {[
                      { id: 'emailNotifications', field: 'emailNotifications' as keyof SettingsData, label: 'Notificações por E-mail', desc: 'Receber notificações importantes por e-mail' },
                      { id: 'pushNotifications', field: 'pushNotifications' as keyof SettingsData, label: 'Notificações Push', desc: 'Receber notificações em tempo real no navegador' },
                    ].map(item => (
                      <div key={item.id} className="ld-notif-row">
                        <div>
                          <div className="ld-notif-label">{item.label}</div>
                          <div className="ld-notif-desc">{item.desc}</div>
                        </div>
                        <Switch checked={settings[item.field] as boolean} onCheckedChange={(v) => handleInputChange(item.field, v)} />
                      </div>
                    ))}

                    <div className="ld-divider" style={{ margin: '4px 0 12px' }} />
                    <h2 className="ld-h2" style={{ fontSize: 14, marginBottom: 0 }}>Tipos de Alerta</h2>
                    {[
                      { id: 'delayAlerts', field: 'delayAlerts' as keyof SettingsData, label: 'Atrasos em obras', desc: 'Notificar quando obras ou etapas estiverem atrasadas' },
                      { id: 'extrasAlerts', field: 'extrasAlerts' as keyof SettingsData, label: 'Extras pendentes', desc: 'Notificar sobre solicitações de extras aguardando aprovação' },
                      { id: 'systemAlerts', field: 'systemAlerts' as keyof SettingsData, label: 'Alertas do Sistema', desc: 'Notificar sobre atualizações e manutenções' },
                    ].map(item => (
                      <div key={item.id} className="ld-notif-row">
                        <div>
                          <div className="ld-notif-label">{item.label}</div>
                          <div className="ld-notif-desc">{item.desc}</div>
                        </div>
                        <Switch checked={settings[item.field] as boolean} onCheckedChange={(v) => handleInputChange(item.field, v)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PERFIL */}
            {activeTab === 'profile' && (
              <div className="ld-section">
                <div className="ld-card">
                  <div className="ld-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                      <h2 className="ld-h2" style={{ marginBottom: 0 }}><User size={15} color="var(--gold)" /> Informações Pessoais</h2>
                      <button className="ld-btn ld-btn-outline ld-btn-sm" onClick={loadProfile} disabled={profileLoading}>
                        <RefreshCw size={12} className={profileLoading ? 'animate-spin' : ''} /> Atualizar
                      </button>
                    </div>

                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                      <div>
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bdr)' }} />
                        ) : (
                          <div className="ld-avatar">
                            {settings.userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
                          {settings.userProfile.name}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--ink3)' }}>{settings.userProfile.position} · {settings.userProfile.department}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <Label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                          <span className="ld-btn ld-btn-outline ld-btn-sm" style={{ display: 'inline-flex' }}>
                            <Upload size={11} /> Alterar Foto
                          </span>
                        </Label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" aria-label="Upload de foto" style={{ display: 'none' }} />
                        {profile && (avatarPreview || profile.email) && (
                          <button className="ld-btn ld-btn-danger ld-btn-sm" onClick={handleDeleteAvatar}>
                            <Trash2 size={11} /> Remover
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="ld-divider" />

                    <div className="ld-form-grid-2">
                      <div className="ld-field">
                        <label className="ld-lbl">Nome Completo *</label>
                        <Input value={settings.userProfile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">E-mail</label>
                        <Input type="email" value={settings.userProfile.email} onChange={(e) => handleProfileChange('email', e.target.value)} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Telefone</label>
                        <Input value={settings.userProfile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} placeholder="(00) 00000-0000" />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">CNPJ</label>
                        <Input value={settings.userProfile.cnpj || ''} onChange={(e) => handleProfileChange('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Cargo</label>
                        <Input value={settings.userProfile.position} disabled style={{ opacity: 0.6 }} />
                      </div>
                      <div className="ld-field">
                        <label className="ld-lbl">Departamento</label>
                        <Input value={settings.userProfile.department} disabled style={{ opacity: 0.6 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                      <button className="ld-btn ld-btn-dark" onClick={handleProfileSave} disabled={profileLoading}>
                        {profileLoading ? <><Loader2 size={13} className="animate-spin" />Salvando...</> : <><Save size={13} />Salvar Alterações</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>

        {/* Modal Cartão */}
        <Dialog open={creditCardModalOpen} onOpenChange={setCreditCardModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Editar Cartão' : 'Adicionar Cartão de Crédito'}
              </DialogTitle>
              <DialogDescription>{editingCard ? 'Atualize as informações do cartão' : 'Cadastre um novo cartão de crédito'}</DialogDescription>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="ld-field"><label className="ld-lbl">Número do Cartão</label><Input placeholder="1234 5678 9012 3456" defaultValue={editingCard?.cardNumber || ''} /></div>
              <div className="ld-field"><label className="ld-lbl">Nome no Cartão</label><Input placeholder="João Silva" defaultValue={editingCard?.cardholderName || ''} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="ld-field"><label className="ld-lbl">Validade</label><Input placeholder="MM/AA" defaultValue={editingCard?.expiryDate || ''} /></div>
                <div className="ld-field"><label className="ld-lbl">CVV</label><Input placeholder="123" defaultValue={editingCard?.cvv || ''} /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch id="isDefault" defaultChecked={editingCard?.isDefault} />
                <Label htmlFor="isDefault" style={{ fontSize: 13 }}>Cartão padrão</Label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button className="ld-btn ld-btn-outline" onClick={() => setCreditCardModalOpen(false)}>Cancelar</button>
                <button className="ld-btn ld-btn-dark" onClick={() => { setCreditCardModalOpen(false); toast({ title: "Sucesso", description: editingCard ? "Cartão atualizado!" : "Cartão adicionado!" }); }}>
                  {editingCard ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal PIX */}
        <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPix ? 'Editar Chave PIX' : 'Adicionar Chave PIX'}
              </DialogTitle>
              <DialogDescription>{editingPix ? 'Atualize as informações da chave PIX' : 'Cadastre uma nova chave PIX'}</DialogDescription>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="ld-field">
                <label className="ld-lbl">Tipo de Chave</label>
                <Select defaultValue={editingPix?.keyType || 'email'}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="ld-field"><label className="ld-lbl">Chave PIX</label><Input placeholder="Digite a chave PIX" defaultValue={editingPix?.keyValue || ''} /></div>
              <div className="ld-field"><label className="ld-lbl">Banco</label><Input placeholder="Nome do banco" defaultValue={editingPix?.bankName || ''} /></div>
              <div className="ld-field"><label className="ld-lbl">Titular da Conta</label><Input placeholder="Nome do titular" defaultValue={editingPix?.accountHolder || ''} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch id="isActive" defaultChecked={editingPix?.isActive} />
                <Label htmlFor="isActive" style={{ fontSize: 13 }}>Chave ativa</Label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button className="ld-btn ld-btn-outline" onClick={() => setPixModalOpen(false)}>Cancelar</button>
                <button className="ld-btn ld-btn-dark" onClick={() => { setPixModalOpen(false); toast({ title: "Sucesso", description: editingPix ? "Chave PIX atualizada!" : "Chave PIX adicionada!" }); }}>
                  {editingPix ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}

export default Settings;
