"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

export default function MapComponent({
  center = [12.2958, 76.6394],
  zoom = 14,
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcon();
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
         <div style={{ width: '24px', height: '24px', border: '2px solid #1a73e8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #dadce0' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        {/* Google Maps Style Tile Layer (Standard Roadmap) */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />

        {/* Marker for Mysuru City Center */}
        <Marker position={[12.2958, 76.6394]}>
          <Popup>
            <div style={{ fontFamily: 'Roboto, Arial, sans-serif', fontSize: '13px' }}>
              <p style={{ fontWeight: 600, margin: 0 }}>Mysuru</p>
              <p style={{ color: '#70757a', margin: '2px 0 0 0' }}>Karnataka, India</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .leaflet-container {
          font-family: Roboto, Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
