import Link from 'next/link';
import { ArrowRight, Smartphone, MapPin, Radio, Info } from 'lucide-react';
import { Seal } from '@/components/ui';
import s from './page.module.css';

const SURFACES = [
  {
    href: '/conductor',
    kind: 'PWA móvil',
    icon: Smartphone,
    title: 'App del conductor',
    text: 'Para el agremiado en turno: conectarse, aceptar la propuesta en 22 segundos y cerrar el viaje cobrando en efectivo.',
    items: [
      'Propuesta con cuenta atrás y tarifa fija de anillo',
      'Cronómetro de embarque de 2 min por ordenanza municipal',
      'Membresía gremial como habilitación visible',
    ],
  },
  {
    href: '/cliente',
    kind: 'PWA móvil',
    icon: MapPin,
    title: 'App del cliente',
    text: 'Para quien espera en la esquina: destino, categoría y precio exacto antes de solicitar, sin regateo ni sorpresas.',
    items: [
      'Cuatro categorías con precio y capacidad reales',
      'Verificación de unidad con el sello del gremio',
      'Cascada de propuestas visible mientras busca',
    ],
  },
  {
    href: '/operadora',
    kind: 'Web escritorio',
    icon: Radio,
    title: 'Panel de la operadora',
    text: 'Para la central: cola en vivo, flota sobre el mapa con anillos tarifarios y asignación manual cuando la cascada se agota.',
    items: [
      'Cola de solicitudes por canal: app y teléfono',
      'Unidad más cercana sugerida sobre el mapa',
      'Conductores, unidades, membresías y reportes',
    ],
  },
];

export default function Home() {
  return (
    <main className={s.page}>
      <div className={s.inner}>
        <header className={s.brand}>
          <Seal size={44} compact className={s.brandSeal} />
          <div className={s.brandText}>
            <span className={s.brandName}>Taxi Real San Román</span>
            <span className={s.brandMeta}>Gremial 32-2020 · Juliaca, Puno</span>
          </div>
          <span className={s.tag}>Maqueta de front-end</span>
        </header>

        <div className={s.hero}>
          <h1 className={s.headline}>Despacho digital del gremio</h1>
        </div>
        <p className={s.lede}>
          Tres superficies del mismo sistema: el conductor en la calle, el
          pasajero en la esquina y la central que supervisa. Tarifa fija por
          anillo, pago en efectivo y la membresía gremial como llave de acceso.
        </p>

        <div className={s.grid}>
          {SURFACES.map((sf) => {
            const Icon = sf.icon;
            return (
              <Link key={sf.href} href={sf.href} className={s.card}>
                <div className={s.cardTop}>
                  <span className={s.cardIcon}>
                    <Icon size={22} strokeWidth={1.9} />
                  </span>
                  <span className={s.cardKind}>{sf.kind}</span>
                </div>

                <h2 className={s.cardTitle}>{sf.title}</h2>
                <p className={s.cardText}>{sf.text}</p>

                <div className={s.cardList}>
                  {sf.items.map((it) => (
                    <span key={it} className={s.cardItem}>
                      <span className={s.bullet} aria-hidden />
                      {it}
                    </span>
                  ))}
                </div>

                <span className={s.cardCta}>
                  Abrir
                  <ArrowRight size={18} />
                </span>
              </Link>
            );
          })}
        </div>

        <footer className={s.foot}>
          <Info size={16} />
          <span>
            Todo el contenido es sintético y corre en el navegador: sin backend,
            sin GPS y sin mapas reales. Nombres, placas, tarifas y cifras son
            ilustrativos.
          </span>
        </footer>
      </div>
    </main>
  );
}
