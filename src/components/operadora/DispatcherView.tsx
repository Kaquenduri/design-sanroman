'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  Clock,
  Crosshair,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  PanelLeftOpen,
  PanelRightOpen,
  Search,
  Smartphone,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import {
  Avatar,
  Button,
  Chip,
  Empty,
  IconButton,
  Legs,
  Plate,
  Segmented,
  Stat,
  Synthetic,
  UnitBadge,
} from '@/components/ui';
import {
  DRIVERS,
  findCustomerByPhone,
  REQUESTS_INITIAL,
  UNITS,
  UNIT_POSITIONS,
  formatClock,
  formatKm,
  formatPEN,
  type PendingRequest,
} from '@/data';
import { seededPoint } from '@/lib/city';
import {
  JULIACA_BOUNDS,
  JULIACA_CENTER,
  geoDistanceKm,
  geoToWorld,
  isInsideJuliaca,
  localPlace,
  worldToGeo,
  type GeoPoint,
  type PlaceResult,
} from '@/lib/juliaca';
import type { MapFocus } from './JuliacaMap';
import { useRoadRoute } from '@/hooks/useRoadRoute';
import {
  OFFER_SECONDS,
  advanceDispatchCandidate,
  createDispatchJob,
  startDispatchCascade,
  subscribeDispatchJobs,
  type DispatchJob,
} from '@/lib/dispatch';
import s from './Operadora.module.css';

const JuliacaMap = dynamic(
  () => import('./JuliacaMap').then((module) => module.JuliacaMap),
  { ssr: false }
);

type QueueFilter = 'all' | 'pending' | 'assigned';
type PickingMode = 'new-pickup' | 'new-destination' | 'selected' | null;
type PaymentMethod = PendingRequest['paymentMethod'];
type SearchField = 'pickup' | 'destination';
type UnitMapFilter = 'all' | 'active' | 'on-trip' | 'offline' | 'blocked';

const NEW_PICKUP = seededPoint(801);

const INITIAL_DRAFT = {
  passengerName: '',
  passengerPhone: '',
  pickupAddress: '',
  destinationAddress: '',
  fare: '10.00',
  paymentMethod: 'efectivo' as PaymentMethod,
  unitId: '',
  pickup: NEW_PICKUP,
  pickupGeo: worldToGeo(NEW_PICKUP),
  destinationGeo: null as GeoPoint | null,
  pickupConfirmed: false,
  destinationConfirmed: false,
};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'CL'
  );
}

/** Unidad activa, libre en la cola y más cercana al recojo. */
function nearestUnit(point: GeoPoint, requests: PendingRequest[], jobs: DispatchJob[]) {
  const busyIds = new Set(
    requests
      .filter((request) => {
        const job = jobs.find((item) => item.id === request.id);
        return !job || !['finalizado', 'cancelado'].includes(job.status);
      })
      .map((request) => request.assignedUnitId)
      .filter(Boolean)
  );
  let best: { id: string; distance: number } | null = null;

  for (const unit of UNITS) {
    if (unit.status !== 'active' || busyIds.has(unit.id)) continue;
    const distance = geoDistanceKm(worldToGeo(UNIT_POSITIONS[unit.id]), point);
    if (!best || distance < best.distance) best = { id: unit.id, distance };
  }
  return best;
}

