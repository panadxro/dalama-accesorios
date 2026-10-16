import { useState } from 'react';
import type { jsPDF } from 'jspdf';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { descargarPDF } from '@/services/pdf/documentos';

/** Genera y descarga un PDF, con estado de carga y error. */
export function BotonPDF({
  generar, nombre, children = 'Descargar PDF', variant = 'secondary', size = 'm', className,
}: { generar: () => Promise<jsPDF>; nombre: string; children?: string; variant?: ButtonVariant; size?: ButtonSize; className?: string }) {
  const [cargando, setCargando] = useState(false);
  return (
    <Button
      variant={variant}
      size={size}
      icon="download"
      loading={cargando}
      className={className}
      onClick={async () => {
        setCargando(true);
        try {
          descargarPDF(await generar(), nombre);
          toast.info(`${nombre}.pdf descargado`, 'Se guardó en la carpeta de descargas de tu navegador.');
        } catch {
          toast.error('No se pudo generar el PDF', 'Volvé a intentarlo. Si sigue pasando, recargá la página.');
        } finally {
          setCargando(false);
        }
      }}
    >
      {children}
    </Button>
  );
}
