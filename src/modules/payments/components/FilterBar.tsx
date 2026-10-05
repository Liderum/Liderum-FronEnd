import type { ReactNode } from 'react';

/** Grade de filtros: 6 controles em 2 colunas (3 + 3), largura contida; 1 coluna no mobile. */
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="pg-filters" role="search">{children}</div>;
}

export function FilterField({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="pg-ff">
      <label className="pg-ff-label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
