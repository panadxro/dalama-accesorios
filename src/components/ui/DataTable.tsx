import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';
import { SectionTitle } from './Card';

export interface DataTableColumn<R> {
  key: string;
  label: string;
  align?: 'left' | 'right';
  width?: string | number;
  render?: (row: R) => ReactNode;
}

export interface DataTableAction {
  label: string;
  icon: IconName;
  danger?: boolean;
  onClick?: () => void;
  /** Navegación interna en lugar de acción. */
  to?: string;
}

export interface DataTableProps<R> {
  title?: string;
  overline?: string;
  headerAction?: ReactNode;
  /** Texto para lectores de pantalla. Por defecto, el título. */
  caption?: string;
  columns: DataTableColumn<R>[];
  rows: R[];
  rowKey: (row: R) => string;
  /** Nombre corto de la fila para las acciones ("Editar P-0994"). */
  rowLabel?: (row: R) => string;
  rowActions?: (row: R) => DataTableAction[];
  /** Si se pasa sin onPageChange, la tabla pagina sola. */
  pageSize?: number;
  page?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  pagination?: boolean;
  loading?: boolean;
  emptyTitle?: string;
  emptyText?: string;
  emptyIcon?: IconName;
  emptyAction?: ReactNode;
  rowClassName?: (row: R) => string | undefined;
  className?: string;
}

const srOnly = 'sr-only';

export function DataTable<R>({
  title, overline, headerAction, caption, columns, rows, rowKey, rowLabel, rowActions,
  pageSize = 10, page: pageProp, total: totalProp, onPageChange, pagination = true, loading,
  emptyTitle = 'Todavía no hay datos', emptyText, emptyIcon = 'inbox', emptyAction, rowClassName, className,
}: DataTableProps<R>) {
  const controlled = onPageChange != null;
  const [innerPage, setInnerPage] = useState(1);
  const page = controlled ? pageProp ?? 1 : innerPage;
  const total = controlled ? totalProp ?? rows.length : rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  // Si se filtran filas y la página actual queda fuera de rango, volver a la primera.
  useEffect(() => {
    if (!controlled && innerPage > pages) setInnerPage(1);
  }, [controlled, innerPage, pages]);

  const visible = pagination && !controlled ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const go = (p: number) => {
    if (p < 1 || p > pages) return;
    if (controlled) onPageChange?.(p);
    else setInnerPage(p);
  };
  const hasActions = typeof rowActions === 'function';

  let body: ReactNode;
  if (loading) {
    body = (
      <div className="flex flex-col gap-3 px-6 pb-6 pt-2" role="status" aria-label="Cargando datos">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="dl-skeleton h-8" />
        ))}
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="dl-empty" role="status">
        <div className="dl-empty-mark"><Icon name={emptyIcon} size={24} /></div>
        <p className="dl-empty-title">{emptyTitle}</p>
        {emptyText && <p className="dl-empty-text">{emptyText}</p>}
        {emptyAction}
      </div>
    );
  } else {
    body = (
      <div className="dl-table-scroll">
        <table className="dl-table">
          <caption className={srOnly}>{caption ?? title}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={c.align === 'right' ? 'is-right' : undefined} style={c.width ? { width: c.width } : undefined}>
                  {c.label}
                </th>
              ))}
              {hasActions && (
                <th scope="col" className="is-right"><span className={srOnly}>Acciones</span></th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const label = rowLabel?.(r);
              return (
                <tr key={rowKey(r)} className={rowClassName?.(r)}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.align === 'right' ? 'is-right' : undefined}>
                      {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="is-right">
                      <div className="dl-row-actions">
                        {rowActions!(r).slice(0, 4).map((a) => {
                          const aria = `${a.label}${label ? ` ${label}` : ''}`;
                          return a.to ? (
                            <Link key={a.label} to={a.to} className={cn('dl-iconbtn', a.danger && 'is-danger')} aria-label={aria} title={a.label}>
                              <Icon name={a.icon} size={16} />
                            </Link>
                          ) : (
                            <button key={a.label} type="button" className={cn('dl-iconbtn', a.danger && 'is-danger')} aria-label={aria} title={a.label} onClick={a.onClick}>
                              <Icon name={a.icon} size={16} />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const nums: Array<number | '…'> = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }

  return (
    <section className={cn('dl-table-card', className)} aria-label={title}>
      {(title || headerAction) && (
        <div className="dl-table-head">
          <SectionTitle overline={overline} title={title ?? ''} as="h2" />
          {headerAction}
        </div>
      )}
      {body}
      {!loading && rows.length > 0 && pagination && pages > 1 && (
        <nav className="dl-pager" aria-label="Paginación">
          <span className="dl-num">Mostrando {from}–{to} de {total}</span>
          <div className="dl-pages">
            <button type="button" className="dl-page" aria-label="Página anterior" disabled={page <= 1} onClick={() => go(page - 1)}>
              <Icon name="chevron-left" size={16} />
            </button>
            {nums.map((n, i) =>
              n === '…' ? (
                <span key={`e${i}`} className="dl-page" aria-hidden="true" style={{ border: 0, background: 'transparent', cursor: 'default' }}>…</span>
              ) : (
                <button key={n} type="button" className="dl-page" aria-current={n === page ? 'page' : undefined} aria-label={`Página ${n}`} onClick={() => go(n)}>
                  {n}
                </button>
              ),
            )}
            <button type="button" className="dl-page" aria-label="Página siguiente" disabled={page >= pages} onClick={() => go(page + 1)}>
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </nav>
      )}
      {!loading && rows.length > 0 && pagination && pages === 1 && (
        <div className="dl-pager"><span className="dl-num">Mostrando {total} {total === 1 ? 'registro' : 'registros'}</span></div>
      )}
    </section>
  );
}
