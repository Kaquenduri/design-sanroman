'use client';

import { useEffect, useState } from 'react';
import { Star, MapPin, Navigation, Phone, MessageCircle, X, Check } from 'lucide-react';
import styles from './Conductor.module.css';
import { REQUESTS_INITIAL, formatPEN, formatKm } from '@/data';

type Props = {
  onAccept: () => void;
  onReject: () => void;
};

export function IncomingRequest({ onAccept, onReject }: Props) {
  // Simulate the request countdown (15 seconds to accept)
  const [secondsLeft, setSecondsLeft] = useState(15);
  const request = REQUESTS_INITIAL[0];

  useEffect(() => {
    if (secondsLeft <= 0) {
      onReject();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onReject]);

  const pickupDistance = 0.8;
  const pickupEta = 3;

  return (
    <div className={styles.screen} style={{ gap: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className={styles.liveDot}
            style={{ width: 10, height: 10 }}
            aria-hidden
          />
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Nueva solicitud
          </span>
        </div>
        <span
          className={`${styles.pill} ${styles['pill--warning']}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {secondsLeft}s
        </span>
      </div>

      <div className={`${styles.statusBlock} ${styles['statusBlock--accent']}`} style={{ gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div className={styles.statusBig}>{formatPEN(request.fareEstimate)}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>tarifa estimada</div>
        </div>
        <div className={styles.statusSub}>
          {formatKm(request.distanceKm)} · {pickupEta} min de recogida
        </div>
      </div>

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
            <div style={{ fontSize: 16, fontWeight: 600 }}>{request.passengerName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--fg-muted)' }}>
              <Star size={12} fill="#facc15" color="#facc15" />
              <span className="num">{request.passengerRating}</span>
              <span>· 23 viajes</span>
            </div>
          </div>
          <button
            className={styles.iconButton}
            aria-label="Llamar"
            style={{ width: 40, height: 40 }}
          >
            <Phone size={16} />
          </button>
          <button
            className={styles.iconButton}
            aria-label="Mensaje"
            style={{ width: 40, height: 40 }}
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: 'var(--accent)',
                boxShadow: '0 0 0 4px var(--accent-soft)',
              }}
            />
            <div style={{ flex: 1, width: 2, background: 'var(--border)', margin: '6px 0' }} />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: 'var(--taxi)',
              }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recoger en
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {request.pickupAddress}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                a {pickupDistance} km · {pickupEta} min
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Destino
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {request.destinationAddress}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
        <Navigation size={14} color="var(--fg-muted)" />
        <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
          Sin desvíos · cobro en efectivo al pasajero
        </span>
      </div>

      <div className={styles.spacer} />

      <div className={styles.actionRow}>
        <button
          className={`${styles.cta} ${styles['cta--ghost']}`}
          onClick={onReject}
        >
          <X size={20} />
          Rechazar
        </button>
        <button className={styles.cta} onClick={onAccept}>
          <Check size={22} />
          Aceptar
        </button>
      </div>
    </div>
  );
}
