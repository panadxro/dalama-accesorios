import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function PresupuestoDetallePage() {
  return (
    <Page title="Presupuesto" overline="Operación · Presupuestos">
      <EnPreparacion
        icon="file-text"
        etapa={3}
        resumen="El detalle de un presupuesto: productos, totales, envíos y seguimiento."
        funciones={[
          "Ver y editar renglones y descuentos",
          "Reenviar por WhatsApp o descargar el PDF",
          "Marcar como aceptado o rechazado",
          "Convertirlo en pedido",
        ]}
        relacionados={[{ label: "Volver a presupuestos", to: "/presupuestos" }]}
      />
    </Page>
  );
}
