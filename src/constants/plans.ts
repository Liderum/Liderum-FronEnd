// Catálogo espelhado do Liderum.Payments (PAYMENTS-WORKFLOW.md seção 11.1). A fonte da verdade é a API
// (GET /plans): preço, limites e comprabilidade vêm de lá; este arquivo só enriquece o texto (pt-BR) e é
// a base da landing, que não autentica. Mantenha a MESMA ordem/texto da web, app e landing.

export interface PlanLimits {
  /** `null` = ilimitado. */
  maxActiveWorks: number | null;
  maxMembers: number | null;
  /** Franquia de fotos e anexos em MB; `null` = ilimitado/sob contrato. */
  maxStorageMb: number | null;
}

export interface PlanCatalogEntry {
  code: string;
  name: string;
  /** Centavos; preço de lançamento cobrado hoje. 0 = sob consulta. */
  priceInCents: number;
  /** Centavos; preço de tabela da fase de escala (mostrado riscado enquanto o lançamento durar). 0 = sem. */
  listPriceInCents: number;
  /** Centavos por usuário extra no período; `null` = plano não vende usuário extra. */
  extraSeatPriceInCents: number | null;
  maxExtraSeats: number;
  tagline: string;
  highlighted: boolean;
  purchasable: boolean;
  features: string[];
  limits: PlanLimits;
  /** O que NÃO está incluso (landing/cards usam para comparar com clareza). */
  excluded: string[];
}

export const PLAN_CODES = { ESSENCIAL: 'essencial', CRESCIMENTO: 'crescimento', ENTERPRISE: 'enterprise' } as const;

export const HIGHLIGHT_LABEL = 'Mais completo';
export const ENTERPRISE_CONTACT_PATH = '/contact';

export const PLAN_CATALOG: readonly PlanCatalogEntry[] = [
  {
    code: PLAN_CODES.ESSENCIAL,
    name: 'Essencial',
    priceInCents: 9700,
    listPriceInCents: 14900,
    extraSeatPriceInCents: 2900,
    maxExtraSeats: 3,
    tagline: 'Para construtoras com até 5 obras simultâneas',
    highlighted: false,
    purchasable: true,
    features: [
      'Até 5 obras ativas',
      '3 usuários (usuário extra por R$ 29/mês)',
      '10 GB de fotos e anexos',
      'Dashboard executivo',
      'Cronograma por etapas',
      'Orçamento previsto × realizado',
      'Diário de obra com fotos',
      'Clientes, fornecedores e materiais',
    ],
    limits: { maxActiveWorks: 5, maxMembers: 3, maxStorageMb: 10 * 1024 },
    excluded: ['Extras e aditivos', 'Incidentes e alertas de risco', 'Revisões de orçamento', 'Exportação do diário em PDF'],
  },
  {
    code: PLAN_CODES.CRESCIMENTO,
    name: 'Crescimento',
    priceInCents: 19700,
    listPriceInCents: 29900,
    extraSeatPriceInCents: 2900,
    maxExtraSeats: 35,
    tagline: 'Para construtoras que gerenciam vários projetos',
    highlighted: true,
    purchasable: true,
    features: [
      'Obras ilimitadas',
      'Até 15 usuários (usuário extra por R$ 29/mês)',
      '50 GB de fotos e anexos',
      'Tudo do Essencial',
      'Extras e aditivos',
      'Incidentes e alertas de risco',
      'Revisões de orçamento',
      'Exportação do diário em PDF',
      'Suporte prioritário',
    ],
    limits: { maxActiveWorks: null, maxMembers: 15, maxStorageMb: 50 * 1024 },
    excluded: [],
  },
  {
    code: PLAN_CODES.ENTERPRISE,
    name: 'Enterprise',
    priceInCents: 0,
    listPriceInCents: 0,
    extraSeatPriceInCents: null,
    maxExtraSeats: 0,
    tagline: 'Para grupos com várias empresas e obras',
    highlighted: false,
    purchasable: false,
    features: [
      'Obras e usuários ilimitados',
      'Armazenamento sob contrato',
      'Tudo do Crescimento',
      'Múltiplas empresas, dados isolados entre elas',
      'Implantação assistida',
      'Gerente de conta dedicado',
    ],
    limits: { maxActiveWorks: null, maxMembers: null, maxStorageMb: null },
    excluded: [],
  },
];

export const getCatalogPlan = (code: string | null | undefined): PlanCatalogEntry | undefined => {
  const c = (code ?? '').toLowerCase();
  return PLAN_CATALOG.find((p) => p.code === c);
};

export const planDisplayName = (code: string | null | undefined): string =>
  getCatalogPlan(code)?.name ?? (code ? code.charAt(0).toUpperCase() + code.slice(1).toLowerCase() : 'atual');

/** Planos que a landing/cadastro aceitam em `?plan=`. */
export const isPurchasablePlanCode = (code: string | null | undefined): code is string =>
  !!getCatalogPlan(code)?.purchasable;

export const formatPriceBRL = (cents: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);

/** 10240 -> "10 GB"; abaixo de 1 GB em MB. `null` = ilimitado. */
export const formatStorage = (mb: number | null): string => {
  if (mb === null) return 'Ilimitado';
  if (mb >= 1024) return `${Number((mb / 1024).toFixed(1))} GB`;
  return `${mb} MB`;
};

/** Bytes usados -> "1,2 GB" / "340 MB" / "12 KB". */
export const formatBytes = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${Number((mb / 1024).toFixed(1)).toLocaleString('pt-BR')} GB`;
  if (mb >= 1) return `${Math.round(mb).toLocaleString('pt-BR')} MB`;
  return `${Math.max(0, Math.round(bytes / 1024)).toLocaleString('pt-BR')} KB`;
};
