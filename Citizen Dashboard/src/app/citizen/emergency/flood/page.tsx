"use client";

import React, { useState, useEffect } from 'react';
import { Waves, Activity, MapPin, AlertTriangle, ChevronLeft, Droplets, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMapComponent'), { ssr: false });

export default function CitizenFloodStatus() {
  const [results, setResults] = useState<any>(null);
  const [rainfall, setRainfall] = useState(80);

  const fetchLatestSimulation = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_type: 'flood',
          rainfall_mm: rainfall,
          is_monsoon: 1,
          drain_condition: 0.8,
          zone_lat: 12.2958,
          zone_lng: 76.6394
        })
      });
      const data = await res.json();
      setResults(data);
    } catch(e) {
      console.error("Simulation failed", e);
    }
  };

  useEffect(() => {
    fetchLatestSimulation();
  }, [rainfall]);

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", backgroundColor: "#f8fafc" }}>
      <aside style={{ width: "400px", padding: "32px", borderRight: "1px solid var(--border)", backgroundColor: "white", display: "flex", flexDirection: "column", gap: "32px" }}>
        <Link href="/citizen/emergency" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--primary)", fontWeight: 600, fontSize: "0.875rem" }}>
          <ChevronLeft size={16} /> Back to Hub
        </Link>
        
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ padding: "10px", backgroundColor: "#eff6ff", color: "#3b82f6", borderRadius: "12px" }}>
              <Waves size={24} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Flood Impact Simulator</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Visualize how heavy rainfall and monsoon conditions affect Mysore's urban drainage and road accessibility.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase" }}>
            <span>Rainfall Intensity</span>
            <span style={{ color: "#3b82f6" }}>{rainfall} mm/hr</span>
          </div>
          <input 
            type="range" min="0" max="250" value={rainfall}
            onChange={(e) => setRainfall(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#3b82f6" }}
          />
        </div>

        {results && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ 
               padding: "24px", 
               borderRadius: "16px", 
               backgroundColor: results.results.flood_risk_score > 7 ? "#fee2e2" : results.results.flood_risk_score > 4 ? "#ffedd5" : "#eff6ff",
               border: "1px solid",
               borderColor: results.results.flood_risk_score > 7 ? "#fca5a5" : results.results.flood_risk_score > 4 ? "#fdba74" : "#bfdbfe"
            }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "bold", opacity: 0.7, textTransform: "uppercase" }}>Urban Flood Risk</p>
              <p style={{ fontSize: "2.5rem", fontWeight: "black", margin: "8px 0" }}>{results.results.flood_risk_score.toFixed(1)} <span style={{ fontSize: "1rem" }}>/ 10</span></p>
              <div style={{ 
                display: "inline-block", 
                padding: "4px 12px", 
                borderRadius: "100px", 
                backgroundColor: results.results.flood_risk_score > 7 ? "#ef4444" : results.results.flood_risk_score > 4 ? "#f59e0b" : "#3b82f6",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase"
              }}>
                {results.results.flood_risk_score > 7 ? 'Evacuation Possible' : results.results.flood_risk_score > 4 ? 'Localized Flooding' : 'Low Vulnerability'}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <Droplets size={16} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Pollution Δ</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>+{results.results.pollution_delta} AQI</p>
              </div>
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <Activity size={16} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Gridlock</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{results.results.congestion_pct}%</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", padding: "16px", backgroundColor: "#eff6ff", borderRadius: "12px", border: "1px solid #dbeafe", display: "flex", gap: "12px" }}>
           <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
           <p style={{ fontSize: "0.75rem", color: "#1e40af", lineHeight: 1.5 }}>
             Flood risk scores are pre-computed based on ward-level drainage data and historical rainfall responses.
           </p>
        </div>
      </aside>

      <main style={{ flex: 1, position: "relative" }}>
        <InteractiveMap 
          readOnly={true} 
          highlightedRoads={results?.results.flood_risk_score > 5 ? ["road_1", "road_2", "road_3", "road_4"] : []} 
        />
        
        <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 1000, backgroundColor: "white", padding: "12px 24px", borderRadius: "100px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "8px", height: "8px", backgroundColor: "#3b82f6", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#1e293b" }}>Simulating Rainfall Impact</span>
        </div>
      </main>
    </div>
  );
}
