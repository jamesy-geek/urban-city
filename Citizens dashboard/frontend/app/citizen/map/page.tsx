"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle, MapPin, Navigation, Info } from "lucide-react";

// Dynamically import the MapComponent as it needs 'window'
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9" }}>Loading Map...</div>,
});

const FEATURES = [
  { id: "ALL", label: "All Scenarios", icon: MapPin, color: "#4f46e5" },
  { id: "ROAD_CLOSURE", label: "Road Closure", icon: AlertCircle, color: "#ef4444" },
  { id: "CONSTRUCTION", label: "Construction", icon: MapPin, color: "#f59e0b" },
  { id: "FESTIVAL", label: "Festival", icon: Info, color: "#a855f7" },
  { id: "BUS_ROUTE", label: "Bus Route Impact", icon: Navigation, color: "#10b981" },
  { id: "RESTRICTION", label: "Restriction", icon: AlertCircle, color: "#ec4899" },
  { id: "FLOOD", label: "Flood Scenario", icon: Info, color: "#3b82f6" },
];

const SCENARIOS: Record<string, any> = {
  "ALL": {
    title: "All Active City Scenarios",
    desc: "Multiple operational scenarios are active across Mysuru. Please check specific filters for detailed routes.",
    suggestion: "Check individual categories to see specific alternative routes."
  },
  "ROAD_CLOSURE": {
    title: "Main Road Blocked for Procession",
    blocked: [[12.305, 76.655], [12.308, 76.658]],
    alt: [[12.305, 76.655], [12.305, 76.662], [12.308, 76.662], [12.308, 76.658]],
    desc: "A major religious procession is moving through the central business district today.",
    suggestion: "Take the east ring road to completely bypass the procession. Expect 5-10 min delay."
  },
  "CONSTRUCTION": {
    title: "Flyover Construction Overlay",
    blocked: [[12.275, 76.671], [12.280, 76.671]],
    alt: [[12.275, 76.671], [12.278, 76.665], [12.282, 76.665], [12.280, 76.671]],
    desc: "Phase 2 of the metro flyover construction is underway.",
    suggestion: "Use the parallel service road. Heavy vehicles should detour earlier at Junction 4."
  },
  "FESTIVAL": {
    title: "Dasara Festival Crowd Gathering",
    blocked: [[12.310, 76.660], [12.312, 76.658]],
    alt: [[12.310, 76.660], [12.314, 76.662], [12.312, 76.658]],
    desc: "Large crowds concentrated near the palace gates.",
    suggestion: "Avoid the palace radius entirely. Pedestrian-only zones have been enforced."
  },
  "BUS_ROUTE": {
    title: "Route 100 Diverted",
    blocked: [[12.315, 76.640], [12.320, 76.640]],
    alt: [[12.315, 76.640], [12.315, 76.635], [12.320, 76.635], [12.320, 76.640]],
    desc: "Regular city bus route 100 has been diverted due to pipeline repairs.",
    suggestion: "The bus will take 1st Cross instead of Main Road until Saturday."
  },
  "RESTRICTION": {
    title: "Heavy Vehicle Ban",
    blocked: [[12.301, 76.652], [12.301, 76.660]],
    alt: [[12.301, 76.652], [12.295, 76.652], [12.295, 76.660], [12.301, 76.660]],
    desc: "Commercial heavy vehicles above 10 tons are restricted during daytime.",
    suggestion: "Logistics trucks must use the outer bypass between 8 AM and 8 PM."
  },
  "FLOOD": {
    title: "Waterlogging at Underpass",
    blocked: [[12.285, 76.645], [12.287, 76.645]],
    alt: [[12.285, 76.645], [12.285, 76.640], [12.287, 76.640], [12.287, 76.645]],
    desc: "Severe waterlogging up to 2 feet in the railway underpass.",
    suggestion: "Underpass is closed to all traffic. Two-wheelers should take the overbridge 2km ahead."
  }
};

export default function CitizenMapPage() {
  const { t } = useLanguage();
  const [activeFeature, setActiveFeature] = useState("ALL");

  const currentData = SCENARIOS[activeFeature];
  
  const allBlockedRoutes = activeFeature === "ALL" 
    ? Object.values(SCENARIOS).filter(s => s.blocked).map(s => s.blocked) 
    : undefined;
    
  const allAltRoutes = activeFeature === "ALL" 
    ? Object.values(SCENARIOS).filter(s => s.alt).map(s => s.alt) 
    : undefined;

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      
      {/* Top Filter Bar */}
      <div style={{ 
        padding: "16px", backgroundColor: "white", borderBottom: "1px solid var(--border)",
        display: "flex", gap: "12px", overflowX: "auto"
      }}>
        {FEATURES.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFeature(f.id)}
            style={{
              padding: "8px 16px", borderRadius: "24px", fontSize: "0.875rem",
              fontWeight: activeFeature === f.id ? 600 : 500,
              backgroundColor: activeFeature === f.id ? `${f.color}15` : "var(--surface)",
              color: activeFeature === f.id ? f.color : "var(--text-primary)",
              border: `1px solid ${activeFeature === f.id ? f.color : "var(--border)"}`,
              display: "flex", alignItems: "center", gap: "8px",
              cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap"
            }}
          >
            <f.icon size={16} />
            {t(f.label)}
          </button>
        ))}
      </div>

      {/* Map Content View */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapView 
           blockedRoute={currentData?.blocked} 
           altRoute={currentData?.alt} 
           allBlockedRoutes={allBlockedRoutes}
           allAltRoutes={allAltRoutes}
           centerPoint={currentData?.blocked?.[0] || [12.29582, 76.63938]} 
        />
      </div>

      {/* Bottom Panel */}
      <div style={{ 
        height: "220px", backgroundColor: "white", borderTop: "1px solid var(--border)",
        padding: "24px", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"
      }}>
         <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "red" }} />
              <h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--text-primary)" }}>
                {t(currentData.title)}
              </h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5, margin: "0 0 16px 0" }}>
              {t(currentData.desc)}
            </p>
         </div>
         
         <div style={{ backgroundColor: "#f0fdf4", padding: "16px", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#166534" }}>
              <Navigation size={18} />
              <strong style={{ fontSize: "0.875rem" }}>{t("Alternative Route Suggested")}</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#15803d", lineHeight: 1.5 }}>
               {t(currentData.suggestion)}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
               <div style={{ width: "24px", height: "4px", backgroundColor: "#22c55e", borderStyle: "dashed", borderColor: "white" }} />
               <span style={{ fontSize: "0.75rem", color: "#166534" }}>Follow green dashed line on map</span>
            </div>
         </div>
      </div>
      
    </div>
  );
}
