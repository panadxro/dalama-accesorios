import { useEffect, useState } from 'react';

/** true si la media query se cumple; se actualiza al cambiar el tamaño de la ventana. */
export function useMedia(query: string): boolean {
  const [ok, setOk] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setOk(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return ok;
}

/** Escritorio según el diseño: 1024 px o más (barra lateral visible). */
export const useEsEscritorio = () => useMedia('(min-width: 1024px)');
