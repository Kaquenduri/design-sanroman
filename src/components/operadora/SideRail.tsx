'use client';

import {
  Radio,
  Users,
  Car,
  ShieldCheck,
  BarChart3,
  Settings,
  Cpu,
} from 'lucide-react';
import s from './Operadora.module.css';
import type { Route } from './OperadoraApp';

const ITEMS: {
  key: Route;
  label: string;
  icon: typeof Radio;
  count?: number;
}[] = [
  { key: 'despacho', label: 'Despacho', icon: Radio, count: 6 },
  { key: 'conductores', label: 'Conductores', icon: Users, count: 25 },
  { key: 'unidades', label: 'Unidades', icon: Car, count: 25 },
  { key: 'membresias', label: 'Membresías', icon: ShieldCheck, count: 5 },
  { key: 'reportes', label: 'Reportes', icon: BarChart3 },
];

export function SideRail({
  route,
  onRoute,
}: {
  route: Route;
  onRoute: (r: Route) => void;
}) {
  return (
    <nav className={s.rail} aria-label="Navegación del panel">
      {ITEMS.map((it) => {
        const Icon = it.icon;
        const active = it.key === route;
        return (
          <button
            key={it.key}
            className={`${s.railItem} ${active ? s.railActive : ''}`}
            onClick={() => onRoute(it.key)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
            {it.label}
            {it.count !== undefined && (
              <span className={s.railCount}>{it.count}</span>
            )}
          </button>
        );
      })}

      <div className={s.railLabel}>Sistema</div>
      <button className={s.railItem}>
        <Settings size={17} strokeWidth={1.8} />
        Configuración
      </button>

      <div className={s.railFoot}>
        <div className={s.railFootTitle}>
          <Cpu size={13} color="var(--brand-400)" />
          Motor de asignación
        </div>
        <p className={s.railFootText}>
          Propuesta en cascada a la unidad más cercana, 22 s por intento.
          Intervienes solo cuando la cascada se agota.
        </p>
      </div>
    </nav>
  );
}
