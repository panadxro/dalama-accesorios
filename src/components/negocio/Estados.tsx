import { Badge, StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import type { IconName } from '@/components/ui/Icon';
import { ESTADO_PEDIDO, ESTADO_PRESUPUESTO } from '@/domain/calculos';
import type { EstadoPedido, EstadoPresupuestoVisible } from '@/domain/types';
import { nivelConfianza } from '@/services/ia/interpretarPedido';

export function PresupuestoBadge({ estado }: { estado: EstadoPresupuestoVisible }) {
  return <StatusBadge status={estado}>{ESTADO_PRESUPUESTO[estado]}</StatusBadge>;
}

const PEDIDO: Record<EstadoPedido, [BadgeTone, IconName]> = {
  confirmado: ['neutral', 'check'],
  en_preparacion: ['warning', 'clock'],
  listo: ['neutral', 'package'],
  despachado: ['info', 'send'],
  entregado: ['success', 'check-circle'],
  cancelado: ['error', 'x'],
};

export function PedidoBadge({ estado }: { estado: EstadoPedido }) {
  const [tone, icon] = PEDIDO[estado];
  return <Badge tone={tone} icon={icon}>{ESTADO_PEDIDO[estado]}</Badge>;
}

/** Estado de cobro de una factura. */
export function CobroBadge({ pendiente, total, vencida }: { pendiente: number; total: number; vencida: boolean }) {
  if (pendiente <= 0) return <StatusBadge status="pagado">Pagada</StatusBadge>;
  if (vencida) return <StatusBadge status="deuda-vencida">Vencida</StatusBadge>;
  if (pendiente < total) return <Badge tone="info" icon="clock">Pago parcial</Badge>;
  return <Badge tone="neutral" icon="clock">A cobrar</Badge>;
}

/** Nivel de confianza de la interpretación de la IA, con texto (no solo color). */
export function ConfianzaBadge({ confianza }: { confianza?: number }) {
  if (confianza == null) return null;
  const nivel = nivelConfianza(confianza);
  const pct = `${Math.round(confianza * 100)} %`;
  if (nivel === 'alta') return <Badge tone="success" icon="check">{`Seguro · ${pct}`}</Badge>;
  if (nivel === 'media') return <Badge tone="warning" icon="alert-triangle">{`Revisar · ${pct}`}</Badge>;
  return <Badge tone="error" icon="alert-circle">Sin identificar</Badge>;
}
