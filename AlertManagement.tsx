import React, { useState, useEffect } from 'react';
import { BellRing, PlusCircle, Radio, Send, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { Alert } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const AlertManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [hazardType, setHazardType] = useState('landslide');
  const [severity, setSeverity] = useState<'warning' | 'high' | 'critical'>('critical');
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [title, setTitle] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [recommendedActions, setRecommendedActions] = useState('Evacuate low-lying riverside settlements\nAvoid night travel on hill slopes\nKeep emergency radio monitoring active');
  const [validHours, setValidHours] = useState(12);
  const [channels, setChannels] = useState<string[]>(['in_app', 'push', 'sms']);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      const res = await apiClient.get('/alerts');
      if (Array.isArray(res.data)) {
        setAlerts(res.data);
      }
    } catch (e) {
      console.warn("Could not load alerts from API", e);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const validToDate = new Date(Date.now() + validHours * 3600 * 1000).toISOString();
    const actionsList = recommendedActions.split('\n').filter(a => a.trim().length > 0);

    try {
      const payload = {
        hazard_type: hazardType,
        severity,
        title,
        warning_message: warningMessage,
        recommended_actions: actionsList,
        affected_district: district,
        valid_to: validToDate,
        channels
      };

      const res = await apiClient.post('/alerts', payload);
      setNotificationMsg(`Alert ${res.data.alert_code} issued and dispatched to ${channels.join(', ')}!`);
      setShowCreateModal(false);
      setTitle('');
      setWarningMessage('');
      loadAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not publish alert. Verify authority credentials.");
    }
  };

  const handleExpireAlert = async (alertId: string) => {
    try {
      await apiClient.patch(`/alerts/${alertId}/status?status=expired`);
      loadAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Permission denied.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-red-400" />
            Regional Alert Management & Early Warning Dispatch
          </h2>
          <p className="text-xs text-slate-400">
            Issue multi-channel advisories with geographic bounds across In-App, Push, and Mock SMS/Email
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue Regional Alert</span>
        </button>
      </div>

      {notificationMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-slate-900 border rounded-xl p-5 shadow-lg space-y-3 ${
              alert.severity === 'critical' ? 'border-red-900/80' : 'border-slate-800'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs text-slate-400 font-bold">{alert.alert_code}</span>
                  <StatusBadge status={alert.severity} />
                  <StatusBadge status={alert.status} />
                  <span className="text-[11px] text-teal-400 font-semibold">{alert.affected_district}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{alert.title}</h3>
              </div>

              {alert.status === 'published' && (
                <button
                  onClick={() => handleExpireAlert(alert.id)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Expire Alert
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{alert.warning_message}</p>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div>
                <strong>Channels Dispatched:</strong> {alert.channels?.join(', ') || 'in_app'}
              </div>
              <div>
                <strong>Valid until:</strong> {new Date(alert.valid_to).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Alert */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400" />
                Draft Regional Warning Alert
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Hazard Type</label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="landslide">Landslide / Rockfall</option>
                    <option value="flash_flood">Flash Flood</option>
                    <option value="heavy_rainfall">Heavy Rainfall Cloudburst</option>
                    <option value="slope_failure">Slope Subsidence</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Warning Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="critical">Critical (Red Warning)</option>
                    <option value="high">High (Orange Advisory)</option>
                    <option value="warning">Warning (Yellow Watch)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Affected District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Alert Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Immediate Slope Evacuation Warning for Jorabat Cut Slopes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Warning Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Official advisory text describing hazard, affected roads, and vulnerable settlements..."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Recommended Actions (1 per line)</label>
                <textarea
                  rows={3}
                  value={recommendedActions}
                  onChange={(e) => setRecommendedActions(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Validity Duration</label>
                  <select
                    value={validHours}
                    onChange={(e) => setValidHours(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value={6}>6 Hours</option>
                    <option value={12}>12 Hours</option>
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Dispatch Channels</label>
                  <div className="flex items-center gap-3 pt-2 text-slate-300">
                    <span className="font-semibold text-teal-400">In-App</span>
                    <span className="font-semibold text-teal-400">Web Push</span>
                    <span className="font-semibold text-teal-400">SMS Gateway</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
