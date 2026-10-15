import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useUi, USUARIO_DEMO } from '@/store/ui';

const FLUJO: Array<{ icon: IconName; label: string }> = [
  { icon: 'message', label: 'Llega un pedido por WhatsApp' },
  { icon: 'sparkles', label: 'La IA arma el presupuesto' },
  { icon: 'send', label: 'Lo revisás y lo enviás en PDF' },
  { icon: 'package', label: 'El cliente acepta y se crea el pedido' },
  { icon: 'receipt', label: 'Se factura con CAE' },
  { icon: 'wallet', label: 'Impacta en la cuenta corriente y el stock' },
  { icon: 'truck', label: 'Se entrega y se cobra' },
];

export default function BienvenidaPage() {
  const navigate = useNavigate();
  const { sesionIniciada, entrar } = useUi();

  useEffect(() => {
    document.title = 'DALAMA · Sistema de gestión (demo)';
  }, []);

  if (sesionIniciada) return <Navigate to="/inicio" replace />;

  const ingresar = () => {
    entrar();
    navigate('/inicio');
  };

  return (
    <div className="dl-root flex min-h-screen flex-col bg-fondo lg:flex-row">
      {/* Marca */}
      <section className="flex flex-col justify-between gap-10 bg-ink-black px-6 py-8 text-neutro-0 sm:px-10 lg:w-[46%] lg:px-14 lg:py-12">
        <img src="/brand/dalama-logo-negativo.png" alt="DALAMA · Accesorios para aberturas · Distribuidora" className="w-[220px] sm:w-[260px]" />
        <div className="max-w-[520px]">
          <div className="text-overline uppercase text-neutro-300">Sistema de gestión</div>
          <span className="dl-brandline" aria-hidden="true" />
          <h1 className="mt-4 text-[28px] font-bold leading-9 sm:text-[32px] sm:leading-10">
            Todo el negocio en un solo lugar, del WhatsApp al cobro.
          </h1>
          <p className="mt-4 text-body text-neutro-300">
            Presupuestos, pedidos, facturas, cuentas corrientes y stock conectados entre sí. Cada acción se refleja en el resto del sistema.
          </p>
        </div>
        <ol className="hidden max-w-[520px] flex-col gap-0 sm:flex" aria-label="Cómo funciona">
          {FLUJO.map((p, i) => (
            <li key={p.label} className="flex items-center gap-3 border-t border-neutro-700 py-2.5 text-body-small">
              <span className="w-5 text-right font-semibold tabular text-neutro-300">{i + 1}</span>
              <Icon name={p.icon} size={18} className="text-rojo-300" />
              <span>{p.label}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Ingreso */}
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="dl-card flex flex-col gap-6 p-8">
            <div>
              <div className="dl-overline">Demo interactiva</div>
              <h2 className="mt-1 text-h2">Recorré el sistema como Laura</h2>
              <span className="dl-brandline" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-3 rounded-sm bg-arena-100 p-3">
              <span className="dl-avatar" aria-hidden="true">{USUARIO_DEMO.initials}</span>
              <div>
                <div className="dl-user-name">{USUARIO_DEMO.name}</div>
                <div className="dl-user-role">{USUARIO_DEMO.role} · DALAMA</div>
              </div>
            </div>
            <Button variant="primary" iconRight="arrow-right" onClick={ingresar} className="w-full" autoFocus>
              Entrar como Laura
            </Button>
            <ul className="flex flex-col gap-2 text-body-small text-texto-secundario">
              <li className="flex gap-2"><Icon name="info" size={16} className="mt-0.5 shrink-0 text-info" />Todos los datos son ficticios: clientes, productos y montos.</li>
              <li className="flex gap-2"><Icon name="shield" size={16} className="mt-0.5 shrink-0 text-info" />Nada sale de tu navegador. WhatsApp, IA y ARCA están simulados.</li>
              <li className="flex gap-2"><Icon name="reset" size={16} className="mt-0.5 shrink-0 text-info" />Podés probar todo sin miedo: la demo se reinicia con un botón.</li>
            </ul>
          </div>
          <p className="mt-4 text-center text-caption text-texto-secundario">Demo · datos ficticios</p>
        </div>
      </section>
    </div>
  );
}
