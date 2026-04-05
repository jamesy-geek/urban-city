"use client";

import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, Activity, AlertTriangle,
  MapPin, Zap, BrainCircuit, Loader2
} from 'lucide-react';
import styles from './Analytics.module.css';

const COLORS = ['#0891b2', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [activeRange, setActiveRange] = useState('30D');
  const [isMounted, setIsMounted] = useState(false);
  const RANGES = ['7D', '30D', '90D', 'ALL'];

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          fetch('http://localhost:8001/api/v1/analytics/overview'),
          fetch('http://localhost:8001/api/v1/analytics/congestion-trend'),
          fetch('http://localhost:8001/api/v1/analytics/wards'),
          fetch('http://localhost:8001/api/v1/analytics/insights')
        ]);
        if (!r1.ok || !r2.ok || !r3.ok || !r4.ok) return;
        const overview = await r1.json();
        const trend    = await r2.json();
        const wards    = await r3.json();
        const insights = await r4.json();
        setData({
          overview,
          trend,
          wards,
          insights,
          scenarios: Object.entries(overview.top_scenarios || {}).map(([name, value]) => ({ 
            name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
            value 
          })),
        });
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles.page}>

      {/* ── Header ──────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics Dashboard</h1>
          <p className={styles.subtitle}>MUIP Unified Intelligence — Command Center</p>
        </div>
        <div className={styles.rangeRow}>
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={`${styles.rangeBtn} ${activeRange === r ? styles.rangeBtnActive : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {!isMounted ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Loader2 className="animate-spin text-slate-300" size={48} />
        </div>
      ) : (
        <>
          {/* ── Stat Cards ──────────────────────────────────── */}
          <div className={styles.statsGrid}>
            {[
              { label: 'Total Simulations', value: data?.overview?.total_simulations,       icon: Activity,       accent: '#0891b2', bg: '#ecfeff' },
              { label: 'Avg Congestion',    value: (data?.overview?.avg_congestion) + '%',  icon: TrendingUp,     accent: '#d97706', bg: '#fffbeb' },
              { label: 'Flood Incidence',   value: data?.overview?.flood_incidence_years || '0.0%', icon: MapPin, accent: '#0284c7', bg: '#f0f9ff' },
              { label: 'Arch. Resilience',  value: data?.overview?.architecture_resilience || '98.5%', icon: Zap, accent: '#16a34a', bg: '#f0fdf4' },
            ].map((s, i) => (
              <div className={styles.statCard} key={i}>
                <div className={styles.statIcon} style={{ background: s.bg, color: s.accent }}>
                  <s.icon size={22} />
                </div>
                <div>
                  <p className={styles.statLabel}>{s.label}</p>
                  <p className={styles.statValue}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts Row ──────────────────────────────────── */}
          <div className={styles.chartsRow}>

            {/* Traffic Trend — wide */}
            <div className={`${styles.chartCard} ${styles.chartWide}`}>
              <div className={styles.chartHeader}>
                <div className={styles.chartLabel}>
                  <TrendingUp size={15} style={{ color: 'var(--accent-cyan)' }} />
                  Traffic Congestion Trend
                </div>
                <span className={styles.liveBadge}>Live Data</span>
              </div>
              <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.trend} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8' }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '11px', fontFamily: 'Inter, sans-serif' }} />
                    <Line type="monotone" dataKey="simulated" stroke="#0891b2" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                    <Line type="monotone" dataKey="baseline"  stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scenario Distribution — narrow */}
            <div className={`${styles.chartCard} ${styles.chartNarrow}`}>
              <div className={styles.chartLabel} style={{ marginBottom: '1rem' }}>
                Simulation Scenarios
              </div>
              <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.scenarios} innerRadius={55} outerRadius={72} paddingAngle={4} dataKey="value">
                      {data?.scenarios.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '11px' }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '9px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Bottom Row ──────────────────────────────────── */}
          <div className={styles.bottomRow}>

            {/* Top Impacted Wards */}
            <div className={styles.chartCard}>
              <div className={styles.chartLabel} style={{ marginBottom: '1rem' }}>
                <MapPin size={14} style={{ color: 'var(--accent-purple)' }} />
                Top Impacted Wards (Predicted)
              </div>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={data?.wards || []} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={112} tick={{ fill: '#475569', fontFamily: 'Inter, sans-serif' }} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '11px' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ML Predictive Insights */}
            <div className={`${styles.chartCard} ${styles.insightCard}`}>
              <div className={styles.chartLabel} style={{ marginBottom: '1.25rem' }}>
                <BrainCircuit size={14} style={{ color: 'var(--accent-cyan)' }} />
                ML Predictive Insights
              </div>
              <div className={styles.insightList}>
                {(data?.insights || []).map((row: any, i: number) => (
                  <div key={i} className={styles.insightRow}>
                    <div>
                      <p className={styles.insightScenario}>{row.scenario}</p>
                      <p className={styles.insightCongestion}>{row.congestion} predicted congestion</p>
                    </div>
                    <span className={row.badgeClass}>{row.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
