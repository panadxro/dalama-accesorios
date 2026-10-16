import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, Card, DataTable, Icon, KpiCard, MoneyInput, SectionTitle, Select, Sheet, StatusBadge, Tabs, TextInput, Textarea, toast } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { Avatar, DatosLista } from '@/components/negocio/Datos';
import { CobroBadge, PedidoBadge, PresupuestoBadge } from '@/components/negocio/Estados';
import { CONDICION_IVA, CONDICION_IVA_CORTA, TIPO_CLIENTE, codigoComprobante, estadoPresupuesto, totales } from '@/domain/calculos';
import type { Cliente, CondicionIVA, TipoCliente } from '@/domain/types';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatCUIT, formatFecha } from '@/lib/format';
import { actualizarCliente, crearPresupuesto, ejecutar } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';

type Vista = 'presupuestos' | 'pedidos' | 'facturas' | 'productos';

function EditarCliente({ cliente, open, onClose }: { cliente: Cliente; open: boolean; onClose: () => void }) {
  const listas = useDemo((s) => s.datos.listas);
  const [c, setC] = useState(cliente);
  const set = (x: Partial<Cliente>) => setC((v) => ({ ...v, ...x }));
  useEffect(() => { if (open) setC(cliente); }, [open, cliente]);
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      overline="Clientes"
      title="Editar datos"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button icon="check" onClick={() => { ejecutar((d) => actualizarCliente(d, c)); onClose(); toast.success('Datos del cliente guardados', c.listaId !== cliente.listaId ? 'La nueva lista de precios se aplica en los próximos presupuestos.' : 'Se usan en los próximos presupuestos y facturas.'); }}>Guardar cambios</Button>
      </>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput className="sm:col-span-2" label="Razón social" value={c.razonSocial} onChange={(e) => set({ razonSocial: e.target.value })} />
        <TextInput label="Contacto" value={c.contacto} onChange={(e) => set({ contacto: e.target.value })} />
        <TextInput label="Teléfono (WhatsApp)" value={c.telefono} onChange={(e) => set({ telefono: e.target.value })} />
        <TextInput className="sm:col-span-2" label="Email" type="email" value={c.email} onChange={(e) => set({ email: e.target.value })} />
        <Select label="Tipo de cliente" value={c.tipo} onChange={(e) => set({ tipo: e.target.value as TipoCliente })} options={(Object.keys(TIPO_CLIENTE) as TipoCliente[]).map((k) => ({ value: k, label: TIPO_CLIENTE[k] }))} />
        <Select label="Condición frente al IVA" value={c.condicionIVA} onChange={(e) => set({ condicionIVA: e.target.value as CondicionIVA })} options={(Object.keys(CONDICION_IVA) as CondicionIVA[]).map((k) => ({ value: k, label: CONDICION_IVA[k] }))} />
        <TextInput label="CUIT" value={formatCUIT(c.cuit)} onChange={(e) => set({ cuit: e.target.value.replace(/\D/g, '').slice(0, 11) })} inputMode="numeric" />
        <Select label="Lista de precios" value={c.listaId} onChange={(e) => set({ listaId: e.target.value })} options={listas.map((l) => ({ value: l.id, label: l.descuentoPct ? `${l.nombre} −${l.descuentoPct} %` : l.nombre }))} />
        <TextInput label="Dirección" value={c.direccion} onChange={(e) => set({ direccion: e.target.value })} />
        <TextInput label="Localidad" value={c.localidad} onChange={(e) => set({ localidad: e.target.value })} />
        <Select label="Condición de venta" value={c.condicionVenta} onChange={(e) => set({ condicionVenta: e.target.value as Cliente['condicionVenta'] })} options={[{ value: 'cta_cte_30', label: 'Cuenta corriente 30 días' }, { value: 'contado', label: 'Contado' }]} />
        <MoneyInput label="Límite de crédito" value={c.limiteCredito} onValueChange={(v) => set({ limiteCredito: v ?? 0 })} disabled={c.condicionVenta === 'contado'} />
        <Textarea className="sm:col-span-2" label="Notas internas" value={c.notas ?? ''} onChange={(e) => set({ notas: e.target.value || undefined })} rows={3} placeholder="Horarios, preferencias, a quién facturar…" />
      </div>
    </Sheet>
  );
}

