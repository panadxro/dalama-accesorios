import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ConteoPage() {
  return (
    <Page title="Conteo de inventario" overline="Catálogo · Depósito">
      <EnPreparacion
        icon="clipboard"
        etapa={4}
        resumen="El conteo estante por estante desde el celular, sin ver la cantidad del sistema."
        funciones={[
          "Elegir el estante a contar",
          "Cargar lo contado con botones grandes",
          "Ver las diferencias al terminar",
          "Ajustar el stock con un toque",
        ]}
        relacionados={[{ label: "Stock", to: "/stock" }]}
      />
    </Page>
  );
}
