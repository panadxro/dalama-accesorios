/**
 * Genera los datos iniciales de la demo, siempre iguales (semilla fija) y relativos al día de hoy:
 * 6 meses de ventas, cobros y cheques; presupuestos en todos los estados; entregas para hoy;
 * stock con alertas; compras en curso y conversaciones de WhatsApp.
 *
 * Todo sale de simular las mismas operaciones del sistema, así los números cierran:
 * cada factura tiene su pedido, su movimiento de stock y su cobro (o su deuda).
 */
import { formatARS } from '@/lib/format';
import { aISO, conHora, diasEntre, inicioDelDia, sumarDias, type FechaISO } from '@/lib/fechas';
import { crearAzar, type Azar } from '@/lib/prng';
import { letraPara, numeroFiscal, totales } from '@/domain/calculos';
import type {
  Actividad, Cheque, Cliente, Cobro, Comprobante, Conteo, Conversacion, DatosDemo, Entrega, MedioPago,
  MovimientoStock, OrdenCompra, Pedido, Presupuesto, Producto, Renglon,
} from '@/domain/types';
import { LISTAS, PROVEEDORES, productosIniciales } from './catalogo';
import { CLIENTES_SEED, cuitCompleto, type ClienteSeed } from './clientes';
import { CONVERSACIONES_SEED } from './conversaciones';
import { AJUSTES, EMPRESA, PLANTILLAS } from './empresa';

/** Si cambia la forma de los datos, subir este número: las demos guardadas se regeneran. */
export const ESQUEMA_DATOS = 3;

// Elegida entre varias para que las comparaciones mes a mes sean creíbles cualquier día que se abra la demo.
const SEMILLA = 20261013;
const DIAS_HISTORIA = 182;
/** Los presupuestos, pedidos y movimientos de stock se detallan solo en los últimos 60 días. */
const DIAS_DETALLE = 60;
const IVA = AJUSTES.ivaPct;

/** Números con los que termina el historial (coinciden con el diseño). */
const ULTIMO = {
  presupuesto: 997,
  pedido: 425,
  remito: 881,
  recibo: 4512,
  ordenCompra: 89,
  facturaA: 2137,
  facturaB: 897,
  notaCreditoA: 58,
  notaCreditoB: 21,
};

const BANCOS = ['Banco Nación', 'Banco Provincia', 'Banco Galicia', 'Banco Santander', 'BBVA', 'Banco Macro', 'Banco Credicoop', 'ICBC', 'Banco Supervielle', 'Banco Patagonia'];
const TARJETAS = ['Visa débito', 'Mastercard', 'Visa crédito', 'Cabal'];

const LISTA_POR_TIPO = { aberturista: 'lista-aberturistas', carpintero: 'lista-carpinteros', particular: 'lista-general' } as const;

/** Qué compra cada tipo de cliente (peso por categoría). */
const AFINIDAD: Record<Cliente['tipo'], Record<Producto['categoria'], number>> = {
  aberturista: { bisagras: 5, manijas: 4, cerraduras: 3, rieles: 4, burletes: 4, mosquiteros: 1, accesorios: 3 },
  carpintero: { bisagras: 4, manijas: 4, cerraduras: 3, rieles: 3, burletes: 3, mosquiteros: 1.5, accesorios: 2 },
  particular: { bisagras: 1, manijas: 2, cerraduras: 1.5, rieles: 1, burletes: 1.5, mosquiteros: 4, accesorios: 3 },
};

/** Cantidad típica por renglón para un aberturista, según unidad y precio. */
function cantidadBase(p: Producto): number {
  const precio = p.precioLista / 100;
  switch (p.unidad) {
    case 'u.': return precio < 5000 ? 30 : precio < 15000 ? 10 : precio < 30000 ? 4 : 2;
    case 'par': return 16;
    case 'rollo': return precio < 10000 ? 6 : 3;
    case 'tira': return 12;
    case 'kit': return 3;
    case 'caja': return 3;
    default: return 2;
  }
}

/** Los precios suben ~2,5 % por mes: una venta de hace 4 meses se hizo a precios más bajos. */
const factorPrecio = (diasAtras: number) => 1 / Math.pow(1.025, diasAtras / 30);

/** Más obra en primavera: las ventas recientes pesan un poco más. */
const estacionalidad = (diasAtras: number) => 0.82 + 0.28 * (1 - diasAtras / DIAS_HISTORIA);

interface Contexto {
  rnd: Azar;
  hoy: Date;
  ahora: Date;
  productos: Producto[];
  porId: Map<string, Producto>;
  clientes: Cliente[];
  seeds: Map<string, ClienteSeed>;
  n: { [k: string]: number };
}

function nuevoId(ctx: Contexto, prefijo: string): string {
  ctx.n[prefijo] = (ctx.n[prefijo] ?? 0) + 1;
  return `${prefijo}-${String(ctx.n[prefijo]).padStart(4, '0')}`;
}

function renglon(ctx: Contexto, p: Producto, cantidad: number, factor = 1, extra: Partial<Renglon> = {}): Renglon {
  return {
    id: nuevoId(ctx, 'r'),
    productoId: p.id,
    descripcion: p.nombre,
    cantidad,
    precioUnitario: Math.round((p.precioLista * factor) / 100) * 100,
    ...extra,
  };
}

/** Renglones de un pedido típico para ese cliente. */
function armarRenglones(ctx: Contexto, c: Cliente, seed: ClienteSeed, factor: number): Renglon[] {
  const { rnd } = ctx;
  const cuantos = c.tipo === 'particular' ? rnd.entero(1, 3) : c.tipo === 'carpintero' ? rnd.entero(2, 5) : rnd.entero(3, 7);
  const elegidos = new Set<Producto>();
  let intentos = 0;
  while (elegidos.size < cuantos && intentos++ < 40) {
    elegidos.add(rnd.ponderado(ctx.productos, (p) => AFINIDAD[c.tipo][p.categoria] * (p.stockMinimo >= 20 ? 1.6 : 1)));
  }
  return [...elegidos].map((p) => {
    const cant = Math.max(1, Math.round(cantidadBase(p) * seed.escala * 0.62 * (0.5 + rnd.next())));
    // Cantidades "redondas", como pide la gente.
    const redondo = cant >= 20 ? Math.round(cant / 5) * 5 : cant >= 10 ? Math.round(cant / 2) * 2 : cant;
    return renglon(ctx, p, redondo, factor);
  });
}

const descuentoDe = (c: Cliente) => LISTAS.find((l) => l.id === c.listaId)?.descuentoPct ?? 0;

