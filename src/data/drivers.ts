import type { Driver } from './types';

const NAMES = [
  ['Hugo Mamani Quispe', 'HM'],
  ['Roxana Lipa Velasquez', 'RL'],
  ['César Arocutipa Flores', 'CA'],
  ['Yolanda Taco Mamani', 'YT'],
  ['Edwin Pari Quispe', 'EP'],
  ['Maribel Coila Mamani', 'MC'],
  ['Julio Inca Apaza', 'JI'],
  ['Sandra Huanca Lipa', 'SH'],
  ['Mario Ccama Condori', 'MR'],
  ['Berta Quispe Mamani', 'BQ'],
  ['Wilber Mamani Lipa', 'WM'],
  ['Erika Pari Coila', 'EK'],
  ['Rene Apaza Mamani', 'RA'],
  ['Lourdes Taco Lipa', 'LT'],
  ['Abel Ccama Huanca', 'AB'],
  ['Norma Mamani Pari', 'NM'],
  ['Omar Lipa Apaza', 'OM'],
  ['Patricia Coila Quispe', 'PA'],
  ['Fredy Arocutipa Mamani', 'FR'],
  ['Julia Huanca Pari', 'JU'],
  ['Genaro Inca Lipa', 'GE'],
  ['Celia Mamani Coila', 'CE'],
  ['Hernan Pari Apaza', 'HE'],
  ['Angelica Taco Huanca', 'AN'],
  ['Dario Ccama Mamani', 'DA'],
] as const;

const PHONES = [110, 121, 132, 143, 154, 165, 176, 187, 198, 209,
  220, 231, 242, 253, 264, 275, 286, 297, 308, 319, 330, 341, 352, 363, 374];

const RATINGS = [4.9, 4.8, 4.7, 5.0, 4.6, 4.9, 4.5, 4.8, 4.7, 4.9,
  4.6, 4.8, 4.7, 4.9, 4.6, 4.8, 4.5, 4.9, 4.7, 4.8, 4.6, 4.9, 4.7, 4.8, 4.6];

const TRIPS = [14, 9, 12, 6, 18, 8, 11, 7, 10, 13,
  5, 9, 11, 14, 8, 10, 6, 12, 9, 11, 7, 13, 8, 10, 5];

const JOINED = ['2021-03-12', '2022-08-04', '2020-11-22', '2023-02-18',
  '2019-05-09', '2022-12-01', '2021-07-30', '2023-04-22', '2020-06-15',
  '2022-01-11', '2023-09-03', '2021-10-27', '2020-08-19', '2019-12-04',
  '2022-04-18', '2021-05-22', '2023-06-30', '2020-03-15', '2022-09-08',
  '2021-11-13', '2023-01-25', '2020-10-09', '2022-06-17', '2021-02-28',
  '2023-08-12'];

export const DRIVERS: Driver[] = NAMES.map(([name, seed], i) => ({
  id: `d${String(i + 1).padStart(2, '0')}`,
  name,
  phone: `+51 951 234 ${PHONES[i]}`,
  unitId: `u${String(i + 1).padStart(2, '0')}`,
  avatarSeed: seed,
  rating: RATINGS[i],
  tripsToday: TRIPS[i],
  joinedAt: JOINED[i],
}));
