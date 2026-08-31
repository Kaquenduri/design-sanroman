import type { Membership, UnitStatus, FareLine, VehicleCategory } from './types';
import { anilloDe, type WorldPoint } from '@/lib/city';

export function formatPEN(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

export function formatKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

/** mm:ss para cronómetros de espera y de viaje. */
export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatHM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

export function membershipBadge(m: Membership): {
  label: string;
  tone: 'success' | 'warning' | 'danger';
} {
  if (m.status === 'activa') return { label: 'Vigente', tone: 'success' };
  if (m.status === 'vence-pronto') {
    return { label: `Vence en ${m.daysToExpire} d`, tone: 'warning' };
  }
  return { label: 'Vencida', tone: 'danger' };
}

export function statusLabel(s: UnitStatus): string {
  switch (s) {
    case 'active':
      return 'Disponible';
    case 'on-trip':
      return 'En viaje';
    case 'offline':
      return 'Sin conexión';
    case 'blocked':
      return 'Bloqueada';
  }
}

export function statusTone(
  s: UnitStatus
): 'success' | 'brand' | 'neutral' | 'danger' {
  switch (s) {
    case 'active':
      return 'success';
    case 'on-trip':
      return 'brand';
    case 'offline':
      return 'neutral';
    case 'blocked':
      return 'danger';
  }
}

/**
 * Desglose de tarifa según el ERD: base del anillo del punto de recogida más
 * el recargo de categoría. Sin tarifa dinámica — el gremio cobra tarifa fija.
 */
export function fareBreakdown(
  pickup: WorldPoint,
  category: VehicleCategory
): { lines: FareLine[]; total: number } {
  const anillo = anilloDe(pickup.x, pickup.y);
  const lines: FareLine[] = [
    {
      concepto: 'BASE_ANILLO',
      label: anillo.nombre,
      amount: anillo.tarifa,
    },
  ];
  if (category.extra > 0) {
    lines.push({
      concepto: 'RECARGO_CARGA',
      label: `Categoría ${category.label}`,
      amount: category.extra,
    });
  }
  return {
    lines,
    total: lines.reduce((sum, l) => sum + l.amount, 0),
  };
}
