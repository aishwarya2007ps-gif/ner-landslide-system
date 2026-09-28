import React, { useState, useEffect } from 'react';
import { db, OfflineIncident } from '../db/dexieDb';
import { StatusBadge } from '../components/StatusBadge';
import { RefreshCw, CheckCircle2, Clock, Trash2, Wifi, WifiOff } from 'lucide-react';

interface OfflineSyncCenterProps {
  isOnline: boolean;
  isSyncing: boolean;
  onSyncNow: () => void;
  lastSyncTime: Date | null;
}

export const OfflineSyncCenter: React.FC<OfflineSyncCenterProps> = ({
  isOnline,
  isSyncing,
  onSyncNow,
  lastSyncTime,
}) => {
  const [reports, setReports] = useState<OfflineIncident[]>([]);

  const loadReports = async () => {
    try {
      const all = await db.incidents.orderBy('createdAt').reverse().toArray();
      setReports(all);
    } catch (e) {
      console.warn("Could not load offline reports", e);
    }
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 3000);
    return () => clearInterval(interval);
  }, []);

  const clearSyncedReports = async () => {
    await db.incidents.where('syncStatus').equals('synced').delete();
    loadReports();
  };

  const pendingList = reports.filter(r => r.syncStatus === 'pending');
  const syncedList = reports.filter(r => r.syncStatus === 'synced');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className={`w-5 h-5 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
              Offline Synchronization Center
            </h2>
            <p className="text-xs text-slate-400">
              Guaranteed IndexedDB ledger • Syncs automatically upon network reconnection
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSyncNow}
              disabled={isSyncing || !isOnline || pendingList.length === 0}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : `Synchronize Now (${pendingList.length})`}</span>
            </button>

            {syncedList.length > 0 && (
              <button
                onClick={clearSyncedReports}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition"
                title="Clear synced records from browser storage"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Prune Synced</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Connection State:</span>
            <span className={`font-bold flex items-center gap-1.5 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? 'Connected' : 'Offline Mode'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Queued for Sync:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{pendingList.length} Reports</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Last Successful Sync:</span>
            <span className="font-mono text-slate-200">
              {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Awaiting sync'}
            </span>
          </div>
        </div>
      </div>

      {/* Reports Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-sm text-slate-200 mb-4">
          Local Storage Incident Ledger ({reports.length} Total)
        </h3>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No incident reports recorded in local browser storage yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((item) => (
              <div
                key={item.clientId}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[11px]">{item.clientId.substring(0, 18)}...</span>
                    <StatusBadge status={item.severity} />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      item.syncStatus === 'synced'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {item.syncStatus === 'synced' ? '✓ Synced' : '⏳ Pending Sync'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">{item.title}</h4>
                  <p className="text-slate-400">{item.district} • {item.village || 'No landmark specified'}</p>
                </div>

                <div className="text-right text-[11px] text-slate-500">
                  <div>{new Date(item.createdAt).toLocaleTimeString()}</div>
                  <div className="text-slate-400 font-mono">
                    {item.latitude.toFixed(4)}°N, {item.longitude.toFixed(4)}°E
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
