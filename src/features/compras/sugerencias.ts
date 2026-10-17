import { useMemo } from 'react';
import { estadoStock } from '@/domain/calculos';
import type { DatosDemo, Producto } from '@/domain/types';
import { useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';

/** Unidades pedidas en órdenes enviadas que todavía no llegaron. */
export function unidadesEnCamino(d: DatosDemo): Map<string, number> {
  const m = new Map<string, number>();
  for (const o of d.ordenesCompra) if (o.estado === 'enviada') for (const r of o.renglones) m.set(r.productoId, (m.get(r.productoId) ?? 0) + r.cantidad);
  return m;
}

/**
 * Cuánto conviene pedir de un producto: reponer hasta N veces el mínimo, sumando lo reservado
 * y restando lo que ya viene en camino. Redondeado a múltiplos de 5.
 */
export function cantidadSugerida(p: Producto, veces: number, reservado = 0, enCamino = 0): number {
  const necesario = p.stockMinimo * veces + reservado - p.stock - enCamino;
  return Math.max(0, Math.ceil(necesario / 5) * 5);
}

/** Cantidad para sumar a la lista a mano: lo sugerido o, si el stock está bien, el mínimo. */
export function cantidadInicial(p: Producto, veces: number, reservado = 0, enCamino = 0): number {
  return cantidadSugerida(p, veces, reservado, enCamino) || Math.max(1, p.stockMinimo);
}

/** Productos bajo el mínimo con la cantidad sugerida para reponer (los que ya están cubiertos no aparecen). */
export function useSugerencias() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  return useMemo(() => {
    const veces = datos.ajustes.reponerHastaVecesMinimo;
    const enCamino = unidadesEnCamino(datos);
    const sugeridos = datos.productos
      .filter((p) => p.activo && estadoStock(p) !== 'ok')
      .map((p) => ({ p, cantidad: cantidadSugerida(p, veces, der.reservado.get(p.id) ?? 0, enCamino.get(p.id) ?? 0) }))
      .filter((x) => x.cantidad > 0);
    return { sugeridos, enCamino, veces };
  }, [datos, der]);
}

/** Cantidad inicial de un producto con los datos actuales (para los botones "Agregar a la lista"). */
export function useCantidadInicial() {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  return useMemo(() => {
    const enCamino = unidadesEnCamino(datos);
    const veces = datos.ajustes.reponerHastaVecesMinimo;
    return (p: Producto) => cantidadInicial(p, veces, der.reservado.get(p.id) ?? 0, enCamino.get(p.id) ?? 0);
  }, [datos, der]);
}
