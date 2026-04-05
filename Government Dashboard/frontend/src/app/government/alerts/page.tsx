"use client";

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Bell, Clock,
  MapPin, Share2, Send, Trash2,
  Search, Filter, Plus, Radio, CheckCircle
} from 'lucide-react';
import styles from './Alerts.module.css';

const INITIAL_ALERTS = [
  {
    id: 1, type: 'CRITICAL',
    title: 'Road Blockage: Sayyaji Rd',
    message: 'Heavy water logging reported. Traffic diverted to MG Road.',
    location: 'Chamarajapuram', time: '2 mins ago', status: 'Active',
  },
  {
    id: 2, type: 'WARNING',
    title: 'High Traffic: KR Circle',
    message: 'Dasara rehearsal crowd peaking. Expect 20-minute delays.',
    location: 'Town Hall', time: '15 mins ago', status: 'Active',
  },
  {
    id: 3, type: 'INFO',
    title: 'Maintenance: JLB Road',
    message: 'Streetlight repair scheduled tonight 11 PM.',
    location: 'Agrahara', time: '1 hour ago', status: 'Scheduled',
  },
];

const TYPE_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  WARNING:  '#d97706',
  INFO:     '#64748b',
};

const TYPE_BG: Record<string, string> = {
  CRITICAL: 'var(--accent-red)',
  WARNING:  'var(--accent-amber)',
  INFO:     '#64748b',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', location: '', type: 'CRITICAL' });

  useEffect(() => {
    fetch('http://localhost:8001/api/v1/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data.length ? data : INITIAL_ALERTS));
  }, []);

  const handleCreateAlert = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8001/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const newAlert = await res.json();
      setAlerts([newAlert, ...alerts]);
      setIsModalOpen(false);
      setFormData({ title: '', message: '', location: '', type: 'CRITICAL' });
    } catch (err) {
      console.error(err);
    }
  };
  const filtered = alerts.filter(a =>
    (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.message || '').toLowerCase().includes(search.toLowerCase())
  );

  const remove = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Public Alerts &amp; Notifications</h1>
          <p className={styles.subtitle}>Emergency Management &amp; Communication Hub</p>
        </div>
        <button className={styles.newBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={15} /> Create Broadcast
        </button>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        {[
          { label: 'Active Critical',  value: '02', icon: AlertTriangle, bg: '#fef2f2',  color: '#dc2626' },
          { label: 'Live Broadcasts',  value: '01', icon: Radio,         bg: '#fffbeb',  color: '#d97706' },
          { label: 'Resolved (24h)',   value: '14', icon: CheckCircle,   bg: '#f0fdf4',  color: '#16a34a' },
          { label: 'Total Sent',       value: '248', icon: Bell,         bg: '#f8fafc',  color: '#475569' },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statValue}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search Bar ── */}
      <div className={styles.searchBar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search alerts by title or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button className={styles.filterBtn}>
          <Filter size={15} /> Filter
        </button>
      </div>

      {/* ── Alert Cards ── */}
      <div className={styles.alertList}>
        {filtered.map(alert => (
          <div
            key={alert.id}
            className={styles.alertCard}
            style={{ borderLeftColor: TYPE_COLORS[alert.type] }}
          >
            {/* Icon */}
            <div className={styles.alertIconWrap} style={{ background: TYPE_COLORS[alert.type] + '18', color: TYPE_COLORS[alert.type] }}>
              <Bell size={20} />
            </div>

            {/* Content */}
            <div className={styles.alertContent}>
              <div className={styles.alertTitleRow}>
                <h3 className={styles.alertTitle}>{alert.title}</h3>
                <span className={styles.alertTypeBadge} style={{ background: TYPE_BG[alert.type] }}>
                  {alert.type}
                </span>
              </div>
              <p className={styles.alertMessage}>{alert.message}</p>
              <div className={styles.alertMeta}>
                <span className={styles.metaItem}>
                  <MapPin size={11} /> {alert.location}
                </span>
                <span className={styles.metaItem}>
                  <Clock size={11} /> {alert.time}
                </span>
                <span
                  className={styles.metaItem}
                  style={{ color: alert.status === 'Active' ? '#16a34a' : 'var(--text-muted)' }}
                >
                  <CheckCircle size={11} /> {alert.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.alertActions}>
              <button className={styles.actionBtn} title="Share">
                <Share2 size={15} />
              </button>
              <button className={styles.actionBtn} title="Broadcast">
                <Send size={15} />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                onClick={() => remove(alert.id)}
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className={styles.empty}>
            <Bell size={32} style={{ opacity: 0.25 }} />
            <p>No alerts match your search</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleCreateAlert} className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Radio className="text-red-400" size={18} />
                <h3 className="font-bold text-sm tracking-widest uppercase">New Broadcast</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><Trash2 size={16} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full mt-1 p-2 border border-slate-200 rounded text-sm outline-none focus:border-red-400" placeholder="e.g. Protocol Alpha Initiated" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full mt-1 p-2 border border-slate-200 rounded text-sm outline-none focus:border-red-400">
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Location</label>
                  <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full mt-1 p-2 border border-slate-200 rounded text-sm outline-none focus:border-red-400" placeholder="e.g. Citywide" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Message</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={3} className="w-full mt-1 p-2 border border-slate-200 rounded text-sm outline-none focus:border-red-400" placeholder="Enter full notification details..." />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-md uppercase tracking-wide">Publish Alert</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
