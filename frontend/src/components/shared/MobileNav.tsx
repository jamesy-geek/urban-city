"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Activity, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  Siren
} from "lucide-react";
import styles from "./MobileNav.module.css";

const mobileLinks = [
  { name: "Dash", href: "/government", icon: LayoutDashboard },
  { name: "Sim", href: "/government/simulation", icon: Activity },
  { name: "Ops", href: "/government/emergency", icon: Siren },
  { name: "Labs", href: "/government/policy", icon: MapIcon },
  { name: "Stats", href: "/government/analytics", icon: BarChart3 },
  { name: "Alert", href: "/government/alerts", icon: AlertTriangle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.mobile_nav}>
      {mobileLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/government" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`${styles.nav_item} ${isActive ? styles.nav_item_active : ""}`}
          >
            <link.icon size={18} />
            <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
