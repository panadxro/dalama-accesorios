/**
 * Acciones de negocio del flujo principal. Son funciones puras: reciben los datos y devuelven
 * la versión nueva más lo que hizo falta saber para explicar el efecto (toasts).
 * `ejecutar` las aplica sobre el store. En el sistema real, cada una es un endpoint.
 */
import { useDemo } from './demo';
import { estadoStock, letraPara, numeroFiscal, totales } from '@/domain/calculos';
import type {
  Actividad, Canal, Cheque, Cliente, Cobro, Comprobante, Conteo, Conversacion, DatosDemo, Entrega, EstadoPedido, ID,
  Imputacion, LetraComprobante, Mensaje, MovimientoStock, Pedido, Presupuesto, Producto, Renglon,
} from '@/domain/types';
import { aISO, ahoraISO, conHora, sumarDias, type FechaISO } from '@/lib/fechas';

type Resultado<R> = { datos: DatosDemo; r: R };

/** Aplica una acción sobre el store y devuelve su resultado. */
export function ejecutar<R>(accion: (d: DatosDemo) => Resultado<R>): R {
  let r!: R;
  useDemo.getState().actualizar((d) => {
    const res = accion(d);
    r = res.r;
    return res.datos;
  });
  return r;
}

let contador = 0;
const id = (prefijo: string) => `${prefijo}-u${Date.now().toString(36)}${(++contador).toString(36)}`;
const pad4 = (n: number) => String(n).padStart(4, '0');

function conActividad(d: DatosDemo, a: Omit<Actividad, 'id' | 'fecha'>): Actividad[] {
  return [{ ...a, id: id('act'), fecha: ahoraISO() }, ...d.actividad].slice(0, 200);
}

const reemplazar = <T extends { id: ID }>(lista: T[], item: T) => lista.map((x) => (x.id === item.id ? item : x));

/* ───────────── Clientes ───────────── */

export function crearCliente(d: DatosDemo, datos: Omit<Cliente, 'id' | 'altaEl'>): Resultado<Cliente> {
  const c: Cliente = { ...datos, id: id('cli'), altaEl: ahoraISO() };
  return {
    datos: { ...d, clientes: [...d.clientes, c], actividad: conActividad(d, { tipo: 'cliente', titulo: 'Cliente nuevo', detalle: c.razonSocial, ruta: `/clientes/${c.id}` }) },
    r: c,
  };
}

/* ───────────── WhatsApp ───────────── */

/** Vincula una conversación con un cliente (por ejemplo, después de darlo de alta). */
export function vincularConversacion(d: DatosDemo, conversacionId: ID, clienteId: ID): Resultado<void> {
  return { datos: { ...d, conversaciones: d.conversaciones.map((c) => (c.id === conversacionId ? { ...c, clienteId } : c)) }, r: undefined };
}

export function marcarLeida(d: DatosDemo, conversacionId: ID): Resultado<void> {
  const conv = d.conversaciones.find((c) => c.id === conversacionId);
  if (!conv || conv.mensajes.every((m) => m.leido)) return { datos: d, r: undefined };
  return {
    datos: { ...d, conversaciones: d.conversaciones.map((c) => (c.id === conversacionId ? { ...c, mensajes: c.mensajes.map((m) => ({ ...m, leido: true })) } : c)) },
    r: undefined,
  };
}

/** Llega un mensaje (simulado). Si el teléfono ya tiene conversación, se suma ahí. */
export function recibirMensaje(d: DatosDemo, m: { telefono: string; contacto: string; clienteId?: ID; texto: string }): Resultado<Conversacion> {
  const existente = d.conversaciones.find((c) => c.telefono === m.telefono);
  const mensaje: Mensaje = { id: id('msg'), de: 'cliente', texto: m.texto, fecha: ahoraISO(), leido: false };
  let conv: Conversacion;
  if (existente) {
    conv = { ...existente, mensajes: [...existente.mensajes, mensaje], estado: 'nuevo', presupuestoId: undefined };
  } else {
    conv = { id: id('conv'), telefono: m.telefono, contacto: m.contacto, clienteId: m.clienteId, mensajes: [mensaje], estado: 'nuevo' };
  }
  const conversaciones = existente ? [conv, ...d.conversaciones.filter((c) => c.id !== conv.id)] : [conv, ...d.conversaciones];
  return {
    datos: { ...d, conversaciones, actividad: conActividad(d, { tipo: 'mensaje', titulo: 'Nuevo pedido por WhatsApp', detalle: m.contacto, ruta: `/whatsapp/${conv.id}` }) },
    r: conv,
  };
}

