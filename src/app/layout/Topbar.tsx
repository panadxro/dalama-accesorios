import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Menu, Popover } from '@/components/ui/Menu';
import { ConfirmModal } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/shared/States';
import { useUi, USUARIO_DEMO } from '@/store/ui';
import { useDemo } from '@/store/demo';
import { useAvisos, type Aviso } from '@/store/selectores';

export function DemoTag() {
  return (
    <span className="dl-demo-tag" title="Esta es una demostración. Todos los datos son ficticios y no salen de tu navegador.">
      Demo · datos ficticios
    </span>
  );
}

/** Buscador global: Ctrl K (o ⌘K) lo enfoca; Enter abre los resultados. */
function GlobalSearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const ref = useRef<HTMLInputElement>(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ref.current?.focus();
        ref.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/buscar?q=${encodeURIComponent(term)}` : '/buscar');
  };

  return (
    <form role="search" onSubmit={submit} className="min-w-[180px] shrink">
      <label className="dl-search w-[340px] max-w-full">
        <Icon name="search" size={16} />
        <span className="sr-only">Buscar en DALAMA</span>
        <input ref={ref} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente, producto o comprobante" />
        <span className="dl-kbd" aria-hidden="true">{isMac ? '⌘ K' : 'Ctrl K'}</span>
      </label>
    </form>
  );
}

function Notifications({ avisos }: { avisos: Aviso[] }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="Avisos"
      trigger={
        <button type="button" className="dl-iconbtn dl-bell" aria-label={`Avisos${avisos.length ? `: ${avisos.length} nuevos` : ''}`}>
          <Icon name="bell" size={20} />
          {avisos.length > 0 && <span className="dl-bell-dot" aria-hidden="true">{avisos.length}</span>}
        </button>
      }
    >
      <div className="border-b border-borde px-4 py-3">
        <div className="dl-overline">Avisos</div>
      </div>
      {avisos.length === 0 ? (
        <EmptyState icon="bell" title="No hay avisos nuevos" text="Acá vas a ver presupuestos sin respuesta, deudas vencidas y stock bajo." className="py-8" />
      ) : (
        <ul className="max-h-[360px] overflow-y-auto py-1">
          {avisos.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-arena-50 focus-visible:bg-arena-50"
                onClick={() => { setOpen(false); if (a.to) navigate(a.to); }}
              >
                <span className="text-body font-semibold">{a.title}</span>
                <span className="text-body-small text-texto-secundario">{a.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  );
}

/** Confirmación para volver a los datos de ejemplo. Se usa desde el menú de usuario y desde Configuración. */
export function ReiniciarDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const reiniciar = useDemo((s) => s.reiniciar);
  return (
    <ConfirmModal
      open={open}
      destructive
      title="¿Reiniciar la demo?"
      confirmLabel="Reiniciar demo"
      onCancel={onClose}
      onConfirm={() => {
        reiniciar();
        onClose();
        navigate('/inicio');
        toast.success('Demo reiniciada', 'Se restauraron los datos de ejemplo: clientes, pedidos, facturas, stock y mensajes vuelven a su estado inicial.');
      }}
    >
      Se borran los cambios que hiciste y se restauran los datos de ejemplo. Podés volver a recorrer todo desde el principio.
    </ConfirmModal>
  );
}

export function UserMenu({ compact }: { compact?: boolean }) {
  const navigate = useNavigate();
  const salir = useUi((s) => s.salir);
  const [reiniciar, setReiniciar] = useState(false);
  const user = USUARIO_DEMO;
  return (
    <>
    <ReiniciarDemoModal open={reiniciar} onClose={() => setReiniciar(false)} />
    <Menu
      label="Menú de usuario"
      items={[
        { label: 'Configuración', icon: 'settings', onSelect: () => navigate('/configuracion') },
        { label: 'Reiniciar demo', icon: 'reset', onSelect: () => setReiniciar(true) },
        { label: 'Salir de la demo', icon: 'log-out', separatorBefore: true, onSelect: () => { salir(); navigate('/'); } },
      ]}
      trigger={
        compact ? (
          <button type="button" className="dl-avatar cursor-pointer border-0" aria-label={`${user.name}, ${user.role}. Abrir menú`}>
            {user.initials}
          </button>
        ) : (
          <button type="button" className="dl-user cursor-pointer rounded-sm border-y-0 border-r-0 bg-transparent py-0 pr-1 text-left" aria-label={`${user.name}, ${user.role}. Abrir menú`}>
            <span className="dl-avatar" aria-hidden="true">{user.initials}</span>
            <span className="hidden xl:block">
              <span className="dl-user-name block">{user.name}</span>
              <span className="dl-user-role block">{user.role}</span>
            </span>
            <Icon name="chevron-down" size={16} className="text-neutro-700" />
          </button>
        )
      }
    />
    </>
  );
}

export interface TopbarProps {
  title: string;
  overline?: string;
}

/** Barra superior del kit (escritorio). */
export function Topbar({ title, overline }: TopbarProps) {
  const avisos = useAvisos();
  return (
    <header className="dl-topbar">
      <div className="dl-topbar-title min-w-0 flex-auto">
        {overline && <div className="dl-overline truncate">{overline}</div>}
        <h1 className="truncate">{title}</h1>
      </div>
      <div className="dl-topbar-tools min-w-0 shrink-[6] flex-nowrap">
        <DemoTag />
        <GlobalSearch />
        <Notifications avisos={avisos} />
        <UserMenu />
      </div>
    </header>
  );
}
