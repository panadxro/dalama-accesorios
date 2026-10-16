import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Dialog, Icon } from '@/components/ui';
import { PASOS, useTour } from './tour';

/** Resalta el elemento del paso (data-tour) y lo trae a la vista. */
function useResaltar(objetivo: string | undefined, activo: boolean) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!activo || !objetivo) return;
    let el: Element | null = null;
    const t = window.setTimeout(() => {
      el = document.querySelector(`[data-tour="${objetivo}"]`);
      if (el) {
        el.classList.add('dl-tour-objetivo');
        el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      }
    }, 450);
    return () => {
      window.clearTimeout(t);
      el?.classList.remove('dl-tour-objetivo');
    };
  }, [objetivo, activo, pathname]);
}

/** Tarjeta del recorrido guiado: no bloquea la pantalla, así se puede hacer lo que pide cada paso. */
export function Recorrido() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { activo, paso, cerrar, ir, ofrecido, marcarOfrecido, abrir } = useTour();
  const p = PASOS[paso];
  useResaltar(p?.objetivo, activo);

  // Al cambiar de paso, llevar a la pantalla correspondiente.
  useEffect(() => {
    if (activo && p && pathname !== p.ruta) navigate(p.ruta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, paso]);

  const ultimo = paso === PASOS.length - 1;

  return (
    <>
      <Dialog
        open={!ofrecido && !activo}
        onOpenChange={(o) => !o && marcarOfrecido()}
        overline="Bienvenida"
        title="¿Hacemos un recorrido de 6 pasos?"
        description="Te mostramos el circuito completo: un pedido de WhatsApp que se presupuesta, se factura, se cobra y se entrega. Lleva unos 3 minutos."
        footer={<>
          <Button variant="secondary" onClick={marcarOfrecido}>Explorar por mi cuenta</Button>
          <Button icon="play" onClick={abrir}>Empezar el recorrido</Button>
        </>}
      >
        <p className="m-0 text-body-small text-texto-secundario">Lo podés abrir cuando quieras desde el menú de usuario o desde Configuración.</p>
      </Dialog>

      {activo && p && (
        <section
          aria-label="Recorrido guiado"
          className="fixed bottom-[76px] left-4 right-4 z-[75] flex max-w-[400px] animate-dl-in flex-col gap-3 rounded-md border border-ink-black bg-superficie p-5 shadow-2 sm:left-auto lg:bottom-6 lg:right-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="dl-overline">Recorrido · paso {paso + 1} de {PASOS.length}</div>
              <h2 className="m-0 mt-1 text-h3 font-semibold">{p.titulo}</h2>
              <span className="dl-brandline" aria-hidden="true" />
            </div>
            <button type="button" className="dl-iconbtn -mr-2 -mt-1" aria-label="Cerrar el recorrido" onClick={cerrar}><Icon name="x" size={18} /></button>
          </div>
          <p className="m-0 text-body">{p.texto}</p>
          {p.accion && (
            <p className="m-0 flex gap-2 rounded-sm bg-arena-100 p-3 text-body-small"><Icon name="arrow-right" size={16} className="mt-0.5 shrink-0 text-bold-red" />{p.accion}</p>
          )}
          <div className="flex items-center gap-1" aria-hidden="true">
            {PASOS.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-sm ${i <= paso ? 'bg-rojo-dalama' : 'bg-arena-200'}`} />)}
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="tertiary" size="s" onClick={cerrar}>Saltear</Button>
            <div className="flex gap-2">
              {paso > 0 && <Button variant="secondary" size="s" onClick={() => ir(paso - 1)}>Anterior</Button>}
              <Button size="s" iconRight={ultimo ? 'check' : 'arrow-right'} onClick={() => (ultimo ? cerrar() : ir(paso + 1))}>{ultimo ? 'Terminar' : 'Siguiente'}</Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