export function DispatcherView() {
  const [requests, setRequests] = useState<PendingRequest[]>(REQUESTS_INITIAL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [unitFilter, setUnitFilter] = useState<UnitMapFilter>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const queueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [tick, setTick] = useState(0);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [picking, setPicking] = useState<PickingMode>(null);
  const [mapCenter, setMapCenter] = useState<GeoPoint>(JULIACA_CENTER);
  const [mapFocus, setMapFocus] = useState<MapFocus>({
    point: JULIACA_CENTER,
    zoom: 14,
    key: 0,
  });
  const [searching, setSearching] = useState<SearchField | null>(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [jobs, setJobs] = useState<DispatchJob[]>([]);

  useEffect(() => subscribeDispatchJobs(setJobs), []);

  useEffect(() => () => {
    if (queueTimer.current) clearTimeout(queueTimer.current);
    if (detailTimer.current) clearTimeout(detailTimer.current);
  }, []);

  useEffect(() => {
    setNowMs(Date.now());
    const id = setInterval(() => {
      setTick((value) => value + 1);
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'pending')
      return requests.filter((item) => !item.assignedUnitId);
    if (filter === 'assigned')
      return requests.filter((item) => item.assignedUnitId);
    return requests;
  }, [filter, requests]);

  const selected = requests.find((item) => item.id === selectedId) ?? null;
  const selectedJob = jobs.find((job) => job.id === selectedId) ?? null;
  const effectiveAssignedId = selectedJob?.assignedUnitId ?? selected?.assignedUnitId;
  const assignedUnit = effectiveAssignedId
    ? UNITS.find((unit) => unit.id === effectiveAssignedId) ?? null
    : null;
  const assignedDriver = assignedUnit
    ? DRIVERS.find((driver) => driver.id === assignedUnit.driverId) ?? null
    : null;
  const selectedPickupGeo = selected
    ? selected.pickupGeo ?? worldToGeo(selected.pickup)
    : null;
  const suggestion =
    selected && selectedPickupGeo && !assignedUnit
      ? nearestUnit(selectedPickupGeo, requests, jobs)
      : null;
  const suggestedUnit = suggestion
    ? UNITS.find((unit) => unit.id === suggestion.id) ?? null
    : null;
  const suggestedDriver = suggestedUnit
    ? DRIVERS.find((driver) => driver.id === suggestedUnit.driverId) ?? null
    : null;
  const activeUnitId = selectedUnitId ?? assignedUnit?.id ?? selectedJob?.offer?.unitId ?? suggestedUnit?.id ?? null;
  const selectedDestinationGeo = selected
    ? selected.destinationGeo ?? worldToGeo(selected.destination)
    : null;
  const activeUnitGeo = activeUnitId ? worldToGeo(UNIT_POSITIONS[activeUnitId]) : null;
  const pickupRoute = useRoadRoute(activeUnitGeo, selectedPickupGeo);
  const serviceRoute = useRoadRoute(selectedPickupGeo, selectedDestinationGeo);

  useEffect(() => {
    if (!selectedJob?.assignedUnitId) return;
    setRequests((items) => items.map((item) => item.id === selectedJob.id ? { ...item, assignedUnitId: selectedJob.assignedUnitId } : item));
  }, [selectedJob?.assignedUnitId, selectedJob?.id]);

  useEffect(() => {
    if (selectedJob?.status !== 'ofertando' || !selectedJob.offer) return;
    if (nowMs !== null && selectedJob.offer.expiresAt <= nowMs) advanceDispatchCandidate(selectedJob.id, 'vencida');
  }, [selectedJob, nowMs]);

  const availableUnits = UNITS.filter(
    (unit) =>
      unit.status === 'active' &&
      !requests.some(
        (request) =>
          request.assignedUnitId === unit.id && request.id !== selectedId
      )
  );

  const visibleUnits = unitFilter === 'all'
    ? UNITS
    : UNITS.filter((unit) => unit.status === unitFilter);

  const revealQueue = (autoClose = true) => {
    setQueueOpen(true);
    if (queueTimer.current) clearTimeout(queueTimer.current);
    if (autoClose) queueTimer.current = setTimeout(() => setQueueOpen(false), 6500);
  };

  const revealDetail = (autoClose = true) => {
    setDetailOpen(true);
    if (detailTimer.current) clearTimeout(detailTimer.current);
    if (autoClose) detailTimer.current = setTimeout(() => setDetailOpen(false), 8500);
  };

  const selectRequest = (id: string) => {
    setSelectedId(id);
    setSelectedUnitId(null);
    const request = requests.find((item) => item.id === id);
    if (request) focusMap(request.pickupGeo ?? worldToGeo(request.pickup), 16);
    setQueueOpen(false);
    revealDetail();
  };

  const selectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    focusMap(worldToGeo(UNIT_POSITIONS[unitId]), 17);
  };

  const updateSelected = (change: Partial<PendingRequest>) => {
    if (!selectedId) return;
    setRequests((items) =>
      items.map((item) =>
        item.id === selectedId ? { ...item, ...change } : item
      )
    );
  };

  const assign = () => {
    if (!selectedJob || !suggestedUnit) return;
    startDispatchCascade(selectedJob.id, suggestedUnit.id);
  };

  const focusMap = (point: GeoPoint, zoom = 17) => {
    setMapCenter(point);
    setMapFocus((current) => ({ point, zoom, key: current.key + 1 }));
  };

  const lookupCustomer = () => {
    const phone = draft.passengerPhone.replace(/\D/g, '');
    if (phone.length < 9) {
      setCustomerMessage('Ingresa los 9 dígitos para consultar el padrón.');
      return;
    }
    const customer = findCustomerByPhone(phone);
    if (!customer) {
      setCustomerMessage('Cliente nuevo · completa su nombre para registrarlo.');
      return;
    }
    setDraft((current) => ({
      ...current,
      passengerName: customer.name,
      pickupAddress: current.pickupAddress || customer.usualReference,
    }));
    setCustomerMessage(
      `Cliente registrado · ${customer.trips} servicios anteriores.`
    );
  };

  const resolvePlace = async (query: string): Promise<PlaceResult | null> => {
    const local = localPlace(query);
    if (local) return local;

    const params = new URLSearchParams({
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'pe',
      bounded: '1',
      viewbox: [
        JULIACA_BOUNDS.west,
        JULIACA_BOUNDS.north,
        JULIACA_BOUNDS.east,
        JULIACA_BOUNDS.south,
      ].join(','),
      q: `${query}, Juliaca, Puno, Perú`,
    });
    const geocoder = (process.env.NEXT_PUBLIC_GEOCODER_URL || 'https://nominatim.openstreetmap.org').replace(/\/$/, '');
    const response = await fetch(
      `${geocoder}/search?${params.toString()}`,
      { headers: { 'Accept-Language': 'es-PE,es' } }
    );
    if (!response.ok) throw new Error('No se pudo consultar el mapa.');
    const results = (await response.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    const first = results[0];
    if (!first) return null;
    const point = { lat: Number(first.lat), lng: Number(first.lon) };
    if (!isInsideJuliaca(point)) return null;
    const parts = first.display_name.split(',').map((part) => part.trim());
    return {
      label: parts.slice(0, 2).join(', '),
      detail: parts.slice(2, 5).join(', '),
      point,
    };
  };

  const applyPlace = (field: SearchField, place: PlaceResult) => {
    setDraft((current) => ({
      ...current,
      ...(field === 'pickup'
        ? {
            pickupAddress: place.label,
            pickupGeo: place.point,
            pickup: geoToWorld(place.point),
            pickupConfirmed: false,
          }
        : {
            destinationAddress: place.label,
            destinationGeo: place.point,
            destinationConfirmed: false,
          }),
    }));
    setPicking(field === 'pickup' ? 'new-pickup' : 'new-destination');
    setSearchMessage(`${place.label} · ajusta el pin y confirma.`);
    focusMap(place.point);
  };

  const searchPlace = async (field: SearchField) => {
    const query =
      field === 'pickup' ? draft.pickupAddress : draft.destinationAddress;
    if (!query.trim()) {
      setSearchMessage('Escribe una dirección o referencia de Juliaca.');
      return;
    }
    setSearching(field);
    setSearchMessage('Buscando dentro de Juliaca…');
    try {
      const place = await resolvePlace(query);
      if (!place) {
        setSearchMessage('No encontramos esa referencia dentro de Juliaca.');
        return;
      }
      applyPlace(field, place);
    } catch {
      setSearchMessage(
        'El mapa no respondió. Puedes ubicar el punto manualmente.'
      );
      setPicking(field === 'pickup' ? 'new-pickup' : 'new-destination');
    } finally {
      setSearching(null);
    }
  };

  const startPicking = (mode: Exclude<PickingMode, null>) => {
    const point =
      mode === 'new-pickup'
        ? draft.pickupGeo
        : mode === 'new-destination'
          ? draft.destinationGeo ?? JULIACA_CENTER
          : selectedPickupGeo ?? JULIACA_CENTER;
    focusMap(point);
    setPicking(mode);
    setSearchMessage('Mueve el mapa hasta el punto exacto y confirma.');
  };

  const confirmMapPoint = () => {
    if (picking === 'new-pickup') {
      setDraft((current) => ({
        ...current,
        pickup: geoToWorld(mapCenter),
        pickupGeo: mapCenter,
        pickupConfirmed: true,
      }));
    }
    if (picking === 'new-destination') {
      setDraft((current) => ({
        ...current,
        destinationGeo: mapCenter,
        destinationConfirmed: true,
      }));
    }
    if (picking === 'selected') {
      updateSelected({ pickup: geoToWorld(mapCenter), pickupGeo: mapCenter });
    }
    setSearchMessage('Punto exacto confirmado.');
    setPicking(null);
  };

  const registerCall = () => {
    if (
      !draft.passengerName.trim() ||
      !draft.passengerPhone.trim() ||
      !draft.pickupAddress.trim() ||
      !draft.destinationAddress.trim() ||
      !draft.pickupConfirmed ||
      !draft.destinationGeo
    ) {
      setSearchMessage(
        'Completa los datos y confirma el punto exacto de recojo y destino.'
      );
      return;
    }

    const nextNumber =
      Math.max(...requests.map((request) => Number(request.id))) + 1;
    const destinationGeo = draft.destinationGeo;
    const destination = geoToWorld(destinationGeo);
    const distanceKm = geoDistanceKm(draft.pickupGeo, destinationGeo) * 1.28;
    const next: PendingRequest = {
      id: String(nextNumber),
      passengerName: draft.passengerName.trim(),
      passengerPhone: draft.passengerPhone.trim(),
      passengerRating: 0,
      passengerSeed: initials(draft.passengerName),
      pickupAddress: draft.pickupAddress.trim(),
      destinationAddress: draft.destinationAddress.trim(),
      pickup: draft.pickup,
      destination,
      pickupGeo: draft.pickupGeo,
      destinationGeo,
      distanceKm,
      categoryId: 'SEDAN',
      fareEstimate: Math.max(0, Number(draft.fare) || 0),
      paymentMethod: draft.paymentMethod,
      waitSeconds: 0,
      createdAtTick: tick,
      source: 'telefono',
      assignedUnitId: draft.unitId || null,
    };

    setRequests((items) => [next, ...items]);
    const busyIds = new Set(requests.filter((request) => {
      const job = jobs.find((item) => item.id === request.id);
      return !job || !['finalizado', 'cancelado'].includes(job.status);
    }).map((request) => request.assignedUnitId).filter(Boolean));
    const candidates = UNITS.filter((unit) => unit.status === 'active' && !busyIds.has(unit.id))
      .sort((a, b) => geoDistanceKm(worldToGeo(UNIT_POSITIONS[a.id]), draft.pickupGeo) - geoDistanceKm(worldToGeo(UNIT_POSITIONS[b.id]), draft.pickupGeo))
      .map((unit) => unit.id);
    createDispatchJob({
      id: next.id,
      passengerName: next.passengerName,
      passengerPhone: next.passengerPhone,
      pickupAddress: next.pickupAddress,
      destinationAddress: next.destinationAddress,
      pickup: draft.pickupGeo,
      destination: destinationGeo,
      fare: next.fareEstimate,
      paymentMethod: next.paymentMethod,
      candidateUnitIds: candidates,
    });
    startDispatchCascade(next.id, draft.unitId || undefined);
    setSelectedId(next.id);
    setDraft(INITIAL_DRAFT);
    setIntakeOpen(false);
    setPicking(null);
    revealQueue();
    setTimeout(() => {
      setQueueOpen(false);
      revealDetail();
    }, 2400);
  };

  return (
    <div className={s.dispatcher}>
      <aside className={`${s.col} ${s.colQueue} ${queueOpen ? s.drawerOpen : s.drawerClosed}`} aria-label="Cola de llamadas">
        <div className={s.colHead}>
          <div className={s.queueHeadRow}>
            <div>
              <div className={s.colTitle}>
                Llamadas
                <Chip tone="brand">{requests.length}</Chip>
              </div>
              <div className={s.colSub}>
                {requests.filter((item) => !item.assignedUnitId).length} por
                asignar
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setIntakeOpen((value) => !value);
                setPicking(null);
              }}
            >
              {intakeOpen ? <X size={15} /> : <PhoneCall size={15} />}
              {intakeOpen ? 'Cerrar' : 'Nueva llamada'}
            </Button>
            <IconButton variant="neutral" size="sm" onClick={() => setQueueOpen(false)} aria-label="Ocultar llamadas">
              <X size={15} />
            </IconButton>
          </div>
        </div>

        {intakeOpen ? (
          <div className={s.intake}>
            <div className={s.intakeIntro}>
              <span className={s.intakeIcon}>
                <PhoneCall size={18} />
              </span>
              <span>
                <strong>Registrar servicio</strong>
                <small>Completa los datos mientras atiendes la llamada.</small>
              </span>
            </div>

            <label className={s.formField}>
              <span>Nombre del cliente</span>
              <span className={s.inputWrap}>
                <UserRound size={15} />
                <input
                  value={draft.passengerName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      passengerName: event.target.value,
                    }))
                  }
                  placeholder="Ej. Julia Mamani"
                />
              </span>
            </label>

            <label className={s.formField}>
              <span>Celular</span>
              <span className={s.inputWrap}>
                <Phone size={15} />
                <input
                  type="tel"
                  value={draft.passengerPhone}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      passengerPhone: event.target.value,
                    }))
                  }
                  onBlur={lookupCustomer}
                  placeholder="987 654 321"
                />
                <button
                  type="button"
                  className={s.inputAction}
                  onClick={lookupCustomer}
                  aria-label="Consultar cliente por celular"
                >
                  <Search size={15} />
                </button>
              </span>
            </label>
            {customerMessage && (
              <div className={s.lookupStatus}>
                <BadgeCheck size={14} /> {customerMessage}
                <Synthetic>Padrón demo</Synthetic>
              </div>
            )}

            <label className={s.formField}>
              <span>Lugar de recojo</span>
              <span className={s.inputWrap}>
                <MapPin size={15} />
                <input
                  value={draft.pickupAddress}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      pickupAddress: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void searchPlace('pickup');
                  }}
                  placeholder="Calle, número o referencia"
                />
                <button
                  type="button"
                  className={s.inputAction}
                  onClick={() => void searchPlace('pickup')}
                  aria-label="Buscar lugar de recojo en Juliaca"
                >
                  {searching === 'pickup' ? (
                    <LoaderCircle className={s.spinning} size={15} />
                  ) : (
                    <Search size={15} />
                  )}
                </button>
              </span>
            </label>
            <Button
              variant={picking === 'new-pickup' ? 'primary' : 'outline'}
              size="sm"
              full
              onClick={() => startPicking('new-pickup')}
            >
              <Crosshair size={15} />
              {picking === 'new-pickup'
                ? 'Mueve el mapa y confirma'
                : draft.pickupConfirmed
                  ? 'Recojo confirmado · corregir'
                  : 'Marcar punto exacto de recojo'}
            </Button>

            <label className={s.formField}>
              <span>Destino</span>
              <span className={s.inputWrap}>
                <Navigation size={15} />
                <input
                  value={draft.destinationAddress}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      destinationAddress: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void searchPlace('destination');
                  }}
                  placeholder="Destino o referencia"
                />
                <button
                  type="button"
                  className={s.inputAction}
                  onClick={() => void searchPlace('destination')}
                  aria-label="Buscar destino en Juliaca"
                >
                  {searching === 'destination' ? (
                    <LoaderCircle className={s.spinning} size={15} />
                  ) : (
                    <Search size={15} />
                  )}
                </button>
              </span>
            </label>
            <Button
              variant={picking === 'new-destination' ? 'primary' : 'outline'}
              size="sm"
              full
              onClick={() => startPicking('new-destination')}
            >
              <Navigation size={15} />
              {picking === 'new-destination'
                ? 'Mueve el mapa y confirma'
                : draft.destinationConfirmed
                  ? 'Destino confirmado · corregir'
                  : 'Ubicar destino en el mapa'}
            </Button>

            {searchMessage && (
              <div className={s.mapFormStatus}>
                <MapPin size={14} /> {searchMessage}
              </div>
            )}

            <div className={s.formGrid}>
              <label className={s.formField}>
                <span>Precio acordado</span>
                <span className={s.inputWrap}>
                  <span className={s.currency}>S/</span>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={draft.fare}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        fare: event.target.value,
                      }))
                    }
                  />
                </span>
              </label>
              <label className={s.formField}>
                <span>Unidad</span>
                <select
                  className={s.select}
                  value={draft.unitId}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      unitId: event.target.value,
                    }))
                  }
                >
                  <option value="">Asignar luego</option>
                  {availableUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Unidad {unit.n} · {unit.placa}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={s.formField}>
              <span>Forma de pago</span>
              <PaymentChoice
                value={draft.paymentMethod}
                onChange={(paymentMethod) =>
                  setDraft((current) => ({ ...current, paymentMethod }))
                }
              />
            </div>

            <Button size="md" full onClick={registerCall}>
              <Check size={16} /> Registrar servicio
            </Button>
          </div>
        ) : (
          <>
            <div className={s.colFilters}>
              <Segmented
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'Todas', count: requests.length },
                  {
                    value: 'pending',
                    label: 'Por asignar',
                    count: requests.filter((item) => !item.assignedUnitId)
                      .length,
                  },
                  {
                    value: 'assigned',
                    label: 'Asignadas',
                    count: requests.filter((item) => item.assignedUnitId).length,
                  },
                ]}
              />
            </div>

            <div className={s.colList}>
              {filtered.length === 0 ? (
                <Empty
                  icon={<PhoneCall size={20} />}
                  title="Sin llamadas en esta vista"
                >
                  Registra una llamada o cambia el filtro.
                </Empty>
              ) : (
                filtered.map((request) => {
                  const active = request.id === selectedId;
                  const wait =
                    request.createdAtTick === undefined
                      ? request.waitSeconds + tick
                      : tick - request.createdAtTick;
                  const hot = wait > 100;
                  return (
                    <button
                      key={request.id}
                      className={`${s.qItem} ${active ? s.qActive : ''}`}
                      onClick={() => selectRequest(request.id)}
                      aria-pressed={active}
                    >
                      <div className={s.qTop}>
                        <span className={s.qId}>#{request.id}</span>
                        <PhoneCall size={12} opacity={0.7} />
                        <span
                          className={`${s.qWait} ${
                            hot && !active ? s.qWaitHot : ''
                          }`}
                        >
                          <Clock size={10} /> {formatClock(wait)}
                        </span>
                      </div>
                      <div className={s.qName}>{request.passengerName}</div>
                      <div className={s.qPhone}>{request.passengerPhone}</div>
                      <div className={s.qRoute}>
                        <MapPin size={11} />
                        <span className={s.qRouteText}>
                          {request.pickupAddress}
                        </span>
                      </div>
                      <div className={s.qRoute}>
                        <Navigation size={11} />
                        <span className={s.qRouteText}>
                          {request.destinationAddress}
                        </span>
                      </div>
                      <div className={s.qFoot}>
                        <span className={s.qFare}>
                          {formatPEN(request.fareEstimate)}
                        </span>
                        <span className={s.qPayment}>
                          {request.paymentMethod === 'yape' ? (
                            <Smartphone size={12} />
                          ) : (
                            <Banknote size={12} />
                          )}
                          {request.paymentMethod === 'yape'
                            ? 'Yape'
                            : 'Efectivo'}
                        </span>
                        {request.assignedUnitId ? (
                          <span className={s.qAssign}>
                            <UnitBadge
                              n={
                                UNITS.find(
                                  (unit) =>
                                    unit.id === request.assignedUnitId
                                )?.n ?? '—'
                              }
                              size="sm"
                            />
                          </span>
                        ) : (
                          <span className={`${s.qAssign} ${s.qUnassigned}`}>
                            Sin asignar <ArrowRight size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </aside>

      <section className={s.mapZone} aria-label="Mapa interactivo de Juliaca">
        <JuliacaMap
          units={visibleUnits}
          unitPositions={UNIT_POSITIONS}
          requests={requests}
          selectedId={selectedId}
          activeUnitId={activeUnitId}
          picking={Boolean(picking)}
          focus={mapFocus}
          onCenterChange={setMapCenter}
          onSelectRequest={selectRequest}
          onSelectUnit={selectUnit}
          pickupRoute={pickupRoute.route?.points ?? []}
          serviceRoute={serviceRoute.route?.points ?? []}
        />

        <div className={s.mapOverlayTop}>
          <span className={s.mapChip}>
            <span className={s.mapLiveDot} />
            Juliaca · {UNITS.length} unidades monitoreadas
          </span>
          <span className={s.mapChip}>
            {selected
              ? serviceRoute.route
                ? `${formatKm(serviceRoute.route.distanceMeters / 1000)} · ${Math.max(1, Math.ceil(serviceRoute.route.durationSeconds / 60))} min por calles`
                : serviceRoute.loading ? 'Calculando ruta vial…' : 'Ruta temporalmente no disponible'
              : 'Arrastra el mapa y usa la rueda para acercar'}
          </span>
        </div>

        <div className={s.mapPanelControls}>
          <button className={`${s.panelToggle} ${queueOpen ? s.panelToggleActive : ''}`} onClick={() => queueOpen ? setQueueOpen(false) : revealQueue(false)} aria-pressed={queueOpen}>
            <PanelLeftOpen size={18} />
            <span>Llamadas</span>
            <b>{requests.filter((item) => !item.assignedUnitId).length}</b>
          </button>
          <button className={`${s.panelToggle} ${detailOpen ? s.panelToggleActive : ''}`} onClick={() => detailOpen ? setDetailOpen(false) : revealDetail(false)} aria-pressed={detailOpen} disabled={!selected}>
            <PanelRightOpen size={18} />
            <span>Servicio</span>
          </button>
        </div>

        {picking && (
          <div className={s.operatorPicker}>
            <span className={s.operatorPickerLabel}>
              {picking === 'new-destination' ? 'Destino exacto' : 'Recojo exacto'}
              <small>
                {mapCenter.lat.toFixed(5)}, {mapCenter.lng.toFixed(5)}
              </small>
            </span>
            <span className={s.operatorPickerPin}>
              <MapPin size={25} />
            </span>
            <Button size="sm" onClick={confirmMapPoint}>
              <Check size={14} /> Confirmar punto exacto
            </Button>
          </div>
        )}

        <div className={s.mapLegend} aria-label="Filtrar unidades por estado">
          <Legend tone="all" value="all" active={unitFilter === 'all'} onClick={(value) => { setUnitFilter(value); setSelectedUnitId(null); }}>Todos</Legend>
          <Legend tone="success" value="active" active={unitFilter === 'active'} onClick={(value) => { setUnitFilter(value); setSelectedUnitId(null); }}>Disponibles</Legend>
          <Legend tone="brand" value="on-trip" active={unitFilter === 'on-trip'} onClick={(value) => { setUnitFilter(value); setSelectedUnitId(null); }}>Ocupados</Legend>
          <Legend tone="offline" value="offline" active={unitFilter === 'offline'} onClick={(value) => { setUnitFilter(value); setSelectedUnitId(null); }}>Sin señal</Legend>
          <Legend tone="danger" value="blocked" active={unitFilter === 'blocked'} onClick={(value) => { setUnitFilter(value); setSelectedUnitId(null); }}>Bloqueados</Legend>
        </div>

        <div className={s.unitTray} aria-label="Unidades en el mapa">
          <div className={s.unitTrayHead}>
            <span>Unidades</span>
            <small>{visibleUnits.length} visibles</small>
          </div>
          <div className={s.unitTrayList}>
            {visibleUnits.map((unit) => (
              <button key={unit.id} className={`${s.unitTrayItem} ${activeUnitId === unit.id ? s.unitTrayItemActive : ''}`} onClick={() => selectUnit(unit.id)} aria-pressed={activeUnitId === unit.id}>
                <span className={`${s.unitStatusDot} ${s[`unitStatus${unit.status}`]}`} />
                <UnitBadge n={unit.n} size="sm" />
                <span><strong>{unit.placa}</strong><small>{unit.marca} {unit.modelo}</small></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside
        className={`${s.col} ${s.colDetail} ${detailOpen ? s.drawerOpen : s.drawerClosed}`}
        aria-label="Detalle del servicio"
      >
        {!selected ? (
          <Empty
            icon={<PhoneCall size={20} />}
            title="Ninguna llamada seleccionada"
          >
            Selecciona un servicio o registra una nueva llamada.
          </Empty>
        ) : (
          <>
            <div className={s.colHead}>
              <div className={s.detailHeadRow}>
                <div>
                  <div className={s.colTitle}>{selected.passengerName}</div>
                  <div className={s.colSub}>#{selected.id} · llamada telefónica</div>
                </div>
                <IconButton variant="neutral" size="sm" onClick={() => setDetailOpen(false)} aria-label="Ocultar detalle">
                  <X size={15} />
                </IconButton>
              </div>
            </div>

            <div className={s.detailBody}>
              <div className={s.kpiPair}>
                <div className={s.kpiBox}>
                  <Stat
                    label="Precio acordado"
                    value={formatPEN(selected.fareEstimate)}
                    sub="Editable"
                    size="sm"
                  />
                </div>
                <div className={s.kpiBox}>
                  <Stat
                    label="Distancia"
                    value={formatKm(selected.distanceKm)}
                    sub="Estimación"
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
                <Button
                  variant={picking === 'selected' ? 'primary' : 'outline'}
                  size="sm"
                  full
                  onClick={() => startPicking('selected')}
                >
                  <Crosshair size={15} />
                  {picking === 'selected'
                    ? 'Mueve el mapa y confirma'
                    : 'Corregir recojo en mapa'}
                </Button>
              </div>

              <div className={s.detailSection}>
                <span className={s.sectionLabel}>Cliente</span>
                <div className={s.assignedTop}>
                  <Avatar initials={selected.passengerSeed} size={38} />
                  <div className={s.suggestionBody}>
                    <div className={s.suggestionName}>
                      {selected.passengerName}
                    </div>
                    <div className={s.suggestionMeta}>
                      {selected.passengerPhone}
                    </div>
                  </div>
                  <IconButton
                    variant="neutral"
                    size="sm"
                    aria-label="Llamar al cliente"
                  >
                    <Phone size={15} />
                  </IconButton>
                </div>
              </div>

              <div className={s.detailSection}>
                <span className={s.sectionLabel}>Cobro</span>
                <label className={s.formField}>
                  <span>Precio final</span>
                  <span className={s.inputWrap}>
                    <span className={s.currency}>S/</span>
                    <input
                      type="number"
                      min="0"
                      step="0.50"
                      value={selected.fareEstimate}
                      onChange={(event) =>
                        updateSelected({
                          fareEstimate: Math.max(
                            0,
                            Number(event.target.value) || 0
                          ),
                        })
                      }
                    />
                  </span>
                </label>
                <PaymentChoice
                  value={selected.paymentMethod}
                  onChange={(paymentMethod) =>
                    updateSelected({ paymentMethod })
                  }
                />
              </div>

              <div className={s.detailSection}>
                <span className={s.sectionLabel}>Unidad</span>
                {selectedJob?.status === 'ofertando' && selectedJob.offer && (
                  <div className={s.suggestion}>
                    <Clock size={20} />
                    <div className={s.suggestionBody}>
                      <div className={s.suggestionName}>Ofertando a Unidad {UNITS.find((unit) => unit.id === selectedJob.offer?.unitId)?.n}</div>
                      <div className={s.suggestionMeta}>Intento {selectedJob.offer.attempt} · {Math.max(0, Math.ceil((selectedJob.offer.expiresAt - (nowMs ?? selectedJob.offer.expiresAt)) / 1000))} s para responder</div>
                    </div>
                  </div>
                )}
                {assignedUnit && assignedDriver ? (
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
                    <label className={s.formField}>
                      <span>Cambiar unidad</span>
                      <select
                        className={s.select}
                        value={assignedUnit.id}
                        onChange={(event) =>
                          updateSelected({
                            assignedUnitId: event.target.value || null,
                          })
                        }
                      >
                        <option value="">Sin asignar</option>
                        {availableUnits.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            Unidad {unit.n} · {unit.placa}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : suggestedUnit && suggestedDriver && suggestion ? (
                  <>
                    <div className={s.suggestion}>
                      <UnitBadge n={suggestedUnit.n} size="md" />
                      <div className={s.suggestionBody}>
                        <div className={s.suggestionName}>
                          {suggestedDriver.name}
                        </div>
                        <div className={s.suggestionMeta}>
                          a {formatKm(suggestion.distance)} · aprox.{' '}
                          {Math.max(2, Math.ceil(suggestion.distance * 3.2))} min
                        </div>
                      </div>
                    </div>
                    <Button size="md" full onClick={assign} disabled={selectedJob?.status === 'ofertando'}>
                      <Zap size={16} /> {selectedJob?.status === 'ofertando' ? `Esperando respuesta · ${OFFER_SECONDS} s` : 'Buscar taxi cercano'}
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
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function PaymentChoice({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <div className={s.paymentChoice}>
      <button
        className={value === 'efectivo' ? s.paymentActive : ''}
        onClick={() => onChange('efectivo')}
        aria-pressed={value === 'efectivo'}
      >
        <Banknote size={16} /> Efectivo
      </button>
      <button
        className={value === 'yape' ? s.paymentActive : ''}
        onClick={() => onChange('yape')}
        aria-pressed={value === 'yape'}
      >
        <Smartphone size={16} /> Yape
      </button>
    </div>
  );
}

function Legend({
  tone,
  value,
  active,
  onClick,
  children,
}: {
  tone: 'all' | 'success' | 'brand' | 'offline' | 'danger';
  value: UnitMapFilter;
  active: boolean;
  onClick: (value: UnitMapFilter) => void;
  children: string;
}) {
  return (
    <button className={`${s.legendItem} ${active ? s.legendItemActive : ''}`} onClick={() => onClick(value)} aria-pressed={active}>
      <span className={`${s.legendSwatch} ${s[`legend${tone}`]}`} />
      {children}
    </button>
  );
}
