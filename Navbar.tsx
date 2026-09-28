import React from 'react';
import { User, UserRole } from '../types';
import { ShieldAlert, Wifi, WifiOff, Volume2, Bell } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onRoleChange: (role: UserRole) => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onRoleChange,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  pendingCount,
}) => {
  const playEmergencyAudio = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, audioCtx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(650, audioCtx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    } catch (e) {
      console.warn("Web Audio alert blocked by browser", e);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-black tracking-tight text-slate-100">
              NER DISASTER EARLY WARNING SYSTEM
            </h1>
            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded-full font-bold uppercase">
              PROTOTYPE
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Multi-Hazard Decision-Support Platform • North Eastern Region of India
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Role Switcher */}
        <div className="flex items-center bg-slate-800/90 rounded-lg px-2.5 py-1.5 border border-slate-700 text-xs">
          <span className="text-slate-400 mr-2 font-medium">Role:</span>
          <select
            value={user?.role || 'citizen'}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent text-teal-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="super_admin" className="bg-slate-900 text-slate-100">Super Admin</option>
            <option value="state_authority" className="bg-slate-900 text-slate-100">State Authority (NER)</option>
            <option value="district_authority" className="bg-slate-900 text-slate-100">District Authority (Kamrup)</option>
            <option value="field_worker" className="bg-slate-900 text-slate-100">Field Worker / Scout</option>
            <option value="citizen" className="bg-slate-900 text-slate-100">Citizen</option>
          </select>
        </div>

        {/* Network & Offline Simulator Toggle */}
        <button
          onClick={onToggleSimulatedOffline}
          title="Click to toggle simulated offline/online state"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition shadow-sm ${
            isOnline
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
              : 'bg-amber-950/80 border-amber-800 text-amber-300 hover:bg-amber-900'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Online Mode</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Mode {pendingCount > 0 ? `(${pendingCount} queued)` : ''}</span>
            </>
          )}
        </button>

        {/* Audio Siren Tester */}
        <button
          onClick={playEmergencyAudio}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-bold transition shadow-sm"
          title="Play Web Audio Emergency Siren"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Siren</span>
        </button>
      </div>
    </header>
  );
};
