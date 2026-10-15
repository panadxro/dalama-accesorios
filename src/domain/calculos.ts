/**
 * Reglas de negocio puras (sin estado ni UI). Se reutilizan tal cual en el sistema real.
 */
import { diasEntre, type FechaISO } from '@/lib/fechas';
import type {
  Centavos, Cliente, Cobro, Comprobante, CondicionIVA, DatosDemo, EstadoPedido, EstadoPresupuestoVisible, ID,
  LetraComprobante, MetodoEntrega, Pedido, Presupuesto, Producto, Renglon, TipoCliente,
} from './types';

/* ───────────── Totales ───────────── */

export interface Totales {
  subtotal: Centavos;
  descuento: Centavos;
  neto: Centavos;
  iva: Centavos;
  total: Centavos;
}

export function totales(renglones: Pick<Renglon, 'cantidad' | 'precioUnitario'>[], descuentoPct: number, ivaPct = 21): Totales {
  const subtotal = renglones.reduce((a, r) => a + Math.round(r.cantidad * r.precioUnitario), 0);
  const descuento = Math.round((subtotal * descuentoPct) / 100);
  const neto = subtotal - descuento;
  const iva = Math.round((neto * ivaPct) / 100);
  return { subtotal, descuento, neto, iva, total: neto + iva };
}

export const subtotalRenglon = (r: Pick<Renglon, 'cantidad' | 'precioUnitario'>) => Math.round(r.cantidad * r.precioUnitario);

/* ───────────── Facturación ───────────── */

/**
 * Letra del comprobante según la condición frente al IVA (emisor Responsable Inscripto).
 * RI y Monotributo reciben A; Consumidor Final y Exento, B. La C solo la emiten monotributistas.
 */
export function letraPara(receptor: CondicionIVA, emisor: CondicionIVA = 'RI'): LetraComprobante {
  if (emisor === 'MONOTRIBUTO' || emisor === 'EXENTO') return 'C';
  return receptor === 'RI' || receptor === 'MONOTRIBUTO' ? 'A' : 'B';
}

export const CONDICION_IVA: Record<CondicionIVA, string> = {
  RI: 'IVA Responsable Inscripto',
  MONOTRIBUTO: 'Responsable Monotributo',
  CF: 'Consumidor Final',
  EXENTO: 'IVA Sujeto Exento',
};

export const CONDICION_IVA_CORTA: Record<CondicionIVA, string> = {
  RI: 'Resp. Inscripto',
  MONOTRIBUTO: 'Monotributo',
  CF: 'Consumidor final',
  EXENTO: 'Exento',
};

const pad = (n: number, len: number) => String(n).padStart(len, '0');

/** "0003-00002138" */
export const numeroFiscal = (puntoVenta: number, numero: number) => `${pad(puntoVenta, 4)}-${pad(numero, 8)}`;

/** "FC A 0003-00002138" / "NC B 0003-00000041" */
export function codigoComprobante(c: Pick<Comprobante, 'clase' | 'letra' | 'puntoVenta' | 'numero'>): string {
  return `${c.clase === 'factura' ? 'FC' : 'NC'} ${c.letra} ${numeroFiscal(c.puntoVenta, c.numero)}`;
}

/** "Factura A 0003-00002138" */
export function nombreComprobante(c: Pick<Comprobante, 'clase' | 'letra' | 'puntoVenta' | 'numero'>): string {
  return `${c.clase === 'factura' ? 'Factura' : 'Nota de crédito'} ${c.letra} ${numeroFiscal(c.puntoVenta, c.numero)}`;
}

/** El total con signo para la cuenta corriente: las notas de crédito restan. */
export const importeCC = (c: Comprobante) => (c.clase === 'factura' ? c.total : -c.total);

/* ───────────── Presupuestos ───────────── */

/** Un presupuesto enviado cuya validez ya pasó se muestra como vencido. */
export function estadoPresupuesto(p: Presupuesto, hoy: Date | FechaISO): EstadoPresupuestoVisible {
  if (p.estado === 'enviado' && diasEntre(hoy, p.validoHasta) < 0) return 'vencido';
  return p.estado;
}

