/**
 * 25 clientes ficticios de zona sur del GBA. Ningún nombre, CUIT, teléfono ni dirección corresponde a personas reales.
 * El perfil guía cómo se genera su historial.
 */
import type { CondicionIVA, CondicionVenta, TipoCliente } from '@/domain/types';

export type PerfilCliente =
  /** Compra seguido y paga dentro del plazo. */
  | 'al_dia'
  /** Tiene facturas vencidas de 31 a 60 días. */
  | 'deuda_vencida'
  /** Tiene facturas vencidas de más de 60 días. */
  | 'deuda_critica'
  /** Dejó de comprar hace más de 90 días. */
  | 'inactivo';

export interface ClienteSeed {
  id: string;
  razonSocial: string;
  contacto: string;
  tipo: TipoCliente;
  /** 10 dígitos; el verificador se calcula. */
  cuitBase: string;
  condicionIVA: CondicionIVA;
  telefono: string;
  email: string;
  direccion: string;
  localidad: string;
  condicionVenta: CondicionVenta;
  /** En pesos. */
  limiteCredito: number;
  perfil: PerfilCliente;
  /** Pedidos por mes, en promedio. */
  frecuencia: number;
  /** Multiplicador del tamaño de pedido. */
  escala: number;
  /** Meses desde el alta. */
  antiguedadMeses: number;
  notas?: string;
}

