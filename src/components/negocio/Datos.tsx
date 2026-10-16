import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Lista clave/valor del diseño (overline + dato), usada en receptor, entregas y fichas. */
export function DatosLista({ items, className, columnas = 'auto' }: { items: Array<[string, ReactNode]>; className?: string; columnas?: 'auto' | 2 }) {
  return (
    <dl className={cn('m-0 grid gap-x-6 gap-y-4', columnas === 2 ? 'grid-cols-2' : '[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]', className)}>
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-overline uppercase text-texto-secundario">{k}</dt>
          <dd className="m-0 mt-1 break-words text-body font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Iniciales para el avatar: "Carpintería Rossi" → "CR". */
export function iniciales(nombre: string): string {
  const palabras = nombre.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 1 && !['de', 'del', 'la', 'las', 'los', 'y', 'srl', 'sa'].includes(w.toLowerCase()));
  return ((palabras[0]?.[0] ?? '') + (palabras[1]?.[0] ?? '')).toUpperCase() || '··';
}

export function Avatar({ nombre, oscuro, size = 40 }: { nombre: string; oscuro?: boolean; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn('grid shrink-0 place-items-center rounded-sm text-[13px] font-bold', oscuro ? 'bg-ink-black text-neutro-0' : 'bg-sandstone text-ink-black')}
      style={{ width: size, height: size }}
    >
      {iniciales(nombre)}
    </span>
  );
}
