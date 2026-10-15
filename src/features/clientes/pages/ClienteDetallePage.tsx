import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ClienteDetallePage() {
  return (
    <Page title="Ficha del cliente" overline="Administración · Clientes">
      <EnPreparacion
        icon="user"
        etapa={4}
        resumen="Todo sobre un cliente en una sola ficha."
        funciones={[
          "Datos fiscales y de contacto",
          "Historial de presupuestos, pedidos y facturas",
          "Saldo de cuenta corriente",
          "Productos que más compra",
        ]}
        relacionados={[{ label: "Volver a clientes", to: "/clientes" }]}
      />
    </Page>
  );
}
