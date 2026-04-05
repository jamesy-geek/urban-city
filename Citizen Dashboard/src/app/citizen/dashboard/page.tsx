"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Info, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Dynamically load the map so it works with Next.js SSR
const DynamicDashboardMap = dynamic<{ activeScenario: string | null }>(() => import("@/components/citizen/DashboardMap"), {
  ssr: false,
  loading: () => <div style={{ height: "400px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading Map...</div>
});

const SCENARIOS = [
  { id: "ROAD_CLOSURE", label: "Road Closure", color: "red" },
  { id: "CONSTRUCTION", label: "Construction", color: "orange" },
  { id: "FLOOD", label: "Flood", color: "blue" },
  { id: "BUS_ROUTE", label: "Bus Route", color: "green" },
  { id: "RESTRICTION", label: "Restriction", color: "pink" },
  { id: "FESTIVAL", label: "Festival", color: "purple" },
];

export default function ConsolidatedDashboard() {
  const { t } = useLanguage();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Open" | "Resolved" | "Unresolved">("All");
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8001/api/v1/analytics/overview')
      .then(r => r.json())
      .then(data => setDbStats(data))
      .catch(err => console.error("Stats fetch failed", err));
  }, []);

  const STATS = [
    { label: t("Simulated Scenarios"), value: dbStats?.total_simulations || "8", icon: Info, color: "#3b82f6" },
    { label: t("City Congestion"), value: (dbStats?.avg_congestion || "22") + "%", icon: AlertCircle, color: "#f59e0b" },
    { label: t("Arch. Resilience"), value: dbStats?.architecture_resilience || "98.2%", icon: CheckCircle, color: "#10b981" },
    { label: t("Citizens Reported"), value: "12", icon: Clock, color: "#ef4444" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top: 4 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{ 
            backgroundColor: "white", padding: "24px", borderRadius: "12px", 
            border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "16px" 
          }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</p>
              <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Middle: Map & Scenarios */}
      <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>{t("City Operations Map")}</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {SCENARIOS.map(s => (
               <button
                 key={s.id}
                 onClick={() => setActiveScenario(prev => prev === s.id ? null : s.id)}
                 style={{
                   padding: "6px 12px",
                   backgroundColor: activeScenario === s.id ? s.color : "white",
                   color: activeScenario === s.id ? "white" : "var(--text-primary)",
                   border: `1px solid ${s.color}`,
                   borderRadius: "20px",
                   fontSize: "0.875rem",
                   fontWeight: 500,
                   cursor: "pointer",
                   transition: "all 0.2s"
                 }}
               >
                 {t(s.label)}
               </button>
            ))}
          </div>
        </div>
        <div style={{ height: "400px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
           <DynamicDashboardMap activeScenario={activeScenario} />
        </div>
      </div>

      {/* Bottom: Ticket Table */}
      <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
          {(["All", "Open", "Resolved", "Unresolved"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                color: activeTab === tab ? "var(--primary)" : "var(--text-muted)",
                fontWeight: activeTab === tab ? 600 : 500,
                cursor: "pointer",
                marginBottom: "-1px"
              }}
            >
              {t(tab + " Tickets")}
            </button>
          ))}
        </div>
        
        {/* Empty State */}
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            <AlertCircle size={32} color="#94a3b8" />
          </div>
          <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: "1.125rem" }}>{t("No tickets found")}</h3>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>{t("There are currently no tickets in the")} {t(activeTab + " Tickets")} {t("category")}.</p>
        </div>
      </div>

    </div>
  );
}
