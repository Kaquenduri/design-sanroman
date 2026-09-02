// Datos sintéticos para el mockup de Taxi Real San Román.
// Nombres, placas, tarifas y horas son ilustrativos — ningún dato es real.
// Los nombres de entidad y los estados siguen el ERD del proyecto para que el
// mockup y el modelo de datos hablen el mismo idioma.

import type { WorldPoint } from '@/lib/city';
import type { GeoPoint } from '@/lib/juliaca';

export type Driver = {
  id: string;
  name: string;
  phone: string;
  unitId: string;
  avatarSeed: string;
  rating: number;
  tripsToday: number;
  joinedAt: string;
};

/** `NombreCategoriaVehiculo` del ERD. */
export type CategoryId = 'SEDAN' | 'PROBOX' | 'MINIVAN' | 'SUV';

export type VehicleCategory = {
  id: CategoryId;
  label: string;
  /** `capacidad_pasajeros` */
  seats: number;
  /** `tipo_carga` */
  carga: 'ninguna' | 'liviana' | 'pesada';
  /** Recargo sobre la tarifa base del anillo, en soles. */
  extra: number;
  /** Minutos añadidos a la espera típica: hay menos unidades de las grandes. */
  etaOffset: number;
  description: string;
};

export type Unit = {
  id: string;
  /** `numero_unidad` — el numeral pintado en la puerta. */
  n: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  categoryId: CategoryId;
  driverId: string | null;
  status: 'active' | 'on-trip' | 'offline' | 'blocked';
  /** Rumbo en grados; 0 = norte. Solo para orientar el marcador. */
  heading: number;
  lastSeenAt: string;
};

export type UnitStatus = Unit['status'];

export type Membership = {
  driverId: string;
  status: 'activa' | 'vence-pronto' | 'vencida';
  expiresOn: string;
  daysToExpire: number;
};

export type PendingRequest = {
  id: string;
  passengerName: string;
  passengerPhone: string;
  passengerRating: number;
  passengerSeed: string;
  pickupAddress: string;
  destinationAddress: string;
  pickup: WorldPoint;
  destination: WorldPoint;
  /** Coordenadas reales usadas por el panel cartográfico de la operadora. */
  pickupGeo?: GeoPoint;
  destinationGeo?: GeoPoint;
  distanceKm: number;
  categoryId: CategoryId;
  fareEstimate: number;
  paymentMethod: 'efectivo' | 'yape';
  waitSeconds: number;
  /** Segundo relativo en que entró una llamada creada durante esta sesión. */
  createdAtTick?: number;
  /** En la primera versión todos los servicios entran por llamada. */
  source: 'telefono';
  assignedUnitId: string | null;
};

export type Trip = {
  id: string;
  driverId: string;
  unitId: string;
  passengerName: string;
  pickupAddress: string;
  destinationAddress: string;
  fare: number;
  startedAt: string;
  finishedAt: string | null;
  status: 'completado' | 'en-curso' | 'cancelado';
  ratingGiven: number | null;
};

/** `ConceptoTarifa` del ERD — el desglose línea por línea de una tarifa. */
export type FareLine = {
  concepto:
    | 'BASE_ANILLO'
    | 'AJUSTE_SUBZONA'
    | 'RECARGO_CARGA'
    | 'RECARGO_CLIMA'
    | 'RECARGO_VIA'
    | 'RECARGO_EVENTO'
    | 'AJUSTE_MANUAL';
  label: string;
  amount: number;
};
