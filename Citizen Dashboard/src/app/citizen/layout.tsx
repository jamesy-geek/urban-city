import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/citizen/Header";
import CityMindChatbot from "@/components/Chatbot/Chatbot";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ marginTop: "64px", flex: 1 }}>
          {children}
        </main>
        <CityMindChatbot />
        <footer style={{
          padding: "24px", borderTop: "1px solid var(--border)",
          backgroundColor: "#f8fafc", textAlign: "center", position: "relative", zIndex: 1
        }}>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "8px" }}>
            Data sourced from KGIS Karnataka, OpenStreetMap, OpenCity India
          </p>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
            Official Citizen Portal — MUIP Urban Twin Initiative
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 500 }}>
            Emergency: 112 | Child Helpline: 1098 | Women Helpline: 181
          </p>
        </footer>
      </div>
    </LanguageProvider>
  );
}
