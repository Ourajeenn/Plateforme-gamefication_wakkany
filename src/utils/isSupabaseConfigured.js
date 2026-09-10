export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    url.startsWith('https://') &&
    url !== 'https://placeholder.supabase.co' &&
    !url.includes('your-project') &&
    key &&
    key.trim().length > 10 &&
    key !== 'placeholder-anon-key' &&
    !key.startsWith('service_role_')
  );
}

