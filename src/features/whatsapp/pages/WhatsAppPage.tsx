import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, Card, Icon, SearchInput, StatusBadge, Tabs, toast } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { Avatar } from '@/components/negocio/Datos';
import { EnviarWhatsApp } from '@/components/negocio/EnviarWhatsApp';
import { CONDICION_IVA_CORTA, TIPO_CLIENTE } from '@/domain/calculos';
import type { Conversacion } from '@/domain/types';
import { cn } from '@/lib/cn';
import { diasEntre } from '@/lib/fechas';
import { useEsEscritorio } from '@/lib/useMedia';
import { formatCUIT, formatFecha, formatHora } from '@/lib/format';
import { MENSAJES_SIMULADOS } from '@/data/seed/conversaciones';
import { ejecutar, marcarLeida, recibirMensaje, responder } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';
import { PanelPresupuestoIA } from '../components/PanelPresupuestoIA';

type Filtro = 'sin' | 'todas' | 'presupuestadas';

const ultimo = (c: Conversacion) => c.mensajes[c.mensajes.length - 1];

function horaCorta(iso: string): string {
  const d = diasEntre(iso, new Date());
  if (d === 0) return formatHora(iso);
  if (d === 1) return 'Ayer';
  return formatFecha(iso).slice(0, 5);
}

const ESTADO_CONV: Record<Conversacion['estado'], { label: string; tone: 'info' | 'neutral' | 'success'; icon: 'sparkles' | 'file-text' | 'check' | 'inbox' }> = {
  nuevo: { label: 'Pedido sin procesar', tone: 'info', icon: 'sparkles' },
  presupuestado: { label: 'Presupuestado', tone: 'success', icon: 'file-text' },
  respondido: { label: 'Respondido', tone: 'neutral', icon: 'check' },
  archivado: { label: 'Archivado', tone: 'neutral', icon: 'inbox' },
};

