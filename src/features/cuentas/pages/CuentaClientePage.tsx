import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function CuentaClientePage() {
  return (
    <Page title="Cuenta corriente" overline="Administración · Cobranzas">
      <EnPreparacion
        icon="wallet"
        etapa={3}
        resumen="La cuenta corriente de un cliente: movimientos, deuda y cobros."
        funciones={[
          "Ver movimientos y saldo",
          "Ver la antigüedad de la deuda",
          "Registrar un cobro y emitir el recibo",
          "Enviar el estado de cuenta",
        ]}
        relacionados={[{ label: "Volver a cuentas corrientes", to: "/cuentas" }]}
      />
    </Page>
  );
}
