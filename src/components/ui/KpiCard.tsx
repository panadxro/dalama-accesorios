import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  /** Variación ya formateada: "10,2 %" */
  delta?: string;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'flat';
  /** Si la variación es buena. Por defecto, subir es bueno. */
  positive?: boolean;
  icon?: IconName;
  className?: string;
}

export function KpiCard({ label, value, delta, deltaLabel, trend = 'flat', positive, icon, className }: KpiCardProps) {
  const good = positive ?? trend === 'up';
  const cls = trend === 'flat' ? 'is-flat' : good ? 'is-good' : 'is-bad';
  const trendIcon: IconName = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'minus';
  return (
    <section className={cn('dl-kpi', className)} aria-label={label}>
      <div className="dl-kpi-head">
        <div>
          <div className="dl-overline">{label}</div>
          <span className="dl-brandline" aria-hidden="true" />
        </div>
        {icon && <Icon name={icon} size={20} />}
      </div>
      <div className="dl-kpi-value">{value}</div>
      {delta && (
        <div className="dl-kpi-foot">
          <span className={cn('dl-delta', cls)}>
            <Icon name={trendIcon} size={16} strokeWidth={2} />
            {delta}
          </span>
          <span>{deltaLabel ?? 'vs. período anterior'}</span>
        </div>
      )}
    </section>
  );
}
