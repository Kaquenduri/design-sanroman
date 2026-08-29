'use client';

import { useState } from 'react';
import { Search, MoreHorizontal, Phone, Plus } from 'lucide-react';
import styles from './Operadora.module.css';
import { DRIVERS, UNITS, MEMBERSHIPS, membershipBadge } from '@/data';

export function DriversView() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'activa' | 'vence-pronto' | 'vencida'>('all');

  const filtered = DRIVERS.filter((d) => {
    const m = MEMBERSHIPS.find((x) => x.driverId === d.id)!;
    const matchesText =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchesStatus = filter === 'all' || m.status === filter;
    return matchesText && matchesStatus;
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Conductores</h1>
          <div className={styles.pageSub}>
            {DRIVERS.length} conductores agremiados · {MEMBERSHIPS.filter((m) => m.status === 'activa').length} con membresía activa
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className={styles.searchInput}>
            <Search size={14} color="var(--fg-muted)" />
            <input
              placeholder="Buscar por nombre o teléfono…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className={styles.actionBtn} style={{ padding: '9px 14px' }}>
            <Plus size={14} /> Agregar conductor
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {(['all', 'activa', 'vence-pronto', 'vencida'] as const).map((f) => {
          const count =
            f === 'all'
              ? DRIVERS.length
              : MEMBERSHIPS.filter((m) => m.status === f).length;
          return (
            <button
              key={f}
              className={`${styles.chipFilter} ${filter === f ? styles['chipFilter--active'] : ''}`}
              onClick={() => setFilter(f)}
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              {f === 'all' ? 'Todos' : membershipBadge({ driverId: '', status: f, expiresOn: '', daysToExpire: 0 }).label}{' '}
              <span style={{ opacity: 0.6 }}>· {count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Conductor</th>
              <th>Unidad</th>
              <th>Teléfono</th>
              <th>Membresía</th>
              <th>Hoy</th>
              <th>Valoración</th>
              <th style={{ width: 60 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const u = UNITS.find((x) => x.driverId === d.id)!;
              const m = MEMBERSHIPS.find((x) => x.driverId === d.id)!;
              const badge = membershipBadge(m);
              return (
                <tr key={d.id}>
                  <td>
                    <div className={styles.cellDriver}>
                      <div className={styles.avatarSm}>{d.avatarSeed}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                          Desde {new Date(d.joinedAt).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.placa}>{u.placa}</span>
                    <span style={{ fontSize: 11, color: 'var(--fg-muted)', marginLeft: 8 }}>
                      #{u.id.replace('u', '')}
                    </span>
                  </td>
                  <td className={styles.mono} style={{ fontSize: 12 }}>
                    {d.phone}
                  </td>
                  <td>
                    <span className={`${styles.pill} ${styles[`pill--${badge.color}`]}`}>
                      {badge.label}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>
                      {new Date(m.expiresOn).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className={styles.mono} style={{ fontWeight: 600 }}>
                    {d.tripsToday}
                  </td>
                  <td className={styles.mono}>
                    <span style={{ color: 'var(--taxi)' }}>★</span> {d.rating.toFixed(1)}
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
