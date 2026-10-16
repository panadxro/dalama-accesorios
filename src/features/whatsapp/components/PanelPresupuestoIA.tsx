import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, ButtonLink, Card, Icon, Select, StatusBadge, TextInput, toast } from '@/components/ui';
import { EditorRenglones, type RenglonEditable } from '@/components/negocio/EditorRenglones';
import { BuscadorProducto } from '@/components/negocio/BuscadorProducto';
import { ResumenTotales } from '@/components/negocio/Totales';
import { ClienteRapido } from '@/components/negocio/ClienteRapido';
import { BotonPDF } from '@/components/negocio/BotonPDF';
import { PedidoBadge, PresupuestoBadge } from '@/components/negocio/Estados';
import { usePresupuestoAcciones, cuandoTexto } from '@/features/presupuestos/usePresupuestoAcciones';
import { estadoPresupuesto, METODO_ENTREGA, totales } from '@/domain/calculos';
import type { Conversacion, Presupuesto, Producto } from '@/domain/types';
import { formatARS, formatFecha, formatHora } from '@/lib/format';
import { interpretarPedido, nivelConfianza } from '@/services/ia/interpretarPedido';
import { pdfPresupuesto } from '@/services/pdf/documentos';
import { crearCliente, crearPresupuesto, ejecutar, guardarPresupuesto, marcarLeida, vincularConversacion } from '@/store/acciones';
import { datosActuales, useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';

const PASOS = ['Leyendo el mensaje', 'Buscando en el catálogo', 'Aplicando la lista de precios del cliente'];

/** Animación breve mientras la "IA" interpreta el pedido. */
function Analizando() {
  const [paso, setPaso] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setPaso((p) => Math.min(p + 1, PASOS.length - 1)), 500);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center" role="status" aria-live="polite">
      <div className="grid h-14 w-14 place-items-center rounded-md bg-arena-100">
        <Icon name="sparkles" size={26} className="animate-dl-pulse text-bold-red" />
      </div>
      <div>
        <p className="m-0 text-h3 font-semibold">Analizando pedido…</p>
        <p className="m-0 mt-1 text-body-small text-texto-secundario">{PASOS[paso]}</p>
      </div>
      <ol className="m-0 flex list-none gap-1.5 p-0" aria-hidden="true">
        {PASOS.map((_, i) => <li key={i} className={`h-1 w-10 rounded-sm ${i <= paso ? 'bg-rojo-dalama' : 'bg-arena-200'}`} />)}
      </ol>
    </div>
  );
}

/** Texto de los mensajes del cliente que todavía no se presupuestaron. */
function textoAPresupuestar(conv: Conversacion): string {
  const ultimoDalama = [...conv.mensajes].reverse().findIndex((m) => m.de === 'dalama');
  const desde = ultimoDalama === -1 ? 0 : conv.mensajes.length - ultimoDalama;
  return conv.mensajes.slice(desde).filter((m) => m.de === 'cliente').map((m) => m.texto).join('\n');
}

function renglonesDesdeIA(texto: string, productos: Producto[]): RenglonEditable[] {
  const res = interpretarPedido(texto, productos);
  return res.lineas.map((l, i) => {
    const p = l.productoId ? productos.find((x) => x.id === l.productoId) : undefined;
    return {
      id: `ia-${Date.now().toString(36)}-${i}`,
      productoId: p?.id ?? null,
      descripcion: p?.nombre ?? l.texto,
      cantidad: l.cantidad,
      precioUnitario: p?.precioLista ?? 0,
      textoOriginal: l.texto,
      confianza: l.confianza,
      candidatos: l.candidatos,
      nota: l.nota,
    };
  });
}

