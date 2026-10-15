/**
 * Mensajes de WhatsApp de ejemplo, escritos como los escribe un aberturista: abreviaturas, sin tildes, todo junto.
 * `minutosAtras` se cuenta desde el momento en que se generan los datos.
 */

export interface MensajeSeed {
  de: 'cliente' | 'dalama';
  texto: string;
  minutosAtras: number;
  /** Se marca el presupuesto de la conversación como adjunto. */
  adjuntaPresupuesto?: boolean;
}

export interface ConversacionSeed {
  id: string;
  clienteId?: string;
  contacto: string;
  telefono: string;
  estado: 'nuevo' | 'presupuestado' | 'respondido';
  /** Clave del presupuesto que se generó desde esta conversación (lo resuelve el generador). */
  presupuesto?: 'roble' | 'sur' | 'perez';
  mensajes: MensajeSeed[];
}

export const CONVERSACIONES_SEED: ConversacionSeed[] = [
  {
    id: 'conv-rossi',
    clienteId: 'cli-rossi',
    contacto: 'Martín Rossi',
    telefono: '+54 9 11 5832-4417',
    estado: 'nuevo',
    mensajes: [
      { de: 'cliente', minutosAtras: 18, texto: 'Buen dia Dario! Necesito para mañana si se puede:\n- 20 bisagras de 3 agujas negras\n- 10 manijas doble balancin modena blancas\n- 6 cerraduras de embutir para corrediza\n- 4 tiras de burlete de 6mm\n- 2 kits de ruedas para la linea herrero\nY pasame precio de mosquitero enrollable 1,20 x 1,50. Gracias!' },
    ],
  },
  {
    id: 'conv-quilmes',
    clienteId: 'cli-quilmes',
    contacto: 'Fer Ruiz · Ab. Quilmes',
    telefono: '+54 9 11 5390-2271',
    estado: 'nuevo',
    mensajes: [
      { de: 'cliente', minutosAtras: 47, texto: 'hola buenas, necesito 20 bisagras 3 agujas negras y 10 manijas p/ventana corrediza, tenes?' },
      { de: 'cliente', minutosAtras: 45, texto: 'las manijas en negro tmb' },
    ],
  },
  {
    id: 'conv-medina',
    clienteId: 'cli-medina',
    contacto: 'Jorge Medina',
    telefono: '+54 9 11 5544-2380',
    estado: 'nuevo',
    mensajes: [
      { de: 'cliente', minutosAtras: 82, texto: 'buenas dario como va. me pasas precio de 4 rollos de burlete 8mm, 2 de felpa 7x5 negra y 30 escuadras de armado? ah y 6 cierres gancho blancos. abrazo' },
    ],
  },
  {
    id: 'conv-nuevo',
    contacto: 'Lucía',
    telefono: '+54 9 11 6248-3307',
    estado: 'nuevo',
    mensajes: [
      { de: 'cliente', minutosAtras: 128, texto: 'Hola, buenas tardes. Queria saber si tienen mosquitero enrollable para una ventana de 1,50 x 1,50 y cuanto sale. Soy de Lanus, hacen envios?' },
    ],
  },
  {
    id: 'conv-adrogue',
    clienteId: 'cli-adrogue',
    contacto: 'Diego S. · Aluminio Adrogué',
    telefono: '+54 9 11 4214-9906',
    estado: 'nuevo',
    mensajes: [
      { de: 'cliente', minutosAtras: 190, texto: 'dario buen dia. para mañana: 12 ruedas dobles herrero, 3 rieles herrero de 6, 2 cajas de tornillos autoperforantes, 1 caja de remaches y 5 siliconas. ah y 4 manijas de puerta negras' },
      { de: 'cliente', minutosAtras: 186, texto: 'y si tenes 2 cilindros de 60 sumalos. gracias!!' },
    ],
  },
  {
    id: 'conv-roble',
    clienteId: 'cli-roble',
    contacto: 'Hernán · El Roble',
    telefono: '+54 9 11 5127-6640',
    estado: 'respondido',
    presupuesto: 'roble',
    mensajes: [
      { de: 'cliente', minutosAtras: 1560, texto: 'hola dario, cotizame 3 kits accesorios herrero 2 hojas, 20 bisagras 2 agujas blancas y 2 siliconas porfa' },
      { de: 'dalama', minutosAtras: 1510, texto: 'Hola Hernán, ¿cómo estás? Te paso el presupuesto con la lista Carpinteros. Vale por 7 días. Cualquier cosa avisame.', adjuntaPresupuesto: true },
      { de: 'cliente', minutosAtras: 1490, texto: 'joya, lo veo con el cliente y te confirmo' },
    ],
  },
  {
    id: 'conv-sur',
    clienteId: 'cli-sur',
    contacto: 'Gustavo · Ab. del Sur',
    telefono: '+54 9 11 4471-2093',
    estado: 'presupuestado',
    presupuesto: 'sur',
    mensajes: [
      { de: 'cliente', minutosAtras: 3000, texto: 'dario necesito reponer: 40 bisagras 3 agujas blancas, 10 rollos burlete 6mm, 20 pares ruedas dobles herrero y 2 rollos felpa negra' },
      { de: 'dalama', minutosAtras: 2960, texto: 'Hola Gustavo. Te paso el presupuesto con la lista Aberturistas. Si te sirve lo preparamos para la mañana.', adjuntaPresupuesto: true },
      { de: 'cliente', minutosAtras: 2900, texto: 'dale mandalo. el jueves temprano si puede ser' },
      { de: 'dalama', minutosAtras: 2890, texto: 'Perfecto, sale en la camioneta a primera hora. Gracias.' },
    ],
  },
  {
    id: 'conv-perez',
    clienteId: 'cli-perez',
    contacto: 'Juan Pérez',
    telefono: '+54 9 11 3378-5520',
    estado: 'respondido',
    presupuesto: 'perez',
    mensajes: [
      { de: 'cliente', minutosAtras: 11600, texto: 'Hola! Estoy cambiando las ventanas de mi casa, me dijeron que ustedes venden los accesorios. Necesitaria 2 kits para ventana herrero de 2 hojas y burlete. Gracias' },
      { de: 'dalama', minutosAtras: 11500, texto: 'Hola Juan, gracias por escribirnos. Te paso el presupuesto. Podés retirar por el local o te lo enviamos.', adjuntaPresupuesto: true },
    ],
  },
];

