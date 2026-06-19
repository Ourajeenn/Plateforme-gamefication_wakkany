import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useChat from './useChat';
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
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      })),
      insert: vi.fn().mockResolvedValue({ error: null })
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}));

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes and fetches messages', async () => {
    const user = { name: 'TestUser', academy: 'TestAcademy' };
    const { result } = renderHook(() => useChat(user));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.messages).toEqual([]);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
  });

  it('sendMessage calls supabase.insert', async () => {
    const user = { name: 'TestUser', academy: 'TestAcademy' };
    const { result } = renderHook(() => useChat(user));
    
    await act(async () => {
      const success = await result.current.sendMessage('Hello world');
      expect(success).toBe(true);
    });

    expect(supabase.from).toHaveBeenCalledWith('chat_messages');
  });
});
