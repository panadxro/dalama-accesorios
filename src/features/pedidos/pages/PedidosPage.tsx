import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function PedidosPage() {
  return (
    <Page title="Pedidos y entregas" overline="Operación">
      <EnPreparacion
        icon="truck"
        etapa={3}
        resumen="Cada pedido desde que se confirma hasta que se entrega y se cobra."
        funciones={[
          "Seguir el estado: confirmado, en preparación, listo, despachado, entregado",
          "Elegir método de envío: camioneta, retiro, transporte o correo",
          "Emitir el remito",
          "Facturar el pedido",
          "Planificar las entregas del día",
        ]}
        relacionados={[{ label: "Entregas de hoy", to: "/entregas" }, { label: "Facturación", to: "/facturacion" }]}
      />
    </Page>
  );
}
