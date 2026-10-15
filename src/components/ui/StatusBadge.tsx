import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

/** Badge genérico: siempre con texto; el color solo no comunica. */
export function Badge({
  tone = 'neutral', icon, strong, className, children,
}: { tone?: BadgeTone; icon?: IconName; strong?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn('dl-badge', `dl-badge-${tone}`, strong && 'dl-badge-strong', className)}>
      {icon && <Icon name={icon} size={14} strokeWidth={2} />}
      {children}
    </span>
  );
}

/** Estados del kit (design/ui-kit/index.d.ts). */
export type KitStatus =
  | 'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'vencido' | 'pagado' | 'deuda-vencida' | 'stock-bajo';

const STATUS: Record<KitStatus, [BadgeTone, IconName, string]> = {
  borrador: ['neutral', 'pencil', 'Borrador'],
  enviado: ['info', 'send', 'Enviado'],
  aceptado: ['success', 'check', 'Aceptado'],
  rechazado: ['error', 'x', 'Rechazado'],
  vencido: ['warning', 'clock', 'Vencido'],
  pagado: ['success', 'check-circle', 'Pagado'],
  'deuda-vencida': ['error', 'alert-triangle', 'Deuda vencida'],
  'stock-bajo': ['warning', 'alert-triangle', 'Stock bajo'],
};

/** Etiqueta de estado. `children` cambia el texto ("Vencido · 36 días"); color e ícono los define el estado. */
export function StatusBadge({ status, children, className }: { status: KitStatus; children?: ReactNode; className?: string }) {
  const [tone, icon, label] = STATUS[status];
  return (
    <Badge tone={tone} icon={icon} className={className}>
      {children ?? label}
    </Badge>
  );
}
