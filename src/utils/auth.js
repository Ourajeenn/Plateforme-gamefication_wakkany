import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './isSupabaseConfigured';

export async function signUp(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré');
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getAccessToken() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
