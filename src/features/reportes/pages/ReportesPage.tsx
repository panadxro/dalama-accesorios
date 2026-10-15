import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ReportesPage() {
  return (
    <Page title="Reportes" overline="Análisis">
      <EnPreparacion
        icon="chart"
        etapa={5}
        resumen="Las ventas y márgenes del negocio, listos para exportar."
        funciones={[
          "Ventas por período, cliente, producto y categoría",
          "Margen bruto por producto",
          "Exportar a CSV",
        ]}
        relacionados={[{ label: "Panel de inicio", to: "/inicio" }]}
      />
    </Page>
  );
}
