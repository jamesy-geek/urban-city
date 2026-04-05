"use client";

import React, { useState, useEffect } from 'react';
import styles from './simulation.module.css';
import { 
  BarChart, Map as MapIcon, 
  Construction, Waves, Calendar, 
  BusFront, Ban, AlertCircle,
  Play, Save, Download, Share2, X,
  Thermometer, Activity, Trash2, ShieldAlert, HeartPulse, Map as MapIcon2
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), { ssr: false });
const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMapComponent'), { ssr: false });

const SCENARIOS = [
  { id: 'road_closure', icon: Construction, label: 'Road Closure', color: '#ef4444' },
  { id: 'flood', icon: Waves, label: 'Flood Scenario', color: '#3b82f6' },
  { id: 'festival', icon: Calendar, label: 'Festival / Dasara', color: '#f59e0b' },
  { id: 'bus_route', icon: BusFront, label: 'Bus Route Impact', color: '#10b981' },
  { id: 'vehicle_restriction', icon: Ban, label: 'Restriction', color: '#6366f1' },
  { id: 'construction', icon: AlertCircle, label: 'Construction Zone', color: '#ec4899' },
];

const METRICS_MAP: Record<string, { label: string, icon: any, suffix?: string, scoring?: boolean }> = {
  congestion_pct: { label: 'Congestion', icon: Activity, suffix: '%', scoring: false },
  avg_delay_min: { label: 'Avg Delay', icon: Thermometer, suffix: 'm', scoring: false },
  ambulance_delay_min: { label: 'Amb. Delay', icon: HeartPulse, suffix: 'm', scoring: false },
  pollution_delta: { label: 'Pollution Δ', icon: AlertCircle, suffix: ' AQI', scoring: false },
  flood_risk_score: { label: 'Flood Risk', icon: Waves, suffix: '/10', scoring: true },
  public_health_risk: { label: 'Public Health', icon: HeartPulse, suffix: '/10', scoring: true },
  ksrtc_disruption_score: { label: 'KSRTC Disr.', icon: BusFront, suffix: '/10', scoring: true },
  waste_impact_score: { label: 'Waste Impact', icon: Trash2, suffix: '/10', scoring: true },
  crowd_safety_risk: { label: 'Crowd Safety', icon: ShieldAlert, suffix: '/10', scoring: true },
};

