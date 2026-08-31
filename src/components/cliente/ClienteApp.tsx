'use client';

import { useEffect, useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Home as HomeIcon,
  Briefcase,
  Store,
  Car,
  Package,
  Users,
  Truck,
  Banknote,
  Phone,
  MessageSquare,
  ChevronRight,
  Star,
  Check,
  ArrowLeft,
  Crosshair,
} from 'lucide-react';
import {
  AppShell,
  MapLayer,
  TopChrome,
  Grow,
  BottomStack,
  MapControls,
  fitCamera,
  markerScale,
} from '@/components/shared/Shell';
import {
  RouteLine,
  PickupPin,
  DestPin,
  UnitMarker,
  SearchPulse,
} from '@/components/map/MapMarkers';
import {
  Button,
  IconButton,
  Chip,
  Avatar,
  Sheet,
  Stars,
  Legs,
  Plate,
  Seal,
  UnitBadge,
  FieldButton,
  Synthetic,
} from '@/components/ui';
import {
  DRIVERS,
  UNITS,
  UNIT_POSITIONS,
  CATEGORIES,
  REQUESTS_INITIAL,
  formatPEN,
  formatClock,
  fareBreakdown,
  type CategoryId,
} from '@/data';
import { routeBetween, quadControl, pointOnQuad } from '@/lib/city';
import c from './Cliente.module.css';

type Screen = 'home' | 'choose' | 'searching' | 'matched' | 'trip' | 'finished';

/* La unidad que acepta la carrera y su conductor. */
const UNIT = UNITS[2];
const DRIVER = DRIVERS[2];

const REQ = REQUESTS_INITIAL[0];
const PICKUP = REQ.pickup;
const DEST = REQ.destination;
const UNIT_START = UNIT_POSITIONS[UNIT.id];

const LEG_APPROACH = routeBetween(UNIT_START, PICKUP, 11);
const CTRL_APPROACH = quadControl(UNIT_START, PICKUP, 11);
const LEG_TRIP = routeBetween(PICKUP, DEST, 9);
const CTRL_TRIP = quadControl(PICKUP, DEST, 9);

const CAT_ICON: Record<CategoryId, typeof Car> = {
  SEDAN: Car,
  PROBOX: Package,
  MINIVAN: Users,
  SUV: Truck,
};

const SAVED = [
  { icon: HomeIcon, name: 'Casa', addr: 'Urb. Los Geranios Mz. F Lt. 4' },
  { icon: Briefcase, name: 'Trabajo', addr: 'Av. El Sol 880, oficina 204' },
  { icon: Store, name: 'Mercado Túpac Amaru', addr: 'Puerta 3, Jr. Huancané' },
];

/* La central propone a una unidad por vez, en cascada, no a todas a la vez. */
const CASCADE = [
  'Propuesta enviada a Unidad 12',
  'Sin respuesta · pasando a la siguiente',
  'Propuesta enviada a Unidad 03',
];

