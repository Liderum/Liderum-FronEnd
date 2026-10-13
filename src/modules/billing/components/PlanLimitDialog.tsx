import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog, AlertDialogCancel, AlertDialogAction, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PLAN_CODES, formatStorage, planDisplayName } from '@/constants/plans';
import { parsePlanLimit, type PlanLimitInfo } from '@/services/billing/planLimit';

const RESOURCE_LABEL = { works: { one: 'obra ativa', many: 'obras ativas' }, members: { one: 'usuário', many: 'usuários' } } as const;

const canBuySeats = (code: string | null) => code?.toLowerCase() === PLAN_CODES.ESSENCIAL || code?.toLowerCase() === PLAN_CODES.CRESCIMENTO;

export function planLimitMessage(info: PlanLimitInfo): string {
  const plan = planDisplayName(info.planCode);
  // limit em MB: o servidor devolve a franquia na mesma unidade do claim limit_storage_mb
  if (info.resource === 'storage') {
    return `Seu plano ${plan} inclui ${formatStorage(info.limit)} de fotos e anexos e o espaço acabou. Remova anexos antigos ou faça upgrade para continuar enviando arquivos.`;
  }
  const label = RESOURCE_LABEL[info.resource];
  if (info.resource === 'members' && canBuySeats(info.planCode)) {
    return `Seu plano ${plan} permite ${info.limit ?? ''} ${info.limit === 1 ? label.one : label.many}. Contrate usuários extras ou faça upgrade para continuar.`;
  }
  if (info.limit === null) return `Seu plano ${plan} atingiu o limite de ${label.many}. Faça upgrade para continuar.`;
  return `Seu plano ${plan} permite ${info.limit} ${info.limit === 1 ? label.one : label.many}. Faça upgrade para continuar.`;
}

/** Upgrade sugerido: Essencial -> Crescimento; usuário extra leva ao plano atual (stepper de usuários); demais: planos sem pré-seleção. */
export function upgradePath(info: PlanLimitInfo): string {
  if (info.resource === 'members' && canBuySeats(info.planCode)) return `/billing/plans?plan=${info.planCode!.toLowerCase()}`;
  return info.planCode?.toLowerCase() === PLAN_CODES.ESSENCIAL
    ? `/billing/plans?plan=${PLAN_CODES.CRESCIMENTO}`
    : '/billing/plans';
}

export function PlanLimitDialog({ info, onClose }: { info: PlanLimitInfo | null; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <AlertDialog open={!!info} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24 }}>
            Limite do plano atingido
          </AlertDialogTitle>
          <AlertDialogDescription>
            {info && planLimitMessage(info)}
            <span className="mt-2 block text-xs">
              Ao fazer upgrade, um novo período de 30 dias começa a partir do pagamento; os dias restantes do plano atual não são creditados.
              Nenhum dado é apagado.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Agora não</AlertDialogCancel>
          <AlertDialogAction onClick={() => { if (info) navigate(upgradePath(info)); onClose(); }}>
            {info?.resource === 'members' && canBuySeats(info.planCode) ? 'Ver opções' : 'Fazer upgrade'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** `handle(err)` devolve true quando abriu o diálogo (o chamador não deve mostrar outro erro). */
export function usePlanLimitDialog() {
  const [info, setInfo] = useState<PlanLimitInfo | null>(null);
  const handle = useCallback((err: unknown): boolean => {
    const parsed = parsePlanLimit(err);
    if (!parsed) return false;
    setInfo(parsed);
    return true;
  }, []);
  const dialog = <PlanLimitDialog info={info} onClose={() => setInfo(null)} />;
  return { handle, dialog };
}
