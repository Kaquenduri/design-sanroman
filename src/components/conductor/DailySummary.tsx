'use client';

import { ArrowLeft, FileText, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import styles from './Conductor.module.css';
import { TODAY_TRIPS, formatPEN } from '@/data';

type Props = { onBack: () => void };

export function DailySummary({ onBack }: Props) {
  const total = TODAY_TRIPS.reduce((acc, t) => acc + t.fare, 0);
  const count = TODAY_TRIPS.length;

  return (
    <div className={styles.screen}>
      <header className={styles.screenHeader}>
        <button className={styles.backButton} onClick={onBack} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>
        <div className={styles.screenTitle}>Resumen del día</div>
        <div style={{ width: 36 }} />
      </header>

      <div className={`${styles.statusBlock} ${styles['statusBlock--accent']}`}>
        <div className={styles.statusLabel}>Total ganado hoy</div>
        <div className={`${styles.statusBig} num`}>{formatPEN(total)}</div>
        <div className={styles.statusSub}>
          {count} viajes · conexión 4h 28m
        </div>
      </div>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Promedio</div>
          <div className={`${styles.kpiValue} num`}>{formatPEN(total / count)}</div>
          <div className={styles.kpiSub}>por viaje</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Completados</div>
          <div className={`${styles.kpiValue} num`}>{count}</div>
          <div className={styles.kpiSub}>carreras</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <FileText size={14} color="var(--fg-muted)" />
        <span
          style={{
            fontSize: 12,
            color: 'var(--fg-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          Viajes de hoy
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflowY: 'auto',
        }}
      >
        {TODAY_TRIPS.map((t) => (
          <div key={t.id} className={styles.card}>
            <div className={styles.cardRow}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--fg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Clock size={11} /> {t.startedAt}
                </div>
              </div>
              <div className={`${styles.statusBig} num`} style={{ fontSize: 18 }}>
                {formatPEN(t.fare)}
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: '14px 1fr',
                columnGap: 10,
                rowGap: 4,
                alignItems: 'start',
                fontSize: 12,
              }}
            >
              <MapPin size={11} color="var(--accent)" style={{ marginTop: 4 }} />
              <span style={{ color: 'var(--fg-muted)' }}>{t.pickupAddress}</span>
              <span />
              <span style={{ color: 'var(--fg-muted)' }}>{t.destinationAddress}</span>
            </div>
            {t.status === 'completado' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 10,
                  fontSize: 12,
                  color: 'var(--fg-muted)',
                }}
              >
                <CheckCircle2 size={12} color="var(--success)" />
                <span>Completado</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
