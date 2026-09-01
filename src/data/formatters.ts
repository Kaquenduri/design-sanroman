import type { Membership, Unit } from './types';

export function formatPEN(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

export function formatKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatTimeAMPM(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function membershipBadge(m: Membership) {
  if (m.status === 'activa') {
    return { label: 'Activa', color: 'success' as const };
  }
  if (m.status === 'vence-pronto') {
    return {
      label: m.daysToExpire <= 7 ? `Vence en ${m.daysToExpire}d` : 'Vence pronto',
      color: 'warning' as const,
    };
  }
  return { label: 'Vencida', color: 'danger' as const };
}

export function statusLabel(s: Unit['status']): string {
  switch (s) {
    case 'active': return 'Disponible';
    case 'on-trip': return 'En viaje';
    case 'break': return 'Descanso';
    case 'offline': return 'Sin conexión';
    case 'blocked': return 'Bloqueada';
  }
}

export function statusColor(s: Unit['status']): 'success' | 'unit-trip' | 'unit-break' | 'muted' | 'danger' {
  switch (s) {
    case 'active': return 'success';
    case 'on-trip': return 'unit-trip';
    case 'break': return 'unit-break';
    case 'offline': return 'muted';
    case 'blocked': return 'danger';
  }
}
