import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page, PageActions } from '@/app/layout/Page';
import { Alert, Badge, Button, DataTable, KpiCard, SearchInput, StatusBadge, Tabs, toast } from '@/components/ui';
import { Avatar } from '@/components/negocio/Datos';
import { ClienteRapido } from '@/components/negocio/ClienteRapido';
import { EnviarWhatsApp } from '@/components/negocio/EnviarWhatsApp';
import { CONDICION_IVA_CORTA, TIPO_CLIENTE, completarPlantilla } from '@/domain/calculos';
import type { Cliente } from '@/domain/types';
import { descargarCSV, pesos } from '@/lib/csv';
import { diasEntre } from '@/lib/fechas';
import { formatARS, formatCUIT, formatFecha } from '@/lib/format';
import { crearCliente, ejecutar, enviarDocumento } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';

type Vista = 'todos' | 'aberturista' | 'carpintero' | 'particular' | 'deuda' | 'inactivos';

export default function ClientesPage() {
  const [params, setParams] = useSearchParams();
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const vista = (params.get('vista') as Vista) || 'todos';
  const setVista = (v: Vista) => setParams(v === 'todos' ? {} : { vista: v }, { replace: true });
  const [q, setQ] = useState('');
  const [alta, setAlta] = useState(false);
  const [reactivar, setReactivar] = useState<Cliente[] | null>(null);

  // Compras de los últimos 180 días por cliente.
  const compras = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of datos.comprobantes) {
      if (diasEntre(c.fecha, der.hoy) > 180) continue;
      m.set(c.clienteId, (m.get(c.clienteId) ?? 0) + (c.clase === 'factura' ? c.total : -c.total));
    }
    return m;
  }, [datos.comprobantes, der.hoy]);

  const filtros: Record<Vista, (c: Cliente) => boolean> = {
    todos: () => true,
    aberturista: (c) => c.tipo === 'aberturista',
    carpintero: (c) => c.tipo === 'carpintero',
    particular: (c) => c.tipo === 'particular',
    deuda: (c) => der.cuentas.get(c.id)!.vencido > 0,
    inactivos: (c) => der.inactivos.includes(c),
  };
  const visibles = datos.clientes
    .filter(filtros[vista])
    .filter((c) => !q.trim() || normalizar(`${c.razonSocial} ${c.contacto} ${c.localidad} ${c.cuit} ${c.telefono}`).includes(normalizar(q.trim())))
    .sort((a, b) => (compras.get(b.id) ?? 0) - (compras.get(a.id) ?? 0));

  const activos = datos.clientes.length - der.inactivos.length;
  const totalCompras = [...compras.values()].reduce((a, b) => a + b, 0);
  const plantilla = datos.plantillas.find((p) => p.uso === 'reactivacion')!;
  const textoReactivar = (c: Cliente) => completarPlantilla(plantilla.cuerpo, { contacto: c.contacto.split(' ')[0] });

  const exportar = () => {
    descargarCSV('clientes', ['Razón social', 'Contacto', 'Tipo', 'CUIT', 'IVA', 'Teléfono', 'Email', 'Localidad', 'Última compra', 'Compras 6 meses', 'Saldo', 'Vencido'],
      visibles.map((c) => { const r = der.cuentas.get(c.id)!; const u = der.ultimaCompra.get(c.id); return [c.razonSocial, c.contacto, TIPO_CLIENTE[c.tipo], formatCUIT(c.cuit), CONDICION_IVA_CORTA[c.condicionIVA], c.telefono, c.email, c.localidad, u ? formatFecha(u) : '', pesos(compras.get(c.id) ?? 0), pesos(r.saldo), pesos(r.vencido)]; }));
    toast.info('Planilla descargada', `${visibles.length} clientes exportados en CSV.`);
  };

  return (
    <Page title="Clientes" overline="Administración">
      <PageActions overline={`${datos.clientes.length} clientes · zona sur`}>
        <Button variant="secondary" icon="download" onClick={exportar}>Exportar a Excel</Button>
        <Button icon="plus" onClick={() => setAlta(true)}>Nuevo cliente</Button>
      </PageActions>

      <section aria-label="Indicadores" className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <KpiCard label="Clientes activos" value={activos} icon="users" trend="flat" delta={`${der.inactivos.length} inactivos`} deltaLabel={`sin comprar hace más de ${datos.ajustes.diasClienteInactivo} días`} />
        <KpiCard label="Compras 6 meses" value={formatARS(totalCompras, { sinCentavos: true })} icon="chart" trend="flat" delta={`${datos.clientes.filter((c) => c.tipo === 'aberturista').length} aberturistas`} deltaLabel="concentran la mayor parte" />
        <KpiCard label="Con deuda vencida" value={der.conDeudaVencida.length} icon="alert-triangle" trend="flat" delta={formatARS(der.conDeudaVencida.reduce((a, x) => a + x.resumen.vencido, 0), { sinCentavos: true })} deltaLabel="para cobrar" />
        <KpiCard label="Clientes nuevos" value={datos.clientes.filter((c) => diasEntre(c.altaEl, der.hoy) <= 90).length} icon="user" trend="flat" delta="Últimos 90 días" deltaLabel="dados de alta" />
      </section>

      {vista === 'inactivos' && der.inactivos.length > 0 && (
        <Alert tone="info" title={`${der.inactivos.length} clientes dejaron de comprar`} action={<Button size="s" icon="send" onClick={() => setReactivar(der.inactivos)}>Enviar a los {der.inactivos.length}</Button>}>
          Un mensaje personal suele alcanzar para que vuelvan a pedir. Usa la plantilla “{plantilla.nombre}”, que se edita en Configuración.
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Tabs<Vista>
            label="Filtrar clientes"
            value={vista}
            onChange={setVista}
            tabs={[
              { id: 'todos', label: 'Todos', count: datos.clientes.length },
              { id: 'aberturista', label: 'Aberturistas', count: datos.clientes.filter(filtros.aberturista).length },
              { id: 'carpintero', label: 'Carpinteros', count: datos.clientes.filter(filtros.carpintero).length },
              { id: 'particular', label: 'Particulares', count: datos.clientes.filter(filtros.particular).length },
              { id: 'deuda', label: 'Con deuda vencida', count: der.conDeudaVencida.length },
              { id: 'inactivos', label: 'Inactivos', count: der.inactivos.length },
            ]}
          />
          <SearchInput label="Buscar cliente" hideLabel placeholder="Nombre, CUIT, teléfono o localidad" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-[300px]" />
        </div>
        <DataTable
          overline="Cartera"
          title={{ todos: 'Todos los clientes', aberturista: 'Aberturistas', carpintero: 'Carpinteros', particular: 'Particulares', deuda: 'Clientes con deuda vencida', inactivos: 'Clientes inactivos' }[vista]}
          rows={visibles}
          rowKey={(c) => c.id}
          rowLabel={(c) => c.razonSocial}
          pageSize={12}
          columns={[
            { key: 'n', label: 'Cliente', render: (c) => <Link to={`/clientes/${c.id}`} className="flex items-center gap-3 hover:text-bold-red"><Avatar nombre={c.razonSocial} size={32} /><span><strong>{c.razonSocial}</strong><span className="dl-sub">{c.contacto} · {c.localidad}</span></span></Link> },
            { key: 't', label: 'Tipo', render: (c) => <span>{TIPO_CLIENTE[c.tipo]}<span className="dl-sub">{CONDICION_IVA_CORTA[c.condicionIVA]}</span></span> },
            { key: 'u', label: 'Última compra', render: (c) => { const u = der.ultimaCompra.get(c.id); return u ? <span className="tabular">{formatFecha(u)}<span className="dl-sub">{diasEntre(u, der.hoy) <= 1 ? (diasEntre(u, der.hoy) === 0 ? 'hoy' : 'ayer') : `hace ${diasEntre(u, der.hoy)} días`}</span></span> : '—'; } },
            { key: 'cm', label: 'Compras 6 meses', align: 'right', render: (c) => formatARS(compras.get(c.id) ?? 0) },
            { key: 's', label: 'Saldo', align: 'right', render: (c) => formatARS(der.cuentas.get(c.id)!.saldo) },
            { key: 'e', label: 'Estado', render: (c) => der.inactivos.includes(c) ? <Badge icon="clock">Inactivo</Badge> : der.cuentas.get(c.id)!.vencido > 0 ? <StatusBadge status="deuda-vencida" /> : <Badge tone="success" icon="check">Al día</Badge> },
          ]}
          rowActions={(c) => [
            ...(der.inactivos.includes(c) ? [{ label: 'Enviar mensaje de reactivación', icon: 'send' as const, onClick: () => setReactivar([c]) }] : []),
            { label: 'Cuenta corriente', icon: 'wallet' as const, to: `/cuentas/${c.id}` },
            { label: 'Ver ficha', icon: 'eye' as const, to: `/clientes/${c.id}` },
          ]}
          emptyIcon="users"
          emptyTitle={vista === 'inactivos' ? 'No hay clientes inactivos' : 'No encontramos clientes'}
          emptyText={vista === 'inactivos' ? 'Todos compraron en los últimos meses.' : 'Probá con otro nombre o con el CUIT.'}
        />
      </div>

      <ClienteRapido
        open={alta}
        onClose={() => setAlta(false)}
        onCrear={(d) => {
          setAlta(false);
          const c = ejecutar((x) => crearCliente(x, d));
          toast.success(`${c.razonSocial} dado de alta`, 'Ya podés presupuestarle. Completá el resto de los datos desde su ficha.');
        }}
      />

      {reactivar && (
        <EnviarWhatsApp
          open
          onClose={() => setReactivar(null)}
          titulo={reactivar.length === 1 ? 'Mensaje de reactivación' : `Mensaje de reactivación a ${reactivar.length} clientes`}
          destinatario={reactivar.length === 1 ? `${reactivar[0].contacto} · ${reactivar[0].razonSocial}` : reactivar.map((c) => c.razonSocial).join(', ')}
          telefono={reactivar.length === 1 ? reactivar[0].telefono : `${reactivar.length} números`}
          textoInicial={textoReactivar(reactivar[0])}
          onEnviado={(texto) => {
            for (const c of reactivar) {
              const personal = reactivar.length === 1 ? texto : texto.replace(reactivar[0].contacto.split(' ')[0], c.contacto.split(' ')[0]);
              ejecutar((x) => enviarDocumento(x, c.id, personal));
            }
            toast.success(reactivar.length === 1 ? 'Mensaje enviado' : `${reactivar.length} mensajes enviados`, `${reactivar.length === 1 ? reactivar[0].razonSocial : 'Cada cliente'} lo recibió por WhatsApp con su nombre. Las respuestas van a llegar a la bandeja.`);
            setReactivar(null);
          }}
        />
      )}
    </Page>
  );
}
