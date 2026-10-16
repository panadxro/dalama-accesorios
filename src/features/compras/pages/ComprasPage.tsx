import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Alert, Badge, Button, Card, ConfirmModal, Icon, KpiCard, SectionTitle, Select, Sheet, TextInput, toast } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { estadoStock } from '@/domain/calculos';
import type { OrdenCompra } from '@/domain/types';
import { cn } from '@/lib/cn';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatFecha } from '@/lib/format';
import { crearOrdenCompra, ejecutar, recibirOrden } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';

const totalOC = (o: OrdenCompra) => o.renglones.reduce((a, r) => a + r.cantidad * r.costo, 0);

/** Órdenes sugeridas: lo que está bajo el mínimo, para reponer hasta N veces el mínimo. */
function Sugeridas() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const veces = datos.ajustes.reponerHastaVecesMinimo;

  // Lo que ya está pedido en órdenes enviadas no se vuelve a sugerir.
  const enCamino = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of datos.ordenesCompra) if (o.estado === 'enviada') for (const r of o.renglones) m.set(r.productoId, (m.get(r.productoId) ?? 0) + r.cantidad);
    return m;
  }, [datos.ordenesCompra]);

  const sugeridos = datos.productos
    .filter((p) => p.activo && estadoStock(p) !== 'ok')
    .map((p) => {
      const necesario = p.stockMinimo * veces + (der.reservado.get(p.id) ?? 0) - p.stock - (enCamino.get(p.id) ?? 0);
      return { p, cantidad: Math.max(0, Math.ceil(necesario / 5) * 5) };
    })
    .filter((x) => x.cantidad > 0);

  const proveedores = [...new Set(sugeridos.map((x) => x.p.proveedorId))];
  const [prov, setProv] = useState(proveedores[0] ?? '');
  const [cant, setCant] = useState<Record<string, number>>({});
  const [incluir, setIncluir] = useState<Record<string, boolean>>({});
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    if (!proveedores.includes(prov) && proveedores[0]) setProv(proveedores[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedores.join()]);

  const delProv = sugeridos.filter((x) => x.p.proveedorId === prov);
  const lineas = delProv.filter((x) => incluir[x.p.id] !== false).map((x) => ({ p: x.p, cantidad: cant[x.p.id] ?? x.cantidad })).filter((x) => x.cantidad > 0);
  const total = lineas.reduce((a, x) => a + x.cantidad * x.p.costo, 0);
  const proveedor = datos.proveedores.find((p) => p.id === prov);

  if (!sugeridos.length) {
    return (
      <Card className="p-0" aria-label="Órdenes sugeridas">
        <EmptyState icon="check-circle" title="No hay nada para reponer" text="Todo el stock está sobre el mínimo o ya está pedido en una orden en camino." />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-0" aria-label="Órdenes sugeridas">
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6">
        <div>
          <div className="dl-overline">Según stock mínimo</div>
          <h2 className="dl-card-title">Órdenes sugeridas</h2>
          <span className="dl-brandline" aria-hidden="true" />
          <p className="m-0 mt-2 text-body-small text-texto-secundario">Se sugiere reponer hasta {veces === 2 ? 'el doble' : `${veces} veces`} del mínimo, sumando lo reservado y restando lo que ya viene en camino. Destildá lo que no quieras pedir.</p>
        </div>
        <Select label="Proveedor" hideLabel value={prov} onChange={(e) => setProv(e.target.value)} className="w-full sm:w-[280px]" options={proveedores.map((id) => ({ value: id, label: `${datos.proveedores.find((p) => p.id === id)?.razonSocial} (${sugeridos.filter((x) => x.p.proveedorId === id).length})` }))} />
      </div>
      <div className="dl-table-scroll">
        <table className="dl-table">
          <thead><tr><th scope="col"><span className="sr-only">Incluir</span></th><th scope="col">Producto</th><th scope="col" className="is-right">Stock / mín.</th><th scope="col" style={{ textAlign: 'center' }}>Pedir</th><th scope="col" className="is-right">Costo</th><th scope="col" className="is-right">Subtotal</th></tr></thead>
          <tbody>
            {delProv.map(({ p, cantidad }) => {
              const on = incluir[p.id] !== false;
              const q = cant[p.id] ?? cantidad;
              return (
                <tr key={p.id} className={cn(!on && 'opacity-60')}>
                  <td style={{ width: 48 }}><input type="checkbox" checked={on} onChange={(e) => setIncluir((s) => ({ ...s, [p.id]: e.target.checked }))} aria-label={`Incluir ${p.nombre}`} className="h-5 w-5 accent-[#111111]" /></td>
                  <td><strong>{p.nombre}</strong><span className="dl-sub">{p.codigo}{enCamino.get(p.id) ? ` · ${enCamino.get(p.id)} en camino` : ''}</span></td>
                  <td className="is-right"><span className={p.stock <= 0 ? 'font-semibold text-error' : 'font-semibold text-advertencia-texto'}>{p.stock}</span> / {p.stockMinimo}</td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Restar 5 a ${p.nombre}`} disabled={!on || q <= 5} onClick={() => setCant((c) => ({ ...c, [p.id]: Math.max(5, q - 5) }))}><Icon name="minus" size={16} /></button>
                      <span className="w-12 text-center font-bold tabular">{q}</span>
                      <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Sumar 5 a ${p.nombre}`} disabled={!on} onClick={() => setCant((c) => ({ ...c, [p.id]: q + 5 }))}><Icon name="plus" size={16} /></button>
                    </div>
                  </td>
                  <td className="is-right">{formatARS(p.costo)}</td>
                  <td className="is-right font-bold">{on ? formatARS(q * p.costo) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-md border-t border-borde bg-arena-50 px-6 py-4">
        <span className="text-body">{lineas.length} productos · <strong className="tabular">{formatARS(total)}</strong> + IVA</span>
        <Button icon="send" disabled={!lineas.length} onClick={() => setConfirmar(true)}>Generar OC y enviar</Button>
      </div>
      <ConfirmModal
        open={confirmar}
        title={`¿Enviar la orden a ${proveedor?.razonSocial}?`}
        confirmLabel="Generar y enviar"
        onCancel={() => setConfirmar(false)}
        onConfirm={() => {
          setConfirmar(false);
          const oc = ejecutar((d) => crearOrdenCompra(d, prov, lineas.map((x) => ({ productoId: x.p.id, cantidad: x.cantidad }))));
          setCant({});
          setIncluir({});
          toast.success(`${oc.numero} enviada`, `${proveedor?.razonSocial} la recibió por WhatsApp y email (simulado). Llega aprox. el ${formatFecha(oc.llegaEl)}; cuando llegue, registrá la recepción para sumar al stock.`);
        }}
      >
        Se genera la orden de compra {`OC-${String(datos.secuencias.ordenCompra).padStart(4, '0')}`} por {formatARS(total)} + IVA ({lineas.length} productos) y se envía al proveedor.
      </ConfirmModal>
    </Card>
  );
}

function Recepcion({ oc, onClose }: { oc: OrdenCompra; onClose: () => void }) {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const prov = datos.proveedores.find((p) => p.id === oc.proveedorId)!;
  const [rec, setRec] = useState<Record<string, number>>(Object.fromEntries(oc.renglones.map((r) => [r.productoId, r.cantidad])));
  const [remito, setRemito] = useState('');
  const faltan = oc.renglones.filter((r) => (rec[r.productoId] ?? 0) < r.cantidad).length;
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      overline={prov.razonSocial}
      title={`Recepción · ${oc.numero}`}
      description="Controlá lo que llegó contra la orden. Lo recibido se suma al stock."
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button icon="check" disabled={remito.trim().length < 3} onClick={() => {
          const r = ejecutar((d) => recibirOrden(d, oc.id, rec, remito.trim()));
          onClose();
          toast.success(`${oc.numero} recibida`, `Se sumaron ${r.unidades} unidades al stock${r.reponen.length ? ` y ${r.reponen.length} ${r.reponen.length === 1 ? 'producto salió' : 'productos salieron'} de la alerta de stock bajo` : ''}. Los movimientos quedan como “ingreso”.`);
        }}>Confirmar recepción y sumar al stock</Button>
      </>}
    >
      <div className="flex flex-col gap-4">
        <TextInput label="Remito del proveedor" required value={remito} onChange={(e) => setRemito(e.target.value)} placeholder="R 0004-00018872" helper="Se guarda para el control con la factura del proveedor." />
        <ul className="m-0 flex list-none flex-col p-0">
          {oc.renglones.map((r) => {
            const p = der.productoPorId.get(r.productoId)!;
            const q = rec[r.productoId] ?? 0;
            return (
              <li key={r.productoId} className="flex items-center gap-3 border-b border-arena-100 py-3">
                <span className="min-w-0 flex-1"><span className="block font-semibold">{p.nombre}</span><span className="block text-caption text-texto-secundario">{p.codigo} · pedido {r.cantidad} {p.unidad}</span></span>
                <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Restar uno a ${p.nombre}`} disabled={q <= 0} onClick={() => setRec((s) => ({ ...s, [r.productoId]: q - 1 }))}><Icon name="minus" size={16} /></button>
                <span className={cn('w-10 text-center font-bold tabular', q < r.cantidad && 'text-advertencia-texto')}>{q}</span>
                <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Sumar uno a ${p.nombre}`} onClick={() => setRec((s) => ({ ...s, [r.productoId]: q + 1 }))}><Icon name="plus" size={16} /></button>
              </li>
            );
          })}
        </ul>
        {faltan > 0 && <Alert tone="warning" title={`${faltan} ${faltan === 1 ? 'producto llegó' : 'productos llegaron'} incompletos`}>Se recibe lo que llegó. La diferencia queda registrada en la orden para reclamarla.</Alert>}
      </div>
    </Sheet>
  );
}

export default function ComprasPage() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [recibiendo, setRecibiendo] = useState<OrdenCompra | null>(null);
  const enCurso = datos.ordenesCompra.filter((o) => o.estado === 'enviada').sort((a, b) => a.llegaEl.localeCompare(b.llegaEl));
  const recientes = datos.ordenesCompra.filter((o) => o.estado === 'recibida').slice(0, 3);
  const comprasMes = datos.ordenesCompra.filter((o) => diasEntre(o.fecha, der.hoy) <= 30).reduce((a, o) => a + totalOC(o), 0);

  const llega = (o: OrdenCompra) => {
    const d = diasEntre(der.hoy, o.llegaEl);
    if (d < 0) return { txt: `Atrasada ${-d} ${d === -1 ? 'día' : 'días'}`, tone: 'error' as const };
    if (d === 0) return { txt: 'Llega hoy', tone: 'warning' as const };
    if (d === 1) return { txt: 'Llega mañana', tone: 'info' as const };
    return { txt: `Llega el ${formatFecha(o.llegaEl).slice(0, 5)}`, tone: 'neutral' as const };
  };

  return (
    <Page title="Compras y proveedores" overline="Catálogo">
      <PageActions overline="Reposición del depósito" />

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Órdenes en camino" value={enCurso.length} icon="truck" trend="flat" delta={formatARS(enCurso.reduce((a, o) => a + totalOC(o), 0), { sinCentavos: true })} deltaLabel="+ IVA" />
        <KpiCard label="Para reponer" value={der.stockBajo.length} icon="alert-triangle" trend="flat" delta={`${der.stockBajo.filter((p) => p.stock <= 0).length} sin stock`} deltaLabel="bajo el mínimo" />
        <KpiCard label="Compras últimos 30 días" value={formatARS(comprasMes, { sinCentavos: true })} icon="cart" trend="flat" delta={`${datos.ordenesCompra.filter((o) => diasEntre(o.fecha, der.hoy) <= 30).length} órdenes`} deltaLabel="al costo, sin IVA" />
        <KpiCard label="Proveedores" value={datos.proveedores.length} icon="building" trend="flat" delta="Activos" deltaLabel="con lista vigente" />
      </section>

      <div className="flex flex-col gap-3">
        <div><div className="dl-overline">Órdenes en curso</div><span className="dl-brandline" aria-hidden="true" /></div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {[...enCurso, ...recientes].map((o) => {
            const prov = datos.proveedores.find((p) => p.id === o.proveedorId)!;
            const l = llega(o);
            return (
              <Card key={o.id} className={cn('flex flex-col gap-3', o.estado === 'enviada' && diasEntre(der.hoy, o.llegaEl) <= 0 && 'border-2 border-ink-black')}>
                <div className="flex items-center justify-between gap-2"><strong className="tabular">{o.numero}</strong>{o.estado === 'recibida' ? <Badge tone="success" icon="check">Recibida</Badge> : <Badge tone={l.tone} icon="clock">{l.txt}</Badge>}</div>
                <div><div className="font-semibold">{prov.razonSocial}</div><div className="text-body-small text-texto-secundario">{o.estado === 'recibida' ? `Recibida el ${formatFecha(o.recibidaEl!)} · stock actualizado` : `Enviada el ${formatFecha(o.fecha).slice(0, 5)} · ${formatARS(totalOC(o))} + IVA`}</div></div>
                <div className="text-caption text-texto-secundario">{o.renglones.length} productos · {o.renglones.reduce((a, r) => a + r.cantidad, 0)} unidades</div>
                {o.estado === 'enviada' && <Button variant={diasEntre(der.hoy, o.llegaEl) <= 0 ? 'primary' : 'secondary'} size="s" icon="package-check" onClick={() => setRecibiendo(o)}>Registrar recepción</Button>}
              </Card>
            );
          })}
        </div>
      </div>

      <Sugeridas />

      <Card aria-label="Proveedores">
        <SectionTitle overline={`${datos.proveedores.length} activos`} title="Proveedores" />
        <ul className="m-0 mt-3 grid list-none gap-x-6 p-0 md:grid-cols-2">
          {datos.proveedores.map((p) => {
            const productos = datos.productos.filter((x) => x.proveedorId === p.id);
            const bajos = productos.filter((x) => estadoStock(x) !== 'ok').length;
            return (
              <li key={p.id} className="flex items-start gap-3 border-b border-arena-100 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-arena-100 text-neutro-700"><Icon name="building" size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{p.razonSocial}</span>
                  <span className="block text-caption text-texto-secundario">{p.rubro} · entrega en {p.plazoEntregaDias} días</span>
                  <span className="block text-caption text-texto-secundario">{p.contacto} · {p.telefono}</span>
                </span>
                <span className="text-right text-caption"><Link className="dl-link" to={`/productos`}>{productos.length} productos</Link>{bajos > 0 && <span className="block font-semibold text-advertencia-texto">{bajos} para reponer</span>}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      {recibiendo && <Recepcion oc={recibiendo} onClose={() => setRecibiendo(null)} />}
    </Page>
  );
}
