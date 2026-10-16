import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Alert, Badge, Button, ConfirmModal, DataTable, KpiCard, Select, Tabs, toast, type BadgeTone } from '@/components/ui';
import type { Cheque, EstadoCheque } from '@/domain/types';
import { descargarCSV, pesos } from '@/lib/csv';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatFecha } from '@/lib/format';
import { cambiarEstadoCheque, ejecutar } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';

type Vista = 'cartera' | 'semana' | 'depositado' | 'endosado' | 'todos';

const ESTADO: Record<EstadoCheque, [BadgeTone, string]> = {
  en_cartera: ['info', 'En cartera'], depositado: ['success', 'Depositado'], endosado: ['neutral', 'Endosado'], rechazado: ['error', 'Rechazado'],
};

const CUENTA_DALAMA = 'Banco Galicia · cta. cte. DALAMA';

export default function ChequesPage() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const [vista, setVista] = useState<Vista>('cartera');
  const [accion, setAccion] = useState<{ cheque: Cheque; tipo: 'depositado' | 'endosado' } | null>(null);
  const [proveedor, setProveedor] = useState(datos.proveedores[0]?.razonSocial ?? '');

  const cartera = datos.cheques.filter((c) => c.estado === 'en_cartera');
  const semana = cartera.filter((c) => diasEntre(der.hoy, c.cobroEl) <= 7);
  const vencidosSinDepositar = cartera.filter((c) => diasEntre(c.cobroEl, der.hoy) > 0);
  const filtros: Record<Vista, (c: Cheque) => boolean> = {
    cartera: (c) => c.estado === 'en_cartera',
    semana: (c) => c.estado === 'en_cartera' && diasEntre(der.hoy, c.cobroEl) <= 7,
    depositado: (c) => c.estado === 'depositado',
    endosado: (c) => c.estado === 'endosado',
    todos: () => true,
  };
  const filas = datos.cheques.filter(filtros[vista]).sort((a, b) => (vista === 'cartera' || vista === 'semana' ? a.cobroEl.localeCompare(b.cobroEl) : b.cobroEl.localeCompare(a.cobroEl)));
  const suma = (l: Cheque[]) => l.reduce((a, c) => a + c.importe, 0);

  const exportar = () => {
    descargarCSV('cheques', ['Banco', 'Número', 'Librador', 'Importe', 'Fecha de cobro', 'Estado', 'e-cheq', 'Destino'], filas.map((c) => [c.banco, c.numero, c.librador, pesos(c.importe), formatFecha(c.cobroEl), ESTADO[c.estado][1], c.echeq ? 'Sí' : 'No', c.destino ?? '']));
    toast.info('Planilla descargada', `${filas.length} cheques exportados en CSV.`);
  };

  const confirmar = () => {
    if (!accion) return;
    const destino = accion.tipo === 'depositado' ? CUENTA_DALAMA : proveedor;
    ejecutar((d) => cambiarEstadoCheque(d, accion.cheque.id, accion.tipo, destino));
    toast.success(
      `Cheque ${accion.cheque.numero} ${accion.tipo}`,
      accion.tipo === 'depositado'
        ? `${formatARS(accion.cheque.importe)} en ${CUENTA_DALAMA}. Salió de la cartera.`
        : `Se entregó a ${proveedor} como pago por ${formatARS(accion.cheque.importe)}. Salió de la cartera.`,
    );
    setAccion(null);
  };

  return (
    <Page title="Cartera de cheques" overline="Administración · Cobranzas">
      <PageActions overline="Cheques recibidos de clientes">
        <Button variant="secondary" icon="download" onClick={exportar}>Exportar a Excel</Button>
      </PageActions>

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="En cartera" value={formatARSKpi(suma(cartera))} icon="bank" trend="flat" delta={`${cartera.length} cheques`} deltaLabel={`${cartera.filter((c) => c.echeq).length} e-cheq`} />
        <KpiCard label="Para depositar esta semana" value={formatARSKpi(suma(semana))} icon="calendar" trend="flat" delta={`${semana.length} cheques`} deltaLabel="vencen en 7 días o menos" />
        <KpiCard label="Próximos 30 días" value={formatARSKpi(suma(cartera.filter((c) => diasEntre(der.hoy, c.cobroEl) <= 30)))} icon="clock" trend="flat" delta="Diferidos" deltaLabel="flujo de fondos esperado" />
        <KpiCard label="Depositados" value={formatARSKpi(suma(datos.cheques.filter((c) => c.estado === 'depositado' && diasEntre(c.cobroEl, der.hoy) <= 30)))} icon="check-circle" trend="flat" delta="Últimos 30 días" deltaLabel={CUENTA_DALAMA} />
      </section>

      {vencidosSinDepositar.length > 0 && (
        <Alert tone="warning" title={`${vencidosSinDepositar.length} ${vencidosSinDepositar.length === 1 ? 'cheque ya se puede' : 'cheques ya se pueden'} depositar`}>
          {formatARS(suma(vencidosSinDepositar))} con fecha de cobro cumplida. Los cheques tienen 30 días desde esa fecha para presentarse.
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <Tabs<Vista> label="Filtrar cheques" value={vista} onChange={setVista} tabs={[
          { id: 'cartera', label: 'En cartera', count: cartera.length },
          { id: 'semana', label: 'Esta semana', count: semana.length },
          { id: 'depositado', label: 'Depositados', count: datos.cheques.filter(filtros.depositado).length },
          { id: 'endosado', label: 'Endosados', count: datos.cheques.filter(filtros.endosado).length },
          { id: 'todos', label: 'Todos', count: datos.cheques.length },
        ]} />
        <DataTable
          overline="Cartera"
          title="Cheques"
          rows={filas}
          rowKey={(c) => c.id}
          rowLabel={(c) => `N.° ${c.numero}`}
          pageSize={12}
          columns={[
            { key: 'b', label: 'Cheque', render: (c) => <span>{c.banco}<span className="dl-sub tabular">N.° {c.numero}{c.echeq ? ' · e-cheq' : ''}</span></span> },
            { key: 'l', label: 'Librador', render: (c) => <Link to={`/cuentas/${c.clienteId}`} className="hover:text-bold-red">{c.librador}</Link> },
            { key: 'f', label: 'Cobro', render: (c) => { const d = diasEntre(der.hoy, c.cobroEl); return <span className="tabular">{formatFecha(c.cobroEl)}<span className="dl-sub">{c.estado !== 'en_cartera' ? (c.destino ?? '') : d < 0 ? 'Ya se puede depositar' : d === 0 ? 'Hoy' : `En ${d} días`}</span></span>; } },
            { key: 'i', label: 'Importe', align: 'right', render: (c) => <strong>{formatARS(c.importe)}</strong> },
            { key: 'e', label: 'Estado', render: (c) => <Badge tone={ESTADO[c.estado][0]}>{ESTADO[c.estado][1]}</Badge> },
          ]}
          rowActions={(c) => (c.estado === 'en_cartera'
            ? [{ label: 'Depositar', icon: 'bank', onClick: () => setAccion({ cheque: c, tipo: 'depositado' }) }, { label: 'Endosar a un proveedor', icon: 'send', onClick: () => setAccion({ cheque: c, tipo: 'endosado' }) }]
            : [{ label: 'Ver cuenta del cliente', icon: 'eye', to: `/cuentas/${c.clienteId}` }])}
          emptyIcon="bank"
          emptyTitle="No hay cheques en esta vista"
          emptyText="Los cheques entran a la cartera al registrar un cobro con cheque."
        />
      </div>

      <ConfirmModal
        open={!!accion}
        title={accion?.tipo === 'depositado' ? `¿Depositar el cheque ${accion.cheque.numero}?` : `¿Endosar el cheque ${accion?.cheque.numero}?`}
        confirmLabel={accion?.tipo === 'depositado' ? 'Depositar' : 'Endosar'}
        onCancel={() => setAccion(null)}
        onConfirm={confirmar}
      >
        {accion?.tipo === 'depositado' ? (
          <>Se deposita {accion && formatARS(accion.cheque.importe)} de {accion?.cheque.banco} en {CUENTA_DALAMA}{accion && diasEntre(der.hoy, accion.cheque.cobroEl) > 0 ? '. Atención: la fecha de cobro todavía no llegó.' : '.'}</>
        ) : (
          <span className="flex flex-col gap-3">
            <span>Se entrega como pago a un proveedor y sale de la cartera.</span>
            <Select label="Proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} options={datos.proveedores.map((p) => p.razonSocial)} />
          </span>
        )}
      </ConfirmModal>
    </Page>
  );
}
