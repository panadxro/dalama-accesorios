import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Alert, Badge, Button, ConfirmModal, DataTable, Icon, KpiCard, SearchInput, Select, Sheet, Switch, Tabs, toast } from '@/components/ui';
import { CATEGORIA, estadoStock, margenPct } from '@/domain/calculos';
import type { Categoria, Producto } from '@/domain/types';
import { descargarCSV, pesos } from '@/lib/csv';
import { formatARS, formatPct } from '@/lib/format';
import { actualizarPrecios, agregarALista, ejecutar } from '@/store/acciones';
import { useCantidadInicial } from '@/features/compras/sugerencias';
import { useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';
import { EditarProducto } from '../EditarProducto';

type Vista = 'todas' | Categoria;
type Alcance = 'categoria' | 'proveedor' | 'todos';

const redondear = (c: number) => Math.round(c / 1000) * 1000;

/** Actualización masiva de precios con vista previa (diseño: Productos.dc.html). */
function ActualizacionMasiva({ open, onClose }: { open: boolean; onClose: () => void }) {
  const datos = useDemo((s) => s.datos);
  const [alcance, setAlcance] = useState<Alcance>('proveedor');
  const [categoria, setCategoria] = useState<Categoria>('bisagras');
  const [proveedor, setProveedor] = useState(datos.proveedores[0].id);
  const [pct, setPct] = useState(7);
  const [conCosto, setConCosto] = useState(true);
  const [confirmar, setConfirmar] = useState(false);

  const afectados = datos.productos.filter((p) => p.activo && (alcance === 'todos' || (alcance === 'categoria' ? p.categoria === categoria : p.proveedorId === proveedor)));
  const nombreAlcance = alcance === 'todos' ? 'todo el catálogo' : alcance === 'categoria' ? CATEGORIA[categoria].toLowerCase() : datos.proveedores.find((p) => p.id === proveedor)!.razonSocial;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} overline="Precios" title="Actualización masiva" width={520}>
    <div className="flex flex-col gap-4">
      <Tabs<Alcance> label="Aplicar por" value={alcance} onChange={setAlcance} tabs={[{ id: 'proveedor', label: 'Proveedor' }, { id: 'categoria', label: 'Categoría' }, { id: 'todos', label: 'Todo' }]} />
      {alcance === 'proveedor' && <Select label="Proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} options={datos.proveedores.map((p) => ({ value: p.id, label: p.razonSocial }))} helper="Útil cuando llega la lista nueva de un proveedor." />}
      {alcance === 'categoria' && <Select label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)} options={(Object.keys(CATEGORIA) as Categoria[]).map((k) => ({ value: k, label: CATEGORIA[k] }))} />}
      <div className="dl-field">
        <label className="dl-label" htmlFor="aumento">Aumento</label>
        <div className="flex items-center gap-2">
          <button type="button" className="dl-iconbtn h-10 w-10 border border-neutro-500" aria-label="Bajar 1 %" onClick={() => setPct((v) => v - 1)}><Icon name="minus" size={16} /></button>
          <div className="dl-input-control w-28">
            <input id="aumento" type="number" inputMode="decimal" value={pct} onChange={(e) => setPct(Number(e.target.value) || 0)} className="text-right tabular" />
            <span className="dl-prefix">%</span>
          </div>
          <button type="button" className="dl-iconbtn h-10 w-10 border border-neutro-500" aria-label="Subir 1 %" onClick={() => setPct((v) => v + 1)}><Icon name="plus" size={16} /></button>
        </div>
      </div>
      <Switch checked={conCosto} onChange={setConCosto}>Actualizar también el costo</Switch>
      <Alert tone="info" title="Vista previa antes de aplicar">Redondeo a múltiplos de $ 10. Los presupuestos ya enviados mantienen su precio.</Alert>
      <div className="overflow-hidden rounded-sm border border-borde">
        <table className="w-full border-collapse text-body-small">
          <thead><tr className="bg-arena-100 text-left text-overline uppercase text-texto-secundario"><th className="px-3 py-2 font-semibold">Producto</th><th className="px-3 py-2 text-right font-semibold">Actual</th><th className="px-3 py-2 text-right font-semibold">Nuevo</th></tr></thead>
          <tbody>
            {afectados.slice(0, 6).map((p) => {
              const nuevo = redondear(p.precioLista * (1 + pct / 100));
              return (
                <tr key={p.id} className="border-t border-arena-100">
                  <td className="px-3 py-2"><span className="line-clamp-1">{p.nombre}</span></td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular text-texto-secundario">{formatARS(p.precioLista)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular">{formatARS(nuevo)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {afectados.length > 6 && <div className="border-t border-arena-100 px-3 py-2 text-caption text-texto-secundario">y {afectados.length - 6} productos más</div>}
      </div>
      <Button icon="percent" disabled={!afectados.length || pct === 0} onClick={() => setConfirmar(true)}>Aplicar a {afectados.length} productos</Button>
      <ConfirmModal
        open={confirmar}
        title={`¿Aplicar ${pct > 0 ? '+' : ''}${pct} % a ${afectados.length} productos?`}
        confirmLabel="Aplicar aumento"
        onCancel={() => setConfirmar(false)}
        onConfirm={() => {
          setConfirmar(false);
          onClose();
          const r = ejecutar((d) => actualizarPrecios(d, afectados.map((p) => p.id), pct, conCosto));
          toast.success('Precios actualizados', `${r.cantidad} productos de ${nombreAlcance} ${pct > 0 ? 'subieron' : 'bajaron'} ${Math.abs(pct)} %${conCosto ? ' (precio y costo)' : ''}. Se aplican desde los próximos presupuestos; los ya enviados mantienen su precio.`);
        }}
      >
        Se actualiza el precio de lista{conCosto ? ' y el costo' : ''} de {nombreAlcance}. Los presupuestos ya enviados no cambian.
      </ConfirmModal>
    </div>
    </Sheet>
  );
}

/** Suma un producto a la lista de pedido a proveedores y avisa dónde quedó. */
function sumarALista(p: Producto, cantidad: number) {
  ejecutar((d) => agregarALista(d, [{ productoId: p.id, cantidad }]));
  toast.info('Sumado a la lista de pedido', `${p.nombre}: ${cantidad} ${p.unidad} · las órdenes se generan desde Compras → Lista de pedido.`);
}

export default function ProductosPage() {
  const [params] = useSearchParams();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const inicial = useCantidadInicial();
  const [vista, setVista] = useState<Vista>('todas');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [proveedor, setProveedor] = useState('todos');
  const [editando, setEditando] = useState<Producto | null | undefined>(undefined);
  const [masiva, setMasiva] = useState(false);

  const familias = useMemo(() => {
    const m = new Map<string, Producto[]>();
    for (const p of datos.productos) m.set(p.familia, [...(m.get(p.familia) ?? []), p]);
    return m;
  }, [datos.productos]);

  const visibles = datos.productos
    .filter((p) => vista === 'todas' || p.categoria === vista)
    .filter((p) => proveedor === 'todos' || p.proveedorId === proveedor)
    .filter((p) => !q.trim() || normalizar(`${p.codigo} ${p.nombre} ${p.sinonimos.join(' ')} ${p.familia}`).includes(normalizar(q.trim())));

  const margenProm = datos.productos.reduce((a, p) => a + margenPct(p), 0) / datos.productos.length;
  const bajos = datos.productos.filter((p) => margenPct(p) < 30);
  const valor = datos.productos.reduce((a, p) => a + Math.max(0, p.stock) * p.costo, 0);

  const exportar = () => {
    descargarCSV('lista-de-precios', ['Código', 'Producto', 'Categoría', 'Línea', 'Color', 'Medida', 'Unidad', 'Proveedor', 'Costo', 'Precio de lista', 'Margen %', 'Stock'],
      visibles.map((p) => [p.codigo, p.nombre, CATEGORIA[p.categoria], p.atributos.linea ?? '', p.atributos.color ?? '', p.atributos.medida ?? '', p.unidad, datos.proveedores.find((x) => x.id === p.proveedorId)?.razonSocial, pesos(p.costo), pesos(p.precioLista), Math.round(margenPct(p) * 10) / 10, p.stock]));
    toast.info('Lista de precios descargada', `${visibles.length} productos en CSV, lista para mandar o imprimir.`);
  };

  return (
    <Page title="Productos y precios" overline="Catálogo">
      <PageActions overline={`${datos.productos.length} productos · ${familias.size} modelos`}>
        <Button variant="tertiary" icon="download" onClick={exportar}>Exportar lista</Button>
        <Button variant="secondary" icon="percent" onClick={() => setMasiva(true)}>Actualizar precios</Button>
        <Button icon="plus" onClick={() => setEditando(null)}>Nuevo producto</Button>
      </PageActions>

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Productos activos" value={datos.productos.filter((p) => p.activo).length} icon="tag" trend="flat" delta={`${Object.keys(CATEGORIA).length} categorías`} deltaLabel={`${datos.proveedores.length} proveedores`} />
        <KpiCard label="Margen promedio" value={formatPct(margenProm, 1)} icon="percent" trend="flat" delta="Sobre precio de lista" deltaLabel="sin descuentos de lista" />
        <KpiCard label="Margen bajo el 30 %" value={bajos.length} icon="alert-triangle" trend="flat" delta="Para revisar" deltaLabel="candidatos a subir precio" />
        <KpiCard label="Valor del stock" value={formatARS(valor, { sinCentavos: true })} icon="boxes" trend="flat" delta="Al costo" deltaLabel="sin IVA" />
      </section>

      <div className="flex min-w-0 flex-col gap-3">
          <Tabs<Vista> label="Categorías" value={vista} onChange={setVista} tabs={[{ id: 'todas', label: 'Todas', count: datos.productos.length }, ...(Object.keys(CATEGORIA) as Categoria[]).map((k) => ({ id: k, label: CATEGORIA[k].split(' ')[0], count: datos.productos.filter((p) => p.categoria === k).length }))]} />
          <div className="grid gap-3 sm:grid-cols-[1fr_280px]">
            <SearchInput label="Buscar producto" hideLabel placeholder="Código, nombre o cómo lo piden" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select label="Proveedor" hideLabel value={proveedor} onChange={(e) => setProveedor(e.target.value)} options={[{ value: 'todos', label: 'Todos los proveedores' }, ...datos.proveedores.map((p) => ({ value: p.id, label: p.razonSocial }))]} />
          </div>
          <DataTable
            overline="Catálogo"
            title="Lista de precios"
            caption="Productos con costo, precio, margen y stock"
            rows={visibles}
            rowKey={(p) => p.id}
            rowLabel={(p) => p.codigo}
            pageSize={15}
            columns={[
              {
                key: 'p', label: 'Producto', render: (p) => {
                  const otras = (familias.get(p.familia) ?? []).filter((x) => x.id !== p.id);
                  return (
                    <span>
                      <button type="button" className="text-left font-semibold hover:text-bold-red" onClick={() => setEditando(p)}>{p.nombre}</button>
                      <span className="dl-sub">{p.codigo}{p.atributos.linea ? ` · ${p.atributos.linea}` : ''}</span>
                      {otras.length > 0 && <button type="button" className="mt-1 text-caption font-semibold text-bold-red hover:underline" onClick={() => setQ(p.familia)}>+{otras.length} {otras.length === 1 ? 'variante' : 'variantes'}</button>}
                    </span>
                  );
                },
              },
              { key: 'c', label: 'Costo', align: 'right', render: (p) => formatARS(p.costo) },
              { key: 'l', label: 'Precio lista', align: 'right', render: (p) => <strong>{formatARS(p.precioLista)}</strong> },
              { key: 'm', label: 'Margen', align: 'right', render: (p) => { const m = margenPct(p); return m < 30 ? <Badge tone="warning" icon="alert-triangle">{formatPct(m, 0)}</Badge> : <span className="tabular">{formatPct(m, 0)}</span>; } },
              { key: 's', label: 'Stock', align: 'right', render: (p) => { const e = estadoStock(p); const r = der.reservado.get(p.id) ?? 0; return <span className={e === 'sin_stock' ? 'font-semibold text-error' : e === 'bajo' ? 'font-semibold text-advertencia-texto' : ''}>{p.stock} {p.unidad}{r ? <span className="dl-sub">{r} reservadas</span> : null}</span>; } },
            ]}
            rowActions={(p) => [
              { label: 'Editar', icon: 'pencil', onClick: () => setEditando(p) },
              { label: 'Ver stock y movimientos', icon: 'boxes', to: `/stock?q=${encodeURIComponent(p.codigo)}` },
              { label: 'Agregar a la lista de pedido', icon: 'cart', onClick: () => sumarALista(p, inicial(p)) },
            ]}
            emptyIcon="tag"
            emptyTitle="No encontramos productos"
            emptyText="Probá con el código o con otra categoría."
            emptyAction={<Button variant="secondary" onClick={() => { setQ(''); setVista('todas'); setProveedor('todos'); }}>Ver todo el catálogo</Button>}
          />
          {bajos.length > 0 && <p className="m-0 text-caption text-texto-secundario">Margen bajo el 30 % en amarillo: candidatos para revisar el precio de lista. <Link className="dl-link" to="/reportes">Ver margen por producto en Reportes</Link></p>}
      </div>

      <ActualizacionMasiva open={masiva} onClose={() => setMasiva(false)} />

      <EditarProducto producto={editando ?? null} open={editando !== undefined} onClose={() => setEditando(undefined)} />
    </Page>
  );
}
