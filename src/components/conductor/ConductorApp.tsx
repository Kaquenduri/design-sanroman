'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Home, User, Wallet } from 'lucide-react';
import { AppShell, BottomStack, Grow, Panel, StatusPill, TabBar, TopChrome } from '@/components/shared/Shell';
import { Avatar, Card, Chip, Plate, Seal, Stat, Synthetic, UnitBadge } from '@/components/ui';
import { DRIVERS, MEMBERSHIPS, TODAY_TRIPS, UNITS, UNIT_POSITIONS, formatDate, formatPEN, type Unit } from '@/data';
import { worldToGeo } from '@/lib/juliaca';
import { acceptDispatchOffer, advanceDispatchCandidate, rejectDispatchOffer, subscribeDispatchJobs, updateDispatchStatus, type DispatchJob } from '@/lib/dispatch';
import { pointAlongRoute } from '@/lib/routing';
import { useRoadRoute } from '@/hooks/useRoadRoute';
import { SheetArrived, SheetFinished, SheetMembershipBlocked, SheetOffline, SheetOnline, SheetPickup, SheetProposal, SheetTrip } from './ConductorSheets';
import c from './Conductor.module.css';

const ConductorMap = dynamic(() => import('./ConductorMap').then((module) => module.ConductorMap), { ssr: false });
type Screen = 'offline' | 'online' | 'proposal' | 'pickup' | 'arrived' | 'trip' | 'finished';
type Tab = 'inicio' | 'ganancias' | 'perfil';
const BOARDING_SECONDS = 120;

