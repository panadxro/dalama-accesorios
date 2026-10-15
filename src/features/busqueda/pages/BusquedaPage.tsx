import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SearchInput } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/States';
import { useDemo } from '@/store/demo';
import { buscar, type ResultadoBusqueda } from '@/store/selectores';

const GRUPOS: Array<{ tipo: ResultadoBusqueda['tipo']; titulo: string; icon: IconName }> = [
  { tipo: 'cliente', titulo: 'Clientes', icon: 'users' },
  { tipo: 'producto', titulo: 'Productos', icon: 'tag' },
  { tipo: 'presupuesto', titulo: 'Presupuestos', icon: 'file-text' },
  { tipo: 'pedido', titulo: 'Pedidos', icon: 'package' },
  { tipo: 'comprobante', titulo: 'Comprobantes', icon: 'receipt' },
];

const SUGERENCIAS = ['Rossi', 'bisagra 3 agujas', 'P-0990', 'Lomas de Zamora', 'modena'];

export default function BusquedaPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const datos = useDemo((s) => s.datos);

  // Si la búsqueda llega desde la barra superior, actualizar el campo.
  useEffect(() => {
    setQ(params.get('q') ?? '');
  }, [params]);

  const resultados = useMemo(() => buscar(datos, q), [datos, q]);

  const cambiar = (v: string) => {
    setQ(v);
    setParams(v.trim() ? { q: v } : {}, { replace: true });
  };

  return (
    <Page title="Buscar" overline="Clientes, productos y comprobantes">
      <SearchInput
        label="Buscar en DALAMA"
        hideLabel
        placeholder="Nombre, CUIT, código de producto o número de comprobante"
        value={q}
        onChange={(e) => cambiar(e.target.value)}
        autoFocus
      />

      {q.trim().length < 2 ? (
        <Card className="p-0">
          <EmptyState
            icon="search"
            title="Escribí al menos dos letras"
            text="Buscá clientes por nombre, CUIT o teléfono; productos por código o como los piden; y comprobantes por número."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {SUGERENCIAS.map((s) => (
                  <button key={s} type="button" className="dl-btn dl-btn-secondary dl-btn-s" onClick={() => cambiar(s)}>
                    {s}
                  </button>
                ))}
              </div>
            }
          />
        </Card>
      ) : resultados.length === 0 ? (
        <Card className="p-0">
          <EmptyState icon="search" title={`No encontramos nada para “${q.trim()}”`} text="Probá con menos palabras, sin tildes o con el código del producto." />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <p className="sr-only" role="status">{resultados.length} resultados</p>
          {GRUPOS.map((g) => {
            const items = resultados.filter((r) => r.tipo === g.tipo);
            if (!items.length) return null;
            return (
              <Card key={g.tipo} className="flex flex-col gap-3">
                <SectionTitle overline={`${items.length} ${items.length === 1 ? 'resultado' : 'resultados'}`} title={g.titulo} />
                <ul className="flex flex-col">
                  {items.map((r) => (
                    <li key={r.id} className="border-b border-arena-100 last:border-0">
                      <Link to={r.to} className="-mx-2 flex items-center gap-3 rounded-sm px-2 py-3 hover:bg-arena-50">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-arena-100 text-neutro-700">
                          <Icon name={g.icon} size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body font-semibold">{r.titulo}</span>
                          <span className="block truncate text-body-small text-texto-secundario tabular">{r.detalle}</span>
                        </span>
                        <Icon name="chevron-right" size={16} className="text-neutro-700" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
