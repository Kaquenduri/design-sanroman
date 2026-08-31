import type { VehicleCategory, CategoryId } from './types';

/**
 * Categorías del ERD (`NombreCategoriaVehiculo`).
 *
 * El gremio no hace tarifa dinámica: el precio sale del anillo tarifario más
 * el recargo fijo de la categoría. Por eso la app del cliente puede mostrar el
 * precio exacto antes de solicitar, no un rango.
 *
 * Montos sintéticos hasta que el gremio publique su tarifario vigente.
 */
export const CATEGORIES: VehicleCategory[] = [
  {
    id: 'SEDAN',
    label: 'Sedán',
    seats: 4,
    carga: 'ninguna',
    extra: 0,
    etaOffset: 0,
    description: 'El servicio estándar del gremio.',
  },
  {
    id: 'PROBOX',
    label: 'Probox',
    seats: 4,
    carga: 'liviana',
    extra: 1.5,
    etaOffset: 1,
    description: 'Maletero amplio para equipaje o compras de mercado.',
  },
  {
    id: 'MINIVAN',
    label: 'Minivan',
    seats: 7,
    carga: 'ninguna',
    extra: 6,
    etaOffset: 4,
    description: 'Hasta 7 pasajeros. Ideal para grupos o familia.',
  },
  {
    id: 'SUV',
    label: 'SUV',
    seats: 4,
    carga: 'pesada',
    extra: 8,
    etaOffset: 5,
    description: 'Carga pesada y rutas fuera del asfalto.',
  },
];

export const CATEGORY_BY_ID: Record<CategoryId, VehicleCategory> =
  CATEGORIES.reduce(
    (acc, c) => {
      acc[c.id] = c;
      return acc;
    },
    {} as Record<CategoryId, VehicleCategory>
  );
