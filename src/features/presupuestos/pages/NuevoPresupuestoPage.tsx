import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/app/layout/Page';
import { Button, ButtonLink, Card, Icon, SearchInput, SectionTitle } from '@/components/ui';
import { EmptyState } from '@/components/shared/States';
import { Avatar } from '@/components/negocio/Datos';
import { TIPO_CLIENTE } from '@/domain/calculos';
import { crearPresupuesto, ejecutar } from '@/store/acciones';
import { useDemo } from '@/store/demo';
import { normalizar, useDerivados } from '@/store/selectores';

/** Primer paso de un presupuesto manual: elegir el cliente. Después se completa en el detalle. */
export default function NuevoPresupuestoPage() {
  const navigate = useNavigate();
  const clientes = useDemo((s) => s.datos.clientes);
  const der = useDerivados();
  const [q, setQ] = useState('');

  const lista = useMemo(() => {
    const t = normalizar(q.trim());
    return [...clientes]
      .filter((c) => !t || normalizar(`${c.razonSocial} ${c.contacto} ${c.localidad} ${c.cuit}`).includes(t))
      .sort((a, b) => (der.ultimaCompra.get(b.id) ?? '').localeCompare(der.ultimaCompra.get(a.id) ?? ''));
  }, [clientes, q, der]);

  const elegir = (clienteId: string) => {
    const p = ejecutar((d) => crearPresupuesto(d, { clienteId, renglones: [], origen: 'manual' }));
    navigate(`/presupuestos/${p.id}`, { replace: true });
  };

  return (
    <Page title="Nuevo presupuesto" overline="Operación · Presupuestos">
      <Card className="flex flex-col gap-4">
        <SectionTitle overline="Paso 1 de 2" title="¿Para qué cliente es?" action={<ButtonLink to="/presupuestos" variant="tertiary">Cancelar</ButtonLink>} />
        <p className="m-0 text-body text-texto-secundario">Se aplica su lista de precios automáticamente. En el paso siguiente sumás los productos.</p>
        <SearchInput label="Buscar cliente" placeholder="Nombre, contacto, localidad o CUIT" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        {lista.length === 0 ? (
          <EmptyState icon="users" title="No encontramos ese cliente" text="Si es nuevo, dalo de alta desde la bandeja de WhatsApp o desde Clientes." />
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {lista.slice(0, 15).map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => elegir(c.id)} className="flex w-full items-center gap-3 rounded-sm border border-borde bg-superficie p-3 text-left hover:border-ink-black hover:bg-arena-50">
                  <Avatar nombre={c.razonSocial} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{c.razonSocial}</span>
                    <span className="block truncate text-caption text-texto-secundario">{TIPO_CLIENTE[c.tipo]} · {c.localidad}</span>
                  </span>
                  <Icon name="chevron-right" size={16} className="text-neutro-700" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {lista.length > 15 && <p className="m-0 text-caption text-texto-secundario">Mostrando 15 de {lista.length}. Escribí para filtrar.</p>}
        <div><Button variant="tertiary" icon="message" onClick={() => navigate('/whatsapp')}>O generalo con IA desde un mensaje de WhatsApp</Button></div>
      </Card>
    </Page>
  );
}
