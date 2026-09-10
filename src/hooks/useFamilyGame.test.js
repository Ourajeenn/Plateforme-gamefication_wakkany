import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFamilyGame } from './useFamilyGame';

describe('useFamilyGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('counts down from 3 to 0 and transitions to playing', () => {
    const { result } = renderHook(() => useFamilyGame());

    act(() => {
      result.current.startGame({
        mode: 'coop',
        players: [],
        theme: 'general',
        difficulty: 'hunter',
        timerLimit: 8,
      });
    });

    expect(result.current.gameState).toBe('starting');
    expect(result.current.startCountdown).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.startCountdown).toBe(2);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.startCountdown).toBe(0);
    expect(result.current.gameState).toBe('playing');
  });
});
