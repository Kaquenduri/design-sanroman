'use client';

import type { Unit, PendingRequest, Coordinates } from '@/data';

type Props = {
  units: Unit[];
  positions: Record<string, Coordinates>;
  bounds: { west: number; east: number; south: number; north: number };
  requests: PendingRequest[];
  selectedRequestId: string | null;
};

const W = 1000;
const H = 700;

function project(c: Coordinates, b: Props['bounds']): { x: number; y: number } {
  return {
    x: ((c.lng - b.west) / (b.east - b.west)) * W,
    y: H - ((c.lat - b.south) / (b.north - b.south)) * H,
  };
}

const statusFill: Record<Unit['status'], string> = {
  active: 'var(--success)',
  'on-trip': 'var(--taxi)',
  offline: 'var(--fg-subtle)',
  blocked: 'var(--danger)',
};

export function DispatcherMap({
  units,
  positions,
  bounds,
  requests,
  selectedRequestId,
}: Props) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}
      role="img"
      aria-label="Mapa de Juliaca con unidades en tiempo real"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#16243b" strokeWidth="0.6" />
        </pattern>
        <radialGradient id="ambient" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#0a1322" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="#0a1322" />
      <rect width={W} height={H} fill="url(#grid)" />
      <rect width={W} height={H} fill="url(#ambient)" />

      {/* "River" — synthetic band suggesting Juliaca's geography */}
      <path
        d="M 0 580 Q 200 540, 380 560 T 720 540 T 1000 560"
        stroke="url(#riverGrad)"
        strokeWidth="50"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M 0 580 Q 200 540, 380 560 T 720 540 T 1000 560"
        stroke="#1e3a5f"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
      <text x="40" y="615" fontSize="10" fill="#3b5275" fontWeight="500">
        Río Coata
      </text>

      {/* Park / green area */}
      <rect x="640" y="120" width="180" height="120" fill="#1a3326" rx="8" opacity="0.7" />
      <text x="660" y="190" fontSize="10" fill="#4a6b5a">
        Parque Ecológico
      </text>

      {/* Major avenues */}
      <line x1="0" y1="220" x2={W} y2="220" stroke="#2a3b5c" strokeWidth="8" strokeLinecap="round" />
      <text x="20" y="212" fontSize="11" fill="#4a6080" fontWeight="600">
        Av. San Martín
      </text>
      <line x1="0" y1="380" x2={W} y2="380" stroke="#2a3b5c" strokeWidth="8" strokeLinecap="round" />
      <text x="20" y="372" fontSize="11" fill="#4a6080" fontWeight="600">
        Av. Circunvalación
      </text>
      <line x1="0" y1="500" x2={W} y2="500" stroke="#2a3b5c" strokeWidth="6" strokeLinecap="round" />
      <line x1="180" y1="0" x2="180" y2={H} stroke="#2a3b5c" strokeWidth="8" strokeLinecap="round" />
      <text x="190" y="30" fontSize="11" fill="#4a6080" fontWeight="600">
        Jr. Piura
      </text>
      <line x1="420" y1="0" x2="420" y2={H} stroke="#2a3b5c" strokeWidth="8" strokeLinecap="round" />
      <text x="430" y="30" fontSize="11" fill="#4a6080" fontWeight="600">
        Jr. Bolognesi
      </text>
      <line x1="700" y1="0" x2="700" y2={H} stroke="#2a3b5c" strokeWidth="8" strokeLinecap="round" />
      <text x="710" y="30" fontSize="11" fill="#4a6080" fontWeight="600">
        Av. El Sol
      </text>
      <line x1="880" y1="0" x2="880" y2={H} stroke="#2a3b5c" strokeWidth="6" strokeLinecap="round" />

      {/* Secondary streets */}
      {[80, 140, 280, 340, 460, 540, 620, 780, 820, 920].map((y, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={y}
          x2={W}
          y2={y}
          stroke="#1f2d44"
          strokeWidth="1.5"
          opacity="0.7"
        />
      ))}
      {[60, 120, 260, 340, 380, 480, 560, 620, 760, 840, 940].map((x, i) => (
        <line
          key={`v-${i}`}
          x1={x}
          y1="0"
          x2={x}
          y2={H}
          stroke="#1f2d44"
          strokeWidth="1.5"
          opacity="0.7"
        />
      ))}

      {/* Plaza de Armas */}
      <g>
        <rect x="160" y="100" width="44" height="40" fill="#1a2a44" stroke="#3b5275" strokeWidth="1.5" rx="3" />
        <text x="182" y="125" fontSize="10" fill="#7a8aa5" textAnchor="middle">
          Plaza
        </text>
      </g>

      {/* Units */}
      {units.map((u) => {
        const p = positions[u.id];
        if (!p) return null;
        const proj = project(p, bounds);
        const fill = statusFill[u.status];
        const isBlocked = u.status === 'blocked';
        return (
          <g key={u.id} transform={`translate(${proj.x}, ${proj.y})`}>
            {isBlocked && (
              <circle r="14" fill="var(--danger)" opacity="0.18" />
            )}
            <circle r="9" fill={fill} stroke="#0a1322" strokeWidth="2" />
            {u.status === 'active' && (
              <circle r="14" fill={fill} opacity="0.18" />
            )}
            <text
              y="3"
              fontSize="9"
              fill="#0a1322"
              textAnchor="middle"
              fontWeight="700"
              style={{ pointerEvents: 'none' }}
            >
              {u.id.replace('u', '')}
            </text>
          </g>
        );
      })}

      {/* Requests */}
      {requests.map((r) => {
        const proj = project(r.pickup, bounds);
        const isSel = r.id === selectedRequestId;
        return (
          <g key={r.id} transform={`translate(${proj.x}, ${proj.y})`}>
            {isSel && <circle r="22" fill="var(--accent)" opacity="0.18" />}
            <circle r="11" fill={isSel ? 'var(--accent)' : '#475569'} opacity="0.85" />
            <circle r="4" fill="#fff" />
          </g>
        );
      })}

      {/* Center label */}
      <g transform={`translate(${W / 2}, ${H - 30})`}>
        <text textAnchor="middle" fontSize="10" fill="#3b5275" fontWeight="600" letterSpacing="2">
          JULIACA · CENTRO
        </text>
      </g>
    </svg>
  );
}
