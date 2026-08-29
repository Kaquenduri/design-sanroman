'use client';

import { useState } from 'react';
import { Check, Star, ArrowRight, Power } from 'lucide-react';
import styles from './Conductor.module.css';
import { formatPEN } from '@/data';

type Props = {
  onNext: () => void;
  onClose: () => void;
};

export function TripFinished({ onNext, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const fare = 11.5;

  return (
    <div className={styles.screen} style={{ gap: 16 }}>
      <header className={styles.statusBar}>
        <span>Viaje finalizado</span>
        <span className={styles.live}>
          <span
            className={styles.liveDot}
            style={{ background: 'var(--success)' }}
          />
          Cobrado
        </span>
      </header>

      <div
        className={`${styles.statusBlock} ${styles['statusBlock--accent']}`}
        style={{ alignItems: 'center', textAlign: 'center', padding: '32px 24px' }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: 'var(--success)',
            display: 'grid',
            placeItems: 'center',
            marginBottom: 8,
          }}
        >
          <Check size={32} color="#fff" strokeWidth={3} />
        </div>
        <div className={styles.statusLabel}>Cobrado en efectivo</div>
        <div className={`${styles.statusBig} num`}>{formatPEN(fare)}</div>
        <div className={styles.statusSub}>
          Jr. Piura 245 → Av. San Martín 1020
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel} style={{ marginBottom: 12 }}>
          Califica a tu pasajero
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              style={{
                flex: 1,
                aspectRatio: '1 / 1',
                maxWidth: 56,
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
              aria-label={`${n} estrellas`}
            >
              <Star
                size={28}
                color={rating >= n ? '#facc15' : 'var(--fg-subtle)'}
                fill={rating >= n ? '#facc15' : 'transparent'}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.spacer} />

      <button className={styles.cta} onClick={onNext}>
        <ArrowRight size={22} />
        Volver a estar en línea
      </button>

      <button
        className={`${styles.cta} ${styles['cta--small']} ${styles['cta--ghost']}`}
        onClick={onClose}
      >
        <Power size={16} />
        Terminar turno
      </button>
    </div>
  );
}
