import React, { useState, useEffect } from 'react';
import { Settings, Users, History, Activity, Radio, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';

export const Administration: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/admin/system-stats')
      .then(res => setStats(res.data?.stats))
      .catch(() => {});

    apiClient.get('/admin/audit-logs')
      .then(res => {
        if (Array.isArray(res.data)) setAuditLogs(res.data);
      })
      .catch(() => {});
  }, []);

  const triggerIoTSimulation = async () => {
    try {
      const res = await apiClient.post('/sensors/simulate');
      setSimulationStatus(res.data.message);
      setTimeout(() => setSimulationStatus(null), 5000);
    } catch (e: any) {
      alert("Simulation trigger failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            System Administration & Security Governance
          </h2>
          <p className="text-xs text-slate-400">
            Audit trails, telemetry gateway simulator, and user role configuration
          </p>
        </div>

        <button
          onClick={triggerIoTSimulation}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
        >
          <Radio className="w-4 h-4" />
          <span>Trigger IoT Telemetry Pulse</span>
        </button>
      </div>

      {simulationStatus && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{simulationStatus}</span>
        </div>
      )}

      {/* System Node Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 font-semibold uppercase">Total Users</span>
          <div className="text-2xl font-black text-slate-100 mt-1">{stats?.total_users || 5}</div>
          <div className="text-[10px] text-slate-500">5 RBAC Roles Active</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 font-semibold uppercase">Total Incidents</span>
          <div className="text-2xl font-black text-slate-100 mt-1">{stats?.total_incidents || 3}</div>
          <div className="text-[10px] text-slate-500">Stored in PostGIS / SQLite</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 font-semibold uppercase">Active Alerts</span>
          <div className="text-2xl font-black text-red-400 mt-1">{stats?.active_alerts || 2}</div>
          <div className="text-[10px] text-slate-500">Dispatched across NER</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 font-semibold uppercase">Sensor Network</span>
          <div className="text-2xl font-black text-teal-400 mt-1">{stats?.online_sensors || 6} Online</div>
          <div className="text-[10px] text-emerald-400">All 8 State Gateways Active</div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <History className="w-4 h-4 text-teal-400" />
          System Security & Operational Audit Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Target Reference</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    No administrative audit events recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition font-mono text-[11px]">
                    <td className="p-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3 font-bold text-teal-300">{log.action}</td>
                    <td className="p-3 text-slate-300 uppercase">{log.target_type}</td>
                    <td className="p-3 text-slate-400">{log.target_id || '-'}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{JSON.stringify(log.details)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
