import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Alert, Badge, Card, DataTable, KpiCard, SectionTitle, StatusBadge } from '@/components/ui';
import {
  CATEGORIA, CONDICION_IVA_CORTA, ESTADO_PEDIDO, ESTADO_PRESUPUESTO, METODO_ENTREGA, TIPO_CLIENTE, codigoComprobante,
  estadoPresupuesto, estadoStock,
} from '@/domain/calculos';
import type { EstadoPresupuestoVisible } from '@/domain/types';
import { claveMes } from '@/lib/fechas';
import { formatARS, formatARSKpi, formatCUIT, formatFecha, formatHora, formatMesAnio } from '@/lib/format';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';

/** Página de revisión de la Etapa 2: muestra los datos de ejemplo generados. No forma parte del recorrido de Laura. */
export default function DatosPage() {
  const d = useDemo((s) => s.datos);
  const der = useDerivados();

  const ventasPorMes = useMemo(() => {
    const m = new Map<string, { total: number; n: number }>();
    for (const c of d.comprobantes) {
      const k = claveMes(c.fecha);
      const x = m.get(k) ?? { total: 0, n: 0 };
      x.total += c.clase === 'factura' ? c.total : -c.total;
      x.n += 1;
      m.set(k, x);
    }
    return [...m].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ id: k, mes: formatMesAnio(`${k}-01T00:00:00`), ...v }));
  }, [d.comprobantes]);

  const estados = useMemo(() => {
    const e: Record<EstadoPresupuestoVisible, number> = { borrador: 0, enviado: 0, aceptado: 0, rechazado: 0, vencido: 0 };
    for (const p of d.presupuestos) e[estadoPresupuesto(p, der.hoy)]++;
    return e;
  }, [d.presupuestos, der.hoy]);

  const deudaVencida = der.conDeudaVencida.reduce((a, x) => a + x.resumen.vencido, 0);
  const cartera = d.cheques.filter((c) => c.estado === 'en_cartera');

  return (
    <Page title="Datos de ejemplo" overline="Revisión · Etapa 2">
      <Alert tone="info" title="Página de revisión">
        Resume los datos ficticios que se generan al iniciar o reiniciar la demo. Todas las fechas son relativas a hoy. Los módulos que los usan se arman en las etapas 3 a 5. <Link className="dl-link" to="/kit">Ver componentes</Link>
      </Alert>

      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]" aria-label="Volumen">
        <KpiCard label="Productos" value={d.productos.length} icon="tag" delta={`${new Set(d.productos.map((p) => p.categoria)).size} categorías`} deltaLabel={`${d.proveedores.length} proveedores`} />
        <KpiCard label="Clientes" value={d.clientes.length} icon="users" delta={`${der.conDeudaVencida.length} con deuda vencida`} deltaLabel={`${der.inactivos.length} inactivos`} />
        <KpiCard label="Comprobantes" value={d.comprobantes.length} icon="receipt" delta={`${d.cobros.length} cobros`} deltaLabel={`${d.cheques.length} cheques`} />
        <KpiCard label="Deuda vencida" value={formatARSKpi(deudaVencida)} icon="wallet" trend="flat" delta={`${cartera.length} cheques en cartera`} deltaLabel={formatARS(cartera.reduce((a, c) => a + c.importe, 0))} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <DataTable
          overline="6 meses de historial"
          title="Ventas por mes"
          rows={ventasPorMes}
          rowKey={(r) => r.id}
          pagination={false}
          columns={[
            { key: 'mes', label: 'Mes' },
            { key: 'n', label: 'Comprobantes', align: 'right' },
            { key: 'total', label: 'Facturado con IVA', align: 'right', render: (r) => formatARS(r.total) },
          ]}
        />
        <Card className="flex flex-col gap-4">
          <SectionTitle overline="Presupuestos" title="En todos los estados" />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(estados) as EstadoPresupuestoVisible[]).map((e) => (
              <StatusBadge key={e} status={e}>{`${ESTADO_PRESUPUESTO[e]} · ${estados[e]}`}</StatusBadge>
            ))}
          </div>
          <SectionTitle overline="WhatsApp" title="Conversaciones" />
          <ul className="flex flex-col gap-2">
            {d.conversaciones.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 rounded-sm bg-arena-50 px-3 py-2">
                <div className="min-w-0">
                  <div className="font-semibold">{c.contacto}</div>
                  <div className="truncate text-body-small text-texto-secundario">{c.mensajes[0].texto.split('\n')[0]}</div>
                </div>
                <Badge tone={c.estado === 'nuevo' ? 'info' : 'neutral'}>{c.estado === 'nuevo' ? 'Sin procesar' : c.estado === 'presupuestado' ? 'Presupuestado' : 'Respondido'}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <DataTable
        overline="Reparto"
        title="Entregas de hoy"
        rows={der.entregasHoy}
        rowKey={(p) => p.id}
        pagination={false}
        columns={[
          { key: 'hora', label: 'Hora', render: (p) => <strong className="tabular">{formatHora(p.entrega.fecha)}</strong> },
          { key: 'numero', label: 'Pedido', render: (p) => <span>{p.numero}<span className="dl-sub">{p.remito?.numero ?? 'Sin remito'}</span></span> },
          { key: 'cliente', label: 'Cliente', render: (p) => der.clientePorId.get(p.clienteId)?.razonSocial },
          { key: 'metodo', label: 'Envío', render: (p) => `${METODO_ENTREGA[p.entrega.metodo]}${p.entrega.empresa ? ` · ${p.entrega.empresa}` : ''}` },
          { key: 'factura', label: 'Factura', render: (p) => { const c = d.comprobantes.find((x) => x.id === p.comprobanteId); return c ? codigoComprobante(c) : <Badge tone="warning">Sin facturar</Badge>; } },
          { key: 'estado', label: 'Estado', render: (p) => <Badge tone={p.estado === 'entregado' ? 'success' : p.estado === 'despachado' ? 'info' : p.estado === 'en_preparacion' ? 'warning' : 'neutral'}>{ESTADO_PEDIDO[p.estado]}</Badge> },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DataTable
          overline="Cobranzas"
          title="Clientes con deuda vencida"
          rows={der.conDeudaVencida}
          rowKey={(x) => x.cliente.id}
          pagination={false}
          columns={[
            { key: 'c', label: 'Cliente', render: (x) => <span>{x.cliente.razonSocial}<span className="dl-sub">{TIPO_CLIENTE[x.cliente.tipo]} · {CONDICION_IVA_CORTA[x.cliente.condicionIVA]}</span></span> },
            { key: 's', label: 'Saldo', align: 'right', render: (x) => formatARS(x.resumen.saldo) },
            { key: 'v', label: 'Vencido', align: 'right', render: (x) => <StatusBadge status="deuda-vencida">{`${formatARS(x.resumen.vencido)} · ${x.resumen.diasMayorAtraso} d`}</StatusBadge> },
          ]}
        />
        <DataTable
          overline="Depósito"
          title="Stock bajo el mínimo"
          rows={der.stockBajo}
          rowKey={(p) => p.id}
          pagination={false}
          columns={[
            { key: 'n', label: 'Producto', render: (p) => <span>{p.nombre}<span className="dl-sub">{p.codigo} · {CATEGORIA[p.categoria]}</span></span> },
            { key: 'q', label: 'Stock / mín.', align: 'right', render: (p) => `${p.stock} / ${p.stockMinimo}` },
            { key: 'e', label: 'Estado', render: (p) => (estadoStock(p) === 'sin_stock' ? <Badge tone="error" icon="alert-triangle">Sin stock</Badge> : <StatusBadge status="stock-bajo" />) },
          ]}
        />
      </div>

      <DataTable
        overline="Clientes"
        title="Cartera de clientes"
        rows={d.clientes}
        rowKey={(c) => c.id}
        pageSize={10}
        columns={[
          { key: 'r', label: 'Cliente', render: (c) => <span>{c.razonSocial}<span className="dl-sub">{c.contacto} · {c.localidad}</span></span> },
          { key: 't', label: 'Tipo', render: (c) => TIPO_CLIENTE[c.tipo] },
          { key: 'cuit', label: 'CUIT', render: (c) => <span className="tabular">{formatCUIT(c.cuit)}</span> },
          { key: 'iva', label: 'IVA', render: (c) => CONDICION_IVA_CORTA[c.condicionIVA] },
          { key: 'u', label: 'Última compra', render: (c) => { const u = der.ultimaCompra.get(c.id); return u ? formatFecha(u) : '—'; } },
          { key: 's', label: 'Saldo', align: 'right', render: (c) => formatARS(der.cuentas.get(c.id)!.saldo) },
          { key: 'e', label: 'Estado', render: (c) => (der.inactivos.includes(c) ? <Badge tone="neutral" icon="clock">Inactivo</Badge> : der.cuentas.get(c.id)!.vencido > 0 ? <StatusBadge status="deuda-vencida" /> : <Badge tone="success" icon="check">Al día</Badge>) },
        ]}
      />
    </Page>
  );
}
