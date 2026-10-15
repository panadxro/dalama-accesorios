/**
 * Modelo de datos del sistema DALAMA.
 * Pensado para trasladarse al sistema real: cada entidad tiene id estable, fechas ISO y montos en centavos.
 * Lo que se puede calcular (saldos, estados vencidos, cuenta corriente) no se guarda: se deriva en domain/calculos.ts.
 */
import type { Centavos } from '@/lib/format';
import type { FechaISO } from '@/lib/fechas';

export type { Centavos, FechaISO };
export type ID = string;

/* ───────────── Catálogo ───────────── */

export type Categoria = 'bisagras' | 'manijas' | 'cerraduras' | 'rieles' | 'burletes' | 'mosquiteros' | 'accesorios';

export type Linea = 'Herrero' | 'Módena' | 'A30' | 'Universal';

export type Unidad = 'u.' | 'par' | 'rollo' | 'tira' | 'kit' | 'caja' | 'm²';

export interface Proveedor {
  id: ID;
  razonSocial: string;
  cuit: string;
  contacto: string;
  telefono: string;
  email: string;
  /** Días que tarda en entregar desde que se envía la orden. */
  plazoEntregaDias: number;
  rubro: string;
}

export interface Producto {
  id: ID;
  codigo: string;
  nombre: string;
  categoria: Categoria;
  /** Agrupa variantes (mismo producto en otro color o medida). */
  familia: string;
  atributos: { color?: string; medida?: string; linea?: Linea };
  unidad: Unidad;
  /** Costo de reposición, sin IVA. */
  costo: Centavos;
  /** Precio de lista general, sin IVA. */
  precioLista: Centavos;
  proveedorId: ID;
  stock: number;
  stockMinimo: number;
  /** Estante del depósito: "A-03". */
  ubicacion: string;
  /** Cómo lo pide la gente: lo usa la interpretación de pedidos. */
  sinonimos: string[];
  activo: boolean;
}

export interface ListaPrecios {
  id: ID;
  nombre: string;
  /** Descuento sobre la lista general, en %. */
  descuentoPct: number;
}

/* ───────────── Clientes ───────────── */

export type CondicionIVA = 'RI' | 'MONOTRIBUTO' | 'CF' | 'EXENTO';
export type TipoCliente = 'aberturista' | 'carpintero' | 'particular';
export type CondicionVenta = 'contado' | 'cta_cte_30';

export interface Cliente {
  id: ID;
  razonSocial: string;
  /** Persona con la que se habla. */
  contacto: string;
  tipo: TipoCliente;
  cuit: string;
  condicionIVA: CondicionIVA;
  telefono: string;
  email: string;
  direccion: string;
  localidad: string;
  listaId: ID;
  condicionVenta: CondicionVenta;
  limiteCredito: Centavos;
  altaEl: FechaISO;
  notas?: string;
}

/* ───────────── Documentos comerciales ───────────── */

/** Renglón de presupuesto, pedido o comprobante. */
export interface Renglon {
  id: ID;
  /** null = producto no identificado (lo eligen a mano). */
  productoId: ID | null;
  descripcion: string;
  cantidad: number;
  /** Precio de lista unitario, sin IVA, antes del descuento del documento. */
  precioUnitario: Centavos;
  /** Texto del mensaje del que salió el renglón (presupuestos por IA). */
  textoOriginal?: string;
  /** 0 a 1: qué tan segura estuvo la interpretación. */
  confianza?: number;
}

export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado';
/** El estado "vencido" no se guarda: es un enviado cuya validez ya pasó. */
export type EstadoPresupuestoVisible = EstadoPresupuesto | 'vencido';

export type Canal = 'whatsapp' | 'email' | 'mostrador';

export interface Presupuesto {
  id: ID;
  numero: string;
  clienteId: ID;
  fecha: FechaISO;
  validoHasta: FechaISO;
  renglones: Renglon[];
  descuentoPct: number;
  estado: EstadoPresupuesto;
  origen: 'whatsapp' | 'manual';
  conversacionId?: ID;
  enviadoEl?: FechaISO;
  enviadoPor?: Canal;
  vistoEl?: FechaISO;
  respondidoEl?: FechaISO;
  motivoRechazo?: string;
  recordatorio: { activo: boolean; dias: number; ultimoEl?: FechaISO };
  pedidoId?: ID;
  notas?: string;
}

