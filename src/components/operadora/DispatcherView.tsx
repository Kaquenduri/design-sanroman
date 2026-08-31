'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  MapPin,
  Navigation,
  PhoneCall,
  Smartphone,
  Plus,
  Minus,
  Crosshair,
  Zap,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { CityMap } from '@/components/map/CityMap';
import {
  RouteLine,
  UnitMarker,
  RequestPin,
  DestPin,
} from '@/components/map/MapMarkers';
import {
  Button,
  IconButton,
  Chip,
  Avatar,
  Stat,
  Stars,
  Legs,
  Plate,
  UnitBadge,
  Segmented,
  Empty,
} from '@/components/ui';
import {
  REQUESTS_INITIAL,
  DRIVERS,
  UNITS,
  UNIT_POSITIONS,
  CATEGORY_BY_ID,
  formatPEN,
  formatKm,
  formatClock,
  fareBreakdown,
  type PendingRequest,
} from '@/data';
import { routeBetween, seededPoint } from '@/lib/city';
import s from './Operadora.module.css';

const MAP_VIEW = '40 60 1520 1080';

/** Unidad disponible más cercana a un punto — el KNN que corre en PostGIS. */
function nearestUnit(p: { x: number; y: number }) {
  let best: { id: string; d: number } | null = null;
  for (const u of UNITS) {
    if (u.status !== 'active') continue;
    const q = UNIT_POSITIONS[u.id];
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (!best || d < best.d) best = { id: u.id, d };
  }
  return best;
}

/** 1 unidad de mundo ≈ 7 m en esta ciudad sintética. */
const toKm = (worldDistance: number) => (worldDistance * 7) / 1000;

const SEEDS = [
  { name: 'Roxana Pari', seed: 'RP', from: 'Jr. Moquegua 412', to: 'Urb. Los Olivos' },
  { name: 'Andrés Mamani', seed: 'AM', from: 'Av. El Sol 1050', to: 'Jr. Puno 230' },
  { name: 'Camila Quispe', seed: 'CQ', from: 'Calle 2 de Mayo 88', to: 'Mercado San José' },
];

