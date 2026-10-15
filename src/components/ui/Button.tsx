import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 's' | 'm';

interface CommonProps {
  /** primary = acción principal (una por vista) · secondary · tertiary = texto · destructive */
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  /** Destructivo relleno (confirmaciones de borrado). */
  solid?: boolean;
}

export function buttonClass({ variant = 'primary', size = 'm', solid, className }: CommonProps & { className?: string }) {
  return cn('dl-btn', `dl-btn-${variant}`, `dl-btn-${size}`, solid && variant === 'destructive' && 'is-solid', className);
}

export interface ButtonProps extends CommonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'm', icon, iconRight, loading, solid, className, children, type = 'button', disabled, ...rest },
  ref,
) {
  const iconSize = size === 's' ? 16 : 20;
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass({ variant, size, solid, className: cn(loading && 'is-loading', className) })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Icon name="loader" size={iconSize} className="dl-spin" /> : icon ? <Icon name={icon} size={iconSize} /> : null}
      {children != null && <span>{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
});

/** Link de la app con aspecto de botón (navegación interna). */
export function ButtonLink({
  variant = 'secondary', size = 'm', icon, iconRight, solid, className, children, ...rest
}: CommonProps & LinkProps) {
  const iconSize = size === 's' ? 16 : 20;
  return (
    <Link className={buttonClass({ variant, size, solid, className })} {...rest}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children != null && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </Link>
  );
}

/** Link externo con aspecto de botón. */
export function ButtonAnchor({
  variant = 'secondary', size = 'm', icon, iconRight, solid, className, children, ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const iconSize = size === 's' ? 16 : 20;
  return (
    <a className={buttonClass({ variant, size, solid, className })} {...rest}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children != null && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </a>
  );
}

/** Botón de solo ícono (32 px; 44 px en celular). Siempre con aria-label. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string; danger?: boolean; iconSize?: number }
>(function IconButton({ icon, label, danger, iconSize = 16, className, type = 'button', ...rest }, ref) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={cn('dl-iconbtn', danger && 'is-danger', className)} {...rest}>
      <Icon name={icon} size={iconSize} />
    </button>
  );
});
