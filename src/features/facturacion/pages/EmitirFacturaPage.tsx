import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function EmitirFacturaPage() {
  return (
    <Page title="Emitir factura" overline="Administración · Facturación">
      <EnPreparacion
        icon="receipt"
        etapa={3}
        resumen="La emisión de un comprobante con pedido de CAE a ARCA (simulado)."
        funciones={[
          "Elegir el tipo de comprobante sugerido por la condición de IVA",
          "Revisar los datos del receptor",
          "Pedir el CAE y obtener el número correlativo",
          "Ver cómo impacta en la cuenta corriente y el stock",
        ]}
        relacionados={[{ label: "Volver a facturación", to: "/facturacion" }]}
      />
    </Page>
  );
}
