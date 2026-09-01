'use client';

import {
  Map,
  Users,
  Truck,
  ShieldCheck,
  BarChart3,
  Settings,
} from 'lucide-react';
import styles from './Operadora.module.css';

type OperadoraRoute = 'despacho' | 'conductores' | 'unidades' | 'membresias' | 'reportes';

type Props = {
  route: OperadoraRoute;
  onRoute: (r: OperadoraRoute) => void;
};

export function SideRail({ route, onRoute }: Props) {
  const items: Array<{
    key: OperadoraRoute;
    label: string;
    icon: typeof Map;
    count?: string;
  }> = [
    { key: 'despacho', label: 'Despacho', icon: Map, count: '6' },
    { key: 'conductores', label: 'Conductores', icon: Users, count: '25' },
    { key: 'unidades', label: 'Unidades', icon: Truck, count: '25' },
    { key: 'membresias', label: 'Membresías', icon: ShieldCheck, count: '5' },
    { key: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <nav className={styles.rail} aria-label="Navegación principal">
      <div className={styles.rail__group}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === route;
          return (
            <button
              key={item.key}
              className={`${styles.rail__item} ${isActive ? styles['rail__item--active'] : ''}`}
              onClick={() => onRoute(item.key)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} strokeWidth={1.75} />
              {item.label}
              {item.count && <span className={styles.rail__count}>{item.count}</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.rail__group}>
        <div className={styles.rail__groupLabel}>Sistema</div>
        <button className={styles.rail__item}>
          <Settings size={16} strokeWidth={1.75} />
          Configuración
        </button>
      </div>

      <div className={styles.rail__footer}>
        <div className={styles.rail__footerLabel}>Estado del sistema</div>
        <div className={styles.rail__footerText}>
          Asignación automática activa. Motor heurístico de tarifas en línea.
        </div>
      </div>
    </nav>
  );
}
