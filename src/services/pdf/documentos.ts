/**
 * PDF de los documentos comerciales (presupuesto, factura, nota de crédito, remito y recibo).
 * Se generan en el navegador con jsPDF. Todos llevan la leyenda de demo: no tienen validez fiscal.
 */
import { jsPDF } from 'jspdf';
import {
  CONDICION_IVA, METODO_ENTREGA, codigoComprobante, numeroFiscal, subtotalRenglon, totales,
} from '@/domain/calculos';
import type { Cliente, Cobro, Comprobante, DatosDemo, Pedido, Presupuesto, Renglon } from '@/domain/types';
import { formatARS, formatCUIT, formatFecha } from '@/lib/format';

const TINTA: [number, number, number] = [17, 17, 17];
const SECUNDARIO: [number, number, number] = [61, 56, 51];
const ROJO: [number, number, number] = [225, 27, 34];
const ARENA: [number, number, number] = [243, 237, 227];
const BORDE: [number, number, number] = [207, 201, 194];

const M = 15; // margen
const ANCHO = 210;

/** jsPDF con fuentes estándar solo dibuja Latin-1: se reemplazan los signos tipográficos. */
const t = (s: string) =>
  s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[−–—]/g, '-').replace(/…/g, '...').replace(/ /g, ' ');

const $ = (c: number) => t(formatARS(c));

let logoCache: { data: string; w: number; h: number } | null = null;

async function cargarLogo() {
  if (logoCache) return logoCache;
  const img = new Image();
  img.src = '/brand/dalama-logo.png';
  await img.decode();
  // Reducido y en JPEG sobre blanco: el PDF queda liviano (el logo original pesa cientos de KB).
  const ancho = 600;
  const alto = Math.round((img.naturalHeight * ancho) / img.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(img, 0, 0, ancho, alto);
  logoCache = { data: canvas.toDataURL('image/jpeg', 0.9), w: ancho, h: alto };
  return logoCache;
}

interface Encabezado {
  titulo: string;
  numero: string;
  fecha: string;
  /** Letra fiscal (A, B, C) o X para documentos no fiscales. */
  letra: string;
  codigo?: string;
}

async function nuevoDocumento(d: DatosDemo, e: Encabezado) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setProperties({ title: t(`${e.titulo} ${e.numero}`), author: 'DALAMA (demo)', creator: 'DALAMA · Sistema de gestión (demo)' });

  const logo = await cargarLogo().catch(() => null);
  if (logo) doc.addImage(logo.data, 'JPEG', M, 12, 52, (52 * logo.h) / logo.w);
  else {
    doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...TINTA).text('DALAMA', M, 24);
  }

  // Letra al centro
  doc.setDrawColor(...TINTA).setLineWidth(0.6).rect(ANCHO / 2 - 7, 12, 14, 14);
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...TINTA).text(e.letra, ANCHO / 2, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(...SECUNDARIO).text(t(e.codigo ?? 'No válido como factura'), ANCHO / 2, 30, { align: 'center' });

  // Título y número
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...TINTA).text(t(e.titulo.toUpperCase()), ANCHO - M, 17, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(10).text(t(`N.° ${e.numero}`), ANCHO - M, 23, { align: 'right' });
  doc.setTextColor(...SECUNDARIO).text(t(`Fecha: ${e.fecha}`), ANCHO - M, 28, { align: 'right' });

  doc.setDrawColor(...TINTA).setLineWidth(0.5).line(M, 34, ANCHO - M, 34);

  // Emisor
  const em = d.empresa;
  doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...TINTA).text(t(em.razonSocial), M, 40);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...SECUNDARIO);
  doc.text(t(`CUIT ${formatCUIT(em.cuit)} · ${CONDICION_IVA[em.condicionIVA]}`), M, 45);
  doc.text(t(`${em.domicilio}, ${em.localidad}`), M, 49);
  doc.text(t(`IIBB ${em.ingresosBrutos} · Inicio de actividades ${formatFecha(em.inicioActividades)}`), M, 53);
  doc.text(t(`${em.telefono} · ${em.email}`), M, 57);
  return doc;
}

function bloqueCliente(doc: jsPDF, c: Cliente, extra: string[] = []) {
  const x = ANCHO / 2 + 5;
  doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...TINTA).text(t(c.razonSocial), x, 40);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...SECUNDARIO);
  const lineas = [
    `CUIT ${formatCUIT(c.cuit)} · ${CONDICION_IVA[c.condicionIVA]}`,
    `${c.direccion}, ${c.localidad}`,
    ...extra,
  ];
  lineas.forEach((l, i) => doc.text(t(l), x, 45 + i * 4));
}

