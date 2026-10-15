import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export type Tone = 'success' | 'warning' | 'error' | 'info';

export const TONE_ICON: Record<Tone, IconName> = {
  success: 'check-circle', warning: 'alert-triangle', error: 'alert-circle', info: 'info',
};
export const TONE_WORD: Record<Tone, string> = {
  success: 'Éxito', warning: 'Advertencia', error: 'Error', info: 'Información',
};

export function Alert({
  tone = 'info', title, children, action, className,
}: { tone?: Tone; title?: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('dl-alert', `dl-tone-${tone}`, className)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={TONE_ICON[tone]} size={20} title={TONE_WORD[tone]} />
      <div className="dl-msg-body">
        {title && <p className="dl-msg-title">{title}</p>}
        {children && <div className="dl-msg-text">{children}</div>}
      </div>
      {action}
    </div>
  );
}
