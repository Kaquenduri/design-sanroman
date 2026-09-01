'use client';

import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import styles from './Conductor.module.css';
import { MiniMap } from './MiniMap';

type Props = {
  onArrived: () => void;
  onCancel: () => void;
};

export function HeadingToPassenger({ onArrived, onCancel }: Props) {
  const [etaSec, setEtaSec] = useState(168);
  useEffect(() => {
    const t = setInterval(() => setEtaSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const m = Math.floor(etaSec / 60);
  const s = etaSec % 60;
  const distance = (etaSec / 60 * 0.4).toFixed(1);

  return (
    <div className={styles.screen} style={{ gap: 14 }}>
      <header className={styles.screenHeader}>
        <button className={styles.backButton} onClick={onCancel} aria-label="Cancelar viaje">
          <X size={18} />
        </button>
        <div className={styles.screenTitle}>Dirigiéndose al punto de recogida</div>
        <div style={{ width: 36 }} />
      </header>

      <div className={`${styles.statusBlock} ${styles['statusBlock--accent']}`}>
        <div className={styles.statusLabel}>Llegada estimada al origen</div>
        <div className={`${styles.statusBig} num`}>
          {m}:{s.toString().padStart(2, '0')}
        </div>
        <div className={styles.statusSub}>
          {distance} km · Jr. Piura 245
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 220,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <MiniMap mode="heading" />
      </div>

      <button className={styles.cta} onClick={onArrived}>
        <Check size={22} />
        Llegué al punto de recogida
      </button>
    </div>
  );
}
