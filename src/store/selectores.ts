/**
 * Datos derivados del estado (saldos, deudas, alertas, búsqueda).
 * Se calculan una sola vez por cada versión de los datos y se reutilizan en todas las pantallas.
 */
import { useDemo } from './demo';
import {
  clienteInactivo, codigoComprobante, estadoPresupuesto, estadoStock, pendientesPorComprobante, resumenCuenta,
  totales, ultimaCompraPorCliente, type ResumenCuenta,
} from '@/domain/calculos';
import type { Cliente, Comprobante, DatosDemo, ID, Pedido, Presupuesto, Producto } from '@/domain/types';
import { diasEntre, mismoDia } from '@/lib/fechas';
import { formatARS, formatCUIT } from '@/lib/format';

export interface Derivados {
  hoy: Date;
  clientePorId: Map<ID, Cliente>;
  productoPorId: Map<ID, Producto>;
  pendientes: Map<ID, number>;
  cuentas: Map<ID, ResumenCuenta>;
  ultimaCompra: Map<ID, string>;
  inactivos: Cliente[];
  conDeudaVencida: Array<{ cliente: Cliente; resumen: ResumenCuenta }>;
  stockBajo: Producto[];
  presupuestosSinRespuesta: Presupuesto[];
  entregasHoy: Pedido[];
  mensajesSinProcesar: number;
  /** Unidades comprometidas en pedidos que todavía no se facturaron (el stock se descuenta al facturar). */
  reservado: Map<ID, number>;
}

const cache = new WeakMap<DatosDemo, Derivados>();

