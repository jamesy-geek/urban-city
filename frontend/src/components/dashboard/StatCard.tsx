import { ReactNode } from "react";
import styles from "./DashboardComponents.module.css";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  status?: "success" | "danger" | "warning" | "info";
  icon?: ReactNode;
}

export function StatCard({ title, value, trend, status = "info", icon }: StatCardProps) {
  const statusColor = {
    success: styles.text_success || "text-success",
    danger: styles.text_danger || "text-danger",
    warning: styles.text_warning || "text-amber",
    info: styles.text_info || "text-cyan",
  }[status];

  // Helper for dynamic colors since CSS Modules hashing makes it tricky
  const getThemeColor = () => {
    if (status === 'success') return 'var(--success)';
    if (status === 'danger') return 'var(--danger)';
    if (status === 'warning') return 'var(--accent-amber)';
    return 'var(--accent-cyan)';
  };

  return (
    <div className={styles.stat_card}>
      <div className={styles.stat_header}>
        <span className={styles.stat_title}>{title}</span>
        <div style={{ color: getThemeColor(), opacity: 0.7 }}>
          {icon}
        </div>
      </div>
      <div className={styles.stat_value_container}>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </h2>
        {trend && (
          <span className={styles.stat_trend} style={{ color: getThemeColor() }}>
            {trend} <span style={{ opacity: 0.5, transform: 'rotate(45deg)' }}>↑</span>
          </span>
        )}
      </div>
      <div className={styles.stat_progress_bg}>
        <div 
          className={styles.stat_progress_fill} 
          style={{ backgroundColor: getThemeColor() }}
        ></div>
      </div>
    </div>
  );
}
