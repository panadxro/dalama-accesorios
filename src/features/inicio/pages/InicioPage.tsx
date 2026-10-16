import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Alert, Badge, Button, ButtonLink, Card, DataTable, Icon, KpiCard, SectionTitle, StatusBadge, type IconName } from '@/components/ui';
import { PedidoBadge, PresupuestoBadge } from '@/components/negocio/Estados';
import { CobroRapido } from '@/features/cuentas/CobroRapido';
import { METODO_ENTREGA, TIPO_CLIENTE, estadoPresupuesto, totales } from '@/domain/calculos';
import type { Actividad } from '@/domain/types';
import { diasEntre, mismoDia } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatFechaLarga, formatHora, formatPct, nombreMes, saludo } from '@/lib/format';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { GraficoVentasMes } from '../GraficoVentasMes';

const ICONO_ACTIVIDAD: Record<Actividad['tipo'], IconName> = {
  mensaje: 'message', presupuesto: 'file-text', pedido: 'package', factura: 'receipt', nota_credito: 'undo', cobro: 'wallet',
  entrega: 'truck', stock: 'boxes', compra: 'cart', precio: 'tag', cliente: 'user', sistema: 'settings',
};

function hace(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'Recién';
  if (min < 60) return `Hace ${min} min`;
  if (mismoDia(iso, new Date())) return `Hoy ${formatHora(iso)}`;
  if (diasEntre(iso, new Date()) === 1) return `Ayer ${formatHora(iso)}`;
  return `Hace ${diasEntre(iso, new Date())} días`;
}

