"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings, 
  Map as MapIcon, 
  Activity, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  Siren,
  User,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Sidebar.module.css";

const sidebarLinks = [
  { name: "Dashboard", href: "/government", icon: LayoutDashboard },
  { name: "Simulation", href: "/government/simulation", icon: Activity },
  { name: "Emergency Ops", href: "/government/emergency", icon: Siren },
  { name: "Analytics", href: "/government/analytics", icon: BarChart3 },
  { name: "Citizen Forms", href: "/government/forms", icon: FileText },
  { name: "Alerts", href: "/government/alerts", icon: AlertTriangle },
];

export function GovernmentSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo_container}>
        <h1 className="text-2xl font-black text-white tech-label tracking-tighter">
          MUIP
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
          Government Portal
        </p>
      </div>

      <nav className={styles.nav}>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/government" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`${styles.nav_link} ${isActive ? styles.nav_link_active : ""}`}
            >
              <link.icon size={18} />
              <span>{link.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className={styles.active_indicator}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.user_section}>
          <div className={styles.avatar}>
            <User size={16} className="text-cyan" />
          </div>
          <div>
            <p className="text-xs font-semibold">Admin User</p>
            <p className="text-xs text-muted" style={{ fontSize: '10px' }}>Super Admin</p>
          </div>
        </div>
        
        <button className={styles.logout_btn}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
