import React, { useState } from 'react';
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon,
  Save,
  Bell,
  CreditCard,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Copy,
  QrCode,
  Shield,
  CreditCard as CardIcon,
  Smartphone,
  Upload,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSimpleToast } from "@/hooks/useSimpleToast";
import { ProfileService } from "@/services/managementService";
import { Profile, UpdateMyProfileDto } from "@/types/management";

interface CreditCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'elo';
  isDefault: boolean;
  isActive: boolean;
}

interface PixKey {
  id: string;
  keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  keyValue: string;
  bankName: string;
  accountHolder: string;
  isActive: boolean;
}

interface PaymentTransaction {
  id: string;
  method: 'credit_card' | 'pix';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  date: string;
  customer: string;
  description: string;
  reference: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'pix';
  isActive: boolean;
  fee: number;
  processingTime: string;
  creditCards?: CreditCard[];
  pixKeys?: PixKey[];
  transactions?: PaymentTransaction[];
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  avatar: string;
  cnpj?: string;
}

interface SettingsData {
  // Configurações Gerais
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Configurações de Notificações
  emailNotifications: boolean;
  pushNotifications: boolean;
  lowStockAlerts: boolean;
  salesAlerts: boolean;
  systemAlerts: boolean;
  
  // Métodos de Pagamento
  paymentMethods: PaymentMethod[];
  
  // Perfil do Usuário
  userProfile: UserProfile;
}

const initialSettings: SettingsData = {
  companyName: "Liderum ERP",
  companyEmail: "contato@liderum.com",
  companyPhone: "(11) 99999-9999",
  address: {
    street: "Rua das Empresas",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01000-000"
  },
  
  emailNotifications: true,
  pushNotifications: true,
  lowStockAlerts: true,
  salesAlerts: true,
  systemAlerts: false,
  
  paymentMethods: [
    {
      id: "1",
      name: "Cartão de Crédito",
      type: "credit_card",
      isActive: true,
      fee: 3.5,
      processingTime: "Imediato",
      creditCards: [
        {
          id: "cc1",
          cardNumber: "**** **** **** 1234",
          cardholderName: "João Silva",
          expiryDate: "12/25",
          cvv: "***",
          brand: "visa",
          isDefault: true,
          isActive: true
        },
        {
          id: "cc2",
          cardNumber: "**** **** **** 5678",
          cardholderName: "João Silva",
          expiryDate: "08/26",
          cvv: "***",
          brand: "mastercard",
          isDefault: false,
          isActive: true
        }
      ],
      transactions: [
        {
          id: "t1",
          method: "credit_card",
          amount: 150.00,
          status: "approved",
          date: "2025-01-15T10:30:00Z",
          customer: "Maria Santos",
          description: "Venda de produto",
          reference: "V001"
        },
        {
          id: "t2",
          method: "credit_card",
          amount: 89.90,
          status: "pending",
          date: "2025-01-15T14:20:00Z",
          customer: "Pedro Costa",
          description: "Serviço prestado",
          reference: "S002"
        }
      ]
    },
    {
      id: "2",
      name: "PIX",
      type: "pix",
      isActive: true,
      fee: 0.0,
      processingTime: "Imediato",
      pixKeys: [
        {
          id: "pix1",
          keyType: "email",
          keyValue: "contato@liderum.com",
          bankName: "Banco do Brasil",
          accountHolder: "Liderum ERP Ltda",
          isActive: true
        },
        {
          id: "pix2",
          keyType: "cpf",
          keyValue: "123.456.789-00",
          bankName: "Banco do Brasil",
          accountHolder: "Liderum ERP Ltda",
          isActive: false
        }
      ],
      transactions: [
        {
          id: "t3",
          method: "pix",
          amount: 250.00,
          status: "approved",
          date: "2025-01-15T09:15:00Z",
          customer: "Ana Lima",
          description: "Pagamento de fatura",
          reference: "F001"
        },
        {
          id: "t4",
          method: "pix",
          amount: 75.50,
          status: "rejected",
          date: "2025-01-15T16:45:00Z",
          customer: "Carlos Oliveira",
          description: "Transferência",
          reference: "T001"
        }
      ]
    }
  ],
  
  userProfile: {
    name: "João Silva",
    email: "joao.silva@liderum.com",
    phone: "(11) 99999-9999",
    position: "Gerente de Vendas",
    department: "Vendas",
    avatar: ""
  }
};

