'use client';

import { MessageCircle, Copy, AlertTriangle } from 'lucide-react';
import styles from './Operadora.module.css';
import { DRIVERS, UNITS, MEMBERSHIPS, membershipBadge } from '@/data';

export function MembershipsView() {
  const venceEstaSemana = MEMBERSHIPS.filter(
    (m) => m.status === 'vence-pronto' && m.daysToExpire <= 7
  );
  const venceEsteMes = MEMBERSHIPS.filter(
    (m) => m.status === 'vence-pronto' && m.daysToExpire > 7
  );
  const vencidas = MEMBERSHIPS.filter((m) => m.status === 'vencida');

  const renderCard = (m: (typeof MEMBERSHIPS)[number], cardStyle: string) => {
    const d = DRIVERS.find((x) => x.id === m.driverId)!;
    const u = UNITS.find((x) => x.driverId === d.id);
    const badge = membershipBadge(m);
    const msg = `Hola ${d.name.split(' ')[0]}, te escribimos de Taxi Real San Román. Tu membresía gremial ${badge.label.toLowerCase()}. Renueva en administración antes del ${new Date(m.expiresOn).toLocaleDateString('es-PE')}.`;
    return (
      <div key={d.id} className={cardStyle}>
        <div className={styles.cellDriver}>
          <div className={styles.avatarSm}>{d.avatarSeed}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
            {u && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                {u.placa}
              </div>
            )}
          </div>
          <span className={`${styles.pill} ${styles[`pill--${badge.color}`]}`}>
            {badge.label}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--fg-muted)',
            margin: '10px 0',
            lineHeight: 1.5,
            display: 'flex',
            gap: 6,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle
            size={12}
            color={
              badge.color === 'danger' ? 'var(--danger)' : 'var(--warning)'
            }
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <span>
            Vence el{' '}
            {new Date(m.expiresOn).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
            {badge.color === 'danger'
              ? ' · unidad bloqueada'
              : ` · faltan ${m.daysToExpire} días`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={styles.actionBtn} style={{ flex: 1, justifyContent: 'center' }}>
            <MessageCircle size={12} />
            Notificar
          </button>
          <button className={styles.actionBtn} aria-label="Copiar mensaje">
            <Copy size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Membresías gremiales</h1>
          <div className={styles.pageSub}>
            Vigencia operativa por conductor · el sistema bloquea automáticamente al vencer
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span className={styles.sectionTitle}>Vence esta semana</span>
            <span className={`${styles.pill} ${styles['pill--warning']}`}>
              {venceEstaSemana.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {venceEstaSemana.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  background: 'var(--surface)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 12,
                  color: 'var(--fg-muted)',
                  textAlign: 'center',
                }}
              >
                Sin alertas para esta semana
              </div>
            ) : (
              venceEstaSemana.map((m) => renderCard(m, styles.warningCard!))
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span className={styles.sectionTitle}>Vence este mes</span>
            <span className={`${styles.pill} ${styles['pill--info']}`}>
              {venceEsteMes.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {venceEsteMes.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  background: 'var(--surface)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 12,
                  color: 'var(--fg-muted)',
                  textAlign: 'center',
                }}
              >
                Sin alertas para este mes
              </div>
            ) : (
              venceEsteMes.map((m) => renderCard(m, styles.infoCard!))
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span className={styles.sectionTitle}>Vencidas (bloqueadas)</span>
            <span className={`${styles.pill} ${styles['pill--danger']}`}>
              {vencidas.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vencidas.map((m) => renderCard(m, styles.dangerCard!))}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: 16,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 13,
          color: 'var(--fg-muted)',
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: 'var(--fg)' }}>Política de bloqueo:</strong> al
        vencer la membresía, la unidad queda fuera del pool de asignación en
        forma automática. El conductor sigue pudiendo consultar su historial
        y renovar desde administración. La notificación por WhatsApp se envía
        automáticamente 7 días antes del vencimiento.
      </div>
    </div>
  );
}
