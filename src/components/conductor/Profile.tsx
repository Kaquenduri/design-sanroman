'use client';

import { ArrowLeft, ShieldCheck, Phone, Star, LogOut, Bell } from 'lucide-react';
import styles from './Conductor.module.css';
import { DRIVERS, MEMBERSHIPS, UNITS, membershipBadge } from '@/data';

type Props = { onBack: () => void };

export function Profile({ onBack }: Props) {
  const driver = DRIVERS[0];
  const unit = UNITS.find((u) => u.driverId === driver.id)!;
  const m = MEMBERSHIPS.find((x) => x.driverId === driver.id)!;
  const badge = membershipBadge(m);

  return (
    <div className={styles.screen}>
      <header className={styles.screenHeader}>
        <button className={styles.backButton} onClick={onBack} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>
        <div className={styles.screenTitle}>Mi perfil</div>
        <div style={{ width: 36 }} />
      </header>

      <div className={styles.card} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.01em',
          }}
          aria-hidden
        >
          {driver.avatarSeed}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{driver.name}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 4,
              fontSize: 13,
              color: 'var(--fg-muted)',
            }}
          >
            <Star size={12} fill="#facc15" color="#facc15" />
            <span className="num">{driver.rating}</span>
            <span>·</span>
            <span>{driver.tripsToday} viajes hoy</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel} style={{ marginBottom: 12 }}>
          Unidad asignada
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--taxi)',
              color: 'var(--taxi-fg)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '0.04em',
            }}
            className="mono"
          >
            {unit.placa}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {unit.marca} {unit.modelo} {unit.anio}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
              Unidad #{unit.id.replace('u', '')}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.membership}>
        <div
          className={styles.membershipIcon}
          style={{
            background:
              badge.color === 'success'
                ? 'var(--success-soft)'
                : badge.color === 'warning'
                ? 'var(--warning-soft)'
                : 'var(--danger-soft)',
          }}
        >
          <ShieldCheck
            size={18}
            color={
              badge.color === 'success'
                ? '#4ade80'
                : badge.color === 'warning'
                ? '#fbbf24'
                : '#f87171'
            }
          />
        </div>
        <div className={styles.membershipBody}>
          <div className={styles.membershipLabel}>Membresía gremial</div>
          <div className={styles.membershipValue}>
            {badge.label} · vence {new Date(m.expiresOn).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
        <span
          className={`${styles.pill} ${styles[`pill--${badge.color}`]}`}
        >
          OK
        </span>
      </div>

      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Phone size={18} color="var(--fg-muted)" />
          <div style={{ flex: 1 }}>
            <div className={styles.cardLabel}>Teléfono de contacto</div>
            <div className="num" style={{ fontSize: 14, fontWeight: 600 }}>
              {driver.phone}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            background: 'transparent',
            border: 0,
            color: 'inherit',
            padding: 0,
          }}
        >
          <Bell size={18} color="var(--fg-muted)" />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Notificaciones</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
              Activadas · todas las alertas
            </div>
          </div>
        </button>
      </div>

      <div className={styles.spacer} />

      <button
        className={`${styles.cta} ${styles['cta--small']} ${styles['cta--ghost']}`}
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  );
}
