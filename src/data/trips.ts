import type { Trip } from './types';

// Today's trip history for the demo driver (d01)
export const TODAY_TRIPS: Trip[] = [
  { id: 't-1', driverId: 'd01', unitId: 'u01', pickupAddress: 'Jr. Piura 245', destinationAddress: 'Av. San Martín 1020', fare: 8.5, startedAt: '07:14', finishedAt: '07:32', status: 'completado' },
  { id: 't-2', driverId: 'd01', unitId: 'u01', pickupAddress: 'Jr. Puno 188', destinationAddress: 'Urb. San Francisco', fare: 11.0, startedAt: '07:48', finishedAt: '08:11', status: 'completado' },
  { id: 't-3', driverId: 'd01', unitId: 'u01', pickupAddress: 'Calle Bolognesi 122', destinationAddress: 'Urb. Los Geranios', fare: 7.5, startedAt: '08:24', finishedAt: '08:42', status: 'completado' },
  { id: 't-4', driverId: 'd01', unitId: 'u01', pickupAddress: 'Jr. Loreto 318', destinationAddress: 'Mercado Túpac Amaru', fare: 6.5, startedAt: '09:02', finishedAt: '09:14', status: 'completado' },
  { id: 't-5', driverId: 'd01', unitId: 'u01', pickupAddress: 'Av. Circunvalación 480', destinationAddress: 'Hospital Carlos Monge', fare: 12.5, startedAt: '09:38', finishedAt: '10:05', status: 'completado' },
  { id: 't-6', driverId: 'd01', unitId: 'u01', pickupAddress: 'Jr. San Román 502', destinationAddress: 'Av. Independencia 234', fare: 7.0, startedAt: '10:18', finishedAt: '10:31', status: 'completado' },
  { id: 't-7', driverId: 'd01', unitId: 'u01', pickupAddress: 'Plaza de Armas', destinationAddress: 'Urb. Los Pinos', fare: 9.0, startedAt: '10:55', finishedAt: '11:18', status: 'completado' },
  { id: 't-8', driverId: 'd01', unitId: 'u01', pickupAddress: 'Av. El Sol 220', destinationAddress: 'Jr. Melgar 408', fare: 8.0, startedAt: '11:32', finishedAt: '11:48', status: 'completado' },
];
