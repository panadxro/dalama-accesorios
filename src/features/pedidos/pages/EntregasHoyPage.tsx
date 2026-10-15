import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function EntregasHoyPage() {
  return (
    <Page title="Entregas de hoy" overline="Reparto · Camioneta">
      <EnPreparacion
        icon="truck"
        etapa={3}
        resumen="La hoja de ruta del día, pensada para usar desde el celular en la camioneta."
        funciones={[
          "Ver las paradas en el orden sugerido",
          "Ver remito, bultos y qué cobrar en cada parada",
          "Marcar cada entrega como entregada",
          "Registrar el cobro en efectivo al entregar",
        ]}
        relacionados={[{ label: "Pedidos y entregas", to: "/pedidos" }]}
      />
    </Page>
  );
}
