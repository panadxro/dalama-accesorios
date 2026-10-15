import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Tarjeta: superficie blanca, borde, radio md, sombra-1, padding space-6. */
export function Card({
  as: Tag = 'section', className, children, ...props
}: HTMLAttributes<HTMLElement> & { as?: 'section' | 'div' | 'article' }) {
  return (
    <Tag className={cn('dl-card', className)} {...props}>
      {children}
    </Tag>
  );
}

/** Overline + título + línea roja de 24 × 3 px. Patrón de encabezado de todas las tarjetas del diseño. */
export function SectionTitle({
  overline, title, as: H = 'h2', action, className, id,
}: { overline?: string; title: ReactNode; as?: 'h2' | 'h3'; action?: ReactNode; className?: string; id?: string }) {
  const head = (
    <div className="min-w-0">
      {overline && <div className="dl-overline">{overline}</div>}
      <H id={id} className="dl-card-title">{title}</H>
      <span className="dl-brandline" aria-hidden="true" />
    </div>
  );
  if (!action) return <div className={className}>{head}</div>;
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      {head}
      <div className="flex shrink-0 items-center gap-2">{action}</div>
    </div>
  );
}

/** Overline suelto con línea roja (encabezado de sección de página). */
export function Overline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="dl-overline">{children}</div>
      <span className="dl-brandline" aria-hidden="true" />
    </div>
  );
}
