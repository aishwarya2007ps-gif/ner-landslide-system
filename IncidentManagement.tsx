import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Users, MessageSquare, MapPin } from 'lucide-react';
import { apiClient } from '../api/client';
import { Incident } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [hazardFilter, setHazardFilter] = useState('all');

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [assignedTeam, setAssignedTeam] = useState('SDRF Team 1');
  const [verificationNotes, setVerificationNotes] = useState('');

  const loadIncidents = async () => {
    try {
      const res = await apiClient.get('/incidents', {
        params: {
          status: statusFilter,
          hazard_type: hazardFilter
        }
      });
      if (Array.isArray(res.data)) {
        setIncidents(res.data);
      }
    } catch (e) {
      console.warn("Could not load incidents", e);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, hazardFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.patch(`/incidents/${id}`, {
        status: newStatus,
        assigned_team: newStatus === 'assigned' || newStatus === 'verified' ? assignedTeam : undefined,
        verification_notes: verificationNotes || undefined
      });
      setSelectedIncident(null);
      loadIncidents();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Update failed. Check role permissions.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Incident Verification & Emergency Task Assignment
            </h2>
            <p className="text-xs text-slate-400">
              Authority workflow: Verify field reports, assign rescue battalions, and track resolution
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
            >
              <option value="all">All Hazards</option>
              <option value="landslide">Landslides</option>
              <option value="flash_flood">Flash Floods</option>
              <option value="slope_failure">Slope Subsidence</option>
              <option value="road_blockage">Road Blockages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3">Reference / Time</th>
                <th className="p-3">Hazard</th>
                <th className="p-3">Incident Title & District</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Team</th>
                <th className="p-3 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono text-[11px]">
                    <span className="text-teal-400 font-bold">{inc.client_id.substring(0, 14)}</span>
                    <div className="text-slate-500 text-[10px]">{new Date(inc.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 capitalize font-medium">
                      {inc.hazard_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="font-bold text-slate-100">{inc.title}</div>
                    <div className="text-slate-400 text-[11px]">{inc.district} • {inc.village || 'General Sector'}</div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={inc.severity} />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="p-3 text-slate-400">
                    {inc.assigned_team || <span className="italic text-slate-500">Unassigned</span>}
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-xs transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                Action on Incident #{selectedIncident.client_id.substring(0, 12)}
              </h3>
              <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <strong className="text-slate-300">Title: </strong>
                <span className="text-slate-100">{selectedIncident.title}</span>
              </div>
              <div>
                <strong className="text-slate-300">Description: </strong>
                <span className="text-slate-400">{selectedIncident.description}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-teal-300">
                Location: {selectedIncident.latitude}°N, {selectedIncident.longitude}°E
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Assign Emergency Response Team</label>
                <select
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="SDRF Quick Response Unit (Kamrup)">SDRF Quick Response Unit (Kamrup)</option>
                  <option value="NDRF 1st Battalion Patgaon">NDRF 1st Battalion Patgaon</option>
                  <option value="NHAI Highway Clearance Unit">NHAI Highway Clearance Unit</option>
                  <option value="Civil Defense Volunteer Brigade">Civil Defense Volunteer Brigade</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Authority Verification Notes</label>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g., Verified via local police report; excavator en route"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between gap-2">
              <button
                onClick={() => handleUpdateStatus(selectedIncident.id, 'rejected')}
                className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-bold"
              >
                Reject Report
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedIncident.id, 'verified')}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Verify Incident
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedIncident.id, 'in_progress')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                >
                  Dispatch Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
