import { useEffect, useState } from 'react';
import { Alert, Button, MoneyInput, Select, Sheet, TextInput, Textarea, toast } from '@/components/ui';
import { CATEGORIA, margenPct } from '@/domain/calculos';
import type { Categoria, Linea, Producto, Unidad } from '@/domain/types';
import { formatPct } from '@/lib/format';
import { ejecutar, guardarProducto, nuevoIdProducto } from '@/store/acciones';
import { useDemo } from '@/store/demo';

const UNIDADES: Unidad[] = ['u.', 'par', 'rollo', 'tira', 'kit', 'caja', 'm²'];
const LINEAS: Array<Linea | ''> = ['', 'Herrero', 'Módena', 'A30', 'Universal'];

const vacio = (proveedorId: string): Producto => ({
  id: '', codigo: '', nombre: '', categoria: 'accesorios', familia: '', atributos: {}, unidad: 'u.', costo: 0, precioLista: 0,
  proveedorId, stock: 0, stockMinimo: 10, ubicacion: '', sinonimos: [], activo: true,
});

/** Alta y edición de un producto. Los sinónimos son lo que usa la IA para reconocerlo en los mensajes. */
export function EditarProducto({ producto, open, onClose }: { producto: Producto | null; open: boolean; onClose: () => void }) {
  const datos = useDemo((s) => s.datos);
  const [p, setP] = useState<Producto>(producto ?? vacio(datos.proveedores[0].id));
  const [sinonimos, setSinonimos] = useState('');
  const [error, setError] = useState<string>();
  const nuevo = !producto;

  useEffect(() => {
    if (!open) return;
    const base = producto ?? vacio(datos.proveedores[0].id);
    setP(base);
    setSinonimos(base.sinonimos.join(', '));
    setError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, producto?.id]);

  const set = (x: Partial<Producto>) => setP((v) => ({ ...v, ...x }));
  const setAtr = (x: Partial<Producto['atributos']>) => setP((v) => ({ ...v, atributos: { ...v.atributos, ...x } }));
  const variantes = producto ? datos.productos.filter((x) => x.familia === producto.familia && x.id !== producto.id) : [];
  const margen = margenPct(p);

  const guardar = () => {
    const codigo = p.codigo.trim().toUpperCase();
    if (!p.nombre.trim() || !codigo) return setError('Completá el nombre y el código.');
    if (nuevo && datos.productos.some((x) => x.codigo === codigo)) return setError(`Ya existe un producto con el código ${codigo}.`);
    if (p.precioLista <= 0) return setError('Ingresá el precio de lista.');
    const final: Producto = {
      ...p,
      id: p.id || nuevoIdProducto(codigo),
      codigo,
      familia: p.familia || codigo.toLowerCase().split('-').slice(0, 2).join('-'),
      sinonimos: sinonimos.split(',').map((s) => s.trim()).filter(Boolean),
    };
    ejecutar((d) => guardarProducto(d, final));
    onClose();
    toast.success(nuevo ? `${final.codigo} dado de alta` : 'Producto actualizado', nuevo ? 'Ya se puede presupuestar y la IA lo reconoce por sus sinónimos.' : `Margen ${formatPct(margenPct(final))}. Los presupuestos ya enviados mantienen su precio.`);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      overline={nuevo ? 'Catálogo' : p.codigo}
      title={nuevo ? 'Nuevo producto' : 'Editar producto'}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button icon="check" onClick={guardar}>{nuevo ? 'Dar de alta' : 'Guardar cambios'}</Button>
      </>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {error && <Alert className="sm:col-span-2" tone="error" title="Faltan datos">{error}</Alert>}
        <TextInput className="sm:col-span-2" label="Nombre" required value={p.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Ej.: Bisagra 3 agujas aluminio negra · Herrero" />
        <TextInput label="Código" required value={p.codigo} disabled={!nuevo} onChange={(e) => set({ codigo: e.target.value.toUpperCase() })} placeholder="BIS-3A-NG" />
        <Select label="Categoría" value={p.categoria} onChange={(e) => set({ categoria: e.target.value as Categoria })} options={(Object.keys(CATEGORIA) as Categoria[]).map((k) => ({ value: k, label: CATEGORIA[k] }))} />
        <TextInput label="Color" value={p.atributos.color ?? ''} onChange={(e) => setAtr({ color: e.target.value || undefined })} />
        <TextInput label="Medida" value={p.atributos.medida ?? ''} onChange={(e) => setAtr({ medida: e.target.value || undefined })} />
        <Select label="Línea" value={p.atributos.linea ?? ''} onChange={(e) => setAtr({ linea: (e.target.value || undefined) as Linea | undefined })} options={LINEAS.map((l) => ({ value: l, label: l || 'Sin línea' }))} />
        <Select label="Unidad de venta" value={p.unidad} onChange={(e) => set({ unidad: e.target.value as Unidad })} options={UNIDADES} />
        <Select className="sm:col-span-2" label="Proveedor" value={p.proveedorId} onChange={(e) => set({ proveedorId: e.target.value })} options={datos.proveedores.map((x) => ({ value: x.id, label: x.razonSocial }))} />
        <MoneyInput label="Costo (sin IVA)" value={p.costo} onValueChange={(v) => set({ costo: v ?? 0 })} />
        <MoneyInput label="Precio de lista (sin IVA)" value={p.precioLista} onValueChange={(v) => set({ precioLista: v ?? 0 })} helper={p.precioLista > 0 ? `Margen ${formatPct(margen)}${margen < 30 ? ' · por debajo del 30 %' : ''}` : undefined} error={p.precioLista > 0 && p.costo > p.precioLista ? 'El precio queda por debajo del costo.' : undefined} />
        {nuevo && <TextInput label="Stock inicial" type="number" min={0} value={p.stock} onChange={(e) => set({ stock: Math.max(0, Number(e.target.value) || 0) })} />}
        <TextInput label="Stock mínimo" type="number" min={0} value={p.stockMinimo} onChange={(e) => set({ stockMinimo: Math.max(0, Number(e.target.value) || 0) })} />
        <TextInput label="Ubicación en el depósito" value={p.ubicacion} onChange={(e) => set({ ubicacion: e.target.value.toUpperCase() })} placeholder="A-03" />
        <Textarea className="sm:col-span-2" label="Cómo lo piden los clientes" value={sinonimos} onChange={(e) => setSinonimos(e.target.value)} rows={3} helper="Separados por coma. La IA los usa para reconocer el producto en los mensajes de WhatsApp." />
      </div>
      {variantes.length > 0 && (
        <div className="mt-6">
          <div className="dl-overline">Variantes del mismo producto</div>
          <span className="dl-brandline" aria-hidden="true" />
          <ul className="m-0 mt-3 flex list-none flex-col p-0">
            {variantes.map((v) => (
              <li key={v.id} className="flex justify-between gap-3 border-b border-arena-100 py-2 text-body-small">
                <span>{v.nombre}<span className="block text-caption text-texto-secundario">{v.codigo}</span></span>
                <span className="text-right tabular">{v.stock} {v.unidad}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
