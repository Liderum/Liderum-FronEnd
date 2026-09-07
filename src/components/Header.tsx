import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Settings, LogOut, User, ChevronDown, HelpCircle, AlertTriangle, Clock, CheckCircle, Sun, Moon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
.hd{font-family:'DM Sans',sans-serif;background:var(--card-bg,#fff);border-bottom:1px solid var(--bdr,rgba(26,24,20,0.09));height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;position:sticky;top:0;z-index:40;}
.hd-breadcrumb{display:flex;align-items:center;gap:6px;}
.hd-bc-item{font-size:12px;color:var(--ink3,#7A7670);font-weight:400;}
.hd-bc-sep{font-size:11px;color:rgba(26,24,20,0.25);}
.hd-bc-current{font-size:12.5px;font-weight:500;color:var(--ink,#1A1814);}
.hd-right{display:flex;align-items:center;gap:6px;}
.hd-icon-btn{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:none;border:1px solid transparent;color:var(--ink3,#7A7670);cursor:pointer;transition:all 0.16s;position:relative;}
.hd-icon-btn:hover{background:var(--cream,#F7F4EF);border-color:rgba(26,24,20,0.09);color:var(--ink,#1A1814);}
.hd-badge{position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:var(--gold,#B8922A);color:#fff;font-size:8.5px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1.5px solid #fff;}
.hd-sep{width:1px;height:18px;background:rgba(26,24,20,0.09);margin:0 2px;}
.hd-user-btn{display:flex;align-items:center;gap:8px;padding:4px 8px 4px 4px;border-radius:8px;background:none;border:1px solid transparent;cursor:pointer;transition:all 0.16s;font-family:'DM Sans',sans-serif;}
.hd-user-btn:hover{background:var(--cream,#F7F4EF);border-color:rgba(26,24,20,0.09);}
.hd-avatar{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#F0E4C4,#EDE9E1);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:10.5px;font-weight:700;color:var(--gold,#B8922A);flex-shrink:0;border:1px solid rgba(184,146,42,0.2);}
.hd-user-name{font-size:12px;font-weight:500;color:var(--ink,#1A1814);max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.hd-chevron{color:var(--ink3,#7A7670);}
.hd-notif-wrap{width:300px;padding:0;}
.hd-notif-header{padding:12px 14px 8px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(26,24,20,0.08);}
.hd-notif-title{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;color:var(--ink,#1A1814);}
.hd-notif-clear{font-size:11px;color:var(--gold,#B8922A);cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;}
.hd-notif-item{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;cursor:pointer;transition:background 0.14s;}
.hd-notif-item:hover{background:var(--cream,#F7F4EF);}
.hd-notif-ico{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.hd-notif-body{flex:1;min-width:0;}
.hd-notif-label{font-size:12.5px;font-weight:500;color:var(--ink,#1A1814);line-height:1.3;}
.hd-notif-desc{font-size:11.5px;color:var(--ink3,#7A7670);margin-top:1px;line-height:1.4;}
.hd-notif-time{font-size:10.5px;color:rgba(26,24,20,0.4);margin-top:3px;}
.hd-notif-footer{padding:8px 14px;border-top:1px solid rgba(26,24,20,0.08);text-align:center;}
.hd-notif-all{font-size:12px;color:var(--gold,#B8922A);cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;font-weight:500;}
.hd-menu-header{padding:10px 12px;border-bottom:1px solid rgba(26,24,20,0.08);}
.hd-menu-user{display:flex;align-items:center;gap:8px;}
.hd-menu-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#F0E4C4,#EDE9E1);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:13px;font-weight:700;color:var(--gold,#B8922A);border:1.5px solid rgba(184,146,42,0.2);}
.hd-menu-name{font-size:13px;font-weight:500;color:var(--ink,#1A1814);}
.hd-menu-email{font-size:11px;color:var(--ink3,#7A7670);}
`;

const routeLabels: Record<string, string> = {
  '/home': 'Dashboard',
  '/works': 'Obras',
  '/settings': 'Configurações',
  '/management/customers': 'Clientes',
  '/management/users': 'Usuários',
  '/management/companies': 'Empresas',
  '/management/suppliers': 'Fornecedores',
  '/contact': 'Suporte',
};

function resolveLabel(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.match(/^\/works\/[^/]+\/schedule/)) return 'Cronograma';
  if (pathname.match(/^\/works\/[^/]+\/budget/)) return 'Orçamento';
  if (pathname.match(/^\/works\/[^/]+\/extras/)) return 'Extras';
  if (pathname.match(/^\/works\/[^/]+\/daily-log/)) return 'Diário de Obra';
  if (pathname.match(/^\/works\/[^/]+/)) return 'Detalhe da Obra';
  for (const [key, label] of Object.entries(routeLabels)) {
    if (pathname.startsWith(key + '/')) return label;
  }
  return 'Painel';
}

const notifications = [
  { id: 1, icon: AlertTriangle, color: '#FDEDEC', iconColor: '#C0392B', label: 'Obra atrasada', desc: 'Galpão Logístico BR-101 com 22 dias de atraso', time: 'Há 2h' },
  { id: 2, icon: Clock, color: '#FFF8E1', iconColor: '#B7770D', label: 'Extra pendente', desc: 'Ampliação da área de lazer aguarda aprovação', time: 'Há 6h' },
  { id: 3, icon: CheckCircle, color: '#E8F5E9', iconColor: '#1E8449', label: 'Obra concluída', desc: 'Condomínio Parque das Águas entregue', time: 'Ontem' },
];

export function Header() {
  const { user, signOut, isOnboardingComplete } = useAuth();
  const { resolvedTheme, setPreference } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const toggleTheme = () => setPreference(resolvedTheme === 'dark' ? 'light' : 'dark');

  const handleSignOut = () => {
    signOut();
    toast({ title: "Logout realizado", description: "Você foi desconectado com sucesso" });
  };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const currentLabel = resolveLabel(location.pathname);

  return (
    <>
      <style>{CSS}</style>
      <header className="hd">
        <div className="hd-breadcrumb">
          <span className="hd-bc-item">Liderum</span>
          <span className="hd-bc-sep">/</span>
          <span className="hd-bc-current">{currentLabel}</span>
        </div>

        <div className="hd-right">
          <DropdownMenu>
            {/* <DropdownMenuTrigger asChild> 
              <button className="hd-icon-btn" aria-label="Notificações">
                <Bell size={14} />
                <span className="hd-badge">3</span>
              </button>
            </DropdownMenuTrigger> */}
            <DropdownMenuContent align="end" style={{ padding: 0, borderRadius: 10, border: '1px solid rgba(26,24,20,0.09)', boxShadow: '0 8px 30px rgba(26,24,20,0.10)' }}>
              <div className="hd-notif-wrap">
                <div className="hd-notif-header">
                  <span className="hd-notif-title">Notificações</span>
                  <button className="hd-notif-clear">Marcar como lidas</button>
                </div>
                {notifications.map(n => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="hd-notif-item">
                      <div className="hd-notif-ico" style={{ background: n.color }}>
                        <Icon size={13} color={n.iconColor} />
                      </div>
                      <div className="hd-notif-body">
                        <div className="hd-notif-label">{n.label}</div>
                        <div className="hd-notif-desc">{n.desc}</div>
                        <div className="hd-notif-time">{n.time}</div>
                      </div>
                    </div>
                  );
                })}
                <div className="hd-notif-footer">
                  <button className="hd-notif-all">Ver todas as notificações →</button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {isOnboardingComplete && (
            <button
              className="hd-icon-btn"
              aria-label={resolvedTheme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              onClick={toggleTheme}
            >
              {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}

          <div className="hd-sep" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hd-user-btn">
                <div className="hd-avatar">{getInitials(user?.name || 'U')}</div>
                <span className="hd-user-name">{user?.name || 'Usuário'}</span>
                <ChevronDown size={11} className="hd-chevron" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ borderRadius: 10, border: '1px solid rgba(26,24,20,0.09)', boxShadow: '0 8px 30px rgba(26,24,20,0.10)', minWidth: 200 }}>
              <div className="hd-menu-header">
                <div className="hd-menu-user">
                  <div className="hd-menu-avatar">{getInitials(user?.name || 'U')}</div>
                  <div>
                    <div className="hd-menu-name">{user?.name}</div>
                    <div className="hd-menu-email">{user?.email}</div>
                  </div>
                </div>
              </div>
              <DropdownMenuItem onClick={() => navigate('/settings')} style={{ fontSize: 12.5, gap: 8, cursor: 'pointer' }}>
                <User size={13} /> Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} style={{ fontSize: 12.5, gap: 8, cursor: 'pointer' }}>
                <Settings size={13} /> Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/contact')} style={{ fontSize: 12.5, gap: 8, cursor: 'pointer' }}>
                <HelpCircle size={13} /> Suporte
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} style={{ fontSize: 12.5, gap: 8, color: '#C0392B', cursor: 'pointer' }}>
                <LogOut size={13} /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