export type EstadoPedido = 'confirmado' | 'en_preparacion' | 'listo' | 'despachado' | 'entregado' | 'cancelado';

export type MetodoEntrega = 'camioneta' | 'retiro' | 'transporte' | 'correo';

export interface Entrega {
  metodo: MetodoEntrega;
  /** Fecha y hora programadas. */
  fecha: FechaISO;
  direccion: string;
  /** Transporte o correo: "Vía Cargo", "Andreani". */
  empresa?: string;
  tracking?: string;
  bultos: number;
  chofer?: string;
  /** Orden en el recorrido de la camioneta. */
  orden?: number;
  /** Monto a cobrar al entregar (contado). */
  cobrarAlEntregar?: Centavos;
  entregadoEl?: FechaISO;
  recibidoPor?: string;
}

export interface Pedido {
  id: ID;
  numero: string;
  clienteId: ID;
  presupuestoId?: ID;
  fecha: FechaISO;
  renglones: Renglon[];
  descuentoPct: number;
  estado: EstadoPedido;
  entrega: Entrega;
  remito?: { numero: string; fecha: FechaISO };
  comprobanteId?: ID;
  notas?: string;
}

/* ───────────── Facturación ───────────── */

export type LetraComprobante = 'A' | 'B' | 'C';
export type ClaseComprobante = 'factura' | 'nota_credito';

export interface Comprobante {
  id: ID;
  clase: ClaseComprobante;
  letra: LetraComprobante;
  puntoVenta: number;
  numero: number;
  fecha: FechaISO;
  clienteId: ID;
  pedidoId?: ID;
  /** Factura a la que corresponde una nota de crédito. */
  asociadoId?: ID;
  renglones: Renglon[];
  descuentoPct: number;
  neto: Centavos;
  iva: Centavos;
  total: Centavos;
  cae: string;
  caeVence: FechaISO;
  condicionVenta: CondicionVenta;
  /** Hasta cuándo se puede pagar sin estar vencida. */
  vencePago: FechaISO;
  motivo?: string;
  /** Si la nota de crédito devolvió mercadería al stock. */
  reingresaStock?: boolean;
}

/* ───────────── Cobranzas ───────────── */

export type MedioPago =
  | { tipo: 'efectivo'; importe: Centavos }
  | { tipo: 'transferencia'; importe: Centavos; banco: string; operacion: string }
  | { tipo: 'cheque'; importe: Centavos; chequeId: ID }
  | { tipo: 'tarjeta'; importe: Centavos; tarjeta: string; cuotas: number; cupon: string };

export interface Imputacion {
  comprobanteId: ID;
  importe: Centavos;
}

export interface Cobro {
  id: ID;
  numero: string;
  clienteId: ID;
  fecha: FechaISO;
  medios: MedioPago[];
  imputaciones: Imputacion[];
  total: Centavos;
  notas?: string;
}

export type EstadoCheque = 'en_cartera' | 'depositado' | 'endosado' | 'rechazado';

export interface Cheque {
  id: ID;
  banco: string;
  numero: string;
  librador: string;
  cuitLibrador: string;
  importe: Centavos;
  emitidoEl: FechaISO;
  /** Fecha desde la que se puede cobrar (cheque diferido). */
  cobroEl: FechaISO;
  estado: EstadoCheque;
  clienteId: ID;
  cobroId: ID;
  /** A quién se endosó o en qué cuenta se depositó. */
  destino?: string;
  echeq: boolean;
}

/* ───────────── Stock y compras ───────────── */

export type TipoMovimientoStock = 'venta' | 'ingreso' | 'ajuste' | 'conteo' | 'devolucion';

export interface MovimientoStock {
  id: ID;
  productoId: ID;
  fecha: FechaISO;
  /** Positivo entra, negativo sale. */
  cantidad: number;
  tipo: TipoMovimientoStock;
  /** Comprobante, pedido u orden que lo originó. */
  referencia?: { tipo: 'pedido' | 'comprobante' | 'orden_compra' | 'conteo'; id: ID; numero: string };
  motivo?: string;
  usuario: string;
  /** Stock que quedó después del movimiento. */
  stockResultante: number;
}

