/**
 * Interpretación de pedidos escritos por WhatsApp — SIMULADA con reglas.
 * No usa ningún servicio externo: busca palabras clave, sinónimos, colores, líneas y medidas contra el catálogo.
 * En el sistema real se reemplaza por un modelo de lenguaje con la misma salida (InterpretacionPedido).
 */
import type { Producto } from '@/domain/types';

export interface LineaInterpretada {
  /** Fragmento del mensaje del que salió la línea. */
  texto: string;
  cantidad: number;
  /** null si no se pudo identificar con seguridad. */
  productoId: string | null;
  /** 0 a 1. */
  confianza: number;
  /** Productos posibles cuando no se pudo decidir (para elegir a mano). */
  candidatos: string[];
  /** Observación para quien revisa: "Se vende por caja x 100". */
  nota?: string;
}

export interface InterpretacionPedido {
  lineas: LineaInterpretada[];
  /** Pistas de entrega: "mañana", "retira". */
  entrega?: { cuando?: 'hoy' | 'mañana'; retira?: boolean };
}

export type NivelConfianza = 'alta' | 'media' | 'baja';

export function nivelConfianza(c: number | undefined): NivelConfianza {
  if (c == null) return 'alta';
  if (c >= 0.85) return 'alta';
  if (c >= 0.6) return 'media';
  return 'baja';
}

/* ───────────── Normalización ───────────── */

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const COLORES: Record<string, string> = {
  negro: 'negro', negra: 'negro', negros: 'negro', negras: 'negro',
  blanco: 'blanco', blanca: 'blanco', blancos: 'blanco', blancas: 'blanco',
  natural: 'natural', naturales: 'natural', anodizado: 'natural', anodizada: 'natural',
  gris: 'gris', grises: 'gris',
};

const LINEAS: Record<string, string> = { herrero: 'herrero', modena: 'modena', a30: 'a30' };

const NUMEROS_PALABRA: Record<string, number> = {
  un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  doce: 12, quince: 15, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50, cien: 100, docena: 12,
};

const RELLENO = new Set([
  'de', 'del', 'para', 'la', 'el', 'los', 'las', 'lo', 'con', 'en', 'y', 'a', 'al', 'por', 'que', 'si', 'se', 'me', 'te', 'mas',
  'linea', 'tenes', 'tienen', 'tiene', 'hay', 'pasame', 'pasas', 'pasar', 'precio', 'precios', 'necesito', 'necesitaria',
  'quiero', 'queria', 'mandame', 'sumame', 'sumalos', 'cotizame', 'dame', 'porfa', 'gracias', 'hola', 'buenas', 'buen', 'dia',
  'tardes', 'ah', 'tmb', 'tambien', 'otro', 'otra', 'mas', 'unos', 'unas', 'cuanto', 'sale', 'salen', 'saber', 'stock',
  'favor', 'mañana', 'manana', 'hoy', 'ok', 'dale', 'listo', 'tipo', 'como',
]);

/** Plural y género a una raíz común: "rieles" → "riel", "cierres" → "cierr", "dobles" → "dobl". */
export function raiz(w: string): string {
  let r = w;
  if (r.length > 3) r = r.replace(/s$/, '');
  if (r.length > 4) r = r.replace(/e$/, '');
  return r;
}

