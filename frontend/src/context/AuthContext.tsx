import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { CareerID } from '../types';

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
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  handle: null,
  career: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('career_token'));
  const [handle, setHandle] = useState<string | null>(() => localStorage.getItem('career_handle'));
  const [career, setCareer] = useState<CareerID | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMyProfile();
      if (data && data.career_id) {
        setCareer(data.career_id);
        setHandle(data.career_id.handle);
        localStorage.setItem('career_handle', data.career_id.handle);
      }
    } catch (err) {
      console.error('Failed to load user profile session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('career_token', res.access_token);
    localStorage.setItem('career_handle', res.handle);
    setToken(res.access_token);
    setHandle(res.handle);
    await refreshProfile();
  };

  const register = async (payload: { email: string; password: string; full_name: string; handle: string; target_role?: string }) => {
    const res = await api.register(payload);
    localStorage.setItem('career_token', res.access_token);
    localStorage.setItem('career_handle', res.handle);
    setToken(res.access_token);
    setHandle(res.handle);
    await refreshProfile();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