/** Respuesta escrita a mano desde la bandeja. */
export function responder(d: DatosDemo, conversacionId: ID, texto: string, adjunto?: Mensaje['adjunto']): Resultado<Mensaje> {
  const msg: Mensaje = { id: id('msg'), de: 'dalama', texto, fecha: ahoraISO(), leido: true, adjunto };
  return {
    datos: {
      ...d,
      conversaciones: d.conversaciones.map((c) => (c.id === conversacionId ? { ...c, mensajes: [...c.mensajes.map((x) => ({ ...x, leido: true })), msg], estado: c.estado === 'nuevo' ? 'respondido' : c.estado } : c)),
    },
    r: msg,
  };
}

/** Busca la conversación de un cliente o crea una nueva con su teléfono. */
function conversacionDe(d: DatosDemo, cliente: Cliente, preferida?: ID): { conv: Conversacion; nueva: boolean } {
  const conv = (preferida && d.conversaciones.find((c) => c.id === preferida)) || d.conversaciones.find((c) => c.clienteId === cliente.id) || d.conversaciones.find((c) => c.telefono === cliente.telefono);
  if (conv) return { conv, nueva: false };
  return { conv: { id: id('conv'), telefono: cliente.telefono, contacto: cliente.contacto, clienteId: cliente.id, mensajes: [], estado: 'respondido' }, nueva: true };
}

/* ───────────── Presupuestos ───────────── */

export interface DatosPresupuesto {
  clienteId: ID;
  renglones: Renglon[];
  origen: Presupuesto['origen'];
  conversacionId?: ID;
  notas?: string;
  descuentoPct?: number;
}

export function crearPresupuesto(d: DatosDemo, datos: DatosPresupuesto): Resultado<Presupuesto> {
  const cliente = d.clientes.find((c) => c.id === datos.clienteId)!;
  const lista = d.listas.find((l) => l.id === cliente.listaId);
  const ahora = new Date();
  const p: Presupuesto = {
    id: id('pre'),
    numero: `P-${pad4(d.secuencias.presupuesto)}`,
    clienteId: datos.clienteId,
    fecha: aISO(ahora),
    validoHasta: aISO(conHora(sumarDias(ahora, d.ajustes.validezPresupuestoDias), 23, 59)),
    renglones: datos.renglones,
    descuentoPct: datos.descuentoPct ?? lista?.descuentoPct ?? 0,
    estado: 'borrador',
    origen: datos.origen,
    conversacionId: datos.conversacionId,
    recordatorio: { activo: true, dias: d.ajustes.recordarPresupuestoDias },
    notas: datos.notas,
  };
  return {
    datos: {
      ...d,
      presupuestos: [p, ...d.presupuestos],
      secuencias: { ...d.secuencias, presupuesto: d.secuencias.presupuesto + 1 },
      conversaciones: datos.conversacionId ? d.conversaciones.map((c) => (c.id === datos.conversacionId ? { ...c, presupuestoId: p.id } : c)) : d.conversaciones,
    },
    r: p,
  };
}

export function guardarPresupuesto(d: DatosDemo, p: Presupuesto): Resultado<Presupuesto> {
  return { datos: { ...d, presupuestos: reemplazar(d.presupuestos, p) }, r: p };
}