export default function InicioPage() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const hoy = der.hoy;
  const iva = datos.ajustes.ivaPct;
  const [cobro, setCobro] = useState(false);

  const k = useMemo(() => {
    const signo = (c: { clase: string }) => (c.clase === 'factura' ? 1 : -1);
    const enMes = (iso: string, offset: number) => { const f = new Date(iso); const m = new Date(hoy.getFullYear(), hoy.getMonth() + offset, 1); return f.getFullYear() === m.getFullYear() && f.getMonth() === m.getMonth(); };
    const ventasMes = datos.comprobantes.filter((c) => enMes(c.fecha, 0)).reduce((a, c) => a + signo(c) * c.total, 0);
    const ventasAntAlDia = datos.comprobantes.filter((c) => enMes(c.fecha, -1) && new Date(c.fecha).getDate() <= hoy.getDate()).reduce((a, c) => a + signo(c) * c.total, 0);
    const pedidosSemana = datos.pedidos.filter((p) => diasEntre(p.fecha, hoy) <= 7 && diasEntre(p.fecha, hoy) >= 0).length;
    const pedidosSemanaAnt = datos.pedidos.filter((p) => diasEntre(p.fecha, hoy) > 7 && diasEntre(p.fecha, hoy) <= 14).length;
    const vencido = der.conDeudaVencida.reduce((a, x) => a + x.resumen.vencido, 0);
    const criticos = der.conDeudaVencida.filter((x) => x.resumen.diasMayorAtraso > 30).length;

    // Más vendidos del mes por facturación (neto).
    const porProducto = new Map<string, { neto: number; cant: number }>();
    for (const c of datos.comprobantes) {
      if (c.clase !== 'factura' || !enMes(c.fecha, 0)) continue;
      for (const r of c.renglones) {
        if (!r.productoId) continue;
        const x = porProducto.get(r.productoId) ?? { neto: 0, cant: 0 };
        x.neto += Math.round(r.cantidad * r.precioUnitario * (1 - c.descuentoPct / 100));
        x.cant += r.cantidad;
        porProducto.set(r.productoId, x);
      }
    }
    const top = [...porProducto].sort((a, b) => b[1].neto - a[1].neto).slice(0, 5).map(([id, v]) => ({ p: der.productoPorId.get(id)!, ...v }));
    return { ventasMes, ventasAntAlDia, pedidosSemana, pedidosSemanaAnt, vencido, criticos, top };
  }, [datos, der, hoy]);

  const variacion = k.ventasAntAlDia ? ((k.ventasMes - k.ventasAntAlDia) / k.ventasAntAlDia) * 100 : 0;
  const sinStock = der.stockBajo.filter((p) => p.stock <= 0).length;
  const pendientes = der.presupuestosSinRespuesta;
  const enJuego = pendientes.reduce((a, p) => a + totales(p.renglones, p.descuentoPct, iva).total, 0);
  const entregadas = der.entregasHoy.filter((p) => p.estado === 'entregado').length;
  const mesAnt = nombreMes(hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1);

  // Presupuestos abiertos más recientes para seguir.
  const abiertos = datos.presupuestos
    .map((p) => ({ p, estado: estadoPresupuesto(p, hoy) }))
    .filter((x) => (x.estado === 'enviado' || x.estado === 'vencido') && x.p.enviadoEl && diasEntre(x.p.enviadoEl, hoy) <= 12)
    .sort((a, b) => a.p.enviadoEl!.localeCompare(b.p.enviadoEl!))
    .slice(0, 6);

  return (
    <Page title={`${saludo()}, Laura`} overline={formatFechaLarga(hoy)}>
      <PageActions overline="Resumen del día">
        <Button variant="secondary" icon="wallet" onClick={() => setCobro(true)}>Registrar cobro</Button>
        <ButtonLink to="/entregas" variant="secondary" icon="truck">Entregas de hoy</ButtonLink>
        <ButtonLink to="/presupuestos/nuevo" variant="primary" icon="plus">Nuevo presupuesto</ButtonLink>
      </PageActions>

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        <KpiCard label="Ventas del mes" value={formatARSKpi(k.ventasMes)} icon="chart" trend={variacion >= 0 ? 'up' : 'down'} delta={formatPct(Math.abs(variacion))} deltaLabel={`vs. ${mesAnt} al día ${hoy.getDate()}`} />
        <KpiCard label="Pedidos de la semana" value={k.pedidosSemana} icon="package" trend={k.pedidosSemana >= k.pedidosSemanaAnt ? 'up' : 'down'} delta={String(Math.abs(k.pedidosSemana - k.pedidosSemanaAnt))} deltaLabel={`${der.mensajesSinProcesar} por WhatsApp sin procesar`} />
        <KpiCard label="Deuda vencida" value={formatARSKpi(k.vencido)} icon="wallet" trend="flat" delta={`${der.conDeudaVencida.length} clientes`} deltaLabel={`${k.criticos} con más de 30 días de atraso`} />
        <KpiCard label="Stock bajo" value={der.stockBajo.length} icon="boxes" trend="flat" delta={`${sinStock} sin stock`} deltaLabel="debajo del mínimo" />
      </section>

      {pendientes.length > 0 && (
        <Alert tone="warning" title={`${pendientes.length} ${pendientes.length === 1 ? 'presupuesto lleva' : 'presupuestos llevan'} ${datos.ajustes.recordarPresupuestoDias} días o más sin respuesta`} action={<ButtonLink to="/presupuestos" variant="secondary" size="s">Ver presupuestos</ButtonLink>}>
          {formatARS(enJuego)} en juego: {pendientes.slice(0, 3).map((p, i) => (
            <span key={p.id}>{i > 0 && (i === pendientes.length - 1 || i === 2 ? ' y ' : ', ')}<Link className="dl-link" to={`/presupuestos/${p.id}`}>{der.clientePorId.get(p.clienteId)?.razonSocial} ({p.numero})</Link></span>
          ))}.
        </Alert>
      )}

      <div className="flex flex-wrap gap-4">
        <Card className="min-w-0 flex-[2_1_560px]" aria-label="Ventas del mes">
          <SectionTitle overline="Ventas" title={`${nombreMes(hoy.getMonth()).replace(/^./, (c) => c.toUpperCase())} contra ${mesAnt}`} action={<ButtonLink to="/reportes" variant="tertiary" size="s">Reportes</ButtonLink>} />
          <GraficoVentasMes comprobantes={datos.comprobantes} hoy={hoy} />
        </Card>

        <Card className="min-w-0 flex-[1_1_340px]" aria-label="Más vendidos">
          <SectionTitle overline={`${nombreMes(hoy.getMonth())} · por facturación`} title="Más vendidos" />
          {k.top.length === 0 ? (
            <p className="m-0 mt-5 text-body text-texto-secundario">Todavía no hay ventas facturadas este mes.</p>
          ) : (
            <ol className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
              {k.top.map((t) => (
                <li key={t.p.id} className="flex flex-col gap-1.5" title={`${t.p.nombre}: ${formatARS(t.neto)}`}>
                  <div className="flex justify-between gap-3 text-body-small"><span className="font-semibold">{t.p.nombre}</span><span className="shrink-0 font-semibold tabular">{formatARS(t.neto)}</span></div>
                  <div className="h-2 rounded-[2px] bg-arena-100"><div className="h-2 rounded-[2px] bg-ink-black" style={{ width: `${(t.neto / k.top[0].neto) * 100}%` }} /></div>
                  <div className="text-caption text-texto-secundario">{t.cant} {t.p.unidad} · {t.p.codigo}</div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-[3_1_600px] flex-col gap-4">
          <DataTable
            overline="Ventas"
            title="Presupuestos para seguir"
            rows={abiertos}
            rowKey={(x) => x.p.id}
            rowLabel={(x) => x.p.numero}
            pagination={false}
            headerAction={<ButtonLink to="/presupuestos" variant="secondary" size="s">Ver todos</ButtonLink>}
            columns={[
              { key: 'n', label: 'N.°', render: (x) => <Link to={`/presupuestos/${x.p.id}`} className="whitespace-nowrap font-bold text-texto hover:text-bold-red">{x.p.numero}</Link> },
              { key: 'c', label: 'Cliente', render: (x) => { const c = der.clientePorId.get(x.p.clienteId)!; return <span>{c.razonSocial}<span className="dl-sub">{TIPO_CLIENTE[c.tipo]}</span></span>; } },
              { key: 'e', label: 'Enviado', render: (x) => { const d = diasEntre(x.p.enviadoEl!, hoy); return d === 0 ? 'Hoy' : d === 1 ? 'Ayer' : `Hace ${d} días`; } },
              { key: 't', label: 'Total', align: 'right', render: (x) => formatARS(totales(x.p.renglones, x.p.descuentoPct, iva).total) },
              { key: 's', label: 'Estado', render: (x) => <PresupuestoBadge estado={x.estado} /> },
            ]}
            rowActions={(x) => [
              { label: 'Recordar por WhatsApp', icon: 'send', to: `/presupuestos/${x.p.id}?recordar=1` },
              { label: 'Ver', icon: 'eye', to: `/presupuestos/${x.p.id}` },
            ]}
            emptyIcon="check-circle"
            emptyTitle="No hay presupuestos esperando respuesta"
            emptyText="Los presupuestos enviados en los últimos días aparecen acá para hacerles seguimiento."
          />

          <Card aria-label="Actividad reciente">
            <SectionTitle overline="Lo último" title="Actividad reciente" />
            <ul className="m-0 mt-3 list-none p-0">
              {datos.actividad.slice(0, 7).map((a) => (
                <li key={a.id} className="border-b border-arena-100 last:border-0">
                  {a.ruta ? (
                    <Link to={a.ruta} className="-mx-2 flex items-center gap-3 rounded-sm px-2 py-2.5 hover:bg-arena-50">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-arena-100 text-neutro-700"><Icon name={ICONO_ACTIVIDAD[a.tipo]} size={16} /></span>
                      <span className="min-w-0 flex-1"><span className="block text-body font-semibold">{a.titulo}</span>{a.detalle && <span className="block truncate text-caption text-texto-secundario">{a.detalle}</span>}</span>
                      <span className="shrink-0 text-caption text-texto-secundario">{hace(a.fecha)}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 py-2.5"><span className="text-body font-semibold">{a.titulo}</span></div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-[2_1_360px] flex-col gap-4">
          <Card aria-label="Entregas de hoy">
            <SectionTitle overline="Reparto" title="Entregas de hoy" action={<Link to="/entregas" className="dl-link text-body-small">{entregadas} de {der.entregasHoy.length} entregadas</Link>} />
            {der.entregasHoy.length === 0 ? (
              <p className="m-0 mt-3 text-body-small text-texto-secundario">No hay entregas programadas para hoy.</p>
            ) : (
              <ul className="m-0 mt-3 list-none p-0">
                {der.entregasHoy.map((p) => (
                  <li key={p.id}>
                    <Link to={`/pedidos/${p.id}`} className="-mx-2 flex items-center gap-3 rounded-sm border-b border-arena-100 px-2 py-3 hover:bg-arena-50">
                      <span className="w-11 shrink-0 text-body-small font-bold tabular">{formatHora(p.entrega.fecha)}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-body font-semibold">{der.clientePorId.get(p.clienteId)?.razonSocial}</span><span className="block truncate text-caption text-texto-secundario">{METODO_ENTREGA[p.entrega.metodo]}{p.entrega.empresa ? ` · ${p.entrega.empresa}` : ''}</span></span>
                      <PedidoBadge estado={p.estado} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card aria-label="Stock bajo">
            <SectionTitle overline="Depósito" title="Stock bajo" action={<Link to="/stock" className="dl-link text-body-small">Ver stock</Link>} />
            <ul className="m-0 mb-4 mt-3 list-none p-0">
              {der.stockBajo.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-3 border-b border-arena-100 py-3">
                  <span className="min-w-0 flex-1"><span className="block truncate text-body font-semibold">{p.nombre}</span><span className="block text-caption text-texto-secundario tabular">{p.codigo} · {p.stock} {p.unidad} de mín. {p.stockMinimo}</span></span>
                  {p.stock <= 0 ? <Badge tone="error" icon="alert-triangle">Sin stock</Badge> : <StatusBadge status="stock-bajo" />}
                </li>
              ))}
            </ul>
            <ButtonLink to="/compras" variant="secondary" className="w-full">Generar orden de compra sugerida</ButtonLink>
          </Card>

          {der.inactivos.length > 0 && (
            <Card aria-label="Clientes inactivos" className="flex flex-col gap-3">
              <SectionTitle overline="Clientes" title={`${der.inactivos.length} clientes sin comprar hace más de ${datos.ajustes.diasClienteInactivo} días`} />
              <p className="m-0 text-body-small text-texto-secundario">{der.inactivos.slice(0, 3).map((c) => c.razonSocial).join(', ')}{der.inactivos.length > 3 ? ' y otros' : ''}. Un mensaje a tiempo puede recuperarlos.</p>
              <ButtonLink to="/clientes?vista=inactivos" variant="secondary" icon="send" className="self-start">Enviar mensaje de reactivación</ButtonLink>
            </Card>
          )}
        </aside>
      </div>

      <CobroRapido open={cobro} onClose={() => setCobro(false)} />
    </Page>
  );
}
