/**
 * offlineQueue.js
 * File d'attente persistante pour les opérations Supabase effectuées hors ligne.
 * Les données sont stockées en localStorage et synchronisées au retour de la connexion.
 */

const QUEUE_KEY = 'wakkany_offline_queue';

function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Ajoute une opération dans la file d'attente hors ligne.
 * @param {'upsert'|'delete'|'insert'} type
 * @param {string} table - Nom de la table Supabase
 * @param {object} data - Données à synchroniser
 */
export function enqueueOfflineOperation(type, table, data) {
  const queue = loadQueue();
  queue.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    table,
    data,
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

/**
 * Exécute toutes les opérations en attente contre Supabase.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ synced: number, failed: number }>}
 */
export async function flushOfflineQueue(supabase) {
  const queue = loadQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining = [];

  for (const op of queue) {
    try {
      if (op.type === 'upsert') {
        const { error } = await supabase.from(op.table).upsert(op.data);
        if (error) throw error;
      } else if (op.type === 'insert') {
        const { error } = await supabase.from(op.table).insert(op.data);
        if (error) throw error;
      } else if (op.type === 'delete') {
        const { filter, column } = op.data;
        const { error } = await supabase.from(op.table).delete().eq(column, filter);
        if (error) throw error;
      }
      synced++;
    } catch (e) {
      console.warn(`[OfflineQueue] Failed to sync op ${op.id}:`, e.message);
      // Garde uniquement les ops récentes (< 7 jours)
      if (Date.now() - op.timestamp < 7 * 24 * 60 * 60 * 1000) {
        remaining.push(op);
      }
      failed++;
    }
  }

  saveQueue(remaining);
  return { synced, failed };
}

/**
 * Retourne le nombre d'opérations en attente.
 */
export function getOfflineQueueLength() {
  return loadQueue().length;
}

/**
 * Vide complètement la file (utile au logout).
 */
export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
}
