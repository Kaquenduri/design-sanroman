'use client';

import { useEffect, useState } from 'react';
import { Navigation } from 'lucide-react';

type Props = {
  mode: 'heading' | 'in-trip' | 'idle';
};

// Pure-SVG mock map of central Juliaca with simple street grid.
// No external maps API. Renders streets, blocks, and an animated car/pin.
export function MiniMap({ mode }: Props) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => (x + 1) % 1000), 80);
    return () => clearInterval(id);
  }, []);

  // Animated position: car moves toward target along a polyline
  const path = mode === 'in-trip'
    ? 'M 60 280 C 90 240, 130 220, 170 200 S 240 150, 290 110'
    : 'M 60 240 Q 110 200, 150 180 T 240 130';

  const pos = positionOnPath(t, path);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0d1726' }}>
      <svg
        viewBox="0 0 360 360"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
        aria-label="Mapa simulado"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#16243b" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="ambient" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0d1726" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="360" height="360" fill="url(#grid)" />
        <rect width="360" height="360" fill="url(#ambient)" />

        {/* Streets — major */}
        <line x1="0" y1="120" x2="360" y2="120" stroke="#2a3b5c" strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="220" x2="360" y2="220" stroke="#2a3b5c" strokeWidth="6" strokeLinecap="round" />
        <line x1="100" y1="0" x2="100" y2="360" stroke="#2a3b5c" strokeWidth="6" strokeLinecap="round" />
        <line x1="240" y1="0" x2="240" y2="360" stroke="#2a3b5c" strokeWidth="6" strokeLinecap="round" />

        {/* Streets — minor */}
        <line x1="0" y1="60" x2="360" y2="60" stroke="#1f2d44" strokeWidth="2" />
        <line x1="0" y1="180" x2="360" y2="180" stroke="#1f2d44" strokeWidth="2" />
        <line x1="0" y1="280" x2="360" y2="280" stroke="#1f2d44" strokeWidth="2" />
        <line x1="40" y1="0" x2="40" y2="360" stroke="#1f2d44" strokeWidth="2" />
        <line x1="170" y1="0" x2="170" y2="360" stroke="#1f2d44" strokeWidth="2" />
        <line x1="300" y1="0" x2="300" y2="360" stroke="#1f2d44" strokeWidth="2" />

        {/* Plaza / landmark */}
        <circle cx="180" cy="120" r="14" fill="#1a2a44" stroke="#3b5275" strokeWidth="1.5" />
        <text x="180" y="124" fontSize="9" fill="#6b7589" textAnchor="middle">
          Plaza
        </text>

        {/* Route polyline */}
        <path
          d={path}
          stroke="#2563eb"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="6 6"
          opacity="0.85"
        />

        {/* Passenger pin */}
        {mode !== 'idle' && (
          <g>
            <circle cx="290" cy="110" r="14" fill="#2563eb" opacity="0.18" />
            <circle cx="290" cy="110" r="7" fill="#2563eb" />
            <circle cx="290" cy="110" r="3" fill="#fff" />
          </g>
        )}

        {/* Car / driver pin */}
        <g transform={`translate(${pos.x - 12}, ${pos.y - 12})`}>
          <circle cx="12" cy="12" r="14" fill="#facc15" opacity="0.22" />
          <circle cx="12" cy="12" r="9" fill="#facc15" />
          <Navigation
            x={5}
            y={4}
            size={14}
            color="#0b1220"
            style={{ transform: `rotate(${pos.angle + 90}deg)`, transformOrigin: '12px 12px' }}
          />
        </g>

        {/* Street labels */}
        <text x="110" y="114" fontSize="9" fill="#3b5275" fontWeight="500">Jr. Piura</text>
        <text x="250" y="214" fontSize="9" fill="#3b5275" fontWeight="500">Av. San Martín</text>
        <text x="44" y="56" fontSize="9" fill="#3b5275">Jr. Loreto</text>
        <text x="174" y="56" fontSize="9" fill="#3b5275">Jr. Bolognesi</text>
      </svg>
    </div>
  );
}

