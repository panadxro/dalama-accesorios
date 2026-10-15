import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function PresupuestosPage() {
  return (
    <Page title="Presupuestos" overline="Operación">
      <EnPreparacion
        icon="file-text"
        etapa={3}
        resumen="Todos los presupuestos con su estado, del borrador a la aceptación."
        funciones={[
          "Filtrar por estado: borrador, enviado, aceptado, rechazado, vencido",
          "Editar productos, cantidades y lista de precios",
          "Descargar o reenviar el PDF",
          "Programar recordatorios automáticos",
          "Convertir un presupuesto aceptado en pedido",
        ]}
        relacionados={[{ label: "Bandeja de WhatsApp", to: "/whatsapp" }, { label: "Pedidos y entregas", to: "/pedidos" }]}
      />
    </Page>
  );
}
