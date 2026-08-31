/**
 * Cartografía sintética determinista del casco urbano de Juliaca.
 *
 * No es GIS real: es un modelo vial construido a mano que se lee como un mapa
 * de un vistazo. Todo es determinista (PRNG con semilla fija) porque el mismo
 * árbol debe renderizarse en servidor y en cliente sin desajuste de hidratación.
 *
 * El mundo mide 1600×1200 unidades. Las tres superficies recortan ese mismo
 * mundo con distintos viewBox, así que la ciudad es literalmente la misma para
 * el conductor, el cliente y la operadora.
 */

export const WORLD = { w: 1600, h: 1200 } as const;

/** Plaza de Armas — origen del sistema de anillos tarifarios. */
export const PLAZA = { x: 720, y: 560 } as const;

export type Segment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  name?: string;
};

/** Vías arteriales: las que la operadora nombra por radio. */
export const ARTERIALS: Segment[] = [
  { x1: 0, y1: 180, x2: WORLD.w, y2: 180, name: 'Av. Independencia' },
  { x1: 0, y1: 420, x2: WORLD.w, y2: 420, name: 'Av. San Martín' },
  { x1: 0, y1: 700, x2: WORLD.w, y2: 700, name: 'Av. Circunvalación' },
  { x1: 0, y1: 960, x2: WORLD.w, y2: 960, name: 'Jr. Melgar' },
  { x1: 300, y1: 0, x2: 300, y2: WORLD.h, name: 'Jr. Loreto' },
  { x1: 560, y1: 0, x2: 560, y2: WORLD.h, name: 'Jr. Piura' },
  { x1: 880, y1: 0, x2: 880, y2: WORLD.h, name: 'Jr. Bolognesi' },
  { x1: 1180, y1: 0, x2: 1180, y2: WORLD.h, name: 'Av. El Sol' },
  { x1: 1440, y1: 0, x2: 1440, y2: WORLD.h, name: 'Jr. Moquegua' },
];

const ARTERIAL_Y = [180, 420, 700, 960];
const ARTERIAL_X = [300, 560, 880, 1180, 1440];

const near = (list: number[], v: number, gap: number) =>
  list.some((a) => Math.abs(a - v) < gap);

/** Vías secundarias — trama intermedia entre arteriales. */
const SEC_Y: number[] = [];
const SEC_X: number[] = [];
for (let y = 60; y < WORLD.h; y += 92) {
  if (!near(ARTERIAL_Y, y, 46)) SEC_Y.push(y);
}
for (let x = 80; x < WORLD.w; x += 100) {
  if (!near(ARTERIAL_X, x, 52)) SEC_X.push(x);
}

export const SECONDARY: Segment[] = [
  ...SEC_Y.map((y) => ({ x1: 0, y1: y, x2: WORLD.w, y2: y })),
  ...SEC_X.map((x) => ({ x1: x, y1: 0, x2: x, y2: WORLD.h })),
];

/**
 * Calles locales. Existen para que el mapa siga teniendo grano cuando la app
 * móvil se acerca: sin este tercer nivel, un encuadre cerrado solo muestra
 * manzanas enormes y deja de leerse como ciudad.
 */
const LOC_Y: number[] = [];
const LOC_X: number[] = [];
for (let y = 24; y < WORLD.h; y += 46) {
  if (!near(ARTERIAL_Y, y, 34) && !near(SEC_Y, y, 26)) LOC_Y.push(y);
}
for (let x = 34; x < WORLD.w; x += 50) {
  if (!near(ARTERIAL_X, x, 38) && !near(SEC_X, x, 28)) LOC_X.push(x);
}

export const LOCALS: Segment[] = [
  ...LOC_Y.map((y) => ({ x1: 0, y1: y, x2: WORLD.w, y2: y })),
  ...LOC_X.map((x) => ({ x1: x, y1: 0, x2: x, y2: WORLD.h })),
];

/** Río Coata — banda de agua al sur del casco. */
export const RIVER =
  'M -40 1120 C 220 1060, 430 1150, 690 1096 S 1150 1010, 1400 1074 S 1640 1108, 1660 1096';

export type Area = { x: number; y: number; w: number; h: number; name?: string };

export const PARKS: Area[] = [
  { x: 1216, y: 216, w: 232, h: 148, name: 'Parque Ecológico' },
  { x: 352, y: 792, w: 156, h: 112, name: 'Parque Túpac' },
];

/** Manzanas relevantes con nombre — puntos de referencia del dominio. */
export const LANDMARKS: { x: number; y: number; label: string }[] = [
  { x: 1024, y: 318, label: 'Mercado San José' },
  { x: 452, y: 546, label: 'Terminal Terrestre' },
  { x: 1284, y: 792, label: 'Hospital C. Monge' },
  { x: 800, y: 872, label: 'Mercado Túpac Amaru' },
];

/**
 * Anillos tarifarios concéntricos sobre la Plaza de Armas.
 * Es el modelo de precio real del gremio: tarifa fija por anillo, no por auction.
 * Radios y montos son sintéticos hasta que el gremio publique su tarifario.
 */
export const ANILLOS = [
  { n: 1, r: 190, tarifa: 8, nombre: 'Anillo 1 · Centro' },
  { n: 2, r: 340, tarifa: 10, nombre: 'Anillo 2 · Intermedio' },
  { n: 3, r: 520, tarifa: 13, nombre: 'Anillo 3 · Periférico' },
] as const;

