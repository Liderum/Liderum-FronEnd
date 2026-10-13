// Idempotency-Key por INTENÇÃO de compra (plano + método + cupom). Fica em sessionStorage
// (só a chave opaca e o id do checkout — nunca token/brCode) e é reutilizada em retries até
// o checkout chegar a estado terminal ou a API recusar definitivamente.
const STORAGE_KEY = 'liderum.billing.intents.v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface Intent { key: string; createdAt: number; checkoutId?: string }
type IntentMap = Record<string, Intent>;

export function uuidv4(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// A quantidade de usuários extras entra na intenção: a mesma chave com outro total seria 422 IDEMPOTENCY_KEY_REUSED.
export const intentId = (planCode: string, method: string, extraSeats = 0) => `${planCode}|${method}|${extraSeats}`;

// Fallback em memória caso sessionStorage esteja indisponível (modo privado restrito).
const memory: IntentMap = {};

function read(): IntentMap {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') as IntentMap;
    const now = Date.now();
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => v && now - v.createdAt < MAX_AGE_MS));
  } catch {
    return {};
  }
}
function write(map: IntentMap) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { /* segue só em memória */ }
}

export const IntentStore = {
  getOrCreate(id: string): Intent {
    const map = read();
    const existing = map[id] ?? memory[id];
    if (existing) return existing;
    const intent: Intent = { key: uuidv4(), createdAt: Date.now() };
    map[id] = intent;
    memory[id] = intent;
    write(map);
    return intent;
  },
  attachCheckout(id: string, checkoutId: string) {
    const map = read();
    if (map[id]) { map[id].checkoutId = checkoutId; write(map); }
    if (memory[id]) memory[id].checkoutId = checkoutId;
  },
  clear(id: string) {
    const map = read();
    delete map[id];
    delete memory[id];
    write(map);
  },
  /** Chamado quando um checkout chega a estado terminal: libera a intenção que o originou. */
  clearByCheckout(checkoutId: string) {
    const map = read();
    for (const [id, v] of Object.entries(map)) if (v.checkoutId === checkoutId) delete map[id];
    for (const [id, v] of Object.entries(memory)) if (v.checkoutId === checkoutId) delete memory[id];
    write(map);
  },
  _resetForTests() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    for (const k of Object.keys(memory)) delete memory[k];
  },
};
