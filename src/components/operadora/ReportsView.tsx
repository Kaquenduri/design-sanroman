'use client';

import {
  Download,
  Banknote,
  Car,
  Timer,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  Avatar,
  Button,
  Stat,
  UnitBadge,
  Synthetic,
} from '@/components/ui';
import { DRIVERS, UNITS, TODAY_TRIPS, formatPEN } from '@/data';
import s from './Operadora.module.css';

/* Serie horaria sintética de TODA la flota, 07:00 → 18:00.
   Suma exactamente los viajes del día de los 25 conductores, para que el
   gráfico, el KPI y la tabla de conductores no se contradigan entre sí. */
const HOURLY = [12, 9, 15, 19, 16, 23, 34, 42, 31, 24, 12, 9];
const PEAK = Math.max(...HOURLY);
const FLEET_TRIPS = HOURLY.reduce((a, b) => a + b, 0);

const EXTRA_TRIPS = [
  { id: 'x1', t: '11:55', name: 'Lucía Mamani', from: 'Jr. Piura 245', to: 'Urb. San Francisco', fare: 8 },
  { id: 'x2', t: '12:08', name: 'Jorge Ccama', from: 'Av. El Sol 880', to: 'Hospital C. Monge', fare: 13 },
  { id: 'x3', t: '12:24', name: 'Eduardo Pari', from: 'Plaza de Armas', to: 'Jr. Puno 230', fare: 8 },
  { id: 'x4', t: '12:48', name: 'Rosa Taco', from: 'Jr. Loreto 110', to: 'Mercado Túpac Amaru', fare: 10 },
  { id: 'x5', t: '13:02', name: 'Pedro Lipa', from: 'Calle 2 de Mayo 412', to: 'Av. San Martín 1020', fare: 11.5 },
  { id: 'x6', t: '13:18', name: 'Sara Apaza', from: 'Av. Circunvalación 230', to: 'Terminal Terrestre', fare: 8 },
];

export function ReportsView() {
  const rows = [
    ...TODAY_TRIPS.map((t) => ({
      id: t.id,
      t: t.startedAt,
      name: t.passengerName,
      from: t.pickupAddress,
      to: t.destinationAddress,
      fare: t.fare,
    })),
    ...EXTRA_TRIPS,
  ];

  // La tabla es una muestra de los últimos viajes; el total del día sale de
  // la serie horaria de la flota, no de las filas visibles.
  const avgFare = rows.reduce((a, r) => a + r.fare, 0) / rows.length;
  const dayTrips = FLEET_TRIPS;
  const dayRevenue = dayTrips * avgFare;

  const ranking = [...DRIVERS]
    .sort((a, b) => b.tripsToday - a.tripsToday)
    .slice(0, 6);

  return (
    <div className={s.page}>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Reportes del día</h1>
          <p className={s.pageSub}>
            Turno en curso · cierre a las 22:00
          </p>
        </div>
        <div className={s.pageTools}>
          <Button variant="outline" size="md">
            <Download size={16} />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiHead}>
            <Banknote size={15} />
            <span className={s.sectionLabel}>Recaudado</span>
          </div>
          <Stat
            label=""
            value={formatPEN(dayRevenue)}
            sub="Cobros en efectivo y Yape"
          />
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiHead}>
            <Car size={15} />
            <span className={s.sectionLabel}>Viajes completados</span>
          </div>
          <Stat
            label=""
            value={dayTrips}
            sub={`${(dayTrips / HOURLY.length).toFixed(1)} por hora`}
          />
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiHead}>
            <Timer size={15} />
            <span className={s.sectionLabel}>ETA promedio</span>
          </div>
          <Stat label="" value="6.4 min" sub="de propuesta a recojo" />
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiHead}>
            <Star size={15} />
            <span className={s.sectionLabel}>Valoración media</span>
          </div>
          <Stat label="" value="4.8" sub={`${dayTrips} pasajeros calificaron`} />
        </div>
      </div>

      <div className={s.chartCard}>
        <div className={s.chartHead}>
          <div>
            <span className={s.sectionLabel}>Viajes por hora</span>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                marginTop: 4,
                letterSpacing: 'var(--tracking-tight)',
              }}
            >
              {dayTrips} viajes de toda la flota en 12 horas
            </div>
          </div>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--fg-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <TrendingUp size={14} color="var(--brand-400)" />
            Pico a las 14:00 · {PEAK} viajes
          </span>
        </div>

        <div className={s.chart}>
          {HOURLY.map((v, i) => (
            <div key={i} className={s.barCol}>
              <span className={s.barValue}>{v}</span>
              <div
                className={`${s.bar} ${v === PEAK ? s.barPeak : ''}`}
                style={{ height: `${(v / PEAK) * 100}%` }}
              />
              <span className={s.barLabel}>
                {String(7 + i).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={s.twoCol}>
        <div className={s.chartCard}>
          <span className={s.sectionLabel}>Unidades más activas</span>
          <div style={{ marginTop: 'var(--s-3)' }}>
            {ranking.map((d, i) => {
              const u = UNITS.find((x) => x.driverId === d.id)!;
              return (
                <div key={d.id} className={s.rankRow}>
                  <span className={`${s.rankN} ${i === 0 ? s.rankTop : ''}`}>
                    {i + 1}
                  </span>
                  <UnitBadge n={u.n} size="sm" />
                  <div className={s.suggestionBody}>
                    <div className={s.suggestionName}>{d.name}</div>
                  </div>
                  <span className="num" style={{ fontWeight: 700 }}>
                    {d.tripsToday}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Pasajero</th>
                <th>Recorrido · últimos {rows.length} registrados</th>
                <th className={s.right}>Tarifa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono" style={{ fontSize: 'var(--text-sm)' }}>
                    {r.t}
                  </td>
                  <td className={s.cellName}>{r.name}</td>
                  <td className={s.cellMeta} style={{ fontSize: 'var(--text-sm)' }}>
                    {r.from} → {r.to}
                  </td>
                  <td className={`${s.right} num`} style={{ fontWeight: 700 }}>
                    {formatPEN(r.fare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Synthetic>
        Cifras sintéticas de demostración · no provienen de operación real
      </Synthetic>
    </div>
  );
}
