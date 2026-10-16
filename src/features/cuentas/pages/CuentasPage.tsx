import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Badge, Button, ButtonLink, Card, DataTable, KpiCard, SearchInput, SectionTitle, StatusBadge, Tabs, toast } from '@/components/ui';
import { Avatar } from '@/components/negocio/Datos';
import { EnviarWhatsApp } from '@/components/negocio/EnviarWhatsApp';
import { TIPO_CLIENTE, codigoComprobante, completarPlantilla } from '@/domain/calculos';
import type { Cliente } from '@/domain/types';
import { descargarCSV, pesos } from '@/lib/csv';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatFecha } from '@/lib/format';
import { ejecutar, enviarDocumento } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';
import { CobroRapido } from '../CobroRapido';

type Vista = 'saldo' | 'vencidos' | 'todos';

export default function CuentasPage() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [vista, setVista] = useState<Vista>('saldo');
  const [q, setQ] = useState('');
  const [cobrar, setCobrar] = useState<string | null>(null);
  const [recordar, setRecordar] = useState<Cliente | null>(null);

  const ultimoCobro = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of datos.cobros) if (!m.has(c.clienteId) || c.fecha > m.get(c.clienteId)!) m.set(c.clienteId, c.fecha);
    return m;
  }, [datos.cobros]);

  const totales = useMemo(() => {
    let saldo = 0; let vencido = 0;
    const ant = { d0_30: 0, d31_60: 0, d61_90: 0, d90: 0 };
    for (const r of der.cuentas.values()) {
      saldo += Math.max(0, r.saldo); vencido += r.vencido;
      ant.d0_30 += r.antiguedad.d0_30; ant.d31_60 += r.antiguedad.d31_60; ant.d61_90 += r.antiguedad.d61_90; ant.d90 += r.antiguedad.d90;
    }
    const hoy = der.hoy;
    const cobradoMes = datos.cobros.filter((c) => { const f = new Date(c.fecha); return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear(); }).reduce((a, c) => a + c.total, 0);
    const cartera = datos.cheques.filter((c) => c.estado === 'en_cartera');
    return { saldo, vencido, ant, cobradoMes, cartera };
  }, [der, datos.cobros, datos.cheques]);

  const filas = datos.clientes
    .map((c) => ({ c, r: der.cuentas.get(c.id)! }))
    .filter((x) => (vista === 'saldo' ? x.r.saldo > 0 : vista === 'vencidos' ? x.r.vencido > 0 : true))
    .filter((x) => !q.trim() || normalizar(`${x.c.razonSocial} ${x.c.contacto}`).includes(normalizar(q.trim())))
    .sort((a, b) => b.r.vencido - a.r.vencido || b.r.saldo - a.r.saldo);

  const plantilla = datos.plantillas.find((p) => p.uso === 'recordatorio_deuda')!;
  const textoDeuda = (c: Cliente) => {
    const r = der.cuentas.get(c.id)!;
    return completarPlantilla(plantilla.cuerpo, {
      contacto: c.contacto.split(' ')[0],
      cantidad: `${r.facturasVencidas.length} ${r.facturasVencidas.length === 1 ? 'factura' : 'facturas'}`,
      deuda: formatARS(r.vencido),
      comprobantes: r.facturasVencidas.map((f) => codigoComprobante(f).replace(/^FC /, '')).join(' y '),
      alias: datos.empresa.alias,
    });
  };

  const a = totales.ant;
  const totalAnt = a.d0_30 + a.d31_60 + a.d61_90 + a.d90;

  const exportar = () => {
    descargarCSV('cuentas-corrientes', ['Cliente', 'Tipo', 'Saldo', 'Vencido', 'Días de atraso', '0-30', '31-60', '61-90', '+90', 'Último cobro'],
      filas.map(({ c, r }) => [c.razonSocial, TIPO_CLIENTE[c.tipo], pesos(r.saldo), pesos(r.vencido), r.diasMayorAtraso || '', pesos(r.antiguedad.d0_30), pesos(r.antiguedad.d31_60), pesos(r.antiguedad.d61_90), pesos(r.antiguedad.d90), ultimoCobro.get(c.id) ? formatFecha(ultimoCobro.get(c.id)!) : '']));
    toast.info('Planilla descargada', `${filas.length} cuentas exportadas en CSV.`);
  };

  return (
    <Page title="Cuentas corrientes" overline="Administración · Cobranzas">
      <PageActions overline="Saldos y cobranzas">
        <Button variant="secondary" icon="download" onClick={exportar}>Exportar a Excel</Button>
        <ButtonLink to="/cuentas/cheques" variant="secondary" icon="bank">Cartera de cheques</ButtonLink>
        <Button icon="wallet" onClick={() => setCobrar('')}>Registrar cobro</Button>
      </PageActions>

      <section aria-label="Indicadores" data-tour="cuentas" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Total a cobrar" value={formatARSKpi(totales.saldo)} icon="wallet" trend="flat" delta={`${datos.clientes.filter((c) => der.cuentas.get(c.id)!.saldo > 0).length} clientes`} deltaLabel="con saldo" />
        <KpiCard label="Vencido" value={formatARSKpi(totales.vencido)} icon="alert-triangle" trend="flat" delta={`${der.conDeudaVencida.length} clientes`} deltaLabel={`${formatARS(a.d61_90 + a.d90, { sinCentavos: true })} con más de 60 días`} />
        <KpiCard label="Cobrado este mes" value={formatARSKpi(totales.cobradoMes)} icon="check-circle" trend="flat" delta={`${datos.cobros.filter((c) => diasEntre(c.fecha, der.hoy) <= 30).length} recibos`} deltaLabel="en los últimos 30 días" />
        <KpiCard label="Cheques en cartera" value={formatARSKpi(totales.cartera.reduce((x, c) => x + c.importe, 0))} icon="bank" trend="flat" delta={`${totales.cartera.length} cheques`} deltaLabel={`${totales.cartera.filter((c) => diasEntre(der.hoy, c.cobroEl) <= 7).length} para depositar esta semana`} />
      </section>

      <Card>
        <SectionTitle overline="Cobranzas" title="Antigüedad de la deuda" action={<span className="text-body-small text-texto-secundario">Todos los clientes · días desde la emisión</span>} />
        {totalAnt > 0 && (
          <div role="img" aria-label={`0 a 30 días ${formatARS(a.d0_30)}; 31 a 60 ${formatARS(a.d31_60)}; 61 a 90 ${formatARS(a.d61_90)}; más de 90 ${formatARS(a.d90)}`} className="mt-5 flex h-4 gap-0.5 overflow-hidden rounded-[2px]">
            {a.d0_30 > 0 && <div style={{ flex: a.d0_30 }} className="bg-neutro-700" />}
            {a.d31_60 > 0 && <div style={{ flex: a.d31_60 }} className="bg-advertencia" />}
            {a.d61_90 > 0 && <div style={{ flex: a.d61_90 }} className="bg-bold-red" />}
            {a.d90 > 0 && <div style={{ flex: a.d90 }} className="bg-dark-brick" />}
          </div>
        )}
        <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
          {([['0 – 30 días', a.d0_30, 'bg-neutro-700', 'A vencer'], ['31 – 60 días', a.d31_60, 'bg-advertencia', 'Vencida'], ['61 – 90 días', a.d61_90, 'bg-bold-red', 'Vencida · crítica'], ['Más de 90 días', a.d90, 'bg-dark-brick', 'Para gestión']] as const).map(([t, v, c, e]) => (
            <div key={t}>
              <div className="flex items-center gap-2 text-caption font-semibold"><span className={`h-2.5 w-2.5 ${c}`} />{t}</div>
              <div className="mt-1 text-h3 tabular">{formatARS(v)}</div>
              <div className="text-caption text-texto-secundario">{v ? e : 'Sin deuda'}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Tabs<Vista> label="Filtrar cuentas" value={vista} onChange={setVista} tabs={[
            { id: 'saldo', label: 'Con saldo', count: datos.clientes.filter((c) => der.cuentas.get(c.id)!.saldo > 0).length },
            { id: 'vencidos', label: 'Con deuda vencida', count: der.conDeudaVencida.length },
            { id: 'todos', label: 'Todos', count: datos.clientes.length },
          ]} />
          <SearchInput label="Buscar cliente" hideLabel placeholder="Nombre o contacto" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-[280px]" />
        </div>
        <DataTable
          overline="Clientes"
          title="Saldos por cliente"
          rows={filas}
          rowKey={(x) => x.c.id}
          rowLabel={(x) => x.c.razonSocial}
          pageSize={12}
          columns={[
            { key: 'c', label: 'Cliente', render: ({ c }) => <Link to={`/cuentas/${c.id}`} className="flex items-center gap-3 hover:text-bold-red"><Avatar nombre={c.razonSocial} size={32} /><span><strong>{c.razonSocial}</strong><span className="dl-sub">{TIPO_CLIENTE[c.tipo]} · {c.condicionVenta === 'cta_cte_30' ? 'Cta. cte. 30 días' : 'Contado'}</span></span></Link> },
            { key: 's', label: 'Saldo', align: 'right', render: ({ r }) => <strong>{formatARS(r.saldo)}</strong> },
            { key: 'v', label: 'Vencido', align: 'right', render: ({ r }) => (r.vencido ? <span className="font-semibold text-error">{formatARS(r.vencido)}</span> : '—') },
            { key: 'a', label: 'Atraso', render: ({ r }) => (r.vencido ? <StatusBadge status="deuda-vencida">{`${r.diasMayorAtraso} días`}</StatusBadge> : <Badge tone="success" icon="check">Al día</Badge>) },
            { key: 'u', label: 'Último cobro', render: ({ c }) => { const u = ultimoCobro.get(c.id); return u ? <span className="tabular">{formatFecha(u)}</span> : '—'; } },
          ]}
          rowActions={({ c, r }) => [
            ...(r.vencido > 0 ? [{ label: 'Recordar deuda', icon: 'send' as const, onClick: () => setRecordar(c) }] : []),
            ...(r.saldo > 0 ? [{ label: 'Registrar cobro', icon: 'wallet' as const, onClick: () => setCobrar(c.id) }] : []),
            { label: 'Ver cuenta', icon: 'eye' as const, to: `/cuentas/${c.id}` },
          ]}
          emptyIcon="check-circle"
          emptyTitle={vista === 'vencidos' ? 'Ningún cliente tiene deuda vencida' : 'No hay cuentas con saldo'}
          emptyText="Cuando se emitan facturas en cuenta corriente, van a aparecer acá."
        />
      </div>

      <CobroRapido open={cobrar !== null} clienteId={cobrar || undefined} onClose={() => setCobrar(null)} />
      {recordar && (
        <EnviarWhatsApp
          open
          onClose={() => setRecordar(null)}
          titulo="Recordatorio de deuda"
          destinatario={`${recordar.contacto} · ${recordar.razonSocial}`}
          telefono={recordar.telefono}
          textoInicial={textoDeuda(recordar)}
          onEnviado={(texto) => {
            ejecutar((d) => enviarDocumento(d, recordar.id, texto, { tipo: 'estado_cuenta', id: recordar.id, nombre: `Estado de cuenta ${recordar.razonSocial}.pdf` }));
            toast.success('Recordatorio enviado', `${recordar.razonSocial} recibió el detalle de lo vencido por WhatsApp.`);
            setRecordar(null);
          }}
        />
      )}
    </Page>
  );
}
