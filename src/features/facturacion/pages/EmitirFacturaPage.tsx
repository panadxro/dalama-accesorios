import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Alert, Badge, Button, ButtonLink, Card, DataTable, DateInput, Icon, SectionTitle, Select, Switch, toast } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { DatosLista } from '@/components/negocio/Datos';
import { BotonPDF } from '@/components/negocio/BotonPDF';
import { EnviarWhatsApp } from '@/components/negocio/EnviarWhatsApp';
import { CONDICION_IVA, completarPlantilla, letraPara, nombreComprobante, numeroFiscal, precioConLista, subtotalRenglon, totales } from '@/domain/calculos';
import type { Comprobante, LetraComprobante } from '@/domain/types';
import { cn } from '@/lib/cn';
import { sumarDias } from '@/lib/fechas';
import { formatARS, formatCUIT, formatFecha, formatHora } from '@/lib/format';
import { ArcaError, solicitarCAE } from '@/services/arca';
import { pdfComprobante } from '@/services/pdf/documentos';
import { ejecutar, emitirFactura, enviarDocumento } from '@/store/acciones';
import { datosActuales, useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { cuandoEntrega } from '@/features/pedidos/pages/PedidosPage';

const pad = (n: number) => String(n).padStart(2, '0');
const hoyInput = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

/** Sin pedido elegido: lista de pedidos para facturar. */
function ElegirPedido() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const pendientes = datos.pedidos.filter((p) => !p.comprobanteId && p.estado !== 'cancelado').sort((a, b) => a.entrega.fecha.localeCompare(b.entrega.fecha));
  return (
    <Page title="Emitir factura" overline="Facturación">
      <DataTable
        overline="Paso 1"
        title="¿Qué pedido vas a facturar?"
        rows={pendientes}
        rowKey={(p) => p.id}
        rowLabel={(p) => p.numero}
        pagination={false}
        columns={[
          { key: 'n', label: 'Pedido', render: (p) => <strong>{p.numero}</strong> },
          { key: 'c', label: 'Cliente', render: (p) => der.clientePorId.get(p.clienteId)?.razonSocial },
          { key: 'e', label: 'Entrega', render: (p) => cuandoEntrega(p.entrega.fecha) },
          { key: 't', label: 'Total', align: 'right', render: (p) => formatARS(totales(p.renglones, p.descuentoPct, datos.ajustes.ivaPct).total) },
        ]}
        rowActions={(p) => [{ label: 'Facturar', icon: 'receipt', to: `/facturacion/nueva?pedido=${p.id}` }]}
        emptyIcon="receipt"
        emptyTitle="No hay pedidos para facturar"
        emptyText="Todos los pedidos en curso ya tienen factura. Los nuevos aparecen acá al convertir un presupuesto."
        emptyAction={<ButtonLink to="/facturacion" variant="secondary">Ver comprobantes</ButtonLink>}
      />
    </Page>
  );
}

