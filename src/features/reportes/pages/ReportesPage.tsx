import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { Page, PageActions } from '@/app/layout/Page';
import { Alert, Badge, Button, Card, DataTable, KpiCard, SectionTitle, Select, Tabs, toast } from '@/components/ui';
import { CATEGORIA, CONDICION_IVA_CORTA, TIPO_CLIENTE, codigoComprobante } from '@/domain/calculos';
import type { Categoria, TipoCliente } from '@/domain/types';
import { descargarCSV, pesos } from '@/lib/csv';
import { claveMes } from '@/lib/fechas';
import { formatARS, formatARSCorto, formatCUIT, formatFecha, formatMesAnio, formatNumero, formatPct, nombreMes } from '@/lib/format';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { PERIODOS, agrupar, libroIva, lineasVenta, rango, resumen, type Filtros, type Periodo } from '../calculos';

const TINTA = '#111111';
const ARENA = '#A8916D';
const GRILLA = '#F3EDE3';
const TEXTO = '#3D3833';
const eje = { fontSize: 11, fill: TEXTO, fontFamily: 'Montserrat' };

function GloboBarra({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sm border border-borde bg-superficie px-3 py-2 text-body-small shadow-2">
      <div className="font-semibold">{label}</div>
      <div className="tabular">{formatARS(payload[0].value ?? 0)} <span className="text-texto-secundario">neto</span></div>
    </div>
  );
}

