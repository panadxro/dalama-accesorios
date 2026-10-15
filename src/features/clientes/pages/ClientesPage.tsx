import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ClientesPage() {
  return (
    <Page title="Clientes" overline="Administración">
      <EnPreparacion
        icon="users"
        etapa={4}
        resumen="La cartera de clientes: aberturistas, carpinteros y particulares."
        funciones={[
          "Buscar y filtrar clientes por tipo, zona y condición de IVA",
          "Ver saldo y última compra de cada uno",
          "Detectar clientes inactivos",
          "Enviarles un mensaje de reactivación",
        ]}
        relacionados={[{ label: "Cuentas corrientes", to: "/cuentas" }]}
      />
    </Page>
  );
}
