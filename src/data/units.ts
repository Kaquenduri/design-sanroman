import { DRIVERS } from './drivers';
import type { Unit, Membership, Coordinates } from './types';

const PLACAS = [
  'B7X-482', 'T2K-915', 'V9M-204', 'X1P-673', 'Z4H-118',
  'D8R-557', 'F6T-832', 'L3N-419', 'P5C-086', 'R8G-291',
  'A1B-704', 'C7E-352', 'H2J-948', 'K9L-617', 'M4O-225',
  'N6Q-871', 'Q3S-503', 'S8U-144', 'U5V-786', 'W2X-039',
  'Y7Y-682', 'B1Z-417', 'E5A-953', 'G8C-218', 'J4F-764',
];

export const UNITS: Unit[] = DRIVERS.map((d, i) => ({
  id: d.unitId,
  placa: PLACAS[i],
  marca: 'Toyota',
  modelo: 'Corolla',
  anio: 2019 + (i % 6),
  driverId: d.id,
  status:
    i < 15 ? 'active' : i < 19 ? 'on-trip' : i < 21 ? 'break' : i < 24 ? 'offline' : 'blocked',
  lastSeenAt: new Date(Date.now() - i * 17000).toISOString(),
}));

function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const MEMBERSHIPS: Membership[] = DRIVERS.map((d, i) => {
  if (i < 20) {
    return {
      driverId: d.id,
      status: 'activa' as const,
      expiresOn: addDaysISO(60 + i * 5),
      daysToExpire: 60 + i * 5,
    };
  }
  if (i < 23) {
    return {
      driverId: d.id,
      status: 'vence-pronto' as const,
      expiresOn: addDaysISO(4 + (i - 20) * 3),
      daysToExpire: 4 + (i - 20) * 3,
    };
  }
  return {
    driverId: d.id,
    status: 'vencida' as const,
    expiresOn: addDaysISO(-(5 + (i - 23) * 7)),
    daysToExpire: -(5 + (i - 23) * 7),
  };
});

export const CITY_BOUNDS = {
  west: -70.145,
  east: -70.115,
  south: -15.51,
  north: -15.485,
};

/* ── SVG ↔ World conversions ──────────────────── */
const SVG_W = 1000;
const SVG_H = 700;

export function svgToWorld(sx: number, sy: number): Coordinates {
  const b = CITY_BOUNDS;
  return {
    lng: b.west + (sx / SVG_W) * (b.east - b.west),
    lat: b.north - (sy / SVG_H) * (b.north - b.south),
  };
}

export function project(c: Coordinates): { x: number; y: number } {
  const b = CITY_BOUNDS;
  return {
    x: ((c.lng - b.west) / (b.east - b.west)) * SVG_W,
    y: SVG_H - ((c.lat - b.south) / (b.north - b.south)) * SVG_H,
  };
}

/* ── Street segments in SVG space ─────────────── */
export type StreetSegment = {
  name: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  major?: boolean;
};

/* ══════════════════════════════════════════════════
   DETAILED JULIACA STREET GRID
   ~60 named streets for a Google-Maps-like density
   ══════════════════════════════════════════════════ */

