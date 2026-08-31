'use client';

import { MessageSquare, Copy, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  Avatar,
  Button,
  Chip,
  IconButton,
  Plate,
  Empty,
  Synthetic,
} from '@/components/ui';
import {
  DRIVERS,
  UNITS,
  MEMBERSHIPS,
  membershipBadge,
  formatDate,
  type Membership,
} from '@/data';
import s from './Operadora.module.css';

function Row({ m, variant }: { m: Membership; variant: 'warn' | 'info' | 'danger' }) {
  const d = DRIVERS.find((x) => x.id === m.driverId)!;
  const u = UNITS.find((x) => x.driverId === d.id);
  const badge = membershipBadge(m);
  const cls =
    variant === 'warn' ? s.memWarn : variant === 'danger' ? s.memDanger : '';

  return (
    <div className={`${s.memCard} ${cls}`}>
      <div className={s.memTop}>
        <Avatar initials={d.avatarSeed} size={34} />
        <div className={s.suggestionBody}>
          <div className={s.suggestionName}>{d.name}</div>
          {u && (
            <div className={s.suggestionMeta}>
              Unidad {u.n} · {u.placa}
            </div>
          )}
        </div>
        <Chip tone={badge.tone} dot>
          {badge.label}
        </Chip>
      </div>

      <p className={s.memNote}>
        <AlertTriangle
          size={12}
          style={{ display: 'inline', verticalAlign: -2, marginRight: 6 }}
        />
        {variant === 'danger'
          ? `Venció el ${formatDate(m.expiresOn)}. La unidad está fuera del pool de asignación.`
          : `Vence el ${formatDate(m.expiresOn)} · faltan ${m.daysToExpire} días.`}
      </p>

      <div className={s.memActions}>
        <Button variant="outline" size="sm">
          <MessageSquare size={14} />
          Notificar por WhatsApp
        </Button>
        <IconButton variant="ghost" size="sm" aria-label="Copiar mensaje">
          <Copy size={14} />
        </IconButton>
      </div>
    </div>
  );
}

export function MembershipsView() {
  const thisWeek = MEMBERSHIPS.filter(
    (m) => m.status === 'vence-pronto' && m.daysToExpire <= 7
  );
  const thisMonth = MEMBERSHIPS.filter(
    (m) => m.status === 'vence-pronto' && m.daysToExpire > 7
  );
  const expired = MEMBERSHIPS.filter((m) => m.status === 'vencida');

  return (
    <div className={s.page}>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Membresías gremiales</h1>
          <p className={s.pageSub}>
            La habilitación operativa de cada conductor. Al vencer, la unidad
            sale del pool automáticamente.
          </p>
        </div>
      </div>

      <div className={s.memGrid}>
        <div className={s.memCol}>
          <div className={s.memColHead}>
            <span className={s.sectionLabel}>Vence esta semana</span>
            <Chip tone="warning">{thisWeek.length}</Chip>
          </div>
          {thisWeek.length === 0 ? (
            <Empty icon={<ShieldCheck size={18} />} title="Nada por vencer">
              Ninguna membresía vence en los próximos 7 días.
            </Empty>
          ) : (
            thisWeek.map((m) => <Row key={m.driverId} m={m} variant="warn" />)
          )}
        </div>

        <div className={s.memCol}>
          <div className={s.memColHead}>
            <span className={s.sectionLabel}>Vence este mes</span>
            <Chip tone="info">{thisMonth.length}</Chip>
          </div>
          {thisMonth.length === 0 ? (
            <Empty icon={<ShieldCheck size={18} />} title="Nada este mes">
              Sin vencimientos en los próximos 30 días.
            </Empty>
          ) : (
            thisMonth.map((m) => <Row key={m.driverId} m={m} variant="info" />)
          )}
        </div>

        <div className={s.memCol}>
          <div className={s.memColHead}>
            <span className={s.sectionLabel}>Vencidas · bloqueadas</span>
            <Chip tone="danger">{expired.length}</Chip>
          </div>
          {expired.map((m) => (
            <Row key={m.driverId} m={m} variant="danger" />
          ))}
        </div>
      </div>

      <p className={s.policy}>
        <strong>Política de bloqueo.</strong> Al vencer la membresía, la unidad
        sale del pool de asignación de forma automática: deja de recibir
        propuestas, aunque el conductor siga viendo su historial y pueda
        renovar. <strong>Dos puntos siguen sin definirse</strong>: el periodo de
        gracia tras el vencimiento —hoy el corte es inmediato— y el canal del
        aviso previo, propuesto por WhatsApp 7 días antes pero aún sin
        confirmar con el gremio.
      </p>

      <Synthetic>Datos sintéticos de demostración</Synthetic>
    </div>
  );
}