/** Envía el presupuesto: pasa a Enviado y, si va por WhatsApp, queda el mensaje con el PDF en la conversación. */
export function enviarPresupuesto(d: DatosDemo, presupuestoId: ID, canal: Canal, texto: string): Resultado<{ presupuesto: Presupuesto; conversacionId?: ID }> {
  const p0 = d.presupuestos.find((p) => p.id === presupuestoId)!;
  const cliente = d.clientes.find((c) => c.id === p0.clienteId)!;
  const ahora = new Date();
  const reenvio = p0.estado !== 'borrador';
  const p: Presupuesto = {
    ...p0,
    estado: p0.estado === 'aceptado' || p0.estado === 'rechazado' ? p0.estado : 'enviado',
    enviadoEl: aISO(ahora),
    enviadoPor: canal,
    // Al reenviar se renueva la validez.
    validoHasta: reenvio ? aISO(conHora(sumarDias(ahora, d.ajustes.validezPresupuestoDias), 23, 59)) : p0.validoHasta,
    vistoEl: undefined,
  };
  let conversaciones = d.conversaciones;
  let conversacionId: ID | undefined;
  if (canal === 'whatsapp') {
    const { conv, nueva } = conversacionDe(d, cliente, p.conversacionId);
    conversacionId = conv.id;
    const msg: Mensaje = { id: id('msg'), de: 'dalama', texto, fecha: aISO(ahora), leido: true, adjunto: { tipo: 'presupuesto', id: p.id, nombre: `Presupuesto ${p.numero}.pdf` } };
    const actualizada: Conversacion = { ...conv, mensajes: [...conv.mensajes.map((m) => ({ ...m, leido: true })), msg], estado: 'presupuestado', presupuestoId: p.id, clienteId: cliente.id };
    conversaciones = nueva ? [actualizada, ...d.conversaciones] : reemplazar(d.conversaciones, actualizada);
    p.conversacionId = conv.id;
  }
  return {
    datos: {
      ...d,
      presupuestos: reemplazar(d.presupuestos, p),
      conversaciones,
      actividad: conActividad(d, { tipo: 'presupuesto', titulo: `Presupuesto ${p.numero} ${reenvio ? 'reenviado' : 'enviado'}`, detalle: `${cliente.razonSocial} · por ${canal === 'whatsapp' ? 'WhatsApp' : 'email'}`, ruta: `/presupuestos/${p.id}` }),
    },
    r: { presupuesto: p, conversacionId },
  };
}

/** Respuesta del cliente (en la demo se simula desde la bandeja o se registra a mano). */
export function responderPresupuesto(d: DatosDemo, presupuestoId: ID, respuesta: 'acepta' | 'rechaza', opciones: { mensaje?: string; motivo?: string } = {}): Resultado<Presupuesto> {
  const p0 = d.presupuestos.find((p) => p.id === presupuestoId)!;
  const cliente = d.clientes.find((c) => c.id === p0.clienteId)!;
  const p: Presupuesto = {
    ...p0,
    estado: respuesta === 'acepta' ? 'aceptado' : 'rechazado',
    respondidoEl: ahoraISO(),
    vistoEl: p0.vistoEl ?? ahoraISO(),
    motivoRechazo: respuesta === 'rechaza' ? opciones.motivo ?? 'Sin motivo' : undefined,
  };
  let conversaciones = d.conversaciones;
  if (opciones.mensaje && p.conversacionId) {
    const msg: Mensaje = { id: id('msg'), de: 'cliente', texto: opciones.mensaje, fecha: ahoraISO(), leido: false };
    conversaciones = d.conversaciones.map((c) => (c.id === p.conversacionId ? { ...c, mensajes: [...c.mensajes, msg] } : c));
  }
  return {
    datos: {
      ...d,
      presupuestos: reemplazar(d.presupuestos, p),
      conversaciones,
      actividad: conActividad(d, { tipo: 'presupuesto', titulo: `Presupuesto ${p.numero} ${respuesta === 'acepta' ? 'aceptado' : 'rechazado'}`, detalle: cliente.razonSocial, ruta: `/presupuestos/${p.id}` }),
    },
    r: p,
  };
}

/* ───────────── Pedidos ───────────── */

/** Entrega sugerida según el cliente: camioneta al día siguiente hábil, retiro para particulares. */
export function entregaSugerida(cliente: Cliente, pista?: { cuando?: 'hoy' | 'mañana'; retira?: boolean }): Entrega {
  const hoy = new Date();
  let dia = sumarDias(hoy, pista?.cuando === 'hoy' ? 0 : 1);
  if (dia.getDay() === 0) dia = sumarDias(dia, 1);
  const retira = pista?.retira || (cliente.tipo === 'particular' && !pista?.cuando);
  return retira
    ? { metodo: 'retiro', fecha: aISO(conHora(dia, 16)), direccion: 'Retira en el local', bultos: 1 }
    : { metodo: 'camioneta', fecha: aISO(conHora(dia, 10)), direccion: `${cliente.direccion}, ${cliente.localidad}`, bultos: 2, chofer: 'Nahuel' };
}

