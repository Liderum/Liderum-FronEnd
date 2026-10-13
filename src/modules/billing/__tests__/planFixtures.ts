import type { Plan } from '@/services/billing';

/** Formato do GET /plans conforme PAYMENTS-WORKFLOW.md 11.2 (já mapeado para o modelo da UI). */
export const PLANS: Plan[] = [
  {
    id: 'p1', code: 'essencial', name: 'Essencial', priceInCents: 9700, tagline: 'Para até 5 obras simultâneas',
    highlighted: false, purchasable: true, modules: [],
    features: ['Até 5 obras ativas', '3 usuários', 'Dashboard executivo', 'Cronograma por etapas'],
    limits: { maxActiveWorks: 5, maxMembers: 3, maxStorageMb: 10240 },
    listPriceInCents: 14900, extraSeatPriceInCents: 2900, maxExtraSeats: 3,
  },
  {
    id: 'p2', code: 'crescimento', name: 'Crescimento', priceInCents: 19700, tagline: 'Para vários projetos',
    highlighted: true, purchasable: true, modules: [],
    features: ['Obras ilimitadas', 'Até 15 usuários', 'Tudo do Essencial', 'Extras e aditivos'],
    limits: { maxActiveWorks: null, maxMembers: 15, maxStorageMb: 51200 },
    listPriceInCents: 29900, extraSeatPriceInCents: 2900, maxExtraSeats: 35,
  },
  {
    id: 'p3', code: 'enterprise', name: 'Enterprise', priceInCents: 0, tagline: 'Para grupos',
    highlighted: false, purchasable: false, modules: [],
    features: ['Tudo do Crescimento', 'Implantação assistida'],
    limits: { maxActiveWorks: null, maxMembers: null, maxStorageMb: null },
    listPriceInCents: 0, extraSeatPriceInCents: null, maxExtraSeats: 0,
  },
];
