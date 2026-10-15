import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

/** Estado vacío del kit: ícono en cuadrado arena-100, título, una oración y una acción. */
export function EmptyState({
  icon = 'inbox', title, text, action, className,
}: { icon?: IconName; title: string; text?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('dl-empty', className)} role="status">
      <div className="dl-empty-mark"><Icon name={icon} size={24} /></div>
      <p className="dl-empty-title">{title}</p>
      {text && <p className="dl-empty-text">{text}</p>}
      {action}
    </div>
  );
}

/** Esqueleto de una página mientras carga el módulo. */
export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8" role="status" aria-label="Cargando">
      <div className="dl-skeleton h-6 w-48" />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="dl-skeleton h-[140px] rounded-md" />)}
      </div>
      <div className="dl-skeleton h-[320px] rounded-md" />
      <span className="sr-only">Cargando la sección…</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('dl-skeleton', className)} aria-hidden="true" />;
}

/** Error de pantalla: dice qué pasó y cómo resolverlo, sin disculpas. */
export function ErrorState({
  title = 'Esta sección no se pudo mostrar', text, onRetry,
}: { title?: string; text?: ReactNode; onRetry?: () => void }) {
  return (
    <div className="dl-empty" role="alert">
      <div className="dl-empty-mark bg-error-suave text-error"><Icon name="alert-circle" size={24} /></div>
      <p className="dl-empty-title">{title}</p>
      <p className="dl-empty-text">
        {text ?? 'Volvé a intentarlo. Si sigue pasando, reiniciá la demo desde el menú de usuario: se restauran los datos de ejemplo.'}
      </p>
      {onRetry && <Button variant="secondary" icon="refresh" onClick={onRetry}>Reintentar</Button>}
    </div>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[DALAMA] Error de pantalla', error, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="px-4 py-6 lg:px-8">
          <div className="dl-card"><ErrorState onRetry={() => this.setState({ error: null })} /></div>
        </div>
      );
    }
    return this.props.children;
  }
}
