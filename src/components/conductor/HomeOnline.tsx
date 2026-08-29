'use client';

import { Power, User, FileText, MapPin, Zap } from 'lucide-react';
import styles from './Conductor.module.css';

type Props = {
  onGoOffline: () => void;
  onProfile: () => void;
  onSummary: () => void;
  onSimulate: () => void;
};

export function HomeOnline({ onGoOffline, onProfile, onSummary, onSimulate }: Props) {
  return (
    <div className={styles.screen}>
      <header className={styles.statusBar}>
        <span>Hoy · conectado</span>
        <span className={styles.live}>
          <span className={styles.liveDot} />
          En línea
        </span>
      </header>

      <div className={`${styles.statusBlock} ${styles['statusBlock--accent']}`}>
        <div className={styles.statusLabel}>Estado</div>
        <div className={styles.statusBig}>Esperando solicitud</div>
        <div className={styles.statusSub}>
          Te avisaremos cuando un pasajero esté cerca.
        </div>
      </div>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Hoy</div>
          <div className={`${styles.kpiValue} num`}>S/ 78.00</div>
          <div className={styles.kpiSub}>8 viajes</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>En línea</div>
          <div className={`${styles.kpiValue} num`}>4h 28m</div>
          <div className={styles.kpiSub}>desde 06:42</div>
        </div>
      </div>

      <button className={`${styles.cta} ${styles['cta--ghost']}`} onClick={onGoOffline}>
        <Power size={20} />
        Desconectarme
      </button>

      <button className={`${styles.cta} ${styles['cta--small']} ${styles['cta--ghost']}`} onClick={onSimulate}>
        <Zap size={16} />
        Simular solicitud entrante
      </button>

      <div className={styles.spacer} />

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