/**
 * Mensajes que aparecen al tocar "Simular nuevo mensaje" (Etapa 3), en este orden.
 * Mezclan clientes existentes y un contacto nuevo, con productos claros y otros ambiguos.
 */
export const MENSAJES_SIMULADOS: Array<{ clienteId?: string; contacto: string; telefono: string; texto: string }> = [
  { clienteId: 'cli-turdera', contacto: 'Gabi Luna · Ab. Turdera', telefono: '+54 9 11 4231-5509', texto: 'hola! me mandas precio de 30 bisagras modena negras, 15 manijas doble balancin negras y 10 pares de ruedas modena dobles? gracias' },
  { clienteId: 'cli-llavallol', contacto: 'Sergio · Carp. Llavallol', telefono: '+54 9 11 5910-7724', texto: 'buenas, necesito 2 rollos de burlete de 6, 1 rollo felpa gris 7x5 y 10 trabas para corrediza. tenes stock?' },
  { contacto: 'Ricardo', telefono: '+54 9 11 6012-4459', texto: 'Hola que tal. Necesito 1 cerradura multipunto para puerta y 2 manijas de puerta negras. Pasame precio por favor' },
  { clienteId: 'cli-castelli', contacto: 'Paula Castelli', telefono: '+54 9 11 4203-6671', texto: 'Dario, sumame al pedido de mañana 6 rieles modena de 6m, 20 guias superiores y 10 cajas de tapa desague. Gracias!' },
  { clienteId: 'cli-sosa', contacto: 'Walter Sosa', telefono: '+54 9 11 6302-4417', texto: 'que tal, 8 cerraduras de 2 puntos y 12 cierres gancho negros. y un par de espumas. paso a retirar a la tarde' },
];
