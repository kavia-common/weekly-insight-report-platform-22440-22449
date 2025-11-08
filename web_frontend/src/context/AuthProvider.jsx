import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * useAuth
 * React hook to access auth state and actions.
 */
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access the current auth context: { user, session, signInWithEmail, signOut, loading } */
  return useContext(AuthContext);
}

/**
 * PUBLIC_INTERFACE
 * AuthProvider
 * Provides Supabase-based authentication state to the application.
 * - Initializes client
 * - Subscribes to onAuthStateChange
 * - Exposes { user, session, signInWithEmail, signOut }
 */
export function AuthProvider({ children }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial session load and subscription
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Supabase getSession failed:', e?.message || e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    init();

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  // Sign in with email magic link
  async function signInWithEmail(email) {
    const redirectTo =
      process.env.REACT_APP_FRONTEND_URL?.replace(/\/$/, '') ||
      window.location.origin.replace(/\/$/, '');

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectTo}/`,
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, data };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  const value = useMemo(
    () => ({ user, session, loading, signInWithEmail, signOut }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
