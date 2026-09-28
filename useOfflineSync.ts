import { useState, useEffect, useCallback } from 'react';
import { db, OfflineIncident } from '../db/dexieDb';
import { apiClient } from '../api/client';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await db.incidents.where('syncStatus').equals('pending').count();
      setPendingCount(count);
    } catch (e) {
      console.warn("IndexedDB count read error", e);
    }
  }, []);

  const synchronizeNow = useCallback(async () => {
    if (!effectiveOnline || isSyncing) return;
    setIsSyncing(true);

    try {
      const pending = await db.incidents.where('syncStatus').equals('pending').toArray();
      if (pending.length === 0) {
        setIsSyncing(false);
        return;
      }

      const payload = {
        reports: pending.map((item) => ({
          client_id: item.clientId,
          hazard_type: item.hazardType,
          title: item.title,
          description: item.description,
          severity: item.severity,
          latitude: item.latitude,
          longitude: item.longitude,
          district: item.district,
          village: item.village,
          affected_people: item.affectedPeople,
          road_status: item.roadStatus,
          attachments: item.attachments,
        }))
      };

      const res = await apiClient.post('/sync/batch', payload);
      if (res.data?.synced_ids || res.data?.duplicate_ids) {
        const markSynced = [...(res.data.synced_ids || []), ...(res.data.duplicate_ids || [])];
        for (const cid of markSynced) {
          await db.incidents.update(cid, { syncStatus: 'synced' });
        }
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Offline batch sync error:', err);
    } finally {
      setIsSyncing(false);
      refreshPendingCount();
    }
  }, [effectiveOnline, isSyncing, refreshPendingCount]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      if (!next && isOnline) {
        // Just came back online
        setTimeout(() => synchronizeNow(), 300);
      }
      return next;
    });
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isSimulatedOffline) {
        synchronizeNow();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    refreshPendingCount();

    const interval = setInterval(refreshPendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isSimulatedOffline, refreshPendingCount, synchronizeNow]);

  return {
    isOnline: effectiveOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    synchronizeNow,
    refreshPendingCount,
  };
};