interface Columna {
  titulo: string;
  ancho: number;
  alinear?: 'right' | 'left' | 'center';
}

/** Tabla simple con salto de página. Devuelve la altura final. */
function tabla(doc: jsPDF, y: number, cols: Columna[], filas: string[][]): number {
  const alto = 7;
  const encabezado = (yy: number) => {
    doc.setFillColor(...ARENA).rect(M, yy, ANCHO - 2 * M, alto, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...SECUNDARIO);
    let x = M + 2;
    for (const c of cols) {
      const tx = c.alinear === 'right' ? x + c.ancho - 4 : c.alinear === 'center' ? x + c.ancho / 2 - 2 : x;
      doc.text(t(c.titulo.toUpperCase()), tx, yy + 4.8, { align: c.alinear ?? 'left' });
      x += c.ancho;
    }
    return yy + alto;
  };
  let yy = encabezado(y);
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...TINTA);
  for (const f of filas) {
    if (yy > 250) {
      doc.addPage();
      yy = encabezado(20);
      doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...TINTA);
    }
    let x = M + 2;
    f.forEach((celda, i) => {
      const c = cols[i];
      const tx = c.alinear === 'right' ? x + c.ancho - 4 : c.alinear === 'center' ? x + c.ancho / 2 - 2 : x;
      const texto = doc.splitTextToSize(t(celda), c.ancho - 4)[0] as string;
      doc.text(texto, tx, yy + 4.8, { align: c.alinear ?? 'left' });
      x += c.ancho;
    });
    doc.setDrawColor(...ARENA).setLineWidth(0.2).line(M, yy + alto, ANCHO - M, yy + alto);
    yy += alto;
  }
  return yy;
}

function filasRenglones(d: DatosDemo, renglones: Renglon[], descuentoPct: number, conPrecios = true): string[][] {
  return renglones.map((r) => {
    const p = r.productoId ? d.productos.find((x) => x.id === r.productoId) : undefined;
    const base = [String(r.cantidad), p?.codigo ?? '—', r.descripcion];
    if (!conPrecios) return [...base, p?.unidad ?? ''];
    const unit = Math.round(r.precioUnitario * (1 - descuentoPct / 100));
    return [...base, $(unit), $(subtotalRenglon({ cantidad: r.cantidad, precioUnitario: unit }))];
  });
}

const COLS_PRECIOS: Columna[] = [
  { titulo: 'Cant.', ancho: 16, alinear: 'center' },
  { titulo: 'Código', ancho: 30 },
  { titulo: 'Descripción', ancho: 76 },
  { titulo: 'P. unit.', ancho: 29, alinear: 'right' },
  { titulo: 'Subtotal', ancho: 29, alinear: 'right' },
];

function bloqueTotales(doc: jsPDF, y: number, filas: Array<[string, string, boolean?]>): number {
  let yy = y + 6;
  const x1 = ANCHO - M - 75;
  for (const [k, v, fuerte] of filas) {
    if (fuerte) {
      doc.setDrawColor(...TINTA).setLineWidth(0.4).line(x1, yy - 3.5, ANCHO - M, yy - 3.5);
      yy += 1.5;
      doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...TINTA);
    } else doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...SECUNDARIO);
    doc.text(t(k), x1, yy);
    doc.text(t(v), ANCHO - M, yy, { align: 'right' });
    yy += fuerte ? 7 : 5;
  }
  return yy;
}

function pie(doc: jsPDF, lineas: string[]) {
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDE).setLineWidth(0.2).line(M, 272, ANCHO - M, 272);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...SECUNDARIO);
    lineas.forEach((l, j) => doc.text(t(l), M, 277 + j * 4));
    doc.setFillColor(...ROJO).rect(ANCHO - M - 8, 286, 8, 1, 'F');
    doc.setFontSize(7).text(t('DEMO · datos ficticios · sin validez fiscal'), ANCHO - M - 10, 287, { align: 'right' });
    doc.text(`${i} / ${paginas}`, ANCHO - M, 277, { align: 'right' });
  }
}

/* ───────────── Documentos ───────────── */

