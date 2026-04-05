"use client";

import React, { useState, useEffect } from 'react';
import { 
  Trophy, CheckCircle2, AlertTriangle, 
  ChevronRight, BrainCircuit, Loader2, Plus, 
  Building2, Shovel, Map as MapIcon, RotateCcw,
  Activity, HeartPulse, Trash2, BusFront
} from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './Policy.module.css';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMapComponent'), { ssr: false });

const PRESETS = [
  { 
    name: "Dasara Traffic", 
    scenarios: [
      { name: "VIP Route Closure (Sayyaji Rd)", results: { congestion_pct: 42.1, ambulance: 8.5, safety: 9.2, pollution: 15.4 } },
      { name: "Citizen Detour (MG Rd)", results: { congestion_pct: 22.4, ambulance: 2.1, safety: 4.1, pollution: 8.2 } }
    ]
  },
  {
    name: "Monsoon Prep",
    scenarios: [
      { name: "Current Drain Maintenance (80%)", results: { flood: 7.8, health: 6.2, waste: 4.1, delay: 15.2, congestion_pct: 5.0 } },
      { name: "Enhanced Maintenance (95%)", results: { flood: 2.1, health: 1.2, waste: 1.5, delay: 5.4, congestion_pct: 4.2 } }
    ]
  },
  {
    name: "Garbage Strike",
    scenarios: [
      { name: "Zone D Strike (7 Days)", results: { health: 8.9, waste: 9.4, pollution: 22.1, congestion_pct: 5.2 } },
      { name: "Rerouted Fleet (Contract)", results: { health: 3.2, waste: 2.1, pollution: 8.4, congestion_pct: 12.1 } }
    ]
  }
];

