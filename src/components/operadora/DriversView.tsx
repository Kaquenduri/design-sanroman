'use client';

import { useState } from 'react';
import { Search, MoreHorizontal, UserPlus, Phone } from 'lucide-react';
import {
  Avatar,
  Button,
  Chip,
  Field,
  IconButton,
  Plate,
  Stars,
  Segmented,
  Empty,
  Synthetic,
} from '@/components/ui';
import {
  DRIVERS,
  UNITS,
  MEMBERSHIPS,
  membershipBadge,
  formatDate,
} from '@/data';
import s from './Operadora.module.css';

type Filter = 'all' | 'activa' | 'vence-pronto' | 'vencida';

export function DriversView() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const rows = DRIVERS.filter((d) => {
    const m = MEMBERSHIPS.find((x) => x.driverId === d.id)!;
    const q = search.trim().toLowerCase();
    const matchText =
      !q || d.name.toLowerCase().includes(q) || d.phone.includes(q);
    return matchText && (filter === 'all' || m.status === filter);
  });

  const count = (f: Filter) =>
    f === 'all'
      ? DRIVERS.length
      : MEMBERSHIPS.filter((m) => m.status === f).length;

  return (
    <div className={s.page}>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Conductores</h1>
          <p className={s.pageSub}>
            {DRIVERS.length} agremiados · {count('activa')} habilitados para
            recibir viajes
          </p>
        </div>
        <div className={s.pageTools}>
          <Field
            icon={<Search size={16} color="var(--fg-subtle)" />}
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre o teléfono…"
            small
            className={s.search}
          />
          <Button size="md">
            <UserPlus size={16} />
            Agregar conductor
          </Button>
        </div>
      </div>

      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Todos', count: count('all') },
          { value: 'activa', label: 'Vigentes', count: count('activa') },
          {
            value: 'vence-pronto',
            label: 'Por vencer',
            count: count('vence-pronto'),
          },
          { value: 'vencida', label: 'Vencidas', count: count('vencida') },
        ]}
      />

      {rows.length === 0 ? (
        <Empty icon={<Search size={20} />} title="Sin resultados">
          Ningún conductor coincide con «{search}». Revisa la ortografía o
          limpia el filtro.
        </Empty>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Conductor</th>
                <th>Unidad</th>
                <th>Teléfono</th>
                <th>Membresía</th>
                <th className={s.right}>Viajes hoy</th>
                <th>Valoración</th>
                <th style={{ width: 44 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const u = UNITS.find((x) => x.driverId === d.id)!;
                const m = MEMBERSHIPS.find((x) => x.driverId === d.id)!;
                const badge = membershipBadge(m);
                return (
                  <tr key={d.id}>
                    <td>
                      <div className={s.cellPerson}>
                        <Avatar initials={d.avatarSeed} size={32} />
                        <div>
                          <div className={s.cellName}>{d.name}</div>
                          <div className={s.cellMeta}>
                            Agremiado desde {formatDate(d.joinedAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={s.cellPerson}>
                        <Plate value={u.placa} />
                        <span className={s.cellMeta}>Unidad {u.n}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 'var(--text-sm)' }}>
                      {d.phone}
                    </td>
                    <td>
                      <Chip tone={badge.tone} dot>
                        {badge.label}
                      </Chip>
                      <div className={s.cellMeta} style={{ marginTop: 4 }}>
                        {formatDate(m.expiresOn)}
                      </div>
                    </td>
                    <td className={`${s.right} num`} style={{ fontWeight: 650 }}>
                      {d.tripsToday}
                    </td>
                    <td>
                      <Stars value={d.rating} />
                    </td>
                    <td>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label={`Acciones de ${d.name}`}
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

      <Synthetic>
        Datos sintéticos de demostración · ningún conductor real
      </Synthetic>
    </div>
  );
}