export async function pdfPresupuesto(d: DatosDemo, p: Presupuesto): Promise<jsPDF> {
  const c = d.clientes.find((x) => x.id === p.clienteId)!;
  const lista = d.listas.find((l) => l.descuentoPct === p.descuentoPct);
  const doc = await nuevoDocumento(d, { titulo: 'Presupuesto', numero: p.numero, fecha: formatFecha(p.fecha), letra: 'X' });
  bloqueCliente(doc, c, [`Atención: ${c.contacto}`, `Válido hasta el ${formatFecha(p.validoHasta)}`]);
  const tot = totales(p.renglones, p.descuentoPct, d.ajustes.ivaPct);
  let y = tabla(doc, 66, COLS_PRECIOS, filasRenglones(d, p.renglones.filter((r) => r.productoId), p.descuentoPct));
  y = bloqueTotales(doc, y, [
    ...(p.descuentoPct ? [[`Precios con ${lista?.nombre ?? 'descuento'} (-${p.descuentoPct} %)`, ''] as [string, string]] : []),
    ['Neto', $(tot.neto)],
    [`IVA ${d.ajustes.ivaPct} %`, $(tot.iva)],
    ['Total', $(tot.total), true],
  ]);
  if (p.notas) {
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...TINTA).text(doc.splitTextToSize(t(`Nota: ${p.notas}`), ANCHO - 2 * M), M, y + 4);
  }
  pie(doc, [
    `Precios en pesos. Sujetos a disponibilidad de stock. Presupuesto válido hasta el ${formatFecha(p.validoHasta)}.`,
    `Para confirmar, respondé este mensaje o escribinos al ${d.empresa.telefono}.`,
  ]);
  return doc;
}

export async function pdfComprobante(d: DatosDemo, cmp: Comprobante): Promise<jsPDF> {
  const c = d.clientes.find((x) => x.id === cmp.clienteId)!;
  const titulo = cmp.clase === 'factura' ? 'Factura' : 'Nota de crédito';
  const codigo = { factura: { A: '01', B: '06', C: '11' }, nota_credito: { A: '03', B: '08', C: '13' } }[cmp.clase][cmp.letra];
  const doc = await nuevoDocumento(d, { titulo, numero: numeroFiscal(cmp.puntoVenta, cmp.numero), fecha: formatFecha(cmp.fecha), letra: cmp.letra, codigo: `COD. ${codigo}` });
  const pedido = cmp.pedidoId ? d.pedidos.find((p) => p.id === cmp.pedidoId) : undefined;
  const asociado = cmp.asociadoId ? d.comprobantes.find((x) => x.id === cmp.asociadoId) : undefined;
  bloqueCliente(doc, c, [
    `Condición de venta: ${cmp.condicionVenta === 'cta_cte_30' ? 'Cuenta corriente 30 días' : 'Contado'}`,
    ...(pedido ? [`Pedido ${pedido.numero}${pedido.remito ? ` · remito ${pedido.remito.numero}` : ''}`] : []),
    ...(asociado ? [`Asociada a ${codigoComprobante(asociado)}`] : []),
  ]);
  // En la factura B el IVA no se discrimina: los precios se muestran finales.
  const discrimina = cmp.letra === 'A';
  const filas = cmp.renglones.map((r) => {
    const p = r.productoId ? d.productos.find((x) => x.id === r.productoId) : undefined;
    const neto = Math.round(r.precioUnitario * (1 - cmp.descuentoPct / 100));
    const unit = discrimina ? neto : Math.round(neto * (1 + d.ajustes.ivaPct / 100));
    return [String(r.cantidad), p?.codigo ?? '—', r.descripcion, $(unit), $(Math.round(unit * r.cantidad))];
  });
  let y = tabla(doc, 70, COLS_PRECIOS, filas);
  y = bloqueTotales(doc, y, discrimina
    ? [['Neto gravado', $(cmp.neto)], [`IVA ${d.ajustes.ivaPct} %`, $(cmp.iva)], ['Total', $(cmp.total), true]]
    : [['Total', $(cmp.total), true], [`IVA contenido (Ley 27.743)`, $(cmp.iva)]]);
  if (cmp.motivo) doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...TINTA).text(t(`Motivo: ${cmp.motivo}`), M, y + 4);

  // Bloque CAE
  doc.setFillColor(...ARENA).rect(M, 252, ANCHO - 2 * M, 14, 'F');
  doc.setDrawColor(...TINTA).setLineWidth(0.3).rect(M + 3, 254, 10, 10);
  doc.setFont('helvetica', 'bold').setFontSize(5).setTextColor(...SECUNDARIO).text('QR', M + 8, 260, { align: 'center' });
  doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...TINTA).text(t(`CAE ${cmp.cae}`), M + 17, 258);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...SECUNDARIO).text(t(`Vencimiento del CAE: ${formatFecha(cmp.caeVence)} · Comprobante autorizado por ARCA (simulado)`), M + 17, 262.5);
  pie(doc, [
    cmp.clase === 'factura' && cmp.condicionVenta === 'cta_cte_30' ? `Vence el ${formatFecha(cmp.vencePago)}. Podés transferir al alias ${d.empresa.alias}.` : `Gracias por tu compra.`,
    'CAE, número y QR son ficticios: generados por la demo, no por ARCA.',
  ]);
  return doc;
}

