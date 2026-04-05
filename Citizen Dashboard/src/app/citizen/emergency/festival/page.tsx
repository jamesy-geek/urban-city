"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, AlertTriangle, ChevronLeft, ShieldAlert, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMapComponent'), { ssr: false });

export default function CitizenFestivalStatus() {
  const [results, setResults] = useState<any>(null);
  const [crowd, setCrowd] = useState(750000); // 7.5L
  const [tourismLoad, setTourismLoad] = useState(0.2);

  const fetchLatestSimulation = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_type: 'festival',
          crowd_count_lakhs: crowd / 100000,
          tourism_load: tourismLoad,
          is_dasara: 1,
          zone_lat: 12.3134,
          zone_lng: 76.6499
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
  }, [crowd, tourismLoad]);

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", backgroundColor: "#f8fafc" }}>
      <aside style={{ width: "400px", padding: "32px", borderRight: "1px solid var(--border)", backgroundColor: "white", display: "flex", flexDirection: "column", gap: "32px" }}>
        <Link href="/citizen/emergency" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--primary)", fontWeight: 600, fontSize: "0.875rem" }}>
          <ChevronLeft size={16} /> Back to Hub
        </Link>
        
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ padding: "10px", backgroundColor: "#fffbeb", color: "#d97706", borderRadius: "12px" }}>
              <Calendar size={24} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Dasara Crowd Logic</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Visualize crowd density, tourist load, and transit delays during the world-famous Mysore Dasara festival.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              <span>Expected Crowd</span>
              <span style={{ color: "#d97706" }}>{(crowd / 100000).toFixed(1)} Lakhs</span>
            </div>
            <input 
              type="range" min="50000" max="2000000" step="50000" value={crowd}
              onChange={(e) => setCrowd(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#d97706" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              <span>Tourism Inflow</span>
              <span style={{ color: "#d97706" }}>{(tourismLoad * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05" value={tourismLoad}
              onChange={(e) => setTourismLoad(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#d97706" }}
            />
          </div>
        </div>

        {results && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ 
               padding: "24px", 
               borderRadius: "16px", 
               backgroundColor: results.results.crowd_safety_risk > 7 ? "#fee2e2" : results.results.crowd_safety_risk > 4 ? "#fffbeb" : "#f0fdf4",
               border: "1px solid",
               borderColor: results.results.crowd_safety_risk > 7 ? "#fca5a5" : results.results.crowd_safety_risk > 4 ? "#fde68a" : "#bbf7d0"
            }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "bold", opacity: 0.7, textTransform: "uppercase" }}>Safety & Transit Risk</p>
              <p style={{ fontSize: "2.5rem", fontWeight: "black", margin: "8px 0" }}>{results.results.crowd_safety_risk.toFixed(1)} <span style={{ fontSize: "1rem" }}>/ 10</span></p>
              <div style={{ 
                display: "inline-block", 
                padding: "4px 12px", 
                borderRadius: "100px", 
                backgroundColor: results.results.crowd_safety_risk > 7 ? "#ef4444" : results.results.crowd_safety_risk > 4 ? "#f59e0b" : "#22c55e",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase"
              }}>
                {results.results.crowd_safety_risk > 7 ? 'Critical Congestion' : results.results.crowd_safety_risk > 4 ? 'Moderate Delays' : 'Normal Flow'}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <Users size={16} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Bus Delay</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{results.results.ksrtc_disruption_score.toFixed(1)}/10</p>
              </div>
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <ShieldAlert size={16} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Ambulance</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{results.results.ambulance_delay_min.toFixed(1)}m</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", padding: "16px", backgroundColor: "#fffbeb", borderRadius: "12px", border: "1px solid #fef3c7", display: "flex", gap: "12px" }}>
           <Info size={20} color="#d97706" style={{ flexShrink: 0 }} />
           <p style={{ fontSize: "0.75rem", color: "#92400e", lineHeight: 1.5 }}>
             Real-time crowd data is derived from cell-tower pings and palace entrance ticket logs.
           </p>
        </div>
      </aside>

      <main style={{ flex: 1, position: "relative" }}>
        <InteractiveMap 
          readOnly={true} 
          highlightedRoads={results?.results.crowd_safety_risk > 5 ? ["road_5", "road_6", "road_7"] : []} 
        />
        
        <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 1000, backgroundColor: "white", padding: "12px 24px", borderRadius: "100px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "8px", height: "8px", backgroundColor: "#f59e0b", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#1e293b" }}>Dasara Intelligence Active</span>
        </div>
      </main>
    </div>
  );
}
