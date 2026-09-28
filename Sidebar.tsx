import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Map, 
  BrainCircuit, 
  FileText, 
  RefreshCw, 
  BellRing, 
  ShieldCheck, 
  BarChart3, 
  Settings,
  LogIn
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  pendingSyncCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  userRole,
  pendingSyncCount,
}) => {
  const menuItems = [
    { id: 'home', label: 'Public Portal', icon: Home, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] },
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] },
    { id: 'gis', label: 'GIS Risk Map', icon: Map, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] },
    { id: 'risk', label: 'AI Risk Engine', icon: BrainCircuit, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] },
    { id: 'report', label: 'Report Incident', icon: FileText, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] },
    { id: 'sync', label: 'Offline Sync Center', icon: RefreshCw, badge: pendingSyncCount > 0 ? pendingSyncCount : undefined, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] },
    { id: 'alerts', label: 'Alert Management', icon: BellRing, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] },
    { id: 'incidents', label: 'Incident Queue', icon: ShieldCheck, roles: ['super_admin', 'state_authority', 'district_authority'] },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] },
    { id: 'admin', label: 'Administration', icon: Settings, roles: ['super_admin', 'state_authority'] },
    { id: 'login', label: 'Login & Roles', icon: LogIn, roles: ['super_admin', 'state_authority', 'district_authority', 'field_worker', 'citizen'] }
  ];

  const visibleItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
        Navigation
      </div>
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[10px] font-black rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* NER Region Summary Footnote */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="font-bold text-slate-300 mb-0.5">NER 8 States Active</div>
        <p className="text-[10px] text-slate-400">Assam, Meghalaya, Sikkim, Arunachal, Nagaland, Manipur, Mizoram, Tripura</p>
      </div>
    </aside>
  );
};