export const ESTADO_PRESUPUESTO: Record<EstadoPresupuestoVisible, string> = {
  borrador: 'Borrador', enviado: 'Enviado', aceptado: 'Aceptado', rechazado: 'Rechazado', vencido: 'Vencido',
};

/* ───────────── Pedidos ───────────── */

export const ESTADO_PEDIDO: Record<EstadoPedido, string> = {
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  despachado: 'Despachado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const METODO_ENTREGA: Record<MetodoEntrega, string> = {
  camioneta: 'Camioneta',
  retiro: 'Retiro en local',
  transporte: 'Transporte',
  correo: 'Correo',
};

export const totalPedido = (p: Pick<Pedido, 'renglones' | 'descuentoPct'>, ivaPct = 21) => totales(p.renglones, p.descuentoPct, ivaPct).total;

/* ───────────── Clientes ───────────── */

export const TIPO_CLIENTE: Record<TipoCliente, string> = {
  aberturista: 'Aberturista',
  carpintero: 'Carpintero',
  particular: 'Particular',
};

/* ───────────── Cuenta corriente ───────────── */

/** Cuánto falta cobrar de cada factura: total − cobros imputados − notas de crédito asociadas. */
export function pendientesPorComprobante(comprobantes: Comprobante[], cobros: Cobro[]): Map<ID, Centavos> {
  const pendiente = new Map<ID, Centavos>();
  for (const c of comprobantes) if (c.clase === 'factura') pendiente.set(c.id, c.total);
  for (const c of comprobantes) {
    if (c.clase === 'nota_credito' && c.asociadoId && pendiente.has(c.asociadoId)) {
      pendiente.set(c.asociadoId, Math.max(0, pendiente.get(c.asociadoId)! - c.total));
    }
  }
  for (const cobro of cobros) {
    for (const imp of cobro.imputaciones) {
      if (pendiente.has(imp.comprobanteId)) pendiente.set(imp.comprobanteId, Math.max(0, pendiente.get(imp.comprobanteId)! - imp.importe));
    }
  }
  return pendiente;
}

export interface MovimientoCC {
  id: ID;
  fecha: FechaISO;
  tipo: 'factura' | 'nota_credito' | 'cobro';
  descripcion: string;
  debe: Centavos;
  haber: Centavos;
  saldo: Centavos;
  ruta?: string;
  vence?: FechaISO;
  pendiente?: Centavos;
}

/** Movimientos de la cuenta corriente con saldo acumulado, del más viejo al más nuevo. */
export function cuentaCorriente(clienteId: ID, d: Pick<DatosDemo, 'comprobantes' | 'cobros'>, pendientes?: Map<ID, Centavos>): MovimientoCC[] {
  const pend = pendientes ?? pendientesPorComprobante(d.comprobantes, d.cobros);
  const items: Omit<MovimientoCC, 'saldo'>[] = [];
  for (const c of d.comprobantes) {
    if (c.clienteId !== clienteId) continue;
    items.push({
      id: c.id,
      fecha: c.fecha,
      tipo: c.clase,
      descripcion: nombreComprobante(c),
      debe: c.clase === 'factura' ? c.total : 0,
      haber: c.clase === 'nota_credito' ? c.total : 0,
      ruta: `/facturacion/${c.id}`,
      vence: c.clase === 'factura' ? c.vencePago : undefined,
      pendiente: c.clase === 'factura' ? pend.get(c.id) : undefined,
    });
  }
  for (const cb of d.cobros) {
    if (cb.clienteId !== clienteId) continue;
    items.push({ id: cb.id, fecha: cb.fecha, tipo: 'cobro', descripcion: `Recibo ${cb.numero}`, debe: 0, haber: cb.total });
  }
  items.sort((a, b) => a.fecha.localeCompare(b.fecha));
  let saldo = 0;
  return items.map((m) => {
    saldo += m.debe - m.haber;
    return { ...m, saldo };
  });
}

export interface Antiguedad {
  /** Pendiente con 0 a 30 días desde la emisión. */
  d0_30: Centavos;
  d31_60: Centavos;
  d61_90: Centavos;
  d90: Centavos;
}

