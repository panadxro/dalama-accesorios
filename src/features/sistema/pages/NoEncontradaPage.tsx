import { Page } from '@/app/layout/Page';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/States';

export default function NoEncontradaPage() {
  return (
    <Page title="Página no encontrada">
      <div className="dl-card">
        <EmptyState
          icon="search"
          title="Esta página no existe"
          text="Puede que el enlace esté mal escrito o que el registro se haya borrado al reiniciar la demo."
          action={<ButtonLink to="/inicio" variant="primary" icon="home">Volver al inicio</ButtonLink>}
        />
      </div>
    </Page>
  );
}
