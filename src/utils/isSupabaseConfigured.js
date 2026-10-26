export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (
    !url ||
    !url.startsWith('https://') ||
    url === 'https://placeholder.supabase.co' ||
    url.includes('your-project') ||
    !key ||
    key.trim().length <= 10 ||
    key === 'placeholder-anon-key' ||
    key.startsWith('service_role_')
  ) {
    return false;
  }

  // Vérification renforcée du claim JWT pour interdire la clé service_role côté client
  if (key.includes('.')) {
    try {
      const parts = key.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload?.role === 'service_role') {
          return false;
        }
      }
    } catch {
      // Ignorer si clé non décodable en test unitaire
    }
  }

  return true;
}
