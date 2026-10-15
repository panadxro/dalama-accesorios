import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import {
  Alert, Badge, Button, Card, ConfirmModal, DataTable, DateInput, Dialog, IconButton, KpiCard, Menu, MoneyInput,
  SearchInput, SectionTitle, Select, Sheet, StatusBadge, Switch, Tabs, TextInput, Textarea, Toast, Tooltip, toast,
  type KitStatus,
} from '@/components/ui';
import { EmptyState, ErrorState, Skeleton } from '@/components/shared/States';
import { formatARS } from '@/lib/format';

interface FilaDemo {
  id: string;
  cliente: string;
  tipo: string;
  total: number;
  estado: KitStatus;
}

const FILAS: FilaDemo[] = [
  { id: 'P-0981', cliente: 'Carpintería Rossi', tipo: 'Carpintero', total: 41238000, estado: 'vencido' },
  { id: 'P-0975', cliente: 'Juan Pérez', tipo: 'Particular', total: 9640000, estado: 'vencido' },
  { id: 'P-0990', cliente: 'Aluminios Mendoza Hnos.', tipo: 'Aberturista', total: 123890000, estado: 'enviado' },
  { id: 'P-0994', cliente: 'Aberturas del Sur S.R.L.', tipo: 'Aberturista', total: 60800080, estado: 'aceptado' },
  { id: 'P-0997', cliente: 'Marina Gómez', tipo: 'Particular', total: 6450000, estado: 'borrador' },
  { id: 'P-0998', cliente: 'Taller Ferreyra', tipo: 'Carpintero', total: 8745000, estado: 'rechazado' },
];

