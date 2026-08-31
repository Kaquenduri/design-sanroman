'use client';

import {
  Power,
  Phone,
  MessageSquare,
  Check,
  X,
  Navigation,
  Banknote,
  Star,
  ChevronRight,
  Zap,
  MapPin,
  Clock3,
  CarFront,
  ShieldCheck,
} from 'lucide-react';
import {
  Button,
  IconButton,
  Chip,
  Avatar,
  Sheet,
  Stat,
  Stars,
  Legs,
  Seal,
  UnitBadge,
  CountdownRing,
  Plate,
} from '@/components/ui';
import {
  DRIVERS,
  UNITS,
  MEMBERSHIPS,
  REQUESTS_INITIAL,
  CATEGORY_BY_ID,
  TODAY_TRIPS,
  formatPEN,
  formatClock,
  membershipBadge,
  type FareLine,
} from '@/data';
import c from './Conductor.module.css';

/* Datos de la demo: un conductor, su unidad, una solicitud. */
export const DRIVER = DRIVERS[0];
export const UNIT = UNITS[0];
export const MEMBERSHIP = MEMBERSHIPS[0];
export const REQUEST = REQUESTS_INITIAL[0];
export const CATEGORY = CATEGORY_BY_ID[REQUEST.categoryId];

/* Se derivan de los viajes del día en vez de fijarse a mano: si no, la hoja
   de inicio y la pantalla de ganancias muestran totales distintos. */
const EARNED_TODAY = TODAY_TRIPS.reduce((sum, t) => sum + t.fare, 0);
const TRIPS_TODAY = TODAY_TRIPS.length;

/* ------------------------------------------------------------ Offline --- */

