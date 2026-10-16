/**
 * Cálculos de reportes a partir de los comprobantes. Las notas de crédito restan.
 * El costo de cada venta se estima con el margen del producto aplicado al precio de ese momento,
 * así las ventas viejas (a precios más bajos) no distorsionan el margen.
 */
import type { Categoria, Cliente, Comprobante, DatosDemo, Producto, TipoCliente } from '@/domain/types';
import { aISO } from '@/lib/fechas';

export type Periodo = 'mes' | 'anterior' | 'trimestre' | 'seis';

export const PERIODOS: Record<Periodo, string> = {
  mes: 'Mes en curso',
  anterior: 'Mes anterior',
  trimestre: 'Últimos 3 meses',
  seis: 'Últimos 6 meses',
};

export interface Filtros {
  periodo: Periodo;
  tipo: TipoCliente | 'todos';
  categoria: Categoria | 'todas';
}

export function rango(periodo: Periodo, hoy: Date): { desde: Date; hasta: Date } {
  const y = hoy.getFullYear();
  const m = hoy.getMonth();
  switch (periodo) {
    case 'mes': return { desde: new Date(y, m, 1), hasta: new Date(y, m + 1, 1) };
    case 'anterior': return { desde: new Date(y, m - 1, 1), hasta: new Date(y, m, 1) };
    case 'trimestre': return { desde: new Date(y, m - 2, 1), hasta: new Date(y, m + 1, 1) };
    case 'seis': return { desde: new Date(y, m - 5, 1), hasta: new Date(y, m + 1, 1) };
  }
}

export interface LineaVenta {
  comprobante: Comprobante;
  cliente: Cliente;
  producto: Producto;
  cantidad: number;
  neto: number;
  costo: number;
  signo: 1 | -1;
}

/** Cada renglón vendido, con neto y costo estimado, ya filtrado. */
export function lineasVenta(d: DatosDemo, f: Filtros, hoy: Date, periodo?: { desde: Date; hasta: Date }): LineaVenta[] {
  const { desde, hasta } = periodo ?? rango(f.periodo, hoy);
  const dIso = aISO(desde);
  const hIso = aISO(hasta);
  const clientes = new Map(d.clientes.map((c) => [c.id, c]));
  const productos = new Map(d.productos.map((p) => [p.id, p]));
  const out: LineaVenta[] = [];
  for (const c of d.comprobantes) {
    if (c.fecha < dIso || c.fecha >= hIso) continue;
    const cliente = clientes.get(c.clienteId)!;
    if (f.tipo !== 'todos' && cliente.tipo !== f.tipo) continue;
    const signo = c.clase === 'factura' ? 1 : -1;
    for (const r of c.renglones) {
      const producto = r.productoId ? productos.get(r.productoId) : undefined;
      if (!producto) continue;
      if (f.categoria !== 'todas' && producto.categoria !== f.categoria) continue;
      const neto = Math.round(r.cantidad * r.precioUnitario * (1 - c.descuentoPct / 100));
      const costo = Math.round(r.cantidad * r.precioUnitario * (producto.costo / producto.precioLista));
      out.push({ comprobante: c, cliente, producto, cantidad: r.cantidad, neto: signo * neto, costo: signo * costo, signo });
    }
  }
  return out;
}

export function resumen(lineas: LineaVenta[], ivaPct: number) {
  const neto = lineas.reduce((a, l) => a + l.neto, 0);
  const costo = lineas.reduce((a, l) => a + l.costo, 0);
  const facturas = new Set(lineas.filter((l) => l.signo === 1).map((l) => l.comprobante.id));
  const clientes = new Set(lineas.map((l) => l.cliente.id));
  return {
    neto,
    total: Math.round(neto * (1 + ivaPct / 100)),
    costo,
    margenPct: neto ? ((neto - costo) / neto) * 100 : 0,
    facturas: facturas.size,
    ticket: facturas.size ? Math.round((neto * (1 + ivaPct / 100)) / facturas.size) : 0,
    clientes: clientes.size,
  };
}

export function agrupar<K extends string>(lineas: LineaVenta[], clave: (l: LineaVenta) => K) {
  const m = new Map<K, { neto: number; costo: number; cantidad: number; facturas: Set<string> }>();
  for (const l of lineas) {
    const k = clave(l);
    const x = m.get(k) ?? { neto: 0, costo: 0, cantidad: 0, facturas: new Set<string>() };
    x.neto += l.neto;
    x.costo += l.costo;
    x.cantidad += l.signo * l.cantidad;
    if (l.signo === 1) x.facturas.add(l.comprobante.id);
    m.set(k, x);
  }
  return [...m].map(([k, v]) => ({ clave: k, neto: v.neto, costo: v.costo, cantidad: v.cantidad, facturas: v.facturas.size, margenPct: v.neto ? ((v.neto - v.costo) / v.neto) * 100 : 0 })).sort((a, b) => b.neto - a.neto);
}

/** Libro IVA Ventas de un mes: un renglón por comprobante. */
export function libroIva(d: DatosDemo, anio: number, mes: number) {
  const desde = aISO(new Date(anio, mes, 1));
  const hasta = aISO(new Date(anio, mes + 1, 1));
  return d.comprobantes.filter((c) => c.fecha >= desde && c.fecha < hasta).sort((a, b) => a.fecha.localeCompare(b.fecha));
}