export function Settings() {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const { showToast } = useSimpleToast();

  // Estados para modais e formulários
  const [creditCardModalOpen, setCreditCardModalOpen] = useState(false);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingPix, setEditingPix] = useState<PixKey | null>(null);
  const [showCardDetails, setShowCardDetails] = useState<Record<string, boolean>>({});

  // Estados para perfil (integração com API)
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodToggle = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.id === id ? { ...method, isActive: !method.isActive } : method
      )
    }));
  };

  const handlePaymentMethodEdit = (id: string, field: keyof PaymentMethod, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.id === id ? { ...method, [field]: value } : method
      )
    }));
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setSettings(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, [field]: value }
    }));
  };

  // Funções para gerenciar perfil via API
  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await ProfileService.get();
      setProfile(data);
      // Atualiza o estado local com os dados da API
      setSettings(prev => ({
        ...prev,
        userProfile: {
          name: data.name || prev.userProfile.name,
          email: data.email || prev.userProfile.email,
          phone: data.phone || prev.userProfile.phone,
          position: prev.userProfile.position,
          department: prev.userProfile.department,
          avatar: prev.userProfile.avatar,
          cnpj: data.cnpj,
        }
      }));
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao carregar perfil', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      const payload: UpdateMyProfileDto = {
        name: settings.userProfile.name,
        email: settings.userProfile.email,
        phone: settings.userProfile.phone,
        cnpj: settings.userProfile.cnpj,
        rowVersion: profile?.rowVersion,
      };
      await ProfileService.update(payload);

      // Upload avatar if selected
      if (avatarFile && profile?.rowVersion) {
        // Reload profile to get updated rowVersion after profile update
        const updatedProfile = await ProfileService.get();
        if (updatedProfile.rowVersion) {
          await ProfileService.updateAvatar(avatarFile, updatedProfile.rowVersion);
        }
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

    const confirmed = window.confirm('Remover foto de perfil?');
    if (!confirmed) return;

    try {
      await ProfileService.deleteAvatar();
      showToast('Foto de perfil removida com sucesso', 'success');
      loadProfile();
      setAvatarPreview(null);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Erro ao remover foto', 'error');
    }
  };

  // Carrega perfil quando a aba de perfil é aberta
  React.useEffect(() => {
    if (activeTab === 'profile' && !profile) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAddressChange = (field: keyof SettingsData['address'], value: string) => {
    setSettings(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatZipCode = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setSettings(prev => ({ ...prev, companyPhone: formatted }));
  };

  const handleZipCodeChange = (value: string) => {
    const formatted = formatZipCode(value);
    handleAddressChange('zipCode', formatted);
  };

  // Funções para gerenciar cartões de crédito
  const addCreditCard = (cardData: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...cardData,
      id: `cc${Date.now()}`
    };
    
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.type === 'credit_card'
          ? {
              ...method,
              creditCards: [...(method.creditCards || []), newCard]
            }
          : method
      )
    }));
    
    toast({
      title: "Cartão adicionado",
      description: "Cartão de crédito cadastrado com sucesso.",
    });
  };

  const updateCreditCard = (cardId: string, cardData: Partial<CreditCard>) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.type === 'credit_card'
          ? {
              ...method,
              creditCards: method.creditCards?.map(card =>
                card.id === cardId ? { ...card, ...cardData } : card
              )
            }
          : method
      )
    }));
    
    toast({
      title: "Cartão atualizado",
      description: "Cartão de crédito atualizado com sucesso.",
    });
  };

  const deleteCreditCard = (cardId: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.type === 'credit_card'
          ? {
              ...method,
              creditCards: method.creditCards?.filter(card => card.id !== cardId)
            }
          : method
      )
    }));
    
    toast({
      title: "Cartão removido",
      description: "Cartão de crédito removido com sucesso.",
    });
  };

  // Funções para gerenciar chaves PIX
  const addPixKey = (pixData: Omit<PixKey, 'id'>) => {
    const newPix: PixKey = {
      ...pixData,
      id: `pix${Date.now()}`
    };
    
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.type === 'pix'
          ? {
              ...method,
              pixKeys: [...(method.pixKeys || []), newPix]
            }
          : method
      )
    }));
    
    toast({
      title: "Chave PIX adicionada",
      description: "Chave PIX cadastrada com sucesso.",
    });
  };

  const updatePixKey = (pixId: string, pixData: Partial<PixKey>) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.type === 'pix'
          ? {
              ...method,
              pixKeys: method.pixKeys?.map(pix =>
                pix.id === pixId ? { ...pix, ...pixData } : pix
              )
            }
          : method
      )
    }));
    
    toast({
      title: "Chave PIX atualizada",
      description: "Chave PIX atualizada com sucesso.",
    });
  };

  const deletePixKey = (pixId: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.type === 'pix'
          ? {
              ...method,
              pixKeys: method.pixKeys?.filter(pix => pix.id !== pixId)
            }
          : method
      )
    }));
    
    toast({
      title: "Chave PIX removida",
      description: "Chave PIX removida com sucesso.",
    });
  };

  // Funções auxiliares
  const getCardBrand = (cardNumber: string): CreditCard['brand'] => {
    const number = cardNumber.replace(/\D/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'elo';
  };

  const formatCardNumber = (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const getStatusBadge = (status: PaymentTransaction['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: 'Pendente', icon: Clock },
      approved: { variant: 'default' as const, text: 'Aprovado', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, text: 'Rejeitado', icon: AlertTriangle },
      cancelled: { variant: 'outline' as const, text: 'Cancelado', icon: Minus }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'payments', label: 'Métodos de Pagamento', icon: CreditCard },
    { id: 'profile', label: 'Meu Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <SettingsIcon className="h-8 w-8 text-blue-600" />
                Configurações
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie as configurações do sistema e personalize sua experiência
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Navegação */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Configurações Gerais */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        Informações da Empresa
                      </CardTitle>
                      <CardDescription>
                        Configure as informações básicas da sua empresa
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyName">Nome da Empresa</Label>
                          <Input
                            id="companyName"
                            value={settings.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyEmail">E-mail da Empresa</Label>
                          <Input
                            id="companyEmail"
                            type="email"
                            value={settings.companyEmail}
                            onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyPhone">Telefone</Label>
                          <Input
                            id="companyPhone"
                            value={settings.companyPhone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="street">Rua</Label>
                            <Input
                              id="street"
                              value={settings.address.street}
                              onChange={(e) => handleAddressChange('street', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="number">Número</Label>
                            <Input
                              id="number"
                              value={settings.address.number}
                              onChange={(e) => handleAddressChange('number', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="neighborhood">Bairro</Label>
                            <Input
                              id="neighborhood"
                              value={settings.address.neighborhood}
                              onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">Cidade</Label>
                            <Input
                              id="city"
                              value={settings.address.city}
                              onChange={(e) => handleAddressChange('city', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">Estado</Label>
                            <Input
                              id="state"
                              value={settings.address.state}
                              onChange={(e) => handleAddressChange('state', e.target.value)}
                              maxLength={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zipCode">CEP</Label>
                            <Input
                              id="zipCode"
                              value={settings.address.zipCode}
                              onChange={(e) => handleZipCodeChange(e.target.value)}
                              placeholder="00000-000"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Configurações de Notificações */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Preferências de Notificação
                      </CardTitle>
                      <CardDescription>
                        Configure como e quando você deseja receber notificações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="emailNotifications">Notificações por E-mail</Label>
                            <p className="text-sm text-gray-500">Receber notificações importantes por e-mail</p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="pushNotifications">Notificações Push</Label>
                            <p className="text-sm text-gray-500">Receber notificações em tempo real no navegador</p>
                          </div>
                          <Switch
                            id="pushNotifications"
                            checked={settings.pushNotifications}
                            onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Tipos de Notificação</h4>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="lowStockAlerts">Alertas de Estoque Baixo</Label>
                              <p className="text-sm text-gray-500">Notificar quando produtos estão com estoque baixo</p>
                            </div>
                            <Switch
                              id="lowStockAlerts"
                              checked={settings.lowStockAlerts}
                              onCheckedChange={(checked) => handleInputChange('lowStockAlerts', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="salesAlerts">Alertas de Vendas</Label>
                              <p className="text-sm text-gray-500">Notificar sobre vendas importantes e metas</p>
                            </div>
                            <Switch
                              id="salesAlerts"
                              checked={settings.salesAlerts}
                              onCheckedChange={(checked) => handleInputChange('salesAlerts', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="systemAlerts">Alertas do Sistema</Label>
                              <p className="text-sm text-gray-500">Notificar sobre atualizações e manutenções</p>
                            </div>
                            <Switch
                              id="systemAlerts"
                              checked={settings.systemAlerts}
                              onCheckedChange={(checked) => handleInputChange('systemAlerts', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Métodos de Pagamento */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Métodos de Pagamento
                      </CardTitle>
                      <CardDescription>
                        Gerencie cartões de crédito e chaves PIX
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="credit-card" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="credit-card" className="flex items-center gap-2">
                            <CardIcon className="h-4 w-4" />
                            Cartão de Crédito
                          </TabsTrigger>
                          <TabsTrigger value="pix" className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            PIX
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="credit-card" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">Cartões Cadastrados</h3>
                              <p className="text-sm text-gray-500">Gerencie seus cartões de crédito</p>
                            </div>
                            <Button 
                              onClick={() => {
                                setEditingCard(null);
                                setCreditCardModalOpen(true);
                              }}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Adicionar Cartão
                            </Button>
                          </div>
                          
                          <div className="grid gap-4">
                            {settings.paymentMethods
                              .find(m => m.type === 'credit_card')?.creditCards?.map((card) => (
                              <Card key={card.id} className="relative">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                          {card.brand.toUpperCase().slice(0, 2)}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium">{card.cardNumber}</p>
                                        <p className="text-sm text-gray-500">{card.cardholderName}</p>
                                        <p className="text-sm text-gray-500">Expira em {card.expiryDate}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {card.isDefault && (
                                        <Badge variant="default">Padrão</Badge>
                                      )}
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          setEditingCard(card);
                                          setCreditCardModalOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-red-600"
                                        onClick={() => deleteCreditCard(card.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )) || []}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="pix" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">Chaves PIX</h3>
                              <p className="text-sm text-gray-500">Gerencie suas chaves PIX</p>
                            </div>
                            <Button 
                              onClick={() => {
                                setEditingPix(null);
                                setPixModalOpen(true);
                              }}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Adicionar Chave
                            </Button>
                          </div>
                          
                          <div className="grid gap-4">
                            {settings.paymentMethods
                              .find(m => m.type === 'pix')?.pixKeys?.map((pix) => (
                              <Card key={pix.id} className="relative">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="capitalize">
                                          {pix.keyType}
                                        </Badge>
                                        {pix.isActive ? (
                                          <Badge variant="default">Ativa</Badge>
                                        ) : (
                                          <Badge variant="secondary">Inativa</Badge>
                                        )}
                                      </div>
                                      <p className="font-medium text-lg">{pix.keyValue}</p>
                                      <p className="text-sm text-gray-500">{pix.bankName}</p>
                                      <p className="text-sm text-gray-500">{pix.accountHolder}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => copyToClipboard(pix.keyValue)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          setEditingPix(pix);
                                          setPixModalOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-red-600"
                                        onClick={() => deletePixKey(pix.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )) || []}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                  
                  {/* Histórico de Transações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Histórico de Transações
                      </CardTitle>
                      <CardDescription>
                        Últimas transações realizadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {settings.paymentMethods.flatMap(method => method.transactions || [])
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 10)
                          .map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                {transaction.method === 'credit_card' ? (
                                  <CardIcon className="h-5 w-5 text-gray-600" />
                                ) : (
                                  <Smartphone className="h-5 w-5 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{transaction.customer}</p>
                                <p className="text-sm text-gray-500">{transaction.description}</p>
                                <p className="text-xs text-gray-400">{transaction.reference}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">
                                R$ {transaction.amount.toFixed(2).replace('.', ',')}
                              </p>
                              <div className="mt-1">
                                {getStatusBadge(transaction.status)}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(transaction.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Meu Perfil */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informações Pessoais
                          </CardTitle>
                          <CardDescription>
                            Gerencie suas informações pessoais e profissionais
                          </CardDescription>
                        </div>
                        <Button onClick={loadProfile} variant="outline" className="gap-2" disabled={profileLoading}>
                          <RefreshCw className={`h-4 w-4 ${profileLoading ? 'animate-spin' : ''}`} />
                          Atualizar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Avatar Section */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Preview"
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center border-2 border-gray-300">
                              <span className="text-white font-bold text-2xl">
                                {settings.userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{settings.userProfile.name}</h3>
                          <p className="text-gray-600">{settings.userProfile.position}</p>
                          <p className="text-sm text-gray-500">{settings.userProfile.department}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="avatar-upload" className="cursor-pointer">
                            <Button variant="outline" size="sm" className="gap-2" asChild>
                              <span>
                                <Upload className="h-4 w-4" />
                                Alterar Foto
                              </span>
                            </Button>
                          </Label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            aria-label="Upload de foto de perfil"
                          />
                          {profile && (avatarPreview || profile.email) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-red-600 hover:text-red-700"
                              onClick={handleDeleteAvatar}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remover Foto
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="profileName">Nome Completo *</Label>
                          <Input
                            id="profileName"
                            value={settings.userProfile.name}
                            onChange={(e) => handleProfileChange('name', e.target.value)}
                            placeholder="Seu nome completo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="profileEmail">E-mail</Label>
                          <Input
                            id="profileEmail"
                            type="email"
                            value={settings.userProfile.email}
                            onChange={(e) => handleProfileChange('email', e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="profilePhone">Telefone</Label>
                          <Input
                            id="profilePhone"
                            value={settings.userProfile.phone}
                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="profileCnpj">CNPJ</Label>
                          <Input
                            id="profileCnpj"
                            value={settings.userProfile.cnpj || ''}
                            onChange={(e) => handleProfileChange('cnpj', e.target.value)}
                            placeholder="00.000.000/0000-00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="profilePosition">Cargo</Label>
                          <Input
                            id="profilePosition"
                            value={settings.userProfile.position}
                            onChange={(e) => handleProfileChange('position', e.target.value)}
                            disabled
                          />
                        </div>
                        <div>
                          <Label htmlFor="profileDepartment">Departamento</Label>
                          <Input
                            id="profileDepartment"
                            value={settings.userProfile.department}
                            onChange={(e) => handleProfileChange('department', e.target.value)}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button onClick={handleProfileSave} className="gap-2" disabled={profileLoading}>
                          {profileLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Salvar Alterações
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal para Cartão de Crédito */}
      <Dialog open={creditCardModalOpen} onOpenChange={setCreditCardModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Editar Cartão' : 'Adicionar Cartão de Crédito'}
            </DialogTitle>
            <DialogDescription>
              {editingCard ? 'Atualize as informações do cartão' : 'Cadastre um novo cartão de crédito'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                defaultValue={editingCard?.cardNumber || ''}
              />
            </div>
            <div>
              <Label htmlFor="cardholderName">Nome no Cartão</Label>
              <Input
                id="cardholderName"
                placeholder="João Silva"
                defaultValue={editingCard?.cardholderName || ''}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Validade</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/AA"
                  defaultValue={editingCard?.expiryDate || ''}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  defaultValue={editingCard?.cvv || ''}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isDefault" defaultChecked={editingCard?.isDefault} />
              <Label htmlFor="isDefault">Cartão padrão</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCreditCardModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                // Aqui seria implementada a lógica de salvar
                setCreditCardModalOpen(false);
                toast({
                  title: "Sucesso",
                  description: editingCard ? "Cartão atualizado!" : "Cartão adicionado!",
                });
              }}>
                {editingCard ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Chave PIX */}
      <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPix ? 'Editar Chave PIX' : 'Adicionar Chave PIX'}
            </DialogTitle>
            <DialogDescription>
              {editingPix ? 'Atualize as informações da chave PIX' : 'Cadastre uma nova chave PIX'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyType">Tipo de Chave</Label>
              <Select defaultValue={editingPix?.keyType || 'email'}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="random">Chave Aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="keyValue">Chave PIX</Label>
              <Input
                id="keyValue"
                placeholder="Digite a chave PIX"
                defaultValue={editingPix?.keyValue || ''}
              />
            </div>
            <div>
              <Label htmlFor="bankName">Banco</Label>
              <Input
                id="bankName"
                placeholder="Nome do banco"
                defaultValue={editingPix?.bankName || ''}
              />
            </div>
            <div>
              <Label htmlFor="accountHolder">Titular da Conta</Label>
              <Input
                id="accountHolder"
                placeholder="Nome do titular"
                defaultValue={editingPix?.accountHolder || ''}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" defaultChecked={editingPix?.isActive} />
              <Label htmlFor="isActive">Chave ativa</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setPixModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                // Aqui seria implementada a lógica de salvar
                setPixModalOpen(false);
                toast({
                  title: "Sucesso",
                  description: editingPix ? "Chave PIX atualizada!" : "Chave PIX adicionada!",
                });
              }}>
                {editingPix ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Settings;
