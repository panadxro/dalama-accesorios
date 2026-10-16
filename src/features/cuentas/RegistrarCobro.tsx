import { useEffect, useMemo, useState } from 'react';
import { Button, ConfirmModal, DateInput, Icon, MoneyInput, Select, Switch, Tabs, TextInput, toast } from '@/components/ui';
import { codigoComprobante } from '@/domain/calculos';
import type { Cliente } from '@/domain/types';
import { cn } from '@/lib/cn';
import { aISO, conHora, diasEntre, sumarDias } from '@/lib/fechas';
import { formatARS, formatFecha } from '@/lib/format';
import { descargarPDF, pdfRecibo } from '@/services/pdf/documentos';
import { ejecutar, registrarCobro, type MedioCobro } from '@/store/acciones';
import { datosActuales, useDemo } from '@/store/demo';
import { useDerivados } from '@/store/selectores';

type Medio = MedioCobro['tipo'];

const BANCOS = ['Banco Nación', 'Banco Provincia', 'Banco Galicia', 'Banco Santander', 'BBVA', 'Banco Macro', 'Banco Credicoop', 'ICBC', 'Banco Supervielle', 'Banco Patagonia'];
const pad = (n: number) => String(n).padStart(2, '0');
const aInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const deInput = (s: string, h = 12) => { const [y, m, d] = s.split('-').map(Number); return aISO(conHora(new Date(y, m - 1, d), h)); };

/**
 * Registrar un cobro: medio de pago, importe e imputación a las facturas pendientes (de la más vieja a la más nueva).
 * Al confirmar se emite el recibo, baja el saldo y, si es cheque, entra a la cartera.
 */