export const STREET_SEGMENTS: StreetSegment[] = [
  /* ── HORIZONTAL — Major Avenues ── */
  { name: 'Av. Manuel Núñez Butrón', start: { x: 0, y: 42 }, end: { x: 1000, y: 42 }, major: true },
  { name: 'Av. San Martín', start: { x: 0, y: 120 }, end: { x: 1000, y: 120 }, major: true },
  { name: 'Av. Independencia', start: { x: 0, y: 220 }, end: { x: 1000, y: 220 }, major: true },
  { name: 'Av. Circunvalación', start: { x: 0, y: 380 }, end: { x: 1000, y: 380 }, major: true },
  { name: 'Av. Ferrocarril', start: { x: 0, y: 520 }, end: { x: 1000, y: 520 }, major: true },
  { name: 'Av. La Yunta', start: { x: 0, y: 640 }, end: { x: 1000, y: 640 }, major: true },

  /* ── HORIZONTAL — Secondary named streets ── */
  { name: 'Jr. Puno', start: { x: 30, y: 80 }, end: { x: 970, y: 80 } },
  { name: 'Jr. Huancané', start: { x: 60, y: 160 }, end: { x: 940, y: 160 } },
  { name: 'Jr. Moquegua', start: { x: 30, y: 265 }, end: { x: 970, y: 265 } },
  { name: 'Jr. Tacna', start: { x: 40, y: 310 }, end: { x: 960, y: 310 } },
  { name: 'Jr. Loreto', start: { x: 30, y: 440 }, end: { x: 970, y: 440 } },
  { name: 'Jr. Cusco', start: { x: 40, y: 480 }, end: { x: 960, y: 480 } },
  { name: 'Jr. San Román', start: { x: 30, y: 560 }, end: { x: 970, y: 560 } },
  { name: 'Jr. Carabaya', start: { x: 50, y: 345 }, end: { x: 950, y: 345 } },
  { name: 'Jr. Lampa', start: { x: 50, y: 190 }, end: { x: 950, y: 190 } },
  { name: 'Jr. Azángaro', start: { x: 60, y: 410 }, end: { x: 940, y: 410 } },
  { name: 'Jr. Sandia', start: { x: 50, y: 600 }, end: { x: 950, y: 600 } },
  { name: 'Jr. Mariano Melgar', start: { x: 80, y: 140 }, end: { x: 920, y: 140 } },
  { name: 'Jr. Apurímac', start: { x: 70, y: 460 }, end: { x: 930, y: 460 } },
  { name: 'Jr. 2 de Mayo', start: { x: 60, y: 242 }, end: { x: 940, y: 242 } },
  { name: 'Jr. 9 de Diciembre', start: { x: 40, y: 540 }, end: { x: 960, y: 540 } },
  { name: 'Jr. 8 de Noviembre', start: { x: 50, y: 670 }, end: { x: 950, y: 670 } },

  /* ── VERTICAL — Major Avenues ── */
  { name: 'Jr. Piura', start: { x: 120, y: 0 }, end: { x: 120, y: 700 }, major: true },
  { name: 'Jr. Bolognesi', start: { x: 320, y: 0 }, end: { x: 320, y: 700 }, major: true },
  { name: 'Av. El Sol', start: { x: 560, y: 0 }, end: { x: 560, y: 700 }, major: true },
  { name: 'Av. Ejército', start: { x: 880, y: 0 }, end: { x: 880, y: 700 }, major: true },

  /* ── VERTICAL — Secondary named streets ── */
  { name: 'Jr. Amazonas', start: { x: 200, y: 20 }, end: { x: 200, y: 680 } },
  { name: 'Jr. Tumbes', start: { x: 60, y: 30 }, end: { x: 60, y: 680 } },
  { name: 'Jr. Lima', start: { x: 390, y: 20 }, end: { x: 390, y: 680 } },
  { name: 'Jr. Arequipa', start: { x: 460, y: 20 }, end: { x: 460, y: 680 } },
  { name: 'Jr. Ica', start: { x: 635, y: 20 }, end: { x: 635, y: 680 } },
  { name: 'Jr. Ayacucho', start: { x: 710, y: 20 }, end: { x: 710, y: 680 } },
  { name: 'Jr. Junín', start: { x: 790, y: 20 }, end: { x: 790, y: 680 } },
  { name: 'Jr. Huancavelica', start: { x: 260, y: 30 }, end: { x: 260, y: 680 } },
  { name: 'Jr. Cajamarca', start: { x: 155, y: 30 }, end: { x: 155, y: 680 } },
  { name: 'Jr. Lambayeque', start: { x: 510, y: 30 }, end: { x: 510, y: 680 } },
  { name: 'Jr. Madre de Dios', start: { x: 940, y: 30 }, end: { x: 940, y: 680 } },
  { name: 'Jr. Ucayali', start: { x: 345, y: 30 }, end: { x: 345, y: 680 } },
  { name: 'Jr. Áncash', start: { x: 425, y: 30 }, end: { x: 425, y: 680 } },
  { name: 'Jr. Callao', start: { x: 670, y: 30 }, end: { x: 670, y: 680 } },
  { name: 'Jr. La Libertad', start: { x: 750, y: 30 }, end: { x: 750, y: 680 } },
  { name: 'Jr. San Luis', start: { x: 840, y: 30 }, end: { x: 840, y: 680 } },

  /* ── DIAGONAL — Av. Circunvalación Sur (curve) ── */
  { name: 'Av. Circunv. Sur', start: { x: 0, y: 400 }, end: { x: 200, y: 500 }, major: true },
  { name: 'Av. Circunv. Este', start: { x: 850, y: 350 }, end: { x: 1000, y: 460 }, major: true },
];

/* ── Secondary (unlabeled) thin grid streets ───── */
export const SECONDARY_H = [
  25, 55, 100, 175, 205, 248, 290, 330, 362, 395,
  425, 450, 495, 510, 548, 575, 615, 655, 685,
];
export const SECONDARY_V = [
  35, 90, 175, 230, 290, 370, 445, 490, 530, 595,
  650, 730, 770, 810, 860, 910, 960,
];

/* ── City blocks — filled rectangles between streets ─ */
export type CityBlock = {
  x: number; y: number; w: number; h: number;
  fill: string;
};

const BLK_FILLS = [
  '#1a102c', '#1c1130', '#180f28', '#1f1336', '#1b102e',
  '#19102b', '#1e1233', '#170e27', '#1c1231', '#1d1334',
];

