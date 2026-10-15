import { Link } from 'react-router-dom';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';

export interface EnPreparacionProps {
  icon: IconName;
  /** Qué resuelve esta pantalla, en una oración. */
  resumen: string;
  /** Qué va a poder hacer Laura acá. */
  funciones: string[];
  /** Etapa del plan en la que se completa. */
  etapa: number;
  relacionados?: Array<{ label: string; to: string }>;
}

/**
 * Contenido provisorio de una sección que todavía se está construyendo.
 * Mantiene la navegación completa (sin links vacíos) mientras avanzan las etapas.
 */
export function EnPreparacion({ icon, resumen, funciones, etapa, relacionados = [] }: EnPreparacionProps) {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="dl-empty-mark m-0 shrink-0"><Icon name={icon} size={24} /></div>
        <div className="min-w-0 flex-1">
          <SectionTitle overline={`En preparación · etapa ${etapa}`} title={resumen} />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-body font-semibold">Qué vas a poder hacer acá</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {funciones.map((f) => (
            <li key={f} className="flex items-start gap-2 rounded-sm bg-arena-50 px-3 py-2.5 text-body">
              <Icon name="check" size={16} className="mt-0.5 text-exito" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      {relacionados.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-arena-100 pt-4 text-body-small">
          <span className="text-texto-secundario">Mientras tanto, podés ver:</span>
          {relacionados.map((r) => (
            <Link key={r.to} to={r.to} className="dl-link inline-flex items-center gap-1">
              {r.label}
              <Icon name="arrow-right" size={16} />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