export function convertirEnPedido(d: DatosDemo, presupuestoId: ID, entrega: Entrega): Resultado<Pedido> {
  const p0 = d.presupuestos.find((p) => p.id === presupuestoId)!;
  const cliente = d.clientes.find((c) => c.id === p0.clienteId)!;
  const renglones = p0.renglones.filter((r) => r.productoId).map((r) => ({ ...r, id: id('r'), textoOriginal: undefined, confianza: undefined }));
  const pedido: Pedido = {
    id: id('ped'),
    numero: `PED-${pad4(d.secuencias.pedido)}`,
    clienteId: p0.clienteId,
    presupuestoId: p0.id,
    fecha: ahoraISO(),
    renglones,
    descuentoPct: p0.descuentoPct,
    estado: 'confirmado',
    entrega,
    notas: p0.notas,
  };
  if (cliente.condicionVenta === 'contado' && entrega.metodo !== 'correo') pedido.entrega = { ...entrega, cobrarAlEntregar: totales(renglones, pedido.descuentoPct, d.ajustes.ivaPct).total };
  const p: Presupuesto = { ...p0, estado: 'aceptado', respondidoEl: p0.respondidoEl ?? ahoraISO(), pedidoId: pedido.id };
  return {
    datos: {
      ...d,
      pedidos: [pedido, ...d.pedidos],
      presupuestos: reemplazar(d.presupuestos, p),
      secuencias: { ...d.secuencias, pedido: d.secuencias.pedido + 1 },
      actividad: conActividad(d, { tipo: 'pedido', titulo: `Pedido ${pedido.numero} creado`, detalle: `${cliente.razonSocial} · desde ${p.numero}`, ruta: `/pedidos/${pedido.id}` }),
    },
    r: pedido,
  };
}

export function cambiarEstadoPedido(d: DatosDemo, pedidoId: ID, estado: EstadoPedido): Resultado<Pedido> {
  const p0 = d.pedidos.find((p) => p.id === pedidoId)!;
  let secuencias = d.secuencias;
  const p: Pedido = { ...p0, estado };
  // El remito se emite cuando el pedido queda listo para salir.
  if ((estado === 'listo' || estado === 'despachado' || estado === 'entregado') && !p.remito) {
    p.remito = { numero: `R ${numeroFiscal(d.empresa.puntoVentaRemito, d.secuencias.remito)}`, fecha: ahoraISO() };
    secuencias = { ...d.secuencias, remito: d.secuencias.remito + 1 };
  }
  if (estado === 'entregado' && !p.entrega.entregadoEl) p.entrega = { ...p.entrega, entregadoEl: ahoraISO() };
  const cliente = d.clientes.find((c) => c.id === p.clienteId)!;
  return {
    datos: {
      ...d,
      pedidos: reemplazar(d.pedidos, p),
      secuencias,
      actividad: estado === 'entregado' || estado === 'despachado' || estado === 'cancelado'
        ? conActividad(d, { tipo: 'entrega', titulo: `Pedido ${p.numero} ${estado === 'entregado' ? 'entregado' : estado === 'despachado' ? 'despachado' : 'cancelado'}`, detalle: cliente.razonSocial, ruta: `/pedidos/${p.id}` })
        : d.actividad,
    },
    r: p,
  };
}

export function actualizarEntrega(d: DatosDemo, pedidoId: ID, entrega: Entrega): Resultado<Pedido> {
  const p0 = d.pedidos.find((p) => p.id === pedidoId)!;
  const p = { ...p0, entrega };
  return { datos: { ...d, pedidos: reemplazar(d.pedidos, p) }, r: p };
}

/* ───────────── Facturación ───────────── */

