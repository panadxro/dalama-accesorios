import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { Producto } from '@/domain/types';
import { formatARS } from '@/lib/format';
import { normalizar } from '@/store/selectores';

/** Texto de disponibilidad de un producto. */
export function textoStock(p: Producto, reservado = 0): string {
  const disp = p.stock - reservado;
  if (p.stock <= 0) return 'Sin stock';
  if (reservado > 0) return `${disp} ${p.unidad} disponibles · ${reservado} reservadas`;
  return `${p.stock} ${p.unidad} en stock`;
}

/**
 * Buscador de productos del diseño (Presupuestos): escribís código o nombre y tocás para sumarlo.
 * Combobox accesible: flechas para moverse, Enter para elegir, Escape para cerrar.
 */
export function BuscadorProducto({
  productos, onElegir, reservado, label = 'Agregar producto', placeholder = 'Código o nombre', excluir = [], autoFocus,
}: {
  productos: Producto[];
  onElegir: (p: Producto) => void;
  reservado?: Map<string, number>;
  label?: string;
  placeholder?: string;
  excluir?: string[];
  autoFocus?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const [q, setQ] = useState('');
  const [activo, setActivo] = useState(0);
  const [abierto, setAbierto] = useState(false);

  const resultados = useMemo(() => {
    const t = normalizar(q.trim());
    if (t.length < 2) return [];
    const palabras = t.split(/\s+/);
    return productos
      .filter((p) => p.activo && !excluir.includes(p.id))
      .filter((p) => {
        const hay = normalizar(`${p.codigo} ${p.nombre} ${p.sinonimos.join(' ')}`);
        return palabras.every((w) => hay.includes(w));
      })
      .slice(0, 6);
  }, [q, productos, excluir]);

  const elegir = (p: Producto) => {
    onElegir(p);
    setQ('');
    setAbierto(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!resultados.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setAbierto(true); setActivo((a) => (a + 1) % resultados.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActivo((a) => (a - 1 + resultados.length) % resultados.length); }
    if (e.key === 'Enter') { e.preventDefault(); elegir(resultados[activo]); }
    if (e.key === 'Escape') setAbierto(false);
  };

  const mostrar = abierto && q.trim().length >= 2;

  return (
    <div className="dl-field relative">
      <label htmlFor={`${uid}-in`} className="dl-label">{label}</label>
      <div className="dl-input-control">
        <Icon name="search" size={16} />
        <input
          id={`${uid}-in`}
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={`${uid}-lista`}
          aria-activedescendant={mostrar && resultados[activo] ? `${uid}-op-${activo}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          value={q}
          placeholder={placeholder}
          onChange={(e) => { setQ(e.target.value); setActivo(0); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
          onBlur={() => window.setTimeout(() => setAbierto(false), 150)}
          onKeyDown={onKey}
        />
      </div>
      {mostrar && (
        <div
          id={`${uid}-lista`}
          role="listbox"
          aria-label="Resultados"
          className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-sm border border-borde bg-superficie shadow-2"
        >
          {resultados.length === 0 ? (
            <div className="px-3 py-3 text-body-small text-texto-secundario" role="status">Sin resultados para “{q.trim()}”. Probá con el código.</div>
          ) : (
            resultados.map((p, i) => (
              <div
                key={p.id}
                id={`${uid}-op-${i}`}
                role="option"
                aria-selected={i === activo}
                onMouseDown={(e) => { e.preventDefault(); elegir(p); }}
                onMouseEnter={() => setActivo(i)}
                className={cn('flex cursor-pointer items-center gap-3 border-b border-arena-100 px-3 py-2.5 last:border-0', i === activo && 'bg-arena-100')}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-semibold">{p.nombre}</span>
                  <span className={cn('block text-caption', p.stock <= 0 ? 'font-semibold text-error' : 'text-texto-secundario')}>
                    {p.codigo} · {textoStock(p, reservado?.get(p.id))}
                  </span>
                </span>
                <span className="font-semibold tabular">{formatARS(p.precioLista)}</span>
                <Icon name="plus" size={20} />
              </div>
            ))
          )}
        </div>
      )}
      <div className="dl-help">Buscá por código o nombre y tocá el producto para sumarlo.</div>
    </div>
  );
}
