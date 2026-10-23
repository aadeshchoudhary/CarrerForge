import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { CareerID } from '../types';
import { DEFAULT_CAREER_ID } from '../services/mockData';

interface AuthContextType {
  token: string | null;
  handle: string | null;
  career: CareerID | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { email: string; password: string; full_name: string; handle: string; target_role?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  handle: null,
  career: null,
  isAuthenticated: true,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
  setDemoUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to active demo session so ANY visitor on Vercel gets instant access without login
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('career_token') || 'demo-access-token-active'
  );
  const [handle, setHandle] = useState<string | null>(
    () => localStorage.getItem('career_handle') || '@aarav_sharma'
  );
  const [career, setCareer] = useState<CareerID | null>(() => {
    const saved = localStorage.getItem('career_profile_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore error
      }
    }
    return DEFAULT_CAREER_ID;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshProfile = async () => {
    try {
      const data = await api.getMyProfile();
      if (data && data.career_id) {
        setCareer(data.career_id);
        setHandle(data.career_id.handle);
        localStorage.setItem('career_handle', data.career_id.handle);
        localStorage.setItem('career_profile_data', JSON.stringify(data.career_id));
      }
    } catch (err) {
      // If backend is not available, continue using client-side profile
      if (!career) {
        setCareer(DEFAULT_CAREER_ID);
      }
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.login({ email, password: pass });
      localStorage.setItem('career_token', res.access_token);
      localStorage.setItem('career_handle', res.handle);
      setToken(res.access_token);
      setHandle(res.handle);
      await refreshProfile();
    } catch (err) {
      // Fallback: grant instant demo access
      setDemoUser();
    }
  };

  const register = async (payload: { email: string; password: string; full_name: string; handle: string; target_role?: string }) => {
    try {
      const res = await api.register(payload);
      localStorage.setItem('career_token', res.access_token);
      localStorage.setItem('career_handle', res.handle);
      setToken(res.access_token);
      setHandle(res.handle);
      await refreshProfile();
    } catch (err) {
      // Fallback: create client profile
      const localProfile: CareerID = {
        ...DEFAULT_CAREER_ID,
        full_name: payload.full_name,
        handle: `@${payload.handle.replace('@', '')}`,
        target_role: payload.target_role || 'Full Stack Developer',
      };
      setCareer(localProfile);
      setHandle(localProfile.handle);
      setToken('demo-access-token-active');
      localStorage.setItem('career_token', 'demo-access-token-active');
      localStorage.setItem('career_handle', localProfile.handle);
      localStorage.setItem('career_profile_data', JSON.stringify(localProfile));
    }
  };

  const setDemoUser = () => {
    setToken('demo-access-token-active');
    setHandle('@aarav_sharma');
    setCareer(DEFAULT_CAREER_ID);
    localStorage.setItem('career_token', 'demo-access-token-active');
    localStorage.setItem('career_handle', '@aarav_sharma');
    localStorage.setItem('career_profile_data', JSON.stringify(DEFAULT_CAREER_ID));
  };

  const logout = () => {
    localStorage.removeItem('career_token');
    localStorage.removeItem('career_handle');
    setToken(null);
    setHandle(null);
    setCareer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        handle,
        career,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