export async function pdfRemito(d: DatosDemo, p: Pedido): Promise<jsPDF> {
  const c = d.clientes.find((x) => x.id === p.clienteId)!;
  const e = p.entrega;
  const doc = await nuevoDocumento(d, { titulo: 'Remito', numero: (p.remito?.numero ?? 'Borrador').replace(/^R /, ''), fecha: formatFecha(p.remito?.fecha ?? p.fecha), letra: 'R', codigo: 'COD. 91' });
  bloqueCliente(doc, c, [
    `Entrega: ${METODO_ENTREGA[e.metodo]}${e.empresa ? ` · ${e.empresa}` : ''}`,
    `Dirección: ${e.direccion}`,
    `Pedido ${p.numero} · ${e.bultos} ${e.bultos === 1 ? 'bulto' : 'bultos'}`,
  ]);
  const y = tabla(doc, 70, [
    { titulo: 'Cant.', ancho: 18, alinear: 'center' },
    { titulo: 'Código', ancho: 34 },
    { titulo: 'Descripción', ancho: 108 },
    { titulo: 'Unidad', ancho: 20 },
  ], filasRenglones(d, p.renglones, p.descuentoPct, false));
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...SECUNDARIO);
  const yf = Math.max(y + 30, 220);
  doc.setDrawColor(...SECUNDARIO).setLineWidth(0.2);
  doc.line(M, yf, M + 70, yf).text('Firma y aclaración de quien recibe', M, yf + 4);
  doc.line(ANCHO - M - 50, yf, ANCHO - M, yf).text('Fecha y hora', ANCHO - M - 50, yf + 4);
  if (e.cobrarAlEntregar) {
    doc.setFont('helvetica', 'bold').setTextColor(...TINTA).text(t(`Cobrar al entregar: ${$(e.cobrarAlEntregar)}`), M, yf - 12);
  }
  pie(doc, ['Documento no válido como factura. La mercadería viaja por cuenta y orden del cliente.', `Consultas: ${d.empresa.telefono}`]);
  return doc;
}

export async function pdfRecibo(d: DatosDemo, cobro: Cobro): Promise<jsPDF> {
  const c = d.clientes.find((x) => x.id === cobro.clienteId)!;
  const doc = await nuevoDocumento(d, { titulo: 'Recibo', numero: cobro.numero.replace(/^RC /, ''), fecha: formatFecha(cobro.fecha), letra: 'X' });
  bloqueCliente(doc, c);
  const medios = cobro.medios.map((m) => {
    switch (m.tipo) {
      case 'efectivo': return ['Efectivo', '', $(m.importe)];
      case 'transferencia': return ['Transferencia', `${m.banco} · op. ${m.operacion}`, $(m.importe)];
      case 'tarjeta': return ['Tarjeta', `${m.tarjeta} · ${m.cuotas} ${m.cuotas === 1 ? 'pago' : 'cuotas'} · cupón ${m.cupon}`, $(m.importe)];
      case 'cheque': {
        const ch = d.cheques.find((x) => x.id === m.chequeId);
        return ['Cheque', ch ? `${ch.banco} N.° ${ch.numero} · cobro ${formatFecha(ch.cobroEl)}` : '', $(m.importe)];
      }
    }
  });
  let y = tabla(doc, 66, [{ titulo: 'Medio de pago', ancho: 40 }, { titulo: 'Detalle', ancho: 100 }, { titulo: 'Importe', ancho: 40, alinear: 'right' }], medios);
  const imputadas = cobro.imputaciones.map((i) => {
    const cmp = d.comprobantes.find((x) => x.id === i.comprobanteId);
    return [cmp ? codigoComprobante(cmp) : '—', cmp ? formatFecha(cmp.fecha) : '', $(i.importe)];
  });
  if (imputadas.length) y = tabla(doc, y + 6, [{ titulo: 'Aplicado a', ancho: 80 }, { titulo: 'Fecha', ancho: 60 }, { titulo: 'Importe', ancho: 40, alinear: 'right' }], imputadas);
  bloqueTotales(doc, y, [['Total recibido', $(cobro.total), true]]);
  pie(doc, ['Los cheques se reciben salvo buen cobro.', `Gracias. ${d.empresa.razonSocial}`]);
  return doc;
}

/** Descarga el PDF con un nombre legible. */
export function descargarPDF(doc: jsPDF, nombre: string) {
  doc.save(t(nombre).replace(/[^\w\s.-]/g, '').replace(/\s+/g, '-') + '.pdf');
}
