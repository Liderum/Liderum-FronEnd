// Alguns campos vindos do backend (ex.: authorId, requestedBy) ainda guardam o GUID
// bruto do usuário em vez de um nome resolvido. Enquanto a API não devolve o nome,
// evitamos expor esse identificador interno na tela.
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isGuid(value?: string | null): boolean {
  if (!value) return false;
  return GUID_PATTERN.test(value.trim());
}

// Exibe um valor de "responsável"/"solicitante" sem nunca vazar um GUID cru para o usuário.
export function displayPerson(value?: string | null, fallback = 'Equipe'): string {
  if (!value || !value.trim()) return fallback;
  return isGuid(value) ? fallback : value;
}
