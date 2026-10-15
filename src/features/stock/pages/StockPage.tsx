import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function StockPage() {
  return (
    <Page title="Stock" overline="Catálogo · Depósito">
      <EnPreparacion
        icon="boxes"
        etapa={4}
        resumen="El stock del depósito, con alertas y movimientos automáticos."
        funciones={[
          "Ver el stock actual contra el mínimo",
          "Ver los movimientos de cada producto",
          "Registrar ajustes",
          "Contar el inventario desde el celular",
        ]}
        relacionados={[{ label: "Conteo de inventario", to: "/stock/conteo" }, { label: "Compras", to: "/compras" }]}
      />
    </Page>
  );
}
