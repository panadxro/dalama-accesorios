import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, MoneyInput, Select, TextInput, toast } from '@/components/ui';
import { totales } from '@/domain/calculos';
import type { Pedido } from '@/domain/types';
import { formatARS } from '@/lib/format';
import { solicitarCAE } from '@/services/arca';
import { confirmarEntrega, ejecutar, emitirFactura, type MedioCobro } from '@/store/acciones';
import { datosActuales } from '@/store/demo';
import { derivar } from '@/store/selectores';

/**
 * Confirmación de entrega: quién recibió y, si correspondía, el cobro en el momento.
 * Si el pedido de contado todavía no tiene factura, se factura antes de entregar.
 */
export function ConfirmarEntrega({ pedido, open, onClose }: { pedido: Pedido; open: boolean; onClose: () => void }) {
  const d = datosActuales();
  const cliente = d.clientes.find((c) => c.id === pedido.clienteId)!;
  const total = totales(pedido.renglones, pedido.descuentoPct, d.ajustes.ivaPct).total;
  const pendiente = pedido.comprobanteId ? derivar(d).pendientes.get(pedido.comprobanteId) ?? 0 : total;
  const cobrar = !!pedido.entrega.cobrarAlEntregar && pendiente > 0;
  const facturar = !pedido.comprobanteId;

  const [recibio, setRecibio] = useState(cliente.contacto.split(' ')[0]);
  const [medio, setMedio] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [importe, setImporte] = useState<number | null>(pendiente);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (open) { setRecibio(cliente.contacto.split(' ')[0]); setImporte(pendiente); setMedio('efectivo'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const confirmar = async () => {
    setCargando(true);
    let numeroFactura: string | undefined;
    if (facturar) {
      const letra = cliente.condicionIVA === 'RI' || cliente.condicionIVA === 'MONOTRIBUTO' ? 'A' : 'B';
      const cae = await solicitarCAE({ letra, clase: 'factura', puntoVenta: d.empresa.puntoVenta, numero: d.secuencias.factura[letra], total });
      const r = ejecutar((x) => emitirFactura(x, pedido.id, cae));
      numeroFactura = `Factura ${r.comprobante.letra} ${String(r.comprobante.numero).padStart(8, '0')}`;
    }
    const cobro: MedioCobro | undefined = cobrar && importe ? (medio === 'efectivo' ? { tipo: 'efectivo', importe } : { tipo: 'transferencia', importe, banco: 'Transferencia', operacion: 'Al entregar' }) : undefined;
    const r = ejecutar((x) => confirmarEntrega(x, pedido.id, { recibidoPor: recibio || undefined, cobro }));
    setCargando(false);
    onClose();
    const saldo = derivar(datosActuales()).cuentas.get(cliente.id)!.saldo;
    toast.success(
      `Pedido ${pedido.numero} entregado`,
      [
        numeroFactura && `Se emitió la ${numeroFactura} y se descontó el stock.`,
        r.cobro ? `Se cobraron ${formatARS(r.cobro.total)} en ${medio}: el saldo de ${cliente.razonSocial} quedó en ${formatARS(saldo)}.` : 'Quedó registrado en el historial del cliente.',
      ].filter(Boolean).join(' '),
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && !cargando && onClose()}
      overline={`Pedido ${pedido.numero}`}
      title="Confirmar entrega"
      description={`${cliente.razonSocial} · ${pedido.entrega.direccion}`}
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={cargando}>Cancelar</Button>
          <Button icon="check" loading={cargando} onClick={confirmar}>
            {cargando ? (facturar ? 'Pidiendo CAE…' : 'Confirmando…') : facturar ? 'Facturar y entregar' : cobrar ? 'Cobrar y entregar' : 'Confirmar entrega'}
          </Button>
        </>
      }
    >
      {facturar && (
        <Alert tone="info" title="Este pedido todavía no tiene factura">
          Al confirmar se emite la factura (CAE simulado), se descuenta el stock y después se registra la entrega.
        </Alert>
      )}
      <TextInput label="Recibió" value={recibio} onChange={(e) => setRecibio(e.target.value)} helper="Nombre de quien firma el remito." />
      {cobrar && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Cobro al entregar" value={medio} onChange={(e) => setMedio(e.target.value as 'efectivo' | 'transferencia')} options={[{ value: 'efectivo', label: 'Efectivo' }, { value: 'transferencia', label: 'Transferencia' }]} />
          <MoneyInput label="Importe" value={importe} onValueChange={setImporte} helper={`A cobrar: ${formatARS(pendiente)}`} />
        </div>
      )}
    </Dialog>
  );
}
