import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ComprasPage() {
  return (
    <Page title="Compras y proveedores" overline="Catálogo">
      <EnPreparacion
        icon="cart"
        etapa={5}
        resumen="La reposición del depósito a partir del stock mínimo."
        funciones={[
          "Ver órdenes de compra sugeridas",
          "Enviar la orden al proveedor",
          "Registrar la recepción y sumar al stock",
        ]}
        relacionados={[{ label: "Stock", to: "/stock" }, { label: "Productos y precios", to: "/productos" }]}
      />
    </Page>
  );
}