export function ClienteApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [categoryId, setCategoryId] = useState<CategoryId>('SEDAN');
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [rating, setRating] = useState(0);

  const category = CATEGORIES.find((x) => x.id === categoryId)!;
  const fare = fareBreakdown(PICKUP, category);

  /* Cascada de propuestas mientras se busca unidad. */
  useEffect(() => {
    if (screen !== 'searching') return;
    if (step >= CASCADE.length) {
      const t = setTimeout(() => {
        setProgress(0);
        setScreen('matched');
      }, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1500);
    return () => clearTimeout(t);
  }, [screen, step]);

  /* Aproximación de la unidad y avance del viaje. */
  useEffect(() => {
    if (screen !== 'matched' && screen !== 'trip') return;
    const id = setInterval(
      () => setProgress((p) => Math.min(1, p + 0.014)),
      130
    );
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'trip') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [screen]);

  /* Cuando la unidad llega, arranca el viaje solo. */
  useEffect(() => {
    if (screen === 'matched' && progress >= 1) {
      setProgress(0);
      setElapsed(0);
      setScreen('trip');
    }
    if (screen === 'trip' && progress >= 1) {
      setScreen('finished');
    }
  }, [screen, progress]);

  const request = () => {
    setStep(0);
    setScreen('searching');
  };

  const reset = () => {
    setScreen('home');
    setStep(0);
    setProgress(0);
    setElapsed(0);
    setRating(0);
  };

  /* La hoja del cliente es alta: la franja libre de mapa es más chica. */
  const view = (() => {
    switch (screen) {
      case 'home':
        return fitCamera([PICKUP], { min: 560, band: 0.42 });
      case 'choose':
        return fitCamera([PICKUP, DEST], { band: 0.34 });
      case 'searching':
        return fitCamera([PICKUP], { min: 620, band: 0.46 });
      case 'matched':
        return fitCamera([UNIT_START, PICKUP], { band: 0.4 });
      case 'trip':
        return fitCamera([PICKUP, DEST], { band: 0.46 });
      case 'finished':
        return fitCamera([DEST], { min: 520, band: 0.4 });
    }
  })();

  const k = markerScale(view);

  const car =
    screen === 'matched'
      ? pointOnQuad(UNIT_START, CTRL_APPROACH, PICKUP, progress)
      : screen === 'trip'
        ? pointOnQuad(PICKUP, CTRL_TRIP, DEST, progress)
        : { x: UNIT_START.x, y: UNIT_START.y, angle: -90 };

  const etaMin = Math.max(1, Math.ceil((1 - progress) * 4));

  return (
    <AppShell>
      <MapLayer viewBox={view} labels={screen !== 'finished'}>
        {screen === 'home' && <PickupPin x={PICKUP.x} y={PICKUP.y} k={k} />}

        {screen === 'choose' && (
          <>
            <RouteLine d={LEG_TRIP} animated={false} k={k} />
            <PickupPin x={PICKUP.x} y={PICKUP.y} k={k} />
            <DestPin x={DEST.x} y={DEST.y} k={k} />
          </>
        )}

        {screen === 'searching' && (
          <SearchPulse x={PICKUP.x} y={PICKUP.y} k={k} />
        )}

        {screen === 'matched' && (
          <>
            <RouteLine d={LEG_APPROACH} k={k} />
            <PickupPin x={PICKUP.x} y={PICKUP.y} k={k} />
            <UnitMarker
              x={car.x}
              y={car.y}
              n={UNIT.n}
              status="on-trip"
              heading={car.angle + 90}
              selected
              k={k}
            />
          </>
        )}

        {screen === 'trip' && (
          <>
            <RouteLine d={LEG_TRIP} k={k} />
            <DestPin x={DEST.x} y={DEST.y} k={k} />
            <UnitMarker
              x={car.x}
              y={car.y}
              n={UNIT.n}
              status="on-trip"
              heading={car.angle + 90}
              selected
              k={k}
            />
          </>
        )}

        {screen === 'finished' && <DestPin x={DEST.x} y={DEST.y} k={k} />}
      </MapLayer>

      <TopChrome>
        {screen === 'choose' ? (
          <IconButton
            variant="glass"
            onClick={() => setScreen('home')}
            aria-label="Volver"
          >
            <ArrowLeft size={19} />
          </IconButton>
        ) : (
          <IconButton variant="glass" aria-label="Menú">
            <Menu size={19} />
          </IconButton>
        )}
        <Grow />
        {screen === 'home' && (
          <>
            <IconButton variant="glass" aria-label="Notificaciones">
              <Bell size={18} />
            </IconButton>
            <Avatar initials="LM" size={44} ring />
          </>
        )}
      </TopChrome>

      {(screen === 'home' || screen === 'choose') && (
        <MapControls>
          <IconButton variant="glass" aria-label="Centrar en mi ubicación">
            <Crosshair size={18} />
          </IconButton>
        </MapControls>
      )}

      <BottomStack>
        <div key={screen}>
          {/* ------------------------------------------------------ Inicio --- */}
          {screen === 'home' && (
            <Sheet>
              <h1 className={c.hero}>¿A dónde vas?</h1>

              <FieldButton
                icon={<Search size={18} color="var(--fg-subtle)" />}
                text="Ingresa tu destino"
                empty
                trailing={<ChevronRight size={17} color="var(--fg-subtle)" />}
                onClick={() => setScreen('choose')}
              />

              <div className={c.sectionLabel}>Guardados</div>
              <div className={c.places}>
                {SAVED.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.name}
                      className={c.place}
                      onClick={() => setScreen('choose')}
                    >
                      <span className={c.placeIcon}>
                        <Icon size={18} />
                      </span>
                      <span className={c.placeBody}>
                        <span className={c.placeName}>{p.name}</span>
                        <span className={c.placeAddr}>{p.addr}</span>
                      </span>
                      <ChevronRight size={17} color="var(--fg-subtle)" />
                    </button>
                  );
                })}
              </div>

              <div className={c.actions}>
                <Synthetic>
                  Maqueta de demostración · datos y ubicaciones sintéticos
                </Synthetic>
              </div>
            </Sheet>
          )}

          {/* ----------------------------------------------------- Elección --- */}
          {screen === 'choose' && (
            <Sheet>
              <Legs
                from={REQ.pickupAddress}
                to={REQ.destinationAddress}
                toMeta={`${REQ.distanceKm.toFixed(1)} km · aprox. 12 min`}
              />

              <div className={c.sectionLabel}>Elige tu unidad</div>
              <div className={c.cats}>
                {CATEGORIES.map((cat) => {
                  const Icon = CAT_ICON[cat.id];
                  const price = fareBreakdown(PICKUP, cat).total;
                  const active = cat.id === categoryId;
                  return (
                    <button
                      key={cat.id}
                      className={`${c.cat} ${active ? c.catActive : ''}`}
                      onClick={() => setCategoryId(cat.id)}
                      aria-pressed={active}
                    >
                      <span className={c.catIcon}>
                        <Icon size={21} />
                      </span>
                      <span className={c.catBody}>
                        <span className={c.catName}>{cat.label}</span>
                        <span className={c.catMeta}>
                          {cat.seats} pasajeros
                          {cat.carga !== 'ninguna' && ` · carga ${cat.carga}`}
                        </span>
                      </span>
                      <span className={c.catRight}>
                        <span className={c.catPrice}>{formatPEN(price)}</span>
                        <span className={c.catEta}>
                          {3 + cat.etaOffset} min
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={c.payRow}>
                <Banknote size={20} color="var(--fg-muted)" />
                <span className={c.payBody}>
                  <span className={c.payLabel}>Efectivo</span>
                  <span className={c.payMeta}>
                    Tarifa fija de anillo · paga al llegar
                  </span>
                </span>
                <Chip tone="neutral">Único medio</Chip>
              </div>

              <Button size="xl" full onClick={request}>
                Solicitar {category.label} · {formatPEN(fare.total)}
              </Button>
            </Sheet>
          )}

          {/* ---------------------------------------------------- Buscando --- */}
          {screen === 'searching' && (
            <Sheet>
              <div className={c.searching}>
                <span className={c.searchRing} aria-hidden>
                  <span />
                  <span />
                  <span className={c.searchCore} />
                </span>
                <div className={c.headText}>
                  <div className={c.title}>Buscando unidad</div>
                  <div className={c.subtitle}>
                    Proponemos a la unidad más cercana, una por vez
                  </div>
                </div>
              </div>

              <div className={c.cascade}>
                {CASCADE.slice(0, step).map((line, i) => (
                  <div
                    key={line}
                    className={`${c.cascadeRow} ${
                      i === step - 1 ? c.cascadeRowActive : ''
                    }`}
                  >
                    {i === step - 1 ? (
                      <Chip tone="brand" dot live>
                        Ahora
                      </Chip>
                    ) : (
                      <Chip tone="neutral">Listo</Chip>
                    )}
                    {line}
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                variant="outline"
                full
                onClick={() => setScreen('choose')}
              >
                Cancelar solicitud
              </Button>
            </Sheet>
          )}

          {/* -------------------------------------- Unidad asignada (sello) --- */}
          {screen === 'matched' && (
            <Sheet>
              <div className={c.head}>
                <div className={c.headText}>
                  <div className={c.title}>Tu unidad llega en {etaMin} min</div>
                  <div className={c.subtitle}>
                    Verifica el número antes de subir
                  </div>
                </div>
                <Chip tone="brand" dot live large>
                  En camino
                </Chip>
              </div>

              <div className={c.verifyCard}>
                {/* Los dos objetos de identidad del gremio —el numeral pintado
                    y el sello— flanquean el dato del vehículo. El sello se
                    estampa al quedar asignada la unidad. */}
                <div className={c.verifyTop}>
                  <UnitBadge n={UNIT.n} size="lg" />
                  <div className={c.verifyUnit}>
                    <div className={c.verifyGremial}>
                      Real San Román · 32-2020
                    </div>
                    <div className={c.verifyVehicle}>
                      {UNIT.marca} {UNIT.modelo}
                    </div>
                  </div>
                  <Seal size={96} className={c.verifyStamp} />
                </div>

                <div className={c.verifyRow}>
                  <Plate value={UNIT.placa} large />
                  <Chip tone="success" dot>
                    Membresía vigente
                  </Chip>
                </div>

                <div className={c.verifyDriver}>
                  <Avatar initials={DRIVER.avatarSeed} size={44} />
                  <div className={c.verifyDriverBody}>
                    <div className={c.verifyDriverName}>{DRIVER.name}</div>
                    <div className={c.verifyDriverMeta}>
                      <Stars value={DRIVER.rating} count={DRIVER.tripsToday} />
                    </div>
                  </div>
                  <div className={c.verifyActions}>
                    <IconButton variant="neutral" aria-label="Llamar">
                      <Phone size={17} />
                    </IconButton>
                    <IconButton variant="neutral" aria-label="Mensaje">
                      <MessageSquare size={17} />
                    </IconButton>
                  </div>
                </div>
              </div>

              <button className={c.chatBar}>
                <span className={c.chatBarText}>Escribe al conductor…</span>
                <span className={c.chatSend}>
                  <MessageSquare size={17} />
                </span>
              </button>
            </Sheet>
          )}

          {/* ---------------------------------------------------- En viaje --- */}
          {screen === 'trip' && (
            <Sheet className={c.tripSheet}>
              <div className={c.head}>
                <div className={c.headText}>
                  <div className={c.subtitle}>Vas hacia</div>
                  <div className={c.title}>{REQ.destinationAddress}</div>
                  <div className={c.subtitle}>
                    Llegada estimada en {etaMin} min
                  </div>
                </div>
                <Chip tone="brand" dot live large>
                  {formatClock(elapsed)}
                </Chip>
              </div>

              <div className={c.payRow}>
                <UnitBadge n={UNIT.n} size="sm" />
                <span className={c.payBody}>
                  <span className={c.payLabel}>{DRIVER.name}</span>
                  <span className={c.payMeta}>
                    {UNIT.marca} {UNIT.modelo} · {UNIT.placa}
                  </span>
                </span>
                <IconButton variant="neutral" aria-label="Llamar">
                  <Phone size={17} />
                </IconButton>
              </div>

              <div className={`${c.payRow} ${c.payRowLast}`}>
                <Banknote size={20} color="var(--fg-muted)" />
                <span className={c.payBody}>
                  <span className={c.payLabel}>{formatPEN(fare.total)}</span>
                  <span className={c.payMeta}>
                    En efectivo al llegar · tarifa fija
                  </span>
                </span>
              </div>
            </Sheet>
          )}

          {/* --------------------------------------------------- Finalizado --- */}
          {screen === 'finished' && (
            <Sheet>
              <div className={c.done}>
                <Chip tone="success" dot>
                  <Check size={13} /> Llegaste
                </Chip>
                <span className={c.doneAmount}>{formatPEN(fare.total)}</span>
                <span className={c.doneLabel}>Paga en efectivo al conductor</span>
              </div>

              <div className={c.receipt}>
                {fare.lines.map((l) => (
                  <div key={l.concepto} className={c.receiptRow}>
                    <span className={c.receiptLabel}>{l.label}</span>
                    <span className={c.receiptValue}>
                      {formatPEN(l.amount)}
                    </span>
                  </div>
                ))}
                <div className={`${c.receiptRow} ${c.receiptTotal}`}>
                  <span>Total</span>
                  <span className={c.receiptValue}>
                    {formatPEN(fare.total)}
                  </span>
                </div>
              </div>

              <div className={c.sectionLabel}>
                ¿Cómo estuvo {DRIVER.name.split(' ')[0]}?
              </div>
              <div className={c.rate}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`${c.rateStar} ${
                      rating >= n ? c.rateStarOn : ''
                    }`}
                    onClick={() => setRating(n)}
                    aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={24}
                      fill={rating >= n ? 'currentColor' : 'none'}
                      strokeWidth={rating >= n ? 0 : 1.8}
                    />
                  </button>
                ))}
              </div>

              <div className={c.actions}>
                <Button size="xl" full onClick={reset}>
                  Listo
                </Button>
              </div>
            </Sheet>
          )}
        </div>
      </BottomStack>
    </AppShell>
  );
}
