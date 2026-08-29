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
    i < 18 ? 'active' : i < 22 ? 'on-trip' : i < 24 ? 'offline' : 'blocked',
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

function seededPos(seed: number): Coordinates {
  const a = (seed * 9301 + 49297) % 233280;
  const r1 = a / 233280;
  const a2 = (a * 9301 + 49297) % 233280;
  const r2 = a2 / 233280;
  return {
    lng: CITY_BOUNDS.west + r1 * (CITY_BOUNDS.east - CITY_BOUNDS.west),
    lat: CITY_BOUNDS.south + r2 * (CITY_BOUNDS.north - CITY_BOUNDS.south),
  };
}

export const UNIT_POSITIONS: Record<string, Coordinates> = UNITS.reduce(
  (acc, u, i) => {
    acc[u.id] = seededPos(i + 7);
    return acc;
  },
  {} as Record<string, Coordinates>
);

export { seededPos };
