import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Interruptor del diseño (Stock: "Solo bajo mínimo o sin stock"). Rectangular, sin píldoras. */
export function Switch({
  checked, onChange, children, className, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('dl-switch', disabled && 'cursor-not-allowed opacity-60', className)}
    >
      <span className="dl-switch-track"><span className="dl-switch-knob" /></span>
      {children}
    </button>
  );
}
