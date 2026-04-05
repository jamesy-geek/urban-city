"use client";

import React, { useState, useEffect } from 'react';
import { Siren, Activity, MapPin, AlertTriangle, ChevronLeft, Clock, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMapComponent'), { ssr: false });

export default function CitizenAmbulanceStatus() {
  const [results, setResults] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("");

  useEffect(() => {
    fetch('http://localhost:8001/api/v1/hospitals')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
        setHospitals(sorted);
        if (sorted.length > 0) setSelectedHospital(sorted[0].id);
      });
  }, []);

  const fetchLatestSimulation = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/history');
      const history = await res.json();
      const latest = history.reverse().find((s: any) => s.payload.scenario_type === 'ambulance');
      if (latest) {
        setResults(latest.results);
      } else {
        // Fallback simulation
        const hospital = hospitals.find(h => h.id === selectedHospital);
        const predictRes = await fetch('http://localhost:8001/api/v1/simulation/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scenario_type: 'ambulance',
              roads_affected: 3,
              hospital_distance_km: 4.5,
              zone_lat: hospital?.lat || 12.3134,
              zone_lng: hospital?.lng || 76.6499
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
    if (hospitals.length > 0) fetchLatestSimulation();
  }, [hospitals, selectedHospital]);

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{ width: "400px", padding: "32px", borderRight: "1px solid var(--border)", backgroundColor: "white", display: "flex", flexDirection: "column", gap: "32px" }}>
        <Link href="/citizen/emergency" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--primary)", fontWeight: 600, fontSize: "0.875rem" }}>
          <ChevronLeft size={16} /> Back to Hub
        </Link>
        
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ padding: "10px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "12px" }}>
              <Siren size={24} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Ambulance Dispatch Monitor</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            Real-time transit risk assessment for hospital corridors across Mysuru. 
            Data reflects current city gridlock and impact on life-saving transit.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase" }}>Select Destination Facility</label>
          <select 
            value={selectedHospital} 
            onChange={(e) => setSelectedHospital(e.target.value)}
            style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--border)", backgroundColor: "#f8fafc", fontSize: "0.9375rem" }}
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name || `Facility #${h.id}`}</option>
            ))}
          </select>
        </div>

        {results && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ 
               padding: "24px", 
               borderRadius: "16px", 
               backgroundColor: results.ambulance_delay_min > 15 ? "#fee2e2" : results.ambulance_delay_min > 10 ? "#ffedd5" : "#ecfdf5",
               border: "1px solid",
               borderColor: results.ambulance_delay_min > 15 ? "#fca5a5" : results.ambulance_delay_min > 10 ? "#fdba74" : "#a7f3d0"
            }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "bold", opacity: 0.7, textTransform: "uppercase" }}>Estimated Corridor Delay</p>
              <p style={{ fontSize: "2.5rem", fontWeight: "black", margin: "8px 0" }}>{results.ambulance_delay_min.toFixed(1)} <span style={{ fontSize: "1rem" }}>mins</span></p>
              <div style={{ 
                display: "inline-block", 
                padding: "4px 12px", 
                borderRadius: "100px", 
                backgroundColor: results.ambulance_delay_min > 15 ? "#ef4444" : results.ambulance_delay_min > 10 ? "#f59e0b" : "#10b981",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase"
              }}>
                {results.ambulance_delay_min > 15 ? 'Critical Health Risk' : results.ambulance_delay_min > 10 ? 'High Delay Probability' : 'Low Transit Risk'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <Clock size={16} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Avg. Gridlock</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{results.congestion_pct}%</p>
              </div>
              <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <Activity size={16} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Alternate Routes</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{results.avg_delay_min > 15 ? '1 Ava.' : '3 Ava.'}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", padding: "16px", backgroundColor: "#eff6ff", borderRadius: "12px", border: "1px solid #dbeafe", display: "flex", gap: "12px" }}>
           <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
           <p style={{ fontSize: "0.75rem", color: "#1e40af", lineHeight: 1.5 }}>
             The corridor visualization shows active blockages being monitored by the municipal command center.
           </p>
        </div>
      </aside>

      {/* Map Content */}
      <main style={{ flex: 1, position: "relative" }}>
        <InteractiveMap 
          readOnly={true} 
          highlightedRoads={["road_1", "road_2", "road_3"]} 
          center={hospitals.find(h => h.id === selectedHospital) ? [hospitals.find(h => h.id === selectedHospital).lat, hospitals.find(h => h.id === selectedHospital).lng] : [12.2958, 76.6394]}
        />
        
        <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 1000, backgroundColor: "white", padding: "12px 24px", borderRadius: "100px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "8px", height: "8px", backgroundColor: "#ef4444", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#1e293b" }}>MUIP Live Data Stream Active</span>
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