/** Página de revisión de la Etapa 1: todos los componentes base con el sistema visual DALAMA. */
export default function KitPage() {
  const [tab, setTab] = useState('todos');
  const [confirm, setConfirm] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [sw, setSw] = useState(false);
  const [monto, setMonto] = useState<number | null>(24530000);
  const [loading, setLoading] = useState(false);

  const filas = tab === 'todos' ? FILAS : FILAS.filter((f) => f.estado === tab);

  return (
    <Page title="Componentes del sistema" overline="Revisión · Etapa 1">
      <Alert tone="info" title="Página de revisión">
        Muestra los componentes base portados del UI kit. No forma parte del recorrido de Laura. <Link className="dl-link" to="/kit/datos">Ver datos de ejemplo</Link>
      </Alert>

      <Card className="flex flex-col gap-4">
        <SectionTitle overline="Acciones" title="Botones" />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" icon="plus">Nuevo presupuesto</Button>
          <Button variant="secondary" icon="wallet">Registrar cobro</Button>
          <Button variant="tertiary" icon="download">Descargar PDF</Button>
          <Button variant="destructive" icon="trash">Anular</Button>
          <Button variant="primary" loading>Emitiendo…</Button>
          <Button variant="secondary" disabled>Deshabilitado</Button>
          <Button variant="primary" size="s" icon="send">Enviar</Button>
          <Button variant="secondary" size="s">Botón S</Button>
          <Tooltip content="Editar presupuesto"><IconButton icon="pencil" label="Editar" /></Tooltip>
          <IconButton icon="trash" label="Eliminar" danger />
          <Menu
            label="Más acciones"
            trigger={<Button variant="secondary" iconRight="chevron-down">Más</Button>}
            items={[
              { label: 'Duplicar', icon: 'copy', onSelect: () => toast.info('Presupuesto duplicado', 'Se creó P-0999 como borrador.') },
              { label: 'Imprimir', icon: 'printer', onSelect: () => toast.info('Enviado a imprimir') },
              { label: 'Anular', icon: 'trash', danger: true, separatorBefore: true, onSelect: () => setConfirm(true) },
            ]}
          />
        </div>
      </Card>

      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]" aria-label="Indicadores">
        <KpiCard label="Ventas del mes" value="$ 8.426.750" icon="chart" trend="up" delta="10,2 %" deltaLabel="vs. septiembre al día 9" />
        <KpiCard label="Pedidos nuevos" value="7" icon="message" trend="up" delta="2" deltaLabel="5 por WhatsApp sin procesar" />
        <KpiCard label="Deuda vencida" value="$ 2.847.300" icon="wallet" trend="up" positive={false} delta="4,1 %" deltaLabel="6 clientes · 2 con +60 días" />
        <KpiCard label="Stock bajo" value="9" icon="boxes" trend="flat" delta="Sin cambios" deltaLabel="3 productos sin stock" />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <SectionTitle overline="Formularios" title="Campos" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Razón social" defaultValue="Aberturas del Sur S.R.L." required />
            <TextInput label="CUIT" defaultValue="30-7154829" error="El CUIT tiene 11 dígitos. Revisá el número." />
            <SearchInput label="Buscar producto" placeholder="Código o nombre" />
            <Select label="Lista de precios" options={['General', 'Carpinteros −10 %', 'Aberturistas −12 %']} />
            <DateInput label="Válido hasta" defaultValue="2026-10-16" />
            <MoneyInput label="Importe" value={monto} onValueChange={setMonto} helper={monto != null ? `Se registra ${formatARS(monto)}` : 'Ingresá el importe'} />
            <TextInput label="Punto de venta" defaultValue="0003" disabled />
            <Textarea label="Nota para el cliente" placeholder="Ej.: entrega mañana por la tarde" rows={2} />
          </div>
          <Switch checked={sw} onChange={setSw}>Solo bajo mínimo o sin stock</Switch>
        </Card>

        <Card className="flex flex-col gap-4">
          <SectionTitle overline="Estados" title="Badges, alertas y avisos" />
          <div className="flex flex-wrap gap-2">
            {(['borrador', 'enviado', 'aceptado', 'rechazado', 'vencido', 'pagado', 'deuda-vencida', 'stock-bajo'] as KitStatus[]).map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
            <Badge tone="error" strong icon="alert-triangle">Sin stock</Badge>
          </div>
          <Alert tone="warning" title="2 presupuestos llevan 5 días o más sin respuesta">$ 508.780,00 en juego: Carpintería Rossi (P-0981) y Juan Pérez (P-0975).</Alert>
          <Alert tone="error" title="La factura no se emitió">ARCA no respondió a tiempo. No se generó número ni CAE.</Alert>
          <Alert tone="success" title="Sin diferencias con ARCA">Los 230 comprobantes coinciden con los autorizados.</Alert>
          <Toast tone="success" title="Factura A 0003-00002138 emitida">Se sumó $ 648.414,80 a la cuenta corriente de Vidrios y Aberturas Castelli y se descontó el stock.</Toast>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="s" onClick={() => toast.success('Factura emitida', 'Se sumó $ 245.300,00 a la cuenta corriente de Aberturas Quilmes y se descontó el stock.')}>Toast de éxito</Button>
            <Button variant="secondary" size="s" onClick={() => toast.warning('Stock bajo', 'Cerradura embutir corrediza 1 punto quedó en 4 u. (mín. 20).')}>Advertencia</Button>
            <Button variant="secondary" size="s" onClick={() => toast.error('ARCA no respondió a tiempo', 'No se generó número ni CAE. El pedido sigue pendiente de facturar.')}>Error</Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Tabs
            label="Filtrar por estado"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'todos', label: 'Todos', count: FILAS.length },
              { id: 'enviado', label: 'Enviados', count: FILAS.filter((f) => f.estado === 'enviado').length },
              { id: 'vencido', label: 'Vencidos', count: FILAS.filter((f) => f.estado === 'vencido').length },
              { id: 'pagado', label: 'Pagados', count: 0 },
            ]}
          />
          <Button variant="tertiary" size="s" icon="refresh" onClick={() => { setLoading(true); window.setTimeout(() => setLoading(false), 1200); }}>
            Ver estado de carga
          </Button>
        </div>
        <DataTable
          overline="Ventas"
          title="Presupuestos"
          rows={filas}
          rowKey={(r) => r.id}
          rowLabel={(r) => r.id}
          loading={loading}
          pageSize={4}
          headerAction={<Button variant="secondary" size="s" icon="download">Exportar CSV</Button>}
          columns={[
            { key: 'id', label: 'N.°', render: (r) => <strong>{r.id}</strong> },
            { key: 'cliente', label: 'Cliente', render: (r) => <span>{r.cliente}<span className="dl-sub">{r.tipo}</span></span> },
            { key: 'total', label: 'Total', align: 'right', render: (r) => formatARS(r.total) },
            { key: 'estado', label: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
          ]}
          rowActions={() => [
            { label: 'Recordar por WhatsApp', icon: 'send', onClick: () => toast.success('Recordatorio enviado') },
            { label: 'Ver', icon: 'eye', to: '/presupuestos' },
          ]}
          emptyTitle="No hay presupuestos en este estado"
          emptyText="Cuando un presupuesto cambie de estado, va a aparecer en esta pestaña."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle overline="Superposiciones" title="Modales y paneles" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setConfirm(true)}>Confirmación</Button>
            <Button variant="secondary" onClick={() => setDialog(true)}>Modal</Button>
            <Button variant="secondary" onClick={() => setSheet(true)}>Panel lateral</Button>
          </div>
        </Card>
        <Card className="p-0"><EmptyState icon="file-text" title="Todavía no hay presupuestos" text="Los presupuestos que crees o que lleguen por WhatsApp van a aparecer acá." action={<Button icon="plus">Nuevo presupuesto</Button>} /></Card>
        <Card className="flex flex-col gap-3">
          <SectionTitle overline="Carga y error" title="Estados de pantalla" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <ErrorState title="No se pudieron cargar los datos" onRetry={() => toast.info('Reintentando…')} />
        </Card>
      </div>

      <ConfirmModal
        open={confirm}
        title="¿Convertir P-0994 en pedido?"
        confirmLabel="Convertir en pedido"
        onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); toast.success('Pedido PED-0426 creado', 'Se reservaron los productos del stock y el presupuesto pasó a Aceptado.'); }}
      >
        Se reservan los productos del stock, el presupuesto pasa a Aceptado y se crea el pedido PED-0426 para Aberturas del Sur S.R.L.
      </ConfirmModal>

      <Dialog
        open={dialog}
        onOpenChange={setDialog}
        overline="WhatsApp"
        title="Vista previa del mensaje"
        description="Así lo va a recibir el cliente. No se envía nada: es una simulación."
        footer={<><Button variant="secondary" onClick={() => setDialog(false)}>Cancelar</Button><Button icon="send" onClick={() => { setDialog(false); toast.success('Mensaje enviado (simulado)'); }}>Enviar por WhatsApp</Button></>}
      >
        <div className="rounded-sm bg-arena-100 p-4 text-body">Hola Martín, te paso el presupuesto P-0998 por $ 412.380,00. Vale hasta el 16/10/2026.</div>
      </Dialog>

      <Sheet
        open={sheet}
        onOpenChange={setSheet}
        overline="Cobranzas"
        title="Registrar cobro"
        footer={<><Button variant="secondary" onClick={() => setSheet(false)}>Cancelar</Button><Button onClick={() => { setSheet(false); toast.success('Cobro registrado', 'Se descontó $ 245.300,00 del saldo de Aberturas del Sur S.R.L.'); }}>Registrar cobro y emitir recibo</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Select label="Medio de pago" options={['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta']} />
          <MoneyInput label="Importe" value={monto} onValueChange={setMonto} />
          <DateInput label="Fecha" defaultValue="2026-10-14" />
        </div>
      </Sheet>
    </Page>
  );
}
