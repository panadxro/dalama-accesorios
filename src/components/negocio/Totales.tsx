import { cn } from '@/lib/cn';
import { totales } from '@/domain/calculos';
import type { Renglon } from '@/domain/types';
import { formatARS } from '@/lib/format';

/** Resumen de totales del diseño: subtotal, descuento de lista, neto, IVA y total destacado. */
export function ResumenTotales({
  renglones, descuentoPct, ivaPct = 21, nombreLista, grande, className,
}: { renglones: Renglon[]; descuentoPct: number; ivaPct?: number; nombreLista?: string; grande?: boolean; className?: string }) {
  const t = totales(renglones.filter((r) => r.productoId), descuentoPct, ivaPct);
  return (
    <dl className={cn('m-0 grid w-full max-w-[360px] grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-body', className)}>
      <dt className="text-texto-secundario">Subtotal</dt>
      <dd className="m-0 text-right tabular">{formatARS(t.subtotal)}</dd>
      {descuentoPct > 0 && (
        <>
          <dt className="text-texto-secundario">{nombreLista ? `Desc. ${nombreLista} ${descuentoPct} %` : `Descuento ${descuentoPct} %`}</dt>
          <dd className="m-0 text-right tabular">− {formatARS(t.descuento)}</dd>
        </>
      )}
      <dt className="text-texto-secundario">Neto gravado</dt>
      <dd className="m-0 text-right tabular">{formatARS(t.neto)}</dd>
      <dt className="text-texto-secundario">IVA {ivaPct} %</dt>
      <dd className="m-0 text-right tabular">{formatARS(t.iva)}</dd>
      <dt className="border-t border-ink-black pt-2.5 text-h3 font-semibold">Total</dt>
      <dd className={cn('m-0 border-t border-ink-black pt-1.5 text-right font-bold tabular', grande ? 'text-[24px] leading-8' : 'text-[20px] leading-7')}>
        {formatARS(t.total)}
      </dd>
    </dl>
  );
}
