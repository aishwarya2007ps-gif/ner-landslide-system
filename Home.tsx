import React from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, MapPin, Compass, FileCheck2, Info } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Banner Notice */}
      <div className="bg-amber-950/40 border border-amber-800/80 p-3.5 rounded-xl flex items-start gap-3 text-xs text-amber-200">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-amber-300">Decision-Support Prototype Notice:</strong>{' '}
          This platform utilizes AI-based multi-hazard heuristic scoring and simulated sensor feeds for demonstrative disaster response planning across the 8 North Eastern States of India. For official life-safety warnings, refer to state disaster management authorities (ASDMA, SDMA Sikkim, etc.) and the India Meteorological Department (IMD).
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/50 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-bold">
            <span>● 8 NER States Integrated</span>
            <span className="text-slate-500">•</span>
            <span>Landslide & Multi-Hazard Watch</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            AI-Based Early Warning & Landslide Risk Monitoring in NER
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            A unified, multi-hazard preparedness platform empowering disaster authorities, emergency relief battalions, field scouts, and citizens to monitor high-risk hill corridors, forecast slope instability, report live blockages offline, and coordinate life-saving interventions.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('gis')}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              <MapPin className="w-4 h-4" />
              Open GIS Risk Explorer
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold border border-slate-700 rounded-xl text-xs flex items-center gap-2 transition"
            >
              <FileCheck2 className="w-4 h-4" />
              Report Field Incident (Offline Ready)
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold border border-slate-700 rounded-xl text-xs flex items-center gap-2 transition"
            >
              <Compass className="w-4 h-4" />
              Command Center
            </button>
          </div>
        </div>
      </div>

      {/* Active Alerts Ticker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            Current Regional Emergency Advisories
          </div>
          <button onClick={() => onNavigate('alerts')} className="text-xs text-teal-400 hover:underline">
            View All Alerts &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-950 border-l-4 border-red-500 border-y border-r border-slate-800/80">
            <div className="flex justify-between items-start text-xs mb-1">
              <span className="font-bold text-red-400">CRITICAL WARNING • SIKKIM</span>
              <span className="text-slate-500">Valid next 18h</span>
            </div>
            <h4 className="font-bold text-sm text-slate-100 mb-1">Severe Slope Debris Warning on NH-10 Teesta Corridor</h4>
            <p className="text-xs text-slate-400">Heavy antecedent rainfall has saturated cutting slopes between Melli and Rangpo. Traffic restricted to emergency convoys only.</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border-l-4 border-orange-500 border-y border-r border-slate-800/80">
            <div className="flex justify-between items-start text-xs mb-1">
              <span className="font-bold text-orange-400">ORANGE ADVISORY • ASSAM</span>
              <span className="text-slate-500">Valid next 24h</span>
            </div>
            <h4 className="font-bold text-sm text-slate-100 mb-1">Brahmaputra Tributary Kopili Stage Rise Warning</h4>
            <p className="text-xs text-slate-400">River Kopili water level has crossed warning stage by 0.6m. Lowland inundation advisory for Morigaon and Kamrup rural plains.</p>
          </div>
        </div>
      </div>

      {/* Safety Guidance & Emergency Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Safety Guidelines */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-teal-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-teal-400" />
            Monsoon & Landslide Safety Protocol
          </h3>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-0.5">✓ Recommended Actions (Do's)</strong>
              <p className="text-slate-400">Stay tuned to DDMA emergency sirens; watch for sudden changes in water clarity; immediately evacuate downhill structures if slope cracks appear.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <strong className="text-red-400 block mb-0.5">✗ Critical Hazards to Avoid (Don'ts)</strong>
              <p className="text-slate-400">Do not travel through steep mountain corridors during torrential downpours; never park vehicles directly beneath steep vertical road cuts.</p>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Across NER */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-teal-400 mb-3 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-teal-400" />
            24x7 State Emergency Operation Centers (SEOC)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-slate-200 block">Assam (ASDMA)</span>
              <a href="tel:1070" className="text-teal-400 font-mono font-bold">1070 / 1079</a>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-slate-200 block">Meghalaya SEOC</span>
              <a href="tel:1070" className="text-teal-400 font-mono font-bold">1070 / 0364-2502098</a>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-slate-200 block">Sikkim SDMA</span>
              <a href="tel:1070" className="text-teal-400 font-mono font-bold">1070 / 03592-201075</a>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-slate-200 block">Arunachal SEOC</span>
              <a href="tel:1070" className="text-teal-400 font-mono font-bold">1070 / 0360-2212000</a>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-slate-200 block">National NDRF</span>
              <a href="tel:112" className="text-teal-400 font-mono font-bold">112 / 011-24363260</a>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-slate-200 block">Ambulance Lifeline</span>
              <a href="tel:108" className="text-teal-400 font-mono font-bold">108 (Pan-India)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
