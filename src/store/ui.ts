import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Estado de la interfaz (no de negocio): sesión de demo y preferencias de vista. */
interface UiState {
  /** Laura entró desde la pantalla de bienvenida. */
  sesionIniciada: boolean;
  sidebarColapsada: boolean;
  /** Menú lateral abierto en celular. */
  menuMovilAbierto: boolean;
  entrar: () => void;
  salir: () => void;
  setSidebarColapsada: (v: boolean) => void;
  setMenuMovilAbierto: (v: boolean) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      sesionIniciada: false,
      sidebarColapsada: false,
      menuMovilAbierto: false,
      entrar: () => set({ sesionIniciada: true }),
      salir: () => set({ sesionIniciada: false, menuMovilAbierto: false }),
      setSidebarColapsada: (v) => set({ sidebarColapsada: v }),
      setMenuMovilAbierto: (v) => set({ menuMovilAbierto: v }),
    }),
    {
      name: 'dalama-demo-ui',
      version: 1,
      partialize: (s) => ({ sesionIniciada: s.sesionIniciada, sidebarColapsada: s.sidebarColapsada }),
    },
  ),
);

/** Usuario de la demo (sin login real). */
export const USUARIO_DEMO = { name: 'Laura M.', role: 'Administradora', initials: 'LM' } as const;
