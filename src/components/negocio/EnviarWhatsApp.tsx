import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Textarea } from '@/components/ui/Input';
import { enviarWhatsApp } from '@/services/whatsapp';
import { formatHora } from '@/lib/format';

export interface EnviarWhatsAppProps {
  open: boolean;
  onClose: () => void;
  /** Destinatario visible: "Martín Rossi · Carpintería Rossi". */
  destinatario: string;
  telefono: string;
  textoInicial: string;
  adjunto?: string;
  /** Se llama después de la confirmación simulada, con el texto final. */
  onEnviado: (texto: string) => void;
  titulo?: string;
}

/**
 * Vista previa y confirmación de un envío por WhatsApp. Es una simulación: no sale ningún mensaje.
 */
export function EnviarWhatsApp({ open, onClose, destinatario, telefono, textoInicial, adjunto, onEnviado, titulo = 'Enviar por WhatsApp' }: EnviarWhatsAppProps) {
  const [texto, setTexto] = useState(textoInicial);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) setTexto(textoInicial);
  }, [open, textoInicial]);

  const enviar = async () => {
    setEnviando(true);
    await enviarWhatsApp({ telefono, texto, adjunto });
    setEnviando(false);
    onEnviado(texto);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { if (!o && !enviando) onClose(); }}
      overline="WhatsApp · vista previa"
      title={titulo}
      description={<>Para <strong className="text-texto">{destinatario}</strong> · {telefono}</>}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={enviando}>Cancelar</Button>
          <Button icon="send" loading={enviando} onClick={enviar} disabled={!texto.trim()}>
            {enviando ? 'Enviando…' : 'Confirmar y enviar'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 rounded-sm bg-arena-100 p-4">
        <div className="ml-auto flex max-w-[92%] flex-col gap-2 rounded-md rounded-tr-none bg-superficie p-3 shadow-1">
          {adjunto && (
            <div className="flex items-center gap-2 rounded-sm border border-borde bg-arena-50 px-2.5 py-2">
              <span className="grid h-8 w-8 place-items-center rounded-sm bg-bold-red text-[10px] font-bold text-neutro-0">PDF</span>
              <span className="min-w-0 flex-1 truncate text-body-small font-semibold">{adjunto}</span>
            </div>
          )}
          <p className="m-0 whitespace-pre-line text-body">{texto}</p>
          <span className="self-end text-caption text-texto-secundario">{formatHora(new Date())}</span>
        </div>
      </div>
      <Textarea label="Mensaje" value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} helper="Podés editarlo antes de enviar. El PDF va adjunto." />
      <p className="m-0 flex items-start gap-2 text-body-small text-texto-secundario">
        <Icon name="shield" size={16} className="mt-px shrink-0 text-info" />
        Demo: el envío se simula y no sale ningún mensaje. En el sistema real se envía desde el WhatsApp Business de DALAMA.
      </p>
    </Dialog>
  );
}
