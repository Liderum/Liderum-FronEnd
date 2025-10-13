import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home,
  ShoppingCart,
  FileText,
  Package,
  Users,
  Settings,
  BarChart3,
  Truck,
  CreditCard,
  TrendingUp,
  Calendar,
  ChevronRight,
  ChevronDown,
  Building2,
  UserCheck,
  Bell,
  HelpCircle,
  LogOut,
  ExternalLink,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '../contexts/AuthContext';

const mainNavigation = [
  { 
    name: 'Home', 
    href: '/home', 
    icon: Home,
    badge: null
  },
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    badge: null
  },
  { 
    name: 'Vendas', 
    href: '/sales', 
    icon: ShoppingCart,
    badge: '5'
  },
  { 
    name: 'Faturamento', 
    href: '/billing', 
    icon: FileText,
    badge: '3'
  },
  { 
    name: 'Estoque', 
    href: '/inventory', 
    icon: Package,
    badge: '2'
  },
];

const secondaryNavigation = [
  {
    name: 'Marketplaces',
    icon: Zap,
    children: [
      { name: 'Mercado Livre', href: '/sales/mercadolivre', icon: ExternalLink },
      { name: 'Amazon', href: '/sales/amazon', icon: ExternalLink },
      { name: 'Shopee', href: '/sales/shopee', icon: ExternalLink },
    ]
  },
  {
    name: 'Relatórios',
    icon: BarChart3,
    children: [
      { name: 'Vendas', href: '/dashboard/reports/sales', icon: TrendingUp },
      { name: 'Financeiro', href: '/dashboard/reports/financial', icon: ShoppingCart },
      { name: 'Estoque', href: '/dashboard/reports/inventory', icon: Package },
    ]
  },
  {
    name: 'Gestão',
    icon: Building2,
    children: [
      { name: 'Clientes', href: '/dashboard/customers', icon: Users },
      { name: 'Fornecedores', href: '/dashboard/suppliers', icon: Truck },
      { name: 'Usuários', href: '/dashboard/users', icon: UserCheck },
    ]
  },
  {
    name: 'Operações',
    icon: ShoppingCart,
    children: [
      { name: 'Pedidos', href: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Entregas', href: '/dashboard/deliveries', icon: Truck },
      { name: 'Pagamentos', href: '/dashboard/payments', icon: CreditCard },
    ]
  }
];

const bottomNavigation = [
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  { name: 'Ajuda', href: '/dashboard/help', icon: HelpCircle },
];

export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const location = useLocation();
  const { signOut } = useAuth();

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Liderum ERP</h2>
            <p className="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {/* Menu Principal */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Principal
            </h3>
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive || active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Navegação Secundária */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Módulos
            </h3>
            {secondaryNavigation.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.includes(section.name);
              const hasActiveChild = section.children.some(child => isActive(child.href));
              
              return (
                <div key={section.name}>
                  <button
                    onClick={() => toggleSection(section.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      hasActiveChild
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${hasActiveChild ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span>{section.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 mt-1 space-y-1"
                      >
                        {section.children.map((child) => {
                          const ChildIcon = child.icon;
                          const active = isActive(child.href);
                          
                          return (
                            <NavLink
                              key={child.name}
                              to={child.href}
                              className={({ isActive }) =>
                                `group flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  isActive || active
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                              }
                            >
                              <ChildIcon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                              <span>{child.name}</span>
                            </NavLink>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Navegação Inferior */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-1">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive || active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          
          <Separator className="my-3" />
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
} 