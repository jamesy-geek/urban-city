"use client";

import { useState, useEffect } from "react";
import { Info, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SupportDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"All" | "Open" | "Resolved" | "Unresolved">("All");

  const STATS_TEMPLATES = [
    { label: t("Help"), key: "pending", icon: Info, color: "#f59e0b" },
    { label: t("Resolved"), key: "approved", icon: CheckCircle, color: "#10b981" },
    { label: t("Unresolved"), key: "rejected", icon: Clock, color: "#ef4444" },
  ];

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8001/api/v1/forms/submissions')
      .then(res => res.json())
      .then(data => {
        // Filter for complaints or AI assistant tickets
        const filtered = data.filter((t: any) => t.type === 'complaint' || t.applicant === "CityMind AI Assistant" || t.type === 'waste_report');
        setTickets(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statsCount = {
    pending: tickets.filter(t => t.status === 'pending').length,
    approved: tickets.filter(t => t.status === 'approved').length,
    rejected: tickets.filter(t => t.status === 'rejected').length,
  };

  const filteredTickets = tickets.filter(tkt => {
    if (activeTab === "All") return true;
    if (activeTab === "Open") return tkt.status === "pending";
    if (activeTab === "Resolved") return tkt.status === "approved";
    if (activeTab === "Unresolved") return tkt.status === "rejected";
    return true;
  });

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top: 3 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {STATS_TEMPLATES.map(stat => (
          <button
            key={stat.label} 
            onClick={() => {
               if (stat.label === t("Resolved")) setActiveTab("Resolved");
               else if (stat.label === t("Unresolved")) setActiveTab("Unresolved");
               else setActiveTab("Open"); // Help/Pending
            }}
            style={{ 
              backgroundColor: "white", padding: "24px", borderRadius: "12px", 
              border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "16px",
              cursor: "pointer", textAlign: "left", transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ 
              width: "48px", height: "48px", borderRadius: "12px", 
              backgroundColor: `${stat.color}15`, display: "flex", alignItems: "center", 
              justifyContent: "center", color: stat.color 
            }}>
              <stat.icon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</p>
              <h3 style={{ margin: 0, fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 600 }}>{(statsCount as any)[stat.key]}</h3>
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>

      {/* Bottom: Ticket Table */}
      <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", border: "1px solid var(--border)" }}>
        
        {/* Ticket Filter Tabs */}
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
              {t(tab)}
            </button>
          ))}
        </div>
        
        {/* Table Header Structure */}
        <div style={{ 
          display: "grid", gridTemplateColumns: "1fr 4fr 2fr 2fr", 
          padding: "12px 16px", backgroundColor: "#f8fafc", 
          borderRadius: "8px", fontWeight: 600, color: "var(--text-muted)",
          fontSize: "0.875rem", marginBottom: "8px"
        }}>
          <div>{t("ID")}</div>
          <div>{t("Subject")}</div>
          <div>{t("Date")}</div>
          <div>{t("Status")}</div>
        </div>

        {/* Tickets List or Empty State */}
        {filteredTickets.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredTickets.map(tkt => (
              <div key={tkt.id} style={{ 
                display: "grid", gridTemplateColumns: "1.5fr 4fr 2fr 2fr", 
                padding: "12px 16px", backgroundColor: "white", 
                borderBottom: "1px solid var(--border)", color: "var(--text-primary)",
                fontSize: "0.875rem", alignItems: "center"
              }}>
                <div style={{ fontWeight: 500, fontSize: '0.75rem', fontFamily: 'monospace' }}>{tkt.id}</div>
                <div>{tkt.details?.issue || tkt.type.replace('_',' ').toUpperCase()}</div>
                <div style={{ color: "var(--text-muted)" }}>{tkt.date}</div>
                <div>
                  <span style={{ 
                    padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600,
                    backgroundColor: tkt.status === "approved" || tkt.status === "Resolved" ? "#d1fae5" : tkt.status === "pending" || tkt.status === "Open" ? "#dbeafe" : "#fee2e2",
                    color: tkt.status === "approved" || tkt.status === "Resolved" ? "#065f46" : tkt.status === "pending" || tkt.status === "Open" ? "#1e40af" : "#991b1b"
                  }}>
                    {t(tkt.status === "pending" ? "Open" : tkt.status === "approved" ? "Resolved" : tkt.status === "rejected" ? "Unresolved" : tkt.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "64px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <AlertCircle size={32} color="#94a3b8" />
            </div>
            <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: "1.125rem" }}>{t("No tickets found")}</h3>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              {t("There are currently no tickets in the")} "{t(activeTab)}" {t("category")}. <br/>
              {t("Real data will be populated here soon.")}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
