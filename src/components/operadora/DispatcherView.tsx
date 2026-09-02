'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X, MapPin, Navigation, Search, Check, Loader, Car, User, Clock,
} from 'lucide-react';
import styles from './Operadora.module.css';
import { UNITS, DRIVERS, UNIT_POSITIONS, CITY_BOUNDS, formatPEN, formatKm } from '@/data';
import type { Coordinates, Unit } from '@/data';

type DispatchPhase =
  | 'idle'
  | 'expanding'      // Radio expanding on map
  | 'searching'      // "Buscando conductor..."
  | 'found'          // "Conductor encontrado"
  | 'accepted'       // "Carrera aceptada"
  | 'en-route'       // "En camino"
  | 'results'        // Legacy: manual result list
  | 'assigned';      // Final confirmation

type Props = {
  origin: Coordinates | null;
  destination: Coordinates | null;
  onSetOrigin: (c: Coordinates | null) => void;
  onSetDestination: (c: Coordinates | null) => void;
  onClose: () => void;
  onSearchRadiusChange: (radius: number | null) => void;
  onSearchOriginChange: (origin: Coordinates | null) => void;
  onHighlightUnit: (unitId: string | null) => void;
  selectingLocation: 'origin' | 'destination' | null;
  onSelectLocation: (loc: 'origin' | 'destination' | null) => void;
};

