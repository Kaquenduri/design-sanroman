import Link from 'next/link';
import { ArrowRight, Smartphone, Radio, Info } from 'lucide-react';
import { Seal } from '@/components/ui';
import s from './page.module.css';

const SURFACES = [
  {
    href: '/conductor',
    kind: 'PWA móvil',
    icon: Smartphone,
    title: 'App del conductor',
    text: 'Para el agremiado en turno: conectarse, recibir la asignación de la central y completar el servicio.',
    items: [
      'Propuesta con cuenta atrás y tarifa fija de anillo',
      'Cronómetro de embarque de 2 min por ordenanza municipal',
      'Membresía gremial como habilitación visible',
    ],
  },
  {
    href: '/operadora',
    kind: 'Web escritorio',
    icon: Radio,
    title: 'Panel de la operadora',
    text: 'Para la central: registro de llamadas, recojo sobre el mapa, precio acordado y asignación manual de unidad.',
    items: [
      'Ingreso de cliente, teléfono, recojo y destino',
      'Precio editable y cobro por Yape o efectivo',
      'Mapa interactivo y unidad más cercana sugerida',
    ],
  },
];

export default function Home() {
  return (
    <main className={s.page}>
      <div className={s.inner}>
        <header className={s.brand}>
          <Seal size={112} className={s.brandSeal} />
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
          Primera versión centrada en dos superficies: el conductor en la calle
          y la central que recibe llamadas, acuerda el precio y asigna la unidad.
          La membresía gremial continúa siendo la llave de acceso.
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
