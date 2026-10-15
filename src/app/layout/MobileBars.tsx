import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { NAV_MOVIL, navMovilActivo } from '../nav';
import { UserMenu } from './Topbar';

/** Cabecera ink-black de las pantallas de celular del diseño. */
export function MobileBar({ title, overline, onMenu }: { title: string; overline?: string; onMenu: () => void }) {
  return (
    <header className="dl-mobilebar">
      <button type="button" className="dl-iconbtn -ml-2" aria-label="Abrir menú" onClick={onMenu}>
        <Icon name="menu" size={24} />
      </button>
      <img src="/brand/dalama-isotipo-negativo.png" alt="" width={24} className="w-6 shrink-0" />
      <div className="min-w-0 flex-1">
        {overline && <div className="truncate text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-neutro-300">{overline}</div>}
        <h1 className="truncate text-[18px] font-semibold leading-6">{title}</h1>
      </div>
      <span className="rounded-sm border border-dashed border-neutro-500 px-1.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-neutro-300" title="Demo con datos ficticios">
        Demo
      </span>
      <Link to="/buscar" className="dl-iconbtn" aria-label="Buscar">
        <Icon name="search" size={22} />
      </Link>
      <UserMenu compact />
    </header>
  );
}

/** Navegación inferior en celular. */
export function TabBar() {
  const { pathname } = useLocation();
  const active = navMovilActivo(pathname);
  return (
    <nav className="dl-tabbar" aria-label="Navegación rápida">
      {NAV_MOVIL.map((it) => (
        <Link key={it.id} to={it.to} className="dl-tabbar-item" aria-current={active === it.id ? 'page' : undefined}>
          <Icon name={it.icon} size={22} />
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
