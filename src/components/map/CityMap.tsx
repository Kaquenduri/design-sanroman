import type { ReactNode } from 'react';
import {
  ARTERIALS,
  SECONDARY,
  LOCALS,
  BLOCKS,
  PARKS,
  RIVER,
  PLAZA,
  ANILLOS,
  LANDMARKS,
  WORLD,
} from '@/lib/city';

type Props = {
  /** Recorte del mundo 1600×1200. Cada superficie encuadra lo que necesita. */
  viewBox: string;
  /** Anillos tarifarios concéntricos — solo la operadora los necesita ver. */
  rings?: boolean;
  /** Nombres de vías. Se apagan cuando el encuadre es muy cerrado. */
  labels?: boolean;
  /** Referencias urbanas. Se apagan en encuadres cerrados, donde el recorte
      las parte por la mitad y una etiqueta cortada parece un defecto. */
  landmarks?: boolean;
  /** Atenúa el mapa cuando la superficie no está operando (conductor offline). */
  dimmed?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Motor cartográfico compartido por las tres superficies.
 *
 * El truco para que un mapa sintético se lea como mapa es el "casing": cada vía
 * se dibuja dos veces, un trazo oscuro más ancho debajo y el asfalto encima.
 * Eso produce las intersecciones y la jerarquía que un grid de líneas planas
 * nunca da.
 */
export function CityMap({
  viewBox,
  rings = false,
  labels = true,
  landmarks = true,
  dimmed = false,
  className,
  children,
}: Props) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label="Mapa del casco urbano de Juliaca (representación sintética)"
    >
      <defs>
        <radialGradient id="cm-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cm-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B2C4A" />
          <stop offset="100%" stopColor="#152238" />
        </linearGradient>
      </defs>

      <g opacity={dimmed ? 0.62 : 1}>
        {/* Suelo. Desborda el mundo a propósito: si la cámara se asoma fuera
            del casco, sin este margen aparece una banda negra vacía. */}
        <rect
          x={-900}
          y={-900}
          width={WORLD.w + 1800}
          height={WORLD.h + 1800}
          fill="var(--map-land)"
        />

        {/* Halo de marca sobre la plaza — orienta la vista sin dibujar nada */}
        <circle
          cx={PLAZA.x}
          cy={PLAZA.y}
          r="620"
          fill="url(#cm-glow)"
          pointerEvents="none"
        />

        {/* Manzanas */}
        <g>
          {BLOCKS.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="3"
              fill={b.tone ? 'var(--map-block-alt)' : 'var(--map-block)'}
            />
          ))}
        </g>

        {/* Parques */}
        {PARKS.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              rx="10"
              fill="var(--map-park)"
              stroke="var(--map-park-edge)"
              strokeWidth="1.5"
            />
            {labels && p.name && (
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2 + 4}
                fontSize="15"
                fill="#3E6B4E"
                textAnchor="middle"
                fontWeight="600"
                letterSpacing="0.4"
              >
                {p.name}
              </text>
            )}
          </g>
        ))}

        {/* Río — casing + agua */}
        <path
          d={RIVER}
          stroke="var(--map-water-edge)"
          strokeWidth="86"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={RIVER}
          stroke="url(#cm-water)"
          strokeWidth="78"
          fill="none"
          strokeLinecap="round"
        />
        {labels && (
          <text
            x="150"
            y="1104"
            fontSize="16"
            fill="#4A6A96"
            fontWeight="600"
            fontStyle="italic"
            letterSpacing="0.6"
          >
            Río Coata
          </text>
        )}

        {/* Calles locales — el grano que sostiene los encuadres cerrados */}
        <g strokeLinecap="round">
          {LOCALS.map((s, i) => (
            <line
              key={`lc-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="var(--map-road-casing)"
              strokeWidth="8"
            />
          ))}
          {LOCALS.map((s, i) => (
            <line
              key={`lf-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="var(--map-road-local)"
              strokeWidth="5"
            />
          ))}
        </g>

        {/* Vías secundarias */}
        <g strokeLinecap="round">
          {SECONDARY.map((s, i) => (
            <line
              key={`sc-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="var(--map-road-casing)"
              strokeWidth="15"
            />
          ))}
          {SECONDARY.map((s, i) => (
            <line
              key={`sf-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="var(--map-road-secondary)"
              strokeWidth="10"
            />
          ))}
        </g>

        {/* Vías arteriales */}
        <g strokeLinecap="round">
          {ARTERIALS.map((s, i) => (
            <line
              key={`ac-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="var(--map-road-casing)"
              strokeWidth="30"
            />
          ))}
          {ARTERIALS.map((s, i) => (
            <line
              key={`af-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="var(--map-road-arterial)"
              strokeWidth="22"
            />
          ))}
        </g>

        {/* Plaza de Armas */}
        <g>
          <rect
            x={PLAZA.x - 66}
            y={PLAZA.y - 54}
            width="132"
            height="108"
            rx="8"
            fill="#183024"
            stroke="#24462F"
            strokeWidth="2"
          />
          <circle cx={PLAZA.x} cy={PLAZA.y} r="22" fill="#20402C" />
          {labels && (
            <text
              x={PLAZA.x}
              y={PLAZA.y + 78}
              fontSize="16"
              fill="var(--map-label-strong)"
              textAnchor="middle"
              fontWeight="700"
              letterSpacing="0.5"
            >
              Plaza de Armas
            </text>
          )}
        </g>

        {/* Etiquetas de vía — horizontales sobre el asfalto, verticales giradas */}
        {labels && (
          <g
            fontSize="15"
            fill="var(--map-label)"
            fontWeight="600"
            letterSpacing="0.8"
          >
            {ARTERIALS.filter((a) => a.y1 === a.y2 && a.name).map((a, i) => (
              <text key={`lh-${i}`} x={64} y={a.y1 - 16}>
                {a.name}
              </text>
            ))}
            {ARTERIALS.filter((a) => a.x1 === a.x2 && a.name).map((a, i) => (
              <text
                key={`lv-${i}`}
                x={0}
                y={0}
                transform={`translate(${a.x1 - 15}, ${1030}) rotate(-90)`}
              >
                {a.name}
              </text>
            ))}
          </g>
        )}

        {/* Referencias del dominio */}
        {labels &&
          landmarks &&
          LANDMARKS.map((l, i) => (
            <g key={`lm-${i}`}>
              <circle cx={l.x} cy={l.y} r="4" fill="var(--map-label)" />
              <text
                x={l.x + 10}
                y={l.y + 5}
                fontSize="14"
                fill="var(--map-label)"
                fontWeight="500"
              >
                {l.label}
              </text>
            </g>
          ))}
      </g>

      {/* Anillos tarifarios — la estructura de precio hecha visible.
          Las etiquetas van sobre la diagonal inferior izquierda y llevan
          placa propia: encima de la trama, el texto suelto no sobrevive. */}
      {rings && (
        <g pointerEvents="none">
          {[...ANILLOS].reverse().map((a) => (
            <circle
              key={a.n}
              cx={PLAZA.x}
              cy={PLAZA.y}
              r={a.r}
              fill="none"
              stroke="var(--brand-a24)"
              strokeWidth="2"
              strokeDasharray="10 10"
            />
          ))}
        </g>
      )}

      {children}

      {/* Las etiquetas de anillo van al final, por encima de los marcadores:
          dibujadas antes, una unidad encima tapaba el precio. */}
      {rings && (
        <g pointerEvents="none">
          {ANILLOS.map((a) => {
            // Diagonal inferior derecha: es el cuadrante que queda dentro del
            // recorte en los tres encuadres, a diferencia del izquierdo.
            const rad = (55 * Math.PI) / 180;
            // El redondeo estabiliza el atributo SVG entre el motor de Node y
            // el navegador; el último decimal no tiene efecto visual.
            const x = Math.round((PLAZA.x + Math.cos(rad) * a.r) * 1000) / 1000;
            const y = Math.round((PLAZA.y + Math.sin(rad) * a.r) * 1000) / 1000;
            const label = `Anillo ${a.n} · S/ ${a.tarifa.toFixed(2)}`;
            const w = label.length * 8.4 + 18;
            return (
              <g key={`rt-${a.n}`} transform={`translate(${x} ${y})`}>
                <rect
                  x={-w / 2}
                  y={-13}
                  width={w}
                  height={26}
                  rx={13}
                  fill="var(--glass-strong)"
                  stroke="var(--brand-a24)"
                  strokeWidth="1"
                />
                <text
                  y="5"
                  fontSize="15"
                  fill="var(--brand-300)"
                  textAnchor="middle"
                  fontWeight="700"
                  letterSpacing="0.3"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
