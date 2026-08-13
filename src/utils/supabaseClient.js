import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase client environment variables are not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Using local fallbacks for test environment.');
}

let client;
// When env vars are provided, use them. Otherwise use safe local fallbacks so tests don't throw on import.
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide benign defaults that satisfy the supabase-js constructor validation
  // but won't accidentally connect to production. Tests should mock network calls when needed.
  const fallbackUrl = 'http://localhost';
  const fallbackKey = 'anon';
  client = createClient(fallbackUrl, fallbackKey);
}

export const supabase = client;

