import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Actividad, DatosDemo } from '@/domain/types';
import { generarDatos, ESQUEMA_DATOS } from '@/data/seed/generar';
import { ahoraISO, desplazarFechas, diasEntre } from '@/lib/fechas';

/**
 * Store de negocio de la demo. Todo vive en el navegador (localStorage); nada sale de acá.
 * En el sistema real este módulo se reemplaza por llamadas a la API, con la misma forma de datos.
 */
interface DemoState {
  datos: DatosDemo;
  /** Reemplaza los datos (las acciones de cada módulo arman la versión nueva). */
  actualizar: (receta: (d: DatosDemo) => DatosDemo) => void;
  /** Deja constancia de una acción en el registro de actividad del panel. */
  registrar: (a: Omit<Actividad, 'id' | 'fecha'>) => void;
  /** Vuelve a los datos de ejemplo. */
  reiniciar: () => void;
}

let secuenciaActividad = 0;

export const useDemo = create<DemoState>()(
  persist(
    (set) => ({
      datos: generarDatos(),
      actualizar: (receta) => set((s) => ({ datos: receta(s.datos) })),
      registrar: (a) =>
        set((s) => ({
          datos: {
            ...s.datos,
            actividad: [{ ...a, id: `act-u${Date.now()}-${++secuenciaActividad}`, fecha: ahoraISO() }, ...s.datos.actividad].slice(0, 200),
          },
        })),
      reiniciar: () => set({ datos: generarDatos() }),
    }),
    {
      name: 'dalama-demo-datos',
      version: ESQUEMA_DATOS,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ datos: s.datos }),
      // Otro esquema: se descartan los datos guardados y se generan de nuevo.
      migrate: () => ({ datos: generarDatos() }),
      merge: (guardado, actual) => {
        const g = guardado as { datos?: DatosDemo } | undefined;
        if (!g?.datos || g.datos.esquema !== ESQUEMA_DATOS) return actual;
        return { ...actual, datos: alDia(g.datos) };
      },
    },
  ),
);

/**
 * Si la demo se abre otro día, se corren todas las fechas para que "hoy" siga siendo hoy:
 * las entregas del día, los vencimientos y los mensajes recientes conservan su sentido.
 */
function alDia(d: DatosDemo): DatosDemo {
  const dias = diasEntre(d.generadoEl, new Date());
  if (dias === 0) return d;
  const corrido = desplazarFechas(d, dias);
  return { ...corrido, generadoEl: ahoraISO() };
}

/** Acceso directo a los datos fuera de React (acciones y servicios). */
export const datosActuales = () => useDemo.getState().datos;

// Guardar al iniciar (persist solo escribe ante un cambio): queda registrada la primera generación
// o la versión con las fechas corridas al día de hoy.
try {
  useDemo.setState({ datos: useDemo.getState().datos });
} catch {
  // Sin localStorage (modo privado estricto): la demo funciona igual, sin recordar cambios.
}
