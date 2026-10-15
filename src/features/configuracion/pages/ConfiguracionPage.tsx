import { Page } from '@/app/layout/Page';
import { EnPreparacion } from '@/components/shared/EnPreparacion';

export default function ConfiguracionPage() {
  return (
    <Page title="Configuración" overline="Análisis">
      <EnPreparacion
        icon="settings"
        etapa={5}
        resumen="Los datos de la empresa, las plantillas de mensajes y la demo."
        funciones={[
          "Editar los datos fiscales de la empresa",
          "Editar las plantillas de WhatsApp",
          "Reiniciar la demo con los datos de ejemplo",
        ]}
        relacionados={[{ label: "Panel de inicio", to: "/inicio" }]}
      />
    </Page>
  );
}