export interface ResumenCuenta {
  saldo: Centavos;
  /** Facturas impagas con el plazo de pago vencido. */
  vencido: Centavos;
  facturasVencidas: Comprobante[];
  /** Días de la factura vencida más vieja. */
  diasMayorAtraso: number;
  antiguedad: Antiguedad;
}

export function resumenCuenta(
  clienteId: ID, comprobantes: Comprobante[], pendientes: Map<ID, Centavos>, cobros: Cobro[], hoy: Date | FechaISO,
): ResumenCuenta {
  const antiguedad: Antiguedad = { d0_30: 0, d31_60: 0, d61_90: 0, d90: 0 };
  let vencido = 0;
  let diasMayorAtraso = 0;
  const facturasVencidas: Comprobante[] = [];
  let debe = 0;
  let haber = 0;
  for (const c of comprobantes) {
    if (c.clienteId !== clienteId) continue;
    if (c.clase === 'factura') debe += c.total;
    else haber += c.total;
    if (c.clase !== 'factura') continue;
    const p = pendientes.get(c.id) ?? 0;
    if (p <= 0) continue;
    const edad = diasEntre(c.fecha, hoy);
    if (edad <= 30) antiguedad.d0_30 += p;
    else if (edad <= 60) antiguedad.d31_60 += p;
    else if (edad <= 90) antiguedad.d61_90 += p;
    else antiguedad.d90 += p;
    const atraso = diasEntre(c.vencePago, hoy);
    if (atraso > 0) {
      vencido += p;
      facturasVencidas.push(c);
      diasMayorAtraso = Math.max(diasMayorAtraso, atraso);
    }
  }
  for (const cb of cobros) if (cb.clienteId === clienteId) haber += cb.total;
  return { saldo: debe - haber, vencido, facturasVencidas, diasMayorAtraso, antiguedad };
}

/* ───────────── Productos y stock ───────────── */

export type EstadoStock = 'sin_stock' | 'bajo' | 'ok';

export function estadoStock(p: Pick<Producto, 'stock' | 'stockMinimo'>): EstadoStock {
  if (p.stock <= 0) return 'sin_stock';
  if (p.stock < p.stockMinimo) return 'bajo';
  return 'ok';
}

/** Margen bruto sobre el precio de venta, en %. */
export function margenPct(p: Pick<Producto, 'costo' | 'precioLista'>): number {
  if (p.precioLista <= 0) return 0;
  return ((p.precioLista - p.costo) / p.precioLista) * 100;
}

/** Precio sin IVA para una lista con descuento. */
export const precioConLista = (precioLista: Centavos, descuentoPct: number) => Math.round(precioLista * (1 - descuentoPct / 100));

export const CATEGORIA: Record<Producto['categoria'], string> = {
  bisagras: 'Bisagras',
  manijas: 'Manijas',
  cerraduras: 'Cerraduras y cierres',
  rieles: 'Rieles y ruedas',
  burletes: 'Burletes y felpas',
  mosquiteros: 'Mosquiteros',
  accesorios: 'Accesorios',
};

/* ───────────── Clientes inactivos ───────────── */

/** Fecha de la última factura de cada cliente. */
export function ultimaCompraPorCliente(comprobantes: Comprobante[]): Map<ID, FechaISO> {
  const m = new Map<ID, FechaISO>();
  for (const c of comprobantes) {
    if (c.clase !== 'factura') continue;
    const prev = m.get(c.clienteId);
    if (!prev || c.fecha > prev) m.set(c.clienteId, c.fecha);
  }
  return m;
}

export function clienteInactivo(c: Cliente, ultima: FechaISO | undefined, hoy: Date | FechaISO, dias: number): boolean {
  if (!ultima) return diasEntre(c.altaEl, hoy) > dias;
  return diasEntre(ultima, hoy) > dias;
}

/* ───────────── Plantillas ───────────── */

/** Reemplaza {variables} en una plantilla de mensaje. */
export function completarPlantilla(cuerpo: string, datos: Record<string, string>): string {
  return cuerpo.replace(/\{(\w+)\}/g, (m, k: string) => datos[k] ?? m);
}
