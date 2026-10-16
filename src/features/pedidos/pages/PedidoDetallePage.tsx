import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Alert, Button, ButtonLink, Card, ConfirmModal, Icon, SectionTitle, Sheet, toast } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { EditorRenglones } from '@/components/negocio/EditorRenglones';
import { ResumenTotales } from '@/components/negocio/Totales';
import { BotonPDF } from '@/components/negocio/BotonPDF';
import { CobroBadge, PedidoBadge } from '@/components/negocio/Estados';
import { DatosLista } from '@/components/negocio/Datos';
import { EntregaForm } from '@/components/negocio/EntregaForm';
import { ESTADO_PEDIDO, METODO_ENTREGA, codigoComprobante } from '@/domain/calculos';
import type { Entrega, EstadoPedido, Pedido } from '@/domain/types';
import { cn } from '@/lib/cn';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatFecha, formatHora } from '@/lib/format';
import { pdfRemito } from '@/services/pdf/documentos';
import { actualizarEntrega, cambiarEstadoPedido, ejecutar } from '@/store/acciones';
import { datosActuales, useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { ConfirmarEntrega } from '../ConfirmarEntrega';
import { cuandoEntrega } from './PedidosPage';

const ORDEN: EstadoPedido[] = ['confirmado', 'en_preparacion', 'listo', 'despachado', 'entregado'];

/** Qué sigue según el estado y el método de entrega. */
function siguiente(p: Pedido): { estado: EstadoPedido; label: string; explica: string } | null {
  switch (p.estado) {
    case 'confirmado': return { estado: 'en_preparacion', label: 'Pasar a preparación', explica: 'El depósito empieza a armar el pedido.' };
    case 'en_preparacion': return { estado: 'listo', label: 'Marcar listo y emitir remito', explica: 'Se numera el remito para que viaje con la mercadería.' };
    case 'listo':
      return p.entrega.metodo === 'transporte' || p.entrega.metodo === 'correo'
        ? { estado: 'despachado', label: `Marcar despachado por ${p.entrega.empresa ?? 'transporte'}`, explica: 'Se avisa al cliente que el pedido salió.' }
        : { estado: 'entregado', label: p.entrega.metodo === 'retiro' ? 'Confirmar retiro' : 'Confirmar entrega', explica: 'Queda registrado quién recibió.' };
    case 'despachado': return { estado: 'entregado', label: 'Confirmar entrega', explica: 'El transporte confirmó la entrega.' };
    default: return null;
  }
}

export default function PedidoDetallePage() {
  const { id } = useParams();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const p = datos.pedidos.find((x) => x.id === id);
  const [editarEntrega, setEditarEntrega] = useState(false);
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [cancelar, setCancelar] = useState(false);
  const [entregar, setEntregar] = useState(false);

  if (!p) {
    return (
      <Page title="Pedido" overline="Operación · Pedidos">
        <Card className="p-0"><EmptyState icon="package" title="No encontramos este pedido" text="Puede que se haya borrado al reiniciar la demo." action={<ButtonLink to="/pedidos" variant="primary">Ver pedidos</ButtonLink>} /></Card>
      </Page>
    );
  }

  const cliente = der.clientePorId.get(p.clienteId)!;
  const factura = p.comprobanteId ? datos.comprobantes.find((c) => c.id === p.comprobanteId) : undefined;
  const presupuesto = p.presupuestoId ? datos.presupuestos.find((x) => x.id === p.presupuestoId) : undefined;
  const pendiente = factura ? der.pendientes.get(factura.id) ?? 0 : 0;
  const sig = siguiente(p);
  const lista = datos.listas.find((l) => l.descuentoPct === p.descuentoPct && l.descuentoPct > 0);
  const paso = ORDEN.indexOf(p.estado);
  const viaTransporte = p.entrega.metodo === 'transporte' || p.entrega.metodo === 'correo';
  const pasos = ORDEN.filter((e) => viaTransporte || e !== 'despachado');

  const avanzar = () => {
    if (!sig) return;
    if (sig.estado === 'entregado') return setEntregar(true);
    const r = ejecutar((d) => cambiarEstadoPedido(d, p.id, sig.estado));
    const extra = sig.estado === 'listo' && r.remito ? ` Se emitió el remito ${r.remito.numero}.` : sig.estado === 'despachado' ? ` ${cliente.contacto.split(' ')[0]} puede seguirlo con el número de guía.` : '';
    toast.success(`Pedido ${p.numero}: ${ESTADO_PEDIDO[sig.estado].toLowerCase()}`, `${sig.explica}${extra}`);
  };

  return (
    <Page title={`Pedido ${p.numero}`} overline={`Pedidos · ${cliente.razonSocial}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/pedidos" className="dl-link inline-flex items-center gap-1 text-body-small"><Icon name="arrow-left" size={16} />Todos los pedidos</Link>
        <div className="flex flex-wrap gap-2">
          {p.remito && <BotonPDF nombre={`Remito ${p.remito.numero}`} generar={() => pdfRemito(datosActuales(), p)}>Descargar remito</BotonPDF>}
          {!factura && p.estado !== 'cancelado' ? (
            <ButtonLink to={`/facturacion/nueva?pedido=${p.id}`} variant="primary" icon="receipt">Emitir factura</ButtonLink>
          ) : sig ? (
            <Button icon={sig.estado === 'entregado' ? 'check' : 'arrow-right'} onClick={avanzar}>{sig.label}</Button>
          ) : null}
        </div>
      </div>

      {p.estado === 'cancelado' && <Alert tone="error" title="Pedido cancelado">Se liberó el stock reservado.</Alert>}
      {!factura && p.estado !== 'cancelado' && (
        <Alert tone="info" title="Falta emitir la factura" action={sig && <Button variant="secondary" size="s" onClick={avanzar}>{sig.label}</Button>}>
          Al facturar se suma a la cuenta corriente de {cliente.razonSocial} y se descuenta el stock. Mientras tanto, los productos quedan reservados.
        </Alert>
      )}

      {/* Línea de estados */}
      {p.estado !== 'cancelado' && (
        <Card className="py-5">
          <ol className="m-0 grid list-none gap-2 p-0" style={{ gridTemplateColumns: `repeat(${pasos.length}, minmax(0, 1fr))` }} aria-label="Estado del pedido">
            {pasos.map((e) => {
              const i = ORDEN.indexOf(e);
              const hecho = i <= paso;
              const actual = e === p.estado;
              return (
                <li key={e} className="flex flex-col gap-2" aria-current={actual ? 'step' : undefined}>
                  <span className={cn('h-1 rounded-sm', hecho ? (actual ? 'bg-rojo-dalama' : 'bg-ink-black') : 'bg-arena-200')} />
                  <span className={cn('text-body-small', hecho ? 'font-semibold text-texto' : 'text-texto-secundario')}>{ESTADO_PEDIDO[e]}</span>
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      <div className="flex flex-wrap items-start gap-4">
        <Card className="flex min-w-0 flex-[3_1_600px] flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="dl-overline">Productos</div>
              <div className="flex items-center gap-2"><h2 className="dl-card-title">Pedido {p.numero}</h2><PedidoBadge estado={p.estado} /></div>
              <span className="dl-brandline" aria-hidden="true" />
            </div>
            <span className="text-right text-caption text-texto-secundario">
              Creado el {formatFecha(p.fecha)}<br />
              {presupuesto && <>Desde el <Link className="dl-link" to={`/presupuestos/${presupuesto.id}`}>presupuesto {presupuesto.numero}</Link></>}
            </span>
          </div>
          <EditorRenglones renglones={p.renglones} productoPorId={der.productoPorId} descuentoPct={p.descuentoPct} className="-mx-6" />
          <div className="flex justify-end">
            <ResumenTotales renglones={p.renglones} descuentoPct={p.descuentoPct} ivaPct={datos.ajustes.ivaPct} nombreLista={lista?.nombre.replace('Lista ', '')} />
          </div>
          {p.notas && <p className="m-0 rounded-sm bg-arena-100 p-3 text-body-small"><strong>Nota:</strong> {p.notas}</p>}
          {!factura && p.estado !== 'cancelado' && (
            <div className="border-t border-arena-100 pt-4">
              <Button variant="tertiary" icon="x" onClick={() => setCancelar(true)}>Cancelar pedido</Button>
            </div>
          )}
        </Card>

        <aside className="flex min-w-0 flex-[2_1_340px] flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <SectionTitle overline="Entrega" title={METODO_ENTREGA[p.entrega.metodo]} action={p.estado !== 'entregado' && p.estado !== 'cancelado' ? <Button variant="secondary" size="s" icon="pencil" onClick={() => { setEntrega(p.entrega); setEditarEntrega(true); }}>Editar</Button> : undefined} />
            <DatosLista columnas={2} items={[
              [p.estado === 'entregado' ? 'Entregado' : 'Programado', p.entrega.entregadoEl ? `${formatFecha(p.entrega.entregadoEl)} ${formatHora(p.entrega.entregadoEl)}` : <span className="tabular">{cuandoEntrega(p.entrega.fecha)}</span>],
              ['Bultos', p.entrega.bultos],
              ...(p.entrega.metodo !== 'retiro' ? [['Dirección', p.entrega.direccion] as [string, string]] : []),
              ...(p.entrega.empresa ? [[p.entrega.metodo === 'correo' ? 'Correo' : 'Transporte', p.entrega.empresa] as [string, string]] : []),
              ...(p.entrega.tracking ? [['Seguimiento', p.entrega.tracking] as [string, string]] : []),
              ...(p.entrega.chofer ? [['Chofer', p.entrega.chofer] as [string, string]] : []),
              ['Remito', p.remito?.numero ?? 'Se emite al marcar listo'],
              ...(p.entrega.recibidoPor ? [['Recibió', p.entrega.recibidoPor] as [string, string]] : []),
            ]} />
            {p.entrega.cobrarAlEntregar && (
              <div className="flex items-center justify-between gap-2 rounded-sm bg-arena-100 p-3 text-body-small">
                <span><strong>Cobrar al entregar</strong><br /><span className="text-texto-secundario">Venta de contado</span></span>
                <span className={cn('font-bold tabular', factura && pendiente === 0 ? 'text-exito' : 'text-bold-red')}>{factura && pendiente === 0 ? 'Cobrado' : formatARS(factura ? pendiente : p.entrega.cobrarAlEntregar)}</span>
              </div>
            )}
            {diasEntre(new Date(), p.entrega.fecha) === 0 && p.estado !== 'entregado' && <Link to="/entregas" className="dl-link inline-flex items-center gap-1 text-body-small"><Icon name="truck" size={16} />Ver en las entregas de hoy</Link>}
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionTitle overline="Facturación" title={factura ? codigoComprobante(factura) : 'Sin factura'} />
            {factura ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-body-small text-texto-secundario">Emitida el {formatFecha(factura.fecha)} · CAE {factura.cae}</span>
                  <CobroBadge pendiente={pendiente} total={factura.total} vencida={pendiente > 0 && diasEntre(factura.vencePago, new Date()) > 0} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <ButtonLink to={`/facturacion/${factura.id}`} variant="secondary" size="s" icon="receipt">Ver factura</ButtonLink>
                  <ButtonLink to={`/cuentas/${cliente.id}`} variant="tertiary" size="s" icon="wallet">Cuenta corriente</ButtonLink>
                </div>
              </>
            ) : (
              <p className="m-0 text-body-small text-texto-secundario">El stock está reservado. Se descuenta al emitir la factura.</p>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionTitle overline="Cliente" title={cliente.razonSocial} action={<ButtonLink to={`/clientes/${cliente.id}`} variant="secondary" size="s">Ver ficha</ButtonLink>} />
            <span className="text-body-small text-texto-secundario">{cliente.contacto} · {cliente.telefono}</span>
          </Card>
        </aside>
      </div>

      {entrega && (
        <Sheet
          open={editarEntrega}
          onOpenChange={setEditarEntrega}
          overline={`Pedido ${p.numero}`}
          title="Editar entrega"
          footer={<>
            <Button variant="secondary" onClick={() => setEditarEntrega(false)}>Cancelar</Button>
            <Button icon="check" onClick={() => { ejecutar((d) => actualizarEntrega(d, p.id, entrega)); setEditarEntrega(false); toast.success('Entrega actualizada', `Quedó para ${cuandoEntrega(entrega.fecha).toLowerCase()} · ${METODO_ENTREGA[entrega.metodo].toLowerCase()}.`); }}>Guardar cambios</Button>
          </>}
        >
          <EntregaForm entrega={entrega} onChange={setEntrega} direccionCliente={`${cliente.direccion}, ${cliente.localidad}`} />
        </Sheet>
      )}

      <ConfirmModal
        open={cancelar}
        destructive
        title={`¿Cancelar el pedido ${p.numero}?`}
        confirmLabel="Cancelar pedido"
        cancelLabel="Volver"
        onCancel={() => setCancelar(false)}
        onConfirm={() => { setCancelar(false); ejecutar((d) => cambiarEstadoPedido(d, p.id, 'cancelado')); toast.info(`Pedido ${p.numero} cancelado`, 'Se liberaron los productos reservados: vuelven a estar disponibles para otros pedidos.'); }}
      >
        Se libera el stock reservado. El presupuesto queda como aceptado en el historial.
      </ConfirmModal>

      <ConfirmarEntrega pedido={p} open={entregar} onClose={() => setEntregar(false)} />
    </Page>
  );
}