export function derivar(d: DatosDemo, ahora = new Date()): Derivados {
  const enCache = cache.get(d);
  if (enCache && mismoDia(enCache.hoy, ahora)) return enCache;

  const clientePorId = new Map(d.clientes.map((c) => [c.id, c]));
  const productoPorId = new Map(d.productos.map((p) => [p.id, p]));
  const pendientes = pendientesPorComprobante(d.comprobantes, d.cobros);
  const cuentas = new Map(d.clientes.map((c) => [c.id, resumenCuenta(c.id, d.comprobantes, pendientes, d.cobros, ahora)]));
  const ultimaCompra = ultimaCompraPorCliente(d.comprobantes);

  const inactivos = d.clientes.filter((c) => clienteInactivo(c, ultimaCompra.get(c.id), ahora, d.ajustes.diasClienteInactivo));
  const conDeudaVencida = d.clientes
    .map((cliente) => ({ cliente, resumen: cuentas.get(cliente.id)! }))
    .filter((x) => x.resumen.vencido > 0)
    .sort((a, b) => b.resumen.vencido - a.resumen.vencido);
  const stockBajo = d.productos
    .filter((p) => p.activo && estadoStock(p) !== 'ok')
    .sort((a, b) => a.stock / Math.max(1, a.stockMinimo) - b.stock / Math.max(1, b.stockMinimo));

  const presupuestosSinRespuesta = d.presupuestos
    .filter((p) => {
      const e = estadoPresupuesto(p, ahora);
      if (e !== 'enviado' && e !== 'vencido') return false;
      // Solo los recientes: los vencidos hace mucho ya no se siguen.
      return p.enviadoEl ? diasEntre(p.enviadoEl, ahora) >= d.ajustes.recordarPresupuestoDias && diasEntre(p.enviadoEl, ahora) <= 15 : false;
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const entregasHoy = d.pedidos
    .filter((p) => p.estado !== 'cancelado' && mismoDia(p.entrega.fecha, ahora))
    .sort((a, b) => a.entrega.fecha.localeCompare(b.entrega.fecha));

  const mensajesSinProcesar = d.conversaciones.filter((c) => c.estado === 'nuevo').length;

  const reservado = new Map<ID, number>();
  for (const p of d.pedidos) {
    if (p.estado === 'cancelado' || p.comprobanteId) continue;
    for (const r of p.renglones) if (r.productoId) reservado.set(r.productoId, (reservado.get(r.productoId) ?? 0) + r.cantidad);
  }

  const r: Derivados = {
    hoy: ahora, clientePorId, productoPorId, pendientes, cuentas, ultimaCompra, inactivos, conDeudaVencida, stockBajo,
    presupuestosSinRespuesta, entregasHoy, mensajesSinProcesar, reservado,
  };
  cache.set(d, r);
  return r;
}

/** Hook: datos derivados de la versión actual. */
export function useDerivados(): Derivados {
  const datos = useDemo((s) => s.datos);
  return derivar(datos);
}

/* ───────────── Avisos de la campana ───────────── */

export interface Aviso {
  id: string;
  title: string;
  text: string;
  to?: string;
}

export function avisos(d: DatosDemo, der: Derivados): Aviso[] {
  const out: Aviso[] = [];
  if (der.mensajesSinProcesar > 0) {
    out.push({
      id: 'whatsapp',
      title: `${der.mensajesSinProcesar} ${der.mensajesSinProcesar === 1 ? 'pedido' : 'pedidos'} de WhatsApp sin procesar`,
      text: 'Generá el presupuesto con IA desde la bandeja.',
      to: '/whatsapp',
    });
  }
  if (der.presupuestosSinRespuesta.length > 0) {
    const total = der.presupuestosSinRespuesta.reduce((a, p) => a + totales(p.renglones, p.descuentoPct, d.ajustes.ivaPct).total, 0);
    out.push({
      id: 'presupuestos',
      title: `${der.presupuestosSinRespuesta.length} presupuestos sin respuesta hace ${d.ajustes.recordarPresupuestoDias} días o más`,
      text: `${formatARS(total)} en juego.`,
      to: '/presupuestos',
    });
  }
  if (der.conDeudaVencida.length > 0) {
    const total = der.conDeudaVencida.reduce((a, x) => a + x.resumen.vencido, 0);
    out.push({
      id: 'deuda',
      title: `${der.conDeudaVencida.length} clientes con deuda vencida`,
      text: `${formatARS(total)} para cobrar.`,
      to: '/cuentas',
    });
  }
  if (der.stockBajo.length > 0) {
    const sin = der.stockBajo.filter((p) => p.stock <= 0).length;
    out.push({
      id: 'stock',
      title: `${der.stockBajo.length} productos bajo el mínimo`,
      text: sin ? `${sin} sin stock.` : 'Revisá la reposición sugerida.',
      to: '/stock',
    });
  }
  const chequesSemana = d.cheques.filter((c) => c.estado === 'en_cartera' && diasEntre(der.hoy, c.cobroEl) <= 7);
  if (chequesSemana.length > 0) {
    out.push({
      id: 'cheques',
      title: `${chequesSemana.length} cheques para depositar esta semana`,
      text: formatARS(chequesSemana.reduce((a, c) => a + c.importe, 0)),
      to: '/cuentas/cheques',
    });
  }
  return out;
}

export function useAvisos(): Aviso[] {
  const datos = useDemo((s) => s.datos);
  return avisos(datos, derivar(datos));
}

/* ───────────── Búsqueda global ───────────── */

export interface ResultadoBusqueda {
  tipo: 'cliente' | 'producto' | 'presupuesto' | 'pedido' | 'comprobante';
  id: ID;
  titulo: string;
  detalle: string;
  to: string;
}

/** Saca tildes y pasa a minúsculas: "Módena" encuentra "modena". */
export const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function buscar(d: DatosDemo, consulta: string, limitePorTipo = 8): ResultadoBusqueda[] {
  const q = normalizar(consulta.trim());
  if (q.length < 2) return [];
  const palabras = q.split(/\s+/);
  const coincide = (texto: string) => {
    const t = normalizar(texto);
    return palabras.every((p) => t.includes(p));
  };
  const soloDigitos = q.replace(/\D/g, '');

  const clientes = d.clientes
    .filter((c) => coincide(`${c.razonSocial} ${c.contacto} ${c.localidad} ${c.email}`) || (soloDigitos.length >= 4 && (c.cuit.includes(soloDigitos) || c.telefono.replace(/\D/g, '').includes(soloDigitos))))
    .slice(0, limitePorTipo)
    .map<ResultadoBusqueda>((c) => ({ tipo: 'cliente', id: c.id, titulo: c.razonSocial, detalle: `CUIT ${formatCUIT(c.cuit)} · ${c.localidad}`, to: `/clientes/${c.id}` }));

  const productos = d.productos
    .filter((p) => coincide(`${p.codigo} ${p.nombre} ${p.sinonimos.join(' ')}`))
    .slice(0, limitePorTipo)
    .map<ResultadoBusqueda>((p) => ({ tipo: 'producto', id: p.id, titulo: p.nombre, detalle: `${p.codigo} · stock ${p.stock} ${p.unidad} · ${formatARS(p.precioLista)}`, to: `/productos?q=${encodeURIComponent(p.codigo)}` }));

  const nombreCliente = (id: ID) => d.clientes.find((c) => c.id === id)?.razonSocial ?? '';

  const presupuestos = d.presupuestos
    .filter((p) => coincide(`${p.numero} ${nombreCliente(p.clienteId)}`))
    .slice(0, limitePorTipo)
    .map<ResultadoBusqueda>((p) => ({ tipo: 'presupuesto', id: p.id, titulo: `Presupuesto ${p.numero}`, detalle: nombreCliente(p.clienteId), to: `/presupuestos/${p.id}` }));

  const pedidos = d.pedidos
    .filter((p) => coincide(`${p.numero} ${p.remito?.numero ?? ''} ${nombreCliente(p.clienteId)}`))
    .slice(0, limitePorTipo)
    .map<ResultadoBusqueda>((p) => ({ tipo: 'pedido', id: p.id, titulo: `Pedido ${p.numero}`, detalle: nombreCliente(p.clienteId), to: `/pedidos/${p.id}` }));

  const comprobantes = d.comprobantes
    .filter((c: Comprobante) => coincide(`${codigoComprobante(c)} ${c.numero} ${nombreCliente(c.clienteId)}`))
    .slice(0, limitePorTipo)
    .map<ResultadoBusqueda>((c) => ({ tipo: 'comprobante', id: c.id, titulo: codigoComprobante(c), detalle: `${nombreCliente(c.clienteId)} · ${formatARS(c.total)}`, to: `/facturacion/${c.id}` }));

  return [...clientes, ...productos, ...presupuestos, ...pedidos, ...comprobantes];
}
