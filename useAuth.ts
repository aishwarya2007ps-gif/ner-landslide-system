import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiClient } from '../api/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ner_user');
    return saved ? JSON.parse(saved) : {
      id: 'demo-state-auth',
      email: 'state@ner-disaster.gov.in',
      full_name: 'Assam State Disaster Officer',
      role: 'state_authority',
      assigned_state: 'Assam',
      is_active: true
    };
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ner_token'));

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('ner_user', JSON.stringify(userData));
    localStorage.setItem('ner_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ner_user');
    localStorage.removeItem('ner_token');
  };

  const switchRoleQuickly = (role: UserRole) => {
    const roleProfiles: Record<UserRole, User> = {
      super_admin: { id: 'usr-admin', email: 'admin@ner-disaster.gov.in', full_name: 'NER Emergency Director', role: 'super_admin', is_active: true },
      state_authority: { id: 'usr-state', email: 'state@ner-disaster.gov.in', full_name: 'Assam State Disaster Officer', role: 'state_authority', assigned_state: 'Assam', is_active: true },
      district_authority: { id: 'usr-dist', email: 'district@ner-disaster.gov.in', full_name: 'Kamrup Metro District Officer', role: 'district_authority', assigned_district: 'Kamrup Metropolitan', is_active: true },
      field_worker: { id: 'usr-field', email: 'field@ner-disaster.gov.in', full_name: 'Biren Das (Field Scout)', role: 'field_worker', is_active: true },
      citizen: { id: 'usr-citizen', email: 'citizen@ner-disaster.gov.in', full_name: 'Ananya Sharma (Citizen)', role: 'citizen', is_active: true }
    };

    const newProfile = roleProfiles[role];
    setUser(newProfile);
    localStorage.setItem('ner_user', JSON.stringify(newProfile));
  };

  return { user, token, login, logout, switchRoleQuickly };
};
