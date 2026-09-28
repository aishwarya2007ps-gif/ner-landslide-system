import React, { useState } from 'react';
import { Shield, KeyRound, UserCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { User, UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
  onQuickRoleSwitch: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onQuickRoleSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    { role: 'super_admin' as UserRole, title: 'Super Admin', email: 'admin@ner-disaster.gov.in', desc: 'Full System, Districts & Audit Logs' },
    { role: 'state_authority' as UserRole, title: 'State Authority', email: 'state@ner-disaster.gov.in', desc: 'Regional NER Overview & State Alerts' },
    { role: 'district_authority' as UserRole, title: 'District Authority', email: 'district@ner-disaster.gov.in', desc: 'Kamrup Verification & Local Dispatch' },
    { role: 'field_worker' as UserRole, title: 'Field Worker / Scout', email: 'field@ner-disaster.gov.in', desc: 'Offline Incident Reporting & GPS' },
    { role: 'citizen' as UserRole, title: 'Citizen Volunteer', email: 'citizen@ner-disaster.gov.in', desc: 'Public Warning Maps & Crowdsourcing' }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      onLoginSuccess(res.data.user, res.data.access_token);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Login failed. Verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAndLoginDemo = (accountEmail: string, role: UserRole) => {
    setEmail(accountEmail);
    setPassword('Password123!');
    onQuickRoleSwitch(role);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="text-center max-w-lg mx-auto pt-4">
        <div className="inline-flex p-3 rounded-2xl bg-teal-500/20 text-teal-400 mb-3 border border-teal-500/30">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-100">Sign in to NER Emergency Portal</h2>
        <p className="text-xs text-slate-400 mt-1">
          Role-aware secure operational access for state authorities, emergency response teams, field scouts, and citizens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Email/Password Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-teal-400" />
            Standard Credentials Login
          </h3>

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Official Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ner-disaster.gov.in"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* 1-Click Demo Profiles for Reviewers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-teal-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              1-Click Demo Testing Profiles
            </h3>
            <span className="text-[10px] text-slate-500">Dev Mode</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Select any pre-configured role below to test authorization scopes without typing passwords.
          </p>

          <div className="space-y-2 pt-1">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                onClick={() => fillAndLoginDemo(acc.email, acc.role)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-xs text-slate-200 group-hover:text-teal-300">
                    {acc.title}
                  </div>
                  <div className="text-[10px] text-slate-400">{acc.desc}</div>
                </div>
                <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-teal-400 border border-slate-800">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
