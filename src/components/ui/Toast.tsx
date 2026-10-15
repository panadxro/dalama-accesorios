import { useEffect, type ReactNode } from 'react';
import { create } from 'zustand';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';
import { TONE_ICON, TONE_WORD, type Tone } from './Alert';

export interface ToastData {
  id: number;
  tone: Tone;
  title: string;
  /** Explicación del efecto de la acción en el resto del sistema. */
  description?: ReactNode;
  action?: { label: string; onClick: () => void };
  /** ms; 0 = no se cierra solo. */
  duration: number;
}

interface ToastState {
  toasts: ToastData[];
  push: (t: Omit<ToastData, 'id' | 'duration' | 'tone'> & { tone?: Tone; duration?: number }) => number;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = nextId++;
    // Los toasts de la demo explican efectos: se dejan más tiempo para leerlos.
    const toast: ToastData = { tone: 'success', duration: 7000, ...t, id };
    set((s) => ({ toasts: [...s.toasts.slice(-3), toast] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Atajo: toast.success('Factura emitida', 'Se sumó $ … a la cuenta corriente…') */
export const toast = {
  success: (title: string, description?: ReactNode) => useToasts.getState().push({ tone: 'success', title, description }),
  info: (title: string, description?: ReactNode) => useToasts.getState().push({ tone: 'info', title, description }),
  warning: (title: string, description?: ReactNode) => useToasts.getState().push({ tone: 'warning', title, description }),
  error: (title: string, description?: ReactNode) => useToasts.getState().push({ tone: 'error', title, description, duration: 0 }),
  show: (t: Parameters<ToastState['push']>[0]) => useToasts.getState().push(t),
};

export function Toast({
  tone = 'success', title, children, action, onClose, className,
}: { tone?: Tone; title: string; children?: ReactNode; action?: ReactNode; onClose?: () => void; className?: string }) {
  return (
    <div className={cn('dl-toast', `dl-tone-${tone}`, className)} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="dl-tone-ico"><Icon name={TONE_ICON[tone]} size={20} title={TONE_WORD[tone]} /></span>
      <div className="dl-msg-body">
        <p className="dl-msg-title">{title}</p>
        {children && <div className="dl-msg-text">{children}</div>}
        {action && <div className="dl-msg-action">{action}</div>}
      </div>
      {onClose && (
        <button type="button" className="dl-iconbtn" aria-label="Cerrar aviso" onClick={onClose} style={{ marginTop: -6, marginRight: -6 }}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}

function ToastItem({ t }: { t: ToastData }) {
  const dismiss = useToasts((s) => s.dismiss);
  useEffect(() => {
    if (!t.duration) return;
    const timer = window.setTimeout(() => dismiss(t.id), t.duration);
    return () => window.clearTimeout(timer);
  }, [t.id, t.duration, dismiss]);
  return (
    <Toast
      tone={t.tone}
      title={t.title}
      onClose={() => dismiss(t.id)}
      action={
        t.action ? (
          <button type="button" className="dl-btn dl-btn-tertiary dl-btn-s" style={{ marginLeft: -8 }} onClick={() => { t.action!.onClick(); dismiss(t.id); }}>
            {t.action.label}
          </button>
        ) : undefined
      }
    >
      {t.description}
    </Toast>
  );
}

/** Se monta una vez en la app. Región viva para lectores de pantalla. */
export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="dl-toaster" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => <ToastItem key={t.id} t={t} />)}
    </div>
  );
}
