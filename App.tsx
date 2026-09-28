import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useOfflineSync } from './hooks/useOfflineSync';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Home } from './pages/Home';
import { CommandCenter } from './pages/CommandCenter';
import { GISRiskMap } from './pages/GISRiskMap';
import { RiskEngineStudio } from './pages/RiskEngineStudio';
import { IncidentReport } from './pages/IncidentReport';
import { OfflineSyncCenter } from './pages/OfflineSyncCenter';
import { AlertManagement } from './pages/AlertManagement';
import { IncidentManagement } from './pages/IncidentManagement';
import { Analytics } from './pages/Analytics';
import { Administration } from './pages/Administration';
import { Login } from './pages/Login';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const { user, login, logout, switchRoleQuickly } = useAuth();
  const { 
    isOnline, 
    isSimulatedOffline, 
    toggleSimulatedOffline, 
    pendingCount, 
    isSyncing, 
    lastSyncTime, 
    synchronizeNow,
    refreshPendingCount 
  } = useOfflineSync();

  const handleDraftAlert = (district: string, hazard: string, severity: 'warning' | 'high' | 'critical', score: number) => {
    setCurrentTab('alerts');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onRoleChange={switchRoleQuickly}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={toggleSimulatedOffline}
        pendingCount={pendingCount}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          userRole={user?.role || 'citizen'}
          pendingSyncCount={pendingCount}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950">
          {currentTab === 'home' && <Home onNavigate={setCurrentTab} />}
          {currentTab === 'dashboard' && <CommandCenter onNavigate={setCurrentTab} />}
          {currentTab === 'gis' && <GISRiskMap />}
          {currentTab === 'risk' && <RiskEngineStudio onDraftAlert={handleDraftAlert} />}
          {currentTab === 'report' && (
            <IncidentReport isOnline={isOnline} onReportSaved={refreshPendingCount} />
          )}
          {currentTab === 'sync' && (
            <OfflineSyncCenter
              isOnline={isOnline}
              isSyncing={isSyncing}
              onSyncNow={synchronizeNow}
              lastSyncTime={lastSyncTime}
            />
          )}
          {currentTab === 'alerts' && <AlertManagement />}
          {currentTab === 'incidents' && <IncidentManagement />}
          {currentTab === 'analytics' && <Analytics />}
          {currentTab === 'admin' && <Administration />}
          {currentTab === 'login' && (
            <Login
              onLoginSuccess={(u, tok) => {
                login(u, tok);
                setCurrentTab('dashboard');
              }}
              onQuickRoleSwitch={(r) => {
                switchRoleQuickly(r);
                setCurrentTab('dashboard');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
