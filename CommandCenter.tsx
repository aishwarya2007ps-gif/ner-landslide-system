import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  FileText, 
  ShieldCheck, 
  CloudRain, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  Wifi, 
  Radio
} from 'lucide-react';
import { apiClient } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';

interface CommandCenterProps {
  onNavigate: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    activeAlerts: 2,
    criticalZones: 3,
    openIncidents: 4,
    sensorsOnline: 14,
    totalSensors: 15,
    lastSync: 'Just now'
  });

  const [weatherAdvisories, setWeatherAdvisories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live district weather
    apiClient.get('/weather/district?district=Kamrup%20Metropolitan')
      .then(res => {
        setWeatherAdvisories([
          res.data,
          { district: "East Khasi Hills", rainfall_24h_mm: 145.0, weather_condition: "Very Heavy Rain", imd_warning_level: "Orange", is_demo: true },
          { district: "East Sikkim", rainfall_24h_mm: 92.0, weather_condition: "Squally Cloudburst", imd_warning_level: "Orange", is_demo: true }
        ]);
      })
      .catch(() => {
        // Fallback
        setWeatherAdvisories([
          { district: "Kamrup Metro", rainfall_24h_mm: 68.5, weather_condition: "Moderate to Heavy Rain", imd_warning_level: "Yellow", is_demo: true },
          { district: "East Khasi Hills", rainfall_24h_mm: 145.0, weather_condition: "Very Heavy Rain", imd_warning_level: "Orange", is_demo: true }
        ]);
      });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Last Sync Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            North Eastern Region Operations Command Center
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-hazard telemetry, sensor heartbeats, and emergency task coordination
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            Sync Pulse: <strong className="text-slate-100 font-mono">{stats.lastSync}</strong>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Telemetry: <strong>Live Gateway</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{stats.activeAlerts}</div>
          <div className="text-[11px] text-slate-500 mt-1">2 Dispatched across NER</div>
        </div>

        {/* High Risk Polygons */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-orange-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">High Risk Zones</span>
            <Layers className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-orange-400">{stats.criticalZones}</div>
          <div className="text-[11px] text-slate-500 mt-1">Guwahati, Cherra, NH-10</div>
        </div>

        {/* Open Incidents */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-amber-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Open Incidents</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{stats.openIncidents}</div>
          <div className="text-[11px] text-slate-500 mt-1">1 Critical • 2 Verified</div>
        </div>

        {/* IoT Stations */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-teal-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">IoT Stations</span>
            <Wifi className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-400">{stats.sensorsOnline} / {stats.totalSensors}</div>
          <div className="text-[11px] text-emerald-400 mt-1">93.3% Stations Online</div>
        </div>
      </div>

      {/* Main Grid: Live Incidents & Weather Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Emergency Task Queue */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Active Incident Coordination Queue
            </h3>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Full Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-500">#SEED-INC-001</span>
                  <StatusBadge status="high" />
                  <StatusBadge status="in_progress" />
                </div>
                <h4 className="font-bold text-sm text-slate-200">Major Rockfall Blocking NH-27 Jorabat Inbound Lane</h4>
                <p className="text-xs text-slate-400">Assigned Team: <strong className="text-teal-300">NHAI & SDRF Quick Clearance Unit</strong></p>
              </div>
              <button
                onClick={() => onNavigate('gis')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
              >
                Locate on Map
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-500">#SEED-INC-003</span>
                  <StatusBadge status="critical" />
                  <StatusBadge status="under_review" />
                </div>
                <h4 className="font-bold text-sm text-slate-200">Active Subsidence near Gangtok Ward 4</h4>
                <p className="text-xs text-slate-400">District: <strong className="text-slate-200">East Sikkim (Deorali Ridge)</strong></p>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold rounded-lg"
              >
                Review Report
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Weather & Satellite Advisory Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-teal-400" />
              Regional Weather Ingestion
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              IMD & Satellite
            </span>
          </div>

          <div className="space-y-3">
            {weatherAdvisories.map((w, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-200">{w.district}</span>
                  <StatusBadge status={w.imd_warning_level || 'Yellow'} />
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>24h Precipitation:</span>
                  <strong className="text-teal-300 font-mono">{w.rainfall_24h_mm} mm</strong>
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  Condition: {w.weather_condition}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">🛰️ Sentinel InSAR Ground Motion:</div>
            <p>Recent pass shows -12.4 mm/year localized subsidence in unstable cut-sections along NH-10.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
