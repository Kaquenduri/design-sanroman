// Synthetic data for the Taxi Real San Román MVP mock.
// All identifiers, names, fares, and timestamps are illustrative.

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

export type Unit = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  driverId: string | null;
  status: 'active' | 'on-trip' | 'offline' | 'blocked';
  lastSeenAt: string;
};

export type Membership = {
  driverId: string;
  status: 'activa' | 'vence-pronto' | 'vencida';
  expiresOn: string;
  daysToExpire: number;
};

export type Coordinates = { lat: number; lng: number };

export type PendingRequest = {
  id: string;
  passengerName: string;
  passengerRating: number;
  pickupAddress: string;
  destinationAddress: string;
  pickup: Coordinates;
  destination: Coordinates;
  distanceKm: number;
  fareEstimate: number;
  waitSeconds: number;
  source: 'app' | 'telefono';
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

export type UnitStatus = Unit['status'];