function generateBlocks(): CityBlock[] {
  const hLines = [42, 80, 120, 140, 160, 190, 220, 242, 265, 310, 345, 380, 410, 440, 460, 480, 520, 540, 560, 600, 640, 670].sort((a, b) => a - b);
  const vLines = [60, 120, 155, 200, 260, 320, 345, 390, 425, 460, 510, 560, 635, 670, 710, 750, 790, 840, 880, 940].sort((a, b) => a - b);
  const blocks: CityBlock[] = [];
  let idx = 0;
  for (let hi = 0; hi < hLines.length - 1; hi++) {
    for (let vi = 0; vi < vLines.length - 1; vi++) {
      const x = vLines[vi];
      const y = hLines[hi];
      const w = vLines[vi + 1] - vLines[vi];
      const h = hLines[hi + 1] - hLines[hi];
      if (w > 8 && h > 8) {
        blocks.push({
          x: x + 2,
          y: y + 2,
          w: w - 4,
          h: h - 4,
          fill: BLK_FILLS[idx % BLK_FILLS.length],
        });
        idx++;
      }
    }
  }
  return blocks;
}

export const CITY_BLOCKS: CityBlock[] = generateBlocks();

/* ── Landmarks ─────────────────────────────────── */
export type Landmark = {
  x: number; y: number; w: number; h: number;
  label: string;
  fill: string; stroke: string;
  icon?: 'park' | 'hospital' | 'market' | 'transport' | 'stadium' | 'school' | 'church';
};

export const LANDMARKS: Landmark[] = [
  { x: 280, y: 130, w: 80, h: 54, label: 'Plaza de Armas', fill: '#132e1e', stroke: '#2d5a40', icon: 'park' },
  { x: 560, y: 350, w: 90, h: 50, label: 'Hospital C. Monge', fill: '#1a2440', stroke: '#3b5275', icon: 'hospital' },
  { x: 135, y: 250, w: 75, h: 42, label: 'Mercado San José', fill: '#2a2018', stroke: '#5a4030', icon: 'market' },
  { x: 830, y: 580, w: 90, h: 45, label: 'Terminal Terrestre', fill: '#1a2040', stroke: '#3b4875', icon: 'transport' },
  { x: 680, y: 65, w: 100, h: 55, label: 'Parque Ecológico', fill: '#132e1e', stroke: '#2d5a40', icon: 'park' },
  { x: 390, y: 470, w: 80, h: 40, label: 'Estadio C. Díaz', fill: '#1a2440', stroke: '#3b5275', icon: 'stadium' },
  { x: 440, y: 120, w: 75, h: 38, label: 'I.E. José Antonio Encinas', fill: '#1e1a2e', stroke: '#4a3b75', icon: 'school' },
  { x: 310, y: 300, w: 70, h: 38, label: 'Mercado Túpac Amaru', fill: '#2a2018', stroke: '#5a4030', icon: 'market' },
  { x: 180, y: 560, w: 75, h: 38, label: 'Mercado Santa Bárbara', fill: '#2a2018', stroke: '#5a4030', icon: 'market' },
  { x: 635, y: 550, w: 72, h: 38, label: 'Iglesia Santa Catalina', fill: '#1e1a2e', stroke: '#4a3b75', icon: 'church' },
  { x: 790, y: 200, w: 80, h: 42, label: 'Clínica Adventista', fill: '#1a2440', stroke: '#3b5275', icon: 'hospital' },
  { x: 500, y: 245, w: 70, h: 34, label: 'Plaza Bolognesi', fill: '#132e1e', stroke: '#2d5a40', icon: 'park' },
  { x: 120, y: 410, w: 80, h: 38, label: 'Mercado Las Mercedes', fill: '#2a2018', stroke: '#5a4030', icon: 'market' },
  { x: 880, y: 120, w: 60, h: 34, label: 'Grifo Repsol', fill: '#1a2040', stroke: '#3b4875' },
  { x: 710, y: 440, w: 75, h: 38, label: 'Plaza Zarumilla', fill: '#132e1e', stroke: '#2d5a40', icon: 'park' },
];

/* ── Roundabouts / Óvalos ──────────────────────── */
export type Roundabout = {
  cx: number; cy: number; r: number; label: string;
};

export const ROUNDABOUTS: Roundabout[] = [
  { cx: 320, cy: 220, r: 16, label: 'Óvalo La Cultura' },
  { cx: 560, cy: 380, r: 18, label: 'Óvalo Circunv.' },
  { cx: 120, cy: 640, r: 14, label: 'Óvalo El Sol' },
  { cx: 880, cy: 520, r: 16, label: 'Óvalo Ejército' },
];

/* ── Vehicle positions — carefully placed ON intersections ─ */
type IntersectionPoint = { x: number; y: number };

