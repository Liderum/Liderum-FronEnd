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
      { key: 'dashboard.read', label: 'Visualizar', description: 'Ver dashboard e KPIs' },
    ],
  },
  {
    module: 'works',
    label: 'Obras',
    icon: 'Building2',
    permissions: [
      { key: 'works.read', label: 'Listar / Detalhar', description: 'Ver lista e detalhes de obras' },
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
      { key: 'schedule.read', label: 'Visualizar', description: 'Ver cronograma de obra' },
      { key: 'schedule.write', label: 'Criar / Editar', description: 'Criar e editar tarefas' },
      { key: 'schedule.delete', label: 'Excluir', description: 'Excluir tarefa' },
    ],
  },
  {
    module: 'budget',
    label: 'Orçamento',
    icon: 'DollarSign',
    permissions: [
      { key: 'budget.read', label: 'Visualizar', description: 'Ver orçamento' },
      { key: 'budget.write', label: 'Criar / Editar', description: 'Criar e editar itens de orçamento' },
      { key: 'budget.delete', label: 'Excluir', description: 'Excluir item de orçamento' },
      { key: 'budget.revisions.read', label: 'Ver revisões', description: 'Ver histórico de revisões' },
      { key: 'budget.revisions.write', label: 'Criar revisão', description: 'Criar revisão orçamentária' },
    ],
  },
  {
    module: 'extras',
    label: 'Extras',
    icon: 'FilePlus2',
    permissions: [
      { key: 'extras.read', label: 'Visualizar', description: 'Ver solicitações extras' },
      { key: 'extras.create', label: 'Criar', description: 'Criar solicitação extra' },
      { key: 'extras.attachments', label: 'Anexos', description: 'Gerenciar anexos de extras' },
    ],
  },
  {
    module: 'workpayments',
    label: 'Pagamentos da Obra',
    icon: 'Wallet',
    permissions: [
      { key: 'workpayments.read', label: 'Visualizar', description: 'Ver pagamentos e comprovantes da obra' },
      { key: 'workpayments.write', label: 'Criar / Editar', description: 'Registrar pagamentos e anexar comprovantes' },
      { key: 'workpayments.delete', label: 'Excluir', description: 'Excluir pagamentos e comprovantes' },
    ],
  },
  {
    module: 'workvouchers',
    label: 'Compras e Serviços da Obra',
    icon: 'Receipt',
    permissions: [
      { key: 'workvouchers.read', label: 'Visualizar', description: 'Ver compras, serviços e comprovantes da obra' },
      { key: 'workvouchers.write', label: 'Criar / Editar', description: 'Registrar compras e serviços e anexar comprovantes' },
      { key: 'workvouchers.delete', label: 'Excluir', description: 'Excluir compras, serviços e comprovantes' },
    ],
  },
  {
    module: 'dailylogs',
    label: 'Diário de Obra',
    icon: 'BookOpen',
    permissions: [
      { key: 'dailylogs.read', label: 'Visualizar', description: 'Ver diário de obra' },
      { key: 'dailylogs.create', label: 'Criar', description: 'Criar registro no diário' },
      { key: 'dailylogs.update', label: 'Editar', description: 'Editar registro' },
      { key: 'dailylogs.delete', label: 'Excluir', description: 'Excluir registro' },
      { key: 'dailylogs.photos', label: 'Fotos', description: 'Gerenciar fotos do diário' },
    ],
  },
  {
    module: 'incidents',
    label: 'Incidentes',
    icon: 'ShieldAlert',
    permissions: [
      { key: 'incidents.read', label: 'Visualizar', description: 'Ver incidentes' },
      { key: 'incidents.create', label: 'Registrar', description: 'Registrar novo incidente' },
      { key: 'incidents.update', label: 'Atualizar', description: 'Atualizar status do incidente' },
      { key: 'incidents.photos', label: 'Fotos', description: 'Gerenciar fotos do incidente' },
    ],
  },
  {
    module: 'riskalerts',
    label: 'Alertas de Risco',
    icon: 'AlertTriangle',
    permissions: [
      { key: 'riskalerts.read', label: 'Visualizar', description: 'Ver alertas de risco' },
      { key: 'riskalerts.create', label: 'Criar', description: 'Criar alerta de risco' },
    ],
  },
  {
    module: 'companies',
    label: 'Empresas',
    icon: 'Building',
    permissions: [
      { key: 'companies.read', label: 'Listar / Detalhar', description: 'Ver lista de empresas' },
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
      { key: 'customers.read', label: 'Listar / Detalhar', description: 'Ver lista de clientes' },
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
      { key: 'suppliers.read', label: 'Listar / Detalhar', description: 'Ver lista de fornecedores' },
      { key: 'suppliers.create', label: 'Criar', description: 'Criar fornecedor' },
      { key: 'suppliers.update', label: 'Editar', description: 'Editar fornecedor' },
      { key: 'suppliers.delete', label: 'Excluir', description: 'Excluir fornecedor' },
    ],
  },
  {
    module: 'materials',
    label: 'Materiais',
    icon: 'Boxes',
    permissions: [
      { key: 'materials.read', label: 'Listar / Detalhar', description: 'Ver materiais da obra e o catálogo' },
      { key: 'materials.create', label: 'Criar', description: 'Adicionar material à obra e ao catálogo' },
      { key: 'materials.update', label: 'Editar', description: 'Editar material da obra, avançar o fluxo e editar o catálogo' },
      { key: 'materials.delete', label: 'Excluir', description: 'Remover material da obra e do catálogo' },
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
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_MAP.flatMap((m) => m.permissions.map((p) => p.key));
