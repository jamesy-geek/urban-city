"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "64px",
      backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", zIndex: 1000, color: "var(--text-primary)"
    }}>
      <Link href="/citizen/map" style={{ display: "flex", flexDirection: "column", gap: "2px", textDecoration: "none" }}>
        <span style={{ fontWeight: "bold", fontSize: "1.25rem", color: "var(--primary)" }}>MUIP</span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Mysuru Urban Intelligence</span>
      </Link>
      
      <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <Link href="/citizen/dashboard" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{t("Overview")}</Link>
        <Link href="/citizen/emergency" style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#ef4444" }}>{t("Live Status")}</Link>
        <Link href="/citizen/forms" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{t("Civic Forms")}</Link>
        <a href="/ai_chatbot/index.html" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{t("CityMind AI")}</a>
        <Link href="/citizen/support" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{t("Support")}</Link>
      </nav>
      
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
         <button 
           onClick={toggleLanguage}
           style={{ 
             padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)",
             fontSize: "0.875rem", backgroundColor: "white", cursor: "pointer",
             fontWeight: 600, color: "var(--primary)"
           }}>
             {language === 'en' ? "ಕನ್ನಡ" : "English"}
         </button>
      </div>
    </header>
  );
}
