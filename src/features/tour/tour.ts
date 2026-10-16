import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PasoTour {
  ruta: string;
  /** Elemento a resaltar: data-tour="…" */
  objetivo: string;
  titulo: string;
  texto: string;
  /** Qué tocar en este paso. */
  accion?: string;
}

/** Recorrido por el flujo principal: WhatsApp → presupuesto → pedido → factura → cobro → entrega. */
export const PASOS: PasoTour[] = [
  {
    ruta: '/inicio',
    objetivo: 'kpis',
    titulo: 'El negocio de un vistazo',
    texto: 'Ventas del mes, pedidos, deuda vencida y stock bajo. Todo se actualiza solo con cada cosa que hacés en el sistema.',
  },
  {
    ruta: '/whatsapp/conv-rossi',
    objetivo: 'ia',
    titulo: 'Un pedido por WhatsApp, presupuestado en segundos',
    texto: 'Martín Rossi pidió por WhatsApp como escribe siempre. La IA lee el mensaje, encuentra los productos y aplica su lista de precios.',
    accion: 'Tocá “Generar presupuesto con IA”, elegí el producto dudoso y enviá el presupuesto.',
  },
  {
    ruta: '/whatsapp/conv-rossi',
    objetivo: 'ia',
    titulo: 'De presupuesto a pedido',
    texto: 'Cuando el cliente acepta, el presupuesto se convierte en pedido: se reservan los productos y se programa la entrega.',
    accion: 'Tocá “El cliente acepta” y después “Convertir en pedido”.',
  },
  {
    ruta: '/pedidos',
    objetivo: 'pedidos',
    titulo: 'Facturar con un clic',
    texto: 'Desde el pedido se emite la factura A o B según el cliente, con CAE de ARCA. Se suma a su cuenta corriente y se descuenta el stock.',
    accion: 'Abrí un pedido “Sin facturar” y tocá “Emitir factura”.',
  },
  {
    ruta: '/cuentas',
    objetivo: 'cuentas',
    titulo: 'Cobranzas sin cuaderno',
    texto: 'Saldos, deuda vencida por antigüedad y cobros en efectivo, transferencia, cheque o tarjeta. Cada cobro emite su recibo y los cheques entran a la cartera.',
    accion: 'Tocá “Registrar cobro” en un cliente con deuda.',
  },
  {
    ruta: '/entregas',
    objetivo: 'entregas',
    titulo: 'El reparto, desde el celular',
    texto: 'El chofer ve sus paradas, cobra lo que corresponde y marca cada entrega. Listo: ese es el circuito completo. Podés reiniciar la demo cuando quieras desde el menú de usuario.',
  },
];

interface TourState {
  activo: boolean;
  paso: number;
  /** Ya se ofreció el recorrido al entrar. */
  ofrecido: boolean;
  abrir: () => void;
  cerrar: () => void;
  ir: (paso: number) => void;
  marcarOfrecido: () => void;
}

export const useTour = create<TourState>()(
  persist(
    (set) => ({
      activo: false,
      paso: 0,
      ofrecido: false,
      abrir: () => set({ activo: true, paso: 0, ofrecido: true }),
      cerrar: () => set({ activo: false }),
      ir: (paso) => set({ paso }),
      marcarOfrecido: () => set({ ofrecido: true }),
    }),
    { name: 'dalama-demo-tour', version: 1, partialize: (s) => ({ ofrecido: s.ofrecido }) },
  ),
);