function distanceBetween(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function formatCoords(c: Coordinates): string {
  return `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`;
}

function estimateFare(km: number): number {
  const base = 4.5;
  const perKm = 1.8;
  return +(base + km * perKm).toFixed(2);
}

const STATUS_COLOR: Record<Unit['status'], string> = {
  active: 'var(--unit-active)',
  'on-trip': 'var(--unit-trip)',
  break: 'var(--unit-break)',
  offline: 'var(--fg-subtle)',
  blocked: 'var(--danger)',
};

const PHASE_LABELS: Record<DispatchPhase, string> = {
  idle: '',
  expanding: 'Expandiendo radio de búsqueda…',
  searching: 'Buscando conductor disponible…',
  found: 'Conductor encontrado',
  accepted: 'Carrera aceptada',
  'en-route': 'En camino al cliente',
  results: '',
  assigned: 'Carrera asignada',
};

const PHASE_ICONS: Record<string, typeof Search> = {
  expanding: Loader,
  searching: Search,
  found: User,
  accepted: Check,
  'en-route': Car,
};

export function DispatcherView({
  origin,
  destination,
  onSetOrigin,
  onSetDestination,
  onClose,
  onSearchRadiusChange,
  onSearchOriginChange,
  onHighlightUnit,
  selectingLocation,
  onSelectLocation,
}: Props) {
  const [assignedUnit, setAssignedUnit] = useState<Unit | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchPhase, setSearchPhase] = useState<DispatchPhase>('idle');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  
  // Simulated street names for the UI
  const [originAddress, setOriginAddress] = useState<string>('');
  const [destAddress, setDestAddress] = useState<string>('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* Escape key closes */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Generate random street name on coordinate change
  useEffect(() => {
    if (origin) {
      const streets = ['Jr. San Román', 'Av. Circunvalación', 'Jr. Huancané', 'Av. San Martín', 'Jr. Moquegua', 'Jr. Piura', 'Av. Mártires 4 de Nov.', 'Jr. Jáuregui', 'Terminal Terrestre', 'Mercado Túpac Amaru', 'Plaza Bolognesi'];
      const randomStreet = streets[Math.floor(Math.random() * streets.length)];
      const randomNum = Math.floor(Math.random() * 1000) + 100;
      setOriginAddress(`${randomStreet} ${randomNum}`);
    } else {
      setOriginAddress('');
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      const streets = ['Av. Tacna', 'Jr. Cusco', 'Jr. Apurímac', 'Real Plaza', 'Hospital Carlos Monge', 'Av. Triunfo', 'Jr. Mariano Melgar', 'Parque El Triciclista', 'Av. Independencia', 'Jr. Sandia'];
      const randomStreet = streets[Math.floor(Math.random() * streets.length)];
      const randomNum = Math.floor(Math.random() * 1000) + 100;
      setDestAddress(`${randomStreet} ${randomNum}`);
    } else {
      setDestAddress('');
    }
  }, [destination]);

  const effectiveOrigin = useMemo(() => {
    if (origin) return origin;
    return null;
  }, [origin]);

  const distanceKm = useMemo(() => {
    const dest = destination;
    if (effectiveOrigin && dest) return +distanceBetween(effectiveOrigin, dest).toFixed(1);
    return null;
  }, [effectiveOrigin, destination]);

  const fareEstimate = useMemo(() => {
    if (distanceKm !== null) return estimateFare(distanceKm);
    return null;
  }, [distanceKm]);

  /* ── Full automated dispatch flow ─── */
  const startDispatch = useCallback(() => {
    if (!effectiveOrigin) return;
    setSearching(true);
    setSearchPhase('expanding');
    setSelectedUnit(null);
    setAssignedUnit(null);
    onSearchOriginChange(effectiveOrigin);
    onHighlightUnit(null);

    let radius = 0;
    intervalRef.current = setInterval(() => {
      radius += 8;
      if (radius >= 500) radius = 500;
      onSearchRadiusChange(radius);

      if (radius >= 300) setSearchPhase('searching');

      if (radius >= 400 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        // Find nearest available unit
        const available = UNITS.filter(u => u.status === 'active' && u.driverId !== null);
        const withDist = available.map(u => ({
          unit: u,
          dist: distanceBetween(effectiveOrigin, UNIT_POSITIONS[u.id] ?? effectiveOrigin),
        }));
        withDist.sort((a, b) => a.dist - b.dist);
        const chosen = withDist[0]?.unit ?? null;

        // Phase: "Conductor encontrado" after 1.5s
        const t1 = setTimeout(() => {
          setSearchPhase('found');
          setSearching(false);
          if (chosen) {
            setSelectedUnit(chosen);
            onHighlightUnit(chosen.id);
          }
        }, 1500);

        // Phase: "Carrera aceptada" after 3.5s
        const t2 = setTimeout(() => {
          setSearchPhase('accepted');
        }, 3500);

        // Phase: "En camino" after 5s
        const t3 = setTimeout(() => {
          setSearchPhase('en-route');
          // Fade out search radius
          let fadeR = 500;
          const fadeInterval = setInterval(() => {
            fadeR -= 15;
            if (fadeR <= 0) {
              onSearchRadiusChange(null);
              onSearchOriginChange(null);
              clearInterval(fadeInterval);
            } else {
              onSearchRadiusChange(fadeR);
            }
          }, 30);
        }, 5000);

        // Phase: "Assigned" final confirmation after 7s
        const t4 = setTimeout(() => {
          if (chosen) {
            setAssignedUnit(chosen);
            setSearchPhase('assigned');
          }
        }, 7000);

        timeoutsRef.current = [t1, t2, t3, t4];
      }
    }, 50);
  }, [effectiveOrigin, onSearchRadiusChange, onSearchOriginChange, onHighlightUnit]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  /* Auto-close after final assignment */
  useEffect(() => {
    if (assignedUnit && searchPhase === 'assigned') {
      const t = setTimeout(() => {
        onHighlightUnit(null);
        onClose();
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [assignedUnit, searchPhase, onClose, onHighlightUnit]);

  const driverName = (unit: Unit) => {
    if (!unit.driverId) return 'Sin conductor';
    return DRIVERS.find(d => d.id === unit.driverId)?.name ?? 'Sin conductor';
  };

  const nearestDist = (unit: Unit) => {
    if (!effectiveOrigin) return '—';
    const d = distanceBetween(effectiveOrigin, UNIT_POSITIONS[unit.id] ?? effectiveOrigin);
    return `${d.toFixed(1)} km`;
  };

  /* Status indicator component */
  const StatusIndicator = () => {
    if (searchPhase === 'idle' || searchPhase === 'results') return null;
    const label = PHASE_LABELS[searchPhase];
    const IconComp = PHASE_ICONS[searchPhase] ?? Loader;
    const isActive = ['expanding', 'searching'].includes(searchPhase);
    const isSuccess = ['found', 'accepted', 'en-route', 'assigned'].includes(searchPhase);

    return (
      <div className={styles.dispatchStatus} data-success={isSuccess || undefined}>
        <div className={styles.dispatchStatus__icon} data-spin={isActive || undefined}>
          <IconComp size={18} />
        </div>
        <div className={styles.dispatchStatus__info}>
          <div className={styles.dispatchStatus__label}>{label}</div>
          {selectedUnit && searchPhase !== 'expanding' && searchPhase !== 'searching' && (
            <div className={styles.dispatchStatus__detail}>
              <span className={styles.dispatchStatus__placa}>{selectedUnit.placa}</span>
              <span className={styles.dispatchStatus__driver}>{driverName(selectedUnit)}</span>
            </div>
          )}
        </div>
        {/* Phase timeline dots */}
        <div className={styles.dispatchTimeline}>
          {(['expanding', 'searching', 'found', 'accepted', 'en-route'] as DispatchPhase[]).map((ph, i) => {
            const phases: DispatchPhase[] = ['expanding', 'searching', 'found', 'accepted', 'en-route'];
            const currentIdx = phases.indexOf(searchPhase);
            const thisIdx = i;
            return (
              <div key={ph} className={styles.dispatchTimeline__dot}
                data-active={thisIdx <= currentIdx || undefined}
                data-current={thisIdx === currentIdx || undefined}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className={styles.assignPanelOverlay} 
        onClick={selectingLocation ? undefined : onClose} 
        style={{ pointerEvents: selectingLocation ? 'none' : 'auto', opacity: selectingLocation ? 0 : 1 }}
      />
      <div className={styles.assignPanel}>
        <div className={styles.assignPanel__header}>
          <div className={styles.assignPanel__title}>Nueva asignación</div>
          <button className={styles.assignPanel__close} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.assignPanel__body}>
          {assignedUnit && searchPhase === 'assigned' ? (
            <div className={styles.assignedConfirm}>
              <div className={styles.assignedConfirm__check}>
                <Check size={32} color="var(--success)" />
              </div>
              <div className={styles.assignedConfirm__title}>Carrera asignada</div>
              <div className={styles.assignedConfirm__placa}>{assignedUnit.placa}</div>
              <div className={styles.assignedConfirm__sub}>{driverName(assignedUnit)}</div>
              <div className={styles.assignedConfirm__sub} style={{ opacity: 0.6 }}>
                <Clock size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
                Cerrando automáticamente…
              </div>
            </div>
          ) : (
            <>
              {/* Origin */}
              <div className={styles.assignField}>
                <div className={styles.assignField__label}>Origen</div>
                <div 
                  className={styles.assignField__input} 
                  style={{ cursor: 'pointer', border: selectingLocation === 'origin' ? '1px solid var(--accent)' : undefined }}
                  onClick={() => onSelectLocation(selectingLocation === 'origin' ? null : 'origin')}
                >
                  <MapPin size={14} color="var(--success)" />
                  <div style={{ flex: 1, color: origin ? 'var(--fg)' : 'var(--fg-subtle)', fontSize: 14, fontWeight: origin ? 600 : 400 }}>
                    {origin ? originAddress : (selectingLocation === 'origin' ? 'Haz clic en el mapa...' : 'Seleccionar origen')}
                  </div>
                </div>
                {origin && <div className={styles.assignField__coords}>{formatCoords(origin)}</div>}
              </div>

              {/* Destination */}
              <div className={styles.assignField}>
                <div className={styles.assignField__label}>Destino</div>
                <div 
                  className={styles.assignField__input}
                  style={{ cursor: 'pointer', border: selectingLocation === 'destination' ? '1px solid var(--accent)' : undefined }}
                  onClick={() => onSelectLocation(selectingLocation === 'destination' ? null : 'destination')}
                >
                  <Navigation size={14} color="var(--danger)" />
                  <div style={{ flex: 1, color: destination ? 'var(--fg)' : 'var(--fg-subtle)', fontSize: 14, fontWeight: destination ? 600 : 400 }}>
                    {destination ? destAddress : (selectingLocation === 'destination' ? 'Haz clic en el mapa...' : 'Seleccionar destino')}
                  </div>
                </div>
                {destination && <div className={styles.assignField__coords}>{formatCoords(destination)}</div>}
              </div>

              {/* Fare estimate */}
              {distanceKm !== null && fareEstimate !== null && (
                <div className={styles.assignFare}>
                  <div>
                    <div className={styles.assignFare__label}>Distancia</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{formatKm(distanceKm)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.assignFare__label}>Tarifa est.</div>
                    <div className={styles.assignFare__value}>{formatPEN(fareEstimate)}</div>
                  </div>
                </div>
              )}

              {/* Status indicator */}
              <StatusIndicator />

              {/* Search button */}
              {searchPhase === 'idle' && (
                <button className={styles.assignTriggerBtn}
                  style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}
                  onClick={startDispatch} disabled={!effectiveOrigin}>
                  <Search size={16} />
                  Buscar conductor cercano
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
