'use client';

import { useEffect, useState } from 'react';
import styles from './Operadora.module.css';

export function TopBar({ now }: { now: Date | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const shift = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const time = now
    ? now.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '--:--';

  return (
    <header className={styles.topbar}>
      <div className={styles.topbar__left}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden>
            <div className={styles.brandMarkDot} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>Taxi Real San Román</span>
            <span className={styles.brandSub}>Despacho · Juliaca</span>
          </div>
        </div>
        <div className={styles.divider} />
        <span className={styles.contextLabel}>Turno activo</span>
        <span className={`${styles.shiftTimer} mono`}>{shift}</span>
      </div>
      <div className={styles.topbar__right}>
        <span className={styles.statusPill}>
          <span className={styles.statusPill__dot} />
          18 unidades en línea
        </span>
        <span className={`${styles.shiftTimer} mono`} aria-label="Hora actual">
          {time}
        </span>
        <div className={styles.divider} />
        <div className={styles.avatar} aria-hidden>
          RL
        </div>
        <div className={styles.avatarInfo}>
          <span className={styles.avatarName}>Roxana Lipa</span>
          <span className={styles.avatarRole}>Operadora · Turno día</span>
        </div>
      </div>
    </header>
  );
}