export default function ClienteDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [vista, setVista] = useState<Vista>('presupuestos');
  const [editar, setEditar] = useState(false);
  const cliente = id ? der.clientePorId.get(id) : undefined;

  const info = useMemo(() => {
    if (!cliente) return null;
    const facturas = datos.comprobantes.filter((c) => c.clienteId === cliente.id);
    const recientes = facturas.filter((c) => c.clase === 'factura' && diasEntre(c.fecha, der.hoy) <= 180);
    const compras = recientes.reduce((a, c) => a + c.total, 0);
    const productos = new Map<string, { cant: number; neto: number; veces: number }>();
    for (const f of recientes) for (const r of f.renglones) {
      if (!r.productoId) continue;
      const x = productos.get(r.productoId) ?? { cant: 0, neto: 0, veces: 0 };
      x.cant += r.cantidad; x.neto += Math.round(r.cantidad * r.precioUnitario * (1 - f.descuentoPct / 100)); x.veces += 1;
      productos.set(r.productoId, x);
    }
    return {
      facturas,
      compras,
      ticket: recientes.length ? compras / recientes.length : 0,
      cantidad: recientes.length,
      presupuestos: datos.presupuestos.filter((p) => p.clienteId === cliente.id),
      pedidos: datos.pedidos.filter((p) => p.clienteId === cliente.id),
      top: [...productos].sort((a, b) => b[1].neto - a[1].neto).slice(0, 10).map(([pid, v]) => ({ p: der.productoPorId.get(pid)!, ...v })),
    };
  }, [cliente, datos, der]);

  if (!cliente || !info) {
    return (
      <Page title="Ficha del cliente" overline="Clientes">
        <Card className="p-0"><EmptyState icon="users" title="No encontramos este cliente" action={<ButtonLink to="/clientes" variant="primary">Ver clientes</ButtonLink>} /></Card>
      </Page>
    );
  }

  const cuenta = der.cuentas.get(cliente.id)!;
  const ultima = der.ultimaCompra.get(cliente.id);
  const inactivo = der.inactivos.includes(cliente);
  const lista = datos.listas.find((l) => l.id === cliente.listaId);
  const conv = datos.conversaciones.find((c) => c.clienteId === cliente.id);
  const ultimoMsg = conv?.mensajes[conv.mensajes.length - 1];
  const iva = datos.ajustes.ivaPct;

  const nuevoPresupuesto = () => {
    const p = ejecutar((d) => crearPresupuesto(d, { clienteId: cliente.id, renglones: [], origen: 'manual' }));
    navigate(`/presupuestos/${p.id}`);
  };

  return (
    <Page title={cliente.razonSocial} overline={`Clientes · ${TIPO_CLIENTE[cliente.tipo]}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/clientes" className="dl-link inline-flex items-center gap-1 text-body-small"><Icon name="arrow-left" size={16} />Todos los clientes</Link>
        <div className="flex flex-wrap gap-2">
          <Button variant="tertiary" icon="pencil" onClick={() => setEditar(true)}>Editar datos</Button>
          <ButtonLink to={`/cuentas/${cliente.id}`} variant="secondary" icon="wallet">Cuenta corriente</ButtonLink>
          <Button icon="plus" onClick={nuevoPresupuesto}>Nuevo presupuesto</Button>
        </div>
      </div>

      <Card className="flex flex-wrap items-center gap-4">
        <Avatar nombre={cliente.razonSocial} size={56} oscuro />
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-h2">{cliente.razonSocial}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge>{TIPO_CLIENTE[cliente.tipo]}</Badge>
            <Badge>{`${CONDICION_IVA_CORTA[cliente.condicionIVA]} · CUIT ${formatCUIT(cliente.cuit)}`}</Badge>
            {lista && <Badge>{lista.descuentoPct ? `${lista.nombre} −${lista.descuentoPct} %` : lista.nombre}</Badge>}
            {inactivo ? <Badge icon="clock">Inactivo</Badge> : cuenta.vencido > 0 ? <StatusBadge status="deuda-vencida" /> : <Badge tone="success" icon="check">Al día</Badge>}
          </div>
        </div>
        <span className="text-right text-body-small text-texto-secundario">Cliente desde {formatFecha(cliente.altaEl)}</span>
      </Card>

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Compras 6 meses" value={formatARSKpi(info.compras)} icon="chart" trend="flat" delta={`${info.cantidad} facturas`} deltaLabel="IVA incluido" />
        <KpiCard label="Ticket promedio" value={formatARSKpi(info.ticket)} icon="receipt" trend="flat" delta={TIPO_CLIENTE[cliente.tipo]} deltaLabel="por factura" />
        <KpiCard label="Saldo" value={formatARSKpi(cuenta.saldo)} icon="wallet" trend="flat" delta={cuenta.vencido ? formatARS(cuenta.vencido) : 'Sin vencido'} deltaLabel={cuenta.vencido ? `vencido · ${cuenta.diasMayorAtraso} días` : 'al día'} />
        <KpiCard label="Última compra" value={ultima ? formatFecha(ultima).slice(0, 5) : '—'} icon="clock" trend="flat" delta={ultima ? (diasEntre(ultima, der.hoy) === 0 ? 'Hoy' : diasEntre(ultima, der.hoy) === 1 ? 'Ayer' : `Hace ${diasEntre(ultima, der.hoy)} días`) : 'Todavía no compró'} deltaLabel={inactivo ? 'cliente inactivo' : ''} />
      </section>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-[3_1_620px] flex-col gap-3">
          <Tabs<Vista> label="Historial del cliente" value={vista} onChange={setVista} tabs={[
            { id: 'presupuestos', label: 'Presupuestos', count: info.presupuestos.length },
            { id: 'pedidos', label: 'Pedidos', count: info.pedidos.length },
            { id: 'facturas', label: 'Facturas', count: info.facturas.length },
            { id: 'productos', label: 'Lo que más compra' },
          ]} />
          {vista === 'presupuestos' && (
            <DataTable overline="Historial" title="Presupuestos" rows={info.presupuestos} rowKey={(p) => p.id} rowLabel={(p) => p.numero} pageSize={8}
              columns={[
                { key: 'n', label: 'N.°', render: (p) => <Link to={`/presupuestos/${p.id}`} className="font-bold hover:text-bold-red">{p.numero}</Link> },
                { key: 'f', label: 'Fecha', render: (p) => formatFecha(p.fecha) },
                { key: 't', label: 'Total', align: 'right', render: (p) => formatARS(totales(p.renglones, p.descuentoPct, iva).total) },
                { key: 's', label: 'Estado', render: (p) => <PresupuestoBadge estado={estadoPresupuesto(p, der.hoy)} /> },
              ]}
              rowActions={(p) => [{ label: 'Ver', icon: 'eye', to: `/presupuestos/${p.id}` }]}
              emptyIcon="file-text" emptyTitle="Sin presupuestos" emptyText="Los presupuestos de los últimos 60 días aparecen acá."
              emptyAction={<Button icon="plus" onClick={nuevoPresupuesto}>Nuevo presupuesto</Button>} />
          )}
          {vista === 'pedidos' && (
            <DataTable overline="Historial" title="Pedidos" rows={info.pedidos} rowKey={(p) => p.id} rowLabel={(p) => p.numero} pageSize={8}
              columns={[
                { key: 'n', label: 'Pedido', render: (p) => <Link to={`/pedidos/${p.id}`} className="font-bold hover:text-bold-red">{p.numero}</Link> },
                { key: 'f', label: 'Entrega', render: (p) => formatFecha(p.entrega.fecha) },
                { key: 't', label: 'Total', align: 'right', render: (p) => formatARS(totales(p.renglones, p.descuentoPct, iva).total) },
                { key: 's', label: 'Estado', render: (p) => <PedidoBadge estado={p.estado} /> },
              ]}
              rowActions={(p) => [{ label: 'Ver', icon: 'eye', to: `/pedidos/${p.id}` }]}
              emptyIcon="package" emptyTitle="Sin pedidos" emptyText="Los pedidos de los últimos 60 días aparecen acá." />
          )}
          {vista === 'facturas' && (
            <DataTable overline="Historial" title="Facturas y notas de crédito" rows={info.facturas} rowKey={(c) => c.id} rowLabel={(c) => codigoComprobante(c)} pageSize={8}
              columns={[
                { key: 'n', label: 'Comprobante', render: (c) => <Link to={`/facturacion/${c.id}`} className="font-bold tabular hover:text-bold-red">{codigoComprobante(c)}</Link> },
                { key: 'f', label: 'Fecha', render: (c) => formatFecha(c.fecha) },
                { key: 't', label: 'Total', align: 'right', render: (c) => (c.clase === 'factura' ? formatARS(c.total) : `− ${formatARS(c.total)}`) },
                { key: 's', label: 'Cobro', render: (c) => (c.clase === 'factura' ? <CobroBadge pendiente={der.pendientes.get(c.id) ?? 0} total={c.total} vencida={diasEntre(c.vencePago, der.hoy) > 0} /> : <Badge tone="info" icon="undo">Crédito</Badge>) },
              ]}
              rowActions={(c) => [{ label: 'Ver', icon: 'eye', to: `/facturacion/${c.id}` }]}
              emptyIcon="receipt" emptyTitle="Sin facturas" emptyText="Todavía no se le facturó." />
          )}
          {vista === 'productos' && (
            <DataTable overline="Últimos 6 meses" title="Lo que más compra" rows={info.top} rowKey={(x) => x.p.id} pagination={false}
              columns={[
                { key: 'p', label: 'Producto', render: (x) => <span>{x.p.nombre}<span className="dl-sub">{x.p.codigo}</span></span> },
                { key: 'v', label: 'Veces', align: 'right', render: (x) => x.veces },
                { key: 'c', label: 'Cantidad', align: 'right', render: (x) => `${x.cant} ${x.p.unidad}` },
                { key: 'n', label: 'Neto', align: 'right', render: (x) => formatARS(x.neto) },
              ]}
              emptyIcon="tag" emptyTitle="Sin compras en los últimos 6 meses" />
          )}
        </div>

        <aside className="flex min-w-0 flex-[2_1_340px] flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <SectionTitle overline="Datos" title="Contacto y facturación" action={<Button variant="secondary" size="s" icon="pencil" onClick={() => setEditar(true)}>Editar</Button>} />
            <DatosLista columnas={2} items={[
              ['Contacto', cliente.contacto],
              ['Teléfono', cliente.telefono],
              ['Email', cliente.email || '—'],
              ['Localidad', cliente.localidad],
              ['Dirección', cliente.direccion],
              ['IVA', CONDICION_IVA[cliente.condicionIVA]],
              ['Condición de venta', cliente.condicionVenta === 'cta_cte_30' ? 'Cta. cte. 30 días' : 'Contado'],
              ['Límite de crédito', cliente.limiteCredito ? formatARS(cliente.limiteCredito) : '—'],
            ]} />
            {cliente.notas && <p className="m-0 rounded-sm bg-arena-100 p-3 text-body-small"><strong>Nota:</strong> {cliente.notas}</p>}
          </Card>
          <Card className="flex flex-col gap-3">
            <SectionTitle overline="WhatsApp" title="Conversación" />
            {conv && ultimoMsg ? (
              <>
                <p className="m-0 line-clamp-3 rounded-sm bg-arena-100 p-3 text-body-small">{ultimoMsg.de === 'dalama' ? 'Vos: ' : ''}{ultimoMsg.texto}</p>
                <ButtonLink to={`/whatsapp/${conv.id}`} variant="secondary" icon="message">Abrir en la bandeja</ButtonLink>
              </>
            ) : (
              <p className="m-0 text-body-small text-texto-secundario">Todavía no hay mensajes con este cliente. Se crea la conversación al enviarle un presupuesto o una factura.</p>
            )}
          </Card>
        </aside>
      </div>

      <EditarCliente cliente={cliente} open={editar} onClose={() => setEditar(false)} />
    </Page>
  );
}
