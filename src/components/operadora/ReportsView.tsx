'use client';

import { Download, TrendingUp, Star, DollarSign, Car } from 'lucide-react';
import styles from './Operadora.module.css';
import { DRIVERS, TODAY_TRIPS, formatPEN } from '@/data';

export function ReportsView() {
  const total = TODAY_TRIPS.reduce((acc, t) => acc + t.fare, 0);
  const count = TODAY_TRIPS.length;
  const avgEta = 14.2;
  const totalHours = 6.4;

  // Top 5 drivers by trips (synthetic for the day)
  const topDrivers = [...DRIVERS]
    .sort((a, b) => b.tripsToday - a.tripsToday)
    .slice(0, 5);

  // Trips per hour bar chart
  const hourlyTrips = [3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 8, 7];
  const maxTrips = Math.max(...hourlyTrips);

  // Combined trips list (synthetic full day)
  const allTrips = [...TODAY_TRIPS];
  const extendedTrips = [
    ...allTrips,
    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `tx-${i + 1}`,
      driverId: DRIVERS[(i + 3) % DRIVERS.length].id,
      unitId: `u${String((i + 3) % DRIVERS.length + 1).padStart(2, '0')}`,
      pickupAddress: ['Jr. Piura 245', 'Av. El Sol 880', 'Plaza de Armas', 'Jr. Loreto 110', 'Calle 2 de Mayo 412', 'Av. Circunvalación 230'][i],
      destinationAddress: ['Urb. San Francisco', 'Hospital Carlos Monge', 'Jr. Puno 230', 'Mercado Túpac Amaru', 'Av. San Martín 1020', 'Terminal Terrestre'][i],
      fare: [8, 12, 7, 9, 11, 6.5][i],
      startedAt: ['11:55', '12:08', '12:24', '12:48', '13:02', '13:18'][i],
      finishedAt: ['12:14', '12:32', '12:38', '13:04', '13:22', '13:31'][i],
      status: 'completado' as const,
    })),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reportes del día</h1>
          <div className={styles.pageSub}>
            {new Date().toLocaleDateString('es-PE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
        <button className={styles.actionBtn} style={{ padding: '9px 14px' }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      <div className={styles.kpiBigGrid}>
        <div className={styles.kpiBig}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <DollarSign size={14} color="var(--accent)" />
            <span className={styles.kpiBigLabel}>Ingresos estimados</span>
          </div>
          <div className={styles.kpiBigValue}>{formatPEN(total + 65.5)}</div>
          <div className={styles.kpiBigSub}>
            <TrendingUp size={11} style={{ display: 'inline', marginRight: 4 }} />
            +12% vs. ayer · efectivo
          </div>
        </div>
        <div className={styles.kpiBig}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <Car size={14} color="var(--accent)" />
            <span className={styles.kpiBigLabel}>Viajes completados</span>
          </div>
          <div className={styles.kpiBigValue}>{count + 6}</div>
          <div className={styles.kpiBigSub}>
            {((count + 6) / 6.4).toFixed(1)} viajes/hora
          </div>
        </div>
        <div className={styles.kpiBig}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <TrendingUp size={14} color="var(--accent)" />
            <span className={styles.kpiBigLabel}>ETA promedio</span>
          </div>
          <div className={styles.kpiBigValue}>
            {avgEta.toFixed(1)}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-muted)', marginLeft: 4 }}>
              min
            </span>
          </div>
          <div className={styles.kpiBigSub}>de aceptación a recogida</div>
        </div>
        <div className={styles.kpiBig}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <Star size={14} color="var(--taxi)" />
            <span className={styles.kpiBigLabel}>Valoración media</span>
          </div>
          <div className={styles.kpiBigValue}>
            4.8
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-muted)', marginLeft: 4 }}>
              / 5
            </span>
          </div>
          <div className={styles.kpiBigSub}>
            {(count + 6).toString()} pasajeros calificaron
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <div className={styles.sectionTitle}>Viajes por hora</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}>
              {count + 6} viajes · {totalHours.toFixed(1)}h activas
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
            Pico: 13:00 · 8 viajes/hora
          </div>
        </div>
        <div className={styles.barChartWrap}>
          <div className={styles.barChart}>
            {hourlyTrips.map((h, i) => (
              <div
                key={i}
                className={styles.bar}
                style={{ height: `${(h / maxTrips) * 100}%` }}
              >
                {h > 0 && <span className={styles.barValue}>{h}</span>}
                <span className={styles.barLabel}>
                  {String(7 + i).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 20,
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
          }}
        >
          <div className={styles.sectionTitle}>Top 5 conductores del día</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topDrivers.map((d, idx) => (
              <div
                key={d.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background:
                      idx === 0 ? 'var(--taxi)' : 'var(--surface-2)',
                    color: idx === 0 ? 'var(--taxi-fg)' : 'var(--fg-muted)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div className={styles.avatarSm}>{d.avatarSeed}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                </div>
                <div
                  className={styles.mono}
                  style={{ fontSize: 14, fontWeight: 700 }}
                >
                  {d.tripsToday}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className={styles.sectionTitle}>Viajes del día</div>
          </div>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Unidad</th>
                <th>Origen → Destino</th>
                <th style={{ textAlign: 'right' }}>Tarifa</th>
              </tr>
            </thead>
            <tbody>
              {extendedTrips.map((t) => (
                <tr key={t.id}>
                  <td className={styles.mono} style={{ fontSize: 12 }}>
                    {t.startedAt}
                  </td>
                  <td style={{ fontWeight: 500 }}>{t.unitId.toUpperCase()}</td>
                  <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{t.pickupAddress}</span>
                      <span style={{ color: 'var(--fg-subtle)' }}>→</span>
                      <span>{t.destinationAddress}</span>
                    </div>
                  </td>
                  <td className={styles.mono} style={{ textAlign: 'right', fontWeight: 700 }}>
                    {formatPEN(t.fare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
