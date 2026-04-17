'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, Polygon, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BRASCO_GEOFENCE, FLEET_MAP_CENTER, FLEET_MAP_ZOOM } from '@/config/fleet';
import type { AISPosition } from '@/types/ais';

interface FleetMapProps {
  positions: AISPosition[];
}

function getMarkerColor(sog: number): string {
  if (sog < 0.5) {
    return '#22c55e';
  }

  if (sog < 3) {
    return '#f59e0b';
  }

  return '#3b82f6';
}

function formatTimestamp(timestamp: string): string {
  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return timestamp;
  }

  return parsedDate.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

function createTugIcon(position: AISPosition): L.DivIcon {
  const color = getMarkerColor(position.sog);
  const rotation = Number.isFinite(position.heading) ? position.heading : position.cog;

  return L.divIcon({
    className: 'fleet-map-icon',
    html: `
      <div style="transform: rotate(${rotation}deg); width: 34px; height: 34px;">
        <svg viewBox="0 0 34 34" width="34" height="34" xmlns="http://www.w3.org/2000/svg">
          <circle cx="17" cy="17" r="14" fill="${color}" fill-opacity="0.92" stroke="rgba(255,255,255,0.95)" stroke-width="2.2" />
          <path d="M17 7 L23 22 L17 18.5 L11 22 Z" fill="white" />
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function MapBoundsController({ positions }: FleetMapProps) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(BRASCO_GEOFENCE);

    positions.forEach((position) => {
      bounds.extend([position.lat, position.lon]);
    });

    map.fitBounds(bounds, {
      padding: [24, 24],
      maxZoom: 13,
    });
  }, [map, positions]);

  return null;
}

function NoSignalOverlay() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-xl border border-white/10 bg-naval-950/90 px-3 py-2 text-[11px] text-slate-300 shadow-lg backdrop-blur">
      Sem posicoes AIS recentes no polling atual.
    </div>
  );
}

export function FleetMap({ positions }: FleetMapProps) {
  return (
    <div className="relative h-full w-full bg-[#08101b]">
      <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-full border border-cyan-400/20 bg-[#07131f]/90 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-200 backdrop-blur">
        AISSTREAM
      </div>

      {positions.length === 0 ? <NoSignalOverlay /> : null}

      <MapContainer
        center={FLEET_MAP_CENTER}
        zoom={FLEET_MAP_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapBoundsController positions={positions} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon
          positions={BRASCO_GEOFENCE}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '4 6',
          }}
        >
          <Tooltip permanent direction="center" opacity={0.9}>
            Base SAAM - Brasco Caju
          </Tooltip>
        </Polygon>

        {positions.map((position) => (
          <Marker key={position.mmsi} position={[position.lat, position.lon]} icon={createTugIcon(position)}>
            <Popup>
              <div className="min-w-[180px] space-y-1 text-xs text-slate-800">
                <div className="font-bold text-slate-950">{position.nome}</div>
                <div>Velocidade: {position.sog.toFixed(1)} kn</div>
                <div>Rumo: {position.cog.toFixed(0)}°</div>
                <div>Proa: {position.heading.toFixed(0)}°</div>
                <div>Status: {position.navStatus}</div>
                <div>
                  Posicao: {position.lat.toFixed(4)}, {position.lon.toFixed(4)}
                </div>
                <div>Atualizado: {formatTimestamp(position.updatedAt)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