export interface ResultadoFactura {
  comprobante: Comprobante;
  /** Productos que quedaron bajo el mínimo por esta venta. */
  quedaronBajos: Producto[];
  /** Productos que se facturaron con menos stock del necesario (quedan en negativo hasta reponer). */
  faltantes: Producto[];
  unidades: number;
}

/** Emite la factura de un pedido: suma a la cuenta corriente (vía comprobante) y descuenta el stock. */
export function emitirFactura(
  d: DatosDemo, pedidoId: ID, cae: { cae: string; caeVence: FechaISO; letra?: LetraComprobante; fecha?: FechaISO; condicionVenta?: Cliente['condicionVenta'] },
): Resultado<ResultadoFactura> {
  const pedido = d.pedidos.find((p) => p.id === pedidoId)!;
  const cliente = d.clientes.find((c) => c.id === pedido.clienteId)!;
  const letra = cae.letra ?? letraPara(cliente.condicionIVA, d.empresa.condicionIVA);
  const fecha = cae.fecha ?? ahoraISO();
  const condicionVenta = cae.condicionVenta ?? cliente.condicionVenta;
  const t = totales(pedido.renglones, pedido.descuentoPct, d.ajustes.ivaPct);
  const comprobante: Comprobante = {
    id: id('cmp'),
    clase: 'factura',
    letra,
    puntoVenta: d.empresa.puntoVenta,
    numero: d.secuencias.factura[letra],
    fecha,
    clienteId: cliente.id,
    pedidoId: pedido.id,
    renglones: pedido.renglones.map((r) => ({ ...r, id: id('r') })),
    descuentoPct: pedido.descuentoPct,
    neto: t.neto,
    iva: t.iva,
    total: t.total,
    cae: cae.cae,
    caeVence: cae.caeVence,
    condicionVenta,
    vencePago: aISO(sumarDias(new Date(fecha), condicionVenta === 'cta_cte_30' ? 30 : 2)),
  };

  // Descontar stock y registrar los movimientos.
  const productos = d.productos.map((p) => ({ ...p }));
  const movimientos: MovimientoStock[] = [];
  const quedaronBajos: Producto[] = [];
  const faltantes: Producto[] = [];
  let unidades = 0;
  for (const r of pedido.renglones) {
    const prod = productos.find((p) => p.id === r.productoId);
    if (!prod) continue;
    const antes = estadoStock(prod);
    if (prod.stock < r.cantidad) faltantes.push(prod);
    prod.stock -= r.cantidad;
    unidades += r.cantidad;
    movimientos.push({
      id: id('mov'), productoId: prod.id, fecha, cantidad: -r.cantidad, tipo: 'venta',
      referencia: { tipo: 'pedido', id: pedido.id, numero: pedido.numero }, usuario: 'Laura M.', stockResultante: prod.stock,
    });
    if (antes === 'ok' && estadoStock(prod) !== 'ok' && !faltantes.includes(prod)) quedaronBajos.push(prod);
  }

  const pedidoNuevo: Pedido = { ...pedido, comprobanteId: comprobante.id };
  // Contado: lo cobra el chofer al entregar (salvo que ya se haya entregado o vaya por correo).
  if (condicionVenta === 'contado' && pedido.estado !== 'entregado' && pedido.entrega.metodo !== 'correo') {
    pedidoNuevo.entrega = { ...pedido.entrega, cobrarAlEntregar: t.total };
  }

  return {
    datos: {
      ...d,
      comprobantes: [comprobante, ...d.comprobantes],
      pedidos: reemplazar(d.pedidos, pedidoNuevo),
      productos,
      movimientosStock: [...movimientos, ...d.movimientosStock],
      secuencias: { ...d.secuencias, factura: { ...d.secuencias.factura, [letra]: d.secuencias.factura[letra] + 1 } },
      actividad: conActividad(d, { tipo: 'factura', titulo: `Factura ${letra} ${numeroFiscal(comprobante.puntoVenta, comprobante.numero)} emitida`, detalle: `${cliente.razonSocial} · pedido ${pedido.numero}`, ruta: `/facturacion/${comprobante.id}` }),
    },
    r: { comprobante, quedaronBajos, faltantes, unidades },
  };
}

/* ───────────── Cobranzas ───────────── */

