import type { ReactNode } from 'react';
import * as RD from '@radix-ui/react-dialog';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { Icon } from './Icon';

/**
 * Modales sobre Radix Dialog (base shadcn): foco atrapado, Escape y retorno de foco.
 * Estilo del kit: overlay ink-black 48 %, radio md, sombra-2, padding space-6.
 */

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  overline?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Ancho máximo en px (440 por defecto, como el modal del kit). */
  width?: number;
}

export function Dialog({ open, onOpenChange, title, description, overline, children, footer, width = 440 }: DialogProps) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="dl-overlay animate-dl-fade" />
        <RD.Content
          className="dl-modal fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
          style={{ width, maxWidth: 'calc(100vw - 32px)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {overline && <div className="dl-overline">{overline}</div>}
              <RD.Title className="dl-modal-title">{title}</RD.Title>
              {description ? <RD.Description className="dl-modal-text">{description}</RD.Description> : <RD.Description className="sr-only">{typeof title === 'string' ? title : ''}</RD.Description>}
            </div>
            <RD.Close asChild>
              <button type="button" className="dl-iconbtn -mr-2 -mt-1" aria-label="Cerrar">
                <Icon name="x" size={20} />
              </button>
            </RD.Close>
          </div>
          {children}
          {footer && <div className="dl-modal-actions">{footer}</div>}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  /** El botón dice qué pasa, con verbo: "Convertir en pedido", nunca "Aceptar". */
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal de confirmación del kit. */
export function ConfirmModal({
  open, title, children, confirmLabel, cancelLabel = 'Cancelar', destructive, loading, onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <RD.Root open={open} onOpenChange={(o) => { if (!o && !loading) onCancel(); }}>
      <RD.Portal>
        <RD.Overlay className="dl-overlay animate-dl-fade" />
        <RD.Content
          role="alertdialog"
          className="dl-modal fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ maxWidth: 'calc(100vw - 32px)' }}
          onOpenAutoFocus={(e) => {
            // Foco inicial en "Cancelar", como el kit: evita confirmar sin querer.
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus();
          }}
        >
          <div className={cn('dl-modal-head', destructive ? 'dl-tone-error' : 'dl-tone-info')}>
            <span className="dl-tone-ico"><Icon name={destructive ? 'alert-triangle' : 'info'} size={20} /></span>
            <div>
              <RD.Title className="dl-modal-title">{title}</RD.Title>
              <RD.Description asChild>
                <div className="dl-modal-text">{children}</div>
              </RD.Description>
            </div>
          </div>
          <div className="dl-modal-actions">
            <Button variant="secondary" onClick={onCancel} disabled={loading} data-cancel="">
              {cancelLabel}
            </Button>
            <Button variant={destructive ? 'destructive' : 'primary'} solid={destructive} onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  overline?: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

/** Panel lateral derecho para detalles y formularios largos (registrar cobro, editar presupuesto…). */
export function Sheet({ open, onOpenChange, title, overline, description, children, footer, width = 560 }: SheetProps) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="dl-overlay animate-dl-fade" />
        <RD.Content className="dl-sheet" style={{ width }}>
          <div className="dl-sheet-head">
            <div className="min-w-0">
              {overline && <div className="dl-overline">{overline}</div>}
              <RD.Title className="dl-modal-title">{title}</RD.Title>
              <span className="dl-brandline" aria-hidden="true" />
              {description ? <RD.Description className="dl-modal-text mt-2">{description}</RD.Description> : <RD.Description className="sr-only">{typeof title === 'string' ? title : ''}</RD.Description>}
            </div>
            <RD.Close asChild>
              <button type="button" className="dl-iconbtn" aria-label="Cerrar panel">
                <Icon name="x" size={20} />
              </button>
            </RD.Close>
          </div>
          <div className="dl-sheet-body">{children}</div>
          {footer && <div className="dl-sheet-foot">{footer}</div>}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}
