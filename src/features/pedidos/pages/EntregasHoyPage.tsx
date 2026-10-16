import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, Card, Icon } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/shared/States';
import { METODO_ENTREGA, totalPedido } from '@/domain/calculos';
import type { Pedido } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatARS, formatHora } from '@/lib/format';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { useUi } from '@/store/ui';
import { ConfirmarEntrega } from '../ConfirmarEntrega';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function Parada({ p, n, proxima, onEntregar }: { p: Pedido; n: number; proxima: boolean; onEntregar: () => void }) {
  const der = useDerivados();
  const datos = useDemo((s) => s.datos);
  const cliente = der.clientePorId.get(p.clienteId)!;
  const hecho = p.estado === 'entregado';
  const enCamino = p.estado === 'despachado';
  const pendiente = p.comprobanteId ? der.pendientes.get(p.comprobanteId) ?? 0 : totalPedido(p, datos.ajustes.ivaPct);
  const cobrar = p.entrega.cobrarAlEntregar && pendiente > 0 ? pendiente : 0;
  const sinPreparar = p.estado === 'confirmado' || p.estado === 'en_preparacion';

  return (
    <article className={cn('rounded-md bg-superficie p-4 shadow-1', proxima ? 'border-2 border-ink-black' : 'border border-borde')} aria-label={`Parada ${n}: ${cliente.razonSocial}`}>
      <div className="flex items-start gap-3">
        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-sm text-body font-bold', hecho ? 'bg-exito-suave text-exito' : proxima ? 'bg-bold-red text-neutro-0' : 'bg-arena-100 text-texto')}>
          {hecho ? <Icon name="check" size={16} strokeWidth={2.5} title="Entregado" /> : n}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption font-semibold text-texto-secundario tabular">{formatHora(p.entrega.fecha)} · {p.numero}</span>
            {hecho ? <Badge tone="success">Entregado</Badge> : enCamino ? <Badge tone="info" icon="send">Despachado</Badge> : sinPreparar ? <Badge tone="warning" icon="clock">En preparación</Badge> : proxima ? <Badge tone="warning">Próxima</Badge> : <Badge>Pendiente</Badge>}
          </div>
          <div className="mt-1 text-h3 font-semibold">{cliente.razonSocial}</div>
          <div className="mt-0.5 text-body-small text-texto-secundario">{p.entrega.direccion}</div>
        </div>
      </div>

      {!hecho ? (
        <>
          <dl className="m-0 mt-3 grid grid-cols-2 gap-2 rounded-sm bg-arena-100 px-3 py-2.5 text-caption">
            <div><dt className="text-texto-secundario">Remito</dt><dd className="m-0 mt-0.5 font-semibold tabular">{p.remito?.numero ?? 'Sin emitir'}</dd></div>
            <div><dt className="text-texto-secundario">Bultos</dt><dd className="m-0 mt-0.5 font-semibold">{p.entrega.bultos} {p.entrega.bultos === 1 ? 'bulto' : 'bultos'}</dd></div>
            <div className="col-span-2">
              <dt className="text-texto-secundario">Cobro</dt>
              <dd className={cn('m-0 mt-0.5 font-bold', cobrar && 'text-bold-red')}>
                {cobrar ? `Cobrar ${formatARS(cobrar)} al entregar` : cliente.condicionVenta === 'cta_cte_30' ? 'Cuenta corriente' : 'Ya pagado'}
              </dd>
            </div>
          </dl>
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              className="min-h-11 flex-1"
              icon="map-pin"
              onClick={() => {
                navigator.clipboard?.writeText(p.entrega.direccion).catch(() => undefined);
                toast.info('Dirección copiada', `${p.entrega.direccion}. En el sistema real abre el GPS del celular.`);
              }}
            >
              Cómo llegar
            </Button>
            <Button className="min-h-11 flex-1" icon="check" onClick={onEntregar}>{p.entrega.metodo === 'retiro' ? 'Retiró' : 'Entregado'}</Button>
          </div>
          {!p.comprobanteId && <p className="m-0 mt-2 text-caption text-texto-secundario">Sin factura: se emite al confirmar.</p>}
        </>
      ) : (
        <p className="m-0 mt-2 pl-11 text-caption font-semibold text-exito">
          Entregado a las {p.entrega.entregadoEl ? formatHora(p.entrega.entregadoEl) : '—'}{p.entrega.recibidoPor ? ` · recibió ${p.entrega.recibidoPor}` : ''} · remito firmado
        </p>
      )}
    </article>
  );
}

