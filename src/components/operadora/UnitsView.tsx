'use client';

import { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import {
  Avatar,
  Chip,
  Field,
  IconButton,
  Plate,
  UnitBadge,
  Segmented,
  Empty,
  Synthetic,
} from '@/components/ui';
import {
  UNITS,
  DRIVERS,
  CATEGORY_BY_ID,
  statusLabel,
  statusTone,
  formatTime,
  type UnitStatus,
} from '@/data';
import s from './Operadora.module.css';

type Filter = 'all' | UnitStatus;

export function UnitsView() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const rows = UNITS.filter((u) => {
    const d = DRIVERS.find((x) => x.id === u.driverId);
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      u.placa.toLowerCase().includes(q) ||
      u.n.includes(q) ||
      (d?.name.toLowerCase().includes(q) ?? false);
    return matchText && (filter === 'all' || u.status === filter);
  });

  const count = (f: Filter) =>
    f === 'all' ? UNITS.length : UNITS.filter((u) => u.status === f).length;

  return (
    <div className={s.page}>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Unidades</h1>
          <p className={s.pageSub}>
            {UNITS.length} unidades registradas · {count('active')} disponibles
            ahora
          </p>
        </div>
        <div className={s.pageTools}>
          <Field
            icon={<Search size={16} color="var(--fg-subtle)" />}
            value={search}
            onChange={setSearch}
            placeholder="Buscar placa, número o conductor…"
            small
            className={s.search}
          />
        </div>
      </div>

      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Todas', count: count('all') },
          { value: 'active', label: 'Disponibles', count: count('active') },
          { value: 'on-trip', label: 'En viaje', count: count('on-trip') },
          { value: 'offline', label: 'Sin conexión', count: count('offline') },
          { value: 'blocked', label: 'Bloqueadas', count: count('blocked') },
        ]}
      />

      {rows.length === 0 ? (
        <Empty icon={<Search size={20} />} title="Sin resultados">
          Ninguna unidad coincide con «{search}».
        </Empty>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Placa</th>
                <th>Vehículo</th>
                <th>Categoría</th>
                <th>Conductor</th>
                <th>Estado</th>
                <th>Última señal</th>
                <th style={{ width: 44 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const d = DRIVERS.find((x) => x.id === u.driverId);
                const cat = CATEGORY_BY_ID[u.categoryId];
                return (
                  <tr key={u.id}>
                    <td>
                      <UnitBadge n={u.n} size="sm" />
                    </td>
                    <td>
                      <Plate value={u.placa} />
                    </td>
                    <td>
                      {u.marca} {u.modelo}{' '}
                      <span className={s.cellMeta} style={{ display: 'inline' }}>
                        {u.anio}
                      </span>
                    </td>
                    <td>
                      <Chip tone="neutral">{cat.label}</Chip>
                    </td>
                    <td>
                      {d ? (
                        <div className={s.cellPerson}>
                          <Avatar initials={d.avatarSeed} size={28} />
                          <span>{d.name}</span>
                        </div>
                      ) : (
                        <span className={s.cellMeta}>Sin asignar</span>
                      )}
                    </td>
                    <td>
                      <Chip tone={statusTone(u.status)} dot>
                        {statusLabel(u.status)}
                      </Chip>
                    </td>
                    <td className="mono" style={{ fontSize: 'var(--text-sm)' }}>
                      {formatTime(u.lastSeenAt)}
                    </td>
                    <td>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label={`Acciones de la unidad ${u.n}`}
                      >
                        <MoreHorizontal size={16} />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Synthetic>Datos sintéticos de demostración</Synthetic>
    </div>
  );
}
