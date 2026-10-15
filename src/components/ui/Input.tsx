import {
  forwardRef, useEffect, useId, useState,
  type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';
import { formatARS, parseARS, type Centavos } from '@/lib/format';
import { Icon } from './Icon';

interface FieldProps {
  label?: string;
  /** Oculta la etiqueta visualmente pero la mantiene para lectores de pantalla. */
  hideLabel?: boolean;
  helper?: ReactNode;
  /** Mensaje de error: se muestra con ícono y reemplaza al helper. */
  error?: string;
  required?: boolean;
  className?: string;
}

/** Etiqueta + control + ayuda/error. Usalo para envolver controles propios. */
export function Field({
  id, label, hideLabel, helper, error, required, className, children,
}: FieldProps & { id: string; children: ReactNode }) {
  const helpId = `${id}-ayuda`;
  return (
    <div className={cn('dl-field', className)}>
      {label && (
        <label htmlFor={id} className={cn('dl-label', hideLabel && 'sr-only')}>
          {label}
          {required && <span className="dl-req" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <div id={helpId} className="dl-help is-error">
          <Icon name="alert-circle" size={16} />
          <span>{error}</span>
        </div>
      ) : helper ? (
        <div id={helpId} className="dl-help">{helper}</div>
      ) : null}
    </div>
  );
}

function useFieldIds(given?: string) {
  const auto = useId();
  const id = given ?? `dl-${auto.replace(/:/g, '')}`;
  return { id, helpId: `${id}-ayuda` };
}

const controlClass = (o: { error?: string; disabled?: boolean; money?: boolean }) =>
  cn('dl-input-control', o.money && 'is-money', o.error && 'is-error', o.disabled && 'is-disabled');

type NativeInput = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export interface TextInputProps extends FieldProps, NativeInput {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, hideLabel, helper, error, required, className, id: givenId, disabled, leading, trailing, type = 'text', ...rest },
  ref,
) {
  const { id, helpId } = useFieldIds(givenId);
  return (
    <Field id={id} label={label} hideLabel={hideLabel} helper={helper} error={error} required={required} className={className}>
      <div className={controlClass({ error, disabled })}>
        {leading}
        <input
          ref={ref}
          id={id}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? helpId : undefined}
          {...rest}
        />
        {trailing}
      </div>
    </Field>
  );
});

export const SearchInput = forwardRef<HTMLInputElement, TextInputProps>(function SearchInput(props, ref) {
  return <TextInput ref={ref} type="search" leading={<Icon name="search" size={16} />} {...props} />;
});

export const DateInput = forwardRef<HTMLInputElement, TextInputProps>(function DateInput(props, ref) {
  return <TextInput ref={ref} type="date" {...props} />;
});

export interface SelectProps extends FieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: Array<string | { value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hideLabel, helper, error, required, className, id: givenId, disabled, options, ...rest },
  ref,
) {
  const { id, helpId } = useFieldIds(givenId);
  return (
    <Field id={id} label={label} hideLabel={hideLabel} helper={helper} error={error} required={required} className={className}>
      <div className={controlClass({ error, disabled })}>
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? helpId : undefined}
          {...rest}
        >
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return (
              <option key={opt.value} value={opt.value} disabled={'disabled' in opt ? opt.disabled : undefined}>
                {opt.label}
              </option>
            );
          })}
        </select>
        <Icon name="chevron-down" size={16} className="dl-select-chevron" />
      </div>
    </Field>
  );
});

export interface MoneyInputProps extends FieldProps, Omit<NativeInput, 'value' | 'onChange' | 'defaultValue'> {
  /** Valor en centavos. */
  value: Centavos | null;
  onValueChange: (centavos: Centavos | null) => void;
}

/** Monto con prefijo $, alineado a la derecha. Muestra "1.234,56" y entrega centavos. */
export function MoneyInput({
  label, hideLabel, helper, error, required, className, id: givenId, disabled, value, onValueChange, ...rest
}: MoneyInputProps) {
  const { id, helpId } = useFieldIds(givenId);
  const mostrar = (v: Centavos | null) => (v == null ? '' : formatARS(v).replace('$ ', ''));
  const [texto, setTexto] = useState(mostrar(value));
  const [editando, setEditando] = useState(false);
  useEffect(() => {
    if (!editando) setTexto(mostrar(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editando]);
  return (
    <Field id={id} label={label} hideLabel={hideLabel} helper={helper} error={error} required={required} className={className}>
      <div className={controlClass({ error, disabled, money: true })}>
        <span className="dl-prefix" aria-hidden="true">$</span>
        <input
          id={id}
          inputMode="decimal"
          placeholder="0,00"
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? helpId : undefined}
          value={texto}
          onFocus={() => {
            setEditando(true);
            setTexto(value == null ? '' : String(value / 100).replace('.', ','));
          }}
          onBlur={() => setEditando(false)}
          onChange={(e) => {
            setTexto(e.target.value);
            onValueChange(parseARS(e.target.value));
          }}
          {...rest}
        />
      </div>
    </Field>
  );
}

export interface TextareaProps extends FieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hideLabel, helper, error, required, className, id: givenId, disabled, rows = 4, ...rest },
  ref,
) {
  const { id, helpId } = useFieldIds(givenId);
  return (
    <Field id={id} label={label} hideLabel={hideLabel} helper={helper} error={error} required={required} className={className}>
      <div className={cn(controlClass({ error, disabled }), 'items-stretch py-2')}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? helpId : undefined}
          className="w-full flex-1 resize-y border-0 bg-transparent p-0 font-sans text-body text-texto outline-none placeholder:text-neutro-500"
          {...rest}
        />
      </div>
    </Field>
  );
});
