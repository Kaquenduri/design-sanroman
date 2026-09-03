'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { PendingRequest, Unit } from '@/data';
import {
  JULIACA_BOUNDS,
  JULIACA_CENTER,
  worldToGeo,
  type GeoPoint,
} from '@/lib/juliaca';
import s from './Operadora.module.css';

export type MapFocus = {
  point: GeoPoint;
  zoom: number;
  key: number;
};

type JuliacaMapProps = {
  units: Unit[];
  unitPositions: Record<string, { x: number; y: number }>;
  requests: PendingRequest[];
  selectedId: string | null;
  activeUnitId: string | null;
  picking: boolean;
  focus: MapFocus;
  onCenterChange: (point: GeoPoint) => void;
  onSelectRequest: (id: string) => void;
  onSelectUnit: (id: string) => void;
  pickupRoute: GeoPoint[];
  serviceRoute: GeoPoint[];
};

function pointForPickup(request: PendingRequest) {
  return request.pickupGeo ?? worldToGeo(request.pickup);
}

function pointForDestination(request: PendingRequest) {
  return request.destinationGeo ?? worldToGeo(request.destination);
}

function MapBehaviour({
  focus,
  picking,
  onCenterChange,
}: Pick<JuliacaMapProps, 'focus' | 'picking' | 'onCenterChange'>) {
  const map = useMapEvents({
    move() {
      if (!picking) return;
      const center = map.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    },
  });

  useEffect(() => {
    map.flyTo([focus.point.lat, focus.point.lng], focus.zoom, {
      animate: true,
      duration: 0.7,
    });
  }, [focus, map]);

  return null;
}

function ResetControl() {
  const map = useMap();
  return (
    <button
      type="button"
      className={s.mapReset}
      onClick={() => map.flyTo([JULIACA_CENTER.lat, JULIACA_CENTER.lng], 14)}
      aria-label="Centrar mapa en Juliaca"
    >
      Juliaca
    </button>
  );
}

function unitIcon(unit: Unit, selected: boolean) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return L.divIcon({
    className: [
      'operator-unit-marker',
      `operator-unit-marker--${unit.status}`,
      selected ? 'operator-unit-marker--selected' : '',
    ].join(' '),
    html: `<img src="${basePath}/icono_carro_1.svg" alt=""><span>${unit.n}</span>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

function requestIcon(selected: boolean) {
  return L.divIcon({
    className: `operator-request-marker${selected ? ' operator-request-marker--selected' : ''}`,
    html: '<span></span>',
    iconSize: [28, 34],
    iconAnchor: [14, 30],
  });
}

function destinationIcon() {
  return L.divIcon({
    className: 'operator-destination-marker',
    html: '<span></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function JuliacaMap({
  units,
  unitPositions,
  requests,
  selectedId,
  activeUnitId,
  picking,
  focus,
  onCenterChange,
  onSelectRequest,
  onSelectUnit,
  pickupRoute,
  serviceRoute,
}: JuliacaMapProps) {
  const selected = requests.find((request) => request.id === selectedId) ?? null;
  const selectedDestination = selected ? pointForDestination(selected) : null;
  const unitIcons = useMemo(
    () =>
      Object.fromEntries(
        units.map((unit) => [unit.id, unitIcon(unit, unit.id === activeUnitId)])
      ),
    [activeUnitId, units]
  );

  return (
    <MapContainer
      center={[JULIACA_CENTER.lat, JULIACA_CENTER.lng]}
      zoom={14}
      minZoom={12}
      maxZoom={19}
      maxBounds={[
        [JULIACA_BOUNDS.south, JULIACA_BOUNDS.west],
        [JULIACA_BOUNDS.north, JULIACA_BOUNDS.east],
      ]}
      maxBoundsViscosity={0.82}
      className={s.realMap}
      zoomControl={false}
      attributionControl
    >
      <ZoomControl position="topright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={process.env.NEXT_PUBLIC_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}
      />
      <MapBehaviour
        focus={focus}
        picking={picking}
        onCenterChange={onCenterChange}
      />
      <ResetControl />

      {pickupRoute.length > 1 && <Polyline positions={pickupRoute.map((point) => [point.lat, point.lng])} className={s.realPickupRoute} />}
      {serviceRoute.length > 1 && <Polyline positions={serviceRoute.map((point) => [point.lat, point.lng])} className={s.realRoute} />}

      {units.map((unit) => {
        const point = worldToGeo(unitPositions[unit.id]);
        return (
          <Marker
            key={unit.id}
            position={[point.lat, point.lng]}
            icon={unitIcons[unit.id]}
            zIndexOffset={unit.id === activeUnitId ? 500 : 0}
            eventHandlers={{ click: () => onSelectUnit(unit.id) }}
          />
        );
      })}

      {requests.map((request) => {
        const point = pointForPickup(request);
        const isSelected = request.id === selectedId;
        return (
          <Marker
            key={request.id}
            position={[point.lat, point.lng]}
            icon={requestIcon(isSelected)}
            zIndexOffset={isSelected ? 400 : 0}
            eventHandlers={{ click: () => onSelectRequest(request.id) }}
          />
        );
      })}

      {selectedDestination && (
        <Marker
          position={[selectedDestination.lat, selectedDestination.lng]}
          icon={destinationIcon()}
        />
      )}
    </MapContainer>
  );
}