export default function EmitirFacturaPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const pedido = datos.pedidos.find((p) => p.id === params.get('pedido'));
  const cliente = pedido ? der.clientePorId.get(pedido.clienteId) : undefined;
  const sugerida = cliente ? letraPara(cliente.condicionIVA, datos.empresa.condicionIVA) : 'A';

  const [letra, setLetra] = useState<LetraComprobante>(sugerida);
  const [fecha, setFecha] = useState(hoyInput());
  const [condicion, setCondicion] = useState(cliente?.condicionVenta ?? 'contado');
  const [estado, setEstado] = useState<'borrador' | 'pidiendo' | 'ok' | 'error'>('borrador');
  const [error, setError] = useState<string>();
  const [falla, setFalla] = useState(false);
  const [emitido, setEmitido] = useState<Comprobante>();
  const [enviar, setEnviar] = useState(false);

  if (!params.get('pedido')) return <ElegirPedido />;
  if (!pedido || !cliente) {
    return (
      <Page title="Emitir factura" overline="Facturación">
        <Card className="p-0"><EmptyState icon="receipt" title="No encontramos ese pedido" action={<ButtonLink to="/facturacion/nueva" variant="primary">Elegir otro pedido</ButtonLink>} /></Card>
      </Page>
    );
  }

  // El pedido ya se facturó (por ejemplo, desde otra pestaña): mostrar el resultado.
  const yaFacturado = pedido.comprobanteId && !emitido ? datos.comprobantes.find((c) => c.id === pedido.comprobanteId) : undefined;
  const comprobante = emitido ?? yaFacturado;

  const t = totales(pedido.renglones, pedido.descuentoPct, datos.ajustes.ivaPct);
  const numero = comprobante ? comprobante.numero : datos.secuencias.factura[letra];
  const ultimoA = datos.secuencias.factura.A - 1;
  const [y, m, dd] = fecha.split('-').map(Number);
  const venceCC = sumarDias(new Date(y, m - 1, dd), 30);

  const emitir = async () => {
    setEstado('pidiendo');
    setError(undefined);
    try {
      const cae = await solicitarCAE({ letra, clase: 'factura', puntoVenta: datos.empresa.puntoVenta, numero, total: t.total }, { simularFalla: falla });
      const r = ejecutar((d) => emitirFactura(d, pedido.id, { ...cae, letra, condicionVenta: condicion, fecha: `${fecha}T${new Date().toTimeString().slice(0, 8)}` }));
      setEmitido(r.comprobante);
      setEstado('ok');
      const saldo = der.cuentas.get(cliente.id)!.saldo + r.comprobante.total;
      toast.success(
        `${nombreComprobante(r.comprobante)} emitida`,
        `Se sumó ${formatARS(r.comprobante.total)} a la cuenta corriente de ${cliente.razonSocial} (saldo: ${formatARS(saldo)}) y se descontaron ${r.unidades} unidades del stock.`,
      );
      if (r.faltantes.length) {
        toast.show({
          tone: 'warning',
          title: `Se facturó con stock insuficiente`,
          description: `${r.faltantes.map((p) => `${p.nombre} quedó en ${p.stock} ${p.unidad}`).join(' · ')}. Generá la orden de compra para reponer.`,
          action: { label: 'Ver compras', onClick: () => navigate('/compras') },
        });
      }
      if (r.quedaronBajos.length) {
        toast.show({
          tone: 'warning',
          title: `${r.quedaronBajos.length} ${r.quedaronBajos.length === 1 ? 'producto quedó' : 'productos quedaron'} bajo el mínimo`,
          description: r.quedaronBajos.map((p) => `${p.nombre}: ${p.stock} ${p.unidad} (mín. ${p.stockMinimo})`).join(' · '),
          action: { label: 'Ver stock', onClick: () => navigate('/stock') },
        });
      }
    } catch (e) {
      setEstado('error');
      setError(e instanceof ArcaError ? e.detalle : 'Error desconocido');
      toast.error('La factura no se emitió', 'ARCA no respondió a tiempo. No se generó número ni CAE, así que no hay nada que anular.');
    }
  };

  const plantilla = datos.plantillas.find((p) => p.uso === 'factura')!;

  return (
    <Page title={comprobante ? nombreComprobante(comprobante) : 'Emitir factura'} overline={`Facturación · Pedido ${pedido.numero}`}>
      <Alert tone="success" title="Conectado con ARCA (simulado)">
        Punto de venta {pad(datos.empresa.puntoVenta).padStart(4, '0')} (Web Services) · último autorizado FC A {numeroFiscal(datos.empresa.puntoVenta, ultimoA)} · los CAE de la demo son ficticios.
      </Alert>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-[3_1_560px] flex-col gap-4">
          <Card className="flex flex-col gap-5">
            <SectionTitle overline="Comprobante" title="Tipo de comprobante" />
            <div role="radiogroup" aria-label="Tipo de factura" className="flex flex-wrap gap-2.5">
              {(['A', 'B', 'C'] as LetraComprobante[]).map((l) => {
                const deshabilitada = l === 'C' || !!comprobante;
                const on = letra === l;
                const sub = l === 'A' ? (sugerida === 'A' ? `Sugerida: cliente ${cliente.condicionIVA === 'RI' ? 'Resp. Inscripto' : 'Monotributo'}` : 'Resp. Inscripto o Monotributo') : l === 'B' ? (sugerida === 'B' ? 'Sugerida: consumidor final o exento' : 'Consumidor final o exento') : 'Solo emisores monotributistas';
                return (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={deshabilitada && !on}
                    onClick={() => setLetra(l)}
                    className={cn(
                      'flex min-h-16 flex-[1_1_160px] items-center gap-3 rounded-sm border bg-superficie px-3.5 py-3 text-left',
                      on ? 'border-2 border-bold-red bg-rojo-50' : 'border-neutro-500 hover:border-ink-black',
                      'disabled:cursor-not-allowed disabled:border-neutro-300 disabled:bg-neutro-100 disabled:text-neutro-700',
                    )}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-current text-[18px] font-bold">{l}</span>
                    <span><span className="block text-body font-semibold">Factura {l}</span><span className="block text-caption text-texto-secundario">{sub}</span></span>
                  </button>
                );
              })}
            </div>
            {letra !== sugerida && !comprobante && (
              <Alert tone="warning" title={`Para este cliente corresponde factura ${sugerida}`}>
                {cliente.razonSocial} es {CONDICION_IVA[cliente.condicionIVA]}. Emitir otra letra puede generar un rechazo de ARCA.
              </Alert>
            )}
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              <Select label="Punto de venta" value="pv" disabled options={[{ value: 'pv', label: `${String(datos.empresa.puntoVenta).padStart(4, '0')} · Web Services` }]} />
              <DateInput label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={!!comprobante} />
              <Select label="Concepto" value="productos" disabled options={[{ value: 'productos', label: 'Productos' }]} />
              <Select
                label="Condición de venta"
                value={condicion}
                disabled={!!comprobante}
                onChange={(e) => setCondicion(e.target.value as typeof condicion)}
                options={[{ value: 'cta_cte_30', label: 'Cuenta corriente 30 días' }, { value: 'contado', label: 'Contado' }]}
                helper={condicion === 'cta_cte_30' ? `Vence el ${formatFecha(venceCC)}` : 'Se cobra al entregar'}
              />
            </div>
          </Card>

          <Card>
            <SectionTitle overline="Receptor" title={cliente.razonSocial} action={<Badge tone="success" icon="check">Datos del padrón (simulado)</Badge>} />
            <DatosLista className="mt-4" items={[
              ['CUIT', formatCUIT(cliente.cuit)],
              ['Condición frente al IVA', CONDICION_IVA[cliente.condicionIVA]],
              ['Domicilio', `${cliente.direccion}, ${cliente.localidad}`],
              ['Origen', <span key="o"><Link className="dl-link" to={`/pedidos/${pedido.id}`}>{pedido.numero}</Link>{pedido.remito ? ` · remito ${pedido.remito.numero}` : ''}</span>],
            ]} />
          </Card>

          <DataTable
            overline={`Desde el pedido ${pedido.numero}`}
            title="Detalle"
            rows={pedido.renglones}
            rowKey={(r) => r.id}
            pagination={false}
            columns={[
              { key: 'c', label: 'Cant.', align: 'right', render: (r) => r.cantidad },
              { key: 'd', label: 'Producto', render: (r) => <span>{r.descripcion}<span className="dl-sub">{der.productoPorId.get(r.productoId ?? '')?.codigo}</span></span> },
              { key: 'u', label: 'P. unit. neto', align: 'right', render: (r) => formatARS(precioConLista(r.precioUnitario, pedido.descuentoPct)) },
              { key: 's', label: 'Subtotal', align: 'right', render: (r) => formatARS(subtotalRenglon({ cantidad: r.cantidad, precioUnitario: precioConLista(r.precioUnitario, pedido.descuentoPct) })) },
            ]}
          />

          <Card className="flex justify-end">
            <dl className="m-0 grid w-full max-w-[360px] grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-body">
              <dt className="text-texto-secundario">Neto gravado {datos.ajustes.ivaPct} %</dt><dd className="m-0 text-right tabular">{formatARS(t.neto)}</dd>
              <dt className="text-texto-secundario">IVA {datos.ajustes.ivaPct} %</dt><dd className="m-0 text-right tabular">{formatARS(t.iva)}</dd>
              <dt className="border-t border-ink-black pt-2.5 text-h3 font-semibold">Total</dt><dd className="m-0 border-t border-ink-black pt-1.5 text-right text-[24px] font-bold leading-8 tabular">{formatARS(t.total)}</dd>
            </dl>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-[2_1_380px] flex-col gap-4">
          {!comprobante && estado !== 'error' && (
            <Card className="flex flex-col gap-4" aria-label="Emitir">
              <SectionTitle overline="ARCA" title="Solicitar CAE" />
              <p className="m-0 text-body">Se pide el CAE para la <strong>Factura {letra} {numeroFiscal(datos.empresa.puntoVenta, numero)}</strong> por <strong className="tabular">{formatARS(t.total)}</strong>.</p>
              <Button icon="receipt" loading={estado === 'pidiendo'} onClick={emitir}>{estado === 'pidiendo' ? 'Esperando a ARCA…' : 'Emitir factura'}</Button>
              <p className="m-0 text-body-small text-texto-secundario">Al emitir: se suma a la cuenta corriente del cliente y se descuenta el stock del pedido.</p>
              <div className="rounded-sm border border-dashed border-arena-500 p-3">
                <Switch checked={falla} onChange={setFalla} disabled={estado === 'pidiendo'}>Simular que ARCA no responde</Switch>
                <p className="m-0 mt-1 text-caption text-texto-secundario">Para ver cómo avisa el sistema cuando el servicio falla.</p>
              </div>
            </Card>
          )}

          {estado === 'error' && !comprobante && (
            <Card className="flex flex-col gap-4" aria-label="Error al emitir">
              <Alert tone="error" title="La factura no se emitió">ARCA no respondió a tiempo. No se generó número ni CAE, así que no hay nada que anular. El pedido sigue pendiente de facturar.</Alert>
              <div className="rounded-sm bg-neutro-100 px-3 py-2 text-caption text-texto-secundario tabular">{error}</div>
              <div className="flex flex-wrap gap-2">
                <Button icon="refresh" onClick={() => { setFalla(false); emitir(); }}>Reintentar</Button>
                <ButtonLink to={`/pedidos/${pedido.id}`} variant="secondary">Volver al pedido</ButtonLink>
              </div>
              <p className="m-0 text-caption text-texto-secundario">En el sistema real, si sigue fallando, se reintenta cada 5 minutos y te avisa.</p>
            </Card>
          )}

          {comprobante && (
            <Card className="flex flex-col gap-4" aria-label="Factura emitida">
              <Alert tone="success" title={`${nombreComprobante(comprobante)} autorizada`}>Quedó imputada en la cuenta corriente del cliente y se descontó el stock.</Alert>
              <dl className="m-0 grid grid-cols-2 gap-3 rounded-sm bg-arena-100 p-4">
                <div><dt className="text-overline uppercase text-texto-secundario">CAE</dt><dd className="m-0 mt-1 text-h3 tabular">{comprobante.cae}</dd></div>
                <div><dt className="text-overline uppercase text-texto-secundario">Vencimiento CAE</dt><dd className="m-0 mt-1 text-h3 tabular">{formatFecha(comprobante.caeVence)}</dd></div>
              </dl>
              <Button icon="send" onClick={() => setEnviar(true)}>Enviar por WhatsApp</Button>
              <div className="flex flex-wrap gap-2">
                <BotonPDF nombre={nombreComprobante(comprobante)} generar={() => pdfComprobante(datosActuales(), comprobante)} />
                <ButtonLink to={`/cuentas/${cliente.id}`} variant="secondary" icon="wallet">Cuenta corriente</ButtonLink>
              </div>
              <Link to={`/pedidos/${pedido.id}`} className="dl-link inline-flex items-center gap-1 text-body-small">Siguiente paso: la entrega del pedido {pedido.numero}<Icon name="arrow-right" size={16} /></Link>
            </Card>
          )}

          {/* Vista previa del comprobante */}
          <section aria-label="Vista previa del comprobante" className="rounded-sm border border-borde bg-superficie p-6 shadow-2">
            <div className="flex items-center justify-between gap-3 border-b-2 border-ink-black pb-3.5">
              <img src="/brand/dalama-logo.png" alt="DALAMA · Accesorios para aberturas" className="w-[130px]" />
              <div className="flex flex-col items-center gap-0.5"><span className="grid h-10 w-10 place-items-center border-2 border-ink-black text-[20px] font-bold">{letra}</span><span className="text-[9px] text-texto-secundario">COD. {letra === 'A' ? '01' : letra === 'B' ? '06' : '11'}</span></div>
              <div className="text-right"><div className="text-[12px] font-bold tracking-[0.12em]">FACTURA</div><div className="text-[11px] tabular">N.° {numeroFiscal(datos.empresa.puntoVenta, numero)}</div><div className="text-[11px] text-texto-secundario tabular">{formatFecha(new Date(y, m - 1, dd))}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-b border-arena-100 py-3 text-[10px] leading-[15px] text-texto-secundario">
              <div><strong className="text-texto">{datos.empresa.razonSocial}</strong><br />CUIT {formatCUIT(datos.empresa.cuit)} · IVA Resp. Inscripto<br />{datos.empresa.domicilio}</div>
              <div><strong className="text-texto">{cliente.razonSocial}</strong><br />CUIT {formatCUIT(cliente.cuit)}<br />{condicion === 'cta_cte_30' ? 'Cta. cte. 30 días' : 'Contado'}</div>
            </div>
            <div className="py-2 text-[10px]">
              {pedido.renglones.slice(0, 6).map((r) => (
                <div key={r.id} className="flex justify-between gap-2.5 border-b border-arena-50 py-1"><span>{r.cantidad} × {r.descripcion}</span><span className="tabular">{formatARS(subtotalRenglon({ cantidad: r.cantidad, precioUnitario: precioConLista(r.precioUnitario, pedido.descuentoPct) }))}</span></div>
              ))}
              {pedido.renglones.length > 6 && <div className="py-1 text-texto-secundario">y {pedido.renglones.length - 6} renglones más</div>}
            </div>
            <div className="flex items-baseline justify-end gap-4 pt-1.5 text-[11px]"><span className="text-texto-secundario tabular">Neto {formatARS(t.neto)} · IVA {formatARS(t.iva)}</span><strong className="text-[13px] tabular">Total {formatARS(t.total)}</strong></div>
            <div className="mt-3.5 flex items-center gap-3 border-t border-arena-100 pt-3">
              <div className={cn('h-11 w-11 shrink-0', comprobante ? 'bg-[repeating-linear-gradient(90deg,#111_0_3px,#fff_3px_5px),repeating-linear-gradient(0deg,#111_0_3px,#fff_3px_6px)] bg-blend-multiply' : 'border border-dashed border-neutro-300')} aria-hidden="true" />
              <div className="text-[10px] leading-4">{comprobante ? `CAE ${comprobante.cae} · vence el ${formatFecha(comprobante.caeVence)}` : 'CAE pendiente'}<br /><span className="text-texto-secundario">{comprobante ? `Autorizado ${formatHora(comprobante.fecha)} · ARCA (simulado)` : 'Se completa al emitir'}</span></div>
              <span className="ml-auto h-[3px] w-6 self-end bg-rojo-dalama" aria-hidden="true" />
            </div>
          </section>
        </aside>
      </div>

      {comprobante && (
        <EnviarWhatsApp
          open={enviar}
          onClose={() => setEnviar(false)}
          titulo={`Enviar ${nombreComprobante(comprobante)}`}
          destinatario={`${cliente.contacto} · ${cliente.razonSocial}`}
          telefono={cliente.telefono}
          adjunto={`${nombreComprobante(comprobante)}.pdf`}
          textoInicial={completarPlantilla(plantilla.cuerpo, { contacto: cliente.contacto.split(' ')[0], comprobante: nombreComprobante(comprobante), total: formatARS(comprobante.total), vence: formatFecha(comprobante.vencePago), alias: datos.empresa.alias })}
          onEnviado={(texto) => {
            setEnviar(false);
            ejecutar((d) => enviarDocumento(d, cliente.id, texto, { tipo: 'factura', id: comprobante.id, nombre: `${nombreComprobante(comprobante)}.pdf` }));
            toast.success('Factura enviada', `${cliente.razonSocial} la recibió por WhatsApp. Quedó en la conversación de la bandeja.`);
          }}
        />
      )}
    </Page>
  );
}
