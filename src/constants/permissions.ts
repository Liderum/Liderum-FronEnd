export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
}

export interface ModulePermissions {
  module: string;
  label: string;
  icon: string;
  permissions: PermissionDefinition[];
}

export const PERMISSION_MAP: ModulePermissions[] = [
  {
    module: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    permissions: [
      { key: 'dashboard.view', label: 'Visualizar', description: 'Ver dashboard e KPIs' },
    ],
  },
  {
    module: 'works',
    label: 'Obras',
    icon: 'Building2',
    permissions: [
      { key: 'works.view', label: 'Listar', description: 'Ver lista de obras' },
      { key: 'works.read', label: 'Detalhar', description: 'Ver detalhes de uma obra' },
      { key: 'works.create', label: 'Criar', description: 'Criar nova obra' },
      { key: 'works.update', label: 'Editar', description: 'Editar obra existente' },
      { key: 'works.delete', label: 'Excluir', description: 'Excluir obra' },
    ],
  },
  {
    module: 'schedule',
    label: 'Cronograma',
    icon: 'CalendarClock',
    permissions: [
      { key: 'schedule.view', label: 'Visualizar', description: 'Ver cronograma de obra' },
      { key: 'schedule.create', label: 'Criar', description: 'Criar tarefa no cronograma' },
      { key: 'schedule.update', label: 'Editar', description: 'Editar tarefa' },
      { key: 'schedule.delete', label: 'Excluir', description: 'Excluir tarefa' },
    ],
  },
  {
    module: 'budget',
    label: 'Orçamento',
    icon: 'DollarSign',
    permissions: [
      { key: 'budget.view', label: 'Visualizar', description: 'Ver orçamento' },
      { key: 'budget.create', label: 'Criar', description: 'Criar item de orçamento' },
      { key: 'budget.update', label: 'Editar', description: 'Editar item de orçamento' },
      { key: 'budget.delete', label: 'Excluir', description: 'Excluir item de orçamento' },
      { key: 'budget.export', label: 'Exportar', description: 'Exportar orçamento' },
    ],
  },
  {
    module: 'extras',
    label: 'Extras',
    icon: 'FilePlus2',
    permissions: [
      { key: 'extras.view', label: 'Visualizar', description: 'Ver solicitações extras' },
      { key: 'extras.create', label: 'Criar', description: 'Criar solicitação extra' },
      { key: 'extras.approve', label: 'Aprovar', description: 'Aprovar/rejeitar solicitação' },
      { key: 'extras.delete', label: 'Excluir', description: 'Excluir solicitação extra' },
    ],
  },
  {
    module: 'daily-log',
    label: 'Diário de Obra',
    icon: 'BookOpen',
    permissions: [
      { key: 'daily-log.view', label: 'Visualizar', description: 'Ver diário de obra' },
      { key: 'daily-log.create', label: 'Criar', description: 'Criar registro no diário' },
      { key: 'daily-log.update', label: 'Editar', description: 'Editar registro' },
      { key: 'daily-log.delete', label: 'Excluir', description: 'Excluir registro' },
    ],
  },
  {
    module: 'companies',
    label: 'Empresas',
    icon: 'Building',
    permissions: [
      { key: 'companies.view', label: 'Listar', description: 'Ver lista de empresas' },
      { key: 'companies.create', label: 'Criar', description: 'Criar empresa' },
      { key: 'companies.update', label: 'Editar', description: 'Editar empresa' },
      { key: 'companies.delete', label: 'Excluir', description: 'Excluir empresa' },
    ],
  },
  {
    module: 'customers',
    label: 'Clientes',
    icon: 'Users',
    permissions: [
      { key: 'customers.view', label: 'Listar', description: 'Ver lista de clientes' },
      { key: 'customers.create', label: 'Criar', description: 'Criar cliente' },
      { key: 'customers.update', label: 'Editar', description: 'Editar cliente' },
      { key: 'customers.delete', label: 'Excluir', description: 'Excluir cliente' },
    ],
  },
  {
    module: 'suppliers',
    label: 'Fornecedores',
    icon: 'Truck',
    permissions: [
      { key: 'suppliers.view', label: 'Listar', description: 'Ver lista de fornecedores' },
      { key: 'suppliers.create', label: 'Criar', description: 'Criar fornecedor' },
      { key: 'suppliers.update', label: 'Editar', description: 'Editar fornecedor' },
      { key: 'suppliers.delete', label: 'Excluir', description: 'Excluir fornecedor' },
    ],
  },
  {
    module: 'users',
    label: 'Usuários',
    icon: 'UserCog',
    permissions: [
      { key: 'users.view', label: 'Listar', description: 'Ver lista de usuários' },
      { key: 'users.create', label: 'Criar', description: 'Criar usuário' },
      { key: 'users.update', label: 'Editar', description: 'Editar usuário' },
      { key: 'users.delete', label: 'Excluir', description: 'Excluir usuário' },
      { key: 'users.rbac.manage', label: 'Gerenciar RBAC', description: 'Gerenciar roles e permissões' },
    ],
  },
  {
    module: 'settings',
    label: 'Configurações',
    icon: 'Settings',
    permissions: [
      { key: 'settings.view', label: 'Visualizar', description: 'Ver configurações' },
      { key: 'settings.update', label: 'Alterar', description: 'Alterar configurações gerais' },
      { key: 'settings.profile.update', label: 'Editar Perfil', description: 'Editar perfil próprio' },
    ],
  },
  {
    module: 'payments',
    label: 'Pagamentos',
    icon: 'CreditCard',
    permissions: [
      { key: 'payments.view', label: 'Visualizar', description: 'Ver planos e pagamentos' },
      { key: 'payments.manage', label: 'Gerenciar', description: 'Gerenciar pagamentos e assinaturas' },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_MAP.flatMap((m) => m.permissions.map((p) => p.key));