export interface Conteo {
  id: ID;
  fecha: FechaISO;
  estante: string;
  items: Array<{ productoId: ID; sistema: number; contado: number }>;
  estado: 'en_curso' | 'cerrado';
  usuario: string;
}

export type EstadoOrdenCompra = 'borrador' | 'enviada' | 'recibida';

export interface OrdenCompra {
  id: ID;
  numero: string;
  proveedorId: ID;
  fecha: FechaISO;
  estado: EstadoOrdenCompra;
  renglones: Array<{ productoId: ID; cantidad: number; costo: Centavos; recibido: number }>;
  llegaEl: FechaISO;
  recibidaEl?: FechaISO;
  remitoProveedor?: string;
}

/* ───────────── WhatsApp ───────────── */

export interface Mensaje {
  id: ID;
  de: 'cliente' | 'dalama';
  texto: string;
  fecha: FechaISO;
  /** Documento enviado junto con el mensaje. */
  adjunto?: { tipo: 'presupuesto' | 'factura' | 'remito' | 'recibo' | 'estado_cuenta'; id: ID; nombre: string };
  leido: boolean;
}

export type EstadoConversacion = 'nuevo' | 'presupuestado' | 'respondido' | 'archivado';

export interface Conversacion {
  id: ID;
  telefono: string;
  /** Nombre como aparece en WhatsApp. */
  contacto: string;
  clienteId?: ID;
  mensajes: Mensaje[];
  estado: EstadoConversacion;
  presupuestoId?: ID;
}

/* ───────────── Configuración ───────────── */

export interface Empresa {
  razonSocial: string;
  nombreFantasia: string;
  cuit: string;
  condicionIVA: CondicionIVA;
  ingresosBrutos: string;
  inicioActividades: FechaISO;
  domicilio: string;
  localidad: string;
  telefono: string;
  email: string;
  web: string;
  /** Alias para transferencias. */
  alias: string;
  cbu: string;
  puntoVenta: number;
  puntoVentaRemito: number;
}

export interface Plantilla {
  id: ID;
  nombre: string;
  /** Con variables: {cliente}, {contacto}, {numero}, {total}, {vence}, {deuda}, {comprobantes}, {alias}. */
  cuerpo: string;
  uso: 'presupuesto' | 'recordatorio_presupuesto' | 'factura' | 'entrega' | 'recordatorio_deuda' | 'reactivacion' | 'recibo';
}

export interface Ajustes {
  ivaPct: number;
  validezPresupuestoDias: number;
  recordarPresupuestoDias: number;
  recordarDeudaCadaDias: number;
  diasClienteInactivo: number;
  /** Reposición sugerida: hasta N veces el stock mínimo. */
  reponerHastaVecesMinimo: number;
}

/* ───────────── Registro de actividad ───────────── */

export type TipoActividad =
  | 'mensaje' | 'presupuesto' | 'pedido' | 'factura' | 'nota_credito' | 'cobro' | 'entrega' | 'stock' | 'compra' | 'precio' | 'cliente' | 'sistema';

export interface Actividad {
  id: ID;
  fecha: FechaISO;
  tipo: TipoActividad;
  titulo: string;
  detalle?: string;
  /** A dónde lleva al tocarla. */
  ruta?: string;
}

/* ───────────── Estado completo de la demo ───────────── */

export interface Secuencias {
  presupuesto: number;
  pedido: number;
  remito: number;
  recibo: number;
  ordenCompra: number;
  factura: Record<LetraComprobante, number>;
  notaCredito: Record<LetraComprobante, number>;
}

export interface DatosDemo {
  /** Versión del esquema: si cambia, se regeneran los datos. */
  esquema: number;
  /** Día en que se generaron o se corrieron por última vez las fechas. */
  generadoEl: FechaISO;
  empresa: Empresa;
  ajustes: Ajustes;
  listas: ListaPrecios[];
  proveedores: Proveedor[];
  productos: Producto[];
  clientes: Cliente[];
  presupuestos: Presupuesto[];
  pedidos: Pedido[];
  comprobantes: Comprobante[];
  cobros: Cobro[];
  cheques: Cheque[];
  movimientosStock: MovimientoStock[];
  conteos: Conteo[];
  ordenesCompra: OrdenCompra[];
  conversaciones: Conversacion[];
  plantillas: Plantilla[];
  actividad: Actividad[];
  secuencias: Secuencias;
}
