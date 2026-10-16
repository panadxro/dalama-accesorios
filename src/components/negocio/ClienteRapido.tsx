import { useEffect, useState, type FormEvent } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Select, TextInput } from '@/components/ui/Input';
import type { Cliente, CondicionIVA, TipoCliente } from '@/domain/types';
import { CONDICION_IVA } from '@/domain/calculos';

const LISTA_POR_TIPO: Record<TipoCliente, string> = { aberturista: 'lista-aberturistas', carpintero: 'lista-carpinteros', particular: 'lista-general' };

/** Alta rápida de un cliente que escribió por WhatsApp por primera vez. */
export function ClienteRapido({
  open, onClose, nombreInicial = '', telefono = '', onCrear,
}: {
  open: boolean;
  onClose: () => void;
  nombreInicial?: string;
  telefono?: string;
  onCrear: (c: Omit<Cliente, 'id' | 'altaEl'>) => void;
}) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [tipo, setTipo] = useState<TipoCliente>('particular');
  const [iva, setIva] = useState<CondicionIVA>('CF');
  const [doc, setDoc] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) { setNombre(nombreInicial); setError(undefined); }
  }, [open, nombreInicial]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 3) return setError('Escribí el nombre o la razón social.');
    const digitos = doc.replace(/\D/g, '');
    onCrear({
      razonSocial: nombre.trim(),
      contacto: nombre.trim().split(' ')[0],
      tipo,
      cuit: digitos.length === 11 ? digitos : digitos ? `20${digitos.padStart(8, '0')}0` : '20000000000',
      condicionIVA: iva,
      telefono,
      email: '',
      direccion: direccion.trim() || 'A confirmar',
      localidad: localidad.trim() || 'A confirmar',
      listaId: LISTA_POR_TIPO[tipo],
      condicionVenta: 'contado',
      limiteCredito: 0,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      overline="Clientes"
      title="Dar de alta al cliente"
      description="Con estos datos alcanza para presupuestar. El resto se completa en la ficha."
      width={520}
    >
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <TextInput label="Nombre o razón social" required value={nombre} onChange={(e) => setNombre(e.target.value)} error={error} autoFocus />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Tipo de cliente" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCliente)} options={[{ value: 'particular', label: 'Particular' }, { value: 'carpintero', label: 'Carpintero' }, { value: 'aberturista', label: 'Aberturista' }]} />
          <Select label="Condición frente al IVA" value={iva} onChange={(e) => setIva(e.target.value as CondicionIVA)} options={(Object.keys(CONDICION_IVA) as CondicionIVA[]).map((k) => ({ value: k, label: CONDICION_IVA[k] }))} />
          <TextInput label="CUIT o DNI" value={doc} onChange={(e) => setDoc(e.target.value)} inputMode="numeric" helper="Opcional para consumidor final." />
          <TextInput label="Teléfono" value={telefono} disabled />
          <TextInput label="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <TextInput label="Localidad" value={localidad} onChange={(e) => setLocalidad(e.target.value)} placeholder="Ej.: Lanús" />
        </div>
        <div className="dl-modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" icon="check">Dar de alta</Button>
        </div>
      </form>
    </Dialog>
  );
}
