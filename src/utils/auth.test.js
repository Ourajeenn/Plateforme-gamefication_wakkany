import { describe, it, expect, vi, beforeEach } from 'vitest';

const signUpMock = vi.fn();
const signInWithPasswordMock = vi.fn();
const signOutMock = vi.fn();
const getSessionMock = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: (...args) => signUpMock(...args),
      signInWithPassword: (...args) => signInWithPasswordMock(...args),
      signOut: (...args) => signOutMock(...args),
      getSession: (...args) => getSessionMock(...args),
    },
  },
}));

vi.mock('./isSupabaseConfigured', () => ({
  isSupabaseConfigured: vi.fn(),
}));

import { signUp, signIn, signOut, getSession } from './auth';
import { isSupabaseConfigured } from './isSupabaseConfigured';

describe('auth utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects signIn when Supabase is not configured', async () => {
    isSupabaseConfigured.mockReturnValue(false);
    await expect(signIn('a@b.com', 'password123')).rejects.toThrow('Supabase non configuré');
  });

  it('calls supabase signInWithPassword when configured', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    signInWithPasswordMock.mockResolvedValue({ data: { session: {} }, error: null });

    await signIn('a@b.com', 'password123');

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password123',
    });
  });

  it('calls supabase signUp when configured', async () => {
    isSupabaseConfigured.mockReturnValue(true);
    signUpMock.mockResolvedValue({ data: { user: {} }, error: null });

    await signUp('a@b.com', 'password123');

    expect(signUpMock).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password123',
    });
  });

  it('returns null session when Supabase is not configured', async () => {
    isSupabaseConfigured.mockReturnValue(false);
    await expect(getSession()).resolves.toBeNull();
  });

  it('signOut is a no-op when Supabase is not configured', async () => {
    isSupabaseConfigured.mockReturnValue(false);
    await signOut();
    expect(signOutMock).not.toHaveBeenCalled();
  });
});
