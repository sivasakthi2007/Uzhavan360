'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { signUp as apiSignUp, signIn as apiSignIn, signOut as apiSignOut, getSession, signInWithOtp as apiSignInWithOtp, verifyOtp as apiVerifyOtp } from '@/lib/auth';

// ─── Types ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  isSandboxMode: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string; role?: string; language?: string }) => Promise<{ data: { user: any; session: any }; error: any }>;
  signIn: typeof apiSignIn;
  signOut: () => Promise<void>;
  signInWithOtp: (emailOrPhone: string) => Promise<{ error: any }>;
  verifyOtp: (emailOrPhone: string, token: string) => Promise<{ data: { user: any; session: any }; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth — restore any persisted session
    async function initAuth() {
      try {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
          const demoUser = {
            id: 'farmer_1',
            email: 'farmer_1@vlink.com',
            user_metadata: {
              full_name: 'Ramanathan Swamy',
              role: 'farmer'
            }
          };
          setUser(demoUser);
          setSession({ user: demoUser, access_token: 'demo-token' });
          setLoading(false);
          return;
        }
        const { data: { session: activeSession } } = await getSession();
        if (activeSession) {
          setSession(activeSession);
          setUser(activeSession.user);
        }
      } catch (err) {
        console.error('[AuthContext] Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Subscribe to real-time auth state changes from Supabase
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession ? newSession.user : null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // ── Sign Up ──
  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; role?: string; language?: string }
  ) => {
    const res = await apiSignUp(email, password, metadata);
    // For sandbox mode — manually sync state since there's no onAuthStateChange
    if (!isSupabaseConfigured && res.data.session) {
      setSession(res.data.session);
      setUser(res.data.user);
    }
    return res;
  };

  // ── Sign In ──
  const signIn = async (email: string, password: string) => {
    const res = await apiSignIn(email, password);
    // For sandbox mode — manually sync state
    if (!isSupabaseConfigured && res.data.session) {
      setSession(res.data.session);
      setUser(res.data.user);
    }
    return res;
  };

  // ── Sign Out ──
  const signOut = async () => {
    await apiSignOut();
    setSession(null);
    setUser(null);
  };

  // ── Sign In With OTP ──
  const signInWithOtp = async (emailOrPhone: string) => {
    const res = await apiSignInWithOtp(emailOrPhone);
    return res;
  };

  // ── Verify OTP ──
  const verifyOtp = async (emailOrPhone: string, token: string) => {
    const res = await apiVerifyOtp(emailOrPhone, token);
    if (!res.error && res.data.session) {
      setSession(res.data.session);
      setUser(res.data.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSandboxMode: !isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        signInWithOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
