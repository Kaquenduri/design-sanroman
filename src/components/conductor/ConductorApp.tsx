'use client';

import { useEffect, useState } from 'react';
import {
  Home,
  Wallet,
  User,
  Crosshair,
  Layers,
  Phone,
  FileText,
  Bell,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  AppShell,
  MapLayer,
  TopChrome,
  Grow,
  StatusPill,
  BottomStack,
  TabBar,
  Panel,
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
  Card,
  Stat,
  Stars,
  Plate,
  UnitBadge,
  Seal,
  Divider,
  Synthetic,
} from '@/components/ui';
import {
  UNIT_POSITIONS,
  TODAY_TRIPS,
  formatPEN,
  formatDate,
  fareBreakdown,
  membershipBadge,
} from '@/data';
import { routeBetween, quadControl, pointOnQuad } from '@/lib/city';
import {
  DRIVER,
  UNIT,
  MEMBERSHIP,
  REQUEST,
  CATEGORY,
  SheetOffline,
  SheetOnline,
  SheetProposal,
  SheetPickup,
  SheetArrived,
  SheetTrip,
  SheetFinished,
} from './ConductorSheets';
import c from './Conductor.module.css';

type Screen =
  | 'offline'
  | 'online'
  | 'proposal'
  | 'pickup'
  | 'arrived'
  | 'trip'
  | 'finished';

type Tab = 'inicio' | 'ganancias' | 'perfil';

/* Geografía fija del viaje de demo. */
const START = UNIT_POSITIONS[UNIT.id];
const PICKUP = REQUEST.pickup;
const DEST = REQUEST.destination;

const LEG_A = routeBetween(START, PICKUP, 5);
const CTRL_A = quadControl(START, PICKUP, 5);
const LEG_B = routeBetween(PICKUP, DEST, 9);
const CTRL_B = quadControl(PICKUP, DEST, 9);

const PROPOSAL_SECONDS = 22; // `PropuestaViaje.timeout_segundos` del ERD
const BOARDING_SECONDS = 120; // tope municipal de embarque

const FARE = fareBreakdown(PICKUP, CATEGORY);

