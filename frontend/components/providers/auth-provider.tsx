'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserMe } from '@/types/api';
import { api } from '@/lib/api';

interface AuthContextType {
  userMe: UserMe | null;
  loading: boolean;
  authenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userMe: null,
  loading: true,
  authenticated: false,
  refresh: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userMe, setUserMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuth = async () => {
    try {
      const data = await api.auth.getMe();
      setUserMe(data);
    } catch {
      setUserMe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        localStorage.setItem('auth_token', token);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
    fetchAuth();
  }, []);

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      await api.auth.logout();
    } catch {}
    setUserMe(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        userMe,
        loading,
        authenticated: !!userMe,
        refresh: fetchAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
