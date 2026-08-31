import type { UnitStatus } from '@/data';

/* Marcadores en coordenadas de mundo, compartidos por las tres superficies.
   Se dibujan dentro de <CityMap>, después del mapa base.

   `k` es el factor de escala del marcador. Los trazos SVG viven en unidades de
   mundo, así que un encuadre cerrado los agranda en pantalla: sin `k`, el
   mismo marcador que se ve bien en el panel de la operadora tapa media
   pantalla en el móvil. Cada superficie pasa el suyo. */

const STATUS_FILL: Record<UnitStatus, string> = {
  active: '#22C55E',
  'on-trip': '#8B5CF6',
  offline: '#4A4360',
  blocked: '#EF4444',
};

/**
 * Ruta activa: casing oscuro + trazo de marca + guion animado en la dirección
 * de avance. El casing es lo que la despega del asfalto.
 */
export function RouteLine({
  d,
  animated = true,
  k = 1,
}: {
  d: string;
  animated?: boolean;
  k?: number;
}) {
  return (
    <g pointerEvents="none">
      <path
        d={d}
        fill="none"
        stroke="#08070C"
        strokeWidth={16 * k}
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d={d}
        fill="none"
        stroke="var(--brand-500)"
        strokeWidth={9 * k}
        strokeLinecap="round"
      />
      <path
        d={d}
        fill="none"
        stroke="#D6C9FF"
        strokeWidth={3 * k}
        strokeLinecap="round"
        strokeDasharray={`${2 * k} ${22 * k}`}
        opacity="0.9"
        style={
          animated ? { animation: 'dash-flow 1.1s linear infinite' } : undefined
        }
      />
    </g>
  );
}

/** Origen del viaje: anillo abierto, la convención cartográfica de "aquí". */
export function PickupPin({
  x,
  y,
  k = 1,
}: {
  x: number;
  y: number;
  k?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} pointerEvents="none">
      <circle r="15" fill="#08070C" opacity="0.6" />
      <circle r="11" fill="none" stroke="#F5F3F9" strokeWidth="5" />
      <circle r="4" fill="var(--brand-400)" />
    </g>
  );
}

/** Destino: banderín cuadrado, distinto en forma y no solo en color. */
export function DestPin({
  x,
  y,
  k = 1,
}: {
  x: number;
  y: number;
  k?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} pointerEvents="none">
      <path
        d="M 0 4 L 0 -34"
        stroke="#08070C"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M 0 4 L 0 -34"
        stroke="#F5F3F9"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="2" y="-34" width="26" height="19" rx="2" fill="#F5F3F9" />
      <rect x="2" y="-34" width="13" height="9.5" fill="#14121C" />
      <rect x="15" y="-24.5" width="13" height="9.5" fill="#14121C" />
      <circle cy="4" r="4.5" fill="#F5F3F9" />
    </g>
  );
}

/**
 * Unidad en el mapa. El numeral pintado de la puerta es el objeto — no un
 * punto de color anónimo: así se lee la flota igual que se lee la calle.
 */
export function UnitMarker({
  x,
  y,
  n,
  status,
  selected = false,
  heading = 0,
  k = 1,
}: {
  x: number;
  y: number;
  n: string;
  status: UnitStatus;
  selected?: boolean;
  heading?: number;
  k?: number;
}) {
  const fill = STATUS_FILL[status];
  const dark = status === 'offline';
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {selected && (
        <>
          <circle r="46" fill="var(--brand-a24)" />
          <circle r="34" fill="none" stroke="var(--brand-400)" strokeWidth="3" />
        </>
      )}
      {status === 'active' && !selected && (
        <circle r="30" fill={fill} opacity="0.14" />
      )}
      {/* Cuña de rumbo: hacia dónde apunta la unidad */}
      {status !== 'offline' && (
        <path
          d="M 0 -30 L 8 -19 L -8 -19 Z"
          fill={fill}
          transform={`rotate(${heading})`}
          opacity="0.9"
        />
      )}
      <rect
        x="-19"
        y="-14"
        width="38"
        height="28"
        rx="7"
        fill={fill}
        stroke="#08070C"
        strokeWidth="3"
      />
      <text
        y="7"
        fontSize="18"
        fontWeight="800"
        textAnchor="middle"
        fill={dark ? '#B9B2CC' : '#0B0A10'}
        letterSpacing="-0.4"
        style={{ pointerEvents: 'none' }}
      >
        {n}
      </text>
    </g>
  );
}

/** Solicitud sin asignar esperando en el mapa. */
export function RequestPin({
  x,
  y,
  selected = false,
  hot = false,
  k = 1,
}: {
  x: number;
  y: number;
  selected?: boolean;
  hot?: boolean;
  k?: number;
}) {
  const c = hot ? '#F59E0B' : '#F5F3F9';
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {selected && (
        <circle r="34" fill="var(--brand-a24)">
          <animate
            attributeName="r"
            values="26;40;26"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.45;0;0.45"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <path
        d="M 0 6 C -13 -8 -18 -15 -18 -23 A 18 18 0 1 1 18 -23 C 18 -15 13 -8 0 6 Z"
        fill={selected ? 'var(--brand-500)' : c}
        stroke="#08070C"
        strokeWidth="3"
      />
      <circle cy="-23" r="6.5" fill={selected ? '#F5F3F9' : '#14121C'} />
    </g>
  );
}

/** Halo de búsqueda: pulso concéntrico mientras se propone a conductores. */
export function SearchPulse({
  x,
  y,
  k = 1,
}: {
  x: number;
  y: number;
  k?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} pointerEvents="none">
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          r="20"
          fill="none"
          stroke="var(--brand-400)"
          strokeWidth="3"
          opacity="0"
        >
          <animate
            attributeName="r"
            values="20;150"
            dur="3s"
            begin={`${i}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.75;0"
            dur="3s"
            begin={`${i}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      <circle r="9" fill="var(--brand-400)" />
    </g>
  );
}
