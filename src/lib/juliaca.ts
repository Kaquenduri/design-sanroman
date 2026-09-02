import type { WorldPoint } from './city';

export type GeoPoint = { lat: number; lng: number };

export type PlaceResult = {
  label: string;
  detail: string;
  point: GeoPoint;
};

export const JULIACA_CENTER: GeoPoint = { lat: -15.4997, lng: -70.1333 };

export const JULIACA_BOUNDS = {
  north: -15.43,
  south: -15.58,
  west: -70.22,
  east: -70.04,
};

const LOCAL_PLACES: PlaceResult[] = [
  {
    label: 'Plaza de Armas de Juliaca',
    detail: 'Jr. Jáuregui, centro de Juliaca',
    point: { lat: -15.49925, lng: -70.13307 },
  },
  {
    label: 'Terminal Terrestre de Juliaca',
    detail: 'Av. Circunvalación, Juliaca',
    point: { lat: -15.51072, lng: -70.12669 },
  },
  {
    label: 'Mercado Túpac Amaru',
    detail: 'Jr. Mariano Núñez, Juliaca',
    point: { lat: -15.49345, lng: -70.12617 },
  },
  {
    label: 'Hospital Carlos Monge Medrano',
    detail: 'Av. Huancané, Juliaca',
    point: { lat: -15.48879, lng: -70.12265 },
  },
  {
    label: 'Real Plaza Juliaca',
    detail: 'Av. Circunvalación, Juliaca',
    point: { lat: -15.5124, lng: -70.1199 },
  },
  {
    label: 'Aeropuerto Internacional Inca Manco Cápac',
    detail: 'Jr. Daniel Alcides Carrión, Juliaca',
    point: { lat: -15.4671, lng: -70.1582 },
  },
];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-PE')
    .trim();
}

export function localPlace(query: string): PlaceResult | null {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return null;
  return (
    LOCAL_PLACES.find((place) => {
      const searchable = normalize(`${place.label} ${place.detail}`);
      return terms.every((term) => searchable.includes(term));
    }) ?? null
  );
}

/** Traduce el mundo sintético previo a coordenadas reales dentro de Juliaca. */
export function worldToGeo(point: WorldPoint): GeoPoint {
  return {
    lat: -15.445 - (point.y / 1200) * 0.12,
    lng: -70.205 + (point.x / 1600) * 0.16,
  };
}

export function geoToWorld(point: GeoPoint): WorldPoint {
  return {
    x: ((point.lng + 70.205) / 0.16) * 1600,
    y: ((-15.445 - point.lat) / 0.12) * 1200,
  };
}

export function geoDistanceKm(a: GeoPoint, b: GeoPoint) {
  const radiusKm = 6371;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const latA = toRad(a.lat);
  const latB = toRad(b.lat);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function isInsideJuliaca(point: GeoPoint) {
  return (
    point.lat <= JULIACA_BOUNDS.north &&
    point.lat >= JULIACA_BOUNDS.south &&
    point.lng >= JULIACA_BOUNDS.west &&
    point.lng <= JULIACA_BOUNDS.east
  );
}
