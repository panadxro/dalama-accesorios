import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useUi } from '@/store/ui';
import { Topbar } from './Topbar';
import { MobileBar } from './MobileBars';

export interface PageProps {
  title: string;
  overline?: string;
  children: ReactNode;
  /** Sin padding ni ancho máximo (bandejas a pantalla completa). */
  bleed?: boolean;
  /** Reemplaza la cabecera móvil (pantallas de celular con cabecera propia). */
  mobileHeader?: ReactNode;
  className?: string;
}

/** Página estándar: barra superior + contenido con márgenes del kit (space-8 en escritorio). */
export function Page({ title, overline, children, bleed, mobileHeader, className }: PageProps) {
  const setMenuOpen = useUi((s) => s.setMenuMovilAbierto);

  useEffect(() => {
    document.title = `${title} · DALAMA (demo)`;
  }, [title]);

  return (
    <>
      <div className="hidden lg:block">
        <Topbar title={title} overline={overline} />
      </div>
      <div className="sticky top-0 z-30 lg:hidden">
        {mobileHeader ?? <MobileBar title={title} overline={overline} onMenu={() => setMenuOpen(true)} />}
      </div>
      <main
        id="contenido"
        tabIndex={-1}
        className={cn(
          'flex-1 outline-none',
          !bleed && 'mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-12 pt-6 lg:px-8',
          className,
        )}
      >
        {children}
      </main>
    </>
  );
}

/** Fila de encabezado de sección dentro de la página: overline con línea roja a la izquierda y acciones a la derecha. */
export function PageActions({ overline, children }: { overline?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {overline && (
          <>
            <div className="dl-overline">{overline}</div>
            <span className="dl-brandline" aria-hidden="true" />
          </>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
