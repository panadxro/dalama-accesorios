import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function PedidoDetallePage() {
  return (
    <Page title="Pedido" overline="Operación · Pedidos">
      <EnPreparacion
        icon="package"
        etapa={3}
        resumen="El detalle de un pedido: productos, entrega, remito y factura."
        funciones={[
          "Cambiar el estado del pedido",
          "Programar la entrega",
          "Imprimir el remito",
          "Emitir la factura",
        ]}
        relacionados={[{ label: "Volver a pedidos", to: "/pedidos" }]}
      />
    </Page>
  );
}
