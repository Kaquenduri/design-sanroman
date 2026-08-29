'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, X, Check, MapPin, Navigation } from 'lucide-react';
import styles from './Conductor.module.css';
import { MiniMap } from './MiniMap';

type Props = {
  onArrived: () => void;
  onCancel: () => void;
};

export function HeadingToPassenger({ onArrived, onCancel }: Props) {
  // Simulated ETA countdown
  const [etaSec, setEtaSec] = useState(168); // 2:48
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
        <div className={styles.screenTitle}>Dirigiéndote al pasajero</div>
        <div style={{ width: 36 }} />
      </header>

      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
              fontSize: 14,
            }}
            aria-hidden
          >
            LM
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Luisa M.</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
              Jr. Piura 245
            </div>
          </div>
          <button className={styles.iconButton} aria-label="Llamar">
            <Phone size={16} />
          </button>
          <button className={styles.iconButton} aria-label="Mensaje">
            <MessageCircle size={16} />
          </button>
        </div>
      </div>

      <div className={`${styles.statusBlock} ${styles['statusBlock--accent']}`}>
        <div className={styles.statusLabel}>Llegada estimada</div>
        <div className={`${styles.statusBig} num`}>
          {m}:{s.toString().padStart(2, '0')}
        </div>
        <div className={styles.statusSub}>
          {distance} km · a Jr. Piura 245
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
        Ya llegué
      </button>
    </div>
  );
}