export default function EntregasHoyPage() {
  const der = useDerivados();
  const setMenu = useUi((s) => s.setMenuMovilAbierto);
  const [entregando, setEntregando] = useState<Pedido | null>(null);

  const camioneta = der.entregasHoy.filter((p) => p.entrega.metodo === 'camioneta').sort((a, b) => (a.entrega.orden ?? 99) - (b.entrega.orden ?? 99) || a.entrega.fecha.localeCompare(b.entrega.fecha));
  const otros = der.entregasHoy.filter((p) => p.entrega.metodo !== 'camioneta');
  const todas = [...camioneta, ...otros];
  const hechas = todas.filter((p) => p.estado === 'entregado').length;
  const proxima = camioneta.find((p) => p.estado !== 'entregado');
  const hoy = der.hoy;

  const cabecera = (
    <header className="bg-ink-black px-4 py-4 text-neutro-0">
      <div className="flex items-center gap-3">
        <button type="button" className="dl-iconbtn -ml-2 h-11 w-11 text-neutro-300 hover:bg-neutro-0/10 hover:text-neutro-0" aria-label="Abrir menú" onClick={() => setMenu(true)}>
          <Icon name="menu" size={24} />
        </button>
        <img src="/brand/dalama-isotipo-negativo.png" alt="" className="w-7" />
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutro-300">Reparto · Camioneta</div>
          <h1 className="m-0 text-[18px] font-semibold leading-6">Entregas de hoy</h1>
        </div>
        <span className="text-caption text-neutro-300 tabular">{DIAS[hoy.getDay()]} {hoy.getDate()}/{hoy.getMonth() + 1}</span>
      </div>
      <div className="mt-4 flex justify-between text-body-small">
        <span className="font-semibold">{hechas} de {todas.length} entregadas</span>
        <span className="text-neutro-300">Chofer: Nahuel</span>
      </div>
      <div className="mt-2 flex gap-[3px]" aria-hidden="true">
        {todas.map((p) => <span key={p.id} className={cn('h-1 flex-1', p.estado === 'entregado' ? 'bg-rojo-dalama' : 'bg-neutro-700')} />)}
      </div>
    </header>
  );

  return (
    <Page title="Entregas de hoy" overline="Reparto · Camioneta" mobileHeader={cabecera}>
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
        <div className="hidden items-center justify-between gap-3 lg:flex">
          <span className="text-body text-texto-secundario">{hechas} de {todas.length} entregadas · chofer Nahuel</span>
          <ButtonLink to="/pedidos" variant="tertiary" icon="package">Todos los pedidos</ButtonLink>
        </div>
        {todas.length === 0 ? (
          <Card className="p-0"><EmptyState icon="truck" title="No hay entregas programadas para hoy" text="Cuando conviertas un presupuesto en pedido para hoy, va a aparecer acá." action={<ButtonLink to="/pedidos" variant="secondary">Ver pedidos</ButtonLink>} /></Card>
        ) : (
          <>
            {camioneta.map((p, i) => <Parada key={p.id} p={p} n={i + 1} proxima={p.id === proxima?.id} onEntregar={() => setEntregando(p)} />)}
            {camioneta.length > 0 && <p className="m-0 py-1 text-center text-caption text-texto-secundario">Orden sugerido según el recorrido</p>}
            {otros.length > 0 && (
              <>
                <div className="mt-2"><div className="dl-overline">Retiros y despachos</div><span className="dl-brandline" aria-hidden="true" /></div>
                {otros.map((p, i) => (
                  <div key={p.id} className="flex flex-col gap-1">
                    <span className="text-caption font-semibold text-texto-secundario">{METODO_ENTREGA[p.entrega.metodo]}{p.entrega.empresa ? ` · ${p.entrega.empresa}` : ''}</span>
                    <Parada p={p} n={camioneta.length + i + 1} proxima={false} onEntregar={() => setEntregando(p)} />
                  </div>
                ))}
              </>
            )}
          </>
        )}
        <Link to="/pedidos" className="dl-link self-center py-2 text-body-small lg:hidden">Ver todos los pedidos</Link>
      </div>
      {entregando && <ConfirmarEntrega pedido={entregando} open onClose={() => setEntregando(null)} />}
    </Page>
  );
}