export default function ReportesPage() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const hoy = der.hoy;
  const iva = datos.ajustes.ivaPct;
  const [f, setF] = useState<Filtros>({ periodo: 'mes', tipo: 'todos', categoria: 'todas' });
  const meses = useMemo(() => Array.from({ length: 6 }, (_, i) => new Date(hoy.getFullYear(), hoy.getMonth() - 5 + i, 1)), [hoy]);
  const [mesIva, setMesIva] = useState(String(4)); // índice en `meses`: mes anterior completo

  const lineas = useMemo(() => lineasVenta(datos, f, hoy), [datos, f, hoy]);
  const r = useMemo(() => resumen(lineas, iva), [lineas, iva]);

  // Mismo período anterior para comparar.
  const comparacion = useMemo(() => {
    const { desde, hasta } = rango(f.periodo, hoy);
    const meses_ = (hasta.getFullYear() - desde.getFullYear()) * 12 + hasta.getMonth() - desde.getMonth();
    const prev = { desde: new Date(desde.getFullYear(), desde.getMonth() - meses_, 1), hasta: desde };
    // El mes en curso se compara contra el mismo día del mes anterior.
    if (f.periodo === 'mes') prev.hasta = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate() + 1);
    return resumen(lineasVenta(datos, f, hoy, prev), iva);
  }, [datos, f, hoy, iva]);
  const variacion = comparacion.neto ? ((r.neto - comparacion.neto) / comparacion.neto) * 100 : 0;

  const porMes = useMemo(() => {
    const todas = lineasVenta(datos, { ...f, periodo: 'seis' }, hoy);
    const g = agrupar(todas, (l) => claveMes(l.comprobante.fecha));
    return meses.map((m) => {
      const k = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
      return { mes: nombreMes(m.getMonth()).slice(0, 3).replace(/^./, (c) => c.toUpperCase()), neto: g.find((x) => x.clave === k)?.neto ?? 0, actual: m.getMonth() === hoy.getMonth() };
    });
  }, [datos, f, hoy, meses]);

  const porCategoria = useMemo(() => agrupar(lineas, (l) => l.producto.categoria).map((x) => ({ ...x, nombre: CATEGORIA[x.clave as Categoria] })), [lineas]);
  const porProducto = useMemo(() => agrupar(lineas, (l) => l.producto.id).map((x) => ({ ...x, p: der.productoPorId.get(x.clave)! })), [lineas, der]);
  const porCliente = useMemo(() => agrupar(lineas, (l) => l.cliente.id).map((x) => ({ ...x, c: der.clientePorId.get(x.clave)! })), [lineas, der]);

  const mesLibro = meses[Number(mesIva)];
  const libro = useMemo(() => libroIva(datos, mesLibro.getFullYear(), mesLibro.getMonth()), [datos, mesLibro]);
  const sgn = (c: { clase: string }) => (c.clase === 'factura' ? 1 : -1);
  const libroTot = libro.reduce((a, c) => ({ neto: a.neto + sgn(c) * c.neto, iva: a.iva + sgn(c) * c.iva, total: a.total + sgn(c) * c.total }), { neto: 0, iva: 0, total: 0 });
  const nombrePeriodo = f.periodo === 'mes' ? formatMesAnio(hoy) : PERIODOS[f.periodo].toLowerCase();

  const exportarProductos = () => {
    descargarCSV('margen-por-producto', ['Código', 'Producto', 'Categoría', 'Unidades', 'Neto', 'Costo estimado', 'Margen %'], porProducto.map((x) => [x.p.codigo, x.p.nombre, CATEGORIA[x.p.categoria], x.cantidad, pesos(x.neto), pesos(x.costo), Math.round(x.margenPct * 10) / 10]));
    toast.info('Planilla descargada', 'Margen por producto en CSV.');
  };
  const exportarClientes = () => {
    descargarCSV('ventas-por-cliente', ['Cliente', 'Tipo', 'Facturas', 'Neto', 'Participación %'], porCliente.map((x) => [x.c.razonSocial, TIPO_CLIENTE[x.c.tipo], x.facturas, pesos(x.neto), Math.round((x.neto / (r.neto || 1)) * 1000) / 10]));
    toast.info('Planilla descargada', 'Ventas por cliente en CSV.');
  };
  const exportarLibro = () => {
    descargarCSV(`libro-iva-ventas-${claveMes(libro[0]?.fecha ?? '2026-01')}`, ['Fecha', 'Comprobante', 'Cliente', 'CUIT', 'Condición IVA', 'Neto gravado', 'IVA 21 %', 'Total', 'CAE'],
      libro.map((c) => { const cl = der.clientePorId.get(c.clienteId)!; return [formatFecha(c.fecha), codigoComprobante(c), cl.razonSocial, formatCUIT(cl.cuit), CONDICION_IVA_CORTA[cl.condicionIVA], pesos(sgn(c) * c.neto), pesos(sgn(c) * c.iva), pesos(sgn(c) * c.total), c.cae]; }));
    toast.info('Libro IVA Ventas descargado', `${libro.length} comprobantes de ${formatMesAnio(mesLibro).toLowerCase()} en CSV, listo para el estudio contable.`);
  };
  const exportarTodo = () => {
    descargarCSV(`ventas-${f.periodo}`, ['Fecha', 'Comprobante', 'Cliente', 'Tipo de cliente', 'Código', 'Producto', 'Categoría', 'Cantidad', 'Neto', 'Costo estimado'],
      lineas.map((l) => [formatFecha(l.comprobante.fecha), codigoComprobante(l.comprobante), l.cliente.razonSocial, TIPO_CLIENTE[l.cliente.tipo], l.producto.codigo, l.producto.nombre, CATEGORIA[l.producto.categoria], l.signo * l.cantidad, pesos(l.neto), pesos(l.costo)]));
    toast.info('Planilla descargada', `${formatNumero(lineas.length)} renglones de venta (${nombrePeriodo}) en CSV.`);
  };

  return (
    <Page title="Reportes" overline="Análisis">
      <PageActions overline="Filtros">
        <Button variant="secondary" icon="download" onClick={exportarTodo}>Exportar todo a Excel</Button>
      </PageActions>

      <section aria-label="Filtros" className="flex flex-wrap items-end gap-4">
        <Tabs<Periodo> label="Período" value={f.periodo} onChange={(periodo) => setF((x) => ({ ...x, periodo }))} tabs={(Object.keys(PERIODOS) as Periodo[]).map((p) => ({ id: p, label: PERIODOS[p] }))} />
        <div className="ml-auto flex flex-wrap gap-3">
          <Select label="Tipo de cliente" value={f.tipo} onChange={(e) => setF((x) => ({ ...x, tipo: e.target.value as TipoCliente | 'todos' }))} options={[{ value: 'todos', label: 'Todos' }, ...(Object.keys(TIPO_CLIENTE) as TipoCliente[]).map((k) => ({ value: k, label: `${TIPO_CLIENTE[k]}s` }))]} className="w-[180px]" />
          <Select label="Categoría" value={f.categoria} onChange={(e) => setF((x) => ({ ...x, categoria: e.target.value as Categoria | 'todas' }))} options={[{ value: 'todas', label: 'Todas' }, ...(Object.keys(CATEGORIA) as Categoria[]).map((k) => ({ value: k, label: CATEGORIA[k] }))]} className="w-[200px]" />
        </div>
      </section>

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Ventas" value={formatARS(r.total, { sinCentavos: true })} icon="chart" trend={variacion >= 0 ? 'up' : 'down'} delta={formatPct(Math.abs(variacion))} deltaLabel={f.periodo === 'mes' ? `vs. ${nombreMes(hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1)} al día ${hoy.getDate()}` : 'vs. período anterior'} />
        <KpiCard label="Margen bruto" value={formatPct(r.margenPct)} icon="percent" trend="flat" delta={formatARS(r.neto - r.costo, { sinCentavos: true })} deltaLabel="sobre neto, costo estimado" />
        <KpiCard label="Ticket promedio" value={formatARS(r.ticket, { sinCentavos: true })} icon="receipt" trend="flat" delta={`${r.facturas} facturas`} deltaLabel="IVA incluido" />
        <KpiCard label="Clientes que compraron" value={r.clientes} icon="users" trend="flat" delta={`de ${datos.clientes.length}`} deltaLabel={nombrePeriodo} />
      </section>

      <div className="flex flex-wrap gap-4">
        <Card className="min-w-0 flex-[3_1_560px]" aria-label="Ventas por mes">
          <SectionTitle overline="Neto sin IVA · últimos 6 meses" title="Ventas por mes" />
          <div className="mt-4 h-[260px]" role="img" aria-label={porMes.map((m) => `${m.mes}: ${formatARS(m.neto)}`).join('; ')}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porMes} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke={GRILLA} vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={{ stroke: GRILLA }} tick={eje} />
                <YAxis tickFormatter={(v) => formatARSCorto(v)} tickLine={false} axisLine={false} width={64} tick={eje} />
                <Tooltip content={<GloboBarra />} cursor={{ fill: '#FAF7F2' }} />
                <Bar dataKey="neto" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {porMes.map((m) => <Cell key={m.mes} fill={m.actual ? ARENA : TINTA} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="m-0 mt-2 text-caption text-texto-secundario">{porMes[5].mes} en arena: mes en curso, datos al día {hoy.getDate()}.</p>
        </Card>

        <Card className="min-w-0 flex-[2_1_360px]" aria-label="Ventas por categoría">
          <SectionTitle overline={`Neto · ${nombrePeriodo}`} title="Por categoría" />
          {porCategoria.length === 0 ? (
            <p className="m-0 mt-4 text-body text-texto-secundario">Sin ventas en el período.</p>
          ) : (
            <ol className="m-0 mt-5 flex list-none flex-col gap-3.5 p-0">
              {porCategoria.map((c) => (
                <li key={c.clave} className="flex flex-col gap-1.5">
                  <div className="flex justify-between gap-3 text-body-small"><span className="font-semibold">{c.nombre}</span><span className="tabular">{formatARS(c.neto, { sinCentavos: true })} · {formatPct((c.neto / (r.neto || 1)) * 100, 0)}</span></div>
                  <div className="h-2 rounded-[2px] bg-arena-100"><div className="h-2 rounded-[2px] bg-ink-black" style={{ width: `${(c.neto / porCategoria[0].neto) * 100}%` }} /></div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-[3_1_600px]">
          <DataTable
            overline={nombrePeriodo}
            title="Margen por producto"
            rows={porProducto}
            rowKey={(x) => x.clave}
            pageSize={10}
            headerAction={<Button variant="secondary" size="s" icon="download" onClick={exportarProductos}>CSV</Button>}
            columns={[
              { key: 'p', label: 'Producto', render: (x) => <span>{x.p.nombre}<span className="dl-sub">{x.p.codigo} · {CATEGORIA[x.p.categoria]}</span></span> },
              { key: 'u', label: 'Unidades', align: 'right', render: (x) => formatNumero(x.cantidad) },
              { key: 'n', label: 'Neto', align: 'right', render: (x) => formatARS(x.neto) },
              { key: 'm', label: 'Margen', align: 'right', render: (x) => (x.margenPct < 25 ? <Badge tone="warning" icon="alert-triangle">{formatPct(x.margenPct)}</Badge> : formatPct(x.margenPct)) },
            ]}
            emptyIcon="chart"
            emptyTitle="Sin ventas para estos filtros"
            emptyText="Probá con otro período o quitá el filtro de categoría."
          />
          <p className="m-0 mt-2 text-caption text-texto-secundario">Margen real (después de los descuentos de lista) bajo el 25 % en amarillo: candidatos para revisar el precio en <Link className="dl-link" to="/productos">Productos y precios</Link>.</p>
        </div>
        <div className="min-w-0 flex-[2_1_360px]">
          <DataTable
            overline={nombrePeriodo}
            title="Mejores clientes"
            minWidth={340}
            rows={porCliente}
            rowKey={(x) => x.clave}
            pageSize={8}
            headerAction={<Button variant="secondary" size="s" icon="download" onClick={exportarClientes}>CSV</Button>}
            columns={[
              { key: 'c', label: 'Cliente', render: (x) => <Link to={`/clientes/${x.c.id}`} className="hover:text-bold-red">{x.c.razonSocial}<span className="dl-sub">{TIPO_CLIENTE[x.c.tipo]} · {x.facturas} facturas</span></Link> },
              { key: 'n', label: 'Neto', align: 'right', render: (x) => <span>{formatARS(x.neto, { sinCentavos: true })}<span className="dl-sub">{formatPct((x.neto / (r.neto || 1)) * 100)}</span></span> },
            ]}
            emptyIcon="users"
            emptyTitle="Sin ventas para estos filtros"
          />
        </div>
      </div>

      <Card className="flex flex-col gap-4" aria-label="Libro IVA Ventas">
        <SectionTitle overline="Para la parte contable" title="Libro IVA Ventas" action={<Select label="Período" hideLabel value={mesIva} onChange={(e) => setMesIva(e.target.value)} options={meses.map((m, i) => ({ value: String(i), label: formatMesAnio(m) + (i === 5 ? ' (en curso)' : '') }))} className="w-[220px]" />} />
        <dl className="m-0 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {[
            ['Comprobantes', `${libro.length} · ${libro.filter((c) => c.clase === 'factura' && c.letra === 'A').length} FA · ${libro.filter((c) => c.clase === 'factura' && c.letra === 'B').length} FB · ${libro.filter((c) => c.clase === 'nota_credito').length} NC`],
            [`Neto gravado ${iva} %`, formatARS(libroTot.neto)],
            ['IVA débito fiscal', formatARS(libroTot.iva)],
            ['Total', formatARS(libroTot.total)],
          ].map(([k, v]) => (
            <div key={k}><dt className="text-overline uppercase text-texto-secundario">{k}</dt><dd className="m-0 mt-1 text-h3 tabular">{v}</dd></div>
          ))}
        </dl>
        <Alert tone="success" title="Sin diferencias con ARCA (simulado)">Los {libro.length} comprobantes del período tienen CAE y coinciden con los autorizados.</Alert>
        <div className="flex flex-wrap gap-2">
          <Button icon="download" onClick={exportarLibro}>Exportar a Excel</Button>
        </div>
      </Card>
    </Page>
  );
}