export function RegistrarCobro({ cliente, preseleccion, onListo }: { cliente: Cliente; preseleccion?: string; onListo?: () => void }) {
  const datos = useDemo((s) => s.datos);
  const der = useDerivados();
  const cuenta = der.cuentas.get(cliente.id)!;

  const pendientes = useMemo(
    () => datos.comprobantes
      .filter((c) => c.clienteId === cliente.id && c.clase === 'factura' && (der.pendientes.get(c.id) ?? 0) > 0)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((c) => ({ c, pendiente: der.pendientes.get(c.id)! })),
    [datos.comprobantes, der.pendientes, cliente.id],
  );

  const [medio, setMedio] = useState<Medio>(cliente.tipo === 'aberturista' ? 'transferencia' : 'efectivo');
  const sugerido = preseleccion ? pendientes.find((p) => p.c.id === preseleccion)?.pendiente : cuenta.vencido || pendientes[0]?.pendiente;
  const [importe, setImporte] = useState<number | null>(sugerido ?? null);
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [fecha, setFecha] = useState(aInput(new Date()));
  const [banco, setBanco] = useState(BANCOS[0]);
  const [numero, setNumero] = useState('');
  const [cobroEl, setCobroEl] = useState(aInput(sumarDias(new Date(), 30)));
  const [echeq, setEcheq] = useState(true);
  const [tarjeta, setTarjeta] = useState('Visa débito');
  const [cuotas, setCuotas] = useState('1');
  const [confirmar, setConfirmar] = useState(false);
  const [error, setError] = useState<string>();

  // Imputación automática: cubre primero las facturas más viejas.
  useEffect(() => {
    if (preseleccion) { setSeleccion([preseleccion]); return; }
    let resto = importe ?? 0;
    const sel: string[] = [];
    for (const p of pendientes) {
      if (resto <= 0) break;
      sel.push(p.c.id);
      resto -= p.pendiente;
    }
    setSeleccion(sel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importe, pendientes.length]);

  // Reparto del importe entre las facturas elegidas, en orden.
  let resto = importe ?? 0;
  const imputaciones = pendientes.filter((p) => seleccion.includes(p.c.id)).map((p) => {
    const imp = Math.min(resto, p.pendiente);
    resto -= imp;
    return { comprobanteId: p.c.id, importe: Math.max(0, imp) };
  });
  const imputado = imputaciones.reduce((a, i) => a + i.importe, 0);
  const aCuenta = Math.max(0, (importe ?? 0) - imputado);
  const saldoDespues = cuenta.saldo - (importe ?? 0);

  const validar = () => {
    if (!importe || importe <= 0) return 'Ingresá el importe cobrado.';
    if (medio === 'cheque' && numero.trim().length < 4) return 'Ingresá el número de cheque.';
    if (medio === 'transferencia' && numero.trim().length < 3) return 'Ingresá el número de operación del comprobante de transferencia.';
    return undefined;
  };

  const registrar = () => {
    setConfirmar(false);
    const fechaISO = deInput(fecha, new Date().getHours());
    const m: MedioCobro =
      medio === 'efectivo' ? { tipo: 'efectivo', importe: importe! }
        : medio === 'transferencia' ? { tipo: 'transferencia', importe: importe!, banco, operacion: numero }
          : medio === 'cheque' ? { tipo: 'cheque', importe: importe!, banco, numero, cobroEl: deInput(cobroEl, 9), echeq }
            : { tipo: 'tarjeta', importe: importe!, tarjeta, cuotas: Number(cuotas), cupon: numero || '—' };
    const r = ejecutar((d) => registrarCobro(d, { clienteId: cliente.id, medios: [m], imputaciones, fecha: fechaISO, notas: aCuenta ? `Incluye ${formatARS(aCuenta)} a cuenta` : undefined }));
    const detalle = [
      `Se descontó ${formatARS(r.cobro.total)} del saldo de ${cliente.razonSocial}: quedó en ${formatARS(saldoDespues)}.`,
      imputaciones.length ? `${imputaciones.filter((i) => i.importe > 0).length} ${imputaciones.length === 1 ? 'factura imputada' : 'facturas imputadas'}.` : 'Quedó a cuenta.',
      r.cheques.length ? `El cheque entró a la cartera con fecha de cobro ${formatFecha(r.cheques[0].cobroEl)}.` : '',
    ].filter(Boolean).join(' ');
    toast.show({
      tone: 'success',
      title: `Cobro registrado · recibo ${r.cobro.numero}`,
      description: detalle,
      action: { label: 'Descargar recibo', onClick: async () => descargarPDF(await pdfRecibo(datosActuales(), r.cobro), `Recibo ${r.cobro.numero}`) },
    });
    setNumero('');
    onListo?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs<Medio>
        label="Medio de pago"
        value={medio}
        onChange={(m) => { setMedio(m); setNumero(''); setError(undefined); }}
        tabs={[{ id: 'efectivo', label: 'Efectivo' }, { id: 'transferencia', label: 'Transferencia' }, { id: 'cheque', label: 'Cheque' }, { id: 'tarjeta', label: 'Tarjeta' }]}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {medio === 'cheque' && (
          <>
            <Select label="Banco" value={banco} onChange={(e) => setBanco(e.target.value)} options={BANCOS} />
            <TextInput label="N.° de cheque" value={numero} onChange={(e) => setNumero(e.target.value)} inputMode="numeric" error={error && medio === 'cheque' && numero.length < 4 ? error : undefined} />
            <DateInput label="Fecha de cobro" value={cobroEl} onChange={(e) => setCobroEl(e.target.value)} helper={diasEntre(new Date(), deInput(cobroEl)) > 0 ? 'Cheque diferido' : 'Al día'} />
          </>
        )}
        {medio === 'transferencia' && (
          <>
            <Select label="Banco de origen" value={banco} onChange={(e) => setBanco(e.target.value)} options={BANCOS} />
            <TextInput label="N.° de operación" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Del comprobante" error={error && numero.length < 3 ? error : undefined} />
          </>
        )}
        {medio === 'tarjeta' && (
          <>
            <Select label="Tarjeta" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} options={['Visa débito', 'Visa crédito', 'Mastercard', 'Cabal', 'Naranja X']} />
            <Select label="Cuotas" value={cuotas} onChange={(e) => setCuotas(e.target.value)} options={['1', '3', '6']} />
            <TextInput label="Lote / cupón" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Del ticket del posnet" />
          </>
        )}
        {medio !== 'cheque' && <DateInput label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} />}
        <MoneyInput label="Importe" value={importe} onValueChange={(v) => { setImporte(v); setError(undefined); }} error={error && (!importe || importe <= 0) ? error : undefined} />
        {medio === 'cheque' && <div className="flex items-end pb-2"><Switch checked={echeq} onChange={setEcheq}>Es un e-cheq</Switch></div>}
      </div>

      <div>
        <div className="dl-label mb-2">Imputar a comprobantes</div>
        {pendientes.length === 0 ? (
          <p className="m-0 rounded-sm bg-arena-100 p-3 text-body-small text-texto-secundario">No hay facturas pendientes: el cobro queda a cuenta como saldo a favor.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {pendientes.map(({ c, pendiente }) => {
              const on = seleccion.includes(c.id);
              const vencida = diasEntre(c.vencePago, new Date()) > 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSeleccion((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                  className={cn('flex w-full items-center gap-3 rounded-sm border px-3 py-2.5 text-left', on ? 'border-ink-black bg-arena-50' : 'border-borde bg-superficie hover:border-neutro-500')}
                >
                  <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-[3px] border-2', on ? 'border-ink-black bg-ink-black text-neutro-0' : 'border-neutro-500')}>
                    {on && <Icon name="check" size={14} strokeWidth={2.5} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-small font-semibold tabular">{codigoComprobante(c)}</span>
                    <span className={cn('block text-caption', vencida ? 'font-semibold text-error' : 'text-texto-secundario')}>
                      {formatFecha(c.fecha)} · {vencida ? `vencida hace ${diasEntre(c.vencePago, new Date())} días` : `vence el ${formatFecha(c.vencePago)}`}
                    </span>
                  </span>
                  <span className="text-body-small font-semibold tabular">{formatARS(pendiente)}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="mt-3 flex justify-between text-body"><span className="text-texto-secundario">Imputado</span><span className="font-bold tabular">{formatARS(imputado)}</span></div>
        {aCuenta > 0 && <div className="mt-1 flex justify-between text-body"><span className="text-texto-secundario">A cuenta</span><span className="font-bold tabular">{formatARS(aCuenta)}</span></div>}
        <div className="mt-1 flex justify-between text-body"><span className="text-texto-secundario">Saldo después del cobro</span><span className="font-bold tabular">{formatARS(saldoDespues)}</span></div>
      </div>

      {error && <p className="dl-help is-error m-0" role="alert"><Icon name="alert-circle" size={16} />{error}</p>}
      <Button icon="check" onClick={() => { const e = validar(); setError(e); if (!e) setConfirmar(true); }}>Registrar cobro y emitir recibo</Button>

      <ConfirmModal
        open={confirmar}
        title="Registrar cobro"
        confirmLabel="Registrar y emitir recibo"
        onCancel={() => setConfirmar(false)}
        onConfirm={registrar}
      >
        Se registra {formatARS(importe ?? 0)} en {medio === 'efectivo' ? 'efectivo' : medio === 'transferencia' ? 'transferencia' : medio === 'cheque' ? `cheque ${banco}` : tarjeta.toLowerCase()} de {cliente.razonSocial}, se emite el recibo {`RC ${String(1).padStart(4, '0')}-${String(datos.secuencias.recibo).padStart(8, '0')}`} y el saldo queda en {formatARS(saldoDespues)}.
      </ConfirmModal>
    </div>
  );
}