export function ConductorApp() {
  const [screen, setScreen] = useState<Screen>('offline');
  const [tab, setTab] = useState<Tab>('inicio');
  const [seconds, setSeconds] = useState(PROPOSAL_SECONDS);
  const [boarding, setBoarding] = useState(BOARDING_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);

  /* Cuenta atrás de la propuesta: al agotarse, pasa a la siguiente unidad. */
  useEffect(() => {
    if (screen !== 'proposal') return;
    if (seconds <= 0) {
      setScreen('online');
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, seconds]);

  /* Avance del vehículo sobre la ruta activa. */
  useEffect(() => {
    if (screen !== 'pickup' && screen !== 'trip') return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(1, p + 0.012));
    }, 120);
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'arrived') return;
    const id = setInterval(() => setBoarding((b) => Math.max(0, b - 1)), 1000);
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'trip') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [screen]);

  const goOnline = () => {
    setScreen('online');
    setTab('inicio');
  };

  const acceptProposal = () => {
    setProgress(0);
    setScreen('pickup');
  };

  const startTrip = () => {
    setProgress(0);
    setElapsed(0);
    setScreen('trip');
  };

  const backOnline = () => {
    setProgress(0);
    setRating(0);
    setBoarding(BOARDING_SECONDS);
    setSeconds(PROPOSAL_SECONDS);
    setScreen('online');
  };

  /* Encuadre: la cámara sigue la acción y la deja sobre la hoja, no detrás. */
  const view = (() => {
    switch (screen) {
      case 'offline':
        return fitCamera([START], { min: 760 });
      case 'online':
        return fitCamera([START], { min: 620 });
      case 'proposal':
      case 'pickup':
        return fitCamera([START, PICKUP]);
      case 'arrived':
        return fitCamera([PICKUP], { min: 430 });
      case 'trip':
        return fitCamera([PICKUP, DEST]);
      case 'finished':
        return fitCamera([DEST], { min: 520 });
    }
  })();

  const k = markerScale(view);

  /* Posición del vehículo sobre la pierna activa. */
  const car = (() => {
    if (screen === 'pickup')
      return pointOnQuad(START, CTRL_A, PICKUP, progress);
    if (screen === 'trip') return pointOnQuad(PICKUP, CTRL_B, DEST, progress);
    if (screen === 'arrived')
      return { x: PICKUP.x, y: PICKUP.y + 18, angle: -90 };
    if (screen === 'finished') return { x: DEST.x, y: DEST.y, angle: -90 };
    return { x: START.x, y: START.y, angle: -90 };
  })();

  const onHome = screen === 'offline' || screen === 'online';
  const showTabs = onHome;
  const etaSeconds = Math.round((1 - progress) * 180);
  const liveFare = FARE.total;
  const badge = membershipBadge(MEMBERSHIP);

  return (
    <AppShell>
      <MapLayer
        viewBox={view}
        dimmed={screen === 'offline'}
        labels={screen !== 'arrived'}
      >
        {screen === 'online' && <SearchPulse x={START.x} y={START.y} k={k} />}

        {(screen === 'proposal' || screen === 'pickup') && (
          <>
            <RouteLine d={LEG_A} k={k} />
            <PickupPin x={PICKUP.x} y={PICKUP.y} k={k} />
          </>
        )}

        {screen === 'arrived' && (
          <PickupPin x={PICKUP.x} y={PICKUP.y} k={k} />
        )}

        {(screen === 'trip' || screen === 'finished') && (
          <>
            <RouteLine d={LEG_B} animated={screen === 'trip'} k={k} />
            <PickupPin x={PICKUP.x} y={PICKUP.y} k={k} />
            <DestPin x={DEST.x} y={DEST.y} k={k} />
          </>
        )}

        {screen !== 'offline' && (
          <UnitMarker
            x={car.x}
            y={car.y}
            n={UNIT.n}
            status={
              screen === 'trip' || screen === 'pickup' ? 'on-trip' : 'active'
            }
            heading={car.angle + 90}
            selected
            k={k}
          />
        )}
      </MapLayer>

      <TopChrome>
        {screen === 'offline' && (
          <StatusPill>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: 'var(--fg-subtle)',
              }}
            />
            Sin conexión
          </StatusPill>
        )}
        {screen === 'online' && <StatusPill live>● En línea</StatusPill>}
        {screen === 'proposal' && (
          <StatusPill live>Propuesta asignada a ti</StatusPill>
        )}
        {(screen === 'pickup' || screen === 'arrived') && (
          <StatusPill>Recogiendo · Unidad {UNIT.n}</StatusPill>
        )}
        {screen === 'trip' && <StatusPill live>Viaje en curso</StatusPill>}
        {screen === 'finished' && <StatusPill>Viaje finalizado</StatusPill>}
        <Grow />
      </TopChrome>

      {onHome && (
        <MapControls>
          <IconButton variant="glass" aria-label="Centrar en mi posición">
            <Crosshair size={18} />
          </IconButton>
          <IconButton variant="glass" aria-label="Capas del mapa">
            <Layers size={18} />
          </IconButton>
        </MapControls>
      )}

      <BottomStack>
        <div key={screen}>
          {screen === 'offline' && <SheetOffline onGoOnline={goOnline} />}
          {screen === 'online' && (
            <SheetOnline
              onGoOffline={() => setScreen('offline')}
              onSimulate={() => {
                setSeconds(PROPOSAL_SECONDS);
                setScreen('proposal');
              }}
            />
          )}
          {screen === 'proposal' && (
            <SheetProposal
              secondsLeft={seconds}
              total={PROPOSAL_SECONDS}
              fare={liveFare}
              onAccept={acceptProposal}
              onReject={() => setScreen('online')}
            />
          )}
          {screen === 'pickup' && (
            <SheetPickup
              etaSeconds={etaSeconds}
              onArrived={() => setScreen('arrived')}
            />
          )}
          {screen === 'arrived' && (
            <SheetArrived boardingLeft={boarding} onStart={startTrip} />
          )}
          {screen === 'trip' && (
            <SheetTrip
              elapsed={elapsed}
              fare={liveFare}
              onFinish={() => setScreen('finished')}
            />
          )}
          {screen === 'finished' && (
            <SheetFinished
              fare={liveFare}
              lines={FARE.lines}
              rating={rating}
              onRate={setRating}
              onNext={backOnline}
            />
          )}
        </div>

        {showTabs && (
          <TabBar<Tab>
            value={tab}
            onChange={setTab}
            items={[
              { value: 'inicio', label: 'Inicio', icon: <Home size={20} /> },
              {
                value: 'ganancias',
                label: 'Ganancias',
                icon: <Wallet size={20} />,
              },
              { value: 'perfil', label: 'Perfil', icon: <User size={20} /> },
            ]}
          />
        )}
      </BottomStack>

      {showTabs && tab === 'ganancias' && (
        <Panel title="Ganancias de hoy" onBack={() => setTab('inicio')}>
          <Card brand>
            <Stat
              label="Total cobrado"
              value={formatPEN(TODAY_TRIPS.reduce((a, t) => a + t.fare, 0))}
              sub="8 viajes · 100% en efectivo"
              size="lg"
            />
          </Card>

          <Card>
            <div className={c.metrics} style={{ padding: 0 }}>
              <Stat
                className={c.metricDivided}
                label="Promedio"
                value={formatPEN(
                  TODAY_TRIPS.reduce((a, t) => a + t.fare, 0) /
                    TODAY_TRIPS.length
                )}
                size="sm"
              />
              <Stat
                className={c.metricDivided}
                label="Conectado"
                value="4h 28m"
                size="sm"
              />
            </div>
          </Card>

          <div className={c.sectionLabel}>Viajes completados</div>
          <Card pad={false} style={{ padding: '0 var(--s-4)' }}>
            {TODAY_TRIPS.map((t) => (
              <div key={t.id} className={c.tripRow}>
                <span className={c.tripTime}>{t.startedAt}</span>
                <div className={c.tripBody}>
                  <div className={c.tripName}>{t.passengerName}</div>
                  <div className={c.tripRoute}>
                    {t.pickupAddress} → {t.destinationAddress}
                  </div>
                </div>
                <span className={c.tripFare}>{formatPEN(t.fare)}</span>
              </div>
            ))}
          </Card>

          <Synthetic>Datos sintéticos de demostración</Synthetic>
        </Panel>
      )}

      {showTabs && tab === 'perfil' && (
        <Panel title="Mi perfil" onBack={() => setTab('inicio')}>
          <Card>
            <div className={c.person}>
              <Avatar initials={DRIVER.avatarSeed} size={56} ring />
              <div className={c.personBody}>
                <div className={c.personName} style={{ fontSize: 17 }}>
                  {DRIVER.name}
                </div>
                <div className={c.personMeta}>
                  <Stars value={DRIVER.rating} />
                  <span>· desde {formatDate(DRIVER.joinedAt)}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className={c.sectionLabel}>Unidad asignada</div>
          <Card>
            <div className={c.person}>
              <UnitBadge n={UNIT.n} size="lg" />
              <div className={c.personBody}>
                <div className={c.personName}>
                  {UNIT.marca} {UNIT.modelo} {UNIT.anio}
                </div>
                <div className={c.personMeta} style={{ marginTop: 6 }}>
                  <Plate value={UNIT.placa} />
                  <Chip tone="brand">{CATEGORY.label}</Chip>
                </div>
              </div>
            </div>
          </Card>

          <div className={c.sectionLabel}>Habilitación gremial</div>
          <div className={c.verify}>
            <Seal size={30} compact className={c.verifySeal} />
            <div className={c.verifyBody}>
              <div className={c.verifyTitle}>Membresía {badge.label.toLowerCase()}</div>
              <div className={c.verifyMeta}>
                Vence el {formatDate(MEMBERSHIP.expiresOn)}
              </div>
            </div>
            <Chip tone="success" dot>
              Al día
            </Chip>
          </div>

          <Card pad={false} style={{ padding: '0 var(--s-4)' }}>
            <div className={c.rows}>
              <div className={c.row}>
                <Phone size={19} className={c.rowIcon} />
                <div className={c.rowBody}>
                  <div className={c.rowLabel}>Teléfono</div>
                  <div className={`${c.rowValue} mono`}>{DRIVER.phone}</div>
                </div>
              </div>
              <button className={c.row}>
                <FileText size={19} className={c.rowIcon} />
                <div className={c.rowBody}>
                  <div className={c.rowLabel}>Documentos del vehículo</div>
                  <div className={c.rowValue}>SOAT, CITV y licencia vigentes</div>
                </div>
                <ShieldCheck size={17} color="var(--success)" />
              </button>
              <button className={c.row}>
                <Bell size={19} className={c.rowIcon} />
                <div className={c.rowBody}>
                  <div className={c.rowLabel}>Notificaciones</div>
                  <div className={c.rowValue}>Sonido y vibración activados</div>
                </div>
              </button>
            </div>
          </Card>

          <Divider />
          <Button variant="ghost" size="md" full>
            <LogOut size={17} />
            Cerrar sesión
          </Button>
        </Panel>
      )}
    </AppShell>
  );
}
