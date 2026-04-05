"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from "react-leaflet";
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

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  onRoadClick?: (roadId: string, name: string, coords: [number, number]) => void;
  onBlockedRoadsChange?: (roadIds: string[]) => void;
  highlightedRoads?: string[];
}

function MapAction({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveMapComponent({
  center = [12.2958, 76.6394],
  zoom = 14,
  onRoadClick,
  onBlockedRoadsChange,
  highlightedRoads = []
}: InteractiveMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [roadsData, setRoadsData] = useState<any>(null);
  const [blockedRoadIds, setBlockedRoadIds] = useState<string[]>([]);

  useEffect(() => {
    fixLeafletIcon();
    setIsMounted(true);
    
    fetch('http://localhost:8001/api/v1/roads')
      .then(res => res.json())
      .then(data => {
        if (data && data.type) {
          setRoadsData(data);
        } else {
          console.error("Invalid road data received:", data);
        }
      })
      .catch(err => console.error("Could not load roads:", err));
  }, []);

  const roadStyle = (feature: any) => {
    const isHighlighted = highlightedRoads.includes(feature.id);
    const isBlocked = blockedRoadIds.includes(feature.id);
    
    if (isBlocked) {
       return {
          color: "#ef4444", // Red for blocked
          weight: 6,
          opacity: 0.9,
          dashArray: ""
       };
    }
    
    return {
      color: isHighlighted ? "#f59e0b" : "#64748b", // Amber for active, Gray for default
      weight: isHighlighted ? 6 : 3,
      opacity: isHighlighted ? 0.9 : 0.4,
      dashArray: isHighlighted ? "" : "3, 6"
    };
  };

  const onEachRoad = (feature: any, layer: any) => {
    layer.on({
      click: (e: any) => {
        const isBlocked = blockedRoadIds.includes(feature.id);
        const newBlocked = isBlocked 
           ? blockedRoadIds.filter(id => id !== feature.id)
           : [...blockedRoadIds, feature.id];
           
        setBlockedRoadIds(newBlocked);
        if (onBlockedRoadsChange) {
           onBlockedRoadsChange(newBlocked);
        }
        
        if (onRoadClick) {
          const coords = e.latlng;
          onRoadClick(feature.id, feature.properties.name, [coords.lat, coords.lng]);
        }
        
        // Update styling immediately
        const updatedStyle = roadStyle(feature);
        if (newBlocked.includes(feature.id)) {
           // Force override to blocked style if just blocked
           layer.setStyle({ color: "#ef4444", weight: 6, opacity: 0.9, dashArray: "" });
        } else {
           layer.setStyle(roadStyle(feature));
        }
      },
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 7,
          opacity: 0.8,
          color: "#0891b2"
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle(roadStyle(feature));
      }
    });
    
    layer.bindTooltip(feature.properties.name, {
      sticky: true,
      className: 'road-label'
    });
  };

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
        <MapAction center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />

        {roadsData && (
          <GeoJSON 
            data={roadsData} 
            style={roadStyle} 
            onEachFeature={onEachRoad}
          />
        )}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur p-2 rounded shadow-lg border border-slate-200 pointer-events-none">
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter mb-1">Live Intelligence Active</p>
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <p className="text-[8px] font-bold text-slate-500 uppercase">Interactive Road Segments</p>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
              <p className="text-[8px] font-bold text-slate-500 uppercase">Impact Propagation</p>
          </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .leaflet-container {
          font-family: Roboto, Arial, sans-serif;
        }
        .road-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 2px 6px;
        }
      `}</style>
    </div>
  );
}
