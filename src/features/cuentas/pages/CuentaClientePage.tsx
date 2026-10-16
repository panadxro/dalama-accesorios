import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, Card, DataTable, KpiCard, SectionTitle, Select, StatusBadge, Tabs, Textarea, toast } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { EnviarWhatsApp } from '@/components/negocio/EnviarWhatsApp';
import { CONDICION_IVA_CORTA, TIPO_CLIENTE, codigoComprobante, completarPlantilla, cuentaCorriente } from '@/domain/calculos';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatCUIT, formatFecha, formatPct } from '@/lib/format';
import { useEsEscritorio } from '@/lib/useMedia';
import { ejecutar, enviarDocumento } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';
import { RegistrarCobro } from '../RegistrarCobro';
import { Sheet } from '@/components/ui/Dialog';

type Vista = 'mov' | 'pendientes' | 'cheques';

const ESTADO_CHEQUE = { en_cartera: ['info', 'En cartera'], depositado: ['success', 'Depositado'], endosado: ['neutral', 'Endosado'], rechazado: ['error', 'Rechazado'] } as const;

export default function CuentaClientePage() {
  const { clienteId } = useParams();
  const [params] = useSearchParams();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const escritorio = useEsEscritorio();
  const [vista, setVista] = useState<Vista>('mov');
  const [cobroMovil, setCobroMovil] = useState(!!params.get('cobrar'));
  const [recordar, setRecordar] = useState(false);
  const cliente = clienteId ? der.clientePorId.get(clienteId) : undefined;

  const movimientos = useMemo(() => (cliente ? cuentaCorriente(cliente.id, datos, der.pendientes).reverse() : []), [cliente, datos, der.pendientes]);

  const promedioPago = useMemo(() => {
    if (!cliente) return 0;
    const dias: number[] = [];
    for (const cb of datos.cobros.filter((x) => x.clienteId === cliente.id)) {
      for (const i of cb.imputaciones) {
        const f = datos.comprobantes.find((c) => c.id === i.comprobanteId);
        if (f) dias.push(diasEntre(f.fecha, cb.fecha));
      }
    }
    return dias.length ? Math.round(dias.reduce((a, b) => a + b, 0) / dias.length) : 0;
  }, [cliente, datos.cobros, datos.comprobantes]);

  const plantillasDeuda = datos.plantillas.filter((p) => p.uso === 'recordatorio_deuda');
  const [plantillaId, setPlantillaId] = useState(plantillasDeuda[0]?.id);

  if (!cliente) {
    return (
      <Page title="Cuenta corriente" overline="Administración · Cobranzas">
        <Card className="p-0"><EmptyState icon="wallet" title="No encontramos este cliente" action={<ButtonLink to="/cuentas" variant="primary">Ver cuentas corrientes</ButtonLink>} /></Card>
      </Page>
    );
  }

  const cuenta = der.cuentas.get(cliente.id)!;
  const lista = datos.listas.find((l) => l.id === cliente.listaId);
  const cheques = datos.cheques.filter((c) => c.clienteId === cliente.id).sort((a, b) => b.cobroEl.localeCompare(a.cobroEl));
  const pendientes = movimientos.filter((m) => m.tipo === 'factura' && (m.pendiente ?? 0) > 0);
  const usado = cliente.limiteCredito ? (Math.max(0, cuenta.saldo) / cliente.limiteCredito) * 100 : 0;
  const ultimaFactura = movimientos.find((m) => m.tipo === 'factura');
  const a = cuenta.antiguedad;
  const totalAnt = a.d0_30 + a.d31_60 + a.d61_90 + a.d90;

  const textoRecordatorio = completarPlantilla(datos.plantillas.find((p) => p.id === plantillaId)?.cuerpo ?? '', {
    contacto: cliente.contacto.split(' ')[0],
    cantidad: `${cuenta.facturasVencidas.length} ${cuenta.facturasVencidas.length === 1 ? 'factura' : 'facturas'}`,
    deuda: formatARS(cuenta.vencido),
    comprobantes: cuenta.facturasVencidas.map((f) => codigoComprobante(f).replace(/^FC /, '')).join(' y '),
    alias: datos.empresa.alias,
  });

  const formCobro = <RegistrarCobro key={cliente.id} cliente={cliente} preseleccion={params.get('cobrar') ?? undefined} onListo={() => setCobroMovil(false)} />;

  return (
    <Page title={cliente.razonSocial} overline="Administración · Cuenta corriente">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge>{TIPO_CLIENTE[cliente.tipo]}</Badge>
          <Badge>{`CUIT ${formatCUIT(cliente.cuit)}`}</Badge>
          <Badge>{CONDICION_IVA_CORTA[cliente.condicionIVA]}</Badge>
          {lista && lista.descuentoPct > 0 && <Badge>{`${lista.nombre} −${lista.descuentoPct} %`}</Badge>}
          <Badge>{cliente.condicionVenta === 'cta_cte_30' ? 'Cta. cte. 30 días' : 'Contado'}</Badge>
          {cuenta.vencido > 0 ? <StatusBadge status="deuda-vencida" /> : <StatusBadge status="pagado">Al día</StatusBadge>}
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to={`/clientes/${cliente.id}`} variant="tertiary" icon="user">Ficha del cliente</ButtonLink>
          {cuenta.vencido > 0 && <Button variant="secondary" icon="send" onClick={() => setRecordar(true)}>Recordar deuda</Button>}
          {!escritorio && <Button icon="wallet" onClick={() => setCobroMovil(true)}>Registrar cobro</Button>}
        </div>
      </div>

      <section aria-label="Resumen de cuenta" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Saldo total" value={formatARSKpi(cuenta.saldo)} icon="wallet" trend="flat" delta={ultimaFactura ? formatARS(ultimaFactura.debe) : 'Sin facturas'} deltaLabel={ultimaFactura ? `última factura, del ${formatFecha(ultimaFactura.fecha)}` : ''} />
        <KpiCard label="Vencido" value={formatARSKpi(cuenta.vencido)} icon="alert-triangle" trend={cuenta.vencido ? 'up' : 'flat'} positive={false} delta={`${cuenta.facturasVencidas.length} ${cuenta.facturasVencidas.length === 1 ? 'factura' : 'facturas'}`} deltaLabel={cuenta.vencido ? `la más atrasada, ${cuenta.diasMayorAtraso} días` : 'sin atrasos'} />
        <KpiCard label="Límite de crédito usado" value={cliente.limiteCredito ? formatPct(usado, 0) : '—'} icon="chart" trend={usado > 90 ? 'up' : 'flat'} positive={false} delta={cliente.limiteCredito ? formatARS(Math.max(0, cliente.limiteCredito - Math.max(0, cuenta.saldo))) : 'Contado'} deltaLabel={cliente.limiteCredito ? `disponible de ${formatARS(cliente.limiteCredito)}` : 'sin cuenta corriente'} />
        <KpiCard label="Paga en promedio" value={promedioPago ? `${promedioPago} días` : '—'} icon="clock" trend={promedioPago > 30 ? 'up' : 'flat'} positive={false} delta={promedioPago > 30 ? `${promedioPago - 30} días` : 'Dentro del plazo'} deltaLabel={promedioPago > 30 ? 'más que el plazo pactado' : cliente.condicionVenta === 'cta_cte_30' ? 'pactado: 30 días' : ''} />
      </section>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-[3_1_620px] flex-col gap-4">
          <Card>
            <SectionTitle overline="Cobranzas" title="Antigüedad de la deuda" action={<span className="text-body-small text-texto-secundario">Días desde la emisión</span>} />
            {totalAnt > 0 ? (
              <div role="img" aria-label={`0 a 30 días ${formatARS(a.d0_30)}; 31 a 60 días ${formatARS(a.d31_60)}; 61 a 90 días ${formatARS(a.d61_90)}; más de 90 días ${formatARS(a.d90)}`} className="mt-5 flex h-4 gap-0.5 overflow-hidden rounded-[2px]">
                {a.d0_30 > 0 && <div style={{ flex: a.d0_30 }} className="bg-neutro-700" />}
                {a.d31_60 > 0 && <div style={{ flex: a.d31_60 }} className="bg-advertencia" />}
                {a.d61_90 > 0 && <div style={{ flex: a.d61_90 }} className="bg-bold-red" />}
                {a.d90 > 0 && <div style={{ flex: a.d90 }} className="bg-dark-brick" />}
              </div>
            ) : <p className="m-0 mt-4 text-body text-texto-secundario">No tiene facturas pendientes.</p>}
            <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
              {([
                ['0 – 30 días', a.d0_30, 'bg-neutro-700', 'A vencer', 'text-texto-secundario'],
                ['31 – 60 días', a.d31_60, 'bg-advertencia', 'Vencida', 'font-semibold text-advertencia-texto'],
                ['61 – 90 días', a.d61_90, 'bg-bold-red', 'Vencida · crítica', 'font-semibold text-error'],
                ['Más de 90 días', a.d90, 'bg-dark-brick', 'Para gestión', 'font-semibold text-error'],
              ] as const).map(([t, v, c, e, ec]) => (
                <div key={t}>
                  <div className="flex items-center gap-2 text-caption font-semibold"><span className={`h-2.5 w-2.5 ${c}`} />{t}</div>
                  <div className="mt-1 text-h3 tabular">{formatARS(v)}</div>
                  <div className={`text-caption ${v ? ec : 'text-texto-secundario'}`}>{v ? e : 'Sin deuda'}</div>
                </div>
              ))}
            </div>
          </Card>

          <Tabs<Vista> label="Historial del cliente" value={vista} onChange={setVista} tabs={[{ id: 'mov', label: 'Movimientos', count: movimientos.length }, { id: 'pendientes', label: 'Facturas pendientes', count: pendientes.length }, { id: 'cheques', label: 'Cheques', count: cheques.length }]} />
          {vista === 'mov' && (
            <DataTable
              overline="Cuenta corriente"
              title="Movimientos"
              rows={movimientos}
              rowKey={(m) => m.id}
              pageSize={10}
              columns={[
                { key: 'f', label: 'Fecha', render: (m) => <span className="tabular">{formatFecha(m.fecha)}</span> },
                { key: 'd', label: 'Comprobante', render: (m) => (m.ruta ? <Link to={m.ruta} className="hover:text-bold-red">{m.descripcion}</Link> : m.descripcion) },
                { key: 'debe', label: 'Debe', align: 'right', render: (m) => (m.debe ? formatARS(m.debe) : '') },
                { key: 'haber', label: 'Haber', align: 'right', render: (m) => (m.haber ? formatARS(m.haber) : '') },
                { key: 'saldo', label: 'Saldo', align: 'right', render: (m) => <strong>{formatARS(m.saldo)}</strong> },
              ]}
              emptyIcon="wallet"
              emptyTitle="Sin movimientos"
              emptyText="Las facturas, notas de crédito y cobros del cliente aparecen acá."
            />
          )}
          {vista === 'pendientes' && (
            <DataTable
              overline="Para cobrar"
              title="Facturas pendientes"
              rows={pendientes}
              rowKey={(m) => m.id}
              pagination={false}
              columns={[
                { key: 'd', label: 'Factura', render: (m) => <Link to={m.ruta!} className="hover:text-bold-red">{m.descripcion}</Link> },
                { key: 'f', label: 'Emitida', render: (m) => formatFecha(m.fecha) },
                { key: 'v', label: 'Vence', render: (m) => { const atraso = diasEntre(m.vence!, new Date()); return atraso > 0 ? <StatusBadge status="deuda-vencida">{`Vencida · ${atraso} días`}</StatusBadge> : formatFecha(m.vence!); } },
                { key: 'p', label: 'Pendiente', align: 'right', render: (m) => <strong>{formatARS(m.pendiente!)}</strong> },
              ]}
              emptyIcon="check-circle"
              emptyTitle="No debe nada"
              emptyText="Todas las facturas del cliente están cobradas."
            />
          )}
          {vista === 'cheques' && (
            <DataTable
              overline="Cartera"
              title="Cheques del cliente"
              rows={cheques}
              rowKey={(c) => c.id}
              pageSize={8}
              columns={[
                { key: 'b', label: 'Cheque', render: (c) => <span>{c.banco}<span className="dl-sub tabular">N.° {c.numero}{c.echeq ? ' · e-cheq' : ''}</span></span> },
                { key: 'f', label: 'Cobro', render: (c) => <span className="tabular">{formatFecha(c.cobroEl)}</span> },
                { key: 'i', label: 'Importe', align: 'right', render: (c) => formatARS(c.importe) },
                { key: 'e', label: 'Estado', render: (c) => <Badge tone={ESTADO_CHEQUE[c.estado][0]}>{ESTADO_CHEQUE[c.estado][1]}</Badge> },
              ]}
              emptyIcon="bank"
              emptyTitle="Sin cheques"
              emptyText="Los cheques que entregue el cliente aparecen acá."
            />
          )}
        </div>

        <aside className="flex min-w-0 flex-[2_1_380px] flex-col gap-4">
          {escritorio && (
            <Card className="flex flex-col gap-4" aria-label="Registrar cobro">
              <SectionTitle overline="Cobranzas" title="Registrar cobro" />
              {formCobro}
            </Card>
          )}
          {cuenta.vencido > 0 && (
            <Card className="flex flex-col gap-3.5" aria-label="Recordatorio de deuda">
              <SectionTitle overline="WhatsApp" title="Recordatorio de deuda" />
              <Select label="Plantilla" value={plantillaId} onChange={(e) => setPlantillaId(e.target.value)} options={plantillasDeuda.map((p) => ({ value: p.id, label: p.nombre }))} />
              <Textarea label="Mensaje" value={textoRecordatorio} readOnly rows={6} helper="Se completa solo con las facturas vencidas. Las plantillas se editan en Configuración." />
              <Button variant="secondary" icon="send" onClick={() => setRecordar(true)}>Enviar a {cliente.telefono}</Button>
            </Card>
          )}
        </aside>
      </div>

      {!escritorio && (
        <Sheet open={cobroMovil} onOpenChange={setCobroMovil} overline="Cobranzas" title="Registrar cobro">
          {formCobro}
        </Sheet>
      )}

      <EnviarWhatsApp
        open={recordar}
        onClose={() => setRecordar(false)}
        titulo="Recordatorio de deuda"
        destinatario={`${cliente.contacto} · ${cliente.razonSocial}`}
        telefono={cliente.telefono}
        textoInicial={textoRecordatorio}
        onEnviado={(texto) => {
          setRecordar(false);
          ejecutar((d) => enviarDocumento(d, cliente.id, texto, { tipo: 'estado_cuenta', id: cliente.id, nombre: `Estado de cuenta ${cliente.razonSocial}.pdf` }));
          toast.success('Recordatorio enviado', `${cliente.contacto.split(' ')[0]} recibió el detalle de ${formatARS(cuenta.vencido)} vencidos por WhatsApp. Quedó en la conversación de la bandeja.`);
        }}
      />
    </Page>
  );
}
