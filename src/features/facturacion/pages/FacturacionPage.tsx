import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, DataTable, KpiCard, SearchInput, Tabs, toast } from '@/components/ui';
import { CobroBadge } from '@/components/negocio/Estados';
import { codigoComprobante, nombreComprobante } from '@/domain/calculos';
import type { Comprobante } from '@/domain/types';
import { descargarCSV, pesos } from '@/lib/csv';
import { aISO, claveMes, diasEntre } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatCUIT, formatFecha, formatMesAnio, formatPct, nombreMes } from '@/lib/format';
import { descargarPDF, pdfComprobante } from '@/services/pdf/documentos';
import { datosActuales, useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';

type Filtro = 'todos' | 'A' | 'B' | 'nc' | 'impagas';

export default function FacturacionPage() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [q, setQ] = useState('');
  const hoy = der.hoy;
  const mes = aISO(hoy).slice(0, 7);
  const mesAnt = aISO(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)).slice(0, 7);

  const signo = (c: Comprobante) => (c.clase === 'factura' ? 1 : -1);
  const kpis = useMemo(() => {
    const delMes = datos.comprobantes.filter((c) => claveMes(c.fecha) === mes);
    const antAlDia = datos.comprobantes.filter((c) => claveMes(c.fecha) === mesAnt && new Date(c.fecha).getDate() <= hoy.getDate());
    const total = delMes.reduce((a, c) => a + signo(c) * c.total, 0);
    const totalAnt = antAlDia.reduce((a, c) => a + signo(c) * c.total, 0);
    const iva = delMes.reduce((a, c) => a + signo(c) * c.iva, 0);
    const pendiente = datos.comprobantes.reduce((a, c) => a + (c.clase === 'factura' ? der.pendientes.get(c.id) ?? 0 : 0), 0);
    return { delMes, total, totalAnt, iva, pendiente };
  }, [datos.comprobantes, der.pendientes, mes, mesAnt, hoy]);

  const variacion = kpis.totalAnt ? ((kpis.total - kpis.totalAnt) / kpis.totalAnt) * 100 : 0;
  const filtrar: Record<Filtro, (c: Comprobante) => boolean> = {
    todos: () => true,
    A: (c) => c.clase === 'factura' && c.letra === 'A',
    B: (c) => c.clase === 'factura' && c.letra === 'B',
    nc: (c) => c.clase === 'nota_credito',
    impagas: (c) => c.clase === 'factura' && (der.pendientes.get(c.id) ?? 0) > 0,
  };
  const visibles = datos.comprobantes.filter(filtrar[filtro]).filter((c) => !q.trim() || normalizar(`${codigoComprobante(c)} ${c.numero} ${der.clientePorId.get(c.clienteId)?.razonSocial}`).includes(normalizar(q.trim())));

  const exportar = () => {
    descargarCSV('comprobantes', ['Comprobante', 'Fecha', 'Cliente', 'CUIT', 'Neto', 'IVA', 'Total', 'CAE', 'Pendiente de cobro'],
      visibles.map((c) => {
        const cli = der.clientePorId.get(c.clienteId)!;
        return [codigoComprobante(c), formatFecha(c.fecha), cli.razonSocial, formatCUIT(cli.cuit), pesos(signo(c) * c.neto), pesos(signo(c) * c.iva), pesos(signo(c) * c.total), c.cae, c.clase === 'factura' ? pesos(der.pendientes.get(c.id) ?? 0) : ''];
      }));
    toast.info('Planilla descargada', `${visibles.length} comprobantes exportados en CSV, listos para tu estudio contable.`);
  };

  return (
    <Page title="Facturación" overline="Administración · ARCA">
      <PageActions overline={formatMesAnio(hoy)}>
        <Button variant="secondary" icon="download" onClick={exportar}>Exportar a Excel</Button>
        <ButtonLink to="/facturacion/nueva" variant="primary" icon="receipt">Emitir factura</ButtonLink>
      </PageActions>

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label={`Facturado en ${nombreMes(hoy.getMonth())}`} value={formatARSKpi(kpis.total)} icon="receipt" trend={variacion >= 0 ? 'up' : 'down'} delta={formatPct(Math.abs(variacion))} deltaLabel={`vs. ${nombreMes(hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1)} al día ${hoy.getDate()}`} />
        <KpiCard label="IVA débito del mes" value={formatARSKpi(kpis.iva)} icon="percent" trend="flat" delta={`${kpis.delMes.length} comprobantes`} deltaLabel="para el Libro IVA Ventas" />
        <KpiCard label="Pendiente de cobro" value={formatARSKpi(kpis.pendiente)} icon="wallet" trend="flat" delta={`${der.conDeudaVencida.length} clientes`} deltaLabel="con deuda vencida" />
        <KpiCard label="Próximo número" value={`A ${datos.secuencias.factura.A}`} icon="hash" trend="flat" delta={`B ${datos.secuencias.factura.B}`} deltaLabel={`punto de venta ${String(datos.empresa.puntoVenta).padStart(4, '0')}`} />
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Tabs<Filtro>
            label="Filtrar comprobantes"
            value={filtro}
            onChange={setFiltro}
            tabs={[
              { id: 'todos', label: 'Todos', count: datos.comprobantes.length },
              { id: 'A', label: 'Facturas A', count: datos.comprobantes.filter(filtrar.A).length },
              { id: 'B', label: 'Facturas B', count: datos.comprobantes.filter(filtrar.B).length },
              { id: 'nc', label: 'Notas de crédito', count: datos.comprobantes.filter(filtrar.nc).length },
              { id: 'impagas', label: 'Impagas', count: datos.comprobantes.filter(filtrar.impagas).length },
            ]}
          />
          <SearchInput label="Buscar comprobante" hideLabel placeholder="Número o cliente" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-[280px]" />
        </div>
        <DataTable
          overline="Comprobantes electrónicos"
          title="Facturas y notas de crédito"
          rows={visibles}
          rowKey={(c) => c.id}
          rowLabel={(c) => codigoComprobante(c)}
          pageSize={15}
          columns={[
            { key: 'n', label: 'Comprobante', render: (c) => <span><Link to={`/facturacion/${c.id}`} className="font-bold text-texto tabular hover:text-bold-red">{codigoComprobante(c)}</Link><span className="dl-sub tabular">CAE {c.cae}</span></span> },
            { key: 'f', label: 'Fecha', render: (c) => <span className="tabular">{formatFecha(c.fecha)}</span> },
            { key: 'c', label: 'Cliente', render: (c) => <Link to={`/cuentas/${c.clienteId}`} className="hover:text-bold-red">{der.clientePorId.get(c.clienteId)?.razonSocial}</Link> },
            { key: 't', label: 'Total', align: 'right', render: (c) => (c.clase === 'factura' ? formatARS(c.total) : `− ${formatARS(c.total)}`) },
            {
              key: 's', label: 'Cobro', render: (c) => (c.clase === 'factura'
                ? <CobroBadge pendiente={der.pendientes.get(c.id) ?? 0} total={c.total} vencida={diasEntre(c.vencePago, hoy) > 0} />
                : <Badge tone="info" icon="undo">Crédito</Badge>),
            },
          ]}
          rowActions={(c) => [
            { label: 'Descargar PDF', icon: 'download', onClick: async () => descargarPDF(await pdfComprobante(datosActuales(), c), nombreComprobante(c)) },
            { label: 'Ver', icon: 'eye', to: `/facturacion/${c.id}` },
          ]}
          emptyIcon="receipt"
          emptyTitle="No hay comprobantes en esta vista"
          emptyText="Las facturas se emiten desde un pedido."
        />
      </div>
    </Page>
  );
}
