'use client';

import {
  Power,
  ChevronRight,
  User,
  FileText,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import styles from './Conductor.module.css';
import { MEMBERSHIPS, formatPEN } from '@/data';

type Props = {
  onGoOnline: () => void;
  onProfile: () => void;
  onSummary: () => void;
};

export function HomeOffline({ onGoOnline, onProfile, onSummary }: Props) {
  // Demo driver membership: d01 has an active membership.
  const membership = MEMBERSHIPS.find((m) => m.driverId === 'd01')!;

  return (
    <div className={styles.screen}>
      <header className={styles.statusBar}>
        <span>Hoy</span>
        <span className={styles.live}>
          <span className={`${styles.liveDot} ${styles.liveDotOffline}`} />
          Sin conexión
        </span>
      </header>

      <div className={styles.hero}>
        <div className={styles.heroGreeting}>Buen día,</div>
        <div className={styles.heroName}>Hugo Mamani</div>
        <div className={styles.heroSub}>Unidad B7X-482 · Toyota Corolla 2022</div>
      </div>

      <div className={`${styles.membership}`}>
        <div className={styles.membershipIcon} style={{ background: 'var(--success-soft)' }}>
          <ShieldCheck size={18} color="#4ade80" />
        </div>
        <div className={styles.membershipBody}>
          <div className={styles.membershipLabel}>Membresía</div>
          <div className={styles.membershipValue}>Activa · vence en 60 días</div>
        </div>
        <span className={`${styles.pill} ${styles['pill--success']}`}>OK</span>
      </div>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Hoy</div>
          <div className={`${styles.kpiValue} num`}>S/ 78.00</div>
          <div className={styles.kpiSub}>8 viajes</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Valorac.</div>
          <div className={`${styles.kpiValue}`}>4.9</div>
          <div className={styles.kpiSub}>estrellas</div>
        </div>
      </div>

      <button className={styles.cta} onClick={onGoOnline}>
        <Power size={22} strokeWidth={2} />
        Conectarme
      </button>

      <div className={styles.spacer} />

      <div className={styles.card}>
        <button
          className={styles.cardRow}
          onClick={onSummary}
          style={{ width: '100%', background: 'transparent', border: 0, color: 'inherit' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText size={18} color="var(--fg-muted)" />
            <div className={styles.cardValue}>Resumen del día</div>
          </div>
          <ChevronRight size={18} color="var(--fg-muted)" />
        </button>
        <div className={styles.detailRow}>
          <span className={styles.detailRow__label}>Total ganado</span>
          <span className={`${styles.detailRow__value} num`}>{formatPEN(78)}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailRow__label}>Viajes completados</span>
          <span className={`${styles.detailRow__value} num`}>8</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailRow__label}>Horas conectado</span>
          <span className={`${styles.detailRow__value} num`}>4h 28m</span>
        </div>
      </div>

      <button
        className={styles.card}
        onClick={onProfile}
        style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'left', color: 'inherit' }}
      >
        <div className={styles.cardRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <User size={18} color="var(--fg-muted)" />
            <div className={styles.cardValue}>Mi perfil</div>
          </div>
          <ChevronRight size={18} color="var(--fg-muted)" />
        </div>
      </button>

      <nav className={styles.bottomNav}>
        <button className={`${styles.navItem} ${styles['navItem--active']}`}>
          <MapPin size={20} />
          Inicio
        </button>
        <button className={styles.navItem} onClick={onSummary}>
          <FileText size={20} />
          Resumen
        </button>
        <button className={styles.navItem} onClick={onProfile}>
          <User size={20} />
          Perfil
        </button>
      </nav>
    </div>
  );
}
