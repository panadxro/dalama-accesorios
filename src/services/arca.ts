/**
 * ARCA (factura electrónica) — SIMULADO.
 * Imita la respuesta del web service WSFE: CAE de 14 dígitos con vencimiento a 10 días.
 * En el sistema real se reemplaza por la llamada firmada con el certificado del punto de venta.
 */
import { aISO, conHora, sumarDias, type FechaISO } from '@/lib/fechas';

export interface SolicitudCAE {
  letra: 'A' | 'B' | 'C';
  clase: 'factura' | 'nota_credito';
  puntoVenta: number;
  numero: number;
  total: number;
}

export interface RespuestaCAE {
  cae: string;
  caeVence: FechaISO;
  /** Momento de la respuesta. */
  autorizadoEl: FechaISO;
}

export class ArcaError extends Error {
  detalle: string;
  constructor(detalle: string) {
    super('ARCA no respondió a tiempo.');
    this.detalle = detalle;
  }
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

function caeFicticio(): string {
  let s = '7';
  for (let i = 0; i < 13; i++) s += String(Math.floor(Math.random() * 10));
  return s;
}

/** Pide el CAE. Con `simularFalla`, responde como un timeout del servicio. */
export async function solicitarCAE(_s: SolicitudCAE, opciones: { simularFalla?: boolean } = {}): Promise<RespuestaCAE> {
  await esperar(opciones.simularFalla ? 2400 : 1600);
  const ahora = new Date();
  if (opciones.simularFalla) {
    const h = ahora.toTimeString().slice(0, 8);
    throw new ArcaError(`WSFE · FECAESolicitar · sin respuesta en 30 s · ${h}`);
  }
  return { cae: caeFicticio(), caeVence: aISO(conHora(sumarDias(ahora, 10), 23, 59)), autorizadoEl: aISO(ahora) };
}
