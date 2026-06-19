import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const mockUseAuth = vi.fn(() => ({
  isAuthenticated: false,
  authRequired: false,
  loading: false,
}));

vi.mock('./hooks/usePlayerData', () => ({
  default: () => ({
    user: null,
    setUser: vi.fn(),
    xp: 0,
    setXp: vi.fn(),
    unlockedSkills: [],
    setUnlockedSkills: vi.fn(),
    completedQuests: [],
    setCompletedQuests: vi.fn(),
    unlockedAchievements: [],
    setUnlockedAchievements: vi.fn(),
    xpHistory: [],
    isLoaded: true,
  }),
}));

vi.mock('./hooks/useAuth', () => ({
  default: () => mockUseAuth(),
}));

vi.mock('./hooks/useSoundFX', () => ({
  useSoundFX: () => ({
    playClick: vi.fn(),
    playUnlock: vi.fn(),
    playLevelUp: vi.fn(),
    playError: vi.fn(),
  }),
  bgMusic: { play: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('./components/Preloader', () => ({
  default: ({ onComplete }) => {
    onComplete?.();
    return null;
  },
}));

describe('App routing', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      authRequired: false,
      loading: false,
    });
  });

  it('renders quiz home on /quiz', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("L'Arène du Savoir")).toBeInTheDocument();
    });
  });

  it('redirects protected dashboard to /setup when auth is required', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      authRequired: true,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/profile']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('FORGEZ VOTRE LÉGENDE')).toBeInTheDocument();
    });
  });
});
