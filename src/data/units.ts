import { DRIVERS } from './drivers';
import { seededPoint, type WorldPoint } from '@/lib/city';
import type { Unit, Membership, CategoryId } from './types';

const PLACAS = [
  'B7X-482', 'T2K-915', 'V9M-204', 'X1P-673', 'Z4H-118',
  'D8R-557', 'F6T-832', 'L3N-419', 'P5C-086', 'R8G-291',
  'A1B-704', 'C7E-352', 'H2J-948', 'K9L-617', 'M4O-225',
  'N6Q-871', 'Q3S-503', 'S8U-144', 'U5V-786', 'W2X-039',
  'Y7Y-682', 'B1Z-417', 'E5A-953', 'G8C-218', 'J4F-764',
];

/** Reparto de flota: mayoría sedán, es lo que realmente circula en Juliaca. */
const CATEGORIES: CategoryId[] = [
  'SEDAN', 'SEDAN', 'PROBOX', 'SEDAN', 'SEDAN',
  'MINIVAN', 'SEDAN', 'PROBOX', 'SEDAN', 'SEDAN',
  'SUV', 'SEDAN', 'SEDAN', 'PROBOX', 'SEDAN',
  'MINIVAN', 'SEDAN', 'SEDAN', 'PROBOX', 'SEDAN',
  'SEDAN', 'SUV', 'SEDAN', 'SEDAN', 'MINIVAN',
];

const MODELS: Record<CategoryId, { marca: string; modelo: string }> = {
  SEDAN: { marca: 'Toyota', modelo: 'Corolla' },
  PROBOX: { marca: 'Toyota', modelo: 'Probox' },
  MINIVAN: { marca: 'Hyundai', modelo: 'H1' },
  SUV: { marca: 'Nissan', modelo: 'X-Trail' },
};

export const UNITS: Unit[] = DRIVERS.map((d, i) => {
  const categoryId = CATEGORIES[i];
  const model = MODELS[categoryId];
  return {
    id: d.unitId,
    n: String(i + 1).padStart(2, '0'),
    placa: PLACAS[i],
    marca: model.marca,
    modelo: model.modelo,
    anio: 2019 + (i % 6),
    categoryId,
    driverId: d.id,
    status:
      i < 16 ? 'active' : i < 21 ? 'on-trip' : i < 24 ? 'offline' : 'blocked',
    heading: (i * 47) % 360,
    // Reloj fijo: `Date.now()` en el módulo desincroniza servidor y cliente.
    lastSeenAt: new Date(Date.UTC(2026, 7, 30, 14, 12, 0) - i * 17000)
      .toISOString(),
  };
});

/** Posiciones en coordenadas del mundo de `lib/city`. */
export const UNIT_POSITIONS: Record<string, WorldPoint> = UNITS.reduce(
  (acc, u, i) => {
    acc[u.id] = seededPoint(i + 7);
    return acc;
  },
  {} as Record<string, WorldPoint>
);

function addDaysISO(days: number): string {
  // Fecha ancla fija por la misma razón que `lastSeenAt`.
  const d = new Date(Date.UTC(2026, 7, 30));
  d.setUTCDate(d.getUTCDate() + days);
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
