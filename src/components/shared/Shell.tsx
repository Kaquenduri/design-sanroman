'use client';

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CityMap } from '@/components/map/CityMap';
import { IconButton } from '@/components/ui';
import s from './Shell.module.css';

const cx = (...v: (string | false | undefined)[]) => v.filter(Boolean).join(' ');

export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx(s.shell, className)}>{children}</div>;
}

/** Encuadre cuadrado del mundo centrado en un punto. */
export function camera(cx0: number, cy0: number, size: number): string {
  return `${cx0 - size / 2} ${cy0 - size / 2} ${size} ${size}`;
}

/* Proporción del lado del viewBox que queda visible en horizontal en un
   teléfono (390/844), con preserveAspectRatio="slice". */
const PHONE_ASPECT = 390 / 844;

/**
 * Encuadre que mete los puntos de interés en la franja de mapa que la hoja
 * inferior deja libre.
 *
 * Centrar en el punto medio a secas es el error obvio: la hoja tapa la mitad
 * inferior, así que la acción queda justo detrás de ella. Aquí el centro de
 * cámara se baja para que lo importante suba a la franja visible.
 */
export function fitCamera(
  points: { x: number; y: number }[],
  opts: { pad?: number; min?: number; band?: number } = {}
): string {
  const pad = opts.pad ?? 95;
  const min = opts.min ?? 430;
  const band = opts.band ?? 0.46; // fracción vertical libre sobre la hoja

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const need = Math.max(
    min,
    (maxX - minX + pad * 2) / PHONE_ASPECT,
    (maxY - minY + pad * 2) / band
  );

  const cx0 = (minX + maxX) / 2;
  const cy0 = (minY + maxY) / 2 + (need * (1 - band)) / 2;
  return camera(cx0, cy0, need);
}

/** Lado del viewBox, para derivar la escala de los marcadores. */
export function cameraSize(viewBox: string): number {
  return Number(viewBox.split(' ')[2]) || 1000;
}

/**
 * Factor de escala de marcadores: mantiene su tamaño aparente en pantalla
 * aunque el encuadre cambie de zoom entre pantallas.
 */
export function markerScale(viewBox: string): number {
  return Math.max(0.34, Math.min(1, cameraSize(viewBox) / 1150));
}

export function MapLayer({
  viewBox,
  dimmed,
  labels = true,
  rings,
  children,
}: {
  viewBox: string;
  dimmed?: boolean;
  labels?: boolean;
  rings?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={s.mapLayer}>
      <CityMap
        viewBox={viewBox}
        dimmed={dimmed}
        labels={labels}
        landmarks={cameraSize(viewBox) >= 900}
        rings={rings}
      >
        {children}
      </CityMap>
      <div className={s.scrim} aria-hidden />
    </div>
  );
}

export function TopChrome({ children }: { children: ReactNode }) {
  return <div className={s.top}>{children}</div>;
}

export function Grow() {
  return <div className={s.grow} />;
}

export function StatusPill({
  live,
  children,
}: {
  live?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={cx(s.statusPill, live && s.statusPillLive)}>
      {children}
    </span>
  );
}

export function BottomStack({ children }: { children: ReactNode }) {
  return <div className={s.bottom}>{children}</div>;
}

export function TabBar<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; icon: ReactNode }[];
}) {
  return (
    <nav className={s.tabs} aria-label="Navegación principal">
      {items.map((it) => (
        <button
          key={it.value}
          className={cx(s.tab, it.value === value && s.tabActive)}
          onClick={() => onChange(it.value)}
          aria-current={it.value === value ? 'page' : undefined}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </nav>
  );
}

export function Panel({
  title,
  onBack,
  action,
  children,
}: {
  title: string;
  onBack: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={s.panel}>
      <header className={s.panelHead}>
        <IconButton variant="neutral" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={19} />
        </IconButton>
        <h2 className={s.panelTitle}>{title}</h2>
        {action}
      </header>
      <div className={s.panelBody}>{children}</div>
    </section>
  );
}

export function MapControls({ children }: { children: ReactNode }) {
  return <div className={s.mapControls}>{children}</div>;
}
