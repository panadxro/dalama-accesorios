import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, Card, DataTable, KpiCard, SearchInput, SectionTitle, Select, Sheet, StatusBadge, Switch, Tabs, TextInput, toast, type BadgeTone } from '@/components/ui';
import { estadoStock } from '@/domain/calculos';
import type { MovimientoStock, Producto, TipoMovimientoStock } from '@/domain/types';
import { cn } from '@/lib/cn';
import { descargarCSV } from '@/lib/csv';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatFecha, formatFechaCorta, formatHora } from '@/lib/format';
import { agregarALista, ajustarStock, ejecutar } from '@/store/acciones';
import { useCantidadInicial } from '@/features/compras/sugerencias';
import { useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';

type Vista = 'actual' | 'mov' | 'conteos';

const TIPO_MOV: Record<TipoMovimientoStock, [string, BadgeTone]> = {
  venta: ['Venta', 'neutral'], ingreso: ['Ingreso', 'success'], ajuste: ['Ajuste', 'warning'], conteo: ['Conteo', 'warning'], devolucion: ['Devolución', 'info'],
};
const MOTIVOS = ['Rotura en el depósito', 'Faltante', 'Error de carga', 'Muestra para cliente', 'Otro'];

function rutaReferencia(m: MovimientoStock): string | undefined {
  if (!m.referencia) return undefined;
  if (m.referencia.tipo === 'pedido') return `/pedidos/${m.referencia.id}`;
  if (m.referencia.tipo === 'comprobante') return `/facturacion/${m.referencia.id}`;
  if (m.referencia.tipo === 'orden_compra') return '/compras';
  return undefined;
}

function AjustarStock({ producto, onClose }: { producto: Producto; onClose: () => void }) {
  const [signo, setSigno] = useState<1 | -1>(-1);
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const queda = producto.stock + signo * cantidad;
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      overline={producto.codigo}
      title="Registrar ajuste"
      description={producto.nombre}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button icon="check" disabled={cantidad <= 0} onClick={() => {
          const p = ejecutar((d) => ajustarStock(d, producto.id, signo * cantidad, motivo));
          onClose();
          toast.success('Ajuste registrado', `${producto.nombre} quedó en ${p.stock} ${p.unidad}. El movimiento queda en el historial con el motivo “${motivo.toLowerCase()}”.`);
        }}>Registrar ajuste</Button>
      </>}
    >
      <div className="flex flex-col gap-4">
        <Tabs<'-1' | '1'> label="Tipo de ajuste" value={String(signo) as '-1' | '1'} onChange={(v) => setSigno(Number(v) as 1 | -1)} tabs={[{ id: '-1', label: 'Restar' }, { id: '1', label: 'Sumar' }]} />
        <TextInput label="Cantidad" type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Math.max(0, Number(e.target.value) || 0))} helper={`${producto.stock} ${producto.unidad} hoy → quedan ${queda} ${producto.unidad}`} />
        <Select label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} options={MOTIVOS} />
      </div>
    </Sheet>
  );
}

/** Suma un producto a la lista de pedido a proveedores y avisa dónde quedó. */
function sumarALista(p: Producto, cantidad: number) {
  ejecutar((d) => agregarALista(d, [{ productoId: p.id, cantidad }]));
  toast.info('Sumado a la lista de pedido', `${p.nombre}: ${cantidad} ${p.unidad} · las órdenes se generan desde Compras → Lista de pedido.`);
}

