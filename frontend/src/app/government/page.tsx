"use client";

import dynamic from "next/dynamic";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AlertTriangle, Activity, FileText, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Dashboard.module.css";

// Dynamic import for Leaflet (client-side only)
const MapComponent = dynamic(() => import("@/components/map/MapComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface animate-pulse rounded-xl" /> 
});

const stats = [
  { title: "Active Alerts", value: 12, trend: "+3", status: "danger", icon: <AlertTriangle size={16} /> },
  { title: "Simulations Run", value: 45, trend: "+12", status: "info", icon: <Activity size={16} /> },
  { title: "Forms Pending", value: 8, trend: "-2", status: "warning", icon: <FileText size={16} /> },
  { title: "Flood Risk Zones", value: 4, trend: "Stable", status: "success", icon: <Droplets size={16} /> },
];

export default function GovernmentDashboard() {
  return (
    <div className={styles.container}>
      {/* Zone 1: Stats Pods */}
      <div className={styles.stats_grid}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...stat as any} />
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Grid: Zones 2 & 3 */}
      <div className={styles.main_content}>
        {/* Zone 2: The Map (65%) */}
        <motion.div 
          className={styles.map_zone}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.map_header}>
            <h2 className={styles.map_status}>
              <span className={`${styles.status_dot} animate-pulse`}></span>
              Live City Intelligence Map
            </h2>
            <div className="flex items-center gap-4 text-xs text-muted tech-label">
              <span>Center: 12.2958, 76.6394</span>
              <span>Updated: Real-time</span>
            </div>
          </div>
          <div className={styles.map_wrapper}>
            <MapComponent />
          </div>
        </motion.div>

        {/* Zone 3: Recent Activity (35%) */}
        <motion.div 
          className={styles.activity_zone}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RecentActivity />
        </motion.div>
      </div>
    </div>
  );
}
