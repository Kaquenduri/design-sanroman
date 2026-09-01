'use client';

import { useMemo, useState } from 'react';
import {
  X,
  Search,
  Truck,
} from 'lucide-react';
import styles from './Operadora.module.css';
import { UNITS, DRIVERS } from '@/data';
import type { Unit } from '@/data';
import clsx from 'clsx';
import { formatTimeAMPM, statusLabel } from '@/data';

type Props = {
  onClose: () => void;
};

type StatusFilter = 'all' | Unit['status'];

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Disponibles' },
  { id: 'on-trip', label: 'En viaje' },
  { id: 'break', label: 'Descanso' },
  { id: 'offline', label: 'Offline' },
];

const STATUS_COLOR: Record<Unit['status'], string> = {
  active: 'var(--unit-active)',
  'on-trip': 'var(--unit-trip)',
  break: 'var(--unit-break)',
  offline: 'var(--fg-subtle)',
  blocked: 'var(--danger)',
};

const CAR_SVG = (
  <svg width="24" height="16" viewBox="0 0 28 20" fill="none">
    <path
      d="M4 8 L6 3 L22 3 L24 8 L24 14 L4 14 Z"
      fill="currentColor"
      stroke="var(--bg)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="15" r="2.5" fill="var(--bg)" />
    <circle cx="20" cy="15" r="2.5" fill="var(--bg)" />
  </svg>
);

export function UnitsModal({ onClose }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    let list = UNITS;
    if (filter !== 'all') {
      list = list.filter((u) => u.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) => {
        const driver = u.driverId
          ? DRIVERS.find((d) => d.id === u.driverId)
          : null;
        return (
          u.placa.toLowerCase().includes(q) ||
          (driver?.name.toLowerCase().includes(q) ?? false)
        );
      });
    }
    return list;
  }, [filter, search]);

  const driverName = (unit: Unit) => {
    if (!unit.driverId) return 'Sin conductor';
    return DRIVERS.find((d) => d.id === unit.driverId)?.name ?? 'Sin conductor';
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.unitsModalOverlay} onClick={onClose} />

      {/* Modal */}
      <div className={styles.unitsModal}>
        {/* Header */}
        <div className={styles.unitsModal__header}>
          <div className={styles.unitsModal__title}>
            Unidades
            <span className={styles.unitsModal__count}>{UNITS.length}</span>
          </div>
          <button
            className={styles.unitsModal__close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className={styles.unitsModal__search}>
          <div className={styles.unitsModal__searchInput}>
            <Search size={14} color="var(--fg-subtle)" />
            <input
              type="text"
              placeholder="Buscar por placa o conductor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className={styles.unitsModal__filters}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={clsx(styles.chipFilter, filter === f.id && styles['chipFilter--active'])}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className={styles.unitsModal__list}>
          {filtered.map((u) => (
            <div key={u.id} className={styles.unitRow}>
              <div
                className={styles.unitRow__icon}
                style={{ color: STATUS_COLOR[u.status] }}
              >
                {CAR_SVG}
              </div>
              <div className={styles.unitRow__info}>
                <div className={styles.unitRow__placa}>{u.placa}</div>
                <div className={styles.unitRow__driver}>{driverName(u)}</div>
              </div>
              <div className={styles.unitRow__meta}>
                <span
                  className={clsx(
                    styles.statusBadge,
                    styles[`statusBadge--${u.status}`]
                  )}
                >
                  {statusLabel(u.status)}
                </span>
                <span className={styles.unitRow__lastSeen}>
                  {formatTimeAMPM(u.lastSeenAt)}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13 }}>
              No se encontraron unidades
            </div>
          )}
        </div>
      </div>
    </>
  );
}
