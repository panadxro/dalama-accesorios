import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Alert, Badge, Button, Card, Icon, SearchInput, toast } from '@/components/ui';
import type { Producto } from '@/domain/types';
import { cn } from '@/lib/cn';
import { diasEntre } from '@/lib/fechas';
import { ejecutar, cerrarConteo } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { normalizar } from '@/store/selectores';

const ESTANTES: Record<string, string> = { A: 'Bisagras y ruedas', B: 'Manijas y cerraduras', C: 'Burletes y felpas', D: 'Rieles', E: 'Mosquiteros', F: 'Tornillería y selladores' };

type Paso = { tipo: 'elegir' } | { tipo: 'contando'; estante: string; i: number } | { tipo: 'resumen'; estante: string };

/** Conteo de inventario estante por estante, con botones grandes para usar en el depósito. */
export default function ConteoPage() {
  const navigate = useNavigate();
  const datos = useDemo((s) => s.datos);
  const [paso, setPaso] = useState<Paso>({ tipo: 'elegir' });
  const [contado, setContado] = useState<Record<string, number>>({});
  const [buscar, setBuscar] = useState(false);
  const [q, setQ] = useState('');

  const productosDe = (e: string) => datos.productos.filter((p) => p.ubicacion.startsWith(e)).sort((a, b) => a.ubicacion.localeCompare(b.ubicacion));
  const ultimoConteo = (e: string) => datos.conteos.find((c) => c.estante === `Estante ${e}`);

  const estante = paso.tipo === 'elegir' ? '' : paso.estante;
  const lista = useMemo(() => (estante ? productosDe(estante) : []), [estante, datos.productos]); // eslint-disable-line react-hooks/exhaustive-deps
  const actual: Producto | undefined = paso.tipo === 'contando' ? lista[paso.i] : undefined;
  const valor = actual ? contado[actual.id] ?? 0 : 0;
  const setValor = (v: number) => actual && setContado((c) => ({ ...c, [actual.id]: Math.max(0, v) }));

  const empezar = (e: string) => {
    setContado({});
    setPaso({ tipo: 'contando', estante: e, i: 0 });
  };
  const siguiente = () => {
    if (paso.tipo !== 'contando' || !actual) return;
    if (contado[actual.id] === undefined) setContado((c) => ({ ...c, [actual.id]: 0 }));
    if (paso.i + 1 < lista.length) setPaso({ ...paso, i: paso.i + 1 });
    else setPaso({ tipo: 'resumen', estante: paso.estante });
  };

  const diferencias = lista.map((p) => ({ p, contado: contado[p.id] ?? 0, dif: (contado[p.id] ?? 0) - p.stock })).filter((x) => x.dif !== 0);

  const cerrar = () => {
    const r = ejecutar((d) => cerrarConteo(d, `Estante ${estante}`, lista.map((p) => ({ productoId: p.id, contado: contado[p.id] ?? 0 }))));
    toast.success(`Estante ${estante} cerrado`, r.diferencias ? `Se ajustaron ${r.diferencias} productos (${r.unidades} unidades de diferencia). Quedan en el historial de movimientos como “conteo”.` : 'Todo coincidió con el sistema: no hubo que ajustar nada.');
    setPaso({ tipo: 'elegir' });
  };

  const cabecera = (
    <header className="bg-ink-black px-4 py-3 text-neutro-0">
      <div className="flex items-center gap-3">
        <button type="button" className="dl-iconbtn -ml-2 h-11 w-11 text-neutro-300 hover:bg-neutro-0/10 hover:text-neutro-0" aria-label={paso.tipo === 'elegir' ? 'Volver a stock' : 'Salir del conteo'} onClick={() => (paso.tipo === 'elegir' ? navigate('/stock') : setPaso({ tipo: 'elegir' }))}>
          <Icon name="arrow-left" size={22} />
        </button>
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutro-300">Conteo de inventario</div>
          <h1 className="m-0 text-[18px] font-semibold leading-6">{estante ? `Estante ${estante} · ${ESTANTES[estante]}` : 'Elegí el estante'}</h1>
        </div>
      </div>
      {paso.tipo === 'contando' && (
        <div className="mt-3 flex gap-[3px]" aria-hidden="true">
          {lista.map((p, i) => <span key={p.id} className={cn('h-1 flex-1', i < paso.i ? 'bg-rojo-dalama' : i === paso.i ? 'bg-neutro-0' : 'bg-neutro-700')} />)}
        </div>
      )}
    </header>
  );

  return (
    <Page title="Conteo de inventario" overline="Catálogo · Depósito" mobileHeader={cabecera}>
      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4">
        {paso.tipo === 'elegir' && (
          <>
            <p className="m-0 text-body text-texto-secundario">Se cuenta estante por estante. La cantidad del sistema no se muestra hasta el final, así el conteo es a ciegas.</p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {Object.keys(ESTANTES).map((e) => {
                const u = ultimoConteo(e);
                const n = productosDe(e).length;
                return (
                  <li key={e}>
                    <button type="button" disabled={!n} onClick={() => empezar(e)} className="flex min-h-16 w-full items-center gap-3 rounded-md border border-borde bg-superficie p-4 text-left shadow-1 hover:border-ink-black disabled:opacity-60">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink-black text-h2 font-bold text-neutro-0">{e}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-h3 font-semibold">{ESTANTES[e]}</span>
                        <span className="block text-caption text-texto-secundario">{n} productos · {u ? (diasEntre(u.fecha, new Date()) === 0 ? 'contado hoy' : `contado hace ${diasEntre(u.fecha, new Date())} días`) : 'nunca contado'}</span>
                      </span>
                      {n > 0 && (!u || diasEntre(u.fecha, new Date()) > 14) && <Badge tone="warning">Sugerido</Badge>}
                      <Icon name="chevron-right" size={20} className="text-neutro-700" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {paso.tipo === 'contando' && actual && (
          <>
            <Card className="flex flex-col gap-1 text-center">
              <div className="dl-overline">Producto a contar · {paso.i + 1} de {lista.length}</div>
              <h2 className="m-0 mt-1 text-h2">{actual.nombre}</h2>
              <p className="m-0 text-body-small text-texto-secundario">{actual.codigo} · estante {actual.ubicacion} · se cuenta en {actual.unidad}</p>
            </Card>
            <div className="flex items-center justify-center gap-4">
              <button type="button" className="grid h-16 w-16 place-items-center rounded-md border-2 border-ink-black bg-superficie active:bg-arena-200" aria-label="Restar uno" onClick={() => setValor(valor - 1)}><Icon name="minus" size={28} /></button>
              <div className="min-w-[120px] text-center">
                <label htmlFor="contadas" className="sr-only">Unidades contadas</label>
                <input id="contadas" type="number" inputMode="numeric" value={valor} onChange={(e) => setValor(Math.round(Number(e.target.value) || 0))} className="w-[120px] bg-transparent text-center text-[56px] font-bold leading-[64px] tabular outline-none [appearance:textfield] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-foco [&::-webkit-inner-spin-button]:appearance-none" />
                <div className="text-body-small text-texto-secundario">contadas</div>
              </div>
              <button type="button" className="grid h-16 w-16 place-items-center rounded-md bg-ink-black text-neutro-0 active:bg-neutro-700" aria-label="Sumar uno" onClick={() => setValor(valor + 1)}><Icon name="plus" size={28} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" className="min-h-12" onClick={() => setValor(valor + 10)}>+10</Button>
              <Button variant="secondary" className="min-h-12" onClick={() => setValor(0)}>Borrar</Button>
            </div>
            <Button className="min-h-14 text-[16px]" iconRight="arrow-right" onClick={siguiente}>{paso.i + 1 < lista.length ? 'Confirmar y seguir' : 'Confirmar y ver diferencias'}</Button>
            <div className="flex justify-between gap-2">
              <Button variant="tertiary" icon="chevron-left" disabled={paso.i === 0} onClick={() => setPaso({ ...paso, i: paso.i - 1 })}>Anterior</Button>
              <Button variant="tertiary" icon="search" onClick={() => setBuscar((v) => !v)}>Buscar por código</Button>
            </div>
            {buscar && (
              <div className="flex flex-col gap-2">
                <SearchInput label="Código o nombre" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
                {q.trim().length >= 2 && lista.filter((p) => normalizar(`${p.codigo} ${p.nombre}`).includes(normalizar(q.trim()))).map((p) => (
                  <button key={p.id} type="button" className="rounded-sm border border-borde bg-superficie px-3 py-2.5 text-left hover:border-ink-black" onClick={() => { setPaso({ ...paso, i: lista.indexOf(p) }); setBuscar(false); setQ(''); }}>
                    <span className="block font-semibold">{p.nombre}</span><span className="block text-caption text-texto-secundario">{p.codigo}</span>
                  </button>
                ))}
              </div>
            )}
            {Object.keys(contado).length > 0 && (
              <div>
                <div className="dl-overline mb-2">Ya contados</div>
                <ul className="m-0 flex list-none flex-col p-0">
                  {lista.filter((p) => contado[p.id] !== undefined && p.id !== actual.id).map((p) => (
                    <li key={p.id}><button type="button" className="flex w-full justify-between gap-2 border-b border-arena-100 py-2 text-left text-body-small" onClick={() => setPaso({ ...paso, i: lista.indexOf(p) })}><span>{p.nombre}</span><strong className="tabular">{contado[p.id]}</strong></button></li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {paso.tipo === 'resumen' && (
          <>
            <Alert tone={diferencias.length ? 'warning' : 'success'} title={`Estante ${estante} terminado`}>
              {diferencias.length ? `${diferencias.length} de ${lista.length} productos no coinciden con el sistema. Revisalos antes de ajustar.` : `Los ${lista.length} productos coinciden con el sistema.`}
            </Alert>
            {diferencias.length > 0 && (
              <Card className="p-0">
                <ul className="m-0 list-none p-0">
                  {diferencias.map(({ p, contado: c, dif }) => (
                    <li key={p.id} className="flex items-center gap-3 border-b border-arena-100 px-4 py-3 last:border-0">
                      <span className="min-w-0 flex-1"><span className="block font-semibold">{p.nombre}</span><span className="block text-caption text-texto-secundario">Sistema {p.stock} · contado {c}</span></span>
                      <strong className={cn('tabular', dif > 0 ? 'text-exito' : 'text-error')}>{dif > 0 ? `+${dif}` : `−${Math.abs(dif)}`}</strong>
                      <button type="button" className="dl-iconbtn" aria-label={`Volver a contar ${p.nombre}`} onClick={() => setPaso({ tipo: 'contando', estante, i: lista.indexOf(p) })}><Icon name="pencil" size={16} /></button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            <Button className="min-h-14 text-[16px]" icon="check" onClick={cerrar}>{diferencias.length ? 'Ajustar stock y cerrar' : 'Cerrar el conteo'}</Button>
            <Button variant="secondary" className="min-h-12" onClick={() => setPaso({ tipo: 'contando', estante, i: 0 })}>Revisar desde el principio</Button>
          </>
        )}
      </div>
    </Page>
  );
}
