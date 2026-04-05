"use client";

import { Siren, Trash2, MapPin, AlertCircle, ChevronRight, Waves, Calendar } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CitizenEmergencyHub() {
  const { t } = useLanguage();

  const MODULES = [
    { 
      id: "ambulance", 
      icon: Siren, 
      label: "Ambulance Corridors", 
      desc: "Live monitoring of active emergency response routes and transit times.",
      color: "#ef4444",
      link: "/citizen/emergency/ambulance"
    },
    { 
      id: "flood", 
      icon: Waves, 
      label: "Flood Vulnerability", 
      desc: "Simulating heavy rainfall impact on Mysore's urban drainage network.",
      color: "#3b82f6",
      link: "/citizen/emergency/flood"
    },
    { 
      id: "festival", 
      icon: Calendar, 
      label: "Dasara Crowd Logic", 
      desc: "Managing high-density movement during the world-famous Dasara festival.",
      color: "#f59e0b",
      link: "/citizen/emergency/festival"
    },
    { 
      id: "garbage", 
      icon: Trash2, 
      label: "Waste Collection Status", 
      desc: "Monitoring neighborhood garbage collection cycles and zone efficiency.",
      color: "#10b981",
      link: "/citizen/emergency/garbage"
    }
  ];

  return (
    <div style={{ padding: "48px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", color: "var(--text-primary)" }}>Public Safety & Civic Operations</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.125rem", marginTop: "8px" }}>Live data from MUIP Intelligence Hub</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        {MODULES.map(m => (
          <Link key={m.id} href={m.link} style={{ textDecoration: "none" }}>
            <div className="card" style={{ 
              padding: "32px", 
              backgroundColor: "white", 
              border: "1px solid var(--border)", 
              borderRadius: "20px",
              display: "flex",
              gap: "24px",
              transition: "transform 0.2s ease, border-color 0.2s ease",
              cursor: "pointer"
            }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                borderRadius: "16px", 
                backgroundColor: `${m.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: m.color,
                flexShrink: 0
              }}>
                <m.icon size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  {m.label}
                  <ChevronRight size={18} style={{ opacity: 0.3 }} />
                </h2>
                <p style={{ color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.5 }}>{m.desc}</p>
                <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: m.color, backgroundColor: `${m.color}10`, padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                    Live Monitoring
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "64px", padding: "32px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "20px" }}>
        <div style={{ display: "flex", gap: "16px" }}>
          <AlertCircle size={24} color="#dc2626" />
          <div>
            <h3 style={{ fontWeight: "bold", color: "#991b1b" }}>Disclaimer</h3>
            <p style={{ color: "#b91c1c", fontSize: "0.875rem", marginTop: "4px", lineHeight: 1.6 }}>
               Simulation data is for civic situational awareness and municipal coordination. 
               Always rely on information from official authorities during active emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
