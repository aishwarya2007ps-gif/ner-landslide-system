import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { BarChart3, Download, Info } from 'lucide-react';

export const Analytics: React.FC = () => {
  // Sample realistic analytics for NER
  const hazardDistribution = [
    { name: 'Landslide', count: 38, color: '#ef4444' },
    { name: 'Flash Flood', count: 24, color: '#3b82f6' },
    { name: 'Road Blockage', count: 18, color: '#f59e0b' },
    { name: 'Bridge Scour', count: 11, color: '#8b5cf6' },
    { name: 'Slope Failure', count: 15, color: '#ec4899' },
  ];

  const rainTrend = [
    { day: 'Mon', rainfall: 25, incidents: 1 },
    { day: 'Tue', rainfall: 42, incidents: 2 },
    { day: 'Wed', rainfall: 88, incidents: 6 },
    { day: 'Thu', rainfall: 135, incidents: 12 },
    { day: 'Fri', rainfall: 95, incidents: 7 },
    { day: 'Sat', rainfall: 55, incidents: 3 },
    { day: 'Sun', rainfall: 30, incidents: 1 },
  ];

  const districtRisk = [
    { district: 'Dima Hasao', index: 88 },
    { district: 'East Sikkim', index: 84 },
    { district: 'Kamrup Metro', index: 78 },
    { district: 'East Khasi Hills', index: 74 },
    { district: 'Papum Pare', index: 62 },
    { district: 'Kohima', index: 58 },
    { district: 'Aizawl', index: 54 },
  ];

  const handleExportCSV = () => {
    const csvContent = 
      "Incident_ID,Hazard_Type,District,Severity,Status,Recorded_At\n" +
      "SEED-INC-001,landslide,Kamrup Metropolitan,high,in_progress,2026-09-21 14:20:00\n" +
      "SEED-INC-002,flash_flood,Kamrup Metropolitan,medium,verified,2026-09-21 13:45:00\n" +
      "SEED-INC-003,slope_failure,East Sikkim,critical,under_review,2026-09-21 12:10:00\n" +
      "NER-INC-104,road_blockage,Papum Pare,high,resolved,2026-09-20 18:30:00\n" +
      "NER-INC-105,river_level_rise,Morigaon,critical,verified,2026-09-20 16:15:00";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'NER_Disaster_Readiness_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Disaster Analytics & Hazard Correlation
          </h2>
          <p className="text-xs text-slate-400">
            Statistical correlation between antecedent rainfall, slope movement, and emergency dispatches
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold border border-slate-700 rounded-xl text-xs flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-teal-400 shrink-0" />
        <span>Sample prototype disaster statistics compiled from 8 North Eastern state nodal agencies.</span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall vs Incident Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-sm text-slate-200">
            Rainfall vs Incident Frequency Correlation
          </h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rainTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#14b8a6" />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#14b8a6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="incidents" name="Reported Incidents" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Risk Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-sm text-slate-200">
            District Vulnerability Composite Index (Top 7)
          </h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtRisk} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                <YAxis dataKey="district" type="category" width={110} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="index" name="Risk Index (0-100)" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
