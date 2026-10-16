import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Alert, Button, ButtonLink, DataTable, KpiCard, SearchInput, Tabs, toast } from '@/components/ui';
import { PresupuestoBadge } from '@/components/negocio/Estados';
import { ESTADO_PRESUPUESTO, TIPO_CLIENTE, estadoPresupuesto, totales } from '@/domain/calculos';
import type { EstadoPresupuestoVisible, Presupuesto } from '@/domain/types';
import { descargarCSV, pesos } from '@/lib/csv';
import { aISO, claveMes, diasEntre } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatFecha, formatMesAnio, formatNumero, formatPct, nombreMes } from '@/lib/format';
import { pdfPresupuesto, descargarPDF } from '@/services/pdf/documentos';
import { datosActuales, useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';

type Filtro = 'todos' | EstadoPresupuestoVisible;

function haceTexto(iso?: string): string {
  if (!iso) return '—';
  const d = diasEntre(iso, new Date());
  if (d <= 0) return 'Hoy';
  if (d === 1) return 'Ayer';
  return `Hace ${d} días`;
}

export default function PresupuestosPage() {
  const navigate = useNavigate();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [q, setQ] = useState('');
  const hoy = der.hoy;
  const iva = datos.ajustes.ivaPct;

  const filas = useMemo(
    () =>
      datos.presupuestos.map((p) => ({
        p,
        estado: estadoPresupuesto(p, hoy),
        cliente: der.clientePorId.get(p.clienteId)!,
        total: totales(p.renglones.filter((r) => r.productoId), p.descuentoPct, iva).total,
      })),
    [datos.presupuestos, der, hoy, iva],
  );

  // Indicadores del mes contra el mes anterior, a la misma altura del mes.
  const kpis = useMemo(() => {
    const mes = aISO(hoy).slice(0, 7);
    const mesAnt = aISO(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)).slice(0, 7);
    const diaHoy = hoy.getDate();
    const enMes = (f: typeof filas[number], m: string) => f.p.enviadoEl && claveMes(f.p.enviadoEl) === m;
    const enviadosMes = filas.filter((f) => enMes(f, mes)).length;
    const enviadosAnt = filas.filter((f) => enMes(f, mesAnt) && new Date(f.p.enviadoEl!).getDate() <= diaHoy).length;
    const respondidos = filas.filter((f) => f.p.respondidoEl && diasEntre(f.p.respondidoEl, hoy) <= 60);
    const aceptados = respondidos.filter((f) => f.p.estado === 'aceptado').length;
    const tasa = respondidos.length ? (aceptados / respondidos.length) * 100 : 0;
    const pendientes = filas.filter((f) => f.estado === 'enviado');
    const tiempos = respondidos.filter((f) => f.p.enviadoEl).map((f) => (new Date(f.p.respondidoEl!).getTime() - new Date(f.p.enviadoEl!).getTime()) / 86_400_000);
    const promedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;
    return { enviadosMes, enviadosAnt, tasa, pendientes, promedio, mesAnt };
  }, [filas, hoy]);

  const sinRespuesta = der.presupuestosSinRespuesta;
  const enJuego = sinRespuesta.reduce((a, p) => a + totales(p.renglones, p.descuentoPct, iva).total, 0);

  const cuenta = (e: Filtro) => (e === 'todos' ? filas.length : filas.filter((f) => f.estado === e).length);
  const visibles = filas.filter((f) => {
    if (filtro !== 'todos' && f.estado !== filtro) return false;
    if (q.trim()) return normalizar(`${f.p.numero} ${f.cliente.razonSocial} ${f.cliente.contacto}`).includes(normalizar(q.trim()));
    return true;
  });

  const exportar = () => {
    descargarCSV(
      `presupuestos-${claveMes(datos.generadoEl)}`,
      ['Número', 'Fecha', 'Cliente', 'Tipo', 'Estado', 'Enviado', 'Válido hasta', 'Total con IVA'],
      visibles.map((f) => [f.p.numero, formatFecha(f.p.fecha), f.cliente.razonSocial, TIPO_CLIENTE[f.cliente.tipo], ESTADO_PRESUPUESTO[f.estado], f.p.enviadoEl ? formatFecha(f.p.enviadoEl) : '', formatFecha(f.p.validoHasta), pesos(f.total)]),
    );
    toast.info('Planilla descargada', `${visibles.length} presupuestos exportados en formato CSV, listo para abrir en Excel.`);
  };

  const mesAntNombre = nombreMes(Number(kpis.mesAnt.slice(5, 7)) - 1);

  return (
    <Page title="Presupuestos" overline="Operación · Ventas">
      <PageActions overline={formatMesAnio(hoy)}>
        <Button variant="secondary" icon="download" onClick={exportar}>Exportar a Excel</Button>
        <ButtonLink to="/presupuestos/nuevo" variant="primary" icon="plus">Nuevo presupuesto</ButtonLink>
      </PageActions>

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label={`Enviados en ${nombreMes(hoy.getMonth())}`} value={kpis.enviadosMes} icon="send" trend={kpis.enviadosMes >= kpis.enviadosAnt ? 'up' : 'down'} delta={String(Math.abs(kpis.enviadosMes - kpis.enviadosAnt))} deltaLabel={`vs. ${mesAntNombre} al día ${hoy.getDate()}`} />
        <KpiCard label="Tasa de aceptación" value={formatPct(kpis.tasa, 0)} icon="check-circle" trend="flat" delta="Últimos 60 días" deltaLabel="sobre los que respondieron" />
        <KpiCard label="Pendientes de respuesta" value={formatARSKpi(kpis.pendientes.reduce((a, f) => a + f.total, 0))} icon="clock" trend="flat" delta={`${kpis.pendientes.length} presupuestos`} deltaLabel={`${sinRespuesta.length} con ${datos.ajustes.recordarPresupuestoDias} días o más`} />
        <KpiCard label="Tiempo de respuesta" value={`${kpis.promedio.toLocaleString('es-AR', { maximumFractionDigits: 1 })} días`} icon="message" trend="flat" delta="Promedio" deltaLabel="desde el envío hasta la respuesta" />
      </section>

      {sinRespuesta.length > 0 && (
        <Alert tone="warning" title={`${sinRespuesta.length} ${sinRespuesta.length === 1 ? 'presupuesto lleva' : 'presupuestos llevan'} ${datos.ajustes.recordarPresupuestoDias} días o más sin respuesta`}>
          {formatARS(enJuego)} en juego: {sinRespuesta.map((p, i) => (
            <span key={p.id}>{i > 0 && ', '}<Link className="dl-link" to={`/presupuestos/${p.id}`}>{der.clientePorId.get(p.clienteId)?.razonSocial} ({p.numero})</Link></span>
          ))}. El plazo del aviso se cambia en <Link className="dl-link" to="/configuracion">Configuración</Link>.
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Tabs<Filtro>
            label="Filtrar por estado"
            value={filtro}
            onChange={setFiltro}
            tabs={(['todos', 'borrador', 'enviado', 'vencido', 'aceptado', 'rechazado'] as Filtro[]).map((e) => ({ id: e, label: e === 'todos' ? 'Todos' : `${ESTADO_PRESUPUESTO[e]}s`, count: cuenta(e) }))}
          />
          <SearchInput label="Buscar presupuesto" hideLabel placeholder="Número o cliente" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-[280px]" />
        </div>
        <DataTable
          overline="Ventas"
          title={filtro === 'todos' ? 'Todos los presupuestos' : `Presupuestos ${ESTADO_PRESUPUESTO[filtro].toLowerCase()}s`}
          rows={visibles}
          rowKey={(f) => f.p.id}
          rowLabel={(f) => f.p.numero}
          pageSize={12}
          columns={[
            { key: 'n', label: 'N.°', render: (f) => <Link to={`/presupuestos/${f.p.id}`} className="whitespace-nowrap font-bold text-texto hover:text-bold-red">{f.p.numero}</Link> },
            { key: 'c', label: 'Cliente', render: (f) => <span>{f.cliente.razonSocial}<span className="dl-sub">{TIPO_CLIENTE[f.cliente.tipo]} · {f.p.origen === 'whatsapp' ? 'WhatsApp' : 'Manual'}</span></span> },
            { key: 'e', label: 'Enviado', render: (f) => <span>{haceTexto(f.p.enviadoEl)}<span className="dl-sub">{f.estado === 'vencido' ? `Venció el ${formatFecha(f.p.validoHasta)}` : f.p.estado === 'enviado' ? `Vence el ${formatFecha(f.p.validoHasta)}` : formatFecha(f.p.fecha)}</span></span> },
            { key: 't', label: 'Total', align: 'right', render: (f) => formatARS(f.total) },
            { key: 's', label: 'Estado', render: (f) => <PresupuestoBadge estado={f.estado} /> },
          ]}
          rowActions={(f) => [
            ...(f.estado === 'enviado' || f.estado === 'vencido' ? [{ label: 'Recordar por WhatsApp', icon: 'send' as const, to: `/presupuestos/${f.p.id}?recordar=1` }] : []),
            { label: 'Descargar PDF', icon: 'download' as const, onClick: async () => { descargarPDF(await pdfPresupuesto(datosActuales(), f.p as Presupuesto), `Presupuesto ${f.p.numero}`); } },
            { label: f.p.estado === 'borrador' ? 'Editar' : 'Ver', icon: f.p.estado === 'borrador' ? 'pencil' as const : 'eye' as const, to: `/presupuestos/${f.p.id}` },
          ]}
          emptyIcon="file-text"
          emptyTitle="No hay presupuestos en este estado"
          emptyText="Probá con otra pestaña o creá un presupuesto nuevo."
          emptyAction={<Button icon="plus" onClick={() => navigate('/presupuestos/nuevo')}>Nuevo presupuesto</Button>}
        />
        <p className="m-0 text-caption text-texto-secundario">{formatNumero(filas.length)} presupuestos de los últimos 60 días.</p>
      </div>
    </Page>
  );
}
