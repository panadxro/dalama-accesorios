import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function FacturacionPage() {
  return (
    <Page title="Facturación" overline="Administración">
      <EnPreparacion
        icon="receipt"
        etapa={3}
        resumen="Facturas y notas de crédito electrónicas (ARCA simulado)."
        funciones={[
          "Ver los comprobantes emitidos",
          "Emitir factura A, B o C según el cliente",
          "Emitir notas de crédito",
          "Descargar el PDF con CAE",
          "Enviar la factura por WhatsApp",
        ]}
        relacionados={[{ label: "Pedidos y entregas", to: "/pedidos" }, { label: "Cuentas corrientes", to: "/cuentas" }]}
      />
    </Page>
  );
}
