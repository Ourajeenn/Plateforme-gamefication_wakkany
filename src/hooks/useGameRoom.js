/**
 * useGameRoom — Hook multijoueur Wakkany
 * Gère la création, la connexion et la synchronisation en temps réel
 * d'une salle de jeu via Supabase Realtime.
 *
 * Utilisation :
 *   const { room, players, createRoom, joinRoom, updateGameState, leaveRoom } = useGameRoom();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Génère un code salle de 6 caractères alphanumériques */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1 pour lisibilité
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Génère un UUID v4 valide */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Vérifie si une chaîne est un UUID valide */
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/** Récupère ou génère un device_id (UUID) persistant dans localStorage */
function getDeviceId() {
  let id = localStorage.getItem('wakkany_device_id');
  
  // Si l'ID existe mais n'est pas un UUID valide, le régénérer
  if (id && !isValidUUID(id)) {
    console.warn('Invalid device_id format detected, regenerating...');
    localStorage.removeItem('wakkany_device_id');
    id = null;
  }
  
  // Générer un nouvel UUID si nécessaire
  if (!id) {
    id = generateUUID();
    localStorage.setItem('wakkany_device_id', id);
    console.log('New device_id generated:', id);
  }
  
  return id;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGameRoom() {
  const [room, setRoom]         = useState(null);   // données de la salle (game_rooms)
  const [players, setPlayers]   = useState([]);     // liste game_room_players
  const [myPlayer, setMyPlayer] = useState(null);   // notre propre entrée dans players
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const channelRef  = useRef(null);  // canal Supabase Realtime
  const roomIdRef   = useRef(null);  // ID de la salle courante
  const deviceId    = useRef(getDeviceId());

  // ── Chargement des joueurs ─────────────────────────────────────────────────
  const fetchPlayers = useCallback(async (roomId) => {
    const { data, error: err } = await supabase
      .from('game_room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (!err && data) {
      setPlayers(data);
      const me = data.find(p => p.device_id === deviceId.current);
      if (me) setMyPlayer(me);
    }
  }, []);

  // ── Souscription Realtime ──────────────────────────────────────────────────
  const subscribeToRoom = useCallback((roomId) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`room_${roomId}`)
      // Mise à jour de la salle (game_state, status…)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRoom(prev => ({ ...prev, ...payload.new }));
          }
          if (payload.eventType === 'DELETE') {
            setRoom(null);
            setPlayers([]);
            setMyPlayer(null);
          }
        }
      )
      // Mise à jour des joueurs (arrivée, départ, score…)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_room_players', filter: `room_id=eq.${roomId}` },
        () => {
          fetchPlayers(roomId);
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [fetchPlayers]);

  // ── Créer une salle ────────────────────────────────────────────────────────
  const createRoom = useCallback(async ({ pseudo, mode = 'bluff_royal', theme = 'rpg' }) => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const errorMsg = 'Multijoueur indisponible : configuration Supabase manquante.';
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return null;
    }

    try {
      const code = generateRoomCode();
      const expiresAt = new Date(Date.now() + 3600000).toISOString();

      // 1. Créer la salle avec host_id (UUID) et expires_at pour RLS
      const { data: roomData, error: roomErr } = await supabase
        .from('game_rooms')
        .insert({
          code,
          mode,
          theme,
          status: 'lobby',
          game_state: {},
          host_id: deviceId.current,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (roomErr) {
        console.error('Room creation error:', roomErr);
        throw roomErr;
      }

      // 2. S'enregistrer comme hôte
      const { data: playerData, error: playerErr } = await supabase
        .from('game_room_players')
        .insert({
          room_id: roomData.id,
          device_id: deviceId.current,
          pseudo,
          is_host: true,
          is_ready: true,
          joined_at: new Date().toISOString(),
          score: 0
        })
        .select()
        .single();

      if (playerErr) {
        console.error('Player insert error:', playerErr);
        throw playerErr;
      }

      roomIdRef.current = roomData.id;
      setRoom(roomData);
      setMyPlayer(playerData);
      setPlayers([playerData]);
      subscribeToRoom(roomData.id);

      return { room: roomData, player: playerData };
    } catch (err) {
      const errorMsg = err.message || 'Impossible de créer la salle.';
      console.error('createRoom error:', errorMsg);
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [subscribeToRoom]);

  // ── Rejoindre une salle ────────────────────────────────────────────────────
  const joinRoom = useCallback(async ({ code, pseudo }) => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const errorMsg = 'Multijoueur indisponible : configuration Supabase manquante.';
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return null;
    }

    try {
      // 1. Trouver la salle par code
      const { data: roomData, error: roomErr } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('status', 'lobby')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (roomErr || !roomData) throw new Error('Salle introuvable ou partie déjà commencée.');

      // 2. Rejoindre en tant que joueur (upsert pour les reconnexions)
      const { data: playerData, error: playerErr } = await supabase
        .from('game_room_players')
        .upsert(
          {
            room_id: roomData.id,
            device_id: deviceId.current,
            pseudo,
            is_host: false,
            is_ready: false,
            joined_at: new Date().toISOString(),
            score: 0
          },
          { onConflict: 'room_id,device_id' }
        )
        .select()
        .single();

      if (playerErr) throw playerErr;

      roomIdRef.current = roomData.id;
      setRoom(roomData);
      setMyPlayer(playerData);
      await fetchPlayers(roomData.id);
      subscribeToRoom(roomData.id);

      return { room: roomData, player: playerData };
    } catch (err) {
      setError(err.message || 'Impossible de rejoindre la salle.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPlayers, subscribeToRoom]);

  // ── Marquer prêt / pas prêt ───────────────────────────────────────────────
  const setReady = useCallback(async (ready = true) => {
    if (!myPlayer) return;
    await supabase
      .from('game_room_players')
      .update({ is_ready: ready })
      .eq('id', myPlayer.id);
  }, [myPlayer]);

  // ── Lancer la partie (hôte uniquement) ────────────────────────────────────
  const startGame = useCallback(async (gameState = {}) => {
    if (!roomIdRef.current) return;
    await supabase
      .from('game_rooms')
      .update({ status: 'playing', game_state: gameState })
      .eq('id', roomIdRef.current);
  }, []);

  // ── Mettre à jour le game_state (hôte) ────────────────────────────────────
  const updateGameState = useCallback(async (patch) => {
    if (!roomIdRef.current) return;
    const current = room?.game_state || {};
    await supabase
      .from('game_rooms')
      .update({ game_state: { ...current, ...patch } })
      .eq('id', roomIdRef.current);
  }, [room]);

  // ── Mettre à jour le score d'un joueur ───────────────────────────────────
  const updateScore = useCallback(async (delta) => {
    if (!myPlayer) return;
    await supabase
      .from('game_room_players')
      .update({ score: (myPlayer.score || 0) + delta })
      .eq('id', myPlayer.id);
  }, [myPlayer]);

  // ── Terminer la partie (hôte) ─────────────────────────────────────────────
  const endGame = useCallback(async () => {
    if (!roomIdRef.current) return;
    await supabase
      .from('game_rooms')
      .update({ status: 'finished' })
      .eq('id', roomIdRef.current);
  }, []);

  // ── Quitter la salle ──────────────────────────────────────────────────────
  const leaveRoom = useCallback(async () => {
    if (!myPlayer) return;

    // Si on est l'hôte et la partie n'a pas commencé → supprimer la salle
    if (myPlayer.is_host && room?.status === 'lobby') {
      await supabase.from('game_rooms').delete().eq('id', roomIdRef.current);
    } else {
      await supabase.from('game_room_players').delete().eq('id', myPlayer.id);
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setRoom(null);
    setPlayers([]);
    setMyPlayer(null);
    roomIdRef.current = null;
  }, [myPlayer, room]);

  // ── Nettoyage au démontage ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    room,
    players,
    myPlayer,
    loading,
    error,
    deviceId: deviceId.current,
    isHost: myPlayer?.is_host === true,
    createRoom,
    joinRoom,
    setReady,
    startGame,
    updateGameState,
    updateScore,
    endGame,
    leaveRoom,
  };
}
