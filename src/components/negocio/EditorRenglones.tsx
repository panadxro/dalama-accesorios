import { Alert } from '@/components/ui/Alert';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { Producto, Renglon } from '@/domain/types';
import { formatARS } from '@/lib/format';
import { precioConLista, subtotalRenglon } from '@/domain/calculos';
import { ConfianzaBadge } from './Estados';
import { textoStock } from './BuscadorProducto';

export interface RenglonEditable extends Renglon {
  /** Productos posibles si la IA no pudo decidir. */
  candidatos?: string[];
  nota?: string;
}

interface Props {
  renglones: RenglonEditable[];
  onChange?: (r: RenglonEditable[]) => void;
  productoPorId: Map<string, Producto>;
  reservado?: Map<string, number>;
  descuentoPct: number;
  /** Muestra lo que dijo el cliente y la confianza (presupuestos generados por IA). */
  mostrarIA?: boolean;
  /** Sin columna de precio unitario (va debajo del subtotal): para paneles angostos. */
  compacto?: boolean;
  className?: string;
}

/** Qué distingue a una variante de otra: color, medida o, si no, el código. */
function diferencia(actual: Producto, alt: Producto): string {
  if (alt.atributos.color && alt.atributos.color !== actual.atributos.color && alt.atributos.medida === actual.atributos.medida) return alt.atributos.color.toLowerCase();
  if (alt.atributos.medida && alt.atributos.medida !== actual.atributos.medida) return alt.atributos.medida;
  return alt.codigo;
}

/** Paso de cantidades: 1 para la mayoría, 5 o 10 para lo que se pide por muchas unidades. */
const paso = (r: Renglon) => (r.cantidad >= 50 ? 10 : r.cantidad >= 20 ? 5 : 1);

/**
 * Renglones de presupuesto o pedido: producto, cantidad con botones grandes, precio y subtotal.
 * Los que la IA no pudo identificar se resuelven eligiendo entre los candidatos.
 */
