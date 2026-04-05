"use client";

import React, { useState, useEffect } from 'react';
import styles from './Emergency.module.css';
import { 
  Trash2, HeartPulse, Activity, 
  Map as MapIcon, Siren, AlertTriangle, 
  Droplets, Wind, Play, X, Save, Share2, Download
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), { ssr: false });
const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMapComponent'), { ssr: false });
import Autocomplete from '@/components/shared/Autocomplete';

interface Hospital {
  id: string;
  name: string | null;
  lat: number;
  lng: number;
  level: string;
}

interface GarbageZone {
  name: string;
  display: string;
  ward_ids: number[];
  ward_summary: string;
}

const EMERGENCY_MODULES = [
  { id: 'garbage', icon: Trash2, label: 'Civic: Garbage Strike', desc: 'Waste Impact & Health Risk', color: '#f59e0b' },
  { id: 'ambulance', icon: Siren, label: 'Emergency: Ambulance', desc: 'Critical Corridor Simulation', color: '#ef4444' }
];

export default function EmergencyOpsPage() {
  const [selectedModule, setSelectedModule] = useState('garbage');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [blockedRoadIds, setBlockedRoadIds] = useState<string[]>([]);
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [garbageZones, setGarbageZones] = useState<GarbageZone[]>([]);

  const [params, setParams] = useState({
    garbage_zone: '',
    days_missed: 7,
    is_monsoon: 1,
    hospital_id: '',
    blocked_roads: 3
  });

  useEffect(() => {
    // Fetch Hospitals
    fetch('http://localhost:8001/api/v1/hospitals')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: Hospital, b: Hospital) => {
          const nameA = a.name || `Unnamed Facility #${a.id}`;
          const nameB = b.name || `Unnamed Facility #${b.id}`;
          return nameA.localeCompare(nameB);
        });
        setHospitals(sorted);
        if (sorted.length > 0) {
          setParams(p => ({ ...p, hospital_id: sorted[0].id }));
        }
      });

    // Fetch Garbage Zones
    fetch('http://localhost:8001/api/v1/garbage/zones')
      .then(res => res.json())
      .then(data => {
        setGarbageZones(data);
        if (data.length > 0) {
          setParams(p => ({ ...p, garbage_zone: data[0].name }));
        }
      });
  }, []);

  const launchSimulation = async () => {
    setIsSimulating(true);
    setResults(null);
    
    let lat = 12.3134;
    let lng = 76.6499;

    if (selectedModule === 'ambulance') {
        const hospital = hospitals.find(h => h.id === params.hospital_id);
        if (hospital) {
            lat = hospital.lat;
            lng = hospital.lng;
        }
    }

    // The more roads we block, the fewer alternate routes available
    const activeRoadCount = blockedRoadIds.length > 0 ? blockedRoadIds.length : params.blocked_roads;
    const distance_km = 2.0 + (activeRoadCount * 0.8); // Deterministic delay modifier
    const alternate_routes = Math.max(0, 4 - activeRoadCount);

    // Simulate V2 ML Predictor for Emergency Scenarios
    try {
      const res = await fetch('http://localhost:8001/api/v1/simulation/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_type: selectedModule,
          garbage_zones_missed: selectedModule === 'garbage' ? 1 : 0,
          days_collection_missed: params.days_missed,
          is_monsoon: params.is_monsoon,
          roads_affected: activeRoadCount,
          selected_road_ids: blockedRoadIds,
          alternate_routes_available: alternate_routes,
          hospital_distance_km: distance_km,
          time_of_day: 14,
          zone_lat: lat,
          zone_lng: lng
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error("Emergency simulation failed", e);
      setResults({
        results: {
          public_health_risk: selectedModule === 'garbage' ? 8.2 : 4.5,
          waste_impact_score: selectedModule === 'garbage' ? 9.1 : 0.5,
          pollution_delta: selectedModule === 'garbage' ? 22.4 : 5.2,
          ambulance_delay_min: selectedModule === 'ambulance' ? 12.8 : 1.2,
          congestion_pct: selectedModule === 'ambulance' ? 44.5 : 5.8
        },
        alternative_routes: [{ name: 'Emergency Corridor #1', via: 'Irwin Rd', delay_reduction_pct: 75 }]
      });
    }
    setIsSimulating(false);
  };

  const handleBlockedRoadsChange = async (roadIds: string[]) => {
     setBlockedRoadIds(roadIds);
     if (roadIds.length > 0) {
       let lat = 12.3134; let lng = 76.6499;
       if (selectedModule === 'ambulance') {
           const hospital = hospitals.find(h => h.id === params.hospital_id);
           if (hospital) { lat = hospital.lat; lng = hospital.lng; }
       }
       const activeRoadCount = roadIds.length;
       const distance_km = 2.0 + (activeRoadCount * 0.8);
       const alternate_routes = Math.max(0, 4 - activeRoadCount);

       try {
          const res = await fetch('http://localhost:8001/api/v1/simulation/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scenario_type: selectedModule,
              garbage_zones_missed: selectedModule === 'garbage' ? 1 : 0,
              days_collection_missed: params.days_missed,
              is_monsoon: params.is_monsoon,
              roads_affected: activeRoadCount,
              selected_road_ids: roadIds,
              alternate_routes_available: alternate_routes,
              hospital_distance_km: distance_km,
              time_of_day: 14,
              zone_lat: lat,
              zone_lng: lng
            })
          });
          const data = await res.json();
          setResults(data);
       } catch(e) {}
     }
  };

  const handlePublishAlert = async () => {
    if (!results) return;
    try {
      await fetch('http://localhost:8001/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Emergency Op: ${selectedModule.toUpperCase()}`,
          type: 'CRITICAL',
          location: 'Varies based on payload',
          message: selectedModule === 'ambulance' 
            ? `Predicting ${results.results.ambulance_delay_min} min delays. Route JLB Road recommended.`
            : `Waste Impact Score: ${results.results.waste_impact_score}/10. Health risk elevated.`
        })
      });
      window.location.href = '/government/alerts';
    } catch(e) {}
  };

  return (
    <div className={styles.emergencyContainer}>
      <aside className={styles.sidebar}>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 tech-label">Emergency Operations</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">High-Stakes Spatial Intelligence</p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Focus</label>
          <div className="flex flex-col gap-3">
            {EMERGENCY_MODULES.map((m) => (
              <div 
                key={m.id} 
                onClick={() => setSelectedModule(m.id)}
                className={`${styles.card} ${selectedModule === m.id ? styles.cardActive : ''}`}
                style={selectedModule === m.id ? { borderColor: m.color, backgroundColor: `${m.color}10` } : {}}
              >
                <m.icon className="w-6 h-6" style={{ color: m.color }} />
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-none">{m.label}</p>
                  <p className="text-[9px] text-slate-500 mt-1">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Environment Params</label>
          <div className={styles.paramSection}>
            {selectedModule === 'garbage' && (
              <>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Target Zone</p>
                  <Autocomplete 
                    items={garbageZones.map(z => ({ id: z.name, label: z.display }))}
                    placeholder="Search Zone..."
                    onSelect={(id) => setParams({ ...params, garbage_zone: id })}
                    defaultValue={params.garbage_zone}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-slate-500 uppercase">Service Disruption</span>
                    <span className="text-amber-600 font-black">{params.days_missed} DAYS</span>
                  </div>
                  <input type="range" min="1" max="14" value={params.days_missed} onChange={(e) => setParams({...params, days_missed: parseInt(e.target.value)})} className="w-full accent-amber-600" />
                </div>
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-100">
                  <input type="checkbox" checked={params.is_monsoon === 1} onChange={(e) => setParams({...params, is_monsoon: e.target.checked ? 1 : 0})} />
                  <label className="text-[10px] font-bold text-amber-900 uppercase">Monsoon Alert Level High</label>
                </div>
              </>
            )}

            {selectedModule === 'ambulance' && (
              <>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Target Hospital</p>
                  <Autocomplete 
                    items={hospitals.map(h => ({ 
                        id: h.id, 
                        label: h.name || `Facility #${h.id}`, 
                        sublabel: h.level 
                    }))}
                    placeholder="Search Hospital..."
                    onSelect={(id) => setParams({ ...params, hospital_id: id })}
                    defaultValue={params.hospital_id}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-slate-500 uppercase">Road Blockages Nearby</span>
                    <span className="text-red-600 font-black">{params.blocked_roads} SEGMENTS</span>
                  </div>
                  <input type="range" min="1" max="10" value={params.blocked_roads} onChange={(e) => setParams({...params, blocked_roads: parseInt(e.target.value)})} className="w-full accent-red-600" />
                </div>
                <p className="p-2 bg-red-50 text-[9px] text-red-800 rounded border border-red-100 italic">
                  Note: Pre-computing alternate corridors via JLB Road and Sayyaji Rao Rd.
                </p>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={launchSimulation}
          disabled={isSimulating}
          className={styles.launchButton}
          style={selectedModule === 'garbage' ? { backgroundColor: '#f59e0b', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)' } : {}}
        >
          {isSimulating ? "COMPUTING IMPACT..." : `SIMULATE ${selectedModule.toUpperCase()}`}
        </button>
      </aside>

      <main className={styles.mainPanel}>
        <div className={styles.mapContainer}>
          <InteractiveMap 
             onBlockedRoadsChange={handleBlockedRoadsChange}
             highlightedRoads={blockedRoadIds}
          />
        </div>

        {/* Floating Metrics */}
        <div className={`${styles.resultsPanel} ${results ? styles.resultsPanelActive : ''}`}>
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-600 rounded-lg text-white animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase">Operational Insight Engine</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedModule === 'garbage' ? 'Solid Waste & Public Health Model' : 'Emergency Logistics Response Model'}</p>
                 </div>
              </div>
              <button onClick={() => setResults(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
           </div>

           {selectedModule === 'garbage' ? (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Trash2 className="w-4 h-4 text-orange-600 mb-2" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Waste Impact</p>
                  <p className="text-2xl font-black text-orange-600">{results?.results.waste_impact_score}/10</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <HeartPulse className="w-4 h-4 text-red-600 mb-2" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Health Risk</p>
                  <p className="text-2xl font-black text-red-600">{results?.results.public_health_risk}/10</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-50">
                   <Activity className="w-4 h-4 text-slate-400 mb-2" />
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Traffic Congestion</p>
                   <p className="text-xl font-bold text-slate-400">{results?.results.congestion_pct}%</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                   <Wind className="w-4 h-4 text-yellow-600 mb-2" />
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Pollution Index Δ</p>
                   <p className="text-2xl font-black text-yellow-700">+{results?.results.pollution_delta}</p>
                </div>
              </div>
           ) : (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-xl border text-white shadow-xl ${results?.results.ambulance_delay_min > 15 ? 'bg-red-600 border-red-700' : results?.results.ambulance_delay_min > 10 ? 'bg-orange-500 border-orange-600' : 'bg-emerald-500 border-emerald-600'}`}>
                  <Siren className="w-4 h-4 text-white mb-2" />
                  <p className="text-[9px] font-bold text-white/80 uppercase">Ambulance Delay & Risk</p>
                  <p className="text-2xl font-black">{results?.results.ambulance_delay_min.toFixed(1)} MINS</p>
                  <div className="mt-2 text-[10px] font-bold uppercase py-1 px-2 rounded-full bg-black/20 inline-block">
                    {results?.results.ambulance_delay_min > 15 ? 'CRITICAL RISK' : results?.results.ambulance_delay_min > 10 ? 'HIGH RISK' : 'NORMAL / ACCEPTABLE'}
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Activity className="w-4 h-4 text-orange-600 mb-2" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase">City Gridlock</p>
                  <p className="text-2xl font-black text-orange-700">{results?.results.congestion_pct}%</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                   <HeartPulse className="w-4 h-4 text-red-600 mb-2" />
                   <p className="text-[9px] font-bold text-slate-400 uppercase">Secondary Health Deck</p>
                   <p className="text-xl font-bold text-red-700">{results?.results.public_health_risk}/10</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col justify-center">
                    <p className="text-[8px] font-black text-blue-800 uppercase text-center mb-1">Optimum Alternate Route</p>
                    <p className="text-[10px] font-bold text-blue-900 text-center leading-tight">JLB Road → Vishwamanava Double Road</p>
                    <p className="text-[7px] text-blue-500 font-bold text-center mt-1 uppercase">Estimated Time: 14 mins</p>
                </div>
              </div>
           )}

           <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                 <button onClick={handlePublishAlert} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-black hover:bg-red-700 transition-all uppercase tracking-widest"><AlertTriangle className="w-4 h-4" /> Issue Emergency Alert</button>
                 <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase"><Download className="w-4 h-4" /> Incident Report</button>
              </div>
              <p className="text-[9px] text-slate-400 italic">Predictor v2.0 calibrated with Mysuru OSM Hospitals (105) and MCC Garbage Zones (8)</p>
           </div>
        </div>
      </main>
    </div>
  );
}
