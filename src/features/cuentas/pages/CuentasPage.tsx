import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function CuentasPage() {
  return (
    <Page title="Cuentas corrientes" overline="Administración · Cobranzas">
      <EnPreparacion
        icon="wallet"
        etapa={4}
        resumen="Saldos, deuda vencida y cobranzas de todos los clientes."
        funciones={[
          "Ver saldos y antigüedad de la deuda",
          "Registrar cobros en efectivo, transferencia, cheque o tarjeta",
          "Imputar cobros a facturas",
          "Enviar recordatorios de deuda por WhatsApp",
        ]}
        relacionados={[{ label: "Cartera de cheques", to: "/cuentas/cheques" }, { label: "Clientes", to: "/clientes" }]}
      />
    </Page>
  );
}