export function EditorRenglones({ renglones, onChange, productoPorId, reservado, descuentoPct, mostrarIA, compacto, className }: Props) {
  const editable = !!onChange;
  const cambiar = (id: string, cambio: Partial<RenglonEditable>) => onChange?.(renglones.map((r) => (r.id === id ? { ...r, ...cambio } : r)));
  const quitar = (id: string) => onChange?.(renglones.filter((r) => r.id !== id));
  const elegirProducto = (r: RenglonEditable, p: Producto) =>
    cambiar(r.id, { productoId: p.id, descripcion: p.nombre, precioUnitario: p.precioLista, confianza: 1, candidatos: [], nota: undefined });

  const resueltos = renglones.filter((r) => r.productoId);
  const pendientes = renglones.filter((r) => !r.productoId);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {resueltos.length > 0 && (
        <div className="dl-table-scroll">
          <table className="dl-table" style={{ minWidth: compacto ? 420 : 600 }}>
            <thead>
              <tr>
                <th scope="col">{mostrarIA ? 'Producto detectado' : 'Producto'}</th>
                <th scope="col" style={{ textAlign: 'center' }}>Cant.</th>
                {!compacto && <th scope="col" className="is-right">P. unit.</th>}
                <th scope="col" className="is-right">Subtotal</th>
                {editable && <th scope="col" className="is-right"><span className="sr-only">Quitar</span></th>}
              </tr>
            </thead>
            <tbody>
              {resueltos.map((r) => {
                const p = productoPorId.get(r.productoId!)!;
                const unit = precioConLista(r.precioUnitario, descuentoPct);
                const disp = p.stock - (reservado?.get(p.id) ?? 0);
                const falta = r.cantidad > disp;
                return (
                  <tr key={r.id} className={cn(mostrarIA && r.confianza != null && r.confianza < 0.85 && 'bg-advertencia-suave')}>
                    <td>
                      {mostrarIA && r.textoOriginal && <div className="text-caption italic text-texto-secundario">“{r.textoOriginal}”</div>}
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{p.nombre}</span>
                        {mostrarIA && <ConfianzaBadge confianza={r.confianza} />}
                      </div>
                      <div className={cn('mt-0.5 text-caption', falta ? 'font-semibold text-advertencia-texto' : 'text-texto-secundario')}>
                        {p.codigo} · {falta ? (p.stock <= 0 ? 'Sin stock: se repone con la próxima compra' : `Solo ${Math.max(0, disp)} ${p.unidad} disponibles`) : textoStock(p, reservado?.get(p.id))}
                      </div>
                      {mostrarIA && r.nota && <div className="mt-1 flex items-start gap-1 text-caption text-advertencia-texto"><Icon name="info" size={14} className="mt-px" />{r.nota}</div>}
                      {mostrarIA && editable && r.candidatos && r.candidatos.length > 1 && r.confianza != null && r.confianza < 0.85 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {r.candidatos.filter((c) => c !== r.productoId).map((c) => {
                            const alt = productoPorId.get(c);
                            return alt ? (
                              <button key={c} type="button" className="dl-btn dl-btn-tertiary dl-btn-s" style={{ minHeight: 28, paddingLeft: 6, paddingRight: 6 }} onClick={() => elegirProducto(r, alt)}>
                                Cambiar por {diferencia(p, alt)}
                              </button>
                            ) : null;
                          })}
                          <button type="button" className="dl-btn dl-btn-tertiary dl-btn-s" style={{ minHeight: 28, paddingLeft: 6, paddingRight: 6 }} onClick={() => cambiar(r.id, { confianza: 1, nota: undefined })}>
                            Está bien así
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {editable ? (
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Restar ${paso(r)} a ${p.nombre}`} disabled={r.cantidad <= 1} onClick={() => cambiar(r.id, { cantidad: Math.max(1, r.cantidad - paso(r)) })}>
                            <Icon name="minus" size={16} />
                          </button>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            aria-label={`Cantidad de ${p.nombre}`}
                            value={r.cantidad}
                            onChange={(e) => cambiar(r.id, { cantidad: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
                            className="h-8 w-12 rounded-sm border-0 bg-transparent text-center font-bold tabular [appearance:textfield] focus:bg-arena-100 [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Sumar ${paso(r)} a ${p.nombre}`} onClick={() => cambiar(r.id, { cantidad: r.cantidad + paso(r) })}>
                            <Icon name="plus" size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center font-bold tabular">{r.cantidad}</div>
                      )}
                      <div className="mt-0.5 text-center text-caption text-texto-secundario">{p.unidad}</div>
                    </td>
                    {!compacto && <td className="is-right">{formatARS(unit)}</td>}
                    <td className="is-right">
                      <span className="font-bold">{formatARS(subtotalRenglon({ cantidad: r.cantidad, precioUnitario: unit }))}</span>
                      {compacto && <span className="dl-sub">{formatARS(unit)} c/u</span>}
                    </td>
                    {editable && (
                      <td className="is-right">
                        <button type="button" className="dl-iconbtn is-danger" aria-label={`Quitar ${p.nombre}`} title="Quitar producto" onClick={() => quitar(r.id)}>
                          <Icon name="trash" size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pendientes.map((r) => (
        <div key={r.id} className="flex flex-col gap-2">
          <Alert
            tone="warning"
            title="No pudimos identificar un producto"
            action={editable ? <button type="button" className="dl-iconbtn" aria-label="Descartar este pedido del cliente" title="Descartar" onClick={() => quitar(r.id)}><Icon name="x" size={16} /></button> : undefined}
          >
            El cliente pidió “{r.textoOriginal ?? r.descripcion}”. {r.candidatos?.length ? 'Elegí cuál es.' : 'Buscalo abajo y sumalo a mano.'}
          </Alert>
          {editable && r.candidatos?.map((c) => {
            const p = productoPorId.get(c);
            if (!p) return null;
            return (
              <button
                key={c}
                type="button"
                onClick={() => elegirProducto(r, p)}
                className="flex min-h-12 w-full items-center gap-3 rounded-sm border border-neutro-500 bg-superficie px-3 py-2.5 text-left hover:border-bold-red hover:bg-rojo-50"
              >
                <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-neutro-700" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold">{p.nombre}</span>
                  <span className="block text-caption text-texto-secundario">{p.codigo} · {textoStock(p, reservado?.get(p.id))} · {r.cantidad} {p.unidad}</span>
                </span>
                <span className="font-semibold tabular">{formatARS(precioConLista(p.precioLista, descuentoPct))}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