function cae(rnd: Azar): string {
  let s = String(rnd.entero(7, 7));
  for (let i = 0; i < 13; i++) s += String(rnd.entero(0, 9));
  return s;
}

export function generarDatos(ahora = new Date(), semilla = SEMILLA): DatosDemo {
  const rnd = crearAzar(semilla);
  const hoy = inicioDelDia(ahora);
  const productos = productosIniciales();

  const seeds = new Map(CLIENTES_SEED.map((s) => [s.id, s]));
  const clientes: Cliente[] = CLIENTES_SEED.map((s) => ({
    id: s.id,
    razonSocial: s.razonSocial,
    contacto: s.contacto,
    tipo: s.tipo,
    cuit: cuitCompleto(s.cuitBase),
    condicionIVA: s.condicionIVA,
    telefono: s.telefono,
    email: s.email,
    direccion: s.direccion,
    localidad: s.localidad,
    listaId: LISTA_POR_TIPO[s.tipo],
    condicionVenta: s.condicionVenta,
    limiteCredito: s.limiteCredito * 100,
    altaEl: aISO(conHora(sumarDias(hoy, -Math.round(s.antiguedadMeses * 30.4)), 10)),
    notas: s.notas,
  }));

  const ctx: Contexto = { rnd, hoy, ahora, productos, porId: new Map(productos.map((p) => [p.id, p])), clientes, seeds, n: {} };
  const cliente = (id: string) => clientes.find((c) => c.id === id)!;
  const prod = (codigo: string) => productos.find((p) => p.codigo === codigo)!;

  const presupuestos: Presupuesto[] = [];
  const pedidos: Pedido[] = [];
  const comprobantes: Comprobante[] = [];
  const cobros: Cobro[] = [];
  const cheques: Cheque[] = [];
  const movimientos: MovimientoStock[] = [];
  const ordenes: OrdenCompra[] = [];
  const conteos: Conteo[] = [];
  const actividad: Actividad[] = [];

  /* ───────────── Helpers de documentos ───────────── */

  const crearFactura = (c: Cliente, fecha: Date, renglones: Renglon[], descuentoPct: number, pedidoId?: string): Comprobante => {
    const t = totales(renglones, descuentoPct, IVA);
    const f: Comprobante = {
      id: nuevoId(ctx, 'cmp'),
      clase: 'factura',
      letra: letraPara(c.condicionIVA),
      puntoVenta: EMPRESA.puntoVenta,
      numero: 0,
      fecha: aISO(fecha),
      clienteId: c.id,
      pedidoId,
      renglones: renglones.map((r) => ({ ...r, id: nuevoId(ctx, 'r') })),
      descuentoPct,
      neto: t.neto,
      iva: t.iva,
      total: t.total,
      cae: cae(rnd),
      caeVence: aISO(sumarDias(fecha, 10)),
      condicionVenta: c.condicionVenta,
      vencePago: aISO(sumarDias(fecha, c.condicionVenta === 'cta_cte_30' ? 30 : 2)),
    };
    comprobantes.push(f);
    return f;
  };

  const registrarVenta = (pedido: Pedido | undefined, factura: Comprobante, fecha: Date) => {
    for (const r of factura.renglones) {
      if (!r.productoId) continue;
      movimientos.push({
        id: nuevoId(ctx, 'mov'),
        productoId: r.productoId,
        fecha: aISO(fecha),
        cantidad: -r.cantidad,
        tipo: 'venta',
        referencia: pedido ? { tipo: 'pedido', id: pedido.id, numero: '' } : { tipo: 'comprobante', id: factura.id, numero: '' },
        usuario: 'Sistema',
        stockResultante: 0,
      });
    }
  };

  const crearPresupuesto = (c: Cliente, fecha: Date, renglones: Renglon[], extra: Partial<Presupuesto> = {}): Presupuesto => {
    const p: Presupuesto = {
      id: nuevoId(ctx, 'pre'),
      numero: '',
      clienteId: c.id,
      fecha: aISO(fecha),
      validoHasta: aISO(conHora(sumarDias(fecha, AJUSTES.validezPresupuestoDias), 23, 59)),
      renglones,
      descuentoPct: descuentoDe(c),
      estado: 'enviado',
      origen: rnd.chance(0.65) ? 'whatsapp' : 'manual',
      enviadoEl: aISO(new Date(fecha.getTime() + 20 * 60_000)),
      enviadoPor: 'whatsapp',
      recordatorio: { activo: true, dias: AJUSTES.recordarPresupuestoDias },
      ...extra,
    };
    if (p.estado === 'borrador') {
      delete p.enviadoEl;
      delete p.enviadoPor;
    }
    presupuestos.push(p);
    return p;
  };

  const crearPedido = (c: Cliente, fecha: Date, renglones: Renglon[], entrega: Entrega, extra: Partial<Pedido> = {}): Pedido => {
    const p: Pedido = {
      id: nuevoId(ctx, 'ped'),
      numero: '',
      clienteId: c.id,
      fecha: aISO(fecha),
      renglones: renglones.map((r) => ({ ...r, id: nuevoId(ctx, 'r') })),
      descuentoPct: descuentoDe(c),
      estado: 'confirmado',
      entrega,
      ...extra,
    };
    pedidos.push(p);
    return p;
  };

  const entregaPara = (c: Cliente, fecha: Date, estado: 'entregado' | 'pendiente'): Entrega => {
    const metodo = c.tipo === 'particular' ? (rnd.chance(0.6) ? 'retiro' : 'correo') : rnd.chance(0.85) ? 'camioneta' : rnd.chance(0.5) ? 'retiro' : 'transporte';
    const e: Entrega = {
      metodo,
      fecha: aISO(fecha),
      direccion: metodo === 'retiro' ? 'Retira en el local' : `${c.direccion}, ${c.localidad}`,
      bultos: rnd.entero(1, 6),
    };
    if (metodo === 'camioneta') e.chofer = 'Nahuel';
    if (metodo === 'correo') { e.empresa = 'Andreani'; e.tracking = `3600021${rnd.entero(10000, 99999)}`; }
    if (metodo === 'transporte') { e.empresa = rnd.elegir(['Vía Cargo', 'Expreso Lomas', 'Transporte Sur']); }
    if (estado === 'entregado') {
      e.entregadoEl = aISO(new Date(fecha.getTime() + rnd.entero(10, 90) * 60_000));
      e.recibidoPor = c.contacto.split(' ')[0];
    }
    return e;
  };

  /* ───────────── 1. Historial de ventas (6 meses) ───────────── */

  interface Venta { c: Cliente; fecha: Date; factura: Comprobante }
  const ventas: Venta[] = [];

  for (let d = DIAS_HISTORIA; d >= 1; d--) {
    const dia = sumarDias(hoy, -d);
    const dow = dia.getDay();
    if (dow === 0) continue;
    const pesoDia = dow === 6 ? 0.35 : 1;
    for (const c of clientes) {
      const seed = seeds.get(c.id)!;
      if (diasEntre(c.altaEl, dia) < 0) continue;
      // Los inactivos dejaron de comprar hace entre 100 y 150 días.
      if (seed.perfil === 'inactivo' && d < 100 + (c.id.length * 7) % 50) continue;
      const prob = (seed.frecuencia / 13) * pesoDia * estacionalidad(d);
      if (!rnd.chance(prob)) continue;

      const fecha = conHora(dia, rnd.entero(8, 16), rnd.elegir([0, 10, 15, 20, 30, 40, 45, 50]));
      const factor = factorPrecio(d);
      const renglones = armarRenglones(ctx, c, seed, factor);

      let pedido: Pedido | undefined;
      if (d <= DIAS_DETALLE) {
        const fPre = conHora(sumarDias(dia, -rnd.entero(1, 3)), rnd.entero(9, 17), rnd.elegir([5, 20, 35, 50]));
        const respondido = new Date(fPre.getTime() + rnd.entero(2, 30) * 3600_000);
        const pre = crearPresupuesto(c, fPre, renglones.map((r) => ({ ...r, id: nuevoId(ctx, 'r') })), {
          estado: 'aceptado',
          respondidoEl: aISO(respondido < fecha ? respondido : fecha),
          vistoEl: aISO(new Date(fPre.getTime() + 40 * 60_000)),
        });
        pedido = crearPedido(c, respondido < fecha ? respondido : fecha, renglones, entregaPara(c, fecha, 'entregado'), {
          presupuestoId: pre.id,
          estado: 'entregado',
          remito: { numero: '', fecha: aISO(fecha) },
        });
        pre.pedidoId = pedido.id;
      }
      const factura = crearFactura(c, fecha, renglones, descuentoDe(c), pedido?.id);
      if (pedido) pedido.comprobanteId = factura.id;
      if (d <= DIAS_DETALLE) registrarVenta(pedido, factura, fecha);
      ventas.push({ c, fecha, factura });
    }
  }

  /* Presupuestos que no se convirtieron (rechazados y vencidos) en los últimos 60 días: tasa de aceptación realista. */
  const MOTIVOS = ['Le resultó caro', 'Compró en otro lado', 'Se postergó la obra', 'Pidió otra línea'];
  for (let d = DIAS_DETALLE; d >= 10; d--) {
    if (sumarDias(hoy, -d).getDay() === 0) continue;
    for (let k = rnd.entero(1, 4); k > 0; k--) {
      const c = rnd.elegir(clientes.filter((x) => seeds.get(x.id)!.perfil !== 'inactivo'));
      const fecha = conHora(sumarDias(hoy, -d), rnd.entero(9, 17), 15);
      const ren = armarRenglones(ctx, c, seeds.get(c.id)!, factorPrecio(d));
      if (rnd.chance(0.7)) {
        crearPresupuesto(c, fecha, ren, { estado: 'rechazado', respondidoEl: aISO(sumarDias(fecha, rnd.entero(1, 4))), motivoRechazo: rnd.elegir(MOTIVOS) });
      } else {
        crearPresupuesto(c, fecha, ren, { estado: 'enviado', recordatorio: { activo: true, dias: 5, ultimoEl: aISO(sumarDias(fecha, 5)) } });
      }
    }
  }

  /* ───────────── 2. Estado actual: pedidos y entregas de hoy ───────────── */

  const h = (horas: number, min = 0) => conHora(hoy, horas, min);

  // Pedidos de hoy (los del diseño), cada uno con su presupuesto aceptado.
  interface Plan {
    cli: string; hora: [number, number]; estado: Pedido['estado']; metodo: Entrega['metodo']; facturado: boolean;
    renglones: Array<[string, number]>; empresa?: string; tracking?: string; orden?: number; bultos: number; diasPresupuesto: number;
  }
  const planHoy: Plan[] = [
    { cli: 'cli-sur', hora: [9, 30], estado: 'entregado', metodo: 'camioneta', facturado: true, orden: 1, bultos: 5, diasPresupuesto: 2,
      renglones: [['BIS-3A-BL', 40], ['BUR-6MM-R', 10], ['ROD-HR-DOB', 20], ['FEL-75-NG', 2]] },
    { cli: 'cli-rossi', hora: [10, 45], estado: 'listo', metodo: 'camioneta', facturado: true, orden: 2, bultos: 3, diasPresupuesto: 3,
      renglones: [['BIS-3A-NG', 30], ['MAN-COR-NG', 12], ['CER-TRA-01', 10], ['BUR-6MM-T', 8]] },
    { cli: 'cli-mendoza', hora: [12, 0], estado: 'en_preparacion', metodo: 'transporte', empresa: 'Vía Cargo', facturado: false, bultos: 8, diasPresupuesto: 2,
      renglones: [['RIE-HR-6M', 12], ['ROD-HR-DOB', 24], ['BIS-3A-NT', 60], ['ESC-ARM-100', 4], ['CER-EMC-02', 8], ['GUI-SUP-10', 6]] },
    { cli: 'cli-ferreyra', hora: [14, 30], estado: 'listo', metodo: 'camioneta', facturado: true, orden: 3, bultos: 2, diasPresupuesto: 1,
      renglones: [['MAN-EMB-NG', 10], ['BIS-2A-BL', 12], ['SIL-NEU-280', 3]] },
    { cli: 'cli-gomez', hora: [15, 0], estado: 'despachado', metodo: 'correo', empresa: 'Andreani', tracking: '360002148735', facturado: true, bultos: 1, diasPresupuesto: 2,
      renglones: [['MOS-ENR-150', 1], ['FEL-ADH-10', 2]] },
    { cli: 'cli-perez', hora: [16, 0], estado: 'confirmado', metodo: 'retiro', facturado: false, bultos: 1, diasPresupuesto: 1,
      renglones: [['KIT-HR-2H', 1], ['BUR-6MM-T', 4]] },
  ];

  const presupuestoSur = { id: '' };
  for (const plan of planHoy) {
    const c = cliente(plan.cli);
    const ren = plan.renglones.map(([cod, q]) => renglon(ctx, prod(cod), q));
    const fPre = conHora(sumarDias(hoy, -plan.diasPresupuesto), 10, 20);
    const pre = crearPresupuesto(c, fPre, ren.map((r) => ({ ...r, id: nuevoId(ctx, 'r') })), {
      estado: 'aceptado',
      origen: 'whatsapp',
      vistoEl: aISO(new Date(fPre.getTime() + 25 * 60_000)),
      respondidoEl: aISO(new Date(fPre.getTime() + 3 * 3600_000)),
    });
    if (plan.cli === 'cli-sur') presupuestoSur.id = pre.id;
    const fechaEntrega = h(...plan.hora);
    const entrega: Entrega = {
      metodo: plan.metodo,
      fecha: aISO(fechaEntrega),
      direccion: plan.metodo === 'retiro' ? 'Retira en el local' : plan.metodo === 'transporte' ? `Depósito ${plan.empresa} · despacho a ${c.localidad}` : `${c.direccion}, ${c.localidad}`,
      bultos: plan.bultos,
      empresa: plan.empresa,
      tracking: plan.tracking,
      chofer: plan.metodo === 'camioneta' ? 'Nahuel' : undefined,
      orden: plan.orden,
    };
    if (plan.estado === 'entregado') {
      entrega.entregadoEl = aISO(new Date(fechaEntrega.getTime() + 11 * 60_000));
      entrega.recibidoPor = 'Gustavo';
    }
    const pedido = crearPedido(c, new Date(fPre.getTime() + 3 * 3600_000), ren, entrega, {
      presupuestoId: pre.id,
      estado: plan.estado,
      remito: plan.estado === 'confirmado' || plan.estado === 'en_preparacion' ? undefined : { numero: '', fecha: aISO(sumarDias(fechaEntrega, plan.estado === 'entregado' ? 0 : -1)) },
    });
    pre.pedidoId = pedido.id;
    if (plan.facturado) {
      const fFac = conHora(sumarDias(hoy, -1), 17, 10);
      const f = crearFactura(c, fFac, ren, pedido.descuentoPct, pedido.id);
      pedido.comprobanteId = f.id;
      registrarVenta(pedido, f, fFac);
      ventas.push({ c, fecha: fFac, factura: f });
      if (c.condicionVenta === 'contado') {
        if (plan.cli === 'cli-ferreyra') pedido.entrega.cobrarAlEntregar = f.total;
      }
    } else if (c.condicionVenta === 'contado') {
      pedido.entrega.cobrarAlEntregar = totales(ren, pedido.descuentoPct, IVA).total;
    }
  }

  // Pedido listo para facturar (el del diseño de factura) y pedidos para los próximos días.
  const planProximos: Array<{ cli: string; dias: number; hora: [number, number]; estado: Pedido['estado']; renglones: Array<[string, number]> }> = [
    { cli: 'cli-castelli', dias: 1, hora: [10, 0], estado: 'listo', renglones: [['BIS-3A-NG', 60], ['MAN-DBM-BL', 20], ['ROD-HR-DOB', 24], ['BUR-8MM-R', 6], ['CER-EMC-02', 6], ['ESC-AL-20', 2]] },
    { cli: 'cli-turdera', dias: 1, hora: [11, 30], estado: 'en_preparacion', renglones: [['BIS-MOD-NG', 24], ['RIE-MOD-6M', 6], ['ROD-MOD-DOB', 12], ['MAN-DBM-NG', 10]] },
    { cli: 'cli-medina', dias: 2, hora: [9, 30], estado: 'confirmado', renglones: [['MAN-COR-BL', 20], ['CER-GAN-BL', 12], ['BIS-2A-BL', 24]] },
  ];
  for (const plan of planProximos) {
    const c = cliente(plan.cli);
    const ren = plan.renglones.map(([cod, q]) => renglon(ctx, prod(cod), q));
    const fPre = conHora(sumarDias(hoy, -2), 11, 40);
    const pre = crearPresupuesto(c, fPre, ren.map((r) => ({ ...r, id: nuevoId(ctx, 'r') })), {
      estado: 'aceptado', origen: 'whatsapp', vistoEl: aISO(new Date(fPre.getTime() + 15 * 60_000)), respondidoEl: aISO(conHora(sumarDias(hoy, -1), 9, 10)),
    });
    const pedido = crearPedido(c, conHora(sumarDias(hoy, -1), 9, 15), ren, {
      metodo: 'camioneta', fecha: aISO(conHora(sumarDias(hoy, plan.dias), ...plan.hora)), direccion: `${c.direccion}, ${c.localidad}`, bultos: rnd.entero(3, 7), chofer: 'Nahuel',
    }, { presupuestoId: pre.id, estado: plan.estado, remito: plan.estado === 'listo' ? { numero: '', fecha: aISO(h(8, 30)) } : undefined });
    pre.pedidoId = pedido.id;
  }

  /* ───────────── 3. Presupuestos abiertos (todos los estados) ───────────── */

  const P = (cli: string, diasAtras: number, hora: [number, number], ren: Array<[string, number]>, extra: Partial<Presupuesto> = {}) => {
    const fecha = conHora(sumarDias(hoy, -diasAtras), ...hora);
    return crearPresupuesto(cliente(cli), fecha, ren.map(([cod, q]) => renglon(ctx, prod(cod), q)), extra);
  };

  // Vencidos sin respuesta (alertas del panel).
  P('cli-perez', 8, [11, 5], [['KIT-HR-2H', 2], ['BUR-6MM-R', 1]], { origen: 'whatsapp', conversacionId: 'conv-perez', vistoEl: aISO(conHora(sumarDias(hoy, -8), 12, 40)) });
  P('cli-rossi', 9, [16, 20], [['BIS-3A-NG', 40], ['MAN-DBM-BL', 12], ['CER-EMC-01', 6], ['ROD-HR-DOB', 10], ['BUR-6MM-R', 3]], { origen: 'whatsapp', vistoEl: aISO(conHora(sumarDias(hoy, -9), 18, 12)) });
  // Enviados esperando respuesta.
  P('cli-mendoza', 3, [9, 50], [['RIE-HR-6M', 20], ['ROD-HR-DOB', 40], ['BIS-3A-NG', 120], ['CER-EMC-02', 10], ['BUR-6MM-R', 8], ['ESC-ARM-100', 6]], { origen: 'manual', enviadoPor: 'email' });
  P('cli-sur', 2, [15, 30], [['BIS-3A-NG', 80], ['MAN-DBM-BL', 24], ['ROD-HR-DOB', 30], ['CER-EMC-02', 8], ['BUR-8MM-R', 4]], { origen: 'whatsapp', vistoEl: aISO(conHora(sumarDias(hoy, -2), 18, 12)) });
  P('cli-gomez', 1, [12, 10], [['MOS-ENR-120', 2], ['MOS-COR-120', 1]], { origen: 'whatsapp' });
  const preRoble = P('cli-roble', 1, [10, 40], [['KIT-HR-2H', 3], ['BIS-2A-BL', 20], ['SIL-NEU-280', 2]], { origen: 'whatsapp', conversacionId: 'conv-roble', vistoEl: aISO(conHora(sumarDias(hoy, -1), 11, 0)) });
  // Borradores.
  P('cli-quilmes', 0, [8, 40], [['BIS-3A-BL', 30], ['MAN-COR-BL', 16]], { estado: 'borrador', origen: 'manual', recordatorio: { activo: false, dias: 5 } });
  P('cli-banfield', 1, [17, 15], [['RIE-AL-3M', 10], ['ROD-HR-SIM', 20], ['TAP-DES-100', 2]], { estado: 'borrador', origen: 'manual', recordatorio: { activo: false, dias: 5 } });
  // Rechazados recientes.
  P('cli-lanus', 6, [10, 0], [['CER-MUL-01', 2], ['MAN-PUE-NG', 4]], { estado: 'rechazado', respondidoEl: aISO(conHora(sumarDias(hoy, -4), 9, 30)), motivoRechazo: 'Le resultó caro' });
  P('cli-coop', 12, [14, 0], [['MOS-TEL-FV', 2], ['MOS-PER-6M', 10], ['MOS-ESQ-04', 20]], { estado: 'rechazado', respondidoEl: aISO(conHora(sumarDias(hoy, -10), 11, 0)), motivoRechazo: 'Se postergó la obra' });

  const prePerez = presupuestos.find((p) => p.conversacionId === 'conv-perez')!;

  /* ───────────── 4. Cobranzas ───────────── */

  // Qué facturas quedan impagas según el perfil del cliente.
  const pagoDe = new Map<string, Date | null>();
  for (const v of ventas) {
    const edad = diasEntre(v.fecha, hoy);
    if (v.c.condicionVenta === 'contado') {
      // Contado: se cobra al entregar (salvo lo que se entrega hoy).
      pagoDe.set(v.factura.id, edad >= 1 && !(v.c.id === 'cli-ferreyra' && edad <= 1) ? v.fecha : null);
      continue;
    }
    const dias = rnd.entero(12, 32);
    const pago = sumarDias(v.fecha, dias);
    pagoDe.set(v.factura.id, diasEntre(pago, hoy) >= 1 ? pago : null);
  }
  // Clientes con deuda: se elige qué facturas quedan impagas (la más cercana a cada antigüedad buscada).
  const dejarImpaga = (clienteId: string, edadBuscada: number, min: number, max: number) => {
    const cand = ventas
      .filter((v) => v.c.id === clienteId && pagoDe.get(v.factura.id) !== null)
      .map((v) => ({ v, edad: diasEntre(v.fecha, hoy) }))
      .filter((x) => x.edad >= min && x.edad <= max)
      .sort((a, b) => Math.abs(a.edad - edadBuscada) - Math.abs(b.edad - edadBuscada))[0];
    if (cand) pagoDe.set(cand.v.factura.id, null);
  };
  for (const c of clientes) {
    const perfil = seeds.get(c.id)!.perfil;
    if (perfil === 'deuda_vencida') dejarImpaga(c.id, 42, 32, 58);
    if (perfil === 'deuda_critica') { dejarImpaga(c.id, 72, 61, 95); dejarImpaga(c.id, 40, 32, 58); }
  }
  // Las de cta. cte. de "al día" que ya vencieron se pagan sí o sí (ayer como máximo).
  for (const v of ventas) {
    const seed = seeds.get(v.c.id)!;
    if (v.c.condicionVenta !== 'cta_cte_30' || seed.perfil !== 'al_dia') continue;
    if (pagoDe.get(v.factura.id) === null && diasEntre(v.factura.vencePago, hoy) > 0) pagoDe.set(v.factura.id, sumarDias(hoy, -1));
  }

  // Agrupar pagos del mismo cliente en la misma semana en un solo recibo.
  const grupos = new Map<string, { c: Cliente; fecha: Date; facturas: Comprobante[] }>();
  for (const v of ventas) {
    const pago = pagoDe.get(v.factura.id);
    if (!pago) continue;
    const semana = Math.floor(diasEntre(hoy, pago) / 7);
    const k = `${v.c.id}|${v.c.condicionVenta === 'contado' ? v.factura.id : semana}`;
    const g = grupos.get(k);
    if (g) {
      g.facturas.push(v.factura);
      if (pago > g.fecha) g.fecha = pago;
    } else grupos.set(k, { c: v.c, fecha: pago, facturas: [v.factura] });
  }

  for (const g of [...grupos.values()].sort((a, b) => a.fecha.getTime() - b.fecha.getTime())) {
    const total = g.facturas.reduce((a, f) => a + f.total, 0);
    const fecha = conHora(g.fecha, rnd.entero(9, 17), rnd.elegir([0, 15, 30, 45]));
    const id = nuevoId(ctx, 'cob');
    const medios: MedioPago[] = [];
    const r = rnd.next();
    if (g.c.tipo === 'particular') {
      if (r < 0.5) medios.push({ tipo: 'efectivo', importe: total });
      else if (r < 0.8) medios.push({ tipo: 'transferencia', importe: total, banco: rnd.elegir(BANCOS), operacion: String(rnd.entero(10000000, 99999999)) });
      else medios.push({ tipo: 'tarjeta', importe: total, tarjeta: rnd.elegir(TARJETAS), cuotas: rnd.elegir([1, 1, 3, 6]), cupon: String(rnd.entero(1000, 9999)) });
    } else if (g.c.tipo === 'carpintero' && r < 0.45) {
      medios.push({ tipo: 'efectivo', importe: total });
    } else if (r < (g.c.tipo === 'aberturista' ? 0.5 : 0.85) || total < 15_000_000) {
      medios.push({ tipo: 'transferencia', importe: total, banco: rnd.elegir(BANCOS), operacion: String(rnd.entero(10000000, 99999999)) });
    } else {
      // Uno o dos cheques diferidos.
      const partes = total > 80_000_000 && rnd.chance(0.6) ? 2 : 1;
      let resto = total;
      for (let i = 0; i < partes; i++) {
        const importe = i === partes - 1 ? resto : Math.round(total / partes / 100) * 100;
        resto -= importe;
        const cobroEl = sumarDias(fecha, rnd.entero(i === 0 ? 0 : 15, 45));
        const banco = rnd.elegir(BANCOS);
        const chq: Cheque = {
          id: nuevoId(ctx, 'chq'),
          banco,
          numero: String(rnd.entero(10000000, 99999999)),
          librador: g.c.razonSocial,
          cuitLibrador: g.c.cuit,
          importe,
          emitidoEl: aISO(conHora(fecha, 9)),
          cobroEl: aISO(conHora(cobroEl, 9)),
          estado: 'en_cartera',
          clienteId: g.c.id,
          cobroId: id,
          echeq: rnd.chance(0.55),
        };
        const diasHastaCobro = diasEntre(hoy, cobroEl);
        if (diasHastaCobro < -2) {
          if (rnd.chance(0.12)) { chq.estado = 'endosado'; chq.destino = rnd.elegir(PROVEEDORES).razonSocial; }
          else { chq.estado = 'depositado'; chq.destino = 'Banco Galicia · cta. cte. DALAMA'; }
        }
        cheques.push(chq);
        medios.push({ tipo: 'cheque', importe, chequeId: chq.id });
      }
    }
    cobros.push({ id, numero: '', clienteId: g.c.id, fecha: aISO(fecha), medios, imputaciones: g.facturas.map((f) => ({ comprobanteId: f.id, importe: f.total })), total });
  }

  // Un pago parcial a cuenta (Aberturas del Sur, como en el diseño).
  const impagaSur = comprobantes.filter((f) => f.clienteId === 'cli-sur' && f.clase === 'factura' && !pagoDe.get(f.id)).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (impagaSur) {
    const importe = Math.round(impagaSur.total * 0.35 / 10000) * 10000;
    cobros.push({
      id: nuevoId(ctx, 'cob'), numero: '', clienteId: 'cli-sur', fecha: aISO(conHora(sumarDias(hoy, -12), 11, 20)),
      medios: [{ tipo: 'transferencia', importe, banco: 'Banco Provincia', operacion: '48213377' }],
      imputaciones: [{ comprobanteId: impagaSur.id, importe }], total: importe, notas: 'Pago a cuenta',
    });
  }

  /* ───────────── 5. Notas de crédito (devoluciones) ───────────── */

  const candidatasNC = comprobantes.filter((f) => f.clase === 'factura' && diasEntre(f.fecha, hoy) > 20 && diasEntre(f.fecha, hoy) < 150 && pagoDe.get(f.id));
  for (const f of rnd.muestra(candidatasNC, 4)) {
    const r = f.renglones[0];
    const cant = Math.max(1, Math.round(r.cantidad * 0.25));
    const ren = [{ ...r, id: nuevoId(ctx, 'r'), cantidad: cant }];
    const t = totales(ren, f.descuentoPct, IVA);
    const fecha = sumarDias(deISOlocal(f.fecha), rnd.entero(2, 8));
    comprobantes.push({
      ...f, id: nuevoId(ctx, 'cmp'), clase: 'nota_credito', numero: 0, fecha: aISO(fecha), asociadoId: f.id, pedidoId: undefined,
      renglones: ren, neto: t.neto, iva: t.iva, total: t.total, cae: cae(rnd), caeVence: aISO(sumarDias(fecha, 10)), vencePago: aISO(fecha),
      motivo: rnd.elegir(['Devolución por falla', 'Error en el color', 'Devolución de sobrante']), reingresaStock: true,
    });
    // La NC se paga con saldo a favor: se descuenta del cobro de esa factura.
    const cobro = cobros.find((c) => c.imputaciones.some((i) => i.comprobanteId === f.id));
    if (cobro) {
      // El cliente pagó la factura entera: la NC queda como crédito, que se usa en su próximo cobro.
      const siguiente = cobros.find((c) => c.clienteId === f.clienteId && c.fecha > aISO(fecha) && c.total > t.total);
      if (siguiente) {
        siguiente.total -= t.total;
        const m = siguiente.medios[siguiente.medios.length - 1];
        m.importe -= t.total;
        if (m.tipo === 'cheque') { const ch = cheques.find((x) => x.id === m.chequeId); if (ch) ch.importe -= t.total; }
      }
    }
  }

  /* ───────────── 6. Compras y movimientos de stock ───────────── */

  // Reposiciones de los últimos 60 días: una orden por proveedor cada ~2 semanas.
  for (const prov of PROVEEDORES) {
    for (let d = DIAS_DETALLE - rnd.entero(0, 6); d > 12; d -= rnd.entero(12, 17)) {
      const fecha = conHora(sumarDias(hoy, -d), 10, 0);
      const llega = sumarDias(fecha, prov.plazoEntregaDias);
      const items = productos.filter((p) => p.proveedorId === prov.id && p.stockMinimo > 0 && rnd.chance(0.55));
      if (!items.length) continue;
      const oc: OrdenCompra = {
        id: nuevoId(ctx, 'oc'), numero: '', proveedorId: prov.id, fecha: aISO(fecha), estado: 'recibida',
        renglones: items.map((p) => { const q = Math.max(4, Math.round(p.stockMinimo * (0.8 + rnd.next()) / 2) * 2); return { productoId: p.id, cantidad: q, costo: p.costo, recibido: q }; }),
        llegaEl: aISO(llega), recibidaEl: aISO(conHora(llega, 11, 30)), remitoProveedor: `R ${rnd.entero(1, 9)}-${rnd.entero(10000, 99999)}`,
      };
      ordenes.push(oc);
      for (const r of oc.renglones) {
        movimientos.push({ id: nuevoId(ctx, 'mov'), productoId: r.productoId, fecha: oc.recibidaEl!, cantidad: r.recibido, tipo: 'ingreso', referencia: { tipo: 'orden_compra', id: oc.id, numero: '' }, usuario: 'Nahuel R.', stockResultante: 0 });
      }
    }
  }

  // Las tres órdenes del diseño: recibida ayer, enviada que llega hoy y enviada que llega en unos días.
  const oc87: OrdenCompra = {
    id: nuevoId(ctx, 'oc'), numero: '', proveedorId: 'prov-plata', fecha: aISO(conHora(sumarDias(hoy, -6), 10)), estado: 'recibida',
    renglones: [['BIS-3A-NG', 240], ['BIS-3A-BL', 120], ['MAN-DBM-BL', 30], ['CER-EMC-02', 20]].map(([cod, q]) => ({ productoId: prod(cod as string).id, cantidad: q as number, costo: prod(cod as string).costo, recibido: q as number })),
    llegaEl: aISO(conHora(sumarDias(hoy, -1), 14)), recibidaEl: aISO(conHora(sumarDias(hoy, -1), 14, 20)), remitoProveedor: 'R 0004-00018872',
  };
  const oc88: OrdenCompra = {
    id: nuevoId(ctx, 'oc'), numero: '', proveedorId: 'prov-aluplast', fecha: aISO(conHora(sumarDias(hoy, -2), 11)), estado: 'enviada',
    renglones: [['ROD-MOD-SIM', 80], ['ROD-MOD-DOB', 40], ['TOP-GOM-50', 30], ['GUI-SUP-10', 30]].map(([cod, q]) => ({ productoId: prod(cod as string).id, cantidad: q as number, costo: prod(cod as string).costo, recibido: 0 })),
    llegaEl: aISO(conHora(sumarDias(hoy, 5), 12)),
  };
  const oc89: OrdenCompra = {
    id: nuevoId(ctx, 'oc'), numero: '', proveedorId: 'prov-ferrari', fecha: aISO(conHora(sumarDias(hoy, -6), 9, 30)), estado: 'enviada',
    renglones: [['ESC-AL-20', 200], ['MAN-COR-NG', 120], ['CER-GAN-NG', 60], ['TOR-AUT-1000', 20], ['REM-POP-1000', 12]].map(([cod, q]) => ({ productoId: prod(cod as string).id, cantidad: q as number, costo: prod(cod as string).costo, recibido: 0 })),
    llegaEl: aISO(conHora(hoy, 15)),
  };
  ordenes.push(oc87, oc88, oc89);
  for (const r of oc87.renglones) {
    movimientos.push({ id: nuevoId(ctx, 'mov'), productoId: r.productoId, fecha: oc87.recibidaEl!, cantidad: r.recibido, tipo: 'ingreso', referencia: { tipo: 'orden_compra', id: oc87.id, numero: '' }, usuario: 'Nahuel R.', stockResultante: 0 });
  }

  // Ajustes manuales.
  movimientos.push({ id: nuevoId(ctx, 'mov'), productoId: prod('MAN-MOD-NG').id, fecha: aISO(conHora(sumarDias(hoy, -7), 17, 40)), cantidad: -3, tipo: 'ajuste', motivo: 'Rotura en el depósito', usuario: 'Nahuel R.', stockResultante: 0 });
  movimientos.push({ id: nuevoId(ctx, 'mov'), productoId: prod('SIL-NEU-280').id, fecha: aISO(conHora(sumarDias(hoy, -19), 12, 5)), cantidad: -2, tipo: 'ajuste', motivo: 'Vencidos', usuario: 'Laura V.', stockResultante: 0 });

  // Último conteo: estantes A a C, hace 16 días, con diferencias.
  const fechaConteo = conHora(sumarDias(hoy, -16), 16, 30);
  for (const estante of ['A', 'B', 'C']) {
    const items = productos.filter((p) => p.ubicacion.startsWith(estante)).map((p) => {
      const dif = rnd.chance(0.3) ? rnd.elegir([-4, -2, -2, -1, -1, 1, 2]) : 0;
      return { productoId: p.id, sistema: 0, contado: 0, dif };
    });
    const conteo: Conteo = { id: nuevoId(ctx, 'cnt'), fecha: aISO(fechaConteo), estante: `Estante ${estante}`, items: [], estado: 'cerrado', usuario: 'Nahuel R.' };
    for (const it of items) {
      conteo.items.push({ productoId: it.productoId, sistema: 0, contado: it.dif });
      if (it.dif !== 0) {
        movimientos.push({ id: nuevoId(ctx, 'mov'), productoId: it.productoId, fecha: aISO(fechaConteo), cantidad: it.dif, tipo: 'conteo', motivo: `Diferencia de conteo · estante ${estante}`, referencia: { tipo: 'conteo', id: conteo.id, numero: `Estante ${estante}` }, usuario: 'Nahuel R.', stockResultante: 0 });
      }
    }
    conteos.push(conteo);
  }

  // Stock resultante: se recorre hacia atrás desde el stock actual.
  // Si deshacer un ingreso dejaría stock negativo, ese ingreso se achica (el historial tiene que cerrar).
  movimientos.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
  const corriente = new Map(productos.map((p) => [p.id, p.stock]));
  for (const m of movimientos) {
    const actual = corriente.get(m.productoId)!;
    m.stockResultante = actual;
    let anterior = actual - m.cantidad;
    if (anterior < 0) {
      m.cantidad = actual;
      anterior = 0;
      if (m.tipo === 'ingreso' && m.referencia) {
        const oc = ordenes.find((o) => o.id === m.referencia!.id);
        const r = oc?.renglones.find((x) => x.productoId === m.productoId);
        if (r) { r.cantidad = m.cantidad; r.recibido = m.cantidad; }
      }
    }
    corriente.set(m.productoId, anterior);
  }
  // Completar el conteo con el stock del sistema de ese día.
  for (const c of conteos) {
    for (const it of c.items) {
      const dif = it.contado;
      const movTrasConteo = movimientos.filter((m) => m.productoId === it.productoId && m.fecha > c.fecha);
      const stockConteo = movTrasConteo.length ? movTrasConteo[movTrasConteo.length - 1].stockResultante - movTrasConteo[movTrasConteo.length - 1].cantidad : ctx.porId.get(it.productoId)!.stock;
      it.contado = Math.max(0, stockConteo);
      it.sistema = Math.max(0, stockConteo - dif);
    }
  }
  const sinCambios = movimientos.filter((m) => m.cantidad !== 0);
  movimientos.length = 0;
  movimientos.push(...sinCambios);

  /* ───────────── 7. Numeración (termina en los números del diseño) ───────────── */

  const numerar = <T extends { fecha: FechaISO; id: string }>(lista: T[], ultimo: number, asignar: (x: T, n: number) => void) => {
    const orden = [...lista].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id.localeCompare(b.id));
    const base = ultimo - orden.length + 1;
    orden.forEach((x, i) => asignar(x, base + i));
  };
  const pad4 = (n: number) => String(n).padStart(4, '0');

  // Los presupuestos y pedidos de hoy en adelante se numeran después del historial.
  numerar(presupuestos, ULTIMO.presupuesto, (p, n) => { p.numero = `P-${pad4(n)}`; });
  numerar(pedidos, ULTIMO.pedido, (p, n) => { p.numero = `PED-${pad4(n)}`; });
  const conRemito = pedidos.filter((p) => p.remito);
  numerar(conRemito.map((p) => ({ id: p.id, fecha: p.remito!.fecha, p })), ULTIMO.remito, (x, n) => { x.p.remito!.numero = `R ${numeroFiscal(EMPRESA.puntoVentaRemito, n)}`; });
  numerar(cobros, ULTIMO.recibo, (c, n) => { c.numero = `RC ${numeroFiscal(1, n)}`; });
  numerar(ordenes, ULTIMO.ordenCompra, (o, n) => { o.numero = `OC-${pad4(n)}`; });
  numerar(comprobantes.filter((c) => c.clase === 'factura' && c.letra === 'A'), ULTIMO.facturaA, (c, n) => { c.numero = n; });
  numerar(comprobantes.filter((c) => c.clase === 'factura' && c.letra === 'B'), ULTIMO.facturaB, (c, n) => { c.numero = n; });
  numerar(comprobantes.filter((c) => c.clase === 'nota_credito' && c.letra === 'A'), ULTIMO.notaCreditoA, (c, n) => { c.numero = n; });
  numerar(comprobantes.filter((c) => c.clase === 'nota_credito' && c.letra === 'B'), ULTIMO.notaCreditoB, (c, n) => { c.numero = n; });

  // Referencias de los movimientos de stock con su número ya asignado.
  const pedPorId = new Map(pedidos.map((p) => [p.id, p]));
  const ocPorId = new Map(ordenes.map((o) => [o.id, o]));
  const cmpPorId = new Map(comprobantes.map((c) => [c.id, c]));
  for (const m of movimientos) {
    if (!m.referencia) continue;
    if (m.referencia.tipo === 'pedido') m.referencia.numero = pedPorId.get(m.referencia.id)?.numero ?? '';
    if (m.referencia.tipo === 'orden_compra') m.referencia.numero = ocPorId.get(m.referencia.id)?.numero ?? '';
    if (m.referencia.tipo === 'comprobante') {
      const c = cmpPorId.get(m.referencia.id);
      m.referencia.numero = c ? `${c.letra} ${numeroFiscal(c.puntoVenta, c.numero)}` : '';
    }
  }

  /* ───────────── 8. Conversaciones de WhatsApp ───────────── */

  const presupuestoDe = { roble: preRoble, sur: presupuestos.find((p) => p.id === presupuestoSur.id)!, perez: prePerez };
  const conversaciones: Conversacion[] = CONVERSACIONES_SEED.map((s) => {
    const pre = s.presupuesto ? presupuestoDe[s.presupuesto] : undefined;
    if (pre) {
      pre.conversacionId = s.id;
      pre.origen = 'whatsapp';
    }
    return {
      id: s.id,
      telefono: s.telefono,
      contacto: s.contacto,
      clienteId: s.clienteId,
      estado: s.estado,
      presupuestoId: pre?.id,
      mensajes: s.mensajes.map((m, i) => {
        const fecha = new Date(ahora.getTime() - m.minutosAtras * 60_000);
        return {
          id: `${s.id}-m${i + 1}`,
          de: m.de,
          texto: m.texto,
          fecha: aISO(fecha),
          leido: s.estado !== 'nuevo',
          adjunto: m.adjuntaPresupuesto && pre ? { tipo: 'presupuesto' as const, id: pre.id, nombre: `Presupuesto ${pre.numero}.pdf` } : undefined,
        };
      }),
    };
  });

  /* ───────────── 9. Actividad reciente ───────────── */

  const act = (min: number, tipo: Actividad['tipo'], titulo: string, detalle?: string, ruta?: string) =>
    actividad.push({ id: nuevoId(ctx, 'act'), fecha: aISO(new Date(ahora.getTime() - min * 60_000)), tipo, titulo, detalle, ruta });
  const pedSur = pedidos.find((p) => p.clienteId === 'cli-sur' && p.estado === 'entregado' && diasEntre(p.entrega.fecha, hoy) === 0);
  if (pedSur) act(Math.max(5, Math.round((ahora.getTime() - deISOlocal(pedSur.entrega.entregadoEl!).getTime()) / 60_000)), 'entrega', `Pedido ${pedSur.numero} entregado`, 'Aberturas del Sur S.R.L. · recibió Gustavo', `/pedidos/${pedSur.id}`);
  act(18, 'mensaje', 'Nuevo pedido por WhatsApp', 'Martín Rossi · Carpintería Rossi', '/whatsapp/conv-rossi');
  act(47, 'mensaje', 'Nuevo pedido por WhatsApp', 'Fer Ruiz · Aberturas Quilmes S.R.L.', '/whatsapp/conv-quilmes');
  const ultCobro = [...cobros].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  if (ultCobro) act(60 * 20, 'cobro', `Cobro ${ultCobro.numero} registrado`, `${cliente(ultCobro.clienteId).razonSocial} · ${formatARS(ultCobro.total)}`, `/cuentas/${ultCobro.clienteId}`);
  act(60 * 22, 'stock', `${oc87.numero} recibida`, 'Herrajes del Plata S.A. · se sumó al stock', '/compras');

  /* ───────────── Resultado ───────────── */

  const sig = (lista: number[]) => (lista.length ? Math.max(...lista) : 0) + 1;
  const numsLetra = (clase: Comprobante['clase'], letra: Comprobante['letra']) => comprobantes.filter((c) => c.clase === clase && c.letra === letra).map((c) => c.numero);

  return {
    esquema: ESQUEMA_DATOS,
    generadoEl: aISO(ahora),
    empresa: { ...EMPRESA, inicioActividades: aISO(new Date(2016, 2, 1, 9)) },
    ajustes: { ...AJUSTES },
    listas: LISTAS.map((l) => ({ ...l })),
    proveedores: PROVEEDORES.map((p) => ({ ...p })),
    productos,
    clientes,
    presupuestos: presupuestos.sort((a, b) => b.fecha.localeCompare(a.fecha)),
    pedidos: pedidos.sort((a, b) => b.fecha.localeCompare(a.fecha)),
    comprobantes: comprobantes.sort((a, b) => b.fecha.localeCompare(a.fecha)),
    cobros: cobros.sort((a, b) => b.fecha.localeCompare(a.fecha)),
    cheques: cheques.sort((a, b) => a.cobroEl.localeCompare(b.cobroEl)),
    movimientosStock: movimientos,
    conteos,
    ordenesCompra: ordenes.sort((a, b) => b.fecha.localeCompare(a.fecha)),
    conversaciones,
    plantillas: PLANTILLAS.map((p) => ({ ...p })),
    actividad: actividad.sort((a, b) => b.fecha.localeCompare(a.fecha)),
    secuencias: {
      presupuesto: ULTIMO.presupuesto + 1,
      pedido: ULTIMO.pedido + 1,
      remito: ULTIMO.remito + 1,
      recibo: ULTIMO.recibo + 1,
      ordenCompra: ULTIMO.ordenCompra + 1,
      factura: { A: sig(numsLetra('factura', 'A')), B: sig(numsLetra('factura', 'B')), C: 1 },
      notaCredito: { A: sig(numsLetra('nota_credito', 'A')), B: sig(numsLetra('nota_credito', 'B')), C: 1 },
    },
  };
}

function deISOlocal(iso: FechaISO): Date {
  return new Date(iso);
}
