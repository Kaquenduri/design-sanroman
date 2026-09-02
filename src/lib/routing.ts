import type { GeoPoint } from './juliaca';

export type RouteStep = { instruction: string; street: string; distanceMeters: number; durationSeconds: number; location: GeoPoint };
export type RoadRoute = { points: GeoPoint[]; distanceMeters: number; durationSeconds: number; steps: RouteStep[] };
const cache = new Map<string, Promise<RoadRoute>>();

function routeKey(from: GeoPoint, to: GeoPoint) {
  return [from.lat, from.lng, to.lat, to.lng].map((value) => value.toFixed(5)).join(':');
}

function instructionFor(type: string, modifier: string | undefined, street: string) {
  const directions: Record<string, string> = { left: 'Gira a la izquierda', right: 'Gira a la derecha', 'slight left': 'Mantente a la izquierda', 'slight right': 'Mantente a la derecha', straight: 'Continúa de frente', 'sharp left': 'Gira cerrado a la izquierda', 'sharp right': 'Gira cerrado a la derecha' };
  if (type === 'arrive') return 'Llegaste al destino';
  if (type === 'depart') return street ? `Sal por ${street}` : 'Inicia el recorrido';
  if (type === 'roundabout' || type === 'rotary') return 'Toma la salida de la rotonda';
  return directions[modifier ?? ''] ?? 'Continúa por la ruta';
}

/** Consulta una ruta vial. Si el proveedor falla, rechaza: nunca inventa una recta. */
export function fetchRoadRoute(from: GeoPoint, to: GeoPoint): Promise<RoadRoute> {
  const key = routeKey(from, to);
  const cached = cache.get(key);
  if (cached) return cached;
  const request = (async () => {
    const base = (process.env.NEXT_PUBLIC_ROUTER_URL || 'https://router.project-osrm.org').replace(/\/$/, '');
    const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const response = await fetch(`${base}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('El motor de rutas no respondió.');
    const payload = (await response.json()) as { code: string; routes?: Array<{ distance: number; duration: number; geometry: { coordinates: [number, number][] }; legs: Array<{ steps: Array<{ distance: number; duration: number; name: string; maneuver: { type: string; modifier?: string; location: [number, number] } }> }> }> };
    const route = payload.routes?.[0];
    if (payload.code !== 'Ok' || !route || route.geometry.coordinates.length < 2) throw new Error('No existe una ruta vial disponible.');
    return {
      points: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      steps: route.legs.flatMap((leg) => leg.steps.map((step) => ({ instruction: instructionFor(step.maneuver.type, step.maneuver.modifier, step.name), street: step.name || 'Vía sin nombre', distanceMeters: step.distance, durationSeconds: step.duration, location: { lat: step.maneuver.location[1], lng: step.maneuver.location[0] } }))),
    };
  })();
  cache.set(key, request);
  request.catch(() => cache.delete(key));
  return request;
}

export function pointAlongRoute(points: GeoPoint[], progress: number): GeoPoint {
  if (points.length < 2) return points[0];
  const distances = points.slice(1).map((point, index) => Math.hypot((point.lat - points[index].lat) * 111, (point.lng - points[index].lng) * 107));
  const total = distances.reduce((sum, value) => sum + value, 0);
  let target = Math.max(0, Math.min(1, progress)) * total;
  for (let index = 0; index < distances.length; index += 1) {
    if (target <= distances[index]) {
      const ratio = distances[index] ? target / distances[index] : 0;
      return { lat: points[index].lat + (points[index + 1].lat - points[index].lat) * ratio, lng: points[index].lng + (points[index + 1].lng - points[index].lng) * ratio };
    }
    target -= distances[index];
  }
  return points[points.length - 1];
}
