import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, Card, ConfirmModal, Icon, IconButton, Select, Textarea, toast } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { BuscadorProducto } from '@/components/negocio/BuscadorProducto';
import { estadoStock } from '@/domain/calculos';
import type { Producto, Proveedor } from '@/domain/types';
import { cn } from '@/lib/cn';
import { descargarCSV, pesos } from '@/lib/csv';
import { sumarDias } from '@/lib/fechas';
import { formatARS, formatFecha } from '@/lib/format';
import { agregarALista, cambiarCantidadLista, ejecutar, generarOrdenesDeLista, vaciarLista } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { useCantidadInicial, useSugerencias } from '../sugerencias';

interface Grupo {
  prov: Proveedor;
  items: Array<{ p: Producto; cantidad: number }>;
  total: number;
}

const numeroOC = (n: number) => `OC-${String(n).padStart(4, '0')}`;

/** Cantidad editable: escribir el número o usar − / +. Con 0 se quita de la lista. */
function Cantidad({ p, cantidad }: { p: Producto; cantidad: number }) {
  const set = (q: number) => ejecutar((d) => cambiarCantidadLista(d, p.id, Math.max(0, Math.round(q))));
  return (
    <div className="flex items-center justify-center gap-1">
      <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Restar uno a ${p.nombre}`} disabled={cantidad <= 1} onClick={() => set(cantidad - 1)}><Icon name="minus" size={16} /></button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={cantidad}
        onChange={(e) => { const q = Number(e.target.value); if (Number.isFinite(q) && q >= 1) set(q); }}
        aria-label={`Cantidad de ${p.nombre}`}
        className="h-9 w-16 rounded-sm border border-neutro-500 bg-superficie text-center font-bold tabular outline-none focus-visible:border-ink-black focus-visible:ring-2 focus-visible:ring-foco"
      />
      <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Sumar uno a ${p.nombre}`} onClick={() => set(cantidad + 1)}><Icon name="plus" size={16} /></button>
    </div>
  );
}

/**
 * Lista de pedido a proveedores: se arma con cualquier producto del catálogo y cualquier cantidad,
 * queda agrupada por proveedor y de cada grupo sale una orden de compra.
 */
