// src/utils/progressEvents.js
//
// Signal léger « la progression du joueur a changé côté serveur ».
// Émis après chaque écriture réussie (XP, compétence, quête, fin de partie).
// usePlayerData l'écoute et relit profil, compétences et quêtes, pour que
// l'arbre de talents et l'XP restent alignés sur le serveur.

const EVENT = 'wakkany:progress-changed';

export function emitProgressChanged() {
  try {
    window.dispatchEvent(new Event(EVENT));
  } catch (_e) {
    // Environnement sans window (tests, SSR) : rien à signaler.
  }
}

export function onProgressChanged(callback) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}