export function SheetOffline({ onGoOnline }: { onGoOnline: () => void }) {
  const badge = membershipBadge(MEMBERSHIP);
  return (
    <Sheet className={c.homeSheet}>
      <div className={c.identityHero}>
        <Seal size={72} className={c.identitySeal} />
        <div className={c.identityTop}>
          <Avatar initials={DRIVER.avatarSeed} size={50} ring />
          <div className={c.headText}>
            <div className={c.eyebrow}>Conductor en turno</div>
            <div className={c.identityName}>
              {DRIVER.name.split(' ')[0]}, buen día
            </div>
            <div className={c.identityVehicle}>
              {UNIT.marca} {UNIT.modelo} · {UNIT.anio}
            </div>
          </div>
          <UnitBadge n={UNIT.n} size="lg" />
        </div>
        <div className={c.identityFoot}>
          <Plate value={UNIT.placa} />
          <span>Juliaca · turno de mañana</span>
        </div>
      </div>

      <div className={c.verify}>
        <ShieldCheck size={22} className={c.verifySeal} />
        <div className={c.verifyBody}>
          <div className={c.verifyTitle}>Habilitación {badge.label.toLowerCase()}</div>
          <div className={c.verifyMeta}>
            Puedes recibir viajes · vence en {MEMBERSHIP.daysToExpire} días
          </div>
        </div>
        <Chip tone="success" dot>
          Al día
        </Chip>
      </div>

      <div className={`${c.metrics} ${c.metricsBoxed}`}>
        <Stat
          className={c.metricDivided}
          label="Ganado hoy"
          value={formatPEN(EARNED_TODAY)}
          sub={`${TRIPS_TODAY} viajes`}
          size="sm"
        />
        <Stat
          className={c.metricDivided}
          label="Conectado"
          value="4h 28m"
          sub="desde 06:42"
          size="sm"
        />
      </div>

      <div className={c.actions}>
        <Button size="xl" full onClick={onGoOnline}>
          <Power size={21} strokeWidth={2.4} />
          Empezar a recibir viajes
        </Button>
        <div className={c.actionHint}>Tu ubicación se compartirá con la central</div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------- Online --- */

export function SheetOnline({
  onGoOffline,
  onSimulate,
}: {
  onGoOffline: () => void;
  onSimulate: () => void;
}) {
  return (
    <Sheet className={c.onlineSheet}>
      <div className={c.availabilityCard}>
        <span className={c.radar} aria-hidden>
          <span />
          <span />
          <span />
          <span className={c.radarCore} />
        </span>
        <div className={c.headText}>
          <div className={c.eyebrow}>Estado de la unidad</div>
          <div className={c.availabilityTitle}>Disponible</div>
          <div className={c.availabilityMeta}>
            Buscando solicitudes cerca de ti
          </div>
        </div>
        <span className={c.liveSwitch} aria-label="Disponible">
          <span />
        </span>
      </div>

      <div className={`${c.metrics} ${c.metricsBoxed}`}>
        <Stat
          className={c.metricDivided}
          label="Ganado hoy"
          value={formatPEN(EARNED_TODAY)}
          sub={`${TRIPS_TODAY} viajes`}
          size="sm"
        />
        <Stat
          className={c.metricDivided}
          label="Unidades cerca"
          value="6"
          sub="en Anillo 1"
          size="sm"
        />
      </div>

      <div className={c.actions}>
        <Button size="lg" variant="outline" full onClick={onGoOffline}>
          <Power size={18} />
          Dejar de recibir viajes
        </Button>
        <Button size="md" variant="ghost" full onClick={onSimulate}>
          <Zap size={15} />
          Simular propuesta entrante
        </Button>
      </div>
    </Sheet>
  );
}

/* ----------------------------------------------------------- Propuesta --- */
/* El momento con autoría de esta superficie: la hoja sube, el anillo drena y
   el conductor decide en 22 s (timeout de `PropuestaViaje` en el ERD). */

export function SheetProposal({
  secondsLeft,
  total,
  fare,
  onAccept,
  onReject,
}: {
  secondsLeft: number;
  total: number;
  fare: number;
  onAccept: () => void;
  onReject: () => void;
}) {
  const urgent = secondsLeft <= 7;
  return (
    <Sheet grabber={false} className={c.proposalSheet}>
      <div className={c.proposalHead}>
        <div className={c.headText}>
          <div className={c.eyebrow}>Nueva propuesta</div>
          <div className={c.title}>Una carrera para ti</div>
          <div className={c.subtitle}>
            Eres la unidad disponible más cercana
          </div>
        </div>
        <CountdownRing
          value={secondsLeft}
          total={total}
          size={58}
          urgent={urgent}
        />
      </div>

      <div className={c.fareHero}>
        <div>
          <span className={c.fareLabel}>Cobrarás en efectivo</span>
          <span className={c.fareAmount}>{formatPEN(fare)}</span>
        </div>
        <div className={c.fareFacts}>
          <span>{CATEGORY.label}</span>
          <span>{REQUEST.distanceKm.toFixed(1)} km</span>
          <span>Recojo en 3 min</span>
        </div>
      </div>

      <div className={c.routeCard}>
        <Legs
          from={REQUEST.pickupAddress}
          fromMeta="a 0.8 km de tu posición"
          to={REQUEST.destinationAddress}
        />
      </div>

      <div className={`${c.person} ${c.personCard}`}>
        <Avatar initials={REQUEST.passengerSeed} size={40} />
        <div className={c.personBody}>
          <div className={c.personName}>{REQUEST.passengerName}</div>
          <div className={c.personMeta}>
            <Stars value={REQUEST.passengerRating} count={23} />
          </div>
        </div>
        <Banknote size={18} className={c.personTrailing} />
      </div>

      <div className={`${c.actions} ${c.actionsPair}`}>
        <Button size="xl" variant="outline" onClick={onReject}>
          <X size={19} />
          Rechazar
        </Button>
        <Button size="xl" onClick={onAccept}>
          <Check size={21} strokeWidth={2.6} />
          Aceptar
        </Button>
      </div>
    </Sheet>
  );
}

/* --------------------------------------------------- Camino al pasajero --- */

function PassengerRow() {
  return (
    <div className={c.person}>
      <Avatar initials={REQUEST.passengerSeed} size={44} />
      <div className={c.personBody}>
        <div className={c.personName}>{REQUEST.passengerName}</div>
        <div className={c.personMeta}>
          <Stars value={REQUEST.passengerRating} />
        </div>
      </div>
      <div className={c.personActions}>
        <IconButton variant="neutral" aria-label="Llamar al pasajero">
          <Phone size={17} />
        </IconButton>
        <IconButton variant="neutral" aria-label="Enviar mensaje">
          <MessageSquare size={17} />
        </IconButton>
      </div>
    </div>
  );
}

export function SheetPickup({
  etaSeconds,
  onArrived,
}: {
  etaSeconds: number;
  onArrived: () => void;
}) {
  return (
    <Sheet className={c.pickupSheet}>
      <div className={c.etaHero}>
        <div className={c.etaNumber}>
          {Math.max(1, Math.ceil(etaSeconds / 60))}
          <span>min</span>
        </div>
        <div className={c.etaBody}>
          <span className={c.eyebrow}>Hasta el recojo</span>
          <strong>{REQUEST.pickupAddress}</strong>
          <span>Continúa por la ruta marcada</span>
        </div>
        <Navigation size={24} className={c.etaIcon} />
      </div>

      <div className={c.personCard}>
        <PassengerRow />
      </div>

      <div className={c.actions}>
        <Button size="xl" full onClick={onArrived}>
          <Navigation size={19} />
          Ya llegué al punto
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------- Esperando al pasajero --- */

export function SheetArrived({
  boardingLeft,
  onStart,
}: {
  boardingLeft: number;
  onStart: () => void;
}) {
  return (
    <Sheet className={c.arrivedSheet}>
      <div className={c.head}>
        <div className={c.headText}>
          <div className={c.title}>
            Esperando a {REQUEST.passengerName.split(' ')[0]}
          </div>
          <div className={c.subtitle}>{REQUEST.pickupAddress}</div>
        </div>
      </div>

      {/* La ordenanza municipal limita el embarque a 2 min en vías saturadas */}
      <div className={c.boarding}>
        <Clock3 size={24} className={c.boardingIcon} />
        <div className={c.boardingBody}>
          <div className={c.boardingTitle}>Tiempo de embarque</div>
          <div className={c.boardingMeta}>
            Máximo 2 min según ordenanza municipal
          </div>
        </div>
        <span className={c.boardingClock}>{formatClock(boardingLeft)}</span>
      </div>

      <div className={c.arrivedPassenger}>
        <PassengerRow />
      </div>

      <div className={c.actions}>
        <Button size="xl" full onClick={onStart}>
          <Check size={20} strokeWidth={2.5} />
          Iniciar viaje
        </Button>
      </div>
    </Sheet>
  );
}

/* -------------------------------------------------------------- En viaje --- */

export function SheetTrip({
  elapsed,
  fare,
  onFinish,
}: {
  elapsed: number;
  fare: number;
  onFinish: () => void;
}) {
  return (
    <Sheet className={c.tripSheet}>
      <div className={c.head}>
        <div className={c.headText}>
          <div className={c.subtitle}>Llevas a {REQUEST.passengerName} a</div>
          <div className={c.title}>{REQUEST.destinationAddress}</div>
        </div>
        <Chip tone="brand" dot live large className={c.tripClock}>
          {formatClock(elapsed)}
        </Chip>
      </div>

      <div className={c.tripRouteCard}>
        <MapPin size={21} />
        <div>
          <span>Destino</span>
          <strong>{REQUEST.destinationAddress}</strong>
          <small>Pasajera: {REQUEST.passengerName}</small>
        </div>
      </div>

      <div className={`${c.metrics} ${c.metricsBoxed}`}>
        <Stat
          className={c.metricDivided}
          label="Tarifa"
          value={formatPEN(fare)}
          sub="fija por anillo"
          size="sm"
        />
        <Stat
          className={c.metricDivided}
          label="Restante"
          value="1.4 km"
          sub="4 min"
          size="sm"
        />
      </div>

      <div className={c.actions}>
        <Button size="xl" variant="success" full onClick={onFinish}>
          <Check size={21} strokeWidth={2.6} />
          Finalizar viaje
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------ Finalizado --- */

export function SheetFinished({
  fare,
  lines,
  rating,
  onRate,
  onNext,
}: {
  fare: number;
  lines: FareLine[];
  rating: number;
  onRate: (n: number) => void;
  onNext: () => void;
}) {
  return (
    <Sheet className={c.finishedSheet}>
      <div className={c.done}>
        <span className={c.doneMark}>
          <Check size={32} strokeWidth={3} />
        </span>
        <span className={c.doneLabel}>Viaje completado · cobra en efectivo</span>
        <span className={c.doneAmount}>{formatPEN(fare)}</span>
      </div>

      <div className={c.breakdown}>
        {lines.map((l) => (
          <div key={l.concepto} className={c.breakdownRow}>
            <span className={c.breakdownLabel}>{l.label}</span>
            <span className={c.breakdownValue}>{formatPEN(l.amount)}</span>
          </div>
        ))}
        <div className={`${c.breakdownRow} ${c.breakdownTotal}`}>
          <span>Total</span>
          <span className={c.breakdownValue}>{formatPEN(fare)}</span>
        </div>
      </div>

      <div className={c.finishedMeta}>
        <CarFront size={18} />
        Unidad {UNIT.n} · tarifa fija confirmada
      </div>

      <div className={c.sectionLabel}>Califica a tu pasajero</div>
      <div className={c.rate}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`${c.rateStar} ${rating >= n ? c.rateStarOn : ''}`}
            onClick={() => onRate(n)}
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
        <Button size="xl" full onClick={onNext}>
          Volver a estar en línea
          <ChevronRight size={19} />
        </Button>
      </div>
    </Sheet>
  );
}
