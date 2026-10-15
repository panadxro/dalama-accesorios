import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function WhatsAppPage() {
  return (
    <Page title="Bandeja de WhatsApp" overline="Operación · Pedidos">
      <EnPreparacion
        icon="message"
        etapa={3}
        resumen="Los pedidos que llegan por WhatsApp se convierten en presupuestos en segundos."
        funciones={[
          "Leer los mensajes de clientes en una sola bandeja",
          "Generar el presupuesto con IA a partir del mensaje",
          "Revisar productos detectados y elegir los dudosos",
          "Enviar el presupuesto en PDF por WhatsApp",
          "Simular la llegada de un mensaje nuevo",
        ]}
        relacionados={[{ label: "Presupuestos", to: "/presupuestos" }, { label: "Clientes", to: "/clientes" }]}
      />
    </Page>
  );
}
