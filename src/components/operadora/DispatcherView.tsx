'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Minus,
  Locate,
  Clock,
  MapPin,
  Navigation,
  User as UserIcon,
  Phone,
  PhoneCall,
  X,
  RefreshCw,
  ChevronRight,
  Truck,
} from 'lucide-react';
import styles from './Operadora.module.css';
import {
  REQUESTS_INITIAL,
  DRIVERS,
  UNITS,
  UNIT_POSITIONS,
  CITY_BOUNDS,
  formatPEN,
  formatKm,
  statusLabel,
  statusColor,
  type PendingRequest,
} from '@/data';
import { DispatcherMap } from './DispatcherMap';

export function DispatcherView() {
  const [requests, setRequests] = useState<PendingRequest[]>(REQUESTS_INITIAL);
  const [selectedId, setSelectedId] = useState<string | null>(REQUESTS_INITIAL[0].id);
  const [filter, setFilter] = useState<'all' | 'app' | 'telefono'>('all');
  const [waitTick, setWaitTick] = useState(0);

  // Increment wait seconds every second
  useEffect(() => {
    const id = setInterval(() => setWaitTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulate new requests arriving every ~25s
  useEffect(() => {
    let id = 0;
    const interval = setInterval(() => {
      id++;
      const seeds = [
        { name: 'Roxana P.', addr: 'Jr. Moquegua 412', dest: 'Urb. Los Olivos', fare: 9 },
        { name: 'Andrés M.', addr: 'Av. El Sol 1050', dest: 'Jr. Puno 230', fare: 7.5 },
        { name: 'Camila Q.', addr: 'Calle 2 de Mayo 88', dest: 'Mercado San José', fare: 6 },
      ];
      const seed = seeds[id % seeds.length];
      const newReq: PendingRequest = {
        id: `r-${2000 + id}`,
        passengerName: seed.name,
        passengerRating: 4.7 + Math.random() * 0.3,
        pickupAddress: seed.addr,
        destinationAddress: seed.dest,
        pickup: UNIT_POSITIONS[UNITS[0].id],
        destination: UNIT_POSITIONS[UNITS[3].id],
        distanceKm: +(2 + Math.random() * 4).toFixed(1),
        fareEstimate: seed.fare,
        waitSeconds: 0,
        source: Math.random() > 0.5 ? 'app' : 'telefono',
        assignedUnitId: null,
      };
      setRequests((rs) => [newReq, ...rs].slice(0, 10));
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? requests
        : requests.filter((r) => r.source === filter),
    [filter, requests]
  );

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const assignedUnit = selected?.assignedUnitId
    ? UNITS.find((u) => u.id === selected.assignedUnitId) ?? null
    : null;
  const assignedDriver = assignedUnit
    ? DRIVERS.find((d) => d.id === assignedUnit.driverId) ?? null
    : null;

  const fmtWait = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className={styles.dispatcher}>
      <aside className={styles.queue} aria-label="Cola de solicitudes">
        <div className={styles.queue__head}>
          <div>
            <div className={styles.queue__title}>Solicitudes pendientes</div>
            <div className={styles.queue__count}>
              {requests.length} en cola · tiempo real
            </div>
          </div>
          <button
            className={styles.actionBtn}
            aria-label="Actualizar"
            onClick={() => setWaitTick((x) => x + 1)}
          >
            <RefreshCw size={12} />
          </button>
        </div>
        <div className={styles.queue__filters}>
          {(['all', 'app', 'telefono'] as const).map((f) => (
            <button
              key={f}
              className={`${styles.chipFilter} ${filter === f ? styles['chipFilter--active'] : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todas' : f === 'app' ? 'App' : 'Teléfono'}
            </button>
          ))}
        </div>
        <div className={styles.queue__list}>
          {filtered.map((r) => {
            const isSel = selectedId === r.id;
            const totalWait = r.waitSeconds + waitTick;
            const isHot = totalWait > 90;
            return (
              <button
                key={r.id}
                className={`${styles.queueItem} ${isSel ? styles['queueItem--selected'] : ''}`}
                onClick={() => setSelectedId(r.id)}
                style={{ width: '100%', textAlign: 'left' }}
              >
                <div className={styles.queueItem__head}>
                  <span className={styles.queueItem__id}>#{r.id}</span>
                  <span
                    className={`${styles.queueItem__wait} ${isHot ? styles['queueItem__wait--hot'] : ''}`}
                  >
                    <Clock size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                    {fmtWait(totalWait)}
                  </span>
                </div>
                <div className={styles.queueItem__passenger}>{r.passengerName}</div>
                <div className={styles.queueItem__row}>
                  <MapPin size={11} />
                  <span>{r.pickupAddress}</span>
                </div>
                <div className={styles.queueItem__row}>
                  <Navigation size={11} />
                  <span>{r.destinationAddress}</span>
                </div>
                <div
                  className={`${styles.queueItem__foot} ${isSel ? styles['queueItem__foot--selected'] : ''}`}
                >
                  <span className={styles.queueItem__price}>{formatPEN(r.fareEstimate)}</span>
                  {r.assignedUnitId ? (
                    <span className={styles.queueItem__assigned}>
                      <Truck size={11} /> {r.assignedUnitId.toUpperCase()} · reasignar
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      {r.source === 'telefono' && (
                        <span className={styles.sourceTag}>
                          <PhoneCall size={10} /> Tel
                        </span>
                      )}
                      <span className={styles.queueItem__assigned}>
                        Sin asignar <ChevronRight size={11} />
                      </span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className={styles.map} aria-label="Mapa de despacho">
        <div className={styles.map__header}>
          <div className={styles.mapBadge}>
            <span className={styles.mapBadge__live} />
            Mapa · Juliaca centro
            <span style={{ color: 'var(--fg-muted)', marginLeft: 8 }}>
              {Object.keys(UNIT_POSITIONS).length} unidades
            </span>
          </div>
          <div className={styles.mapBadge}>
            <Clock size={12} color="var(--fg-muted)" />
            <span className="mono">
              {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          </div>
        </div>

        <div className={styles.map__canvas}>
          <DispatcherMap
            units={UNITS}
            positions={UNIT_POSITIONS}
            bounds={CITY_BOUNDS}
            requests={requests}
            selectedRequestId={selectedId}
          />
        </div>

        <div className={styles.map__legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'var(--success)' }} />
            Disponible
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'var(--taxi)' }} />
            En viaje
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'var(--fg-subtle)' }} />
            Sin conexión
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'var(--danger)' }} />
            Bloqueada
          </span>
        </div>

        <div className={styles.map__controls}>
          <button className={styles.mapControl} aria-label="Zoom in">
            <Plus size={16} />
          </button>
          <button className={styles.mapControl} aria-label="Zoom out">
            <Minus size={16} />
          </button>
          <button className={styles.mapControl} aria-label="Centrar">
            <Locate size={16} />
          </button>
        </div>
      </section>

      <aside className={styles.detail} aria-label="Detalle">
        {selected ? (
          <>
            <div className={styles.detail__head}>
              <div className={styles.detail__title}>{selected.passengerName}</div>
              <div className={styles.detail__sub}>
                Solicitud #{selected.id} ·{' '}
                {selected.source === 'telefono' ? 'Canal teléfono' : 'App pasajero'}
              </div>
            </div>
            <div className={styles.detail__body}>
              <div className={styles.kpiRow}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Tarifa est.</div>
                  <div className={styles.kpiValue}>{formatPEN(selected.fareEstimate)}</div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Distancia</div>
                  <div className={styles.kpiValue}>{formatKm(selected.distanceKm)}</div>
                </div>
              </div>

              <div>
                <div className={styles.sectionTitle}>Recogida</div>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 12,
                    fontSize: 13,
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <MapPin size={14} color="var(--accent)" style={{ marginTop: 2 }} />
                  <span>{selected.pickupAddress}</span>
                </div>
              </div>

              <div>
                <div className={styles.sectionTitle}>Destino</div>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 12,
                    fontSize: 13,
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <Navigation size={14} color="var(--taxi)" style={{ marginTop: 2 }} />
                  <span>{selected.destinationAddress}</span>
                </div>
              </div>

              {assignedUnit && assignedDriver ? (
                <div>
                  <div className={styles.sectionTitle}>Unidad asignada</div>
                  <div
                    style={{
                      background: 'var(--accent-soft)',
                      border: '1px solid rgba(37,99,235,0.4)',
                      borderRadius: 'var(--radius-md)',
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={styles.avatarSm} style={{ width: 32, height: 32 }}>
                        {assignedDriver.avatarSeed}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {assignedDriver.name}
                        </div>
                        <div
                          className="mono"
                          style={{ fontSize: 11, color: 'var(--fg-muted)' }}
                        >
                          {assignedUnit.placa} · #{assignedUnit.id.replace('u', '')}
                        </div>
                      </div>
                      <button className={styles.actionBtn}>
                        <Phone size={12} /> Llamar
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className={styles.actionBtn} style={{ flex: 1, justifyContent: 'center' }}>
                        Reasignar
                      </button>
                      <button className={styles.actionBtn} style={{ flex: 1, justifyContent: 'center' }}>
                        Ver unidad
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.sectionTitle}>Asignación</div>
                  <button
                    className={styles.actionBtn}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: 'var(--accent)',
                      color: 'var(--accent-fg)',
                      borderColor: 'var(--accent)',
                      padding: '12px 14px',
                      fontSize: 13,
                    }}
                  >
                    Asignar unidad más cercana
                  </button>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--fg-muted)',
                      marginTop: 8,
                      textAlign: 'center',
                    }}
                  >
                    Sugerida: U08 · 0.6 km de distancia
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.detail__head}>
            <div className={styles.detail__title}>Selecciona una solicitud</div>
            <div className={styles.detail__sub}>
              Los detalles del pasajero y la asignación aparecerán aquí
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
