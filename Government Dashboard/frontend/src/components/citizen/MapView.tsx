"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing circles for alerts
const createPulsingIcon = (color: string, pulse: boolean) => {
  return L.divIcon({
    className: 'custom-alert-icon',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; width: 100%; height: 100%; background-color: ${color}; border-radius: 50%; opacity: 1; z-index: 2;"></div>
        ${pulse ? `<div style="position: absolute; width: 100%; height: 100%; background-color: ${color}; border-radius: 50%; animation: ping 1.5s infinite; opacity: 0.7; z-index: 1;"></div>` : ''}
      </div>
      <style>
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const SEVERITY_COLORS = {
  CRITICAL: "#dc2626",
  HIGH: "#d97706",
  MEDIUM: "#facc15",
  LOW: "#94a3b8"
};

const DRAINAGE_NETWORK = [
  // Mock drainage lines near Mysore Palace
  [ [12.305, 76.655], [12.308, 76.658] ],
  [ [12.305, 76.655], [12.302, 76.652] ],
  [ [12.305, 76.655], [12.305, 76.660] ]
];

// Mock Ward GeoJSON for Mysuru (Central area)
const MOCK_WARD_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Devaraja Mohalla" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [76.650, 12.310], [76.660, 12.310], [76.660, 12.300], [76.650, 12.300], [76.650, 12.310]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Chamundi Hill" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [76.665, 12.280], [76.680, 12.280], [76.680, 12.270], [76.665, 12.270], [76.665, 12.280]
        ]]
      }
    }
  ]
};

export default function MapView({ 
  blockedRoute, 
  altRoute, 
  allBlockedRoutes,
  allAltRoutes,
  centerPoint,
  alerts = [] 
}: { 
  blockedRoute?: [number, number][]; 
  altRoute?: [number, number][]; 
  allBlockedRoutes?: [number, number][][];
  allAltRoutes?: [number, number][][];
  centerPoint?: [number, number]; 
  alerts?: any[];
}) {
  const [zoom, setZoom] = useState(14);

  // Function to fly to city center
  const center: [number, number] = centerPoint || [12.29582, 76.63938]; // Mysuru Center

  function ZoomTracker() {
    useMapEvents({
      zoomend: (e) => setZoom(e.target.getZoom()),
    });
    return null;
  }

  function RecenterMap({ centerPos }: { centerPos: [number, number] }) {
    const map = useMapEvents({});
    useEffect(() => {
      map.flyTo(centerPos, map.getZoom(), { duration: 1.5 });
    }, [centerPos, map]);
    return null;
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <ZoomTracker />
      {centerPoint && <RecenterMap centerPos={centerPoint} />}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Ward Boundaries */}
      <GeoJSON 
        data={MOCK_WARD_GEOJSON as any} 
        style={() => ({
          color: "#1d4ed8",
          weight: 1,
          fillColor: "transparent",
          fillOpacity: 0.1
        })}
        onEachFeature={(feature, layer) => {
          layer.bindTooltip(feature.properties.name);
          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.setStyle({ fillOpacity: 0.2 });
            },
            mouseout: (e) => {
              const l = e.target;
              l.setStyle({ fillOpacity: 0.1 });
            }
          });
        }}
      />

      {/* Active Scenario Blocked Route */}
      {blockedRoute && (
        <Polyline positions={blockedRoute} color="#ef4444" weight={6} />
      )}

      {/* All Blocked Routes */}
      {allBlockedRoutes && allBlockedRoutes.map((route, i) => (
        <Polyline key={`blocked-${i}`} positions={route} color="#ef4444" weight={6} />
      ))}

      {/* Active Scenario Alternate Route */}
      {altRoute && (
        <Polyline positions={altRoute} color="#22c55e" weight={4} dashArray="10, 10" />
      )}

      {/* All Alt Routes */}
      {allAltRoutes && allAltRoutes.map((route, i) => (
        <Polyline key={`alt-${i}`} positions={route} color="#22c55e" weight={4} dashArray="10, 10" />
      ))}

      {/* Alert Markers */}
      {alerts.map((alert) => (
        <Marker 
          key={alert.id} 
          position={[alert.lat, alert.lng]} 
          icon={createPulsingIcon(SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] || "#ccc", alert.severity === "CRITICAL")}
        >
          <Popup>
            <div style={{ padding: "4px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <span className={`badge badge-${alert.severity.toLowerCase()}`} style={{ fontSize: "0.65rem" }}>
                  {alert.severity}
                </span>
                <strong style={{ fontSize: "0.875rem" }}>{alert.title}</strong>
              </div>
              <p style={{ fontSize: "0.75rem", margin: "4px 0" }}>{alert.description}</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                <strong>Ward:</strong> {alert.ward_name}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                <strong>Until:</strong> {alert.until}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