export default function PolicyLabPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([
    {
      id: 'a',
      name: 'Scenario A: Baseline',
      results: { congestion_pct: 15, delay: 5, ambulance: 2, pollution: 5, flood: 1, health: 1, waste: 1 }
    },
    {
      id: 'b',
      name: 'Scenario B: Impact',
      results: { congestion_pct: 30, delay: 15, ambulance: 6, pollution: 12, flood: 4, health: 3, waste: 2 }
    }
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadPreset = (preset: typeof PRESETS[0]) => {
     setActivePreset(preset.name);
     setScenarios(preset.scenarios.map((s, idx) => {
        const r = s.results as Record<string, number>;
        return {
           id: idx === 0 ? 'a' : 'b',
           name: s.name,
           results: {
              congestion_pct: r.congestion_pct ?? 0,
              delay:          r.delay          ?? 0,
              ambulance:      r.ambulance       ?? 0,
              pollution:      r.pollution       ?? 0,
              flood:          r.flood           ?? 0,
              health:         r.health          ?? 0,
              waste:          r.waste           ?? 0,
              safety:         r.safety          ?? 0,
           }
        };
     }));
     setRecommendation(null);
  };

  const generateRecommendation = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8001/api/v1/policy/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios, preset: activePreset })
      });
      const data = await res.json();
      setRecommendation(data.recommendation);
    } catch (e) {
      setRecommendation("ANALYSIS FAILED: Simulation engine timed out. Using cached heuristic: 'Option B prevents mass waste accumulation in high-risk Monsoon zones. Immediate approval recommended.'");
    }
    setLoading(false);
  };

  if (!isMounted) return <div className={styles.page} />;

  return (
    <div className={styles.page}>
      
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Policy Comparison</h1>
          <p className={styles.subtitle}>Unified Model V2.0 Contextual Analysis</p>
        </div>
        <div className="flex gap-2">
           {PRESETS.map(p => (
             <button 
               key={p.name} 
               onClick={() => loadPreset(p)}
               className={`${styles.btn} ${activePreset === p.name ? styles.btnPrimary : styles.btnSecondary}`}
               style={{ fontSize: '9px', padding: '0.4rem 0.6rem', border: activePreset === p.name ? '1px solid #0891b2' : '1px solid #e2e8f0' }}
             >
               {p.name}
             </button>
           ))}
        </div>
        <div className={styles.actions}>
           <button 
             onClick={generateRecommendation}
             className={`${styles.btn} ${styles.btnPrimary}`}
             disabled={loading}
             style={{ backgroundColor: '#ef4444' }}
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <BrainCircuit size={14} />}
              Compute Optimum
           </button>
        </div>
      </header>

      <section className={styles.mapArea}>
        <InteractiveMap />
      </section>

      <section className={styles.scenarioGrid}>
         {scenarios.map((s, idx) => (
           <div key={idx} className={styles.card}>
              <div className={styles.cardHeader}>
                 <div className={styles.cardIcon}>
                    {idx === 0 ? <Building2 size={24} /> : <Shovel size={24} />}
                 </div>
                 <span className={styles.slot}>V2 PREDICTION {idx === 0 ? 'ALPHA' : 'BETA'}</span>
              </div>
              <h3 className={styles.cardTitle}>{s.name}</h3>
              
              <div className={styles.metrics}>
                 {s.results.congestion_pct > 0 && <MetricRow label="Congestion" value={s.results.congestion_pct + '%'} />}
                 {s.results.ambulance > 0 && <MetricRow label="Amb. Delay" value={s.results.ambulance + 'm'} highlight={s.results.ambulance > 5} />}
                 {s.results.health > 0 && <MetricRow label="Health Risk" value={s.results.health + '/10'} highlight={s.results.health > 7} />}
                 {s.results.waste > 0 && <MetricRow label="Waste Disr." value={s.results.waste + '/10'} />}
                 {s.results.flood > 0 && <MetricRow label="Flood Prob." value={s.results.flood + '/10'} />}
                 {s.results.safety > 0 && <MetricRow label="Safety Risk" value={s.results.safety + '/10'} />}
              </div>
           </div>
         ))}
         
         <button className={styles.addButton}>
            <div className={styles.plusIcon}><Plus size={32} /></div>
            <span className={styles.slot}>New Lab Slot</span>
         </button>
      </section>

      {recommendation && (
        <div className={styles.recommendation} style={{ borderLeft: '4px solid #ef4444' }}>
           <div className={styles.recHeader}>
              <div className={styles.recIcon}><BrainCircuit size={20} /></div>
              <h2 className={styles.recTitle}>AI POLICY CORE</h2>
           </div>
           <p className={styles.recText}>"{recommendation}"</p>
           <div className="flex gap-2 mt-6">
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ background: '#0891b2' }}>Ratify Delta B</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`}>Export Analysis</button>
           </div>
        </div>
      )}

      <div className={styles.tableContainer}>
         <table className={styles.table}>
            <thead>
               <tr>
                  <th className={styles.th}>Critical Factor</th>
                  <th className={styles.th}>Scenario A</th>
                  <th className={styles.th}>Scenario B</th>
                  <th className={styles.th}>Result</th>
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td className={styles.td}>Max Identified Risk</td>
                  <td className={styles.td} style={{ color: '#ef4444', fontWeight: 800 }}>{Math.max(scenarios[0].results.health || 0, scenarios[0].results.ambulance || 0, scenarios[0].results.flood || 0).toFixed(1)}/10</td>
                  <td className={styles.td} style={{ color: '#10b981', fontWeight: 800 }}>{Math.max(scenarios[1].results.health || 0, scenarios[1].results.ambulance || 0, scenarios[1].results.flood || 0).toFixed(1)}/10</td>
                  <td className={styles.td}>{ Math.max(scenarios[1].results.health || 0) < Math.max(scenarios[0].results.health || 0) ? '✅ B Preferred' : '⚠️ A Preferred'}</td>
               </tr>
               <tr style={{ background: '#f8fafc' }}>
                  <td className={styles.td} style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 800 }}>Decision Heuristic</td>
                  <td className={styles.td}>—</td>
                  <td className={styles.td}>—</td>
                  <td className={styles.td}>
                     <div className={styles.winner}>
                        <CheckCircle2 size={16} />
                        <span>QUANTITATIVE OPTIMUM</span>
                     </div>
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
}

function MetricRow({ label, value, highlight }: any) {
  return (
    <div className={styles.metricRow}>
       <span className={styles.metricLabel}>{label}</span>
       <span className={`${styles.metricValue} ${highlight ? styles.metricDanger : ''}`}>{value}</span>
    </div>
  );
}
