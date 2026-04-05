"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

const createPulsingIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-alert-icon',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; width: 100%; height: 100%; background-color: ${color}; border-radius: 50%; opacity: 1; z-index: 2; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2)"></div>
        <div style="position: absolute; width: 100%; height: 100%; background-color: ${color}; border-radius: 50%; animation: ping 1.5s infinite; opacity: 0.7; z-index: 1;"></div>
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

const SCENARIO_DATA = [
  { id: "s1", type: "ROAD_CLOSURE", lat: 12.305, lng: 76.655, color: "red", title: "Road Closure: Procession" },
  { id: "s2", type: "CONSTRUCTION", lat: 12.275, lng: 76.671, color: "orange", title: "Flyover Construction" },
  { id: "s3", type: "FLOOD", lat: 12.285, lng: 76.645, color: "blue", title: "Waterlogging Warning" },
  { id: "s4", type: "BUS_ROUTE", lat: 12.315, lng: 76.640, color: "green", title: "New Bus Route 100" },
  { id: "s5", type: "RESTRICTION", lat: 12.301, lng: 76.652, color: "pink", title: "Heavy Vehicle Restriction" },
  { id: "s6", type: "FESTIVAL", lat: 12.310, lng: 76.660, color: "purple", title: "Local Festival Ongoing" },
];

export default function DashboardMap({ activeScenario }: { activeScenario: string | null }) {
  const [zoom, setZoom] = useState(13);
  const center: [number, number] = [12.29582, 76.63938];

  function ZoomTracker() {
    useMapEvents({ zoomend: (e) => setZoom(e.target.getZoom()) });
    return null;
  }

  const markers = activeScenario 
    ? SCENARIO_DATA.filter(s => s.type === activeScenario)
    : SCENARIO_DATA;

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <ZoomTracker />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {markers.map(m => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={createPulsingIcon(m.color)}>
           <Popup>
               <div style={{ fontWeight: "bold" }}>{m.title}</div>
               <div style={{ fontSize: "0.8rem", color: "#666" }}>Type: {m.type}</div>
           </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
