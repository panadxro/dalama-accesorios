/**
 * WhatsApp Business — SIMULADO. No se envía nada: se espera un instante y se confirma.
 * En el sistema real se reemplaza por la API de WhatsApp Business con plantillas aprobadas.
 */
export interface EnvioWhatsApp {
  telefono: string;
  texto: string;
  adjunto?: string;
}

export async function enviarWhatsApp(_e: EnvioWhatsApp): Promise<{ enviadoEl: Date }> {
  await new Promise((r) => setTimeout(r, 900));
  return { enviadoEl: new Date() };
}
