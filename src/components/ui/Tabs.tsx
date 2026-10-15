import { useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (id: T) => void;
  /** Nombre accesible de la lista de pestañas. */
  label: string;
  /** Prefijo para enlazar con los paneles (aria-controls = `${idPrefix}-panel-${id}`). */
  idPrefix?: string;
  className?: string;
}

/** Pestañas del kit: subrayado bold-red, contador, flechas izquierda/derecha. */
export function Tabs<T extends string>({ tabs, value, defaultValue, onChange, label, idPrefix, className }: TabsProps<T>) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState<T | undefined>(defaultValue ?? tabs[0]?.id);
  const current = controlled ? value : inner;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = (id: T) => {
    if (!controlled) setInner(id);
    onChange?.(id);
  };

  const onKey = (e: KeyboardEvent) => {
    const enabled = tabs.filter((t) => !t.disabled);
    const i = enabled.findIndex((t) => t.id === current);
    let next: TabItem<T> | undefined;
    if (e.key === 'ArrowRight') next = enabled[(i + 1) % enabled.length];
    if (e.key === 'ArrowLeft') next = enabled[(i - 1 + enabled.length) % enabled.length];
    if (e.key === 'Home') next = enabled[0];
    if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next) {
      e.preventDefault();
      select(next.id);
      refs.current[next.id]?.focus();
    }
  };

  return (
    <div className={cn('dl-tabs', className)} role="tablist" aria-label={label} onKeyDown={onKey}>
      {tabs.map((t) => {
        const sel = t.id === current;
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            type="button"
            role="tab"
            id={idPrefix ? `${idPrefix}-tab-${t.id}` : undefined}
            aria-controls={idPrefix ? `${idPrefix}-panel-${t.id}` : undefined}
            className="dl-tab"
            aria-selected={sel}
            tabIndex={sel ? 0 : -1}
            disabled={t.disabled}
            onClick={() => select(t.id)}
          >
            {t.label}
            {t.count != null && <span className="dl-tab-count">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
