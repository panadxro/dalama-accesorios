import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import * as RD from '@radix-ui/react-dialog';
import { useUi } from '@/store/ui';
import { useDemo } from '@/store/demo';
import { ErrorBoundary, PageSkeleton } from '@/components/shared/States';
import { Sidebar } from './Sidebar';
import { TabBar } from './MobileBars';
import { Recorrido } from '@/features/tour/Recorrido';

/**
 * Esqueleto de la app: barra lateral (escritorio), menú deslizable y navegación inferior (celular).
 * Cada página dibuja su propia barra superior con <Page>.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const collapsed = useUi((s) => s.sidebarColapsada);
  const setCollapsed = useUi((s) => s.setSidebarColapsada);
  const menuOpen = useUi((s) => s.menuMovilAbierto);
  const setMenuOpen = useUi((s) => s.setMenuMovilAbierto);
  const sinProcesar = useDemo((s) => s.datos.conversaciones.filter((c) => c.estado === 'nuevo').length);
  const counts = { bandeja: sinProcesar };

  // Cada pantalla nueva arranca desde arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="dl-root flex min-h-screen bg-fondo">
      <a href="#contenido" className="sr-only-focusable fixed left-4 top-4 z-[90] rounded-sm bg-ink-black px-4 py-2 font-semibold text-neutro-0">
        Saltar al contenido
      </a>

      {/* Escritorio */}
      <div className="sticky top-0 hidden h-screen shrink-0 overflow-y-auto bg-barra-lateral lg:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} counts={counts} />
      </div>

      {/* Celular: menú deslizable */}
      <RD.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <RD.Portal>
          <RD.Overlay className="dl-overlay animate-dl-fade lg:hidden" />
          <RD.Content className="fixed inset-y-0 left-0 z-50 flex max-w-[85vw] animate-dl-slide overflow-y-auto bg-barra-lateral lg:hidden">
            <RD.Title className="sr-only">Menú</RD.Title>
            <RD.Description className="sr-only">Secciones del sistema</RD.Description>
            <Sidebar collapsed={false} counts={counts} onNavigate={() => setMenuOpen(false)} />
          </RD.Content>
        </RD.Portal>
      </RD.Root>

      <div className="flex min-w-0 flex-1 flex-col pb-[60px] lg:pb-0">
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>

      <Recorrido />

      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <TabBar />
      </div>
    </div>
  );
}
