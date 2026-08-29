import Link from 'next/link';
import { ArrowRight, Smartphone, MapPin, Users } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.landing}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden>
            <span className={styles.brandDot} />
          </div>
          <div>
            <div className={styles.brandName}>Taxi Real San Román</div>
            <div className={styles.brandMeta}>
              Gremial 32-2020 · Juliaca, Puno
            </div>
          </div>
        </div>
        <div className={styles.tag}>MVP visual · Mock frontend</div>
      </header>

      <section className={styles.hero}>
        <h1>
          Despacho digital
          <br />
          <span className={styles.accent}>sin operadora.</span>
        </h1>
        <p className={styles.lede}>
          Vista previa de las dos superficies operativas del MVP: la app del
          conductor y el panel de la operadora. Todo el contenido es sintético
          y se ejecuta 100% en el navegador.
        </p>
      </section>

      <section className={styles.cards}>
        <Link href="/conductor" className={styles.surfaceCard}>
          <div className={styles.cardHead}>
            <span className={styles.cardIcon}>
              <Smartphone size={22} strokeWidth={1.5} />
            </span>
            <span className={styles.chip}>PWA mobile</span>
          </div>
          <h2>App del Conductor</h2>
          <p>
            Login con membresía, online/offline, recibir viaje, navegar al
            pasajero, finalizar viaje y resumen del día. Diseñada para mirada
            rápida bajo sol altiplánico.
          </p>
          <ul className={styles.cardList}>
            <li>Estados grandes con icono + texto</li>
            <li>Acciones a un toque, pulgar-friendly</li>
            <li>Mapa mockeado · datos sintéticos</li>
          </ul>
          <span className={styles.cta}>
            Abrir app <ArrowRight size={16} strokeWidth={2} />
          </span>
        </Link>

        <Link href="/operadora" className={styles.surfaceCard}>
          <div className={styles.cardHead}>
            <span className={styles.cardIcon}>
              <MapPin size={22} strokeWidth={1.5} />
            </span>
            <span className={styles.chip}>Web admin</span>
          </div>
          <h2>Panel de la Operadora</h2>
          <p>
            Vista de despacho en tiempo real con mapa, cola de solicitudes,
            asignación manual, gestión de conductores, unidades, membresías y
            reportes del día.
          </p>
          <ul className={styles.cardList}>
            <li>Mapa de Juliaca con ~25 unidades simuladas</li>
            <li>Cola de solicitudes + asignación</li>
            <li>Conductores, unidades, reportes</li>
          </ul>
          <span className={styles.cta}>
            Abrir panel <ArrowRight size={16} strokeWidth={2} />
          </span>
        </Link>
      </section>

      <footer className={styles.footer}>
        <Users size={14} strokeWidth={1.5} />
        <span>
          Vista previa de mockup. Sin backend, sin maps reales, sin datos
          productivos.
        </span>
      </footer>
    </main>
  );
}
