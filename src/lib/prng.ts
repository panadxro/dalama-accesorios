/** Generador pseudoaleatorio con semilla (mulberry32): los datos de ejemplo salen siempre iguales. */
export function crearAzar(semilla: number) {
  let s = semilla >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const entero = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;
  return {
    next,
    entero,
    chance: (p: number) => next() < p,
    elegir: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    /** Elige según pesos. */
    ponderado: <T,>(items: readonly T[], peso: (x: T) => number): T => {
      const total = items.reduce((a, x) => a + peso(x), 0);
      let r = next() * total;
      for (const x of items) {
        r -= peso(x);
        if (r <= 0) return x;
      }
      return items[items.length - 1];
    },
    /** n elementos distintos. */
    muestra: <T,>(arr: readonly T[], n: number): T[] => {
      const copia = [...arr];
      const out: T[] = [];
      while (out.length < n && copia.length) out.push(copia.splice(Math.floor(next() * copia.length), 1)[0]);
      return out;
    },
  };
}

export type Azar = ReturnType<typeof crearAzar>;