/** Panel derecho de la bandeja: del mensaje al pedido, según en qué paso esté la conversación. */
export function PanelPresupuestoIA({ conv }: { conv: Conversacion }) {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [analizando, setAnalizando] = useState(false);
  const [pendientes, setPendientes] = useState<RenglonEditable[] | null>(null);
  const [alta, setAlta] = useState(false);
  const [nota, setNota] = useState('');

  const cliente = conv.clienteId ? der.clientePorId.get(conv.clienteId) : undefined;
  const presupuesto: Presupuesto | undefined = conv.presupuestoId ? datos.presupuestos.find((p) => p.id === conv.presupuestoId) : undefined;
  const pedido = presupuesto?.pedidoId ? datos.pedidos.find((p) => p.id === presupuesto.pedidoId) : undefined;
  const acciones = usePresupuestoAcciones(presupuesto);

  useEffect(() => {
    setNota(presupuesto?.notas ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presupuesto?.id]);

  const crearDesdeRenglones = (clienteId: string, renglones: RenglonEditable[]) => {
    const p = ejecutar((d) => crearPresupuesto(d, { clienteId, renglones, origen: 'whatsapp', conversacionId: conv.id }));
    ejecutar((d) => marcarLeida(d, conv.id));
    const dudosos = renglones.filter((r) => !r.productoId || nivelConfianza(r.confianza) !== 'alta').length;
    toast.success(
      `Presupuesto ${p.numero} generado`,
      `La IA leyó ${renglones.length} ${renglones.length === 1 ? 'pedido' : 'pedidos'} en el mensaje${dudosos ? ` y marcó ${dudosos} para revisar` : ' y los encontró todos'}. Revisalo antes de enviarlo.`,
    );
  };

  const analizar = () => {
    setAnalizando(true);
    window.setTimeout(() => {
      const renglones = renglonesDesdeIA(textoAPresupuestar(conv), datosActuales().productos);
      setAnalizando(false);
      if (!renglones.length) {
        toast.warning('No encontramos productos en el mensaje', 'Puede ser un saludo o una consulta. Respondé desde el chat o armá el presupuesto a mano.');
        return;
      }
      if (cliente) crearDesdeRenglones(cliente.id, renglones);
      else {
        setPendientes(renglones);
        setAlta(true);
      }
    }, 1600);
  };

  const actualizar = (cambio: Partial<Presupuesto>) => {
    if (presupuesto) ejecutar((d) => guardarPresupuesto(d, { ...presupuesto, ...cambio }));
  };

  /* ───── Sin presupuesto todavía ───── */
  if (!presupuesto || (presupuesto && conv.estado === 'nuevo' && presupuesto.estado !== 'borrador')) {
    return (
      <Card className="flex flex-col p-0" aria-label="Presupuesto con IA">
        {analizando ? (
          <Analizando />
        ) : (
          <div className="flex flex-col gap-5 p-6">
            <div>
              <div className="dl-overline">Presupuesto con IA</div>
              <h2 className="dl-card-title">{conv.estado === 'nuevo' ? 'Convertí el mensaje en un presupuesto' : 'Sin pedidos para presupuestar'}</h2>
              <span className="dl-brandline" aria-hidden="true" />
            </div>
            {!cliente && (
              <Alert tone="info" title="Este número no está en tus clientes">
                Al generar el presupuesto te pedimos los datos mínimos para darlo de alta.
              </Alert>
            )}
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-body text-texto-secundario">
              <li className="flex gap-2"><Icon name="sparkles" size={18} className="shrink-0 text-bold-red" />Detecta productos, cantidades, colores y medidas aunque estén abreviados.</li>
              <li className="flex gap-2"><Icon name="tag" size={18} className="shrink-0 text-bold-red" />Aplica la lista de precios del cliente y muestra el stock.</li>
              <li className="flex gap-2"><Icon name="alert-triangle" size={18} className="shrink-0 text-bold-red" />Marca lo dudoso para que lo elijas vos. Nada se envía sin tu revisión.</li>
            </ul>
            <Button icon="sparkles" onClick={analizar} disabled={conv.estado !== 'nuevo'} className="self-start">
              Generar presupuesto con IA
            </Button>
          </div>
        )}
        <ClienteRapido
          open={alta}
          onClose={() => { setAlta(false); setPendientes(null); }}
          nombreInicial={conv.contacto}
          telefono={conv.telefono}
          onCrear={(datosCliente) => {
            setAlta(false);
            const c = ejecutar((d) => crearCliente(d, datosCliente));
            ejecutar((d) => vincularConversacion(d, conv.id, c.id));
            toast.success(`${c.razonSocial} dado de alta`, 'Quedó como cliente con lista general y venta de contado. La conversación ya está vinculada a su ficha.');
            if (pendientes) crearDesdeRenglones(c.id, pendientes);
            setPendientes(null);
          }}
        />
      </Card>
    );
  }

  const estado = estadoPresupuesto(presupuesto, new Date());
  const lista = datos.listas.find((l) => l.descuentoPct === presupuesto.descuentoPct && l.descuentoPct > 0);
  const sinResolver = presupuesto.renglones.filter((r) => !r.productoId).length;
  const total = totales(presupuesto.renglones.filter((r) => r.productoId), presupuesto.descuentoPct, datos.ajustes.ivaPct).total;

  /* ───── Borrador: revisar y enviar ───── */
  if (presupuesto.estado === 'borrador') {
    const generadoPorIA = presupuesto.renglones.some((r) => r.textoOriginal);
    return (
      <Card className="flex flex-col p-0" aria-label={`Presupuesto ${presupuesto.numero}`}>
        <div className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div>
            <div className="dl-overline">{generadoPorIA ? 'Generado por IA · revisar' : 'Borrador'}</div>
            <div className="flex items-center gap-2.5"><h2 className="dl-card-title">Presupuesto {presupuesto.numero}</h2><StatusBadge status="borrador" /></div>
            <span className="dl-brandline" aria-hidden="true" />
          </div>
          <div className="text-right text-body-small text-texto-secundario">
            Precios {lista ? lista.nombre : 'lista general'}, sin IVA<br />Válido hasta el {formatFecha(presupuesto.validoHasta)}
          </div>
        </div>

        <EditorRenglones
          renglones={presupuesto.renglones as RenglonEditable[]}
          onChange={(renglones) => actualizar({ renglones })}
          productoPorId={der.productoPorId}
          reservado={der.reservado}
          descuentoPct={presupuesto.descuentoPct}
          mostrarIA
          className="[&>div:not(.dl-table-scroll)]:mx-6"
        />

        <div className="px-6 pt-4">
          <BuscadorProducto
            productos={datos.productos}
            reservado={der.reservado}
            label="Sumar otro producto"
            excluir={presupuesto.renglones.map((r) => r.productoId ?? '')}
            onElegir={(p) => actualizar({ renglones: [...presupuesto.renglones, { id: `r-${Date.now().toString(36)}`, productoId: p.id, descripcion: p.nombre, cantidad: 1, precioUnitario: p.precioLista }] })}
          />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6 px-6 py-5">
          <div className="flex min-w-[240px] flex-1 flex-col gap-3">
            <TextInput
              label="Nota para el cliente"
              value={nota}
              placeholder="Ej.: el mosquitero se fabrica a medida, 72 h hábiles"
              onChange={(e) => setNota(e.target.value)}
              onBlur={() => nota !== (presupuesto.notas ?? '') && actualizar({ notas: nota || undefined })}
            />
            <Select
              label="Recordatorio automático"
              value={presupuesto.recordatorio.activo ? String(presupuesto.recordatorio.dias) : 'no'}
              onChange={(e) => actualizar({ recordatorio: e.target.value === 'no' ? { ...presupuesto.recordatorio, activo: false } : { activo: true, dias: Number(e.target.value) } })}
              options={[{ value: '3', label: 'Si no responde en 3 días' }, { value: '5', label: 'Si no responde en 5 días' }, { value: '7', label: 'Si no responde en 7 días' }, { value: 'no', label: 'No recordar' }]}
            />
          </div>
          <ResumenTotales renglones={presupuesto.renglones} descuentoPct={presupuesto.descuentoPct} ivaPct={datos.ajustes.ivaPct} nombreLista={lista?.nombre.replace('Lista ', '')} grande />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 rounded-b-md border-t border-borde bg-arena-50 px-6 py-4">
          <Button icon="send" disabled={sinResolver > 0 || total === 0} onClick={acciones.abrirEnvio}>Confirmar y enviar por WhatsApp</Button>
          <BotonPDF variant="secondary" nombre={`Presupuesto ${presupuesto.numero}`} generar={() => pdfPresupuesto(datosActuales(), presupuesto)}>Descargar PDF</BotonPDF>
          <Button variant="tertiary" onClick={() => toast.success('Borrador guardado', `Lo encontrás en Presupuestos como ${presupuesto.numero}.`)}>Guardar borrador</Button>
          <span className="flex-1 basis-[200px] text-right text-body-small text-texto-secundario">
            {sinResolver ? `Falta elegir ${sinResolver} ${sinResolver === 1 ? 'producto' : 'productos'} para poder enviarlo.` : 'Revisá cantidades y precios: el cliente recibe el PDF.'}
          </span>
        </div>
        {acciones.dialogos}
      </Card>
    );
  }

  /* ───── Enviado, aceptado o con pedido ───── */
  return (
    <Card className="flex flex-col gap-5" aria-label={`Presupuesto ${presupuesto.numero}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="dl-overline">{pedido ? 'Pedido en curso' : 'Seguimiento'}</div>
          <div className="flex items-center gap-2.5"><h2 className="dl-card-title">Presupuesto {presupuesto.numero}</h2><PresupuestoBadge estado={estado} /></div>
          <span className="dl-brandline" aria-hidden="true" />
        </div>
        <div className="text-right">
          <div className="text-[20px] font-bold leading-7 tabular">{formatARS(total)}</div>
          <div className="text-body-small text-texto-secundario">{presupuesto.renglones.length} productos · IVA incluido</div>
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-0 p-0" aria-label="Pasos">
        {[
          { ok: true, t: 'Presupuesto armado', d: formatFecha(presupuesto.fecha) },
          { ok: !!presupuesto.enviadoEl, t: 'Enviado por WhatsApp', d: presupuesto.enviadoEl ? `${formatFecha(presupuesto.enviadoEl)} ${formatHora(presupuesto.enviadoEl)}` : '' },
          { ok: presupuesto.estado === 'aceptado', t: presupuesto.estado === 'rechazado' ? 'Rechazado por el cliente' : 'Aceptado por el cliente', d: presupuesto.respondidoEl ? formatFecha(presupuesto.respondidoEl) : 'Esperando respuesta', no: presupuesto.estado === 'rechazado' },
          { ok: !!pedido, t: pedido ? `Pedido ${pedido.numero}` : 'Pedido', d: pedido ? `${METODO_ENTREGA[pedido.entrega.metodo]} · ${cuandoTexto(pedido.entrega.fecha)}` : '' },
          { ok: !!pedido?.comprobanteId, t: 'Factura', d: pedido?.comprobanteId ? 'Emitida' : '' },
        ].map((s, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-arena-100 py-2.5 last:border-0">
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-sm text-caption font-bold ${s.no ? 'bg-error-suave text-error' : s.ok ? 'bg-exito-suave text-exito' : 'bg-arena-100 text-neutro-700'}`}>
              {s.no ? <Icon name="x" size={14} strokeWidth={2.5} /> : s.ok ? <Icon name="check" size={14} strokeWidth={2.5} /> : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-body ${s.ok || s.no ? 'font-semibold' : 'text-texto-secundario'}`}>{s.t}</span>
              {s.d && <span className="block text-caption text-texto-secundario">{s.d}</span>}
            </span>
          </li>
        ))}
      </ol>

      {/* Siguiente paso */}
      {pedido ? (
        <div className="flex flex-col gap-3 rounded-sm bg-arena-100 p-4">
          <div className="flex items-center justify-between gap-3"><span className="font-semibold">Pedido {pedido.numero}</span><PedidoBadge estado={pedido.estado} /></div>
          {pedido.comprobanteId ? (
            <ButtonLink to={`/pedidos/${pedido.id}`} variant="primary" icon="truck">Ver pedido y entrega</ButtonLink>
          ) : (
            <ButtonLink to={`/facturacion/nueva?pedido=${pedido.id}`} variant="primary" icon="receipt">Emitir factura</ButtonLink>
          )}
          <Link to={`/pedidos/${pedido.id}`} className="dl-link self-start text-body-small">Ver detalle del pedido</Link>
        </div>
      ) : presupuesto.estado === 'aceptado' ? (
        <Button icon="package" onClick={acciones.abrirConvertir}>Convertir en pedido</Button>
      ) : presupuesto.estado === 'enviado' ? (
        <div className="flex flex-col gap-3 rounded-sm border border-dashed border-arena-500 p-4">
          <div>
            <div className="dl-overline">Simulación de la demo</div>
            <p className="m-0 mt-1 text-body-small text-texto-secundario">En el sistema real la respuesta llega sola por WhatsApp. Acá podés simularla:</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="s" icon="check" onClick={() => acciones.simularRespuesta('acepta')}>El cliente acepta</Button>
            <Button variant="secondary" size="s" icon="x" onClick={() => acciones.simularRespuesta('rechaza')}>El cliente no acepta</Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ButtonLink to={`/presupuestos/${presupuesto.id}`} variant="secondary" size="s" icon="file-text">Ver presupuesto</ButtonLink>
        <BotonPDF size="s" variant="tertiary" nombre={`Presupuesto ${presupuesto.numero}`} generar={() => pdfPresupuesto(datosActuales(), presupuesto)} />
        {estado === 'vencido' && <Button size="s" variant="tertiary" icon="send" onClick={acciones.abrirEnvio}>Reenviar</Button>}
      </div>
      {acciones.dialogos}
    </Card>
  );
}