/** Texto en minúsculas, sin tildes, con abreviaturas expandidas y medidas separadas ("6mm" → "6 mm"). */
export function normalizarTexto(t: string): string {
  return sinTildes(t.toLowerCase())
    .replace(/\bp\//g, 'para ')
    .replace(/\bc\//g, 'con ')
    .replace(/\bx\s*(\d)/g, 'x $1')
    .replace(/(\d)\s*x\s*(\d)/g, '$1 x $2')
    .replace(/(\d)(mm|cm|ml|m)\b/g, '$1 $2')
    .replace(/[¿?¡!"“”()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const tokens = (t: string) => t.split(/[\s.:;]+/).filter(Boolean);

/* ───────────── Índice del catálogo ───────────── */

interface Indice {
  p: Producto;
  sinonimos: Array<{ palabras: string[]; medida?: string }>;
  nombre: Set<string>;
  color?: string;
  linea?: string;
  /** Parte numérica de la medida: "7 x 5", "1,20 x 1,50", "6". */
  medida?: string;
}

/** "7 x 5 mm" → "7 x 5"; "6 m" → "6". */
function parteNumerica(t: string): string | undefined {
  const m = normalizarTexto(t).match(/\d[\d,]*(?:\s*x\s*\d[\d,]*)?/);
  return m?.[0].replace(/\s+/g, ' ');
}

function indexar(productos: Producto[]): Indice[] {
  return productos.filter((p) => p.activo).map((p) => {
    const sinonimos = p.sinonimos
      .map((s) => ({ palabras: tokens(normalizarTexto(s)).filter((w) => !RELLENO.has(w) && !COLORES[w] && !/\d/.test(w) && w !== 'x').map(raiz), medida: /\d/.test(s) ? parteNumerica(s) : undefined }))
      .filter((s) => s.palabras.length);
    const nombreT = tokens(normalizarTexto(p.nombre)).filter((w) => !RELLENO.has(w)).map(raiz);
    return {
      p,
      sinonimos,
      nombre: new Set(nombreT),
      color: p.atributos.color ? COLORES[sinTildes(p.atributos.color.toLowerCase())] : undefined,
      linea: p.atributos.linea ? LINEAS[sinTildes(p.atributos.linea.toLowerCase())] : undefined,
      medida: p.atributos.medida ? parteNumerica(p.atributos.medida) : undefined,
    };
  });
}

/* ───────────── Segmentación del mensaje ───────────── */

/** Separa el mensaje en pedidos sueltos: renglones, viñetas, comas y "y" seguido de una cantidad. */
function segmentar(texto: string): string[] {
  return texto
    .split(/\n+/)
    .flatMap((l) => l.split(/,\s+|(?<!\d),(?!\d)|;|\.\s+|\.$/))
    .flatMap((l) => l.split(/\s+y\s+(?=(?:si\s+tenes\s+)?(?:\d|un\b|una\b|dos\b|tres\b|cuatro\b|cinco\b|seis\b|diez\b|pasame|precio))/i))
    .flatMap((l) => l.split(/\s+ah\s+y\s+/i))
    .map((l) => l.replace(/^\s*[-•*]\s*/, '').replace(/^(y|ah y|ah)\s+/i, '').trim())
    .filter((l) => l.length > 1);
}

/** Cantidad pedida: el primer número que no es una medida (ni "1,20 x 1,50" ni "6 mm" ni "de 6"). */
const UNIDADES_MEDIDA = new Set(['x', 'mm', 'cm', 'm', 'ml', 'mts', 'metros']);

function extraerCantidad(ws: string[]): { cantidad: number; explicita: boolean; indice: number } {
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    const sig = ws[i + 1];
    const ant = ws[i - 1];
    if (/^\d+$/.test(w)) {
      if (UNIDADES_MEDIDA.has(sig ?? '') || ant === 'x' || ant === 'por') continue;
      // "riel de 6" es medida; "precio de 4 rollos" es cantidad.
      if (ant === 'de' && (!sig || /\d/.test(sig) || RELLENO.has(sig))) continue;
      return { cantidad: Number(w), explicita: true, indice: i };
    }
    if (/^\d+[.,]\d+$/.test(w)) continue;
    if (w === 'un' && sig === 'par') return { cantidad: 2, explicita: true, indice: i };
    if (w === 'media' && sig === 'docena') return { cantidad: 6, explicita: true, indice: i };
    if (NUMEROS_PALABRA[w] && sig && !RELLENO.has(sig) && sig !== 'ventana') return { cantidad: NUMEROS_PALABRA[w], explicita: true, indice: i };
  }
  return { cantidad: 1, explicita: false, indice: -1 };
}

/* ───────────── Puntaje de cada producto ───────────── */

interface Atributos {
  /** Segmento normalizado sin la cantidad, con espacios al borde para buscar medidas. */
  texto: string;
  raices: Set<string>;
  color?: string;
  linea?: string;
  numeros: string[];
}

function atributosDe(ws: string[], indiceCantidad: number): Atributos {
  const raices = new Set<string>();
  let color: string | undefined;
  let linea: string | undefined;
  const numeros: string[] = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    if (COLORES[w]) color = COLORES[w];
    if (LINEAS[w]) linea = LINEAS[w];
    // La cantidad pedida no es una medida.
    if (/\d/.test(w) && i !== indiceCantidad) numeros.push(w.replace('.', ','));
    if (!RELLENO.has(w) && !COLORES[w] && !/^\d+$/.test(w)) raices.add(raiz(w));
  }
  const texto = ` ${ws.filter((_, i) => i !== indiceCantidad).join(' ')} `;
  return { texto, raices, color, linea, numeros };
}

function puntaje(ix: Indice, a: Atributos): { s: number; completo: boolean } {
  // Mejor sinónimo: cuántas de sus palabras aparecen. Completo vale más cuanto más largo (más específico).
  let mejor = 0;
  let completo = false;
  const tieneMedida = (m: string) => a.texto.includes(` ${m} `);
  for (const s of ix.sinonimos) {
    const hits = s.palabras.filter((w) => a.raices.has(w)).length;
    const medidaOk = !s.medida || tieneMedida(s.medida);
    const largo = s.palabras.length + (s.medida ? 1 : 0);
    if (hits === s.palabras.length && medidaOk) {
      mejor = Math.max(mejor, 2 + largo);
      completo = true;
    } else if (hits > 0) mejor = Math.max(mejor, (hits / largo) * 2);
  }
  if (mejor === 0) return { s: 0, completo: false };
  let score = mejor;
  // Palabras del nombre (desempata "ruedas dobles" de "ruedas simples").
  for (const r of a.raices) if (ix.nombre.has(r)) score += 0.6;
  // Color, línea y medida.
  if (a.color) score += ix.color === a.color ? 2 : ix.color ? -6 : 0;
  if (a.linea) score += ix.linea === a.linea ? 1.5 : ix.linea && ix.linea !== 'universal' ? -6 : 0;
  if (ix.medida) {
    if (tieneMedida(ix.medida)) score += 2.5;
    else if (a.numeros.length) score -= 2;
  }
  return { s: score, completo };
}

/* ───────────── Interpretación ───────────── */

export function interpretarPedido(texto: string, productos: Producto[]): InterpretacionPedido {
  const indice = indexar(productos);
  const lineas: LineaInterpretada[] = [];
  const norm = normalizarTexto(texto);
  const entrega: InterpretacionPedido['entrega'] = {};
  if (/\b(para )?manana\b/.test(norm)) entrega.cuando = 'mañana';
  else if (/\bpara hoy\b/.test(norm)) entrega.cuando = 'hoy';
  if (/\b(retiro|retirar|paso a buscar|paso a retirar|paso por)\b/.test(norm)) entrega.retira = true;

  for (const original of segmentar(texto)) {
    const ws = tokens(normalizarTexto(original));
    const { cantidad, explicita, indice: iCant } = extraerCantidad(ws);
    const a = atributosDe(ws, iCant);

    const puntuados = indice
      .map((ix) => ({ ix, ...puntaje(ix, a) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s);
    const [primero, segundo] = puntuados;

    // Sin cantidad ni producto nombrado completo: saludo o comentario. Si menciona un color, puede corregir una línea anterior.
    if (!explicita && (!primero || primero.s < 3 || !primero.completo)) {
      if (a.color) {
        const previa = [...lineas].reverse().find((l) => {
          const p = l.productoId ? productos.find((x) => x.id === l.productoId) : undefined;
          return p && [...a.raices].some((r) => normalizarTexto(p.nombre).split(' ').map(raiz).includes(r));
        });
        if (previa?.productoId) {
          const actual = productos.find((p) => p.id === previa.productoId)!;
          const variante = productos.find((p) => p.familia === actual.familia && p.atributos.color && COLORES[sinTildes(p.atributos.color.toLowerCase())] === a.color && p.atributos.medida === actual.atributos.medida);
          if (variante) {
            previa.productoId = variante.id;
            previa.confianza = 0.92;
            previa.candidatos = [];
            previa.nota = `Color confirmado en otro mensaje: “${original}”.`;
          }
        }
      }
      continue;
    }

    if (!primero || primero.s < 3) {
      lineas.push({ texto: original, cantidad, productoId: null, confianza: 0.2, candidatos: puntuados.slice(0, 3).map((x) => x.ix.p.id) });
      continue;
    }

    const empate = segundo && primero.s - segundo.s < 0.5;
    if (empate) {
      const soloColor = primero.ix.p.familia === segundo.ix.p.familia && primero.ix.p.atributos.medida === segundo.ix.p.atributos.medida && primero.ix.color !== segundo.ix.color;
      if (soloColor && !a.color) {
        // Mismo producto en otro color y el cliente no dijo cuál: se propone el de más stock y se marca para revisar.
        const empatados = puntuados.filter((x) => primero.s - x.s < 0.5 && x.ix.p.familia === primero.ix.p.familia);
        const elegido = [...empatados].sort((x, y) => y.ix.p.stock - x.ix.p.stock)[0];
        lineas.push({
          texto: original, cantidad, productoId: elegido.ix.p.id, confianza: 0.7,
          candidatos: empatados.map((x) => x.ix.p.id),
          nota: 'El cliente no dijo el color: se propuso el de más stock.',
        });
      } else {
        lineas.push({ texto: original, cantidad, productoId: null, confianza: 0.4, candidatos: puntuados.filter((x) => primero.s - x.s < 1.5).slice(0, 3).map((x) => x.ix.p.id) });
      }
      continue;
    }

    const brecha = segundo ? primero.s - segundo.s : 3;
    let confianza = Math.min(0.98, 0.72 + brecha * 0.07 + (a.color && primero.ix.color === a.color ? 0.06 : 0) + (explicita ? 0.04 : 0));
    let nota: string | undefined;
    const p = primero.ix.p;
    if (p.unidad === 'caja' && cantidad >= 10 && !ws.some((w) => raiz(w) === 'caja')) {
      confianza = Math.min(confianza, 0.66);
      const porCaja = p.nombre.match(/x (\d+)/)?.[1];
      nota = `Se vende por caja${porCaja ? ` de ${porCaja}` : ''}: revisá si pidió ${cantidad} cajas o ${cantidad} unidades.`;
    }
    if (!explicita) {
      confianza = Math.min(confianza, 0.8);
      nota = nota ?? 'Pidió precio sin cantidad: se cotiza 1.';
    }
    lineas.push({ texto: original, cantidad, productoId: p.id, confianza, candidatos: puntuados.slice(0, 3).map((x) => x.ix.p.id), nota });
  }

  return { lineas, entrega: entrega.cuando || entrega.retira ? entrega : undefined };
}
