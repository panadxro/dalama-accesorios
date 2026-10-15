import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { NAV, navActivo } from '../nav';

export interface SidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
  /** Contadores por ítem (p. ej. mensajes sin leer en la bandeja). */
  counts?: Partial<Record<string, number>>;
  onNavigate?: () => void;
  className?: string;
}

/** Barra lateral del kit: ink-black, logo negativo, ítem activo con marca rojo-dalama. */
export function Sidebar({ collapsed, onToggle, counts = {}, onNavigate, className }: SidebarProps) {
  const { pathname } = useLocation();
  const active = navActivo(pathname);
  return (
    <aside className={cn('dl-sidebar', collapsed && 'is-collapsed', className)} aria-label="Navegación principal">
      <div className="dl-sidebar-logo">
        <Link to="/inicio" onClick={onNavigate} className="rounded-sm focus-visible:outline-foco-oscuro" aria-label="DALAMA · Ir al inicio">
          {collapsed ? (
            <img src="/brand/dalama-isotipo-negativo.png" alt="" width={36} style={{ width: 36 }} />
          ) : (
            <img src="/brand/dalama-logo-negativo.png" alt="" width={196} style={{ width: 196 }} />
          )}
        </Link>
      </div>
      <nav className="dl-nav">
        {NAV.map((g) => (
          <div key={g.label} className="dl-nav-group">
            <div className="dl-nav-heading">{g.label}</div>
            {g.items.map((it) => {
              const count = counts[it.id];
              return (
                <Link
                  key={it.id}
                  to={it.to}
                  onClick={onNavigate}
                  className="dl-nav-item"
                  aria-current={active === it.id ? 'page' : undefined}
                  title={collapsed ? it.label : undefined}
                >
                  <Icon name={it.icon} size={20} />
                  <span className="dl-nav-label">{it.label}</span>
                  {count ? <span className="dl-nav-count" aria-label={`${count} sin leer`}>{count}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      {onToggle && (
        <div className="dl-sidebar-foot">
          <button type="button" className="dl-nav-item" onClick={onToggle} aria-expanded={!collapsed} title={collapsed ? 'Expandir menú' : undefined}>
            <Icon name={collapsed ? 'panel-right' : 'panel-left'} size={20} />
            <span className="dl-nav-label">{collapsed ? 'Expandir menú' : 'Colapsar menú'}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
