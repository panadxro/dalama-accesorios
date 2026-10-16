/**
 * Exporta a CSV listo para Excel en español: separador ";", coma decimal y BOM para que respete las tildes.
 */
export type Celda = string | number | null | undefined;

const escapar = (v: Celda) => {
  if (v == null) return '';
  const s = typeof v === 'number' ? v.toLocaleString('es-AR', { useGrouping: false, maximumFractionDigits: 2 }) : v;
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function descargarCSV(nombre: string, encabezados: string[], filas: Celda[][]) {
  const texto = [encabezados, ...filas].map((f) => f.map(escapar).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombre}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Centavos a pesos como número (para planillas). */
export const pesos = (centavos: number) => Math.round(centavos) / 100;
