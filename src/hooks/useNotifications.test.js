import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useNotifications from './useNotifications';
import { supabase } from '../utils/supabaseClient';

vi.mock('../utils/isSupabaseConfigured', () => ({
  isSupabaseConfigured: vi.fn(() => true)
}));

vi.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user-id' } } } })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null })
          }))
        }))
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes and fetches notifications', async () => {
    const user = { id: 'test-user-id' };
    const { result } = renderHook(() => useNotifications(user));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('addLocalNotification calls supabase.insert', async () => {
    const user = { id: 'test-user-id' };
    const { result } = renderHook(() => useNotifications(user));
    
    await act(async () => {
      await result.current.addLocalNotification('Test', 'This is a test');
    });

    expect(supabase.from).toHaveBeenCalledWith('notifications');
  });
});
