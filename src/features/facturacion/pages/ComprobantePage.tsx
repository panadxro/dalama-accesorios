import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, Card, DataTable, Icon, SectionTitle, toast } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { BotonPDF } from '@/components/negocio/BotonPDF';
import { CobroBadge } from '@/components/negocio/Estados';
import { DatosLista } from '@/components/negocio/Datos';
import { EnviarWhatsApp } from '@/components/negocio/EnviarWhatsApp';
import { CONDICION_IVA, codigoComprobante, completarPlantilla, nombreComprobante, precioConLista, subtotalRenglon } from '@/domain/calculos';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatCUIT, formatFecha } from '@/lib/format';
import { pdfComprobante } from '@/services/pdf/documentos';
import { ejecutar, enviarDocumento } from '@/store/acciones';
import { datosActuales, useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';

export default function ComprobantePage() {
  const { id } = useParams();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [enviar, setEnviar] = useState(false);
  const c = datos.comprobantes.find((x) => x.id === id);

  if (!c) {
    return (
      <Page title="Comprobante" overline="Facturación">
        <Card className="p-0"><EmptyState icon="receipt" title="No encontramos este comprobante" text="Puede que se haya borrado al reiniciar la demo." action={<ButtonLink to="/facturacion" variant="primary">Ver comprobantes</ButtonLink>} /></Card>
      </Page>
    );
  }

  const cliente = der.clientePorId.get(c.clienteId)!;
  const pedido = c.pedidoId ? datos.pedidos.find((p) => p.id === c.pedidoId) : undefined;
  const asociado = c.asociadoId ? datos.comprobantes.find((x) => x.id === c.asociadoId) : undefined;
  const notas = datos.comprobantes.filter((x) => x.asociadoId === c.id);
  const pendiente = c.clase === 'factura' ? der.pendientes.get(c.id) ?? 0 : 0;
  const cobros = datos.cobros.filter((cb) => cb.imputaciones.some((i) => i.comprobanteId === c.id));
  const plantilla = datos.plantillas.find((p) => p.uso === 'factura')!;

  return (
    <Page title={nombreComprobante(c)} overline={`Facturación · ${cliente.razonSocial}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/facturacion" className="dl-link inline-flex items-center gap-1 text-body-small"><Icon name="arrow-left" size={16} />Todos los comprobantes</Link>
        <div className="flex flex-wrap gap-2">
          <BotonPDF nombre={nombreComprobante(c)} generar={() => pdfComprobante(datosActuales(), c)} />
          <Button icon="send" onClick={() => setEnviar(true)}>Enviar por WhatsApp</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-[3_1_560px] flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <SectionTitle
              overline={c.clase === 'factura' ? 'Factura electrónica' : 'Nota de crédito'}
              title={codigoComprobante(c)}
              action={c.clase === 'factura' ? <CobroBadge pendiente={pendiente} total={c.total} vencida={diasEntre(c.vencePago, der.hoy) > 0} /> : <Badge tone="info" icon="undo">Crédito a favor</Badge>}
            />
            <DatosLista items={[
              ['Fecha', formatFecha(c.fecha)],
              ['CAE', <span key="cae" className="tabular">{c.cae}</span>],
              ['Vence el CAE', formatFecha(c.caeVence)],
              ['Condición', c.condicionVenta === 'cta_cte_30' ? 'Cta. cte. 30 días' : 'Contado'],
              ...(c.clase === 'factura' ? [['Vence el pago', formatFecha(c.vencePago)] as [string, string]] : []),
              ...(pedido ? [['Pedido', <Link key="p" className="dl-link" to={`/pedidos/${pedido.id}`}>{pedido.numero}</Link>] as [string, ReactNode]] : []),
              ...(asociado ? [['Asociada a', <Link key="a" className="dl-link" to={`/facturacion/${asociado.id}`}>{codigoComprobante(asociado)}</Link>] as [string, ReactNode]] : []),
              ...(c.motivo ? [['Motivo', c.motivo] as [string, string]] : []),
            ]} />
          </Card>

          <DataTable
            overline="Detalle"
            title="Productos"
            rows={c.renglones}
            rowKey={(r) => r.id}
            pagination={false}
            columns={[
              { key: 'c', label: 'Cant.', align: 'right', render: (r) => r.cantidad },
              { key: 'd', label: 'Producto', render: (r) => <span>{r.descripcion}<span className="dl-sub">{der.productoPorId.get(r.productoId ?? '')?.codigo}</span></span> },
              { key: 'u', label: 'P. unit. neto', align: 'right', render: (r) => formatARS(precioConLista(r.precioUnitario, c.descuentoPct)) },
              { key: 's', label: 'Subtotal', align: 'right', render: (r) => formatARS(subtotalRenglon({ cantidad: r.cantidad, precioUnitario: precioConLista(r.precioUnitario, c.descuentoPct) })) },
            ]}
          />

          <Card className="flex justify-end">
            <dl className="m-0 grid w-full max-w-[360px] grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-body">
              <dt className="text-texto-secundario">Neto gravado</dt><dd className="m-0 text-right tabular">{formatARS(c.neto)}</dd>
              <dt className="text-texto-secundario">IVA {datos.ajustes.ivaPct} %</dt><dd className="m-0 text-right tabular">{formatARS(c.iva)}</dd>
              <dt className="border-t border-ink-black pt-2.5 text-h3 font-semibold">Total</dt><dd className="m-0 border-t border-ink-black pt-1.5 text-right text-[24px] font-bold leading-8 tabular">{formatARS(c.total)}</dd>
            </dl>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-[2_1_340px] flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <SectionTitle overline="Receptor" title={cliente.razonSocial} action={<ButtonLink to={`/cuentas/${cliente.id}`} variant="secondary" size="s" icon="wallet">Cuenta</ButtonLink>} />
            <DatosLista columnas={2} items={[['CUIT', formatCUIT(cliente.cuit)], ['IVA', CONDICION_IVA[cliente.condicionIVA]]]} />
          </Card>
          {c.clase === 'factura' && (
            <Card className="flex flex-col gap-3">
              <SectionTitle overline="Cobranza" title={pendiente > 0 ? `Falta cobrar ${formatARS(pendiente)}` : 'Cobrada'} />
              {cobros.length === 0 && notas.length === 0 ? (
                <p className="m-0 text-body-small text-texto-secundario">Todavía no se registraron cobros para esta factura.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col p-0">
                  {cobros.map((cb) => (
                    <li key={cb.id} className="flex justify-between gap-2 border-b border-arena-100 py-2 text-body-small last:border-0">
                      <span>Recibo {cb.numero} · {formatFecha(cb.fecha)}</span>
                      <span className="font-semibold tabular">{formatARS(cb.imputaciones.find((i) => i.comprobanteId === c.id)!.importe)}</span>
                    </li>
                  ))}
                  {notas.map((n) => (
                    <li key={n.id} className="flex justify-between gap-2 border-b border-arena-100 py-2 text-body-small last:border-0">
                      <Link to={`/facturacion/${n.id}`} className="dl-link">{codigoComprobante(n)}</Link>
                      <span className="font-semibold tabular">{formatARS(n.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {pendiente > 0 && <ButtonLink to={`/cuentas/${cliente.id}?cobrar=${c.id}`} variant="primary" icon="wallet">Registrar cobro</ButtonLink>}
            </Card>
          )}
        </aside>
      </div>

      <EnviarWhatsApp
        open={enviar}
        onClose={() => setEnviar(false)}
        titulo={`Enviar ${nombreComprobante(c)}`}
        destinatario={`${cliente.contacto} · ${cliente.razonSocial}`}
        telefono={cliente.telefono}
        adjunto={`${nombreComprobante(c)}.pdf`}
        textoInicial={completarPlantilla(plantilla.cuerpo, { contacto: cliente.contacto.split(' ')[0], comprobante: nombreComprobante(c), total: formatARS(c.total), vence: formatFecha(c.vencePago), alias: datos.empresa.alias })}
        onEnviado={(texto) => {
          setEnviar(false);
          ejecutar((d) => enviarDocumento(d, cliente.id, texto, { tipo: 'factura', id: c.id, nombre: `${nombreComprobante(c)}.pdf` }));
          toast.success('Comprobante enviado', `${cliente.razonSocial} lo recibió por WhatsApp.`);
        }}
      />
    </Page>
  );
}