/** Devuelve el anillo que contiene un punto del mundo. */
export function anilloDe(x: number, y: number) {
  const d = Math.hypot(x - PLAZA.x, y - PLAZA.y);
  return ANILLOS.find((a) => d <= a.r) ?? ANILLOS[ANILLOS.length - 1];
}

/* -------------------------------------------------------------------------
   Manzanas — generadas con PRNG sembrado para que la textura urbana sea
   irregular pero idéntica en cada render.
   ------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Block = { x: number; y: number; w: number; h: number; tone: 0 | 1 };

/** Y aproximada del río en una X dada — para no dibujar manzanas sobre el agua. */
function riverY(x: number): number {
  return 1096 + Math.sin((x / WORLD.w) * Math.PI * 2.2) * 34;
}

function inArea(x: number, y: number, w: number, h: number, a: Area): boolean {
  return x < a.x + a.w && x + w > a.x && y < a.y + a.h && y + h > a.y;
}

export const BLOCKS: Block[] = (() => {
  const rnd = mulberry32(0x5a13);
  const out: Block[] = [];

  // Los cortes de la retícula: arteriales + secundarias + locales.
  const xs = [0, ...ARTERIAL_X, ...SEC_X, ...LOC_X, WORLD.w].sort(
    (a, b) => a - b
  );
  const ys = [0, ...ARTERIAL_Y, ...SEC_Y, ...LOC_Y, WORLD.h].sort(
    (a, b) => a - b
  );

  // Margen chico: si la manzana se separa mucho, la calle deja de leerse
  // como asfalto y aparece un canal negro entre bloques.
  const pad = 3;

  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x = xs[i] + pad;
      const y = ys[j] + pad;
      const w = xs[i + 1] - xs[i] - pad * 2;
      const h = ys[j + 1] - ys[j] - pad * 2;
      if (w < 14 || h < 14) continue;

      // El agua y los parques no llevan manzana.
      if (y + h > riverY(x + w / 2) - 26) continue;
      if (PARKS.some((p) => inArea(x, y, w, h, p))) continue;

      // La plaza ocupa su propia manzana.
      if (
        Math.abs(x + w / 2 - PLAZA.x) < 70 &&
        Math.abs(y + h / 2 - PLAZA.y) < 60
      )
        continue;

      // Algunas manzanas se subdividen: da grano de ciudad real.
      const r = rnd();
      if (r > 0.78 && w > 46) {
        const cut = w * (0.38 + rnd() * 0.24);
        out.push({ x, y, w: cut - 4, h, tone: rnd() > 0.5 ? 1 : 0 });
        out.push({
          x: x + cut + 4,
          y,
          w: w - cut - 4,
          h,
          tone: rnd() > 0.5 ? 1 : 0,
        });
      } else if (r > 0.6 && h > 42) {
        const cut = h * (0.4 + rnd() * 0.2);
        out.push({ x, y, w, h: cut - 4, tone: rnd() > 0.5 ? 1 : 0 });
        out.push({
          x,
          y: y + cut + 4,
          w,
          h: h - cut - 4,
          tone: rnd() > 0.5 ? 1 : 0,
        });
      } else {
        out.push({ x, y, w, h, tone: rnd() > 0.62 ? 1 : 0 });
      }
    }
  }
  return out;
})();

/* -------------------------------------------------------------------------
   Posiciones de unidades — determinista, repartidas por el casco.
   ------------------------------------------------------------------------- */

export type WorldPoint = { x: number; y: number };

/** Punto determinista dentro del casco, sesgado hacia el centro. */
export function seededPoint(seed: number): WorldPoint {
  const rnd = mulberry32(seed * 2654435761);
  const ang = rnd() * Math.PI * 2;
  const rad = Math.pow(rnd(), 0.62) * 560;
  return {
    x: Math.max(40, Math.min(WORLD.w - 40, PLAZA.x + Math.cos(ang) * rad)),
    y: Math.max(40, Math.min(1040, PLAZA.y + Math.sin(ang) * rad * 0.86)),
  };
}

/** Ruta curva suave entre dos puntos, con desvío lateral determinista. */
export function routeBetween(a: WorldPoint, b: WorldPoint, seed = 3): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const rnd = mulberry32(seed * 7919);
  const bend = (rnd() - 0.5) * len * 0.42;
  // Perpendicular al segmento — la ruta se aparta del trazo recto.
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

/** Punto y ángulo a lo largo de una curva cuadrática, con t ∈ [0,1]. */
export function pointOnQuad(
  a: WorldPoint,
  c: WorldPoint,
  b: WorldPoint,
  t: number
): { x: number; y: number; angle: number } {
  const inv = 1 - t;
  const x = inv * inv * a.x + 2 * inv * t * c.x + t * t * b.x;
  const y = inv * inv * a.y + 2 * inv * t * c.y + t * t * b.y;
  const dxv = 2 * inv * (c.x - a.x) + 2 * t * (b.x - c.x);
  const dyv = 2 * inv * (c.y - a.y) + 2 * t * (b.y - c.y);
  return { x, y, angle: (Math.atan2(dyv, dxv) * 180) / Math.PI };
}

/** Control point de `routeBetween`, para poder recorrer la misma curva. */
export function quadControl(
  a: WorldPoint,
  b: WorldPoint,
  seed = 3
): WorldPoint {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const rnd = mulberry32(seed * 7919);
  const bend = (rnd() - 0.5) * len * 0.42;
  return { x: mx + (-dy / len) * bend, y: my + (dx / len) * bend };
}