export const CLIENTES_SEED: ClienteSeed[] = [
  { id: 'cli-sur', razonSocial: 'Aberturas del Sur S.R.L.', contacto: 'Gustavo Ibarra', tipo: 'aberturista', cuitBase: '3071548293', condicionIVA: 'RI', telefono: '+54 9 11 4471-2093', email: 'compras@aberturasdelsur.example', direccion: 'Av. H. Yrigoyen 8450', localidad: 'Lomas de Zamora', condicionVenta: 'cta_cte_30', limiteCredito: 8_000_000, perfil: 'deuda_critica', frecuencia: 4.5, escala: 1.8, antiguedadMeses: 60, notas: 'Recibe de 8 a 13. Pide factura A.' },
  { id: 'cli-rossi', razonSocial: 'Carpintería Rossi', contacto: 'Martín Rossi', tipo: 'carpintero', cuitBase: '2028456731', condicionIVA: 'RI', telefono: '+54 9 11 5832-4417', email: 'martin.rossi@carpinteriarossi.example', direccion: 'Pasco 1270', localidad: 'Temperley', condicionVenta: 'cta_cte_30', limiteCredito: 3_000_000, perfil: 'al_dia', frecuencia: 3, escala: 1, antiguedadMeses: 38 },
  { id: 'cli-mendoza', razonSocial: 'Aluminios Mendoza Hnos.', contacto: 'Raúl Mendoza', tipo: 'aberturista', cuitBase: '3070256188', condicionIVA: 'RI', telefono: '+54 9 11 6120-8854', email: 'administracion@aluminiosmendoza.example', direccion: 'Calle 844 N.° 2350', localidad: 'Quilmes Oeste', condicionVenta: 'cta_cte_30', limiteCredito: 5_000_000, perfil: 'al_dia', frecuencia: 4, escala: 2.2, antiguedadMeses: 52 },
  { id: 'cli-castelli', razonSocial: 'Vidrios y Aberturas Castelli S.A.', contacto: 'Paula Castelli', tipo: 'aberturista', cuitBase: '3070984512', condicionIVA: 'RI', telefono: '+54 9 11 4203-6671', email: 'pcastelli@vycastelli.example', direccion: 'Av. Mitre 3120', localidad: 'Avellaneda', condicionVenta: 'cta_cte_30', limiteCredito: 3_500_000, perfil: 'al_dia', frecuencia: 3.5, escala: 2, antiguedadMeses: 44 },
  { id: 'cli-quilmes', razonSocial: 'Aberturas Quilmes S.R.L.', contacto: 'Fernando Ruiz', tipo: 'aberturista', cuitBase: '3071122334', condicionIVA: 'RI', telefono: '+54 9 11 5390-2271', email: 'fruiz@aberturasquilmes.example', direccion: 'Av. Los Quilmes 1540', localidad: 'Bernal', condicionVenta: 'cta_cte_30', limiteCredito: 4_000_000, perfil: 'deuda_vencida', frecuencia: 3, escala: 1.5, antiguedadMeses: 30 },
  { id: 'cli-ferreyra', razonSocial: 'Taller Ferreyra', contacto: 'Oscar Ferreyra', tipo: 'carpintero', cuitBase: '2026334719', condicionIVA: 'MONOTRIBUTO', telefono: '+54 9 11 6654-0932', email: 'tallerferreyra@correo.example', direccion: 'Calle 12 N.° 845', localidad: 'Berazategui', condicionVenta: 'contado', limiteCredito: 0, perfil: 'al_dia', frecuencia: 2, escala: 0.6, antiguedadMeses: 20 },
  { id: 'cli-perez', razonSocial: 'Juan Pérez', contacto: 'Juan Pérez', tipo: 'particular', cuitBase: '2031447782', condicionIVA: 'CF', telefono: '+54 9 11 3378-5520', email: 'juanperez.casa@correo.example', direccion: 'Larroque 845', localidad: 'Banfield', condicionVenta: 'contado', limiteCredito: 0, perfil: 'al_dia', frecuencia: 0.4, escala: 0.3, antiguedadMeses: 3 },
  { id: 'cli-gomez', razonSocial: 'Marina Gómez', contacto: 'Marina Gómez', tipo: 'particular', cuitBase: '2735110046', condicionIVA: 'CF', telefono: '+54 9 11 4790-3361', email: 'marinag@correo.example', direccion: 'Esteban Adrogué 1190', localidad: 'Adrogué', condicionVenta: 'contado', limiteCredito: 0, perfil: 'al_dia', frecuencia: 0.5, escala: 0.3, antiguedadMeses: 4 },
  { id: 'cli-lanus', razonSocial: 'Aberturas Lanús S.R.L.', contacto: 'Claudio Benegas', tipo: 'aberturista', cuitBase: '3070566120', condicionIVA: 'RI', telefono: '+54 9 11 4225-8019', email: 'cbenegas@aberturaslanus.example', direccion: 'Av. 9 de Julio 1765', localidad: 'Lanús Este', condicionVenta: 'cta_cte_30', limiteCredito: 2_000_000, perfil: 'deuda_critica', frecuencia: 2.5, escala: 1.4, antiguedadMeses: 48 },
  { id: 'cli-roble', razonSocial: 'Carpintería El Roble', contacto: 'Hernán Godoy', tipo: 'carpintero', cuitBase: '2029871150', condicionIVA: 'MONOTRIBUTO', telefono: '+54 9 11 5127-6640', email: 'elroble.carpinteria@correo.example', direccion: 'Av. Espora 2210', localidad: 'Burzaco', condicionVenta: 'cta_cte_30', limiteCredito: 800_000, perfil: 'al_dia', frecuencia: 2, escala: 0.8, antiguedadMeses: 26 },
  { id: 'cli-varela', razonSocial: 'Metal-Ab Varela S.R.L.', contacto: 'Susana Peralta', tipo: 'aberturista', cuitBase: '3071009452', condicionIVA: 'RI', telefono: '+54 9 11 4255-1098', email: 'speralta@metalabvarela.example', direccion: 'Av. San Martín 3340', localidad: 'Florencio Varela', condicionVenta: 'cta_cte_30', limiteCredito: 2_000_000, perfil: 'inactivo', frecuencia: 2.5, escala: 1.3, antiguedadMeses: 36 },
  { id: 'cli-sosa', razonSocial: 'Herrería y Aberturas Sosa', contacto: 'Walter Sosa', tipo: 'carpintero', cuitBase: '2025660938', condicionIVA: 'MONOTRIBUTO', telefono: '+54 9 11 6302-4417', email: 'sosaaberturas@correo.example', direccion: 'Av. Lacaze 2950', localidad: 'Claypole', condicionVenta: 'contado', limiteCredito: 0, perfil: 'al_dia', frecuencia: 1.5, escala: 0.7, antiguedadMeses: 15 },
  { id: 'cli-banfield', razonSocial: 'Aberturas Banfield S.A.', contacto: 'Mónica Ríos', tipo: 'aberturista', cuitBase: '3070871236', condicionIVA: 'RI', telefono: '+54 9 11 4242-7713', email: 'mrios@aberturasbanfield.example', direccion: 'Maipú 560', localidad: 'Banfield', condicionVenta: 'cta_cte_30', limiteCredito: 2_500_000, perfil: 'deuda_vencida', frecuencia: 2.5, escala: 1.5, antiguedadMeses: 41 },
  { id: 'cli-coop', razonSocial: 'Cooperativa de Trabajo Aluminio Sur Ltda.', contacto: 'Ramón Acuña', tipo: 'aberturista', cuitBase: '3071344589', condicionIVA: 'EXENTO', telefono: '+54 9 11 4207-3384', email: 'coopaluminiosur@correo.example', direccion: 'Las Flores 1022', localidad: 'Wilde', condicionVenta: 'cta_cte_30', limiteCredito: 2_500_000, perfil: 'al_dia', frecuencia: 1.5, escala: 1.2, antiguedadMeses: 22 },
  { id: 'cli-acosta', razonSocial: 'Roberto Acosta', contacto: 'Roberto Acosta', tipo: 'particular', cuitBase: '2018334506', condicionIVA: 'CF', telefono: '+54 9 11 3855-0217', email: 'racosta@correo.example', direccion: 'Meeks 1340', localidad: 'Temperley', condicionVenta: 'contado', limiteCredito: 0, perfil: 'inactivo', frecuencia: 0.6, escala: 0.35, antiguedadMeses: 10 },
  { id: 'cli-adrogue', razonSocial: 'Aluminio Adrogué S.A.', contacto: 'Diego Salvatierra', tipo: 'aberturista', cuitBase: '3070423397', condicionIVA: 'RI', telefono: '+54 9 11 4214-9906', email: 'dsalvatierra@aluminioadrogue.example', direccion: 'Av. Espora 1880', localidad: 'Adrogué', condicionVenta: 'cta_cte_30', limiteCredito: 3_000_000, perfil: 'al_dia', frecuencia: 3, escala: 1.6, antiguedadMeses: 55 },
  { id: 'cli-benitez', razonSocial: 'Carpintería Benítez', contacto: 'Alejandro Benítez', tipo: 'carpintero', cuitBase: '2030112275', condicionIVA: 'MONOTRIBUTO', telefono: '+54 9 11 6011-8875', email: 'benitezcarpinteria@correo.example', direccion: 'Alem 755', localidad: 'Monte Grande', condicionVenta: 'cta_cte_30', limiteCredito: 900_000, perfil: 'deuda_vencida', frecuencia: 2, escala: 0.8, antiguedadMeses: 18 },
  { id: 'cli-ezeiza', razonSocial: 'Aberturas Ezeiza S.R.L.', contacto: 'Liliana Ortiz', tipo: 'aberturista', cuitBase: '3071255640', condicionIVA: 'RI', telefono: '+54 9 11 4480-6623', email: 'lortiz@aberturasezeiza.example', direccion: 'Av. French 410', localidad: 'Ezeiza', condicionVenta: 'cta_cte_30', limiteCredito: 1_800_000, perfil: 'inactivo', frecuencia: 2, escala: 1.1, antiguedadMeses: 28 },
  { id: 'cli-romero', razonSocial: 'Silvia Romero', contacto: 'Silvia Romero', tipo: 'particular', cuitBase: '2729875531', condicionIVA: 'CF', telefono: '+54 9 11 3122-6498', email: 'silviaromero@correo.example', direccion: 'Sitio de Montevideo 1450', localidad: 'Lanús Oeste', condicionVenta: 'contado', limiteCredito: 0, perfil: 'al_dia', frecuencia: 0.4, escala: 0.3, antiguedadMeses: 5 },
  { id: 'cli-medina', razonSocial: 'Taller Medina Aberturas', contacto: 'Jorge Medina', tipo: 'carpintero', cuitBase: '2027445093', condicionIVA: 'RI', telefono: '+54 9 11 5544-2380', email: 'tallermedina@correo.example', direccion: '29 de Septiembre 2215', localidad: 'Remedios de Escalada', condicionVenta: 'cta_cte_30', limiteCredito: 1_000_000, perfil: 'al_dia', frecuencia: 2.2, escala: 0.9, antiguedadMeses: 33 },
  { id: 'cli-longchamps', razonSocial: 'Aberturas Longchamps', contacto: 'Nicolás Paredes', tipo: 'carpintero', cuitBase: '2033567812', condicionIVA: 'MONOTRIBUTO', telefono: '+54 9 11 6789-1123', email: 'aberturaslongchamps@correo.example', direccion: 'Av. Hipólito Yrigoyen 18750', localidad: 'Longchamps', condicionVenta: 'contado', limiteCredito: 0, perfil: 'inactivo', frecuencia: 1.5, escala: 0.6, antiguedadMeses: 14 },
  { id: 'cli-bernal', razonSocial: 'Constructora Bernal Hnos. S.R.L.', contacto: 'Ariel Bernal', tipo: 'aberturista', cuitBase: '3070998871', condicionIVA: 'RI', telefono: '+54 9 11 4251-0067', email: 'compras@constructorabernal.example', direccion: 'Zapiola 455', localidad: 'Bernal', condicionVenta: 'cta_cte_30', limiteCredito: 3_500_000, perfil: 'deuda_critica', frecuencia: 1.2, escala: 2, antiguedadMeses: 24 },
  { id: 'cli-fernandez', razonSocial: 'Diego Fernández', contacto: 'Diego Fernández', tipo: 'particular', cuitBase: '2035221904', condicionIVA: 'CF', telefono: '+54 9 11 3021-4498', email: 'diegofernandez@correo.example', direccion: 'Av. Sarmiento 220', localidad: 'Glew', condicionVenta: 'contado', limiteCredito: 0, perfil: 'al_dia', frecuencia: 0.3, escala: 0.25, antiguedadMeses: 2 },
  { id: 'cli-llavallol', razonSocial: 'Carpintería Llavallol', contacto: 'Sergio Molina', tipo: 'carpintero', cuitBase: '2024908836', condicionIVA: 'MONOTRIBUTO', telefono: '+54 9 11 5910-7724', email: 'carpinterialavallol@correo.example', direccion: 'Av. Antártida Argentina 1320', localidad: 'Llavallol', condicionVenta: 'cta_cte_30', limiteCredito: 700_000, perfil: 'al_dia', frecuencia: 1.6, escala: 0.7, antiguedadMeses: 12 },
  { id: 'cli-turdera', razonSocial: 'Aberturas Turdera S.R.L.', contacto: 'Gabriela Luna', tipo: 'aberturista', cuitBase: '3071460028', condicionIVA: 'RI', telefono: '+54 9 11 4231-5509', email: 'gluna@aberturasturdera.example', direccion: 'Av. Pasco 980', localidad: 'Turdera', condicionVenta: 'cta_cte_30', limiteCredito: 4_000_000, perfil: 'al_dia', frecuencia: 2.5, escala: 1.3, antiguedadMeses: 40 },
];

/** Dígito verificador de CUIT (módulo 11). Si da 10, se ajusta el último dígito de la base. */
export function cuitCompleto(base: string): string {
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let b = base;
  for (let intento = 0; intento < 10; intento++) {
    const suma = b.split('').reduce((a, d, i) => a + Number(d) * pesos[i], 0);
    let v = 11 - (suma % 11);
    if (v === 11) v = 0;
    if (v !== 10) return `${b}${v}`;
    b = b.slice(0, 9) + String((Number(b[9]) + 1) % 10);
  }
  return `${b}0`;
}