export function DispatcherView() {
  const [requests, setRequests] = useState<PendingRequest[]>(REQUESTS_INITIAL);
  const [selectedId, setSelectedId] = useState<string | null>(
    REQUESTS_INITIAL[0].id
  );
  const [filter, setFilter] = useState<'all' | 'app' | 'telefono'>('all');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  /* Llega una solicitud nueva cada ~28 s: la cola se mueve sola. */
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      const seed = SEEDS[n % SEEDS.length];
      const pickup = seededPoint(400 + n * 13);
      const next: PendingRequest = {
        id: String(1048 + n),
        passengerName: seed.name,
        passengerRating: 4.7,
        passengerSeed: seed.seed,
        pickupAddress: seed.from,
        destinationAddress: seed.to,
        pickup,
        destination: seededPoint(500 + n * 17),
        distanceKm: 2 + (n % 4),
        categoryId: 'SEDAN',
        fareEstimate: fareBreakdown(pickup, CATEGORY_BY_ID.SEDAN).total,
        waitSeconds: 0,
        source: n % 2 === 0 ? 'app' : 'telefono',
        assignedUnitId: null,
      };
      setRequests((rs) => [next, ...rs].slice(0, 9));
    }, 28000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.source === filter)),
    [filter, requests]
  );

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const assignedUnit = selected?.assignedUnitId
    ? (UNITS.find((u) => u.id === selected.assignedUnitId) ?? null)
    : null;
  const assignedDriver = assignedUnit
    ? (DRIVERS.find((d) => d.id === assignedUnit.driverId) ?? null)
    : null;

  const suggestion = selected && !assignedUnit ? nearestUnit(selected.pickup) : null;
  const suggestedUnit = suggestion
    ? (UNITS.find((u) => u.id === suggestion.id) ?? null)
    : null;
  const suggestedDriver = suggestedUnit
    ? (DRIVERS.find((d) => d.id === suggestedUnit.driverId) ?? null)
    : null;

  const activeUnitId = assignedUnit?.id ?? suggestedUnit?.id ?? null;
  const routeToPickup =
    selected && activeUnitId
      ? routeBetween(UNIT_POSITIONS[activeUnitId], selected.pickup, 4)
      : null;

  const assign = () => {
    if (!selected || !suggestedUnit) return;
    setRequests((rs) =>
      rs.map((r) =>
        r.id === selected.id ? { ...r, assignedUnitId: suggestedUnit.id } : r
      )
    );
  };

  const fare = selected
    ? fareBreakdown(selected.pickup, CATEGORY_BY_ID[selected.categoryId])
    : null;

  return (
    <div className={s.dispatcher}>
      {/* ------------------------------------------------------- Cola --- */}
      <aside className={`${s.col} ${s.colQueue}`} aria-label="Cola de solicitudes">
        <div className={s.colHead}>
          <div className={s.colTitle}>
            Solicitudes
            <Chip tone="brand">{requests.length}</Chip>
          </div>
          <div className={s.colSub}>
            {requests.filter((r) => !r.assignedUnitId).length} sin asignar · en
            vivo
          </div>
        </div>

        <div className={s.colFilters}>
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Todas', count: requests.length },
              {
                value: 'app',
                label: 'App',
                count: requests.filter((r) => r.source === 'app').length,
              },
              {
                value: 'telefono',
                label: 'Teléfono',
                count: requests.filter((r) => r.source === 'telefono').length,
              },
            ]}
          />
        </div>

        <div className={s.colList}>
          {filtered.length === 0 ? (
            <Empty icon={<Zap size={20} />} title="Sin solicitudes en este canal">
              Cambia de filtro o espera la próxima llamada.
            </Empty>
          ) : (
            filtered.map((r) => {
              const active = r.id === selectedId;
              const wait = r.waitSeconds + tick;
              const hot = wait > 100;
              return (
                <button
                  key={r.id}
                  className={`${s.qItem} ${active ? s.qActive : ''}`}
                  onClick={() => setSelectedId(r.id)}
                  aria-pressed={active}
                >
                  <div className={s.qTop}>
                    <span className={s.qId}>#{r.id}</span>
                    {r.source === 'telefono' ? (
                      <PhoneCall size={12} opacity={0.7} />
                    ) : (
                      <Smartphone size={12} opacity={0.7} />
                    )}
                    <span
                      className={`${s.qWait} ${hot && !active ? s.qWaitHot : ''}`}
                    >
                      <Clock size={10} />
                      {formatClock(wait)}
                    </span>
                  </div>

                  <div className={s.qName}>{r.passengerName}</div>

                  <div className={s.qRoute}>
                    <MapPin size={11} />
                    <span className={s.qRouteText}>{r.pickupAddress}</span>
                  </div>
                  <div className={s.qRoute}>
                    <Navigation size={11} />
                    <span className={s.qRouteText}>{r.destinationAddress}</span>
                  </div>

                  <div className={s.qFoot}>
                    <span className={s.qFare}>{formatPEN(r.fareEstimate)}</span>
                    {r.assignedUnitId ? (
                      <span className={s.qAssign}>
                        <UnitBadge
                          n={
                            UNITS.find((u) => u.id === r.assignedUnitId)?.n ?? '—'
                          }
                          size="sm"
                        />
                      </span>
                    ) : (
                      <span className={`${s.qAssign} ${s.qUnassigned}`}>
                        Sin asignar
                        <ArrowRight size={12} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ------------------------------------------------------- Mapa --- */}
      <section className={s.mapZone} aria-label="Mapa de la flota">
        <CityMap viewBox={MAP_VIEW} rings>
          {routeToPickup && <RouteLine d={routeToPickup} />}

          {UNITS.map((u) => {
            const p = UNIT_POSITIONS[u.id];
            return (
              <UnitMarker
                key={u.id}
                x={p.x}
                y={p.y}
                n={u.n}
                status={u.status}
                heading={u.heading}
                selected={u.id === activeUnitId}
              />
            );
          })}

          {requests.map((r) => (
            <RequestPin
              key={r.id}
              x={r.pickup.x}
              y={r.pickup.y}
              selected={r.id === selectedId}
              hot={r.waitSeconds + tick > 100}
            />
          ))}

          {selected && (
            <DestPin x={selected.destination.x} y={selected.destination.y} />
          )}
        </CityMap>

        <div className={s.mapOverlayTop}>
          <span className={s.mapChip}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: 'var(--success)',
              }}
            />
            Flota en vivo · {UNITS.length} unidades
          </span>
          <span className={s.mapChip}>Anillos tarifarios visibles</span>
        </div>

        <div className={s.mapLegend}>
          {[
            ['var(--success)', 'Disponible'],
            ['var(--brand-500)', 'En viaje'],
            ['#4A4360', 'Sin conexión'],
            ['var(--danger)', 'Bloqueada'],
          ].map(([color, label]) => (
            <span key={label} className={s.legendItem}>
              <span
                className={s.legendSwatch}
                style={{ background: color }}
              />
              {label}
            </span>
          ))}
        </div>

        <div className={s.mapTools}>
          <IconButton variant="glass" size="sm" aria-label="Acercar">
            <Plus size={16} />
          </IconButton>
          <IconButton variant="glass" size="sm" aria-label="Alejar">
            <Minus size={16} />
          </IconButton>
          <IconButton variant="glass" size="sm" aria-label="Centrar en la plaza">
            <Crosshair size={16} />
          </IconButton>
        </div>
      </section>

      {/* ----------------------------------------------------- Detalle --- */}
      <aside className={`${s.col} ${s.colDetail}`} aria-label="Detalle de la solicitud">
        {!selected || !fare ? (
          <Empty icon={<MapPin size={20} />} title="Ninguna solicitud seleccionada">
            Elige una de la cola para ver al pasajero, la tarifa y la unidad
            sugerida.
          </Empty>
        ) : (
          <>
            <div className={s.colHead}>
              <div className={s.colTitle}>{selected.passengerName}</div>
              <div className={s.colSub}>
                #{selected.id} ·{' '}
                {selected.source === 'telefono'
                  ? 'entró por teléfono'
                  : 'entró por la app'}
              </div>
            </div>

            <div className={s.detailBody}>
              <div className={s.kpiPair}>
                <div className={s.kpiBox}>
                  <Stat
                    label="Tarifa"
                    value={formatPEN(fare.total)}
                    sub={fare.lines[0].label}
                    size="sm"
                  />
                </div>
                <div className={s.kpiBox}>
                  <Stat
                    label="Distancia"
                    value={formatKm(selected.distanceKm)}
                    sub={CATEGORY_BY_ID[selected.categoryId].label}
                    size="sm"
                  />
                </div>
              </div>

              <div className={s.detailSection}>
                <span className={s.sectionLabel}>Recorrido</span>
                <Legs
                  from={selected.pickupAddress}
                  to={selected.destinationAddress}
                />
              </div>

              <div className={s.detailSection}>
                <span className={s.sectionLabel}>Pasajero</span>
                <div className={s.assignedTop}>
                  <Avatar initials={selected.passengerSeed} size={38} />
                  <div className={s.suggestionBody}>
                    <div className={s.suggestionName}>
                      {selected.passengerName}
                    </div>
                    <div className={s.suggestionMeta}>
                      <Stars value={selected.passengerRating} />
                    </div>
                  </div>
                  <IconButton
                    variant="neutral"
                    size="sm"
                    aria-label="Llamar al pasajero"
                  >
                    <Phone size={15} />
                  </IconButton>
                </div>
              </div>

              {assignedUnit && assignedDriver ? (
                <div className={s.detailSection}>
                  <span className={s.sectionLabel}>Unidad asignada</span>
                  <div className={s.assignedCard}>
                    <div className={s.assignedTop}>
                      <UnitBadge n={assignedUnit.n} size="md" />
                      <div className={s.suggestionBody}>
                        <div className={s.suggestionName}>
                          {assignedDriver.name}
                        </div>
                        <div className={s.suggestionMeta}>
                          {assignedUnit.marca} {assignedUnit.modelo}
                        </div>
                      </div>
                      <Plate value={assignedUnit.placa} />
                    </div>
                    <div className={s.assignedActions}>
                      <Button variant="outline" size="sm">
                        <Phone size={14} />
                        Llamar
                      </Button>
                      <Button variant="outline" size="sm">
                        Reasignar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={s.detailSection}>
                  <span className={s.sectionLabel}>Asignación sugerida</span>
                  {suggestedUnit && suggestedDriver && suggestion ? (
                    <>
                      <div className={s.suggestion}>
                        <UnitBadge n={suggestedUnit.n} size="md" />
                        <div className={s.suggestionBody}>
                          <div className={s.suggestionName}>
                            {suggestedDriver.name}
                          </div>
                          <div className={s.suggestionMeta}>
                            a {formatKm(toKm(suggestion.d))} · la más cercana
                            disponible
                          </div>
                        </div>
                      </div>
                      <Button size="md" full onClick={assign}>
                        <Zap size={16} />
                        Proponer a Unidad {suggestedUnit.n}
                      </Button>
                    </>
                  ) : (
                    <Empty
                      icon={<Zap size={18} />}
                      title="Sin unidades disponibles"
                    >
                      Toda la flota está ocupada o fuera de línea.
                    </Empty>
                  )}
                </div>
              )}

              <div className={s.detailSection}>
                <span className={s.sectionLabel}>Desglose de tarifa</span>
                <div className={s.fareCard}>
                  {fare.lines.map((l) => (
                    <div key={l.concepto} className={s.fareRow}>
                      <span>{l.label}</span>
                      <span>{formatPEN(l.amount)}</span>
                    </div>
                  ))}
                  <div className={`${s.fareRow} ${s.fareTotal}`}>
                    <span>Total a cobrar</span>
                    <span>{formatPEN(fare.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
