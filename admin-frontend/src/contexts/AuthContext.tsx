'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as authService from '../services/auth.service';
import { User, UserRole } from '@/types/user';
import { useAppLoading } from './AppLoadingContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { setAppLoading, setInitialCheckComplete } = useAppLoading();

  // Separăm verificarea autentificării într-un useCallback pentru a evita re-crearea funcției
  const checkAuth = useCallback(async () => {
    if (authChecked) return; // Evităm verificări multiple
    
    setAppLoading(true);
    try {
      if (authService.isAuthenticated()) {
        const userData = authService.getUser();
        setUser(userData);
        
        // Dacă utilizatorul este pe pagina de login și este deja autentificat, redirecționăm 
        // către dashboard
        if (pathname === '/login') {
          await router.replace('/');
        }
      } else {
        setUser(null);
        
        // Dacă utilizatorul nu este autentificat și încearcă să acceseze o pagină protejată
        // îl redirecționăm către pagina de login
        if (pathname !== '/login' && pathname !== '/register') {
          await router.replace('/login');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setAppLoading(false);
      setInitialCheckComplete(true);
      setAuthChecked(true);
    }
  }, [pathname, router, setAppLoading, setInitialCheckComplete, authChecked]);

  // Rulăm verificarea autentificării doar o dată la montarea componentei
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // useEffect separat pentru a gestiona schimbările de pathname
  useEffect(() => {
    // Resetăm starea de verificare pentru a permite o nouă verificare când se schimbă pathname
    if (authChecked) {
      setAuthChecked(false);
    }
  }, [pathname]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setAppLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      setUser(response.user as User);
      
      // Redirecționare către pagina principală
      await router.replace('/');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Autentificare eșuată');
    } finally {
      setLoading(false);
      setAppLoading(false);
    }
  };

  const logout = async () => {
    setAppLoading(true);
    authService.logout();
    setUser(null);
    await router.replace('/login');
    setAppLoading(false);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie folosit în interiorul unui AuthProvider');
  }
  return context;
};