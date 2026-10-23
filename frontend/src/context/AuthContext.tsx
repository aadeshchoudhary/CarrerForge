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
  const getStoredToken = (): string | null => {
    const t = localStorage.getItem('career_token');
    if (!t || t === 'undefined' || t === 'null') {
      return 'demo-access-token-active';
    }
    return t;
  };

  const getStoredHandle = (): string | null => {
    const h = localStorage.getItem('career_handle');
    if (!h || h === 'undefined' || h === 'null') {
      return '@aarav_sharma';
    }
    return h;
  };

  const [token, setToken] = useState<string | null>(getStoredToken);
  const [handle, setHandle] = useState<string | null>(getStoredHandle);
  const [career, setCareer] = useState<CareerID | null>(() => {
    const saved = localStorage.getItem('career_profile_data');
    if (saved && saved !== 'undefined' && saved !== 'null') {
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
      if (!career) {
        setCareer(DEFAULT_CAREER_ID);
      }
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.login({ email, password: pass });
      const validToken = res?.access_token || 'demo-access-token-active';
      const resHandle = res?.handle || res?.user?.career_id?.handle || '@aarav_sharma';
      localStorage.setItem('career_token', validToken);
      localStorage.setItem('career_handle', resHandle);
      setToken(validToken);
      setHandle(resHandle);
      if (res?.user?.career_id) {
        setCareer(res.user.career_id);
        localStorage.setItem('career_profile_data', JSON.stringify(res.user.career_id));
      }
      await refreshProfile();
    } catch (err) {
      setDemoUser();
    }
  };

  const register = async (payload: { email: string; password: string; full_name: string; handle: string; target_role?: string }) => {
    try {
      const res = await api.register(payload);
      const validToken = res?.access_token || 'demo-access-token-active';
      const resHandle = res?.handle || res?.user?.career_id?.handle || `@${payload.handle.replace('@', '')}`;
      localStorage.setItem('career_token', validToken);
      localStorage.setItem('career_handle', resHandle);
      setToken(validToken);
      setHandle(resHandle);
      if (res?.user?.career_id) {
        setCareer(res.user.career_id);
        localStorage.setItem('career_profile_data', JSON.stringify(res.user.career_id));
      }
      await refreshProfile();
    } catch (err) {
      const formattedHandle = `@${payload.handle.replace('@', '')}`;
      const localProfile: CareerID = {
        ...DEFAULT_CAREER_ID,
        full_name: payload.full_name,
        handle: formattedHandle,
        target_role: payload.target_role || 'Full Stack Developer',
      };
      setCareer(localProfile);
      setHandle(formattedHandle);
      setToken('demo-access-token-active');
      localStorage.setItem('career_token', 'demo-access-token-active');
      localStorage.setItem('career_handle', formattedHandle);
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
