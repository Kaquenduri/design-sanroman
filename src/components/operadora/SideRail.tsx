'use client';

import {
  Radio,
  Users,
  Car,
  ShieldCheck,
  BarChart3,
  Settings,
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

export function BottomNav({
  route,
  onRoute,
}: {
  route: Route;
  onRoute: (r: Route) => void;
}) {
  return (
    <div className={s.dockArea}>
      <nav className={s.dock} aria-label="Navegación del panel">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = it.key === route;
          return (
            <button
              key={it.key}
              className={`${s.dockItem} ${active ? s.dockActive : ''}`}
              onClick={() => onRoute(it.key)}
              aria-current={active ? 'page' : undefined}
              title={it.label}
            >
              <span className={s.dockIcon}>
                <Icon size={23} strokeWidth={active ? 2.5 : 1.9} />
                {it.count !== undefined && (
                  <span
                    className={s.dockBadge}
                    data-hot={it.key === 'despacho' ? 'true' : undefined}
                  >
                    {it.count}
                  </span>
                )}
              </span>
              <span className={s.dockLabel}>{it.label}</span>
            </button>
          );
        })}

        <button
          className={s.dockMore}
          aria-label="Configuración"
          title="Configuración"
        >
          <Settings size={22} strokeWidth={1.9} />
        </button>
      </nav>
    </div>
  );
}
