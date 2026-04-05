"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, HeartPulse, Activity, AlertCircle, ChevronLeft, MapPin, Wind, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMapComponent'), { ssr: false });

export default function CitizenGarbageStatus() {
  const [results, setResults] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");

  useEffect(() => {
    fetch('http://localhost:8001/api/v1/garbage/zones')
      .then(res => res.json())
      .then(data => {
        setZones(data);
        if (data.length > 0) setSelectedZone(data[0].name);
      });
  }, []);

  const fetchLatestSimulation = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/history');
      const history = await res.json();
      const latest = history.reverse().find((s: any) => s.payload.scenario_type === 'garbage');
      if (latest) {
        setResults(latest.results);
      } else {
        // Fallback simulation
        const predictRes = await fetch('http://localhost:8001/api/v1/simulation/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scenario_type: 'garbage',
              garbage_zones_missed: 1,
              days_collection_missed: 7,
              is_monsoon: 1,
              time_of_day: 14,
              zone_lat: 12.3134,
              zone_lng: 76.6499
            })
          });
          const data = await predictRes.json();
          setResults(data);
      }
    } catch(e) {
      console.error("Simulation sync failed", e);
    }
  };

  useEffect(() => {
    if (selectedZone) fetchLatestSimulation();
  }, [selectedZone]);

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{ width: "400px", padding: "32px", borderRight: "1px solid var(--border)", backgroundColor: "white", display: "flex", flexDirection: "column", gap: "32px" }}>
        <Link href="/citizen/emergency" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--primary)", fontWeight: 600, fontSize: "0.875rem" }}>
          <ChevronLeft size={16} /> Back to Hub
        </Link>
        
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ padding: "10px", backgroundColor: "#fffbeb", color: "#f59e0b", borderRadius: "12px" }}>
              <Trash2 size={24} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Civic Waste Status</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Live modeling of solid waste accumulation and public health risk across Mysuru neighborhoods. 
            Estimated scores reflect disruption impacts and architecture resilience scores.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase" }}>Neighborhood Zone (KGIS)</label>
          <select 
            value={selectedZone} 
            onChange={(e) => setSelectedZone(e.target.value)}
            style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--border)", backgroundColor: "#f8fafc", fontSize: "0.9375rem" }}
          >
            {zones.map(z => (
              <option key={z.name} value={z.name}>{z.display}</option>
            ))}
          </select>
        </div>

        {results && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ 
               padding: "24px", 
               borderRadius: "16px", 
               backgroundColor: results.public_health_risk > 7 ? "#fff7ed" : "#f0fdf4",
               border: "1px solid",
               borderColor: results.public_health_risk > 7 ? "#fdba74" : "#a7f3d0"
            }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "bold", opacity: 0.7, textTransform: "uppercase" }}>Public Health Index</p>
              <p style={{ fontSize: "2.5rem", fontWeight: "black", margin: "8px 0" }}>{results.public_health_risk.toFixed(1)} <span style={{ fontSize: "1rem" }}>/ 10</span></p>
              <div style={{ 
                display: "inline-block", 
                padding: "4px 12px", 
                borderRadius: "100px", 
                backgroundColor: results.public_health_risk > 7 ? "#f59e0b" : "#10b981",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase"
              }}>
                {results.public_health_risk > 7 ? 'Incident Rate Elevated' : 'Safe Operational Level'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <Wind size={16} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Pollution Index Δ</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>+{results.pollution_delta.toFixed(1)}</p>
              </div>
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <AlertCircle size={16} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Waste Impact</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{results.waste_impact_score.toFixed(1)}/10</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", padding: "16px", backgroundColor: "#eff6ff", borderRadius: "12px", border: "1px solid #dbeafe", display: "flex", gap: "12px" }}>
           <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
           <p style={{ fontSize: "0.75rem", color: "#1e40af", lineHeight: 1.5 }}>
             Neighborhood modeling factors in current rainfall levels and ward-specific architecture resilience to predict sanitation health scores.
           </p>
        </div>
      </aside>

      {/* Map Content */}
      <main style={{ flex: 1, position: "relative" }}>
        <InteractiveMap readOnly={true} center={[12.2958, 76.6394]} />
        
        <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 1000, backgroundColor: "white", padding: "12px 24px", borderRadius: "100px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "8px", height: "8px", backgroundColor: "#f59e0b", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#1e293b" }}>Neighborhood Hub Monitoring</span>
        </div>
      </main>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
