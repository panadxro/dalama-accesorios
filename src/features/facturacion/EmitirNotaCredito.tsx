import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Dialog, Icon, Select, Switch, toast } from '@/components/ui';
import { nombreComprobante, numeroFiscal, precioConLista, totales } from '@/domain/calculos';
import type { Comprobante, Renglon } from '@/domain/types';
import { formatARS } from '@/lib/format';
import { ArcaError, solicitarCAE } from '@/services/arca';
import { ejecutar, emitirNotaCredito } from '@/store/acciones';
import { useDemo } from '@/store/demo';

const MOTIVOS = ['Devolución por falla', 'Error en el color o la medida', 'Devolución de sobrante', 'Bonificación comercial'];

/** Nota de crédito sobre una factura: se elige qué se devuelve; si es mercadería, vuelve al stock. */
export function EmitirNotaCredito({ factura, open, onClose }: { factura: Comprobante; open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const datos = useDemo((s) => s.datos);
  const cliente = datos.clientes.find((c) => c.id === factura.clienteId)!;

  // Lo ya acreditado en otras notas de crédito no se puede volver a acreditar.
  const yaAcreditado = new Map<string, number>();
  for (const nc of datos.comprobantes.filter((c) => c.asociadoId === factura.id)) {
    for (const r of nc.renglones) if (r.productoId) yaAcreditado.set(r.productoId, (yaAcreditado.get(r.productoId) ?? 0) + r.cantidad);
  }
  const disponible = (r: Renglon) => r.cantidad - (r.productoId ? yaAcreditado.get(r.productoId) ?? 0 : 0);

  const [cant, setCant] = useState<Record<string, number>>({});
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [reingresa, setReingresa] = useState(true);
  const [estado, setEstado] = useState<'form' | 'pidiendo' | 'error'>('form');

  useEffect(() => {
    if (open) { setCant({}); setMotivo(MOTIVOS[0]); setReingresa(true); setEstado('form'); }
  }, [open]);

  const renglones: Renglon[] = factura.renglones.filter((r) => (cant[r.id] ?? 0) > 0).map((r) => ({ ...r, cantidad: cant[r.id] }));
  const t = totales(renglones, factura.descuentoPct, datos.ajustes.ivaPct);
  const unidades = renglones.reduce((a, r) => a + r.cantidad, 0);
  const numero = numeroFiscal(factura.puntoVenta, datos.secuencias.notaCredito[factura.letra]);

  const emitir = async () => {
    setEstado('pidiendo');
    try {
      const cae = await solicitarCAE({ letra: factura.letra, clase: 'nota_credito', puntoVenta: factura.puntoVenta, numero: datos.secuencias.notaCredito[factura.letra], total: t.total });
      const nc = ejecutar((d) => emitirNotaCredito(d, factura.id, { renglones, motivo, reingresaStock: reingresa, ...cae }));
      onClose();
      toast.show({
        tone: 'success',
        title: `${nombreComprobante(nc)} emitida`,
        description: `Se descontó ${formatARS(nc.total)} de la cuenta corriente de ${cliente.razonSocial}${reingresa ? ` y volvieron ${unidades} unidades al stock` : ''}.`,
        action: { label: 'Ver nota de crédito', onClick: () => navigate(`/facturacion/${nc.id}`) },
      });
    } catch (e) {
      setEstado('error');
      if (!(e instanceof ArcaError)) throw e;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && estado !== 'pidiendo' && onClose()}
      overline={`Sobre la ${nombreComprobante(factura)}`}
      title={`Nota de crédito ${factura.letra} ${numero}`}
      description={`${cliente.razonSocial}. Elegí qué se acredita.`}
      width={620}
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={estado === 'pidiendo'}>Cancelar</Button>
        <Button icon="receipt" loading={estado === 'pidiendo'} disabled={!renglones.length} onClick={emitir}>{estado === 'pidiendo' ? 'Esperando a ARCA…' : `Emitir por ${formatARS(t.total)}`}</Button>
      </>}
    >
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {factura.renglones.map((r) => {
          const max = disponible(r);
          const v = cant[r.id] ?? 0;
          return (
            <li key={r.id} className="flex items-center gap-3 rounded-sm border border-borde px-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-semibold">{r.descripcion}</span>
                <span className="block text-caption text-texto-secundario">Facturadas {r.cantidad}{max < r.cantidad ? ` · ya acreditadas ${r.cantidad - max}` : ''} · {formatARS(precioConLista(r.precioUnitario, factura.descuentoPct))} c/u</span>
              </span>
              <span className="flex items-center gap-1">
                <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Restar uno a ${r.descripcion}`} disabled={v <= 0} onClick={() => setCant((c) => ({ ...c, [r.id]: v - 1 }))}><Icon name="minus" size={16} /></button>
                <span className="w-8 text-center font-bold tabular" aria-live="polite">{v}</span>
                <button type="button" className="dl-iconbtn border border-neutro-500" aria-label={`Sumar uno a ${r.descripcion}`} disabled={v >= max} onClick={() => setCant((c) => ({ ...c, [r.id]: v + 1 }))}><Icon name="plus" size={16} /></button>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Motivo" value={motivo} onChange={(e) => { setMotivo(e.target.value); setReingresa(e.target.value !== 'Bonificación comercial'); }} options={MOTIVOS} />
        <div className="flex items-end pb-1"><Switch checked={reingresa} onChange={setReingresa}>La mercadería vuelve al stock</Switch></div>
      </div>
      {estado === 'error' && <Alert tone="error" title="La nota de crédito no se emitió">ARCA no respondió a tiempo. No se generó número ni CAE. Volvé a intentarlo.</Alert>}
      <div className="flex justify-between rounded-sm bg-arena-100 p-3 text-body">
        <span className="text-texto-secundario">Neto {formatARS(t.neto)} · IVA {formatARS(t.iva)}</span>
        <strong className="tabular">Total {formatARS(t.total)}</strong>
      </div>
    </Dialog>
  );
}
