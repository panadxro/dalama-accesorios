import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Alert, Badge, Button, ButtonLink, DataTable, KpiCard, SearchInput, Tabs, toast } from '@/components/ui';
import { PedidoBadge } from '@/components/negocio/Estados';
import { ESTADO_PEDIDO, METODO_ENTREGA, codigoComprobante, totalPedido } from '@/domain/calculos';
import type { Pedido } from '@/domain/types';
import { descargarCSV, pesos } from '@/lib/csv';
import { diasEntre, mismoDia } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatFecha, formatHora } from '@/lib/format';
import { descargarPDF, pdfRemito } from '@/services/pdf/documentos';
import { datosActuales, useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';

type Filtro = 'activos' | 'facturar' | 'hoy' | 'entregados' | 'todos';

export function cuandoEntrega(iso: string): string {
  const d = diasEntre(new Date(), iso);
  if (d === 0) return `Hoy ${formatHora(iso)}`;
  if (d === 1) return `Mañana ${formatHora(iso)}`;
  if (d === -1) return `Ayer ${formatHora(iso)}`;
  return `${formatFecha(iso).slice(0, 5)} ${formatHora(iso)}`;
}

export default function PedidosPage() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [filtro, setFiltro] = useState<Filtro>('activos');
  const [q, setQ] = useState('');
  const iva = datos.ajustes.ivaPct;

  const activos = (p: Pedido) => p.estado !== 'entregado' && p.estado !== 'cancelado';
  const grupos: Record<Filtro, (p: Pedido) => boolean> = {
    activos,
    facturar: (p) => activos(p) && !p.comprobanteId,
    hoy: (p) => p.estado !== 'cancelado' && mismoDia(p.entrega.fecha, der.hoy),
    entregados: (p) => p.estado === 'entregado',
    todos: () => true,
  };

  const visibles = useMemo(
    () =>
      datos.pedidos
        .filter(grupos[filtro])
        .filter((p) => !q.trim() || normalizar(`${p.numero} ${der.clientePorId.get(p.clienteId)?.razonSocial} ${p.remito?.numero ?? ''}`).includes(normalizar(q.trim())))
        .sort((a, b) => (filtro === 'entregados' || filtro === 'todos' ? b.entrega.fecha.localeCompare(a.entrega.fecha) : a.entrega.fecha.localeCompare(b.entrega.fecha))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [datos.pedidos, filtro, q, der],
  );

  const enCurso = datos.pedidos.filter(activos);
  const paraFacturar = enCurso.filter((p) => !p.comprobanteId);
  const hoy = der.entregasHoy;
  const entregadosHoy = hoy.filter((p) => p.estado === 'entregado').length;
  const cmp = (id?: string) => (id ? datos.comprobantes.find((c) => c.id === id) : undefined);

  const exportar = () => {
    descargarCSV('pedidos', ['Pedido', 'Fecha', 'Cliente', 'Entrega', 'Método', 'Estado', 'Remito', 'Factura', 'Total con IVA'],
      visibles.map((p) => [p.numero, formatFecha(p.fecha), der.clientePorId.get(p.clienteId)?.razonSocial, `${formatFecha(p.entrega.fecha)} ${formatHora(p.entrega.fecha)}`, METODO_ENTREGA[p.entrega.metodo], ESTADO_PEDIDO[p.estado], p.remito?.numero ?? '', cmp(p.comprobanteId) ? codigoComprobante(cmp(p.comprobanteId)!) : '', pesos(totalPedido(p, iva))]));
    toast.info('Planilla descargada', `${visibles.length} pedidos exportados en formato CSV.`);
  };

  return (
    <Page title="Pedidos y entregas" overline="Operación">
      <PageActions overline="Del presupuesto a la entrega">
        <Button variant="secondary" icon="download" onClick={exportar}>Exportar a Excel</Button>
        <ButtonLink to="/entregas" variant="primary" icon="truck">Entregas de hoy</ButtonLink>
      </PageActions>

      <section aria-label="Indicadores" data-tour="pedidos" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Pedidos en curso" value={enCurso.length} icon="package" delta={formatARSKpi(enCurso.reduce((a, p) => a + totalPedido(p, iva), 0))} deltaLabel="a entregar" />
        <KpiCard label="Para facturar" value={paraFacturar.length} icon="receipt" trend="flat" delta={formatARSKpi(paraFacturar.reduce((a, p) => a + totalPedido(p, iva), 0))} deltaLabel="sin factura emitida" />
        <KpiCard label="Entregas de hoy" value={`${entregadosHoy} de ${hoy.length}`} icon="truck" trend="flat" delta={`${hoy.filter((p) => p.entrega.metodo === 'camioneta').length} en camioneta`} deltaLabel={`${hoy.filter((p) => p.entrega.metodo === 'retiro').length} retiran en el local`} />
        <KpiCard label="Cobrar al entregar" value={formatARSKpi(hoy.reduce((a, p) => a + (p.estado !== 'entregado' ? p.entrega.cobrarAlEntregar ?? 0 : 0), 0))} icon="wallet" trend="flat" delta="Hoy" deltaLabel="en efectivo o transferencia" />
      </section>

      {paraFacturar.length > 0 && (
        <Alert tone="info" title={`${paraFacturar.length} ${paraFacturar.length === 1 ? 'pedido espera' : 'pedidos esperan'} la factura`}>
          El stock se descuenta y la cuenta corriente se actualiza al facturar. {paraFacturar.slice(0, 3).map((p, i) => (
            <span key={p.id}>{i > 0 && ', '}<Link className="dl-link" to={`/facturacion/nueva?pedido=${p.id}`}>{p.numero}</Link></span>
          ))}
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Tabs<Filtro>
            label="Filtrar pedidos"
            value={filtro}
            onChange={setFiltro}
            tabs={[
              { id: 'activos', label: 'En curso', count: enCurso.length },
              { id: 'facturar', label: 'Para facturar', count: paraFacturar.length },
              { id: 'hoy', label: 'Entregas de hoy', count: hoy.length },
              { id: 'entregados', label: 'Entregados', count: datos.pedidos.filter(grupos.entregados).length },
              { id: 'todos', label: 'Todos' },
            ]}
          />
          <SearchInput label="Buscar pedido" hideLabel placeholder="Pedido, remito o cliente" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-[280px]" />
        </div>
        <DataTable
          overline="Pedidos"
          title={{ activos: 'Pedidos en curso', facturar: 'Pedidos para facturar', hoy: 'Entregas de hoy', entregados: 'Pedidos entregados', todos: 'Todos los pedidos' }[filtro]}
          rows={visibles}
          rowKey={(p) => p.id}
          rowLabel={(p) => p.numero}
          pageSize={12}
          columns={[
            { key: 'n', label: 'Pedido', render: (p) => <span><Link to={`/pedidos/${p.id}`} className="whitespace-nowrap font-bold text-texto hover:text-bold-red">{p.numero}</Link><span className="dl-sub">{p.remito?.numero ?? 'Sin remito'}</span></span> },
            { key: 'c', label: 'Cliente', render: (p) => der.clientePorId.get(p.clienteId)?.razonSocial },
            { key: 'e', label: 'Entrega', render: (p) => <span className="tabular">{cuandoEntrega(p.entrega.fecha)}<span className="dl-sub">{METODO_ENTREGA[p.entrega.metodo]}{p.entrega.empresa ? ` · ${p.entrega.empresa}` : ''}</span></span> },
            { key: 'f', label: 'Factura', render: (p) => { const c = cmp(p.comprobanteId); return c ? <Link to={`/facturacion/${c.id}`} className="tabular hover:text-bold-red">{codigoComprobante(c)}</Link> : <Badge tone="warning" icon="receipt">Sin facturar</Badge>; } },
            { key: 't', label: 'Total', align: 'right', render: (p) => formatARS(totalPedido(p, iva)) },
            { key: 's', label: 'Estado', render: (p) => <PedidoBadge estado={p.estado} /> },
          ]}
          rowActions={(p) => [
            ...(!p.comprobanteId && p.estado !== 'cancelado' ? [{ label: 'Emitir factura', icon: 'receipt' as const, to: `/facturacion/nueva?pedido=${p.id}` }] : []),
            ...(p.remito ? [{ label: 'Descargar remito', icon: 'download' as const, onClick: async () => descargarPDF(await pdfRemito(datosActuales(), p), `Remito ${p.remito!.numero}`) }] : []),
            { label: 'Ver', icon: 'eye' as const, to: `/pedidos/${p.id}` },
          ]}
          emptyIcon="package"
          emptyTitle={filtro === 'facturar' ? 'No hay pedidos para facturar' : 'No hay pedidos en esta vista'}
          emptyText={filtro === 'facturar' ? 'Todos los pedidos en curso ya tienen factura.' : 'Los pedidos se crean al convertir un presupuesto aceptado.'}
          emptyAction={<ButtonLink to="/presupuestos" variant="secondary">Ver presupuestos</ButtonLink>}
        />
      </div>
    </Page>
  );
}
