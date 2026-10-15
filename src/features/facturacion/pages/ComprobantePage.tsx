import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ComprobantePage() {
  return (
    <Page title="Comprobante" overline="Administración · Facturación">
      <EnPreparacion
        icon="receipt"
        etapa={3}
        resumen="El detalle de una factura o nota de crédito emitida."
        funciones={[
          "Ver el comprobante con su CAE",
          "Descargar el PDF",
          "Emitir una nota de crédito asociada",
        ]}
        relacionados={[{ label: "Volver a facturación", to: "/facturacion" }]}
      />
    </Page>
  );
}
