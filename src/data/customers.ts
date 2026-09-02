export type CustomerRecord = {
  phone: string;
  name: string;
  usualReference: string;
  trips: number;
};

/** Padrón sintético: en producción se reemplaza por la API privada del gremio. */
export const CUSTOMER_DIRECTORY: CustomerRecord[] = [
  { phone: '987410235', name: 'Luisa Mamani', usualReference: 'Jr. Piura 245', trips: 18 },
  { phone: '951822470', name: 'Pedro Coila', usualReference: 'Plaza de Armas de Juliaca', trips: 7 },
  { phone: '964308116', name: 'María Huanca', usualReference: 'Av. Circunvalación 480', trips: 12 },
  { phone: '928654903', name: 'Andrés Quispe', usualReference: 'Jr. Loreto 318', trips: 4 },
];

export function normalizePhone(value: string) {
  return value.replace(/\D/g, '').slice(-9);
}

export function findCustomerByPhone(value: string) {
  const phone = normalizePhone(value);
  if (phone.length !== 9) return null;
  return CUSTOMER_DIRECTORY.find((customer) => customer.phone === phone) ?? null;
}
