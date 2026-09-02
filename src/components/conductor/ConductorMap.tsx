'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { JULIACA_BOUNDS, JULIACA_CENTER, type GeoPoint } from '@/lib/juliaca';
import c from './Conductor.module.css';

type Props = {
  car: GeoPoint;
  pickup: GeoPoint | null;
  destination: GeoPoint | null;
  route: GeoPoint[];
  selected: boolean;
};

function FitRoute({ points }: { points: GeoPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.flyTo([points[0].lat, points[0].lng], 16);
    else map.fitBounds(points.map((point) => [point.lat, point.lng]), { paddingTopLeft: [28, 80], paddingBottomRight: [28, 360], maxZoom: 17 });
  }, [map, points]);
  return null;
}

const pin = (kind: 'pickup' | 'destination') => L.divIcon({ className: `driver-pin driver-pin--${kind}`, html: '<span></span>', iconSize: [30, 36], iconAnchor: [15, 32] });

export function ConductorMap({ car, pickup, destination, route, selected }: Props) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const carIcon = useMemo(() => L.divIcon({ className: `driver-car${selected ? ' driver-car--selected' : ''}`, html: `<img src="${basePath}/icono_carro_1.svg" alt=""><span></span>`, iconSize: [58, 58], iconAnchor: [29, 29] }), [basePath, selected]);
  const fitPoints = route.length > 1 ? route : [car, ...(pickup ? [pickup] : []), ...(destination ? [destination] : [])];
  return (
    <div className={c.leafletMap}>
      <MapContainer center={[JULIACA_CENTER.lat, JULIACA_CENTER.lng]} zoom={15} minZoom={12} maxZoom={19} maxBounds={[[JULIACA_BOUNDS.south, JULIACA_BOUNDS.west], [JULIACA_BOUNDS.north, JULIACA_BOUNDS.east]]} maxBoundsViscosity={0.82} zoomControl={false} attributionControl>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url={process.env.NEXT_PUBLIC_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} />
        <FitRoute points={fitPoints} />
        {route.length > 1 && <Polyline positions={route.map((point) => [point.lat, point.lng])} className={c.driverRoadRoute} />}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pin('pickup')} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={pin('destination')} />}
        <Marker position={[car.lat, car.lng]} icon={carIcon} zIndexOffset={500} />
      </MapContainer>
    </div>
  );
}
