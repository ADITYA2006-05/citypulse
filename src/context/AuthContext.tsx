'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

export interface UserSession {
  name: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN';
  image?: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (name: string, email: string, role: 'CITIZEN' | 'ADMIN') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // NextAuth Session integration
  const { data: nextSession, status: nextStatus } = useSession();

  // Load session from localStorage on mount or NextAuth updates
  useEffect(() => {
    // 1. Check if NextAuth has an active session
    if (nextStatus === 'authenticated' && nextSession?.user) {
      const googleUser: UserSession = {
        name: nextSession.user.name || 'Google Citizen',
        email: nextSession.user.email || '',
        role: 'CITIZEN', // Google users are always Citizens
        image: nextSession.user.image || null,
      };
      setUser(googleUser);
      setIsLoading(false);
      return;
    }

    // 2. Fall back to local credentials session
    if (nextStatus === 'unauthenticated' || nextStatus === 'loading') {
      const savedSession = localStorage.getItem('citypulse_session');
      if (savedSession) {
        try {
          setUser(JSON.parse(savedSession));
        } catch (err) {
          console.error('Failed to parse saved credentials session', err);
          localStorage.removeItem('citypulse_session');
        }
      } else if (nextStatus === 'unauthenticated') {
        setUser(null);
      }
      
      if (nextStatus !== 'loading') {
        setIsLoading(false);
      }
    }
  }, [nextSession, nextStatus]);

  const login = (name: string, email: string, role: 'CITIZEN' | 'ADMIN') => {
    const session: UserSession = { name, email, role };
    setUser(session);
    localStorage.setItem('citypulse_session', JSON.stringify(session));
    
    // Redirect based on role
    if (role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('citypulse_session');
    
    // Trigger NextAuth signOut if active
    if (nextStatus === 'authenticated') {
      await signOut({ redirect: false });
    }
    
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isLoading || nextStatus === 'loading', login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
