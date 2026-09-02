'use client';

import { useCallback, useRef, useState, useMemo } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import styles from './Operadora.module.css';
import {
  UNITS,
  UNIT_POSITIONS,
  CITY_BOUNDS,
  project,
} from '@/data';
import type { Unit, Coordinates } from '@/data';

const SVG_W = 1000;
const SVG_H = 700;
const INITIAL_VB = { x: 0, y: 0, w: SVG_W, h: SVG_H };

const statusColors: Record<Unit['status'], string> = {
  active: 'var(--unit-active)',
  'on-trip': 'var(--unit-trip)',
  break: 'var(--unit-break)',
  offline: 'var(--fg-subtle)',
  blocked: 'var(--danger)',
};

/* ── Car marker orientation & tinting ── */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const CAR_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const CAR_VARIANT: Record<Unit['status'], string> = {
  active: '/cars/Group 2.svg',
  'on-trip': '/cars/Group 2.svg',
  break: '/cars/Group 1.svg',
  offline: '/cars/Group 1.svg',
  blocked: '/cars/Group 2.svg',
};

const CAR_FILTER: Record<Unit['status'], string> = {
  active: styles.carTintActive,
  'on-trip': styles.carTintOnTrip,
  break: styles.carTintBreak,
  offline: styles.carTintOffline,
  blocked: styles.carTintBlocked,
};

export type DispatcherMapProps = {
  onMapClick?: (coords: Coordinates) => void;
  pinOrigin?: Coordinates | null;
  pinDestination?: Coordinates | null;
  searchRadius?: number | null;
  searchOrigin?: Coordinates | null;
  highlightedUnitId?: string | null;
  selectingLocation?: 'origin' | 'destination' | null;
};

