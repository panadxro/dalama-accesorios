import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ProductosPage() {
  return (
    <Page title="Productos y precios" overline="Catálogo">
      <EnPreparacion
        icon="tag"
        etapa={4}
        resumen="El catálogo con variantes, costos, precios y márgenes."
        funciones={[
          "Buscar por categoría, línea y proveedor",
          "Ver costo, precio de lista y margen",
          "Actualizar precios en masa con vista previa",
          "Cargar productos nuevos",
        ]}
        relacionados={[{ label: "Stock", to: "/stock" }, { label: "Compras", to: "/compras" }]}
      />
    </Page>
  );
}
