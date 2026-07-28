export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    url !== 'https://placeholder.supabase.co' &&
    !url.includes('your-project') &&
    key &&
    key !== 'placeholder-anon-key' &&
    !key.startsWith('sb_publishable_') &&
    key.includes('.')
  );
}

