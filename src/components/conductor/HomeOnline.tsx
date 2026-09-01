'use client';

import { Power, User, FileText, MapPin, Zap, Coffee } from 'lucide-react';
import styles from './Conductor.module.css';
import type { DriverStatus } from './ConductorHome';

type Props = {
  onGoOffline: () => void;
  onGoBreak: () => void;
  driverStatus: DriverStatus;
  onProfile: () => void;
  onSummary: () => void;
  onSimulate: () => void;
};

export function HomeOnline({ onGoOffline, onGoBreak, driverStatus, onProfile, onSummary, onSimulate }: Props) {
  const isBreak = driverStatus === 'break';

  return (
    <div className={styles.screen}>
      <header className={styles.statusBar}>
        <span>Hoy · {isBreak ? 'descanso' : 'conectado'}</span>
        <span className={styles.live}>
          <span className={`${styles.liveDot} ${isBreak ? styles.liveDotBreak : ''}`} />
          {isBreak ? 'Descanso' : 'En línea'}
        </span>
      </header>

      <div className={`${styles.statusBlock} ${styles['statusBlock--accent']}`}>
        <div className={styles.statusLabel}>Estado</div>
        <div className={styles.statusBig}>
          {isBreak ? 'En hora de descanso' : 'Esperando solicitud'}
        </div>
        <div className={styles.statusSub}>
          {isBreak ? 'No recibirás nuevas solicitudes.' : 'Te avisaremos cuando la operadora asigne una carrera.'}
        </div>
      </div>

      <div className={styles.statusToggle}>
        <button
          className={`${styles.statusToggleBtn} ${!isBreak ? styles['statusToggleBtn--active'] : ''}`}
          onClick={onGoOffline}
        >
          <Power size={16} />
          En línea
        </button>
        <button
          className={`${styles.statusToggleBtn} ${isBreak ? styles['statusToggleBtn--break'] : ''}`}
          onClick={onGoBreak}
        >
          <Coffee size={16} />
          Descanso
        </button>
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

      {!isBreak && (
        <button className={`${styles.cta} ${styles['cta--small']} ${styles['cta--ghost']}`} onClick={onSimulate}>
          <Zap size={16} />
          Simular solicitud entrante
        </button>
      )}

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
