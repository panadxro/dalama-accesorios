/**
 * Catálogo de ejemplo: 5 proveedores y 60 productos del rubro en 7 categorías.
 * Todos los nombres, códigos y precios son ficticios.
 * Precios en pesos sin IVA (se pasan a centavos al armar los datos).
 */
import type { Categoria, Linea, ListaPrecios, Producto, Proveedor, Unidad } from '@/domain/types';

export const LISTAS: ListaPrecios[] = [
  { id: 'lista-general', nombre: 'Lista general', descuentoPct: 0 },
  { id: 'lista-carpinteros', nombre: 'Lista Carpinteros', descuentoPct: 10 },
  { id: 'lista-aberturistas', nombre: 'Lista Aberturistas', descuentoPct: 12 },
];

export const PROVEEDORES: Proveedor[] = [
  { id: 'prov-plata', razonSocial: 'Herrajes del Plata S.A.', cuit: '30712345674', contacto: 'Pablo Ledesma', telefono: '+54 9 11 4402-1180', email: 'ventas@herrajesdelplata.example', plazoEntregaDias: 5, rubro: 'Bisagras, manijas y cerraduras' },
  { id: 'prov-aluplast', razonSocial: 'Aluplast Distribuciones S.R.L.', cuit: '30708812343', contacto: 'Carina Quiroga', telefono: '+54 9 11 5561-7720', email: 'pedidos@aluplast.example', plazoEntregaDias: 7, rubro: 'Rieles, ruedas y accesorios' },
  { id: 'prov-ferrari', razonSocial: 'Metalúrgica Ferrari Hnos.', cuit: '30695501238', contacto: 'Hugo Ferrari', telefono: '+54 9 11 4287-3305', email: 'compras@mferrari.example', plazoEntregaDias: 6, rubro: 'Escuadras, cierres y herrajes' },
  { id: 'prov-tandil', razonSocial: 'Burletes Tandil S.R.L.', cuit: '30710099878', contacto: 'Lorena Paz', telefono: '+54 9 249 455-2210', email: 'ventas@burletestandil.example', plazoEntregaDias: 4, rubro: 'Burletes y felpas' },
  { id: 'prov-oeste', razonSocial: 'Mosquiteros del Oeste S.A.', cuit: '30716643219', contacto: 'Ezequiel Bravo', telefono: '+54 9 11 6693-0412', email: 'info@mosquiterosoeste.example', plazoEntregaDias: 8, rubro: 'Mosquiteros y telas' },
];

type P = [
  codigo: string, nombre: string, categoria: Categoria, familia: string, unidad: Unidad,
  precio: number, margenPct: number, proveedorId: string, stock: number, minimo: number, ubicacion: string,
  atributos: { color?: string; medida?: string; linea?: Linea }, sinonimos: string[],
];

