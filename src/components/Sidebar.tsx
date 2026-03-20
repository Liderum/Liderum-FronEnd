import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ShoppingCart, FileText, Wallet, Package, Users,
  BarChart3, Truck, CreditCard, TrendingUp, ChevronRight,
  Building2, UserCheck, Zap, Settings, LogOut, HelpCircle,
  ShoppingBag, Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.10);}
.sb{font-family:'DM Sans',sans-serif;width:210px;min-width:210px;background:#fff;border-right:1px solid var(--bdr);display:flex;flex-direction:column;height:100vh;overflow:hidden;}
.sb-logo{padding:16px 16px 12px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:10px;flex-shrink:0;}
.sb-logo-mark{width:30px;height:30px;background:var(--ink);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;overflow:hidden;}
.sb-logo-mark::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.sb-logo-mark span{font-family:'Cormorant Garamond',serif;color:#fff;font-size:15px;font-weight:700;line-height:1;}
.sb-logo-text{flex:1;min-width:0;}
.sb-logo-title{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:700;color:var(--ink);line-height:1.2;}
.sb-logo-sub{font-size:10px;color:var(--ink3);font-weight:300;letter-spacing:0.3px;}
.sb-scroll{flex:1;overflow-y:auto;padding:10px 8px;}
.sb-scroll::-webkit-scrollbar{width:3px;}
.sb-scroll::-webkit-scrollbar-track{background:transparent;}
.sb-scroll::-webkit-scrollbar-thumb{background:var(--cream2);border-radius:10px;}
.sb-section{margin-bottom:18px;}
.sb-section-label{font-size:9.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink3);padding:0 8px;margin-bottom:4px;}
.sb-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:7px;font-size:12.5px;color:var(--ink2);font-weight:400;cursor:pointer;transition:all 0.16s;text-decoration:none;border:none;background:none;width:100%;font-family:'DM Sans',sans-serif;position:relative;}
.sb-item:hover{background:var(--cream);color:var(--ink);}
.sb-item.active{background:rgba(184,146,42,0.07);color:var(--gold);font-weight:500;}
.sb-item.active::before{content:'';position:absolute;left:-8px;top:50%;transform:translateY(-50%);width:2px;height:65%;background:var(--gold);border-radius:0 2px 2px 0;}
.sb-item-left{display:flex;align-items:center;gap:8px;}
.sb-badge{min-width:17px;height:17px;padding:0 4px;background:rgba(184,146,42,0.12);color:var(--gold);border-radius:10px;font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;}
.sb-sub-item{display:flex;align-items:center;gap:7px;padding:5px 8px 5px 24px;border-radius:6px;font-size:12px;color:var(--ink3);cursor:pointer;transition:all 0.15s;text-decoration:none;}
.sb-sub-item:hover{background:var(--cream);color:var(--ink);}
.sb-sub-item.active{color:var(--gold);background:rgba(184,146,42,0.05);}
.sb-divider{height:1px;background:var(--bdr);margin:6px 0;}
.sb-bottom{padding:8px;border-top:1px solid var(--bdr);flex-shrink:0;}
.sb-user{display:flex;align-items:center;gap:9px;padding:8px;border-radius:8px;cursor:pointer;transition:all 0.16s;border:1px solid transparent;}
.sb-user:hover{background:var(--cream);border-color:var(--bdr);}
.sb-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--gold-light),var(--cream2));display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:11px;font-weight:700;color:var(--gold);flex-shrink:0;border:1px solid rgba(184,146,42,0.2);}
.sb-user-info{flex:1;min-width:0;}
.sb-user-name{font-size:12px;font-weight:500;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sb-user-role{font-size:10.5px;color:var(--ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sb-action-row{display:flex;gap:4px;margin-top:6px;}
.sb-action-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:5px 6px;border-radius:6px;font-size:11px;color:var(--ink3);border:1px solid var(--bdr);background:#fff;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.sb-action-btn:hover{background:var(--cream);color:var(--ink);}
.sb-action-btn.danger:hover{background:#FDEDEC;color:#C0392B;border-color:rgba(192,57,43,0.2);}
@keyframes sb-in{from{opacity:0;height:0}to{opacity:1;height:auto}}
`;

const nav = [
  {
    label: 'Principal',
    items: [
      { name: 'Início', href: '/home', icon: Home },
      { name: 'Vendas', href: '/sales', icon: ShoppingCart, badge: '5' },
      { name: 'Faturamento', href: '/billing', icon: FileText, badge: '3' },
      { name: 'Financeiro', href: '/financial', icon: Wallet },
      { name: 'Estoque', href: '/inventory', icon: Package, badge: '2' },
    ]
  },
  {
    label: 'Gestão',
    items: [
      { name: 'Usuários', href: '/management/users', icon: Users },
      {
        name: 'Marketplaces', icon: Zap,
        children: [
          { name: 'Mercado Livre', href: '/sales/mercadolivre', icon: ShoppingBag },
          { name: 'Amazon', href: '/sales/amazon', icon: ShoppingBag },
          { name: 'Shopee', href: '/sales/shopee', icon: ShoppingBag },
        ]
      },
      {
        name: 'Relatórios', icon: BarChart3,
        children: [
          { name: 'Vendas', href: '/sales', icon: TrendingUp },
          { name: 'Financeiro', href: '/financial', icon: Wallet },
          { name: 'Estoque', href: '/inventory', icon: Layers },
        ]
      },
    ]
  },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const toggle = (name: string) => setExpanded(p => p.includes(name) ? p.filter(n => n !== name) : [...p, name]);
  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = () => {
    signOut();
    toast({ title: "Logout realizado", description: "Você foi desconectado com sucesso" });
  };

  return (
    <>
      <style>{CSS}</style>
      <aside className="sb">

        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark"><span>L</span></div>
          <div className="sb-logo-text">
            <div className="sb-logo-title">Liderum</div>
            <div className="sb-logo-sub">Sistema ERP</div>
          </div>
        </div>

        {/* Nav */}
        <div className="sb-scroll">
          {nav.map((section) => (
            <div key={section.label} className="sb-section">
              <div className="sb-section-label">{section.label}</div>
              {section.items.map((item) => {
                if ('children' in item && item.children) {
                  const Icon = item.icon;
                  const isOpen = expanded.includes(item.name);
                  const hasActive = item.children.some(c => isActive(c.href));
                  return (
                    <div key={item.name}>
                      <button className={`sb-item${hasActive ? ' active' : ''}`} onClick={() => toggle(item.name)}>
                        <div className="sb-item-left">
                          <Icon size={14} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight size={11} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--ink3)' }} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <NavLink key={child.name} to={child.href} className={({ isActive: a }) => `sb-sub-item${a || isActive(child.href) ? ' active' : ''}`}>
                                  <ChildIcon size={12} />{child.name}
                                </NavLink>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                const Icon = item.icon;
                const badge = 'badge' in item ? item.badge : null;
                return (
                  <NavLink key={item.name} to={item.href} className={({ isActive: a }) => `sb-item${a ? ' active' : ''}`}>
                    <div className="sb-item-left">
                      <Icon size={14} />
                      <span>{item.name}</span>
                    </div>
                    {badge && <span className="sb-badge">{badge}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}

          <div className="sb-divider" />

          {/* Atalhos de rodapé no scroll */}
          <div className="sb-section">
            <NavLink to="/settings" className={({ isActive: a }) => `sb-item${a ? ' active' : ''}`}>
              <div className="sb-item-left"><Settings size={14} /><span>Configurações</span></div>
            </NavLink>
            <NavLink to="/contact" className={({ isActive: a }) => `sb-item${a ? ' active' : ''}`}>
              <div className="sb-item-left"><HelpCircle size={14} /><span>Suporte</span></div>
            </NavLink>
          </div>
        </div>

        {/* Usuário */}
        <div className="sb-bottom">
          <div className="sb-user" onClick={() => navigate('/settings')}>
            <div className="sb-avatar">{getInitials(user?.name || 'U')}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user?.name || 'Usuário'}</div>
              <div className="sb-user-role">{user?.email || ''}</div>
            </div>
          </div>
          <div className="sb-action-row">
            <button className="sb-action-btn" onClick={() => navigate('/settings')}>
              <Settings size={11} /> Config
            </button>
            <button className="sb-action-btn danger" onClick={handleSignOut}>
              <LogOut size={11} /> Sair
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
