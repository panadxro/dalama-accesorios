/**
 * Datos de la empresa y configuración inicial. Los datos fiscales son FICTICIOS a propósito
 * (CUIT y domicilio de ejemplo): la demo nunca muestra datos reales de DALAMA.
 */
import type { Ajustes, Empresa, Plantilla } from '@/domain/types';

export const EMPRESA: Omit<Empresa, 'inicioActividades'> = {
  razonSocial: 'DALAMA Accesorios para Aberturas (demo)',
  nombreFantasia: 'DALAMA',
  cuit: '30000000007',
  condicionIVA: 'RI',
  ingresosBrutos: '000-000000-0',
  domicilio: 'Calle Ejemplo 123',
  localidad: 'Lanús, Buenos Aires (B1824)',
  telefono: '+54 9 11 0000-0000',
  email: 'ventas@dalama.example',
  web: 'dalama.example',
  alias: 'DALAMA.DEMO',
  cbu: '0000000000000000000000',
  puntoVenta: 3,
  puntoVentaRemito: 2,
};

export const AJUSTES: Ajustes = {
  ivaPct: 21,
  validezPresupuestoDias: 7,
  recordarPresupuestoDias: 5,
  recordarDeudaCadaDias: 7,
  diasClienteInactivo: 90,
  reponerHastaVecesMinimo: 2,
};

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'pl-presupuesto',
    nombre: 'Envío de presupuesto',
    uso: 'presupuesto',
    cuerpo: 'Hola {contacto}, ¿cómo estás? Te paso el presupuesto {numero} por {total}. Vale hasta el {vence}. Si te sirve, respondé este mensaje y lo preparamos.',
  },
  {
    id: 'pl-recordatorio-presupuesto',
    nombre: 'Recordatorio de presupuesto',
    uso: 'recordatorio_presupuesto',
    cuerpo: 'Hola {contacto}, ¿pudiste ver el presupuesto {numero} por {total}? Vale hasta el {vence}. Si querés lo ajustamos.',
  },
  {
    id: 'pl-factura',
    nombre: 'Envío de factura',
    uso: 'factura',
    cuerpo: 'Hola {contacto}, te enviamos la {comprobante} por {total}. Vence el {vence}. Podés transferir al alias {alias}. Gracias.',
  },
  {
    id: 'pl-entrega',
    nombre: 'Pedido en camino',
    uso: 'entrega',
    cuerpo: 'Hola {contacto}, tu pedido {numero} ya salió. Llega hoy a {direccion}. Cualquier cosa avisanos por acá.',
  },
  {
    id: 'pl-deuda',
    nombre: 'Recordatorio de deuda',
    uso: 'recordatorio_deuda',
    cuerpo: 'Hola {contacto}, ¿cómo estás? Te escribimos de DALAMA.\nSegún nuestros registros hay {cantidad} vencidas por {deuda} ({comprobantes}).\n¿Nos confirmás cuándo podés hacer el pago? Podés transferir al alias {alias}. Gracias.',
  },
  {
    id: 'pl-reactivacion',
    nombre: 'Cliente inactivo',
    uso: 'reactivacion',
    cuerpo: 'Hola {contacto}, ¿cómo andás? Hace un tiempo que no te vemos por DALAMA. Esta semana tenemos stock completo de bisagras, manijas y burletes. Si necesitás algo, mandanos la lista por acá y te pasamos precio en el día.',
  },
  {
    id: 'pl-recibo',
    nombre: 'Envío de recibo',
    uso: 'recibo',
    cuerpo: 'Hola {contacto}, registramos tu pago por {total}. Te enviamos el recibo {numero}. Gracias.',
  },
];
