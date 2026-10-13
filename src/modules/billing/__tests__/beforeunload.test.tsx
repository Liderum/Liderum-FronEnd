import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBeforeUnloadGuard } from '../hooks/useBeforeUnloadGuard';

const fire = () => {
  const ev = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(ev);
  return ev.defaultPrevented;
};

describe('useBeforeUnloadGuard', () => {
  it('só bloqueia o fechamento da aba enquanto ativo e remove o listener ao desativar/desmontar', () => {
    const { rerender, unmount } = renderHook(({ on }) => useBeforeUnloadGuard(on), { initialProps: { on: false } });
    expect(fire()).toBe(false);
    rerender({ on: true });
    expect(fire()).toBe(true);
    rerender({ on: false });
    expect(fire()).toBe(false);
    rerender({ on: true });
    unmount();
    expect(fire()).toBe(false);
  });
});
