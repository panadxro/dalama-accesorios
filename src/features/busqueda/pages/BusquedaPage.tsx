import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function BusquedaPage() {
  return (
    <Page title="Buscar" overline="Resultados">
      <EnPreparacion
        icon="search"
        etapa={2}
        resumen="La búsqueda global de clientes, productos y comprobantes."
        funciones={[
          "Buscar clientes por nombre, CUIT o teléfono",
          "Buscar productos por código o nombre",
          "Buscar presupuestos, pedidos y facturas por número",
        ]}
        relacionados={[{ label: "Clientes", to: "/clientes" }, { label: "Productos y precios", to: "/productos" }]}
      />
    </Page>
  );
}