const VEHICLE_PLACEMENTS: IntersectionPoint[] = [
  // Unit 01 — Jr. Piura × Av. San Martín
  { x: 120, y: 120 },
  // Unit 02 — Jr. Amazonas × Jr. Moquegua
  { x: 200, y: 265 },
  // Unit 03 — Jr. Bolognesi × Jr. Tacna
  { x: 320, y: 310 },
  // Unit 04 — Jr. Lima × Av. Circunvalación
  { x: 390, y: 380 },
  // Unit 05 — Jr. Arequipa × Jr. Loreto
  { x: 460, y: 440 },
  // Unit 06 — Av. El Sol × Jr. Cusco
  { x: 560, y: 480 },
  // Unit 07 — Jr. Ica × Jr. San Román
  { x: 635, y: 560 },
  // Unit 08 — Jr. Ayacucho × Av. La Yunta
  { x: 710, y: 640 },
  // Unit 09 — Jr. Junín × Av. Independencia
  { x: 790, y: 220 },
  // Unit 10 — Av. Ejército × Jr. Puno
  { x: 880, y: 80 },
  // Unit 11 — Jr. Cajamarca × Jr. Lampa
  { x: 155, y: 190 },
  // Unit 12 — Jr. Huancavelica × Av. San Martín
  { x: 260, y: 120 },
  // Unit 13 — Jr. Ucayali × Jr. Carabaya
  { x: 345, y: 345 },
  // Unit 14 — Jr. Áncash × Av. Ferrocarril
  { x: 425, y: 520 },
  // Unit 15 — Jr. Lambayeque × Jr. Sandia
  { x: 510, y: 600 },
  // Unit 16 — Jr. Callao × Av. Circunvalación
  { x: 670, y: 380 },
  // Unit 17 — Jr. La Libertad × Jr. Azángaro
  { x: 750, y: 410 },
  // Unit 18 — Jr. San Luis × Jr. Apurímac
  { x: 840, y: 460 },
  // Unit 19 — Jr. Tumbes × Jr. Huancané
  { x: 60, y: 160 },
  // Unit 20 — Jr. Piura × Jr. Carabaya
  { x: 120, y: 345 },
  // Unit 21 — Jr. Bolognesi × Jr. Cusco
  { x: 320, y: 480 },
  // Unit 22 — Av. El Sol × Jr. Mariano Melgar
  { x: 560, y: 140 },
  // Unit 23 — Jr. Ica × Jr. 2 de Mayo
  { x: 635, y: 242 },
  // Unit 24 — Av. Ejército × Jr. 9 de Diciembre
  { x: 880, y: 540 },
  // Unit 25 — Jr. Madre de Dios × Jr. 8 de Noviembre
  { x: 940, y: 670 },
];

export const UNIT_POSITIONS: Record<string, Coordinates> = UNITS.reduce(
  (acc, u, i) => {
    const pt = VEHICLE_PLACEMENTS[i] ?? { x: 500, y: 350 };
    acc[u.id] = svgToWorld(pt.x, pt.y);
    return acc;
  },
  {} as Record<string, Coordinates>
);

/* ── Get the SVG position of a unit (for animation snapping) ─ */
export function getUnitSvgPos(unitId: string): { x: number; y: number } | null {
  const idx = UNITS.findIndex(u => u.id === unitId);
  if (idx < 0) return null;
  return VEHICLE_PLACEMENTS[idx] ?? null;
}

/* All intersections for snapping client pins to streets */
export function getAllIntersections(): { x: number; y: number }[] {
  const hCoords = STREET_SEGMENTS.filter(s => s.start.y === s.end.y).map(s => s.start.y);
  const vCoords = STREET_SEGMENTS.filter(s => s.start.x === s.end.x).map(s => s.start.x);
  const pts: { x: number; y: number }[] = [];
  for (const vx of vCoords) {
    for (const hy of hCoords) {
      pts.push({ x: vx, y: hy });
    }
  }
  return pts;
}

/* Snap a world coordinate to the nearest street intersection */
export function snapToNearestStreet(coord: Coordinates): Coordinates {
  const svg = project(coord);
  const intersections = getAllIntersections();
  let best = intersections[0];
  let bestDist = Infinity;
  for (const pt of intersections) {
    const d = (pt.x - svg.x) ** 2 + (pt.y - svg.y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = pt;
    }
  }
  return svgToWorld(best.x, best.y);
}

/* ── Legacy seededPos for requests.ts ──────────── */
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function seededPos(seed: number): Coordinates {
  const rng = seededRand(seed);
  return {
    lng: CITY_BOUNDS.west + rng() * (CITY_BOUNDS.east - CITY_BOUNDS.west),
    lat: CITY_BOUNDS.south + rng() * (CITY_BOUNDS.north - CITY_BOUNDS.south),
  };
}

export { seededRand, seededPos };
