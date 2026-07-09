import { getAccessToken } from './auth';
import { reportError } from './security';

/**
 * Fonction utilitaire pour faire des requêtes API avec le JWT (Token Supabase)
 * @param {string} url - L'URL de l'API
 * @param {object} options - Options de la requête fetch
 */
export async function fetchWithAuth(url, options = {}) {
  // Récupération du JWT de l'utilisateur courant
  const token = await getAccessToken();

  // Configuration des en-têtes avec le token JWT
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Gestion globale des erreurs d'API
    const error = await response.json().catch(() => ({}));
    reportError(new Error(error.message || `Erreur API: ${response.status}`), { url, status: response.status });
    throw new Error(error.message || `Erreur API: ${response.status}`);
  }

  return response.json();
}

