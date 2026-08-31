'use client';

import { useEffect, useState } from 'react';
import { Avatar, Chip, Seal } from '@/components/ui';
import { UNITS } from '@/data';
import s from './Operadora.module.css';

const ONLINE = UNITS.filter((u) => u.status === 'active').length;
const ON_TRIP = UNITS.filter((u) => u.status === 'on-trip').length;

export function TopBar() {
  // El reloj arranca en null: renderizarlo en servidor desincroniza la
  // hidratación y React descarta el árbol.
  const [clock, setClock] = useState<string | null>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setShift((v) => v + 1);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const base = 4 * 3600 + 12 * 60; // el turno arrancó hace 4h12m
  const t = base + shift;
  const shiftText = `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(
    Math.floor((t % 3600) / 60)
  ).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

  return (
    <header className={s.topbar}>
      <div className={s.brand}>
        <Seal size={30} compact className={s.brandSeal} />
        <div className={s.brandText}>
          <span className={s.brandName}>Real San Román</span>
          <span className={s.brandSub}>Central de despacho · Juliaca</span>
        </div>
      </div>

      <div className={s.vr} />

      <div className={s.shift}>
        <span className={s.shiftLabel}>Turno</span>
        <span className={s.shiftValue}>{shiftText}</span>
      </div>

      <Chip tone="success" dot live>
        Asignación automática activa
      </Chip>

      <div className={s.topMetrics}>
        <div className={s.topMetric}>
          <span className={s.topMetricValue}>{ONLINE}</span>
          <span className={s.topMetricLabel}>disponibles</span>
        </div>
        <div className={s.topMetric}>
          <span className={s.topMetricValue}>{ON_TRIP}</span>
          <span className={s.topMetricLabel}>en viaje</span>
        </div>
        <div className={s.vr} />
        <span className={`${s.shiftValue} mono`} aria-label="Hora actual">
          {clock ?? '--:--:--'}
        </span>
        <div className={s.vr} />
        <div className={s.operator}>
          <Avatar initials="RL" size={34} online />
          <div className={s.operatorText}>
            <span className={s.operatorName}>Roxana Lipa</span>
            <span className={s.operatorRole}>Operadora · turno día</span>
          </div>
        </div>
      </div>
    </header>
  );
}