export type MedioCobro =
  | { tipo: 'efectivo'; importe: number }
  | { tipo: 'transferencia'; importe: number; banco: string; operacion: string }
  | { tipo: 'tarjeta'; importe: number; tarjeta: string; cuotas: number; cupon: string }
  | { tipo: 'cheque'; importe: number; banco: string; numero: string; cobroEl: FechaISO; echeq: boolean };

export function registrarCobro(
  d: DatosDemo, datos: { clienteId: ID; medios: MedioCobro[]; imputaciones: Imputacion[]; fecha?: FechaISO; notas?: string },
): Resultado<{ cobro: Cobro; cheques: Cheque[] }> {
  const cliente = d.clientes.find((c) => c.id === datos.clienteId)!;
  const cobroId = id('cob');
  const fecha = datos.fecha ?? ahoraISO();
  const cheques: Cheque[] = [];
  const medios = datos.medios.map((m) => {
    if (m.tipo !== 'cheque') return m;
    const ch: Cheque = {
      id: id('chq'), banco: m.banco, numero: m.numero, librador: cliente.razonSocial, cuitLibrador: cliente.cuit, importe: m.importe,
      emitidoEl: fecha, cobroEl: m.cobroEl, estado: 'en_cartera', clienteId: cliente.id, cobroId, echeq: m.echeq,
    };
    cheques.push(ch);
    return { tipo: 'cheque' as const, importe: m.importe, chequeId: ch.id };
  });
  const total = datos.medios.reduce((a, m) => a + m.importe, 0);
  const cobro: Cobro = {
    id: cobroId,
    numero: `RC ${numeroFiscal(1, d.secuencias.recibo)}`,
    clienteId: cliente.id,
    fecha,
    medios,
    imputaciones: datos.imputaciones.filter((i) => i.importe > 0),
    total,
    notas: datos.notas,
  };
  return {
    datos: {
      ...d,
      cobros: [cobro, ...d.cobros],
      cheques: [...d.cheques, ...cheques],
      secuencias: { ...d.secuencias, recibo: d.secuencias.recibo + 1 },
      actividad: conActividad(d, { tipo: 'cobro', titulo: `Cobro ${cobro.numero} registrado`, detalle: cliente.razonSocial, ruta: `/cuentas/${cliente.id}` }),
    },
    r: { cobro, cheques },
  };
}

/* ───────────── Entregas ───────────── */

/** Marca entregado y, si correspondía cobrar al entregar, registra el cobro imputado a la factura. */
export function confirmarEntrega(
  d: DatosDemo, pedidoId: ID, opciones: { recibidoPor?: string; cobro?: MedioCobro } = {},
): Resultado<{ pedido: Pedido; cobro?: Cobro }> {
  let datos = d;
  const r1 = cambiarEstadoPedido(datos, pedidoId, 'entregado');
  datos = r1.datos;
  let pedido: Pedido = { ...r1.r, entrega: { ...r1.r.entrega, recibidoPor: opciones.recibidoPor, entregadoEl: ahoraISO() } };
  let cobro: Cobro | undefined;
  if (opciones.cobro && pedido.comprobanteId) {
    const r2 = registrarCobro(datos, { clienteId: pedido.clienteId, medios: [opciones.cobro], imputaciones: [{ comprobanteId: pedido.comprobanteId, importe: opciones.cobro.importe }], notas: `Cobrado al entregar ${pedido.numero}` });
    datos = r2.datos;
    cobro = r2.r.cobro;
  }
  datos = { ...datos, pedidos: reemplazar(datos.pedidos, pedido) };
  return { datos, r: { pedido, cobro } };
}

/** Envía un documento (factura, recibo, estado de cuenta) por WhatsApp: queda en la conversación del cliente. */
export function enviarDocumento(d: DatosDemo, clienteId: ID, texto: string, adjunto?: Mensaje['adjunto']): Resultado<{ conversacionId: ID }> {
  const cliente = d.clientes.find((c) => c.id === clienteId)!;
  const { conv, nueva } = conversacionDe(d, cliente);
  const msg: Mensaje = { id: id('msg'), de: 'dalama', texto, fecha: ahoraISO(), leido: true, adjunto };
  const actualizada: Conversacion = { ...conv, mensajes: [...conv.mensajes.map((m) => ({ ...m, leido: true })), msg], estado: conv.estado === 'nuevo' ? 'respondido' : conv.estado };
  return {
    datos: { ...d, conversaciones: nueva ? [actualizada, ...d.conversaciones] : reemplazar(d.conversaciones, actualizada) },
    r: { conversacionId: conv.id },
  };
}