// Linear interpolation along a simplified polyline of cubic/quadratic curves.
function positionOnPath(t: number, d: string) {
  // Sample 60 points along the path and pick the one matching t.
  const samples: { x: number; y: number; angle: number }[] = [];
  const N = 60;
  let prev: { x: number; y: number } | null = null;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = sampleBezier(d, u);
    const angle = prev
      ? (Math.atan2(p.y - prev.y, p.x - prev.x) * 180) / Math.PI
      : 0;
    samples.push({ x: p.x, y: p.y, angle });
    prev = p;
  }
  return samples[Math.floor((t / 1000) * N)];
}

function sampleBezier(d: string, u: number) {
  // Parse a simple bezier path like "M 60 240 Q 110 200, 150 180 T 240 130"
  // by splitting into segments. Only handles M/Q/T/C commands used here.
  const tokens = d.split(/[\s,]+/).filter(Boolean);
  let i = 0;
  let cx = 0,
    cy = 0;
  let startX = 0,
    startY = 0;
  let prevC: { x: number; y: number } | null = null;
  let prevQ: { x: number; y: number } | null = null;
  const segments: { type: string; args: number[] }[] = [];
  while (i < tokens.length) {
    const tk = tokens[i];
    if (tk === 'M' || tk === 'L') {
      const x = +tokens[++i];
      const y = +tokens[++i];
      segments.push({ type: 'L', args: [x, y] });
      cx = x;
      cy = y;
      startX = x;
      startY = y;
      i++;
    } else if (tk === 'Q') {
      const cxq = +tokens[++i],
        cyq = +tokens[++i],
        x = +tokens[++i],
        y = +tokens[++i];
      segments.push({ type: 'Q', args: [cx, cy, cxq, cyq, x, y] });
      prevQ = { x: cxq, y: cyq };
      cx = x;
      cy = y;
      i++;
    } else if (tk === 'T') {
      const x = +tokens[++i],
        y = +tokens[++i];
      const ref = prevQ ?? { x: cx, y: cy };
      const mx: number = 2 * cx - ref.x;
      const my: number = 2 * cy - ref.y;
      segments.push({ type: 'Q', args: [cx, cy, mx, my, x, y] });
      prevQ = { x: mx, y: my };
      cx = x;
      cy = y;
      i++;
    } else if (tk === 'C') {
      const x1 = +tokens[++i],
        y1 = +tokens[++i],
        x2 = +tokens[++i],
        y2 = +tokens[++i],
        x = +tokens[++i],
        y = +tokens[++i];
      segments.push({ type: 'C', args: [cx, cy, x1, y1, x2, y2, x, y] });
      cx = x;
      cy = y;
      i++;
    } else {
      i++;
    }
  }
  const seg = segments[Math.min(u === 1 ? segments.length - 1 : Math.floor(u * segments.length), segments.length - 1)];
  const localU = u * segments.length - Math.floor(u * segments.length);
  if (seg.type === 'L') {
    return { x: seg.args[0], y: seg.args[1] };
  }
  if (seg.type === 'Q') {
    const [x0, y0, x1, y1, x2, y2] = seg.args;
    const inv = 1 - localU;
    return {
      x: inv * inv * x0 + 2 * inv * localU * x1 + localU * localU * x2,
      y: inv * inv * y0 + 2 * inv * localU * y1 + localU * localU * y2,
    };
  }
  if (seg.type === 'C') {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = seg.args;
    const inv = 1 - localU;
    return {
      x:
        inv * inv * inv * x0 +
        3 * inv * inv * localU * x1 +
        3 * inv * localU * localU * x2 +
        localU * localU * localU * x3,
      y:
        inv * inv * inv * y0 +
        3 * inv * inv * localU * y1 +
        3 * inv * localU * localU * y2 +
        localU * localU * localU * y3,
    };
  }
  return { x: cx, y: cy };
}