export default function StockPage() {
  const [params, setParams] = useSearchParams();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const inicial = useCantidadInicial();
  const [vista, setVista] = useState<Vista>('actual');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [soloBajo, setSoloBajo] = useState(false);
  const [ajustando, setAjustando] = useState<Producto | null>(null);
  const [productoMov, setProductoMov] = useState<string>('');

  useEffect(() => {
    if (params.get('q')) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valor = datos.productos.reduce((a, p) => a + Math.max(0, p.stock) * p.costo, 0);
  const sinStock = der.stockBajo.filter((p) => p.stock <= 0);
  const ultimo = datos.conteos[0];
  const conteosPorFecha = useMemo(() => {
    const m = new Map<string, typeof datos.conteos>();
    for (const c of datos.conteos) { const k = c.fecha.slice(0, 16); m.set(k, [...(m.get(k) ?? []), c]); }
    return [...m.values()];
  }, [datos.conteos]);
  const difUltimo = conteosPorFecha[0]?.reduce((a, c) => a + c.items.filter((i) => i.contado !== i.sistema).length, 0) ?? 0;

  const filas = datos.productos
    .filter((p) => !soloBajo || estadoStock(p) !== 'ok')
    .filter((p) => !q.trim() || normalizar(`${p.codigo} ${p.nombre} ${p.ubicacion}`).includes(normalizar(q.trim())))
    .sort((a, b) => a.ubicacion.localeCompare(b.ubicacion));

  const movs = datos.movimientosStock.filter((m) => !productoMov || m.productoId === productoMov);

  const exportar = () => {
    descargarCSV('stock', ['Código', 'Producto', 'Ubicación', 'Stock', 'Mínimo', 'Reservado', 'Disponible', 'Costo unitario', 'Valor al costo'],
      filas.map((p) => { const r = der.reservado.get(p.id) ?? 0; return [p.codigo, p.nombre, p.ubicacion, p.stock, p.stockMinimo, r, p.stock - r, p.costo / 100, (Math.max(0, p.stock) * p.costo) / 100]; }));
    toast.info('Planilla descargada', `${filas.length} productos con su stock, en CSV.`);
  };

  return (
    <Page title="Stock" overline="Catálogo · Depósito">
      <PageActions overline={`Hoy, ${der.hoy.getDate()} de ${der.hoy.toLocaleDateString('es-AR', { month: 'long' })}`}>
        <Button variant="tertiary" icon="download" onClick={exportar}>Exportar</Button>
        <ButtonLink to="/stock/conteo" variant="secondary" icon="clipboard">Iniciar conteo</ButtonLink>
        <ButtonLink to="/compras" variant="primary" icon="cart">Pedir faltantes al proveedor</ButtonLink>
      </PageActions>

      <section aria-label="Indicadores de stock" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Valor al costo" value={formatARS(valor, { sinCentavos: true })} icon="wallet" trend="flat" delta={`${datos.productos.length} productos`} deltaLabel="sin IVA" />
        <KpiCard label="Bajo el mínimo" value={der.stockBajo.length - sinStock.length} icon="alert-triangle" trend="flat" delta="Reponer" deltaLabel="hasta el doble del mínimo" />
        <KpiCard label="Sin stock" value={sinStock.length} icon="boxes" trend="flat" delta={`${sinStock.filter((p) => (der.reservado.get(p.id) ?? 0) > 0).length} con pedidos esperando`} deltaLabel="" />
        <KpiCard label="Último conteo" value={ultimo ? formatFechaCorta(ultimo.fecha) : '—'} icon="check-circle" trend="flat" delta={`${difUltimo} diferencias`} deltaLabel={conteosPorFecha[0]?.map((c) => c.estante.replace('Estante ', '')).join(', ') ?? ''} />
      </section>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-[3_1_920px] flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Tabs<Vista> label="Vistas" value={vista} onChange={setVista} tabs={[{ id: 'actual', label: 'Stock actual' }, { id: 'mov', label: 'Movimientos', count: datos.movimientosStock.length }, { id: 'conteos', label: 'Conteos', count: datos.conteos.length }]} />
            {vista === 'actual' && <Switch checked={soloBajo} onChange={setSoloBajo}>Solo bajo mínimo o sin stock</Switch>}
          </div>

          {vista === 'actual' && (
            <>
              <SearchInput label="Buscar en el depósito" hideLabel placeholder="Código, nombre o estante" value={q} onChange={(e) => setQ(e.target.value)} />
              <DataTable
                overline="Depósito"
                title="Stock actual"
                caption="Stock actual por producto"
                rows={filas}
                rowKey={(p) => p.id}
                rowLabel={(p) => p.codigo}
                pageSize={12}
                columns={[
                  { key: 'n', label: 'Producto', render: (p) => <span><strong>{p.nombre}</strong><span className="dl-sub">{p.codigo}</span></span> },
                  { key: 'u', label: 'Ubicación', render: (p) => `Estante ${p.ubicacion}` },
                  { key: 'q', label: 'Stock', align: 'right', render: (p) => { const r = der.reservado.get(p.id) ?? 0; return <span><strong className={p.stock <= 0 ? 'text-error' : ''}>{p.stock} {p.unidad}</strong>{r > 0 && <span className="dl-sub">{r} reservadas</span>}</span>; } },
                  { key: 'm', label: 'Mínimo', align: 'right', render: (p) => `${p.stockMinimo} ${p.unidad}` },
                  {
                    key: 'b', label: 'Nivel', render: (p) => {
                      const pct = p.stockMinimo ? Math.max(0, Math.min(100, (p.stock / (p.stockMinimo * 2)) * 100)) : 100;
                      return (
                        <div className="relative h-2 w-[120px] bg-arena-100" role="img" aria-label={`${p.stock} de mínimo ${p.stockMinimo}`}>
                          <div className={cn('h-2', p.stock < p.stockMinimo ? 'bg-advertencia' : 'bg-ink-black')} style={{ width: `${pct}%` }} />
                          {p.stockMinimo > 0 && <div className="absolute -top-[3px] left-1/2 h-3.5 w-0.5 bg-neutro-700" />}
                        </div>
                      );
                    },
                  },
                  { key: 'e', label: 'Estado', render: (p) => { const e = estadoStock(p); return e === 'sin_stock' ? <Badge tone="error" strong icon="alert-triangle">Sin stock</Badge> : e === 'bajo' ? <StatusBadge status="stock-bajo" /> : <Badge tone="success">OK</Badge>; } },
                ]}
                rowActions={(p) => [
                  { label: 'Agregar a la lista de pedido', icon: 'cart' as const, onClick: () => sumarALista(p, inicial(p)) },
                  { label: 'Ver movimientos', icon: 'eye' as const, onClick: () => { setProductoMov(p.id); setVista('mov'); } },
                  { label: 'Ajustar', icon: 'pencil' as const, onClick: () => setAjustando(p) },
                ]}
                emptyIcon="check-circle"
                emptyTitle={soloBajo ? 'Todo el stock está sobre el mínimo' : 'No encontramos productos'}
                emptyText={soloBajo ? 'No hay nada para reponer por ahora.' : 'Probá con el código o el estante.'}
              />
              <p className="m-0 text-caption text-texto-secundario">La marca vertical en la barra es el stock mínimo; la barra llena equivale al doble del mínimo. Lo reservado está en pedidos todavía sin facturar.</p>
            </>
          )}

          {vista === 'mov' && (
            <>
              <Select label="Producto" hideLabel value={productoMov} onChange={(e) => setProductoMov(e.target.value)} options={[{ value: '', label: 'Todos los productos' }, ...[...datos.productos].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((p) => ({ value: p.id, label: `${p.nombre} · ${p.codigo}` }))]} />
              <DataTable
                overline="Historial"
                title={productoMov ? `Movimientos de ${der.productoPorId.get(productoMov)?.codigo}` : 'Movimientos de stock'}
                rows={movs}
                rowKey={(m) => m.id}
                pageSize={15}
                columns={[
                  { key: 'f', label: 'Fecha', render: (m) => <span className="tabular">{formatFecha(m.fecha)}<span className="dl-sub">{formatHora(m.fecha)}</span></span> },
                  { key: 'p', label: 'Producto', render: (m) => { const p = der.productoPorId.get(m.productoId); return <span>{p?.nombre}<span className="dl-sub">{p?.codigo}</span></span>; } },
                  { key: 't', label: 'Tipo', render: (m) => <Badge tone={TIPO_MOV[m.tipo][1]}>{TIPO_MOV[m.tipo][0]}</Badge> },
                  { key: 'd', label: 'Origen', render: (m) => { const r = rutaReferencia(m); const txt = m.referencia ? `${m.referencia.tipo === 'pedido' ? 'Pedido' : m.referencia.tipo === 'orden_compra' ? 'Orden' : m.referencia.tipo === 'comprobante' ? 'Comprobante' : 'Conteo'} ${m.referencia.numero}` : m.motivo ?? '—'; return <span>{r ? <Link to={r} className="hover:text-bold-red">{txt}</Link> : txt}<span className="dl-sub">{m.usuario}{m.motivo && m.referencia ? ` · ${m.motivo}` : ''}</span></span>; } },
                  { key: 'q', label: 'Cantidad', align: 'right', render: (m) => <strong className={m.cantidad > 0 ? 'text-exito' : ''}>{m.cantidad > 0 ? `+${m.cantidad}` : `−${Math.abs(m.cantidad)}`}</strong> },
                  { key: 'r', label: 'Quedó', align: 'right', render: (m) => m.stockResultante },
                ]}
                emptyIcon="boxes"
                emptyTitle="Sin movimientos"
                emptyText="Las ventas, ingresos, ajustes y conteos se registran solos acá."
              />
            </>
          )}

          {vista === 'conteos' && (
            <DataTable
              overline="Inventario"
              title="Conteos"
              rows={datos.conteos}
              rowKey={(c) => c.id}
              pagination={false}
              columns={[
                { key: 'f', label: 'Fecha', render: (c) => `${formatFecha(c.fecha)} ${formatHora(c.fecha)}` },
                { key: 'e', label: 'Estante', render: (c) => c.estante },
                { key: 'i', label: 'Productos', align: 'right', render: (c) => c.items.length },
                { key: 'd', label: 'Diferencias', align: 'right', render: (c) => { const n = c.items.filter((i) => i.contado !== i.sistema).length; return n ? <Badge tone="warning">{n}</Badge> : <Badge tone="success">Sin diferencias</Badge>; } },
                { key: 'u', label: 'Contó', render: (c) => c.usuario },
              ]}
              emptyIcon="clipboard"
              emptyTitle="Todavía no hay conteos"
              emptyAction={<ButtonLink to="/stock/conteo" variant="secondary">Iniciar conteo</ButtonLink>}
            />
          )}
        </div>

        <aside className="grid min-w-0 flex-[2_1_340px] content-start gap-4 lg:grid-cols-2 min-[1600px]:grid-cols-1">
          <Card aria-label="Movimientos recientes">
            <SectionTitle overline="Movimientos" title="Últimos registrados" action={<button type="button" className="dl-link text-body-small" onClick={() => { setProductoMov(''); setVista('mov'); }}>Ver todos</button>} />
            <ul className="m-0 mt-3 list-none p-0">
              {datos.movimientosStock.slice(0, 6).map((m) => {
                const p = der.productoPorId.get(m.productoId);
                return (
                  <li key={m.id} className="flex items-start gap-3 border-b border-arena-100 py-3 last:border-0">
                    <span className={cn('grid h-8 min-w-[52px] shrink-0 place-items-center rounded-sm px-1.5 text-body-small font-bold tabular', m.cantidad > 0 ? 'bg-ink-black text-neutro-0' : 'bg-arena-100 text-texto')}>{m.cantidad > 0 ? `+${m.cantidad}` : `−${Math.abs(m.cantidad)}`}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-body font-semibold">{p?.nombre}</span><span className="block truncate text-caption text-texto-secundario">{m.referencia ? `${m.referencia.numero}` : m.motivo} · {m.usuario}</span></span>
                    <span className="flex shrink-0 flex-col items-end gap-1"><Badge tone={TIPO_MOV[m.tipo][1]}>{TIPO_MOV[m.tipo][0]}</Badge><span className="text-caption text-texto-secundario tabular">{formatFechaCorta(m.fecha)} {formatHora(m.fecha)}</span></span>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card className="flex flex-col gap-3" aria-label="Próximo conteo">
            <SectionTitle overline="Inventario" title="Próximo conteo sugerido" />
            <p className="m-0 text-body">Estantes D y E (rieles y mosquiteros) · {datos.productos.filter((p) => /^[DE]/.test(p.ubicacion)).length} productos. Se hace desde el celular, estante por estante, sin ver la cantidad del sistema.</p>
            {ultimo && <p className="m-0 text-caption text-texto-secundario">El último conteo fue hace {diasEntre(ultimo.fecha, der.hoy)} días.</p>}
            <ButtonLink to="/stock/conteo" variant="secondary" icon="clipboard">Empezar desde el celular</ButtonLink>
          </Card>
        </aside>
      </div>

      {ajustando && <AjustarStock producto={ajustando} onClose={() => setAjustando(null)} />}
    </Page>
  );
}