/* ───────────── Etapa 4: clientes, notas de crédito, cheques, catálogo y stock ───────────── */

export function actualizarCliente(d: DatosDemo, c: Cliente): Resultado<Cliente> {
  return { datos: { ...d, clientes: reemplazar(d.clientes, c) }, r: c };
}

/** Nota de crédito sobre una factura (devolución o bonificación). Si reingresa mercadería, vuelve al stock. */
export function emitirNotaCredito(
  d: DatosDemo,
  facturaId: ID,
  datos: { renglones: Renglon[]; motivo: string; reingresaStock: boolean; cae: string; caeVence: FechaISO },
): Resultado<Comprobante> {
  const f = d.comprobantes.find((c) => c.id === facturaId)!;
  const cliente = d.clientes.find((c) => c.id === f.clienteId)!;
  const t = totales(datos.renglones, f.descuentoPct, d.ajustes.ivaPct);
  const fecha = ahoraISO();
  const nc: Comprobante = {
    id: id('cmp'), clase: 'nota_credito', letra: f.letra, puntoVenta: f.puntoVenta, numero: d.secuencias.notaCredito[f.letra],
    fecha, clienteId: f.clienteId, asociadoId: f.id, renglones: datos.renglones.map((r) => ({ ...r, id: id('r') })), descuentoPct: f.descuentoPct,
    neto: t.neto, iva: t.iva, total: t.total, cae: datos.cae, caeVence: datos.caeVence, condicionVenta: f.condicionVenta, vencePago: fecha,
    motivo: datos.motivo, reingresaStock: datos.reingresaStock,
  };
  let productos = d.productos;
  const movimientos: MovimientoStock[] = [];
  if (datos.reingresaStock) {
    productos = d.productos.map((p) => ({ ...p }));
    for (const r of datos.renglones) {
      const prod = productos.find((p) => p.id === r.productoId);
      if (!prod) continue;
      prod.stock += r.cantidad;
      movimientos.push({ id: id('mov'), productoId: prod.id, fecha, cantidad: r.cantidad, tipo: 'devolucion', referencia: { tipo: 'comprobante', id: nc.id, numero: `NC ${nc.letra} ${numeroFiscal(nc.puntoVenta, nc.numero)}` }, motivo: datos.motivo, usuario: 'Laura M.', stockResultante: prod.stock });
    }
  }
  return {
    datos: {
      ...d,
      comprobantes: [nc, ...d.comprobantes],
      productos,
      movimientosStock: [...movimientos, ...d.movimientosStock],
      secuencias: { ...d.secuencias, notaCredito: { ...d.secuencias.notaCredito, [f.letra]: d.secuencias.notaCredito[f.letra] + 1 } },
      actividad: conActividad(d, { tipo: 'nota_credito', titulo: `Nota de crédito ${f.letra} ${numeroFiscal(nc.puntoVenta, nc.numero)} emitida`, detalle: `${cliente.razonSocial} · ${datos.motivo}`, ruta: `/facturacion/${nc.id}` }),
    },
    r: nc,
  };
}

export function cambiarEstadoCheque(d: DatosDemo, chequeId: ID, estado: 'depositado' | 'endosado', destino: string): Resultado<Cheque> {
  const ch0 = d.cheques.find((c) => c.id === chequeId)!;
  const ch: Cheque = { ...ch0, estado, destino };
  return {
    datos: { ...d, cheques: reemplazar(d.cheques, ch), actividad: conActividad(d, { tipo: 'cobro', titulo: `Cheque ${ch.numero} ${estado}`, detalle: `${ch.banco} · ${destino}`, ruta: '/cuentas/cheques' }) },
    r: ch,
  };
}