export default function ListaPedidoPage() {
  const navigate = useNavigate();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const { sugeridos, enCamino } = useSugerencias();
  const inicial = useCantidadInicial();
  const [filtroProv, setFiltroProv] = useState('todos');
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [confirmar, setConfirmar] = useState<string[] | null>(null);
  const [vaciar, setVaciar] = useState(false);

  const enLista = new Set(datos.listaCompra.map((x) => x.productoId));
  const pendientesSugeridos = sugeridos.filter((x) => !enLista.has(x.p.id));

  const grupos = useMemo<Grupo[]>(() => {
    const m = new Map<string, Grupo>();
    for (const it of datos.listaCompra) {
      const p = der.productoPorId.get(it.productoId);
      if (!p) continue;
      const prov = datos.proveedores.find((x) => x.id === p.proveedorId)!;
      const g = m.get(prov.id) ?? { prov, items: [], total: 0 };
      g.items.push({ p, cantidad: it.cantidad });
      g.total += it.cantidad * p.costo;
      m.set(prov.id, g);
    }
    return [...m.values()].sort((a, b) => a.prov.razonSocial.localeCompare(b.prov.razonSocial));
  }, [datos.listaCompra, datos.proveedores, der]);

  const total = grupos.reduce((a, g) => a + g.total, 0);
  const unidades = datos.listaCompra.reduce((a, x) => a + x.cantidad, 0);
  const catalogo = filtroProv === 'todos' ? datos.productos : datos.productos.filter((p) => p.proveedorId === filtroProv);

  const sumar = (p: Producto) => {
    const q = inicial(p);
    ejecutar((d) => agregarALista(d, [{ productoId: p.id, cantidad: q }]));
    toast.info(enLista.has(p.id) ? 'Cantidad actualizada' : 'Sumado a la lista', `${p.nombre}: ${enLista.has(p.id) ? `se sumaron ${q} ${p.unidad} más` : `${q} ${p.unidad}`} · va en la orden de ${datos.proveedores.find((x) => x.id === p.proveedorId)?.razonSocial}.`);
  };

  const sumarSugerido = () => {
    const r = ejecutar((d) => agregarALista(d, pendientesSugeridos.map((x) => ({ productoId: x.p.id, cantidad: x.cantidad }))));
    toast.info(`${r.nuevos} ${r.nuevos === 1 ? 'producto sumado' : 'productos sumados'}`, 'Todo lo que está bajo el mínimo y no viene en camino, con la cantidad sugerida. Podés cambiar las cantidades o quitar lo que no quieras.');
  };

  const exportar = () => {
    descargarCSV(
      'lista-de-pedido-dalama',
      ['Proveedor', 'Código', 'Producto', 'Cantidad', 'Unidad', 'Costo unitario', 'Subtotal'],
      grupos.flatMap((g) => g.items.map(({ p, cantidad }) => [g.prov.razonSocial, p.codigo, p.nombre, cantidad, p.unidad, pesos(p.costo), pesos(p.costo * cantidad)])),
    );
    toast.info('Lista descargada', `${datos.listaCompra.length} ${datos.listaCompra.length === 1 ? 'producto' : 'productos'} de ${grupos.length} ${grupos.length === 1 ? 'proveedor' : 'proveedores'}, en CSV.`);
  };

  const generar = (ids: string[]) => {
    const ordenes = ejecutar((d) => generarOrdenesDeLista(d, ids, notas));
    setNotas((n) => Object.fromEntries(Object.entries(n).filter(([k]) => !ids.includes(k))));
    const nombres = ordenes.map((o) => o.numero).join(', ');
    toast.success(
      ordenes.length === 1 ? `${nombres} enviada` : `${ordenes.length} órdenes enviadas`,
      `${ordenes.length === 1 ? 'El proveedor la recibió' : `${nombres}: cada proveedor recibió la suya`} por WhatsApp y email (simulado). Lo pedido salió de la lista y figura “en camino” en Compras.`,
    );
    if (ids.length === grupos.length) navigate('/compras');
  };

  const aConfirmar = confirmar ? grupos.filter((g) => confirmar.includes(g.prov.id)) : [];

  return (
    <Page title="Lista de pedido" overline="Catálogo · Compras">
      <PageActions overline="Pedido a proveedores">
        <ButtonLink to="/compras" variant="tertiary" icon="arrow-left">Volver a Compras</ButtonLink>
        {datos.listaCompra.length > 0 && <Button variant="tertiary" icon="download" onClick={exportar}>Descargar lista</Button>}
        {datos.listaCompra.length > 0 && <Button variant="tertiary" icon="trash" onClick={() => setVaciar(true)}>Vaciar</Button>}
      </PageActions>

      <Card className="flex flex-col gap-4" aria-label="Agregar productos">
        <div>
          <div className="dl-overline">Cualquier producto, cualquier cantidad</div>
          <h2 className="dl-card-title">Sumar a la lista</h2>
          <span className="dl-brandline" aria-hidden="true" />
          <p className="m-0 mt-2 text-body-small text-texto-secundario">Buscá en el catálogo o elegí un proveedor para ver solo lo suyo. Cada producto va a la orden de su proveedor; si ya está en la lista, se suma a la cantidad.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <Select label="Proveedor" value={filtroProv} onChange={(e) => setFiltroProv(e.target.value)} options={[{ value: 'todos', label: 'Todos los proveedores' }, ...datos.proveedores.map((p) => ({ value: p.id, label: p.razonSocial }))]} />
          <BuscadorProducto productos={catalogo} onElegir={sumar} reservado={der.reservado} label="Producto" />
        </div>
        {pendientesSugeridos.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-arena-100 px-4 py-3">
            <span className="flex items-center gap-2 text-body-small"><Icon name="alert-triangle" size={16} className="text-advertencia-texto" />{pendientesSugeridos.length} {pendientesSugeridos.length === 1 ? 'producto está' : 'productos están'} bajo el mínimo y no {pendientesSugeridos.length === 1 ? 'está' : 'están'} en la lista.</span>
            <Button variant="secondary" size="s" icon="plus" onClick={sumarSugerido}>Sumar lo sugerido</Button>
          </div>
        )}
      </Card>

      {grupos.length === 0 ? (
        <Card className="p-0" aria-label="Lista vacía">
          <EmptyState icon="clipboard" title="La lista está vacía" text="Sumá productos con el buscador de arriba o traé lo sugerido según el stock mínimo. La lista se guarda mientras la armás." />
        </Card>
      ) : (
        <>
          {grupos.map((g) => (
            <Card key={g.prov.id} className="flex flex-col gap-0 p-0" aria-label={`Pedido a ${g.prov.razonSocial}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-arena-100 text-neutro-700"><Icon name="building" size={20} /></span>
                  <div>
                    <h2 className="dl-card-title">{g.prov.razonSocial}</h2>
                    <div className="text-caption text-texto-secundario">{g.prov.contacto} · {g.prov.telefono} · entrega en {g.prov.plazoEntregaDias} días (aprox. el {formatFecha(sumarDias(der.hoy, g.prov.plazoEntregaDias)).slice(0, 5)})</div>
                  </div>
                </div>
                <Button variant="tertiary" size="s" icon="trash" onClick={() => ejecutar((d) => vaciarLista(d, g.prov.id))}>Quitar proveedor</Button>
              </div>
              <div className="dl-table-scroll">
                <table className="dl-table" style={{ minWidth: 680 }}>
                  <caption className="sr-only">Productos a pedir a {g.prov.razonSocial}</caption>
                  <thead><tr><th scope="col">Producto</th><th scope="col" className="is-right">Stock / mín.</th><th scope="col" style={{ textAlign: 'center' }}>Pedir</th><th scope="col" className="is-right">Costo</th><th scope="col" className="is-right">Subtotal</th><th scope="col"><span className="sr-only">Quitar</span></th></tr></thead>
                  <tbody>
                    {g.items.map(({ p, cantidad }) => {
                      const e = estadoStock(p);
                      const camino = enCamino.get(p.id);
                      return (
                        <tr key={p.id}>
                          <td className="min-w-[220px]"><strong>{p.nombre}</strong><span className="dl-sub">{p.codigo}{camino ? ` · ${camino} en camino` : ''}</span></td>
                          <td className="is-right"><span className={cn('font-semibold', e === 'sin_stock' && 'text-error', e === 'bajo' && 'text-advertencia-texto')}>{p.stock}</span> / {p.stockMinimo} <span className="text-texto-secundario">{p.unidad}</span></td>
                          <td><Cantidad p={p} cantidad={cantidad} /></td>
                          <td className="is-right">{formatARS(p.costo)}</td>
                          <td className="is-right font-bold">{formatARS(cantidad * p.costo)}</td>
                          <td style={{ width: 56 }}><IconButton icon="x" label={`Quitar ${p.nombre} de la lista`} onClick={() => ejecutar((d) => cambiarCantidadLista(d, p.id, 0))} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-4 rounded-b-md border-t border-borde bg-arena-50 px-6 py-4 md:grid-cols-[1fr_auto] md:items-end">
                <Textarea label="Nota para el proveedor" rows={2} value={notas[g.prov.id] ?? ''} onChange={(e) => setNotas((n) => ({ ...n, [g.prov.id]: e.target.value }))} placeholder="Ej.: las bisagras en color negro, entregar por la mañana" helper="Opcional. Viaja con la orden de compra." />
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <span className="text-body">{g.items.length} {g.items.length === 1 ? 'producto' : 'productos'} · <strong className="tabular">{formatARS(g.total)}</strong> + IVA</span>
                  <Button variant="secondary" icon="send" onClick={() => setConfirmar([g.prov.id])}>Generar solo esta orden</Button>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-borde bg-superficie px-4 py-4 shadow-2 lg:sticky lg:bottom-0 lg:z-10 lg:-mx-8 lg:rounded-none lg:border-x-0 lg:border-b-0 lg:px-8">
            <span className="text-body">
              {datos.listaCompra.length} {datos.listaCompra.length === 1 ? 'producto' : 'productos'} · {unidades} {unidades === 1 ? 'unidad' : 'unidades'} · {grupos.length} {grupos.length === 1 ? 'proveedor' : 'proveedores'} · <strong className="tabular">{formatARS(total)}</strong> + IVA
            </span>
            <Button icon="send" onClick={() => setConfirmar(grupos.map((g) => g.prov.id))}>
              {grupos.length === 1 ? 'Generar la orden y enviar' : `Generar ${grupos.length} órdenes y enviar`}
            </Button>
          </div>
        </>
      )}

      <ConfirmModal
        open={!!confirmar}
        title={aConfirmar.length === 1 ? `¿Enviar la orden a ${aConfirmar[0]?.prov.razonSocial}?` : `¿Enviar ${aConfirmar.length} órdenes de compra?`}
        confirmLabel={aConfirmar.length === 1 ? 'Generar y enviar' : 'Generar y enviar todas'}
        onCancel={() => setConfirmar(null)}
        onConfirm={() => { const ids = confirmar ?? []; setConfirmar(null); generar(ids); }}
      >
        <span className="block">Se genera una orden por proveedor y se envía (simulado). Lo pedido sale de la lista.</span>
        <ul className="m-0 mt-2 list-none p-0">
          {aConfirmar.map((g, i) => (
            <li key={g.prov.id} className="flex items-baseline justify-between gap-4 py-0.5">
              <span className="min-w-0"><span className="tabular">{numeroOC(datos.secuencias.ordenCompra + i)}</span> · {g.prov.razonSocial}{notas[g.prov.id]?.trim() ? <Badge tone="info" className="ml-2">Con nota</Badge> : null}</span>
              <strong className="shrink-0 whitespace-nowrap tabular">{formatARS(g.total)}</strong>
            </li>
          ))}
        </ul>
      </ConfirmModal>

      <ConfirmModal
        open={vaciar}
        destructive
        title="¿Vaciar la lista de pedido?"
        confirmLabel="Vaciar lista"
        onCancel={() => setVaciar(false)}
        onConfirm={() => { setVaciar(false); ejecutar((d) => vaciarLista(d)); toast.info('Lista vacía', 'No se generó ninguna orden. Podés volver a armarla cuando quieras.'); }}
      >
        Se quitan los {datos.listaCompra.length} productos. No se envía nada a los proveedores.
      </ConfirmModal>
    </Page>
  );
}