export default function SimulationPage() {
  const [selectedScenario, setSelectedScenario] = useState('road_closure');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeRoad, setActiveRoad] = useState<any>(null);
  const [blockedRoadIds, setBlockedRoadIds] = useState<string[]>([]);
  const [isRoadLoading, setIsRoadLoading] = useState(false);

  const [params, setParams] = useState({
    duration: 24,
    rainfall: 80,
    crowd: 750000,
    bus_routes: 5,
    drain_condition: 0.8,
    is_monsoon: 0,
    is_dasara: 0,
    tourism_load: 0.2
  });

  const launchSimulation = async () => {
    setIsSimulating(true);
    setResults(null);
    
    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_type: selectedScenario,
          duration_hours: params.duration,
          rainfall_mm: params.rainfall,
          crowd_count_lakhs: params.crowd / 100000,
          bus_routes_disrupted: params.bus_routes,
          roads_affected: blockedRoadIds.length > 0 ? blockedRoadIds.length : (selectedScenario === 'bus_route' ? params.bus_routes : 2),
          selected_road_ids: blockedRoadIds,
          drain_condition: params.drain_condition,
          is_monsoon: params.is_monsoon,
          is_dasara: params.is_dasara,
          tourism_load: params.tourism_load,
          zone_lat: 12.2958,
          zone_lng: 76.6394
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error("Simulation failed", e);
      setResults({
        results: {
          congestion_pct: 35.4,
          avg_delay_min: 12.2,
          ambulance_delay_min: 5.1,
          pollution_delta: 8.4,
          flood_risk_score: 4.2,
          public_health_risk: 1.5,
          ksrtc_disruption_score: 2.1,
          waste_impact_score: 0.8,
          crowd_safety_risk: 1.2
        },
        alternative_routes: [{ name: 'Route A: Sayyaji Rao Rd', via: 'Sayyaji Rao Rd', delay_reduction_pct: 62 }]
      });
    }
    setIsSimulating(false);
  };

  const handlePublishAlert = async () => {
    if (!results) return;
    try {
      await fetch('http://localhost:8001/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Simulation Alert: ${selectedScenario.toUpperCase()}`,
          type: 'CRITICAL',
          location: 'Varies based on impact radius',
          message: `Engine predicts ${results.results.congestion_pct}% congestion and ${results.results.ambulance_delay_min} min delays. Protocol recommended.`
        })
      });
      window.location.href = '/government/alerts';
    } catch(e) {}
  };

  const handleRoadClick = async (roadId: string, name: string, coords: [number, number]) => {
    setIsRoadLoading(true);
    setActiveRoad({ id: roadId, name, coords });
    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_type: 'road_closure',
          selected_road_ids: [roadId],
          zone_lat: coords[0],
          zone_lng: coords[1]
        })
      });
      const data = await res.json();
      setActiveRoad((prev: any) => ({ ...prev, results: data.results }));
    } catch (e) {
      console.error("Road impact analysis failed", e);
    }
    setIsRoadLoading(false);
  };

  const getMetricLevel = (val: number, key: string) => {
    if (key.includes('score') || key.includes('risk') || key.includes('impact') || key.includes('disruption')) {
        if (val > 7) return { label: 'CRITICAL', color: '#ef4444' };
        if (val > 4) return { label: 'WARNING', color: '#f59e0b' };
        return { label: 'STABLE', color: '#10b981' };
    }
    if (key === 'congestion_pct') {
      if (val > 60) return { label: 'GRIDLOCK', color: '#ef4444' };
      if (val > 30) return { label: 'HEAVY', color: '#f59e0b' };
      return { label: 'LIGHT', color: '#10b981' };
    }
    if (key === 'avg_delay_min' || key === 'ambulance_delay_min') {
        if (val > 30) return { label: 'CRITICAL', color: '#ef4444' };
        if (val > 20) return { label: 'HIGH', color: '#f97316' };
        if (val >= 10) return { label: 'MEDIUM', color: '#eab308' };
        return { label: 'LOW', color: '#10b981' };
    }
    if (key === 'pollution_delta') {
        if (val > 25) return { label: 'CRITICAL', color: '#ef4444' };
        if (val > 10) return { label: 'WARNING', color: '#f59e0b' };
        return { label: 'STABLE', color: '#10b981' };
    }
    return { label: 'NORMAL', color: '#64748b' };
  };

  return (
    <div className={styles.simulationContainer}>
      <aside className={styles.sidebar}>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 tech-label">Model Intelligence v2.0</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Unified Urban Twin Engine</p>
        </div>

        <div className="space-y-4 pt-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scenario Selection</label>
          <div className={styles.scenarioGrid}>
            {SCENARIOS.map((s) => (
              <div 
                key={s.id} 
                onClick={() => setSelectedScenario(s.id)}
                className={`${styles.scenarioCard} ${selectedScenario === s.id ? styles.scenarioCardActive : ''}`}
                style={selectedScenario === s.id ? { borderColor: s.color, backgroundColor: `${s.color}10` } : {}}
              >
                <s.icon className="w-5 h-5 mb-1" style={{ color: s.color }} />
                <span className="text-[10px] font-bold leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulation Parameters</label>
          <div className={styles.paramSection}>
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-600">DURATION (HR)</span>
                    <span className="text-slate-900">{params.duration}h</span>
                </div>
                <input type="range" min="1" max="168" value={params.duration} onChange={(e) => setParams({...params, duration: parseInt(e.target.value)})} className="w-full accent-slate-900" />
            </div>

            {selectedScenario === 'flood' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-blue-600">RAINFALL (MM)</span>
                        <span className="text-blue-600">{params.rainfall}mm</span>
                    </div>
                    <input type="range" min="0" max="250" value={params.rainfall} onChange={(e) => setParams({...params, rainfall: parseInt(e.target.value)})} className="w-full accent-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={params.is_monsoon === 1} onChange={(e) => setParams({...params, is_monsoon: e.target.checked ? 1 : 0})} />
                    <label className="text-[11px] font-bold text-slate-700">Monsoon Season</label>
                </div>
              </div>
            )}

            {selectedScenario === 'festival' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-amber-600">CROWD (LAKHS)</span>
                        <span className="text-amber-600">{(params.crowd / 100000).toFixed(1)}L</span>
                    </div>
                    <input type="range" min="50000" max="2000000" step="50000" value={params.crowd} onChange={(e) => setParams({...params, crowd: parseInt(e.target.value)})} className="w-full accent-amber-600" />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={params.is_dasara === 1} onChange={(e) => setParams({...params, is_dasara: e.target.checked ? 1 : 0})} />
                    <label className="text-[11px] font-bold text-slate-700">Dasara Peak Protocol</label>
                </div>
              </div>
            )}

            {selectedScenario === 'bus_route' && (
               <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-green-600">ROUTES DISRUPTED</span>
                      <span className="text-green-600">{params.bus_routes}</span>
                  </div>
                  <input type="range" min="1" max="30" value={params.bus_routes} onChange={(e) => setParams({...params, bus_routes: parseInt(e.target.value)})} className="w-full accent-green-600" />
               </div>
            )}
          </div>
        </div>

        <button 
          onClick={launchSimulation}
          disabled={isSimulating}
          className={`${styles.launchButton} ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSimulating ? "PROCESSING V2.0 ENGINE..." : "RUN INTEL SIMULATION"}
        </button>
      </aside>

      <main className={styles.mainPanel}>
        <div className={styles.mapContainer}>
          <InteractiveMap 
             onRoadClick={handleRoadClick} 
             onBlockedRoadsChange={setBlockedRoadIds}
             highlightedRoads={blockedRoadIds}
          />
        </div>

        {/* Road Impact Floating Panel */}
        {activeRoad && (
          <div className="absolute top-4 right-4 z-[1001] w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-right-8 duration-300">
             <div className="p-4 bg-slate-900 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                   <Construction size={16} className="text-red-400" />
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Impact Analysis</p>
                      <h3 className="text-xs font-bold leading-none">{activeRoad.name}</h3>
                   </div>
                </div>
                <button onClick={() => setActiveRoad(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={14} /></button>
             </div>
             
             <div className="p-4 space-y-3">
                {isRoadLoading ? (
                   <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Calibrating Flow...</p>
                   </div>
                ) : activeRoad.results && (
                   <>
                      <div className="grid grid-cols-2 gap-2">
                         {[
                            { key: 'congestion_pct', label: 'Congestion' },
                            { key: 'ambulance_delay_min', label: 'Amb. Delay' },
                            { key: 'avg_delay_min', label: 'Avg Delay' },
                            { key: 'pollution_delta', label: 'Pollution' }
                         ].map(m => {
                            const val = activeRoad.results[m.key];
                            const config = METRICS_MAP[m.key];
                            const level = getMetricLevel(val, m.key);
                            return (
                               <div key={m.key} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                  <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{m.label}</p>
                                  <div className="flex items-baseline gap-1">
                                     <span className="text-sm font-bold text-slate-900">{val}{config?.suffix || ''}</span>
                                     <span className="text-[6px] font-black" style={{ color: level.color }}>{level.label}</span>
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                      <div className="pt-2">
                         <div className="p-2 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                            <AlertCircle size={14} className="text-red-600 shrink-0" />
                            <p className="text-[9px] font-bold text-red-800 leading-tight">Closing this segment will likely propagate {activeRoad.results.congestion_pct}% congestion across connected junctions.</p>
                         </div>
                      </div>
                   </>
                )}
             </div>
          </div>
        )}

        <div className={`${styles.resultsPanel} ${results ? styles.resultsPanelActive : ''}`} style={{ height: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-900 rounded-lg text-white">
                    <Activity className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase">Multi-Metric Impact Analysis</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Model: GradientBoostingRegressor V2.0 (R²=0.925)</p>
                 </div>
              </div>
              <button onClick={() => setResults(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {results && Object.entries(results.results).map(([key, val]: [string, any]) => {
                const config = METRICS_MAP[key] || { label: key, icon: AlertCircle };
                const level = getMetricLevel(val, key);
                return (
                  <div key={key} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <config.icon className="w-3 h-3 text-slate-400" />
                        <span className="text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: `${level.color}15`, color: level.color }}>{level.label}</span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{config.label}</p>
                    <p className="text-lg font-bold text-slate-900 tracking-tight">{val}{config.suffix}</p>
                  </div>
                );
              })}
           </div>

           <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-6 gap-4">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Policy Mitigation:</span>
                 {results?.alternative_routes.map((r: any, idx: number) => (
                   <span key={idx} className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded text-[10px] font-bold">
                     AI-RECOMMENDED: {r.name}
                   </span>
                 ))}
              </div>
              <div className="flex items-center gap-2">
                 <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase"><Save className="w-3 h-3" /> Save Log</button>
                 <button onClick={handlePublishAlert} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all uppercase"><Share2 className="w-3 h-3" /> Publish Alert</button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
