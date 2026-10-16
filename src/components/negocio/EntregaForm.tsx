import { DateInput, Select, TextInput } from '@/components/ui/Input';
import type { Entrega, MetodoEntrega } from '@/domain/types';
import { METODO_ENTREGA } from '@/domain/calculos';
import { aISO, deISO } from '@/lib/fechas';

const pad = (n: number) => String(n).padStart(2, '0');

/** Método, día, hora y destino de la entrega. */
export function EntregaForm({ entrega, onChange, direccionCliente }: { entrega: Entrega; onChange: (e: Entrega) => void; direccionCliente: string }) {
  const f = deISO(entrega.fecha);
  const dia = `${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())}`;
  const hora = `${pad(f.getHours())}:${pad(f.getMinutes())}`;
  const set = (c: Partial<Entrega>) => onChange({ ...entrega, ...c });
  const setFecha = (d: string, h: string) => {
    const [y, m, dd] = d.split('-').map(Number);
    const [hh, mm] = h.split(':').map(Number);
    if (!y || !m || !dd) return;
    set({ fecha: aISO(new Date(y, m - 1, dd, hh || 0, mm || 0)) });
  };
  const cambiarMetodo = (metodo: MetodoEntrega) => {
    const base: Partial<Entrega> = { metodo, empresa: undefined, tracking: undefined, chofer: undefined };
    if (metodo === 'retiro') base.direccion = 'Retira en el local';
    else if (entrega.metodo === 'retiro') base.direccion = direccionCliente;
    if (metodo === 'camioneta') base.chofer = 'Nahuel';
    if (metodo === 'transporte') base.empresa = 'Vía Cargo';
    if (metodo === 'correo') base.empresa = 'Andreani';
    set(base);
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label="Método de entrega"
        value={entrega.metodo}
        onChange={(e) => cambiarMetodo(e.target.value as MetodoEntrega)}
        options={(Object.keys(METODO_ENTREGA) as MetodoEntrega[]).map((k) => ({ value: k, label: METODO_ENTREGA[k] }))}
      />
      <TextInput label="Bultos" type="number" min={1} value={entrega.bultos} onChange={(e) => set({ bultos: Math.max(1, Number(e.target.value) || 1) })} />
      <DateInput label="Día" value={dia} onChange={(e) => setFecha(e.target.value, hora)} />
      <TextInput label="Hora" type="time" value={hora} onChange={(e) => setFecha(dia, e.target.value)} />
      {entrega.metodo !== 'retiro' && (
        <TextInput className="sm:col-span-2" label={entrega.metodo === 'transporte' ? 'Destino del despacho' : 'Dirección de entrega'} value={entrega.direccion} onChange={(e) => set({ direccion: e.target.value })} />
      )}
      {(entrega.metodo === 'transporte' || entrega.metodo === 'correo') && (
        <>
          <Select
            label={entrega.metodo === 'correo' ? 'Correo' : 'Transporte'}
            value={entrega.empresa ?? ''}
            onChange={(e) => set({ empresa: e.target.value })}
            options={entrega.metodo === 'correo' ? ['Andreani', 'Correo Argentino', 'OCA'] : ['Vía Cargo', 'Expreso Lomas', 'Transporte Sur']}
          />
          <TextInput label="N.° de seguimiento" value={entrega.tracking ?? ''} onChange={(e) => set({ tracking: e.target.value })} placeholder="Se carga al despachar" />
        </>
      )}
      {entrega.metodo === 'camioneta' && (
        <Select label="Chofer" value={entrega.chofer ?? 'Nahuel'} onChange={(e) => set({ chofer: e.target.value })} options={['Nahuel', 'Dario']} />
      )}
    </div>
  );
}