/** [código, nombre, categoría, familia, unidad, precio sin IVA, margen %, proveedor, stock, mínimo, estante, atributos, sinónimos] */
const P_: P[] = [
  // Bisagras
  ['BIS-3A-NG', 'Bisagra 3 agujas aluminio negra · Herrero', 'bisagras', 'bis-3a', 'u.', 2850, 38, 'prov-plata', 340, 120, 'A-03', { color: 'Negro', linea: 'Herrero' }, ['bisagra 3 agujas', 'bisagra de 3 agujas', 'bisagras 3 agujas', 'bisagra tres agujas', 'bisagra herrero']],
  ['BIS-3A-BL', 'Bisagra 3 agujas aluminio blanca · Herrero', 'bisagras', 'bis-3a', 'u.', 2850, 38, 'prov-plata', 286, 120, 'A-03', { color: 'Blanco', linea: 'Herrero' }, ['bisagra 3 agujas', 'bisagra de 3 agujas', 'bisagras 3 agujas', 'bisagra herrero']],
  ['BIS-3A-NT', 'Bisagra 3 agujas aluminio natural · Herrero', 'bisagras', 'bis-3a', 'u.', 2700, 37, 'prov-plata', 198, 80, 'A-03', { color: 'Natural', linea: 'Herrero' }, ['bisagra 3 agujas', 'bisagra de 3 agujas', 'bisagra herrero']],
  ['BIS-2A-NG', 'Bisagra 2 agujas aluminio negra', 'bisagras', 'bis-2a', 'u.', 2100, 36, 'prov-plata', 210, 80, 'A-04', { color: 'Negro', linea: 'Universal' }, ['bisagra 2 agujas', 'bisagra de 2 agujas', 'bisagras 2 agujas', 'bisagra dos agujas']],
  ['BIS-2A-BL', 'Bisagra 2 agujas aluminio blanca', 'bisagras', 'bis-2a', 'u.', 2100, 36, 'prov-plata', 164, 80, 'A-04', { color: 'Blanco', linea: 'Universal' }, ['bisagra 2 agujas', 'bisagra de 2 agujas', 'bisagra dos agujas']],
  ['BIS-MOD-NG', 'Bisagra línea Módena negra', 'bisagras', 'bis-mod', 'u.', 4650, 35, 'prov-plata', 132, 60, 'A-05', { color: 'Negro', linea: 'Módena' }, ['bisagra modena', 'bisagras modena']],
  ['BIS-MOD-BL', 'Bisagra línea Módena blanca', 'bisagras', 'bis-mod', 'u.', 4650, 35, 'prov-plata', 96, 60, 'A-05', { color: 'Blanco', linea: 'Módena' }, ['bisagra modena', 'bisagras modena']],
  ['BIS-PIV-01', 'Bisagra pivotante para puerta', 'bisagras', 'bis-piv', 'u.', 18900, 34, 'prov-ferrari', 28, 10, 'A-08', { linea: 'Universal' }, ['pivot', 'pivote', 'bisagra pivotante', 'pivot puerta']],
  ['BIS-OCU-01', 'Bisagra oculta regulable', 'bisagras', 'bis-ocu', 'u.', 12400, 33, 'prov-plata', 34, 12, 'A-08', { linea: 'Universal' }, ['bisagra oculta', 'bisagras ocultas']],

  // Manijas
  ['MAN-DBM-BL', 'Manija doble balancín Módena blanca', 'manijas', 'man-dbm', 'u.', 9480, 36, 'prov-plata', 58, 30, 'B-01', { color: 'Blanco', linea: 'Módena' }, ['manija doble balancin', 'manijas doble balancin', 'manija balancin', 'doble balancin modena']],
  ['MAN-DBM-NG', 'Manija doble balancín Módena negra', 'manijas', 'man-dbm', 'u.', 9480, 36, 'prov-plata', 44, 30, 'B-01', { color: 'Negro', linea: 'Módena' }, ['manija doble balancin', 'manijas doble balancin', 'manija balancin', 'doble balancin modena']],
  ['MAN-MOD-NG', 'Manija simple Módena negra', 'manijas', 'man-mod', 'u.', 5200, 35, 'prov-plata', 0, 15, 'B-02', { color: 'Negro', linea: 'Módena' }, ['manija modena', 'manija simple modena', 'manijas modena']],
  ['MAN-MOD-BL', 'Manija simple Módena blanca', 'manijas', 'man-mod', 'u.', 5200, 35, 'prov-plata', 38, 15, 'B-02', { color: 'Blanco', linea: 'Módena' }, ['manija modena', 'manija simple modena', 'manijas modena']],
  ['MAN-COR-NG', 'Manija para ventana corrediza negra · Herrero', 'manijas', 'man-cor', 'u.', 3400, 37, 'prov-ferrari', 152, 60, 'B-03', { color: 'Negro', linea: 'Herrero' }, ['manija corrediza', 'manija ventana corrediza', 'manija p/ventana corrediza', 'manijas p/ventana corrediza', 'manija para corrediza', 'manijas corrediza']],
  ['MAN-COR-BL', 'Manija para ventana corrediza blanca · Herrero', 'manijas', 'man-cor', 'u.', 3400, 37, 'prov-ferrari', 118, 60, 'B-03', { color: 'Blanco', linea: 'Herrero' }, ['manija corrediza', 'manija ventana corrediza', 'manija p/ventana corrediza', 'manija para corrediza']],
  ['MAN-PUE-NG', 'Manija de puerta doble balancín negra', 'manijas', 'man-pue', 'u.', 14800, 34, 'prov-plata', 26, 10, 'B-04', { color: 'Negro', linea: 'Universal' }, ['manija puerta', 'manija de puerta', 'picaporte', 'manijon puerta']],
  ['MAN-CRE-NG', 'Manija cremona oscilobatiente negra', 'manijas', 'man-cre', 'u.', 11200, 33, 'prov-plata', 18, 8, 'B-04', { color: 'Negro', linea: 'A30' }, ['cremona', 'manija cremona', 'manija oscilobatiente']],
  ['MAN-EMB-NT', 'Tirador de embutir natural', 'manijas', 'man-emb', 'u.', 2650, 40, 'prov-ferrari', 230, 60, 'B-06', { color: 'Natural', linea: 'Universal' }, ['tirador', 'tirador embutir', 'manija embutir', 'uñero']],
  ['MAN-EMB-NG', 'Tirador de embutir negro', 'manijas', 'man-emb', 'u.', 2650, 40, 'prov-ferrari', 184, 60, 'B-06', { color: 'Negro', linea: 'Universal' }, ['tirador', 'tirador embutir', 'manija embutir', 'uñero']],

  // Cerraduras y cierres
  ['CER-EMC-01', 'Cerradura embutir corrediza 1 punto', 'cerraduras', 'cer-emc', 'u.', 14200, 32, 'prov-plata', 4, 20, 'B-05', { linea: 'Universal' }, ['cerradura embutir', 'cerradura de embutir', 'cerraduras de embutir', 'cerradura corrediza', 'cerradura p/corrediza', 'cerradura de embutir para corrediza', 'cerraduras de embutir para corrediza']],
  ['CER-EMC-02', 'Cerradura embutir corrediza 2 puntos', 'cerraduras', 'cer-emc', 'u.', 21500, 31, 'prov-plata', 22, 15, 'B-05', { linea: 'Universal' }, ['cerradura 2 puntos', 'cerradura dos puntos', 'cerradura embutir 2 puntos']],
  ['CER-GAN-NG', 'Cierre gancho para corrediza negro', 'cerraduras', 'cer-gan', 'u.', 4300, 38, 'prov-ferrari', 96, 40, 'B-07', { color: 'Negro', linea: 'Herrero' }, ['cierre gancho', 'cierre lateral', 'gancho corrediza', 'cierres gancho']],
  ['CER-GAN-BL', 'Cierre gancho para corrediza blanco', 'cerraduras', 'cer-gan', 'u.', 4300, 38, 'prov-ferrari', 74, 40, 'B-07', { color: 'Blanco', linea: 'Herrero' }, ['cierre gancho', 'cierre lateral', 'gancho corrediza']],
  ['CER-PUE-25', 'Cerradura para puerta de aluminio caja 25 mm', 'cerraduras', 'cer-pue', 'u.', 26800, 30, 'prov-plata', 16, 8, 'B-08', { linea: 'Universal' }, ['cerradura puerta', 'cerradura de puerta', 'cerradura caja 25']],
  ['CER-MUL-01', 'Cerradura multipunto para puerta', 'cerraduras', 'cer-mul', 'u.', 68500, 28, 'prov-plata', 6, 4, 'B-08', { linea: 'A30' }, ['multipunto', 'cerradura multipunto']],
  ['CER-TRA-01', 'Traba de seguridad para corrediza', 'cerraduras', 'cer-tra', 'u.', 3900, 42, 'prov-ferrari', 120, 40, 'B-07', { linea: 'Universal' }, ['traba', 'traba seguridad', 'trabas', 'traba corrediza']],
  ['CER-CIL-60', 'Cilindro de seguridad 60 mm', 'cerraduras', 'cer-cil', 'u.', 12800, 33, 'prov-plata', 22, 10, 'B-08', { medida: '60 mm', linea: 'Universal' }, ['cilindro', 'cilindro seguridad', 'combinacion cerradura']],

  // Rieles y ruedas
  ['RIE-HR-6M', 'Riel inferior Herrero 6 m', 'rieles', 'rie-hr', 'u.', 18400, 30, 'prov-aluplast', 64, 40, 'D-01', { medida: '6 m', linea: 'Herrero' }, ['riel herrero', 'riel inferior', 'rieles herrero', 'riel de 6']],
  ['RIE-MOD-6M', 'Riel inferior Módena 6 m', 'rieles', 'rie-mod', 'u.', 24600, 29, 'prov-aluplast', 38, 25, 'D-01', { medida: '6 m', linea: 'Módena' }, ['riel modena', 'rieles modena']],
  ['RIE-AL-3M', 'Riel de aluminio 3 m', 'rieles', 'rie-al', 'u.', 9800, 31, 'prov-aluplast', 52, 30, 'D-02', { medida: '3 m', linea: 'Universal' }, ['riel 3 metros', 'riel aluminio', 'riel de 3']],
  ['ROD-HR-DOB', 'Rueda doble regulable Herrero (par)', 'rieles', 'rod-hr', 'par', 5950, 36, 'prov-aluplast', 112, 60, 'A-06', { linea: 'Herrero' }, ['rueda doble', 'ruedas dobles', 'rueda regulable', 'ruedas herrero', 'kit de ruedas herrero', 'rueditas herrero', 'ruedas para herrero']],
  ['ROD-HR-SIM', 'Rueda simple Herrero (par)', 'rieles', 'rod-hr', 'par', 3900, 37, 'prov-aluplast', 140, 60, 'A-06', { linea: 'Herrero' }, ['rueda simple', 'ruedas simples', 'ruedas herrero', 'kit de ruedas herrero', 'rueditas herrero']],
  ['ROD-MOD-SIM', 'Rueda simple línea Módena (par)', 'rieles', 'rod-mod', 'par', 4800, 36, 'prov-aluplast', 12, 40, 'A-07', { linea: 'Módena' }, ['rueda modena', 'ruedas modena', 'rueda simple modena']],
  ['ROD-MOD-DOB', 'Rueda doble regulable Módena (par)', 'rieles', 'rod-mod', 'par', 7600, 35, 'prov-aluplast', 46, 30, 'A-07', { linea: 'Módena' }, ['rueda doble modena', 'ruedas dobles modena', 'ruedas modena']],
  ['ROD-RUL-01', 'Rueda con rulemán reforzada (par)', 'rieles', 'rod-rul', 'par', 9200, 34, 'prov-aluplast', 30, 16, 'A-07', { linea: 'Universal' }, ['rueda rulemán', 'rueda ruleman', 'ruedas reforzadas', 'rueda reforzada']],
  ['GUI-SUP-10', 'Guía superior de nylon x 10', 'rieles', 'gui-sup', 'caja', 3200, 44, 'prov-aluplast', 58, 20, 'A-09', { linea: 'Universal' }, ['guia superior', 'guias de nylon', 'guia nylon']],

  // Burletes y felpas
  ['BUR-6MM-R', 'Burlete EPDM 6 mm · rollo 50 m', 'burletes', 'bur-6', 'rollo', 18900, 34, 'prov-tandil', 92, 40, 'C-02', { medida: '6 mm' }, ['burlete 6mm', 'burlete de 6', 'burlete 6 mm', 'rollo burlete 6']],
  ['BUR-6MM-T', 'Burlete EPDM 6 mm · tira 6 m', 'burletes', 'bur-6', 'tira', 2600, 36, 'prov-tandil', 120, 50, 'C-02', { medida: '6 mm' }, ['tira de burlete', 'tiras de burlete', 'tiras de burlete de 6mm', 'burlete tira']],
  ['BUR-8MM-R', 'Burlete EPDM 8 mm · rollo 50 m', 'burletes', 'bur-8', 'rollo', 22400, 33, 'prov-tandil', 44, 25, 'C-02', { medida: '8 mm' }, ['burlete 8mm', 'burlete de 8', 'burlete 8 mm']],
  ['BUR-CUN-R', 'Burlete cuña · rollo 100 m', 'burletes', 'bur-cun', 'rollo', 26500, 32, 'prov-tandil', 18, 10, 'C-03', {}, ['burlete cuña', 'burlete cuna', 'cuña']],
  ['FEL-75-GR', 'Felpa 7 × 5 mm gris · rollo 250 m', 'burletes', 'fel-75', 'rollo', 31200, 31, 'prov-tandil', 0, 10, 'C-03', { color: 'Gris', medida: '7 × 5 mm' }, ['felpa 7x5', 'felpa gris', 'felpa 7 x 5', 'felpas']],
  ['FEL-75-NG', 'Felpa 7 × 5 mm negra · rollo 250 m', 'burletes', 'fel-75', 'rollo', 31200, 31, 'prov-tandil', 14, 10, 'C-03', { color: 'Negro', medida: '7 × 5 mm' }, ['felpa 7x5', 'felpa negra', 'felpa 7 x 5', 'felpas']],
  ['FEL-55-GR', 'Felpa 5 × 5 mm gris · rollo 250 m', 'burletes', 'fel-55', 'rollo', 27800, 31, 'prov-tandil', 7, 10, 'C-04', { color: 'Gris', medida: '5 × 5 mm' }, ['felpa 5x5', 'felpa 5 x 5']],
  ['FEL-ADH-10', 'Felpa autoadhesiva · rollo 10 m', 'burletes', 'fel-adh', 'rollo', 3800, 45, 'prov-tandil', 66, 20, 'C-04', {}, ['felpa autoadhesiva', 'felpa adhesiva', 'felpa pegar']],

  // Mosquiteros
  ['MOS-ENR-120', 'Mosquitero enrollable blanco 1,20 × 1,50 m', 'mosquiteros', 'mos-enr', 'kit', 58500, 30, 'prov-oeste', 0, 6, 'E-01', { color: 'Blanco', medida: '1,20 × 1,50 m' }, ['mosquitero enrollable', 'mosquitero 1,20', 'mosquitero 120', 'mosquitero 1.20 x 1.50', 'mosquitero 1,20 x 1,50', 'mosquitero enrollable 1,20 x 1,50']],
  ['MOS-ENR-150', 'Mosquitero enrollable blanco 1,50 × 1,50 m', 'mosquiteros', 'mos-enr', 'kit', 66800, 30, 'prov-oeste', 9, 4, 'E-01', { color: 'Blanco', medida: '1,50 × 1,50 m' }, ['mosquitero enrollable', 'mosquitero 1,50', 'mosquitero 150', 'mosquitero 1.50 x 1.50', 'mosquitero 1,50 x 1,50']],
  ['MOS-ENR-120N', 'Mosquitero enrollable negro 1,20 × 1,50 m', 'mosquiteros', 'mos-enr', 'kit', 61200, 30, 'prov-oeste', 5, 4, 'E-01', { color: 'Negro', medida: '1,20 × 1,50 m' }, ['mosquitero enrollable negro', 'mosquitero negro']],
  ['MOS-TEL-FV', 'Tela mosquitero fibra de vidrio · rollo 30 m', 'mosquiteros', 'mos-tel', 'rollo', 42000, 27, 'prov-oeste', 12, 6, 'E-02', { color: 'Gris' }, ['tela mosquitero', 'tela de mosquitero', 'malla mosquitero', 'tejido mosquitero']],
  ['MOS-PER-6M', 'Perfil marco de mosquitero 6 m', 'mosquiteros', 'mos-per', 'u.', 9600, 32, 'prov-oeste', 40, 20, 'E-02', { medida: '6 m' }, ['perfil mosquitero', 'marco mosquitero']],
  ['MOS-ESQ-04', 'Escuadra para marco de mosquitero x 4', 'mosquiteros', 'mos-esq', 'kit', 1800, 45, 'prov-oeste', 150, 50, 'E-03', {}, ['escuadra mosquitero', 'esquineros mosquitero']],
  ['MOS-COR-120', 'Mosquitero corredizo blanco 1,20 × 1,00 m', 'mosquiteros', 'mos-cor', 'kit', 38900, 31, 'prov-oeste', 11, 6, 'E-03', { color: 'Blanco', medida: '1,20 × 1,00 m' }, ['mosquitero corredizo', 'mosquitero de corredera', 'mosquitero corredizo 1,20']],

  // Accesorios
  ['ESC-AL-20', 'Escuadra de alineación 20 mm x 100', 'accesorios', 'esc-al', 'caja', 8600, 38, 'prov-ferrari', 30, 100, 'A-09', { medida: '20 mm' }, ['escuadra alineacion', 'escuadras de alineacion', 'escuadra 20']],
  ['ESC-ARM-100', 'Escuadra de armado x 100', 'accesorios', 'esc-arm', 'caja', 11200, 37, 'prov-ferrari', 42, 30, 'A-10', {}, ['escuadra armado', 'escuadras de armado', 'escuadras']],
  ['TOR-AUT-1000', 'Tornillo autoperforante 8 × 1/2 · caja 1000', 'accesorios', 'tor-aut', 'caja', 12400, 40, 'prov-ferrari', 36, 20, 'F-01', { medida: '8 × 1/2' }, ['tornillos', 'autoperforantes', 'tornillo autoperforante', 'tornillos 8 x 1/2']],
  ['REM-POP-1000', 'Remache pop 4 × 10 · caja 1000', 'accesorios', 'rem-pop', 'caja', 7800, 41, 'prov-ferrari', 24, 15, 'F-01', { medida: '4 × 10' }, ['remaches', 'remache pop', 'pop']],
  ['TAP-DES-100', 'Tapa de desagüe x 100', 'accesorios', 'tap-des', 'caja', 4200, 43, 'prov-aluplast', 48, 20, 'F-02', {}, ['tapa desague', 'tapitas desague', 'tapa de desagüe']],
  ['TOP-GOM-50', 'Tope de goma x 50', 'accesorios', 'top-gom', 'caja', 3100, 44, 'prov-aluplast', 6, 15, 'F-02', {}, ['topes', 'tope de goma', 'topes de goma']],
  ['SIL-NEU-280', 'Sellador de silicona neutra 280 ml', 'accesorios', 'sil-neu', 'u.', 6400, 26, 'prov-aluplast', 84, 36, 'F-03', { medida: '280 ml' }, ['silicona', 'silicona neutra', 'sellador', 'cartucho silicona']],
  ['ESP-POL-750', 'Espuma de poliuretano 750 ml', 'accesorios', 'esp-pol', 'u.', 9800, 27, 'prov-aluplast', 40, 18, 'F-03', { medida: '750 ml' }, ['espuma', 'espuma poliuretano', 'espuma expansiva']],
  ['KIT-HR-2H', 'Kit de accesorios ventana Herrero 2 hojas', 'accesorios', 'kit-hr', 'kit', 16500, 33, 'prov-aluplast', 24, 12, 'A-10', { linea: 'Herrero' }, ['kit herrero', 'kit ventana herrero', 'kit accesorios herrero', 'kit de accesorios']],
];

const aCentavos = (pesos: number) => Math.round(pesos * 100);

export function productosIniciales(): Producto[] {
  return P_.map(([codigo, nombre, categoria, familia, unidad, precio, margen, proveedorId, stock, minimo, ubicacion, atributos, sinonimos]) => {
    const precioLista = aCentavos(precio);
    // Costo redondeado a $ 10, para que el margen se vea como en una lista real.
    const costo = Math.round((precioLista * (1 - margen / 100)) / 1000) * 1000;
    return {
      id: `prod-${codigo.toLowerCase()}`,
      codigo,
      nombre,
      categoria,
      familia,
      atributos,
      unidad,
      costo,
      precioLista,
      proveedorId,
      stock,
      stockMinimo: minimo,
      ubicacion,
      sinonimos,
      activo: true,
    };
  });
}