export function ConductorApp() {
  const [unitId, setUnitId] = useState('u01');
  const [screen, setScreen] = useState<Screen>('online');
  const [tab, setTab] = useState<Tab>('inicio');
  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [boarding, setBoarding] = useState(BOARDING_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('unit');
    if (requested && UNITS.some((unit) => unit.id === requested)) setUnitId(requested);
  }, []);
  useEffect(() => subscribeDispatchJobs(setJobs), []);
  useEffect(() => {
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const unit = UNITS.find((item) => item.id === unitId) ?? UNITS[0];
  const driver = DRIVERS.find((item) => item.id === unit.driverId) ?? DRIVERS[0];
  const membership = MEMBERSHIPS.find((item) => item.driverId === driver.id) ?? MEMBERSHIPS[0];
  const identity = { unit, driver, membership };
  const job = jobs.find((item) => item.offer?.unitId === unitId || (item.assignedUnitId === unitId && !['finalizado', 'cancelado'].includes(item.status))) ?? null;
  const start = worldToGeo(UNIT_POSITIONS[unit.id]);
  const routeToPickup = useRoadRoute(job ? start : null, job?.pickup ?? null);
  const routeToDestination = useRoadRoute(job?.pickup ?? null, job?.destination ?? null);

  useEffect(() => {
    if (membership.status === 'vencida') return;
    if (job?.status === 'ofertando' && job.offer?.unitId === unitId) setScreen('proposal');
    else if (job?.status === 'aceptado' || job?.status === 'recogiendo') setScreen('pickup');
    else if (job?.status === 'esperando') setScreen('arrived');
    else if (job?.status === 'en-viaje') setScreen('trip');
  }, [job?.status, job?.offer?.unitId, membership.status, unitId]);

  const secondsLeft = job?.offer && nowMs !== null ? Math.max(0, Math.ceil((job.offer.expiresAt - nowMs) / 1000)) : 22;
  useEffect(() => {
    if (job?.status === 'ofertando' && job.offer?.unitId === unitId && secondsLeft === 0) {
      advanceDispatchCandidate(job.id, 'vencida'); setScreen('online');
    }
  }, [job, secondsLeft, unitId]);
  useEffect(() => {
    if (screen !== 'pickup' && screen !== 'trip') return;
    const id = setInterval(() => setProgress((value) => Math.min(1, value + 0.004)), 300);
    return () => clearInterval(id);
  }, [screen]);
  useEffect(() => {
    if (screen !== 'arrived') return;
    const id = setInterval(() => setBoarding((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(id);
  }, [screen]);
  useEffect(() => {
    if (screen !== 'trip') return;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [screen]);

  const activeRoute = screen === 'trip' || screen === 'finished' ? routeToDestination.route : routeToPickup.route;
  const car = useMemo(() => activeRoute?.points.length ? pointAlongRoute(activeRoute.points, screen === 'proposal' ? 0 : progress) : screen === 'arrived' && job ? job.pickup : screen === 'finished' && job ? job.destination : start, [activeRoute, job, progress, screen, start]);
  const pickup = job && !['trip', 'finished'].includes(screen) ? job.pickup : null;
  const destination = job && ['trip', 'finished', 'proposal'].includes(screen) ? job.destination : null;
  const showTabs = screen === 'offline' || screen === 'online';
  const remaining = Math.max(0, Math.round((activeRoute?.durationSeconds ?? 180) * (1 - progress)));

  const accept = () => { if (!job) return; acceptDispatchOffer(job.id, unitId); updateDispatchStatus(job.id, 'recogiendo'); setProgress(0); setScreen('pickup'); };
  const reject = () => { if (!job) return; rejectDispatchOffer(job.id, unitId); setScreen('online'); };

  return <AppShell className={c.driverShell}>
    <ConductorMap car={car} pickup={pickup} destination={destination} route={activeRoute?.points ?? []} selected={Boolean(job)} />
    <TopChrome><StatusPill live={screen !== 'offline'}>{membership.status === 'vencida' ? 'Membresía bloqueada' : screen === 'online' ? `● Unidad ${unit.n} disponible` : screen === 'proposal' ? 'Nueva propuesta de la central' : screen === 'pickup' ? 'Navegando al recojo' : screen === 'arrived' ? 'Esperando pasajero' : screen === 'trip' ? 'Viaje en curso' : screen === 'finished' ? 'Confirmar cobro' : 'Sin conexión'}</StatusPill><Grow /></TopChrome>
    <BottomStack><div key={screen}>
      {membership.status === 'vencida' ? <SheetMembershipBlocked identity={identity} /> : screen === 'offline' ? <SheetOffline identity={identity} onGoOnline={() => setScreen('online')} /> : screen === 'online' ? <SheetOnline unit={unit} onGoOffline={() => setScreen('offline')} /> : job && screen === 'proposal' ? <SheetProposal job={job} secondsLeft={secondsLeft} route={routeToPickup.route} onAccept={accept} onReject={reject} /> : job && screen === 'pickup' ? <SheetPickup job={job} route={routeToPickup.route} remaining={remaining} onArrived={() => { updateDispatchStatus(job.id, 'esperando'); setBoarding(BOARDING_SECONDS); setScreen('arrived'); }} /> : job && screen === 'arrived' ? <SheetArrived job={job} boardingLeft={boarding} onStart={() => { updateDispatchStatus(job.id, 'en-viaje'); setProgress(0); setElapsed(0); setScreen('trip'); }} /> : job && screen === 'trip' ? <SheetTrip job={job} route={routeToDestination.route} elapsed={elapsed} remaining={remaining} onFinish={() => setScreen('finished')} /> : job && screen === 'finished' ? <SheetFinished job={job} unit={unit} onConfirm={() => { updateDispatchStatus(job.id, 'finalizado'); setProgress(0); setScreen('online'); }} /> : <SheetOnline unit={unit} onGoOffline={() => setScreen('offline')} />}
    </div>{showTabs && <TabBar<Tab> value={tab} onChange={setTab} items={[{ value: 'inicio', label: 'Inicio', icon: <Home size={20} /> }, { value: 'ganancias', label: 'Ganancias', icon: <Wallet size={20} /> }, { value: 'perfil', label: 'Perfil', icon: <User size={20} /> }]} />}</BottomStack>
    {showTabs && tab === 'ganancias' && <Earnings onBack={() => setTab('inicio')} />}
    {showTabs && tab === 'perfil' && <Profile identity={identity} onBack={() => setTab('inicio')} />}
  </AppShell>;
}

function Earnings({ onBack }: { onBack: () => void }) {
  const total = TODAY_TRIPS.reduce((sum, trip) => sum + trip.fare, 0);
  const cash = TODAY_TRIPS.filter((_, index) => index % 3 !== 0).reduce((sum, trip) => sum + trip.fare, 0);
  return <Panel title="Ganancias de hoy" onBack={onBack}><Card brand className={c.earningsHero}><Stat label="Total cobrado" value={formatPEN(total)} sub={`${TODAY_TRIPS.length} servicios`} size="lg" /></Card><Card><div className={`${c.metrics} ${c.metricsFlush}`}><Stat label="Efectivo" value={formatPEN(cash)} sub="En caja" size="sm" /><Stat label="Yape" value={formatPEN(total - cash)} sub="Digital" size="sm" /></div></Card><Synthetic>Montos sintéticos de demostración</Synthetic></Panel>;
}

function Profile({ identity, onBack }: { identity: { driver: typeof DRIVERS[number]; unit: Unit; membership: typeof MEMBERSHIPS[number] }; onBack: () => void }) {
  return <Panel title="Identidad de la unidad" onBack={onBack}><Card brand className={c.unitProfileCard}><div className={c.person}><Seal size={64} /><div className={c.personBody}><div className={c.personName}>{identity.driver.name}</div><div className={c.personMeta}>Agremiado Real San Román</div></div><UnitBadge n={identity.unit.n} size="lg" /></div></Card><Card><div className={c.person}><Avatar initials={identity.driver.avatarSeed} size={50} ring /><div className={c.personBody}><div className={c.personName}>{identity.unit.marca} {identity.unit.modelo}</div><div className={c.personMeta}><Plate value={identity.unit.placa} /><Chip tone="success">Membresía hasta {formatDate(identity.membership.expiresOn)}</Chip></div></div></div></Card><Synthetic>Identidad sintética para demostración local</Synthetic></Panel>;
}
