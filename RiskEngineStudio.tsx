import React, { useState } from 'react';
import { BrainCircuit, Info, Send, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';

interface RiskEngineStudioProps {
  onDraftAlert: (district: string, hazard: string, severity: 'warning' | 'high' | 'critical', score: number) => void;
}

export const RiskEngineStudio: React.FC<RiskEngineStudioProps> = ({ onDraftAlert }) => {
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [rain24h, setRain24h] = useState(85.0);
  const [rain72h, setRain72h] = useState(160.0);
  const [slope, setSlope] = useState(38.0);
  const [soilMoisture, setSoilMoisture] = useState(78.0);
  const [riverLevel, setRiverLevel] = useState(82.0);

  // Himalayan Risk Model Weights & Normalization
  const n_rain24 = Math.min(1.0, rain24h / 120.0) * 30.0;
  const n_rain72 = Math.min(1.0, rain72h / 250.0) * 20.0;
  const n_slope = Math.min(1.0, Math.max(0.0, (slope - 15.0) / 35.0)) * 15.0;
  const n_moisture = Math.min(1.0, soilMoisture / 100.0) * 15.0;
  const n_river = Math.min(1.0, riverLevel / 100.0) * 10.0;
  const n_hist = 10.0; // Baseline terrain susceptibility

  const calculatedScore = Math.min(100.0, Math.max(0.0, n_rain24 + n_rain72 + n_slope + n_moisture + n_river + n_hist));
  const roundedScore = Number(calculatedScore.toFixed(1));

  let category: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  let categoryColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
  let recommendedAction = 'Routine automated surveillance active; no emergency restrictions required.';

  if (roundedScore >= 75) {
    category = 'Critical';
    categoryColor = 'text-red-400 bg-red-950/80 border-red-800';
    recommendedAction = 'Immediate evacuation alert recommended; activate SDRF/NDRF staging and road closures.';
  } else if (roundedScore >= 50) {
    category = 'High';
    categoryColor = 'text-orange-400 bg-orange-950/80 border-orange-800';
    recommendedAction = 'Issue orange warning; restrict vehicular traffic on vulnerable mountain passes and clear drains.';
  } else if (roundedScore >= 25) {
    category = 'Moderate';
    categoryColor = 'text-amber-400 bg-amber-950/80 border-amber-800';
    recommendedAction = 'Continuous sensor and river gauge watch; notify village disaster management committees.';
  }

  // Top 3 contributing factors
  const factors = [
    { name: '24-Hour Rainfall Intensity', pts: n_rain24 },
    { name: '72-Hour Antecedent Saturation', pts: n_rain72 },
    { name: 'Terrain Slope Steepness', pts: n_slope },
    { name: 'Volumetric Soil Moisture', pts: n_moisture },
    { name: 'River Water Gauge Stage', pts: n_river },
    { name: 'Historical Hazard Susceptibility', pts: n_hist }
  ].sort((a, b) => b.pts - a.pts).slice(0, 3);

  const handleCreateDraft = () => {
    const sev = roundedScore >= 75 ? 'critical' : roundedScore >= 50 ? 'high' : 'warning';
    onDraftAlert(district, 'landslide', sev, roundedScore);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-400" />
              AI Multi-Hazard Risk Scoring Studio
            </h2>
            <p className="text-xs text-slate-400">
              Explainable, transparent logistic heuristic model calibrated for Himalayan geological strata
            </p>
          </div>
          <div className="text-[11px] bg-amber-950/80 text-amber-300 border border-amber-800 px-3 py-1 rounded-full font-bold">
            ⚠ Prototype Decision-Support Engine
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Model inputs: Normalized weights for rainfall trigger (50%), slope geometry (15%), soil pore-pressure (15%), and river stage (10%).
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
            Target District & Environmental Parameters
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            >
              <option value="Kamrup Metropolitan">Kamrup Metropolitan (Assam)</option>
              <option value="East Khasi Hills">East Khasi Hills (Meghalaya)</option>
              <option value="East Sikkim">East Sikkim (Sikkim)</option>
              <option value="Dima Hasao">Dima Hasao (Assam)</option>
              <option value="Papum Pare">Papum Pare (Arunachal)</option>
              <option value="Kohima">Kohima (Nagaland)</option>
              <option value="Aizawl">Aizawl (Mizoram)</option>
            </select>
          </div>

          <div className="space-y-4 text-xs">
            {/* 24h Rain */}
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>24-Hour Precipitation Intensity (mm)</span>
                <span className="font-bold text-teal-400 font-mono">{rain24h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={rain24h}
                onChange={(e) => setRain24h(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>

            {/* 72h Rain */}
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>72-Hour Cumulative Antecedent Rainfall (mm)</span>
                <span className="font-bold text-teal-400 font-mono">{rain72h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="5"
                value={rain72h}
                onChange={(e) => setRain72h(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>

            {/* Slope Angle */}
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>Terrain Slope Inclination Angle (Degrees)</span>
                <span className="font-bold text-teal-400 font-mono">{slope}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="65"
                step="1"
                value={slope}
                onChange={(e) => setSlope(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>

            {/* Soil Moisture */}
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>Volumetric Soil Moisture Saturation (%)</span>
                <span className="font-bold text-teal-400 font-mono">{soilMoisture}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>

            {/* River Gauge Level */}
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>River Stage Relative to Danger Mark (%)</span>
                <span className="font-bold text-teal-400 font-mono">{riverLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="130"
                step="1"
                value={riverLevel}
                onChange={(e) => setRiverLevel(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Scoring Result Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Estimated Hazard Score
            </span>
            <div className={`text-6xl font-black font-mono ${roundedScore >= 75 ? 'text-red-500' : roundedScore >= 50 ? 'text-orange-500' : roundedScore >= 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {roundedScore}
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border ${categoryColor}`}>
              {category} Risk
            </div>
          </div>

          {/* Explainability Breakdown */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <strong className="text-slate-200 block border-b border-slate-800 pb-1">
              Top 3 Model Drivers:
            </strong>
            {factors.map((f, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-400">
                <span>{f.name}:</span>
                <span className="font-mono font-bold text-slate-200">+{f.pts.toFixed(1)} pts</span>
              </div>
            ))}
          </div>

          {/* Recommended Action */}
          <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-teal-400 block">Recommended Action:</span>
            <p className="text-slate-400 italic">"{recommendedAction}"</p>
          </div>

          {/* Draft Alert Action */}
          <button
            onClick={handleCreateDraft}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Draft Alert from this Prediction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
