import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function InicioPage() {
  return (
    <Page title="Panel de inicio" overline="Resumen del día">
      <EnPreparacion
        icon="home"
        etapa={4}
        resumen="El resumen del negocio de un vistazo: ventas, cobranzas, entregas y alertas."
        funciones={[
          "Ver ventas del mes contra el mes anterior",
          "Seguir presupuestos sin respuesta",
          "Revisar las entregas de hoy",
          "Detectar deudas vencidas y stock bajo",
          "Ir directo a cargar un presupuesto, un cobro o una entrega",
        ]}
        relacionados={[{ label: "Bandeja de WhatsApp", to: "/whatsapp" }, { label: "Presupuestos", to: "/presupuestos" }]}
      />
    </Page>
  );
}
