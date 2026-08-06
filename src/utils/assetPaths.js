/**
 * Asset paths configuration
 * Centralized asset URLs to avoid 404 errors
 */

export const ASSET_PATHS = {
  // Images
  images: {
    heroes: {
      ascendedChampion: '/assets/ascended_champion.webp',
      clanFoxWarrior: '/assets/clan_fox_warrior.webp',
      clanTigerWarrior: '/assets/clan_tiger_warrior.webp',
      clanWolfWarrior: '/assets/clan_wolf_warrior.webp',
    },
    wakkany: {
      main: '/assets/wakkany_1.webp',
      cars: '/assets/wakkany_cars.webp',
      dinos: '/assets/wakkany_dinos.webp',
      heroes: '/assets/wakkany_heroes.webp',
      warriors: '/assets/wakkany_warriors.webp',
    },
  },
  
  // Audio
  audio: {
    click: '/assets/click1.mp3',
    epicMusic: '/assets/epic_music.mp3',
    thunder: '/assets/thunder.mp3',
  },

  // Icons
  icons: {
    icon192: '/icon-192.webp',
    icon512: '/icon-512.webp',
    icon: '/icon.webp',
  },
};

/**
 * Get asset URL with fallback
 */
export function getAssetUrl(path, fallback = '') {
  if (!path) return fallback;
  
  // If it's already an absolute path, return it
  if (path.startsWith('/') || path.startsWith('http')) {
    return path;
  }

  // Otherwise prepend /assets/
  return `/assets/${path}`;
}

/**
 * Preload assets (images and audio)
 */
export function preloadAssets(assets = []) {
  assets.forEach((asset) => {
    if (asset.endsWith('.mp3') || asset.endsWith('.wav') || asset.endsWith('.ogg')) {
      // Preload audio
      const audio = new Audio();
      audio.src = asset;
      audio.load();
    } else {
      // Preload image
      const img = new Image();
      img.src = asset;
    }
  });
}

/**
 * Preload critical assets on app start
 */
export function preloadCriticalAssets() {
  preloadAssets([
    ASSET_PATHS.audio.click,
    ASSET_PATHS.audio.epicMusic,
    ASSET_PATHS.images.wakkany.main,
  ]);
}
