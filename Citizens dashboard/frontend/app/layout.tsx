import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MUIP Mysuru Citizen Dashboard",
  description: "Mysuru Urban Intelligence Platform (MUIP) — citizen portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmMono.variable}`}>
        <LanguageProvider>
          <Header />
          <main style={{ marginTop: "64px" }}>
            {children}
          </main>
        
        <footer style={{
          padding: "24px", borderTop: "1px solid var(--border)",
          backgroundColor: "#f1f5f9", textAlign: "center", position: "relative", zIndex: 1
        }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "8px" }}>
            Data sourced from KGIS Karnataka, OpenStreetMap, OpenCity India
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
            Built by Team QUINTUS | PESCE Mandya
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 500 }}>
            For emergencies call: 112 | MUDA Helpline: 0821-2418888
          </p>
        </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
