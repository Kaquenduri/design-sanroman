'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import styles from './Conductor.module.css';
import { MiniMap } from './MiniMap';
import { formatPEN } from '@/data';

type Props = {
  onFinish: () => void;
};

export function InTrip({ onFinish }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [fare, setFare] = useState(8.5);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((s) => s + 1);
      setFare((f) => +(f + 0.012).toFixed(2));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  return (
    <div className={styles.screen} style={{ gap: 14 }}>
      <header className={styles.screenHeader}>
        <span className={`${styles.pill} ${styles['pill--warning']}`}>En viaje</span>
        <div className={`${styles.statusLabel} num`}>
          {m}:{s.toString().padStart(2, '0')}
        </div>
      </header>

      <div className={`${styles.statusBlock} ${styles['statusBlock--accent']}`}>
        <div className={styles.statusLabel}>Tarifa actual</div>
        <div className={`${styles.statusBig} num`}>{formatPEN(fare)}</div>
        <div className={styles.statusSub}>
          Cobro en efectivo al finalizar
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 200,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <MiniMap mode="in-trip" />
      </div>

      <button className={`${styles.cta} ${styles['cta--success']}`} onClick={onFinish}>
        <Check size={22} />
        Finalizar viaje
      </button>
    </div>
  );
}
