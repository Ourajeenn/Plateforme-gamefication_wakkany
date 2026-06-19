import { describe, it, expect, afterEach } from 'vitest';
import { isSupabaseConfigured } from './isSupabaseConfigured';

describe('isSupabaseConfigured', () => {
  const originalUrl = import.meta.env.VITE_SUPABASE_URL;
  const originalKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  afterEach(() => {
    import.meta.env.VITE_SUPABASE_URL = originalUrl;
    import.meta.env.VITE_SUPABASE_ANON_KEY = originalKey;
  });

  it('returns false when env vars are missing', () => {
    import.meta.env.VITE_SUPABASE_URL = '';
    import.meta.env.VITE_SUPABASE_ANON_KEY = '';
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns false for placeholder values', () => {
    import.meta.env.VITE_SUPABASE_URL = 'https://placeholder.supabase.co';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'placeholder-anon-key';
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns true for real-looking configuration', () => {
    import.meta.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'sb_publishable_test';
    expect(isSupabaseConfigured()).toBe(true);
  });
});
