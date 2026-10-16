import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Alert, Button, ButtonLink, Card, DateInput, Icon, SectionTitle, Select, Switch, TextInput } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { EditorRenglones, type RenglonEditable } from '@/components/negocio/EditorRenglones';
import { BuscadorProducto } from '@/components/negocio/BuscadorProducto';
import { ResumenTotales } from '@/components/negocio/Totales';
import { BotonPDF } from '@/components/negocio/BotonPDF';
import { PedidoBadge, PresupuestoBadge } from '@/components/negocio/Estados';
import { DatosLista } from '@/components/negocio/Datos';
import { CONDICION_IVA_CORTA, TIPO_CLIENTE, estadoPresupuesto, totales } from '@/domain/calculos';
import type { Presupuesto } from '@/domain/types';
import { aISO, conHora, deISO } from '@/lib/fechas';
import { formatARS, formatCUIT, formatFecha, formatHora } from '@/lib/format';
import { pdfPresupuesto } from '@/services/pdf/documentos';
import { ejecutar, guardarPresupuesto } from '@/store/acciones';
import { datosActuales, useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { usePresupuestoAcciones } from '../usePresupuestoAcciones';

const pad = (n: number) => String(n).padStart(2, '0');
const aInputFecha = (iso: string) => { const d = deISO(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

export default function PresupuestoDetallePage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const p = datos.presupuestos.find((x) => x.id === id);
  const acciones = usePresupuestoAcciones(p);

  // Llegada desde "Recordar por WhatsApp" en el listado.
  useEffect(() => {
    if (p && params.get('recordar')) {
      acciones.abrirEnvio();
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.id]);

  if (!p) {
    return (
      <Page title="Presupuesto" overline="Operación · Presupuestos">
        <Card className="p-0">
          <EmptyState icon="file-text" title="No encontramos este presupuesto" text="Puede que se haya borrado al reiniciar la demo." action={<ButtonLink to="/presupuestos" variant="primary">Ver presupuestos</ButtonLink>} />
        </Card>
      </Page>
    );
  }

  const cliente = der.clientePorId.get(p.clienteId)!;
  const estado = estadoPresupuesto(p, der.hoy);
  const editable = p.estado === 'borrador' || p.estado === 'enviado';
  const pedido = p.pedidoId ? datos.pedidos.find((x) => x.id === p.pedidoId) : undefined;
  const conv = p.conversacionId ? datos.conversaciones.find((c) => c.id === p.conversacionId) : undefined;
  const lista = datos.listas.find((l) => l.descuentoPct === p.descuentoPct);
  const sinResolver = p.renglones.filter((r) => !r.productoId).length;
  const total = totales(p.renglones.filter((r) => r.productoId), p.descuentoPct, datos.ajustes.ivaPct).total;
  const cuenta = der.cuentas.get(cliente.id)!;
  const guardar = (cambio: Partial<Presupuesto>) => ejecutar((d) => guardarPresupuesto(d, { ...p, ...cambio }));
  const mostrarIA = p.renglones.some((r) => r.textoOriginal) && p.estado === 'borrador';

  const pasos: Array<{ t: string; d?: string; ok: boolean }> = [
    { t: 'Creado', d: `${formatFecha(p.fecha)} ${formatHora(p.fecha)} · ${p.origen === 'whatsapp' ? 'desde WhatsApp' : 'manual'}`, ok: true },
    { t: 'Enviado', d: p.enviadoEl ? `${formatFecha(p.enviadoEl)} ${formatHora(p.enviadoEl)} por ${p.enviadoPor === 'email' ? 'email' : 'WhatsApp'}` : undefined, ok: !!p.enviadoEl },
    { t: 'Visto por el cliente', d: p.vistoEl ? `${formatFecha(p.vistoEl)} a las ${formatHora(p.vistoEl)}` : undefined, ok: !!p.vistoEl },
    { t: p.estado === 'rechazado' ? `Rechazado · ${p.motivoRechazo ?? ''}` : 'Aceptado', d: p.respondidoEl ? formatFecha(p.respondidoEl) : undefined, ok: !!p.respondidoEl },
    { t: pedido ? `Pedido ${pedido.numero}` : 'Pedido', d: pedido ? formatFecha(pedido.fecha) : undefined, ok: !!pedido },
  ];

  return (
    <Page title={`Presupuesto ${p.numero}`} overline={`Presupuestos · ${cliente.razonSocial}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/presupuestos" className="dl-link inline-flex items-center gap-1 text-body-small"><Icon name="arrow-left" size={16} />Todos los presupuestos</Link>
        <div className="flex flex-wrap gap-2">
          <BotonPDF nombre={`Presupuesto ${p.numero}`} generar={() => pdfPresupuesto(datosActuales(), p)} />
          {pedido ? (
            <ButtonLink to={`/pedidos/${pedido.id}`} variant="primary" icon="truck">Ver pedido {pedido.numero}</ButtonLink>
          ) : p.estado === 'aceptado' ? (
            <Button icon="package" onClick={acciones.abrirConvertir}>Convertir en pedido</Button>
          ) : p.estado === 'rechazado' ? null : (
            <Button icon="send" onClick={acciones.abrirEnvio} disabled={sinResolver > 0 || total === 0}>
              {p.estado === 'borrador' ? 'Enviar por WhatsApp' : 'Reenviar por WhatsApp'}
            </Button>
          )}
        </div>
      </div>

      {estado === 'vencido' && (
        <Alert tone="warning" title={`Venció el ${formatFecha(p.validoHasta)} sin respuesta`}>
          Reenviarlo renueva la validez por {datos.ajustes.validezPresupuestoDias} días con los precios de hoy.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-4">
        <Card className="flex min-w-0 flex-[3_1_620px] flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="dl-overline">{editable ? 'Editar' : 'Detalle'}</div>
              <div className="flex items-center gap-2"><h2 className="dl-card-title">Presupuesto {p.numero}</h2><PresupuestoBadge estado={estado} /></div>
              <span className="dl-brandline" aria-hidden="true" />
            </div>
            <span className="text-right text-caption text-texto-secundario">
              {p.enviadoEl ? <>Enviado el {formatFecha(p.enviadoEl).slice(0, 5)} por {p.enviadoPor === 'email' ? 'email' : 'WhatsApp'}<br /></> : 'Todavía no se envió'}
              {p.vistoEl && <>Visto el {formatFecha(p.vistoEl).slice(0, 5)} a las {formatHora(p.vistoEl)}</>}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              className="sm:col-span-2"
              label="Cliente"
              value={p.clienteId}
              disabled={p.estado !== 'borrador'}
              helper={p.estado !== 'borrador' ? 'El cliente no se cambia una vez enviado.' : undefined}
              onChange={(e) => {
                const c = der.clientePorId.get(e.target.value)!;
                guardar({ clienteId: c.id, descuentoPct: datos.listas.find((l) => l.id === c.listaId)?.descuentoPct ?? 0 });
              }}
              options={[...datos.clientes].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial)).map((c) => ({ value: c.id, label: `${c.razonSocial} · ${TIPO_CLIENTE[c.tipo]}` }))}
            />
            <Select
              label="Lista de precios"
              value={String(p.descuentoPct)}
              disabled={!editable}
              onChange={(e) => guardar({ descuentoPct: Number(e.target.value) })}
              options={datos.listas.map((l) => ({ value: String(l.descuentoPct), label: l.descuentoPct ? `${l.nombre} −${l.descuentoPct} %` : l.nombre }))}
            />
            <DateInput
              label="Válido hasta"
              value={aInputFecha(p.validoHasta)}
              disabled={!editable}
              onChange={(e) => {
                const [y, m, dd] = e.target.value.split('-').map(Number);
                if (y && m && dd) guardar({ validoHasta: aISO(conHora(new Date(y, m - 1, dd), 23, 59)) });
              }}
            />
          </div>

          {editable && (
            <BuscadorProducto
              productos={datos.productos}
              reservado={der.reservado}
              excluir={p.renglones.map((r) => r.productoId ?? '')}
              onElegir={(prod) => guardar({ renglones: [...p.renglones, { id: `r-${Date.now().toString(36)}`, productoId: prod.id, descripcion: prod.nombre, cantidad: 1, precioUnitario: prod.precioLista }] })}
            />
          )}

          {p.renglones.length === 0 ? (
            <EmptyState icon="tag" title="Todavía no hay productos" text="Buscá un producto arriba para sumarlo al presupuesto." className="py-8" />
          ) : (
            <EditorRenglones
              renglones={p.renglones as RenglonEditable[]}
              onChange={editable ? (renglones) => guardar({ renglones }) : undefined}
              productoPorId={der.productoPorId}
              reservado={der.reservado}
              descuentoPct={p.descuentoPct}
              mostrarIA={mostrarIA}
              className="-mx-6"
            />
          )}

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex min-w-[240px] flex-1 flex-col gap-3">
              <TextInput label="Nota para el cliente" defaultValue={p.notas ?? ''} disabled={!editable} onBlur={(e) => e.target.value !== (p.notas ?? '') && guardar({ notas: e.target.value || undefined })} placeholder="Aparece en el PDF" />
              <div className="flex items-center justify-between gap-3 rounded-sm bg-arena-100 p-3">
                <span className="text-body-small"><strong>Seguimiento automático</strong><br /><span className="text-texto-secundario">Recordar si no responde en {p.recordatorio.dias} días</span></span>
                <Switch checked={p.recordatorio.activo} disabled={!editable} onChange={(v) => guardar({ recordatorio: { ...p.recordatorio, activo: v } })}>
                  <span className="sr-only">Seguimiento automático</span>
                </Switch>
              </div>
            </div>
            <ResumenTotales renglones={p.renglones} descuentoPct={p.descuentoPct} ivaPct={datos.ajustes.ivaPct} nombreLista={lista?.descuentoPct ? lista.nombre.replace('Lista ', '') : undefined} />
          </div>

          {(p.estado === 'enviado' || estado === 'vencido') && (
            <div className="flex flex-wrap gap-2 border-t border-arena-100 pt-4">
              <Button variant="tertiary" icon="package" onClick={() => { acciones.aceptarManual(); acciones.abrirConvertir(); }}>Convertir en pedido</Button>
              <Button variant="tertiary" icon="x" onClick={acciones.abrirRechazo}>Marcar como rechazado</Button>
            </div>
          )}
        </Card>

        <aside className="flex min-w-0 flex-[2_1_340px] flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <SectionTitle overline="Cliente" title={cliente.razonSocial} action={<ButtonLink to={`/clientes/${cliente.id}`} variant="secondary" size="s">Ver ficha</ButtonLink>} />
            <DatosLista columnas={2} items={[
              ['Contacto', cliente.contacto],
              ['Teléfono', cliente.telefono],
              ['CUIT', formatCUIT(cliente.cuit)],
              ['IVA', CONDICION_IVA_CORTA[cliente.condicionIVA]],
              ['Saldo', formatARS(cuenta.saldo)],
              ['Vencido', cuenta.vencido ? <span className="text-error">{formatARS(cuenta.vencido)}</span> : 'Sin deuda vencida'],
            ]} />
            {conv && <Link to={`/whatsapp/${conv.id}`} className="dl-link inline-flex items-center gap-1 text-body-small"><Icon name="message" size={16} />Ver la conversación de WhatsApp</Link>}
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionTitle overline="Seguimiento" title="Historial" />
            <ol className="m-0 flex list-none flex-col p-0">
              {pasos.map((s, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-arena-100 py-2.5 last:border-0">
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-sm ${s.ok ? (p.estado === 'rechazado' && i === 3 ? 'bg-error-suave text-error' : 'bg-exito-suave text-exito') : 'bg-arena-100 text-neutro-700'}`}>
                    {s.ok ? <Icon name={p.estado === 'rechazado' && i === 3 ? 'x' : 'check'} size={14} strokeWidth={2.5} /> : <span className="text-caption font-bold">{i + 1}</span>}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-body ${s.ok ? 'font-semibold' : 'text-texto-secundario'}`}>{s.t}</span>
                    {s.d && <span className="block text-caption text-texto-secundario">{s.d}</span>}
                  </span>
                </li>
              ))}
            </ol>
            {pedido && (
              <div className="flex items-center justify-between gap-2 rounded-sm bg-arena-100 p-3">
                <Link to={`/pedidos/${pedido.id}`} className="dl-link">{pedido.numero}</Link>
                <PedidoBadge estado={pedido.estado} />
              </div>
            )}
          </Card>
          <p className="m-0 text-caption text-texto-secundario">Total con IVA: <strong className="tabular text-texto">{formatARS(total)}</strong></p>
        </aside>
      </div>
      {acciones.dialogos}
    </Page>
  );
}
