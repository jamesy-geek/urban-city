import { AlertCircle, CheckCircle2, History, Play } from "lucide-react";
import styles from "./DashboardComponents.module.css";

const activities = [
  { id: 1, type: "simulation", title: "Festival Road Closure", time: "12m ago", status: "complete" },
  { id: 2, type: "alert", title: "Flood Risk - Ward 4", time: "45m ago", status: "active" },
  { id: 3, type: "form", title: "Road Closure Request", time: "1h ago", status: "pending" },
  { id: 4, type: "simulation", title: "Traffic Re-routing", time: "3h ago", status: "failed" },
  { id: 5, type: "alert", title: "Accident - K.R Hospital", time: "5h ago", status: "resolved" }
];

export function RecentActivity() {
  return (
    <div className={styles.activity_card}>
      <div className={styles.activity_header}>
        <h3 className="text-sm font-bold tech-label flex items-center gap-2">
          <History size={16} /> Recent Activity
        </h3>
        <button className="text-xs text-cyan tech-label" style={{ fontSize: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
      </div>

      <div className={styles.activity_list}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.activity_item}>
            <div style={{ 
              marginTop: '0.25rem',
              color: activity.status === 'complete' ? 'var(--success)' :
                     activity.status === 'active' ? 'var(--danger)' :
                     activity.status === 'pending' ? 'var(--accent-amber)' :
                     'var(--text-muted)'
            }}>
              {activity.status === 'complete' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            </div>
            <div style={{ flex: 1 }}>
              <p className="text-xs font-semibold">{activity.title}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted uppercase tech-label" style={{ fontSize: '10px' }}>{activity.type}</span>
                <span className="text-xs text-muted" style={{ fontSize: '10px' }}>{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.activity_btn_group}>
        <button
          onClick={() => window.location.href = '/government/simulation'}
          className="flex-1 py-3 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition-all uppercase tracking-widest shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2">
          <Play size={14} fill="currentColor" /> Run Simulation
        </button>
        <button
          onClick={() => window.location.href = '/government/alerts'}
          className="flex-1 py-3 border border-cyan-600 text-cyan-600 bg-white rounded-xl text-xs font-bold hover:bg-cyan-50 transition-all uppercase tracking-widest">
          New Alert
        </button>
      </div>
    </div>
  );
}