function ListaConversaciones({ convs, seleccion, onElegir }: { convs: Conversacion[]; seleccion?: string; onElegir: (id: string) => void }) {
  const der = useDerivados();
  const [q, setQ] = useState('');
  const visibles = convs.filter((c) => {
    if (!q.trim()) return true;
    const cli = c.clienteId ? der.clientePorId.get(c.clienteId) : undefined;
    return normalizar(`${c.contacto} ${c.telefono} ${cli?.razonSocial ?? ''}`).includes(normalizar(q.trim()));
  });
  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0" aria-label="Conversaciones">
      <div className="p-4">
        <SearchInput label="Buscar conversación" hideLabel placeholder="Nombre o teléfono" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {visibles.length === 0 ? (
        <EmptyState icon="message" title="No hay conversaciones acá" text="Cuando entren pedidos nuevos por WhatsApp van a aparecer en esta lista." />
      ) : (
        <ul className="m-0 list-none overflow-y-auto p-0">
          {visibles.map((c) => {
            const cli = c.clienteId ? der.clientePorId.get(c.clienteId) : undefined;
            const u = ultimo(c);
            const noLeidos = c.mensajes.filter((m) => !m.leido).length;
            const st = ESTADO_CONV[c.estado];
            const sel = c.id === seleccion;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onElegir(c.id)}
                  aria-current={sel ? 'true' : undefined}
                  className={cn(
                    'relative flex w-full gap-3 border-b border-arena-100 px-4 py-3.5 text-left hover:bg-arena-50 focus-visible:z-10',
                    sel && 'bg-arena-100 before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-[3px] before:bg-rojo-dalama hover:bg-arena-100',
                  )}
                >
                  <Avatar nombre={cli?.razonSocial ?? c.contacto} oscuro={sel} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex justify-between gap-2">
                      <span className={cn('truncate text-body', noLeidos ? 'font-bold' : 'font-semibold')}>{c.contacto}</span>
                      <span className={cn('shrink-0 text-caption tabular', noLeidos ? 'font-bold text-bold-red' : 'text-texto-secundario')}>{horaCorta(u.fecha)}</span>
                    </span>
                    <span className="truncate text-caption text-texto-secundario">{cli ? `${cli.razonSocial} · ${TIPO_CLIENTE[cli.tipo]}` : `${c.telefono} · No es cliente`}</span>
                    <span className="truncate text-body-small">{u.de === 'dalama' ? 'Vos: ' : ''}{u.adjunto ? `${u.adjunto.nombre} · ` : ''}{u.texto.split('\n')[0]}</span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <Badge tone={st.tone} icon={st.icon}>{st.label}</Badge>
                      {noLeidos > 0 && <span className="dl-nav-count" aria-label={`${noLeidos} sin leer`}>{noLeidos}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function Chat({ conv, onVolver }: { conv: Conversacion; onVolver?: () => void }) {
  const der = useDerivados();
  const cli = conv.clienteId ? der.clientePorId.get(conv.clienteId) : undefined;
  const cuenta = cli ? der.cuentas.get(cli.id) : undefined;
  const lista = useDemo((s) => (cli ? s.datos.listas.find((l) => l.id === cli.listaId) : undefined));
  const [texto, setTexto] = useState('');
  const [preview, setPreview] = useState(false);
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end' });
  }, [conv.id, conv.mensajes.length]);

  // Al abrir una conversación con mensajes respondidos, se marcan como leídos.
  useEffect(() => {
    if (conv.estado !== 'nuevo') ejecutar((d) => marcarLeida(d, conv.id));
  }, [conv.id, conv.estado, conv.mensajes.length]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (texto.trim()) setPreview(true);
  };

  // Agrupar por día con separador.
  let diaAnterior = '';

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0" aria-label={`Conversación con ${conv.contacto}`}>
      <div className="flex flex-col gap-2.5 border-b border-borde px-5 py-4">
        <div className="flex items-center gap-3">
          {onVolver && (
            <button type="button" className="dl-iconbtn -ml-2 h-11 w-11" aria-label="Volver a la bandeja" onClick={onVolver}>
              <Icon name="arrow-left" size={20} />
            </button>
          )}
          <Avatar nombre={cli?.razonSocial ?? conv.contacto} oscuro />
          <div className="min-w-0 flex-1">
            <h2 className="dl-card-title truncate">{cli?.contacto ?? conv.contacto}</h2>
            <div className="truncate text-body-small text-texto-secundario">{conv.telefono}{cli ? ` · ${cli.razonSocial}` : ''}</div>
          </div>
          {cli && <ButtonLink to={`/clientes/${cli.id}`} variant="secondary" size="s">Ver ficha</ButtonLink>}
        </div>
        {cli && cuenta && (
          <div className="flex flex-wrap gap-1.5">
            <Badge>{TIPO_CLIENTE[cli.tipo]}</Badge>
            <Badge>{`${CONDICION_IVA_CORTA[cli.condicionIVA]} · CUIT ${formatCUIT(cli.cuit)}`}</Badge>
            {lista && lista.descuentoPct > 0 && <Badge>{`${lista.nombre} −${lista.descuentoPct} %`}</Badge>}
            {cuenta.vencido > 0 ? (
              <Link to={`/cuentas/${cli.id}`} className="rounded-sm"><StatusBadge status="deuda-vencida">Deuda vencida</StatusBadge></Link>
            ) : (
              <StatusBadge status="pagado">Sin deuda vencida</StatusBadge>
            )}
          </div>
        )}
      </div>

      <div className="flex min-h-[260px] flex-1 flex-col gap-3 overflow-y-auto bg-arena-100 p-5" aria-live="polite">
        {conv.mensajes.map((m) => {
          const dia = m.fecha.slice(0, 10);
          const separador = dia !== diaAnterior;
          diaAnterior = dia;
          const d = diasEntre(m.fecha, new Date());
          return (
            <div key={m.id} className="contents">
              {separador && (
                <div className="self-center rounded-sm bg-superficie px-2.5 py-0.5 text-overline uppercase text-texto-secundario">
                  {d === 0 ? 'Hoy' : d === 1 ? 'Ayer' : formatFecha(m.fecha)}
                </div>
              )}
              <div
                className={cn(
                  'flex max-w-[88%] flex-col gap-2 px-3.5 py-3 text-body shadow-[0_1px_2px_rgba(74,31,31,.08)]',
                  m.de === 'cliente' ? 'self-start rounded-md rounded-tl-none bg-superficie' : 'self-end rounded-md rounded-tr-none bg-ink-black text-neutro-0',
                )}
              >
                {m.adjunto && (() => {
                  const destino = m.adjunto.tipo === 'presupuesto' ? `/presupuestos/${m.adjunto.id}` : m.adjunto.tipo === 'factura' ? `/facturacion/${m.adjunto.id}` : m.adjunto.tipo === 'estado_cuenta' ? `/cuentas/${m.adjunto.id}` : undefined;
                  const contenido = (
                    <>
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-bold-red text-[9px] font-bold text-neutro-0">PDF</span>
                      <span className="truncate text-body-small font-semibold">{m.adjunto.nombre}</span>
                    </>
                  );
                  return destino ? (
                    <Link to={destino} className="flex items-center gap-2 rounded-sm bg-neutro-0/10 px-2 py-1.5 text-neutro-0 underline-offset-2 hover:bg-neutro-0/20 hover:underline">{contenido}</Link>
                  ) : (
                    <span className="flex items-center gap-2 rounded-sm bg-neutro-0/10 px-2 py-1.5">{contenido}</span>
                  );
                })()}
                <p className="m-0 whitespace-pre-line leading-[21px]">{m.texto}</p>
                <span className={cn('self-end text-caption tabular', m.de === 'cliente' ? 'text-texto-secundario' : 'text-neutro-300')}>
                  {formatHora(m.fecha)}{m.de === 'dalama' ? ' · enviado' : ''}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={fin} />
      </div>

      <form onSubmit={enviar} className="flex items-end gap-2 border-t border-borde px-4 py-3">
        <div className="dl-field flex-1">
          <label htmlFor="responder" className="sr-only">Responder</label>
          <div className="dl-input-control">
            <input id="responder" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribir respuesta…" autoComplete="off" />
          </div>
        </div>
        <Button type="submit" variant="secondary" icon="send" aria-label="Enviar respuesta" disabled={!texto.trim()} />
      </form>

      <EnviarWhatsApp
        open={preview}
        onClose={() => setPreview(false)}
        titulo="Enviar respuesta"
        destinatario={cli ? `${cli.contacto} · ${cli.razonSocial}` : conv.contacto}
        telefono={conv.telefono}
        textoInicial={texto}
        onEnviado={(t) => {
          setPreview(false);
          setTexto('');
          ejecutar((d) => responder(d, conv.id, t));
          toast.success('Respuesta enviada', `${conv.contacto} la recibió por WhatsApp (simulado).`);
        }}
      />
    </Card>
  );
}

export default function WhatsAppPage() {
  const { conversacionId } = useParams();
  const navigate = useNavigate();
  const conversaciones = useDemo((s) => s.datos.conversaciones);
  const [filtro, setFiltro] = useState<Filtro>('sin');
  const escritorio = useEsEscritorio();

  const ordenadas = useMemo(() => [...conversaciones].sort((a, b) => ultimo(b).fecha.localeCompare(ultimo(a).fecha)), [conversaciones]);
  const sinProcesar = ordenadas.filter((c) => c.estado === 'nuevo');
  const presupuestadas = ordenadas.filter((c) => c.estado === 'presupuestado');
  const lista = filtro === 'sin' ? sinProcesar : filtro === 'presupuestadas' ? presupuestadas : ordenadas;

  const seleccionada = conversacionId ? conversaciones.find((c) => c.id === conversacionId) : undefined;
  // En escritorio, si no hay ninguna elegida, se abre la primera de la lista.
  const activa = seleccionada ?? (escritorio ? lista[0] : undefined);

  // Si la conversación elegida no está en el filtro (por ejemplo, recién presupuestada), mostrar todas.
  useEffect(() => {
    if (seleccionada && !lista.some((c) => c.id === seleccionada.id)) setFiltro('todas');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionada?.id, seleccionada?.estado]);

  const simular = () => {
    const d = useDemo.getState().datos;
    const usados = d.conversaciones.reduce((a, c) => a + c.mensajes.filter((m) => MENSAJES_SIMULADOS.some((s) => s.texto === m.texto)).length, 0);
    const m = MENSAJES_SIMULADOS[usados % MENSAJES_SIMULADOS.length];
    const conv = ejecutar((x) => recibirMensaje(x, m));
    setFiltro('sin');
    toast.show({
      tone: 'info',
      title: `Nuevo mensaje de ${m.contacto}`,
      description: `“${m.texto.slice(0, 90)}${m.texto.length > 90 ? '…' : ''}” Apareció arriba en la bandeja y se sumó al contador del menú.`,
      action: { label: 'Abrirlo', onClick: () => navigate(`/whatsapp/${conv.id}`) },
    });
  };

  const elegir = (id: string) => navigate(`/whatsapp/${id}`);

  return (
    <Page title="Bandeja de WhatsApp" overline="Operación · Pedidos entrantes">
      <div className={cn('flex flex-wrap items-center justify-between gap-4', seleccionada && !escritorio && 'hidden')}>
        <Tabs<Filtro>
          label="Filtrar conversaciones"
          value={filtro}
          onChange={setFiltro}
          tabs={[
            { id: 'sin', label: 'Sin procesar', count: sinProcesar.length },
            { id: 'presupuestadas', label: 'Presupuestadas', count: presupuestadas.length },
            { id: 'todas', label: 'Todas', count: ordenadas.length },
          ]}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="success" icon="check-circle">WhatsApp Business vinculado (simulado)</Badge>
          <Button variant="secondary" size="s" icon="message" onClick={simular}>Simular nuevo mensaje</Button>
        </div>
      </div>

      {!escritorio ? (
      /* Celular: lista o conversación, una por vez */
      <div className="flex flex-col gap-4">
        {seleccionada ? (
          <>
            <Chat conv={seleccionada} onVolver={() => navigate('/whatsapp')} />
            <PanelPresupuestoIA conv={seleccionada} />
          </>
        ) : (
          <ListaConversaciones convs={lista} onElegir={elegir} />
        )}
      </div>
      ) : (
      /* Escritorio: tres columnas como en el diseño */
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] min-[1700px]:grid-cols-[minmax(260px,320px)_minmax(320px,1fr)_minmax(560px,1.6fr)]">
        <div className="flex h-[min(560px,calc(100vh-200px))] min-w-0 flex-col min-[1700px]:h-[min(760px,calc(100vh-200px))]">
          <ListaConversaciones convs={lista} seleccion={activa?.id} onElegir={elegir} />
        </div>
        {activa ? (
          <>
            <div className="flex h-[min(560px,calc(100vh-200px))] min-w-0 flex-col min-[1700px]:h-[min(760px,calc(100vh-200px))]">
              <Chat conv={activa} />
            </div>
            <div className="min-w-0 lg:col-span-2 min-[1700px]:col-span-1">
              <PanelPresupuestoIA key={activa.id} conv={activa} />
            </div>
          </>
        ) : (
          <Card className="p-0 min-[1700px]:col-span-2">
            <EmptyState icon="message" title="No hay pedidos sin procesar" text="Todo lo que entró por WhatsApp ya está presupuestado. Probá simular un mensaje nuevo para ver cómo trabaja la IA." action={<Button icon="message" onClick={simular}>Simular nuevo mensaje</Button>} />
          </Card>
        )}
      </div>
      )}
    </Page>
  );
}
