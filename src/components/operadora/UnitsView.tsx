'use client';

import { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import styles from './Operadora.module.css';
import { UNITS, DRIVERS, statusLabel, statusColor, type Unit } from '@/data';

export function UnitsView() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Unit['status']>('all');

  const filtered = UNITS.filter((u) => {
    const d = DRIVERS.find((x) => x.id === u.driverId);
    const matchesText =
      u.placa.toLowerCase().includes(search.toLowerCase()) ||
      (d && d.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filter === 'all' || u.status === filter;
    return matchesText && matchesStatus;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Unidades</h1>
          <div className={styles.pageSub}>
            {UNITS.length} unidades operativas · {UNITS.filter((u) => u.status === 'active').length} disponibles
          </div>
        </div>
        <div className={styles.searchInput}>
          <Search size={14} color="var(--fg-muted)" />
          <input
            placeholder="Buscar por placa o conductor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {(['all', 'active', 'on-trip', 'offline', 'blocked'] as const).map((f) => {
          const count = f === 'all' ? UNITS.length : UNITS.filter((u) => u.status === f).length;
          return (
            <button
              key={f}
              className={`${styles.chipFilter} ${filter === f ? styles['chipFilter--active'] : ''}`}
              onClick={() => setFilter(f)}
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              {f === 'all' ? 'Todas' : statusLabel(f)}{' '}
              <span style={{ opacity: 0.6 }}>· {count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Placa</th>
              <th>Vehículo</th>
              <th>Conductor</th>
              <th>Estado</th>
              <th>Última conexión</th>
              <th style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const d = DRIVERS.find((x) => x.id === u.driverId);
              const color = statusColor(u.status);
              return (
                <tr key={u.id}>
                  <td className={styles.mono} style={{ fontWeight: 700 }}>
                    #{u.id.replace('u', '')}
                  </td>
                  <td>
                    <span className={styles.placa}>{u.placa}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {u.marca} {u.modelo} <span style={{ color: 'var(--fg-muted)' }}>{u.anio}</span>
                  </td>
                  <td>
                    {d ? (
                      <div className={styles.cellDriver}>
                        <div className={styles.avatarSm}>{d.avatarSeed}</div>
                        <div style={{ fontWeight: 500 }}>{d.name}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.pill} ${styles[`pill--${color}`]}`}>
                      {statusLabel(u.status)}
                    </span>
                  </td>
                  <td className={styles.mono} style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                    {new Date(u.lastSeenAt).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </td>
                  <td>
                    <button className={styles.actionBtn} aria-label="Más opciones">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
