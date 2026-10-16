import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import type { Comprobante } from '@/domain/types';
import { formatARS, formatARSCorto, nombreMes } from '@/lib/format';

/** Colores del diseño (Main.dc.html): mes actual en ink-black, mes anterior en arena-500. */
const ACTUAL = '#111111';
const ANTERIOR = '#A8916D';
const GRILLA = '#F3EDE3';
const TEXTO = '#3D3833';

interface Punto { dia: number; actual: number | null; anterior: number | null }

function acumulado(comprobantes: Comprobante[], anio: number, mes: number, hastaDia: number): number[] {
  const porDia = new Array(32).fill(0);
  for (const c of comprobantes) {
    const f = new Date(c.fecha);
    if (f.getFullYear() !== anio || f.getMonth() !== mes) continue;
    porDia[f.getDate()] += c.clase === 'factura' ? c.total : -c.total;
  }
  const out: number[] = [];
  let suma = 0;
  for (let d = 1; d <= hastaDia; d++) {
    suma += porDia[d];
    out.push(suma);
  }
  return out;
}

function Globo({ active, payload, label, mesActual, mesAnterior }: TooltipProps<number, string> & { mesActual: string; mesAnterior: string }) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === 'actual')?.value;
  const anterior = payload.find((p) => p.dataKey === 'anterior')?.value;
  return (
    <div className="rounded-sm border border-borde bg-superficie px-3 py-2 text-body-small shadow-2">
      <div className="mb-1 font-semibold">Día {label}</div>
      <div className="flex items-center gap-2"><span className="h-[3px] w-3.5 bg-ink-black" />{mesActual}: <strong className="tabular">{actual != null ? formatARS(actual) : '—'}</strong></div>
      <div className="flex items-center gap-2"><span className="h-[3px] w-3.5 bg-arena-500" />{mesAnterior}: <strong className="tabular">{anterior != null ? formatARS(anterior) : '—'}</strong></div>
    </div>
  );
}

/** Ventas acumuladas día a día: mes en curso contra el mes anterior. */
export function GraficoVentasMes({ comprobantes, hoy }: { comprobantes: Comprobante[]; hoy: Date }) {
  const { datos, totalActual, totalAnterior, mesActual, mesAnterior } = useMemo(() => {
    const ant = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const diasAnt = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const a = acumulado(comprobantes, hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const b = acumulado(comprobantes, ant.getFullYear(), ant.getMonth(), diasAnt);
    const datos: Punto[] = [];
    for (let d = 1; d <= Math.max(diasMes, diasAnt); d++) {
      datos.push({ dia: d, actual: d <= a.length ? a[d - 1] : null, anterior: d <= b.length ? b[d - 1] : null });
    }
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    return { datos, totalActual: a[a.length - 1] ?? 0, totalAnterior: b[b.length - 1] ?? 0, mesActual: cap(nombreMes(hoy.getMonth())), mesAnterior: cap(nombreMes(ant.getMonth())) };
  }, [comprobantes, hoy]);

  return (
    <figure className="m-0">
      <div className="mb-2 mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-caption text-texto-secundario">
        <span className="flex items-center gap-2"><span className="h-[3px] w-[18px] bg-ink-black" />{mesActual} {hoy.getFullYear()} · <strong className="text-texto tabular">{formatARSCorto(totalActual)}</strong> al día {hoy.getDate()}</span>
        <span className="flex items-center gap-2"><span className="h-[3px] w-[18px] bg-arena-500" />{mesAnterior} · <strong className="text-texto tabular">{formatARSCorto(totalAnterior)}</strong> en el mes</span>
      </div>
      <div className="h-[300px]" role="img" aria-label={`Ventas acumuladas: ${mesActual} lleva ${formatARS(totalActual)} al día ${hoy.getDate()}; ${mesAnterior} cerró en ${formatARS(totalAnterior)}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRILLA} vertical={false} />
            <XAxis dataKey="dia" ticks={[1, 5, 10, 15, 20, 25, 30]} tickLine={false} axisLine={{ stroke: GRILLA }} tick={{ fontSize: 11, fill: TEXTO, fontFamily: 'Montserrat' }} />
            <YAxis tickFormatter={(v) => formatARSCorto(v)} tickLine={false} axisLine={false} width={64} tick={{ fontSize: 11, fill: TEXTO, fontFamily: 'Montserrat' }} />
            <Tooltip content={<Globo mesActual={mesActual} mesAnterior={mesAnterior} />} cursor={{ stroke: '#7A726A', strokeDasharray: '3 3' }} />
            <Line type="monotone" dataKey="anterior" stroke={ANTERIOR} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#FFFFFF', strokeWidth: 2 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="actual" stroke={ACTUAL} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#B81D23', stroke: '#FFFFFF', strokeWidth: 2 }} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">Línea negra: {mesActual}. Línea arena: {mesAnterior}.</figcaption>
    </figure>
  );
}
