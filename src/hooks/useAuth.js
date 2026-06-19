import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';

export default function useAuth() {
  const [session, setSession] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authRequired = isSupabaseConfigured();

  useEffect(() => {
    if (!authRequired) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setAuthUser(currentSession?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [authRequired]);

  return {
    session,
    authUser,
    accessToken: session?.access_token || null,
    isAuthenticated: Boolean(authUser),
    authRequired,
    loading,
  };
}
