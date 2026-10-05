import { maskMoney } from '../paymentUtils';

interface Props {
  id?: string;
  value: string;
  onChange: (masked: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  'aria-label'?: string;
}

/** Campo de valor em R$ no padrão do projeto (prefixo R$, máscara pt-BR, ex.: NewWorkPage). */
export function MoneyInput({ id, value, onChange, invalid, disabled, readOnly, ...rest }: Props) {
  return (
    <div className="ldm-currency">
      <span>R$</span>
      <input
        id={id}
        className={`ldm-input${invalid ? ' invalid' : ''}`}
        inputMode="numeric"
        placeholder="0,00"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid}
        aria-label={rest['aria-label']}
        onChange={(e) => onChange(maskMoney(e.target.value))}
      />
    </div>
  );
}