export function DispatcherMap({
  onMapClick,
  pinOrigin,
  pinDestination,
  searchRadius,
  searchOrigin,
  highlightedUnitId,
  selectingLocation,
}: DispatcherMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState(INITIAL_VB);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, vbX: 0, vbY: 0 });

  const screenToSvg = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;
      return {
        x: viewBox.x + (clientX - rect.left) * scaleX,
        y: viewBox.y + (clientY - rect.top) * scaleY,
      };
    },
    [viewBox]
  );

  const svgToWorldCoord = useCallback((sx: number, sy: number): Coordinates => {
    const b = CITY_BOUNDS;
    return {
      lng: b.west + (sx / SVG_W) * (b.east - b.west),
      lat: b.north - (sy / SVG_H) * (b.north - b.south),
    };
  }, []);

  const visibleTiles = useMemo(() => {
    const tl = svgToWorldCoord(viewBox.x, viewBox.y);
    const br = svgToWorldCoord(viewBox.x + viewBox.w, viewBox.y + viewBox.h);
    
    const north = Math.min(85, Math.max(-85, tl.lat));
    const south = Math.min(85, Math.max(-85, br.lat));
    const west = Math.max(-180, Math.min(180, tl.lng));
    const east = Math.max(-180, Math.min(180, br.lng));

    let z = 16 - Math.round(Math.log2(viewBox.w / SVG_W));
    z = Math.max(3, Math.min(19, z));

    // Add a padding of 2 tiles in all directions to cover side gaps caused by aspect ratio
    const minX = Math.floor((west + 180) / 360 * Math.pow(2, z)) - 2;
    const maxX = Math.floor((east + 180) / 360 * Math.pow(2, z)) + 2;
    const minY = Math.floor((1 - Math.log(Math.tan(north * Math.PI / 180) + 1 / Math.cos(north * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z)) - 2;
    const maxY = Math.floor((1 - Math.log(Math.tan(south * Math.PI / 180) + 1 / Math.cos(south * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z)) + 2;

    const tiles = [];
    let count = 0;
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= Math.max(minY, maxY); y++) {
        if (count++ > 150) break;
        
        const n1 = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
        const lat1 = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n1) - Math.exp(-n1)));
        const lon1 = x / Math.pow(2, z) * 360 - 180;
        
        const n2 = Math.PI - 2 * Math.PI * (y + 1) / Math.pow(2, z);
        const lat2 = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n2) - Math.exp(-n2)));
        const lon2 = (x + 1) / Math.pow(2, z) * 360 - 180;

        const p1 = project({ lat: lat1, lng: lon1 });
        const p2 = project({ lat: lat2, lng: lon2 });

        tiles.push({
          url: `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
          x: p1.x,
          y: p1.y,
          w: p2.x - p1.x,
          h: p2.y - p1.y,
        });
      }
    }
    return tiles;
  }, [viewBox, svgToWorldCoord]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, vbX: viewBox.x, vbY: viewBox.y };
    },
    [viewBox]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;
      const dx = (e.clientX - dragStart.current.x) * scaleX;
      const dy = (e.clientY - dragStart.current.y) * scaleY;
      setViewBox((v) => ({ ...v, x: dragStart.current.vbX - dx, y: dragStart.current.vbY - dy }));
    },
    [dragging, viewBox.w, viewBox.h]
  );

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
      const mouseY = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      const newW = Math.max(200, Math.min(SVG_W * 2, viewBox.w * factor));
      const newH = Math.max(140, Math.min(SVG_H * 2, viewBox.h * factor));
      const newX = mouseX - ((mouseX - viewBox.x) / viewBox.w) * newW;
      const newY = mouseY - ((mouseY - viewBox.y) / viewBox.h) * newH;
      setViewBox({ x: newX, y: newY, w: newW, h: newH });
    },
    [viewBox]
  );

  const zoomIn = useCallback(() => {
    setViewBox((v) => {
      const f = 0.75;
      const nw = Math.max(200, v.w * f);
      const nh = Math.max(140, v.h * f);
      return { x: v.x + (v.w - nw) / 2, y: v.y + (v.h - nh) / 2, w: nw, h: nh };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setViewBox((v) => {
      const f = 1.35;
      const nw = Math.min(SVG_W * 2, v.w * f);
      const nh = Math.min(SVG_H * 2, v.h * f);
      return { x: v.x + (v.w - nw) / 2, y: v.y + (v.h - nh) / 2, w: nw, h: nh };
    });
  }, []);

  const resetView = useCallback(() => setViewBox(INITIAL_VB), []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (Math.abs(e.clientX - dragStart.current.x) > 5) return;
      if (Math.abs(e.clientY - dragStart.current.y) > 5) return;
      if (!onMapClick) return;
      const pt = screenToSvg(e.clientX, e.clientY);
      const world = svgToWorldCoord(pt.x, pt.y);
      onMapClick(world);
    },
    [onMapClick, screenToSvg, svgToWorldCoord]
  );

  const originProj = pinOrigin ? project(pinOrigin) : null;
  const destProj = pinDestination ? project(pinDestination) : null;
  const searchOriginProj = searchOrigin ? project(searchOrigin) : null;
  const searching = searchRadius != null && searchRadius > 0;
  const maxR = searchRadius ?? 0;

  // Custom cursor for map pin
  const pinColor = selectingLocation === 'origin' ? '#10b981' : '#ef4444';
  const pinCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${pinColor}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`;
  
  const cursorStyle = selectingLocation 
    ? `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(pinCursorSvg)}") 12 24, crosshair`
    : dragging ? 'grabbing' : 'grab';

  return (
    <div className={styles.mapContainer}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block', cursor: cursorStyle }}
        role="img"
        aria-label="Mapa de Juliaca con unidades en tiempo real"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      >
        <defs>
          <radialGradient id="ambient" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#2c1a4d" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0b0616" stopOpacity="0" />
          </radialGradient>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Very dark purple background (behind tiles) */}
        <rect x={-5000} y={-5000} width={SVG_W + 10000} height={SVG_H + 10000} fill="#0b0616" />

        {/* OpenStreetMap Tiles Background styled with CSS filter to be purple */}
        {visibleTiles.map((t: { url: string; x: number; y: number; w: number; h: number }) => (
          <image
            key={t.url}
            href={t.url}
            x={t.x}
            y={t.y}
            width={t.w}
            height={t.h}
            preserveAspectRatio="none"
            className={styles.osmPurpleTile}
          />
        ))}

        {/* Ambient overlay to soften the tiles edges and add a central vignette */}
        <rect x={-500} y={-500} width={SVG_W + 1000} height={SVG_H + 1000} fill="url(#ambient)" pointerEvents="none" />

        {/* Search radius animation */}
        {searching && searchOriginProj && (
          <g>
            <circle cx={searchOriginProj.x} cy={searchOriginProj.y} r="5" fill="var(--accent)" opacity="0.9">
              <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.2s" repeatCount="indefinite" />
            </circle>
            {[0.3, 0.55, 0.8, 1.0].map((ratio: number, i: number) => {
              const r = maxR * ratio;
              if (r < 2) return null;
              const opacities = [0.3, 0.2, 0.12, 0.06];
              return (
                <circle key={`sr-${i}`} cx={searchOriginProj.x} cy={searchOriginProj.y} r={r}
                  fill="none" stroke="var(--accent)" strokeWidth="2" opacity={opacities[i]}
                  strokeDasharray="6 4">
                  <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1.5s" repeatCount="indefinite" />
                </circle>
              );
            })}
            <circle cx={searchOriginProj.x} cy={searchOriginProj.y} r={maxR * 0.15}
              fill="var(--accent)" opacity="0.08">
              <animate attributeName="r" values={`${maxR * 0.08};${maxR * 0.18};${maxR * 0.08}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* Unit car markers — SVGs from /public/cars/ with rotation + status circle + number */}
        {(() => {
          /* Dynamic car size: inversely proportional to zoom so cars stay visible when zoomed out */
          const zoomRatio = SVG_W / viewBox.w; // 0.5 at 2×out, 1 at default, 4 at 4×in
          const inv = Math.sqrt(Math.max(0.4, Math.min(3.0, 1 / zoomRatio))); // clamped inverse
          const bw = 5;  // base car width at default zoom
          const bh = 10; // base car height at default zoom
          const br = 2.2; // base circle radius
          const bt = 2.8; // base font size
          return UNITS.map((u) => {
          const pos = UNIT_POSITIONS[u.id];
          if (!pos) return null;
          const p = project(pos);
          const num = u.id.replace('u', '');
          const isHighlighted = highlightedUnitId === u.id;
          const seed = parseInt(u.id.replace(/\D/g, ''), 10) || 0;
          const angle = CAR_ANGLES[seed % CAR_ANGLES.length];
          const href = CAR_VARIANT[u.status];
          const tintClass = CAR_FILTER[u.status];
          const color = statusColors[u.status];
          const isVertical = href.includes('Group 1');
          /* Scale car dimensions dynamically with zoom */
          const w = isVertical ? bw * inv : bh * inv;
          const h = isVertical ? bh * inv : bw * inv;
          const cr = br * inv; // circle radius
          const fs = bt * inv; // font size
          return (
            <g key={u.id} transform={`translate(${p.x}, ${p.y})`}>
              {isHighlighted && (
                <>
                  <circle r={cr * 3.5} fill="var(--accent)" opacity="0.25" filter="url(#glowStrong)">
                    <animate attributeName="r" values={`${cr * 3};${cr * 4.5};${cr * 3}`} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.25;0.1;0.25" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle r={cr * 2.2} fill="var(--accent)" opacity="0.15" />
                </>
              )}
              <g transform={`rotate(${angle})`}>
                {/* Car image from /public/cars/ */}
                <image
                  href={href}
                  width={w}
                  height={h}
                  x={-w / 2}
                  y={-h / 2}
                  className={tintClass}
                  style={{ pointerEvents: 'none' }}
                />
                {/* Status circle (color changes by state) — on car body */}
                <circle cx="0" cy={isVertical ? cr * 0.5 : 0} r={cr} fill={color} stroke="#1a1028" strokeWidth={cr * 0.15} />
                {/* Unit number inside the circle */}
                <text
                  x="0"
                  y={isVertical ? cr * 0.9 : cr * 0.4}
                  fontSize={fs}
                  fill="#ffffff"
                  textAnchor="middle"
                  fontWeight="800"
                  fontFamily="sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {num}
                </text>
              </g>
            </g>
          );
          });
        })()}

        {/* Origin pin */}
        {originProj && (
          <g transform={`translate(${originProj.x}, ${originProj.y})`}>
            <circle r="12" fill="var(--success)" opacity="0.12">
              <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="6" fill="var(--success)" stroke="var(--bg)" strokeWidth="1.5" />
            <text y="2.5" fontSize="5" fill="#fff" textAnchor="middle" fontWeight="700"
              style={{ pointerEvents: 'none' }}>O</text>
          </g>
        )}

        {/* Destination pin */}
        {destProj && (
          <g transform={`translate(${destProj.x}, ${destProj.y})`}>
            <circle r="12" fill="var(--danger)" opacity="0.12">
              <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="6" fill="var(--danger)" stroke="var(--bg)" strokeWidth="1.5" />
            <text y="2.5" fontSize="5" fill="#fff" textAnchor="middle" fontWeight="700"
              style={{ pointerEvents: 'none' }}>D</text>
          </g>
        )}
      </svg>

      {/* Zoom controls */}
      <div className={styles.mapControls}>
        <button className={styles.mapControl} aria-label="Acercar" onClick={zoomIn}><Plus size={16} /></button>
        <button className={styles.mapControl} aria-label="Alejar" onClick={zoomOut}><Minus size={16} /></button>
        <button className={styles.mapControl} aria-label="Restablecer vista" onClick={resetView}><RotateCcw size={16} /></button>
      </div>

      {/* Legend */}
      <div className={styles.mapLegend}>
        <div className={styles.legendItem}>
          <svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 4 L2 1 L14 1 L15 4 L15 8 L1 8 Z" fill="var(--unit-active)" stroke="var(--bg)" strokeWidth="0.8" /></svg>
          Disponible
        </div>
        <div className={styles.legendItem}>
          <svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 4 L2 1 L14 1 L15 4 L15 8 L1 8 Z" fill="var(--unit-trip)" stroke="var(--bg)" strokeWidth="0.8" /></svg>
          En viaje
        </div>
        <div className={styles.legendItem}>
          <svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 4 L2 1 L14 1 L15 4 L15 8 L1 8 Z" fill="var(--unit-break)" stroke="var(--bg)" strokeWidth="0.8" /></svg>
          Descanso
        </div>
        <div className={styles.legendItem}>
          <svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 4 L2 1 L14 1 L15 4 L15 8 L1 8 Z" fill="var(--fg-subtle)" stroke="var(--bg)" strokeWidth="0.8" /></svg>
          Offline
        </div>
      </div>
    </div>
  );
}
