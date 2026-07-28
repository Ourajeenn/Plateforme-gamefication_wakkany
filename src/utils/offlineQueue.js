/**
 * offlineQueue.js
 * File d'attente persistante pour les opérations Supabase effectuées hors ligne.
 * Les données sont stockées en localStorage et synchronisées au retour de la connexion.
 *
 * Prend en charge les types 'upsert', 'delete', 'insert' et 'rpc'.
 * Limité à MAX_RETRIES (5) tentatives par opération pour éviter la fuite mémoire.
 */

const QUEUE_KEY = 'wakkany_offline_queue';
export const MAX_RETRIES = 5;

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
 * @param {'upsert'|'delete'|'insert'|'rpc'} type
 * @param {string} target - Nom de la table ou nom de la fonction RPC
 * @param {object} payload - Données de la table ou arguments RPC
 */
export function enqueueOfflineOperation(type, target, payload) {
  const queue = loadQueue();
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    timestamp: Date.now(),
    retries: 0,
  };

  if (type === 'rpc') {
    entry.functionName = target;
    entry.args = payload;
  } else {
    entry.table = target;
    entry.data = payload;
  }

  queue.push(entry);
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
      if (op.type === 'rpc') {
        const { error } = await supabase.rpc(op.functionName, op.args);
        if (error) throw error;
      } else if (op.type === 'upsert') {
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
      const retries = (op.retries || 0) + 1;
      failed++;

      if (retries >= MAX_RETRIES) {
        console.warn(`[OfflineQueue] Abandon de l'opération ${op.id} (${op.type}) après ${MAX_RETRIES} échecs:`, e.message);
      } else if (Date.now() - op.timestamp < 7 * 24 * 60 * 60 * 1000) {
        console.warn(`[OfflineQueue] Échec de l'opération ${op.id} (tentative ${retries}/${MAX_RETRIES}):`, e.message);
        remaining.push({ ...op, retries });
      }
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
