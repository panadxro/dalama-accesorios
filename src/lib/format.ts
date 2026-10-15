/**
 * Formatos de Argentina según el UI kit:
 * montos `$ 1.234.567,89`, fechas `dd/mm/aaaa`, horas `14:30`, CUIT `30-71548293-6`.
 * Los montos del sistema se guardan en centavos (enteros) para no arrastrar errores de redondeo.
 */

export type Centavos = number;

const numero2 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numero0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/** 123456789 (centavos) → "$ 1.234.567,89" */
export function formatARS(centavos: Centavos, opts: { sinCentavos?: boolean } = {}): string {
  const pesos = centavos / 100;
  const signo = pesos < 0 ? '−' : '';
  const abs = Math.abs(pesos);
  return `${signo}$ ${opts.sinCentavos ? numero0.format(Math.round(abs)) : numero2.format(abs)}`;
}

/** Para tarjetas KPI: sin centavos, como pide el kit. */
export const formatARSKpi = (centavos: Centavos) => formatARS(centavos, { sinCentavos: true });

/** 8426750_00 → "$ 8,4 M" (ejes y etiquetas de gráficos). */
export function formatARSCorto(centavos: Centavos): string {
  const pesos = centavos / 100;
  if (Math.abs(pesos) >= 1_000_000) return `$ ${(pesos / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} M`;
  if (Math.abs(pesos) >= 1_000) return `$ ${(pesos / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 })} mil`;
  return `$ ${numero0.format(pesos)}`;
}

/** "1.234,56" o "1234,56" → 123456 centavos. Devuelve null si no es un número. */
export function parseARS(texto: string): Centavos | null {
  const limpio = texto.replace(/[^0-9,]/g, '').replace(',', '.');
  if (limpio === '') return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

/** 10.2 → "10,2 %" */
export function formatPct(valor: number, decimales = 1): string {
  return `${valor.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: decimales })} %`;
}

export function formatNumero(n: number): string {
  return numero0.format(n);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Date | ISO → "09/10/2026" */
export function formatFecha(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Date | ISO → "09/10" */
export function formatFechaCorta(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** Date | ISO → "14:30" */
export function formatHora(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "Viernes 9 de octubre de 2026" */
export function formatFechaLarga(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const dia = DIAS[d.getDay()];
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "octubre 2026" → con mayúscula inicial: "Octubre 2026" */
export function formatMesAnio(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const m = MESES[d.getMonth()];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${d.getFullYear()}`;
}

export function nombreMes(indice: number): string {
  return MESES[indice];
}

/** "30715482936" → "30-71548293-6" */
export function formatCUIT(cuit: string): string {
  const d = cuit.replace(/\D/g, '');
  if (d.length !== 11) return cuit;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

/** Saludo según la hora: "Buenos días", "Buenas tardes", "Buenas noches". */
export function saludo(fecha = new Date()): string {
  const h = fecha.getHours();
  if (h < 13) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}
