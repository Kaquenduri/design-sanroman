'use client';
import { useEffect, useState } from 'react';
import { fetchRoadRoute, type RoadRoute } from '@/lib/routing';
import type { GeoPoint } from '@/lib/juliaca';

export function useRoadRoute(from: GeoPoint | null, to: GeoPoint | null) {
  const [route, setRoute] = useState<RoadRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setRoute(null); setError(false);
    if (!from || !to) return () => { active = false; };
    setLoading(true);
    fetchRoadRoute(from, to).then((result) => { if (active) setRoute(result); }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);
  return { route, loading, error };
}
