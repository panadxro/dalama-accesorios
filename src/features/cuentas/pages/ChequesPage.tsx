import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ChequesPage() {
  return (
    <Page title="Cartera de cheques" overline="Administración · Cobranzas">
      <EnPreparacion
        icon="bank"
        etapa={4}
        resumen="Los cheques recibidos, con su fecha de cobro y estado."
        funciones={[
          "Ver cheques en cartera por fecha de cobro",
          "Marcarlos como depositados o endosados",
          "Registrar un cheque rechazado",
        ]}
        relacionados={[{ label: "Cuentas corrientes", to: "/cuentas" }]}
      />
    </Page>
  );
}