/** Actualización masiva de precios: aplica un % y redondea a múltiplos de $ 10. */
export function actualizarPrecios(d: DatosDemo, productoIds: ID[], porcentaje: number, conCosto: boolean): Resultado<{ cantidad: number }> {
  const redondear = (c: number) => Math.round(c / 1000) * 1000;
  const set = new Set(productoIds);
  const productos = d.productos.map((p) =>
    set.has(p.id)
      ? { ...p, precioLista: redondear(p.precioLista * (1 + porcentaje / 100)), costo: conCosto ? redondear(p.costo * (1 + porcentaje / 100)) : p.costo }
      : p,
  );
  return {
    datos: { ...d, productos, actividad: conActividad(d, { tipo: 'precio', titulo: `Precios actualizados ${porcentaje > 0 ? '+' : ''}${porcentaje.toLocaleString('es-AR')} %`, detalle: `${productoIds.length} productos`, ruta: '/productos' }) },
    r: { cantidad: productoIds.length },
  };
}

export function guardarProducto(d: DatosDemo, p: Producto): Resultado<Producto> {
  const existe = d.productos.some((x) => x.id === p.id);
  return {
    datos: {
      ...d,
      productos: existe ? reemplazar(d.productos, p) : [...d.productos, p],
      actividad: existe ? d.actividad : conActividad(d, { tipo: 'precio', titulo: 'Producto nuevo', detalle: `${p.codigo} · ${p.nombre}`, ruta: `/productos?q=${encodeURIComponent(p.codigo)}` }),
    },
    r: p,
  };
}

export const nuevoIdProducto = (codigo: string) => `prod-${codigo.toLowerCase()}-${Date.now().toString(36)}`;

/** Ajuste manual de stock (rotura, faltante, error de carga). */
export function ajustarStock(d: DatosDemo, productoId: ID, cantidad: number, motivo: string): Resultado<Producto> {
  const p0 = d.productos.find((p) => p.id === productoId)!;
  const p = { ...p0, stock: p0.stock + cantidad };
  const mov: MovimientoStock = { id: id('mov'), productoId, fecha: ahoraISO(), cantidad, tipo: 'ajuste', motivo, usuario: 'Laura M.', stockResultante: p.stock };
  return {
    datos: { ...d, productos: reemplazar(d.productos, p), movimientosStock: [mov, ...d.movimientosStock], actividad: conActividad(d, { tipo: 'stock', titulo: `Ajuste de stock ${cantidad > 0 ? '+' : ''}${cantidad}`, detalle: `${p.nombre} · ${motivo}`, ruta: '/stock' }) },
    r: p,
  };
}

/** Cierra un conteo: guarda lo contado y ajusta las diferencias. */
export function cerrarConteo(d: DatosDemo, estante: string, items: Array<{ productoId: ID; contado: number }>): Resultado<{ diferencias: number; unidades: number }> {
  const fecha = ahoraISO();
  const conteoId = id('cnt');
  const productos = d.productos.map((p) => ({ ...p }));
  const movimientos: MovimientoStock[] = [];
  const registro = items.map((it) => {
    const p = productos.find((x) => x.id === it.productoId)!;
    const sistema = p.stock;
    const dif = it.contado - sistema;
    if (dif !== 0) {
      p.stock = it.contado;
      movimientos.push({ id: id('mov'), productoId: p.id, fecha, cantidad: dif, tipo: 'conteo', motivo: `Diferencia de conteo · ${estante.toLowerCase()}`, referencia: { tipo: 'conteo', id: conteoId, numero: estante }, usuario: 'Nahuel R.', stockResultante: p.stock });
    }
    return { productoId: p.id, sistema, contado: it.contado };
  });
  const conteo: Conteo = { id: conteoId, fecha, estante, items: registro, estado: 'cerrado', usuario: 'Nahuel R.' };
  return {
    datos: {
      ...d, productos, conteos: [conteo, ...d.conteos], movimientosStock: [...movimientos, ...d.movimientosStock],
      actividad: conActividad(d, { tipo: 'stock', titulo: `Conteo de ${estante.toLowerCase()} cerrado`, detalle: `${movimientos.length} diferencias ajustadas`, ruta: '/stock' }),
    },
    r: { diferencias: movimientos.length, unidades: movimientos.reduce((a, m) => a + Math.abs(m.cantidad), 0) },
  };
}
