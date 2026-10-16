import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { ReiniciarDemoModal } from '@/app/layout/Topbar';
import { Alert, Badge, Button, Card, DateInput, Icon, SectionTitle, Select, Tabs, TextInput, Textarea, toast } from '@/components/ui';
import { CONDICION_IVA, completarPlantilla, numeroFiscal } from '@/domain/calculos';
import type { Ajustes, CondicionIVA, Empresa, Plantilla } from '@/domain/types';
import { aISO, deISO } from '@/lib/fechas';
import { formatARS, formatCUIT, formatFecha } from '@/lib/format';
import { actualizarAjustes, actualizarEmpresa, ejecutar, guardarPlantilla } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { useTour } from '@/features/tour/tour';

type Seccion = 'empresa' | 'plantillas' | 'alertas' | 'arca' | 'demo';

const pad = (n: number) => String(n).padStart(2, '0');
const aInput = (iso: string) => { const d = deISO(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

const VARIABLES: Array<[string, string]> = [
  ['{contacto}', 'Martín'], ['{numero}', 'P-0998'], ['{total}', formatARS(34608420)], ['{vence}', '23/10/2026'],
  ['{comprobante}', 'Factura A 0003-00002138'], ['{deuda}', formatARS(61230000)], ['{cantidad}', '2 facturas'],
  ['{comprobantes}', 'A 0003-00001842 y 0003-00001958'], ['{direccion}', 'Pasco 1270, Temperley'],
];

function EmpresaForm() {
  const empresa = useDemo((s) => s.datos.empresa);
  const [e, setE] = useState<Empresa>(empresa);
  useEffect(() => setE(empresa), [empresa]);
  const set = (x: Partial<Empresa>) => setE((v) => ({ ...v, ...x }));
  return (
    <Card className="flex flex-col gap-5">
      <SectionTitle overline="Empresa" title="Datos fiscales" />
      <Alert tone="info" title="Datos ficticios">La demo usa datos de ejemplo. En el sistema real se cargan los de DALAMA y salen en facturas, remitos y presupuestos.</Alert>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput className="sm:col-span-2" label="Razón social" value={e.razonSocial} onChange={(x) => set({ razonSocial: x.target.value })} />
        <TextInput label="CUIT" value={formatCUIT(e.cuit)} onChange={(x) => set({ cuit: x.target.value.replace(/\D/g, '').slice(0, 11) })} />
        <Select label="Condición frente al IVA" value={e.condicionIVA} onChange={(x) => set({ condicionIVA: x.target.value as CondicionIVA })} options={(['RI', 'MONOTRIBUTO', 'EXENTO'] as CondicionIVA[]).map((k) => ({ value: k, label: CONDICION_IVA[k] }))} helper={e.condicionIVA !== 'RI' ? 'Con esta condición se emiten facturas C.' : 'Emite facturas A y B.'} />
        <TextInput label="Ingresos Brutos" value={e.ingresosBrutos} onChange={(x) => set({ ingresosBrutos: x.target.value })} />
        <DateInput label="Inicio de actividades" value={aInput(e.inicioActividades)} onChange={(x) => { const [y, m, d] = x.target.value.split('-').map(Number); if (y) set({ inicioActividades: aISO(new Date(y, m - 1, d, 9)) }); }} />
        <TextInput label="Domicilio comercial" value={e.domicilio} onChange={(x) => set({ domicilio: x.target.value })} />
        <TextInput label="Localidad" value={e.localidad} onChange={(x) => set({ localidad: x.target.value })} />
        <TextInput label="Teléfono / WhatsApp" value={e.telefono} onChange={(x) => set({ telefono: x.target.value })} />
        <TextInput label="Email" value={e.email} onChange={(x) => set({ email: x.target.value })} />
        <TextInput label="Alias para transferencias" value={e.alias} onChange={(x) => set({ alias: x.target.value.toUpperCase() })} helper="Aparece en facturas y recordatorios de deuda." />
        <TextInput label="CBU" value={e.cbu} onChange={(x) => set({ cbu: x.target.value.replace(/\D/g, '').slice(0, 22) })} inputMode="numeric" />
      </div>
      <div className="flex justify-end">
        <Button icon="check" onClick={() => { ejecutar((d) => actualizarEmpresa(d, e)); toast.success('Datos de la empresa guardados', 'Se usan desde ahora en los PDF de presupuestos, facturas, remitos y recibos.'); }}>Guardar cambios</Button>
      </div>
    </Card>
  );
}

function Plantillas() {
  const plantillas = useDemo((s) => s.datos.plantillas);
  const [id, setId] = useState(plantillas[0].id);
  const actual = plantillas.find((p) => p.id === id)!;
  const [cuerpo, setCuerpo] = useState(actual.cuerpo);
  const [nombre, setNombre] = useState(actual.nombre);
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setCuerpo(actual.cuerpo); setNombre(actual.nombre); }, [actual]);

  const insertar = (v: string) => {
    const el = area.current;
    const ini = el?.selectionStart ?? cuerpo.length;
    const fin = el?.selectionEnd ?? cuerpo.length;
    setCuerpo(cuerpo.slice(0, ini) + v + cuerpo.slice(fin));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(ini + v.length, ini + v.length); });
  };
  const ejemplo = completarPlantilla(cuerpo, { ...Object.fromEntries(VARIABLES.map(([k, v]) => [k.slice(1, -1), v])), alias: useDemo.getState().datos.empresa.alias });
  const cambio = cuerpo !== actual.cuerpo || nombre !== actual.nombre;

  return (
    <div className="flex flex-wrap items-start gap-4">
      <Card className="min-w-0 flex-[1_1_260px] p-0" aria-label="Plantillas">
        <div className="px-6 pt-6"><SectionTitle overline="WhatsApp" title="Plantillas de mensajes" /></div>
        <ul className="m-0 mt-3 list-none p-0">
          {plantillas.map((p) => (
            <li key={p.id}>
              <button type="button" aria-current={p.id === id ? 'true' : undefined} onClick={() => setId(p.id)} className={`relative w-full border-b border-arena-100 px-6 py-3 text-left hover:bg-arena-50 ${p.id === id ? 'bg-arena-100 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:bg-rojo-dalama' : ''}`}>
                <span className="block font-semibold">{p.nombre}</span>
                <span className="block truncate text-caption text-texto-secundario">{p.cuerpo.slice(0, 60)}…</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="flex min-w-0 flex-[2_1_480px] flex-col gap-4" aria-label="Editar plantilla">
        <TextInput label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Textarea ref={area} label="Mensaje" value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} rows={6} />
        <div>
          <div className="dl-label mb-2">Insertar dato:</div>
          <div className="flex flex-wrap gap-1.5">
            {[...VARIABLES.map(([k]) => k), '{alias}'].filter((v, i, a) => a.indexOf(v) === i).map((v) => (
              <button key={v} type="button" className="dl-btn dl-btn-secondary dl-btn-s" style={{ minHeight: 28 }} onClick={() => insertar(v)}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="dl-label mb-2">Vista previa con datos de ejemplo</div>
          <div className="rounded-sm bg-arena-100 p-4"><p className="m-0 ml-auto max-w-[90%] whitespace-pre-line rounded-md rounded-tr-none bg-superficie p-3 text-body shadow-1">{ejemplo}</p></div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="tertiary" disabled={!cambio} onClick={() => { setCuerpo(actual.cuerpo); setNombre(actual.nombre); }}>Descartar cambios</Button>
          <Button icon="check" disabled={!cambio || !cuerpo.trim()} onClick={() => { ejecutar((d) => guardarPlantilla(d, { ...actual, nombre, cuerpo } as Plantilla)); toast.success('Plantilla guardada', `Los próximos mensajes de “${nombre}” salen con este texto.`); }}>Guardar plantilla</Button>
        </div>
      </Card>
    </div>
  );
}

function Alertas() {
  const ajustes = useDemo((s) => s.datos.ajustes);
  const [a, setA] = useState<Ajustes>(ajustes);
  useEffect(() => setA(ajustes), [ajustes]);
  const num = (k: keyof Ajustes, label: string, helper: string, min = 1, max = 365) => (
    <TextInput label={label} type="number" min={min} max={max} value={a[k]} helper={helper} onChange={(e) => setA((v) => ({ ...v, [k]: Math.min(max, Math.max(min, Number(e.target.value) || min)) }))} />
  );
  return (
    <Card className="flex flex-col gap-5">
      <SectionTitle overline="Automatizaciones" title="Seguimiento y alertas" />
      <div className="grid gap-4 sm:grid-cols-2">
        {num('validezPresupuestoDias', 'Validez de los presupuestos (días)', 'Después de este plazo el presupuesto pasa a Vencido.')}
        {num('recordarPresupuestoDias', 'Avisar presupuestos sin respuesta (días)', 'Aparecen en el panel y en los avisos.')}
        {num('recordarDeudaCadaDias', 'Recordar deuda vencida cada (días)', 'Frecuencia del recordatorio automático por WhatsApp.')}
        {num('diasClienteInactivo', 'Cliente inactivo después de (días)', 'Sin compras en ese plazo, se sugiere reactivarlo.', 30, 365)}
        {num('reponerHastaVecesMinimo', 'Reponer hasta (veces el mínimo)', 'Para las órdenes de compra sugeridas.', 1, 5)}
        <TextInput label="IVA general (%)" value={a.ivaPct} disabled helper="Fijo para los productos del rubro." />
      </div>
      <div className="flex justify-end">
        <Button icon="check" onClick={() => { ejecutar((d) => actualizarAjustes(d, a)); toast.success('Ajustes guardados', 'El panel, los avisos y las órdenes sugeridas ya usan los nuevos plazos.'); }}>Guardar cambios</Button>
      </div>
    </Card>
  );
}

function Arca() {
  const d = useDemo((s) => s.datos);
  const [probando, setProbando] = useState(false);
  return (
    <Card className="flex flex-col gap-5">
      <SectionTitle overline="Factura electrónica" title="Conexión con ARCA" action={<Badge tone="success" icon="check-circle">Conectado (simulado)</Badge>} />
      <p className="m-0 text-body">Punto de venta {String(d.empresa.puntoVenta).padStart(4, '0')} · Web Services · entorno de producción. Último comprobante: FC A {numeroFiscal(d.empresa.puntoVenta, d.secuencias.factura.A - 1)}.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Punto de venta" value={String(d.empresa.puntoVenta).padStart(4, '0')} disabled />
        <TextInput label="Vencimiento del certificado" value={formatFecha(new Date(new Date().getFullYear() + 1, 2, 14))} disabled />
        <TextInput label="Próxima factura A" value={numeroFiscal(d.empresa.puntoVenta, d.secuencias.factura.A)} disabled />
        <TextInput label="Próxima factura B" value={numeroFiscal(d.empresa.puntoVenta, d.secuencias.factura.B)} disabled />
      </div>
      <Alert tone="info" title="Simulación">En la demo los CAE se generan en el navegador. En el sistema real se usa el certificado digital de DALAMA y el servicio WSFE de ARCA.</Alert>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" icon="refresh" loading={probando} onClick={() => { setProbando(true); window.setTimeout(() => { setProbando(false); toast.success('Conexión con ARCA verificada', 'El servicio de factura electrónica respondió en 1,2 s (simulado).'); }, 1200); }}>Probar conexión</Button>
      </div>
    </Card>
  );
}

function Demo() {
  const [reiniciar, setReiniciar] = useState(false);
  const abrirTour = useTour((s) => s.abrir);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="flex flex-col gap-4">
        <SectionTitle overline="Demo" title="Recorrido guiado" />
        <p className="m-0 text-body text-texto-secundario">Seis pasos por el flujo principal: del mensaje de WhatsApp al cobro. Se puede saltear y volver a abrir cuando quieras.</p>
        <Button icon="play" className="self-start" onClick={abrirTour}>Empezar el recorrido</Button>
      </Card>
      <Card className="flex flex-col gap-4">
        <SectionTitle overline="Demo" title="Reiniciar los datos" />
        <p className="m-0 text-body text-texto-secundario">Vuelve todo al estado inicial: clientes, presupuestos, pedidos, facturas, stock y mensajes. Útil para mostrar la demo de nuevo desde cero.</p>
        <Button variant="destructive" icon="reset" className="self-start" onClick={() => setReiniciar(true)}>Reiniciar demo</Button>
      </Card>
      <Card className="flex flex-col gap-3 lg:col-span-2">
        <SectionTitle overline="Privacidad" title="Dónde están los datos" />
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-body">
          <li className="flex gap-2"><Icon name="shield" size={18} className="mt-0.5 shrink-0 text-info" />Todo se guarda en este navegador. No hay servidor ni base de datos: nada sale de tu computadora.</li>
          <li className="flex gap-2"><Icon name="info" size={18} className="mt-0.5 shrink-0 text-info" />Los datos son ficticios: ningún cliente, CUIT, teléfono ni monto corresponde a personas o empresas reales.</li>
          <li className="flex gap-2"><Icon name="message" size={18} className="mt-0.5 shrink-0 text-info" />WhatsApp, la IA y ARCA están simulados. En el sistema real se conectan a los servicios oficiales.</li>
        </ul>
      </Card>
      <ReiniciarDemoModal open={reiniciar} onClose={() => setReiniciar(false)} />
    </div>
  );
}

export default function ConfiguracionPage() {
  const [params, setParams] = useSearchParams();
  const seccion = (params.get('seccion') as Seccion) || 'empresa';
  return (
    <Page title="Configuración" overline="Análisis">
      <Tabs<Seccion>
        label="Secciones de configuración"
        value={seccion}
        onChange={(s) => setParams({ seccion: s }, { replace: true })}
        tabs={[{ id: 'empresa', label: 'Empresa' }, { id: 'plantillas', label: 'Plantillas de WhatsApp' }, { id: 'alertas', label: 'Seguimiento y alertas' }, { id: 'arca', label: 'Factura electrónica' }, { id: 'demo', label: 'Demo' }]}
      />
      {seccion === 'empresa' && <EmpresaForm />}
      {seccion === 'plantillas' && <Plantillas />}
      {seccion === 'alertas' && <Alertas />}
      {seccion === 'arca' && <Arca />}
      {seccion === 'demo' && <Demo />}
    </Page>
  );
}
