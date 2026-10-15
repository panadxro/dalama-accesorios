/**
 * Fechas de la demo como texto ISO en hora local, sin zona: "2026-10-14T09:30:00".
 * Evita los corrimientos de UTC y permite desplazar todos los datos cuando cambia el día.
 */
export type FechaISO = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function aISO(d: Date): FechaISO {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function deISO(iso: FechaISO): Date {
  return new Date(iso);
}

export const ahoraISO = () => aISO(new Date());

export function inicioDelDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function sumarDias(d: Date, dias: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + dias);
  return r;
}

export function sumarDiasISO(iso: FechaISO, dias: number): FechaISO {
  return aISO(sumarDias(deISO(iso), dias));
}

/** Fecha a una hora dada: conHora(hoy, 9, 30) */
export function conHora(d: Date, h: number, m = 0): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0);
}

/** Días calendario entre dos fechas (b − a), ignorando la hora. */
export function diasEntre(a: Date | FechaISO, b: Date | FechaISO): number {
  const da = inicioDelDia(typeof a === 'string' ? deISO(a) : a);
  const db = inicioDelDia(typeof b === 'string' ? deISO(b) : b);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function mismoDia(a: Date | FechaISO, b: Date | FechaISO): boolean {
  return diasEntre(a, b) === 0;
}

/** "2026-10" para agrupar por mes. */
export function claveMes(iso: FechaISO): string {
  return iso.slice(0, 7);
}

const RE_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

/**
 * Corre todas las fechas de un objeto `dias` días.
 * Se usa al abrir la demo otro día: lo que era "hoy" vuelve a ser hoy y nada queda desfasado.
 */
export function desplazarFechas<T>(valor: T, dias: number): T {
  if (dias === 0) return valor;
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return RE_ISO.test(v) ? sumarDiasISO(v, dias) : v;
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v)) out[k] = walk(x);
      return out;
    }
    return v;
  };
  return walk(valor) as T;
}
