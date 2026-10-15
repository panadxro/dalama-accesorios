import type { ReactNode } from 'react';
import * as DM from '@radix-ui/react-dropdown-menu';
import * as PO from '@radix-ui/react-popover';
import * as TT from '@radix-ui/react-tooltip';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

/** Menú desplegable (base shadcn/Radix): navegación con flechas, Escape y foco gestionado. */
export interface MenuItem {
  label: string;
  icon?: IconName;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

export function Menu({
  trigger, items, align = 'end', label,
}: { trigger: ReactNode; items: MenuItem[]; align?: 'start' | 'end'; label?: string }) {
  return (
    <DM.Root>
      <DM.Trigger asChild>{trigger}</DM.Trigger>
      <DM.Portal>
        <DM.Content className="dl-menu" align={align} sideOffset={6} aria-label={label}>
          {items.map((it) => (
            <div key={it.label}>
              {it.separatorBefore && <DM.Separator className="dl-menu-sep" />}
              <DM.Item className={cn('dl-menu-item', it.danger && 'is-danger')} disabled={it.disabled} onSelect={it.onSelect}>
                {it.icon && <Icon name={it.icon} size={16} />}
                {it.label}
              </DM.Item>
            </div>
          ))}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

export function Popover({
  trigger, children, align = 'end', width = 360, label, open, onOpenChange,
}: {
  trigger: ReactNode; children: ReactNode; align?: 'start' | 'center' | 'end'; width?: number; label?: string;
  open?: boolean; onOpenChange?: (o: boolean) => void;
}) {
  return (
    <PO.Root open={open} onOpenChange={onOpenChange}>
      <PO.Trigger asChild>{trigger}</PO.Trigger>
      <PO.Portal>
        <PO.Content className="dl-popover" align={align} sideOffset={8} style={{ width, maxWidth: 'calc(100vw - 32px)' }} aria-label={label}>
          {children}
        </PO.Content>
      </PO.Portal>
    </PO.Root>
  );
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TT.Provider delayDuration={300}>{children}</TT.Provider>;
}

export function Tooltip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <TT.Root>
      <TT.Trigger asChild>{children}</TT.Trigger>
      <TT.Portal>
        <TT.Content className="dl-tooltip" side={side} sideOffset={6}>
          {content}
        </TT.Content>
      </TT.Portal>
    </TT.Root>
  );
}
