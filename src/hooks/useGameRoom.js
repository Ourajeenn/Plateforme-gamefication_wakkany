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
import { io } from 'socket.io-client';

// ── Local in-memory fallback (used when Supabase envs are missing)
const LOCAL_STORE = {
  rooms: new Map(), // roomId -> roomObj
  players: new Map(), // roomId -> [playerObj]
};

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

export function useGameRoom({ network = 'online' } = {}) {
  const [room, setRoom]         = useState(null);   // données de la salle (game_rooms)
  const [players, setPlayers]   = useState([]);     // liste game_room_players
  const [myPlayer, setMyPlayer] = useState(null);   // notre propre entrée dans players
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [transportReady, setTransportReady] = useState(network !== 'local');

  const channelRef  = useRef(null);  // canal Supabase Realtime
  const roomIdRef   = useRef(null);  // ID de la salle courante
  const deviceId    = useRef(getDeviceId());
  const localSocketRef = useRef(null);
  const isLocalNetwork = network === 'local';

  useEffect(() => {
    if (!isLocalNetwork) return undefined;

    const socket = io({ path: '/socket.io', timeout: 5000 });
    localSocketRef.current = socket;
    socket.on('connect', () => {
      setTransportReady(true);
      setError(null);
    });
    socket.on('connect_error', () => {
      setTransportReady(false);
      setError('Serveur local indisponible. Ouvrez l’adresse réseau affichée au démarrage de l’application.');
    });
    socket.on('disconnect', () => setTransportReady(false));
    socket.on('local:room', (nextRoom) => {
      if (nextRoom.id === roomIdRef.current) setRoom(nextRoom);
    });
    socket.on('local:players', ({ roomId, players: nextPlayers }) => {
      if (roomId !== roomIdRef.current) return;
      setPlayers(nextPlayers);
      setMyPlayer(nextPlayers.find((player) => player.device_id === deviceId.current) || null);
    });
    socket.on('local:closed', (closedRoomId) => {
      if (closedRoomId !== roomIdRef.current) return;
      roomIdRef.current = null;
      setRoom(null);
      setPlayers([]);
      setMyPlayer(null);
      setError('Le salon a été fermé par son hôte.');
    });

    return () => {
      socket.disconnect();
      localSocketRef.current = null;
    };
  }, [isLocalNetwork]);

  const requestLocal = useCallback((event, payload) => {
    const socket = localSocketRef.current;
    if (!socket?.connected) {
      return Promise.resolve({ error: 'Le serveur du réseau local n’est pas connecté.' });
    }
    return new Promise((resolve) => {
      const acknowledge = (timeoutError, response) => {
        resolve(timeoutError ? { error: 'Le serveur local ne répond pas.' } : response || {});
      };
      if (payload === undefined) socket.timeout(5000).emit(event, acknowledge);
      else socket.timeout(5000).emit(event, payload, acknowledge);
    });
  }, []);

  // ── Chargement des joueurs ─────────────────────────────────────────────────
  const fetchPlayers = useCallback(async (roomId) => {
    if (!isSupabaseConfigured()) {
      const list = LOCAL_STORE.players.get(roomId) || [];
      setPlayers(list.slice().sort((a,b) => new Date(a.joined_at) - new Date(b.joined_at)));
      const me = list.find(p => p.device_id === deviceId.current);
      if (me) setMyPlayer(me);
      return;
    }

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
    if (!isSupabaseConfigured()) {
      // no-op for local fallback (no realtime)
      return;
    }

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

    if (isLocalNetwork) {
      try {
        const result = await requestLocal('local:create', { pseudo, mode, theme, deviceId: deviceId.current });
        if (result.error) throw new Error(result.error);
        roomIdRef.current = result.room.id;
        setRoom(result.room);
        setMyPlayer(result.player);
        setPlayers(result.players);
        return { room: result.room, player: result.player };
      } catch (err) {
        setError(err.message || 'Impossible de créer le salon local.');
        return null;
      } finally {
        setLoading(false);
      }
    }

    if (!isSupabaseConfigured()) {
      // Local in-memory room creation fallback
      try {
        const code = generateRoomCode();
        const id = generateUUID();
        const expiresAt = new Date(Date.now() + 3600000).toISOString();
        const roomData = {
          id,
          code,
          mode,
          theme,
          status: 'lobby',
          game_state: {},
          host_id: deviceId.current,
          expires_at: expiresAt
        };
        const playerData = {
          id: generateUUID(),
          room_id: id,
          device_id: deviceId.current,
          pseudo,
          is_host: true,
          is_ready: true,
          joined_at: new Date().toISOString(),
          score: 0
        };

        LOCAL_STORE.rooms.set(id, roomData);
        LOCAL_STORE.players.set(id, [playerData]);

        roomIdRef.current = id;
        setRoom(roomData);
        setMyPlayer(playerData);
        setPlayers([playerData]);

        return { room: roomData, player: playerData };
      } catch (err) {
        const errorMsg = err.message || 'Impossible de créer la salle (local).';
        console.error(errorMsg);
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
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
  }, [isLocalNetwork, requestLocal, subscribeToRoom]);

  // ── Rejoindre une salle ────────────────────────────────────────────────────
  const joinRoom = useCallback(async ({ code, pseudo }) => {
    setLoading(true);
    setError(null);

    if (isLocalNetwork) {
      try {
        const result = await requestLocal('local:join', { code, pseudo, deviceId: deviceId.current });
        if (result.error) throw new Error(result.error);
        roomIdRef.current = result.room.id;
        setRoom(result.room);
        setMyPlayer(result.player);
        setPlayers(result.players);
        return { room: result.room, player: result.player };
      } catch (err) {
        setError(err.message || 'Impossible de rejoindre le salon local.');
        return null;
      } finally {
        setLoading(false);
      }
    }

    if (!isSupabaseConfigured()) {
      // Local fallback: find room by code
      try {
        const roomEntry = Array.from(LOCAL_STORE.rooms.values()).find(r => r.code === code.toUpperCase() && r.status === 'lobby' && new Date(r.expires_at) > new Date());
        if (!roomEntry) throw new Error('Salle introuvable ou partie déjà commencée.');

        const roomId = roomEntry.id;
        const playersList = LOCAL_STORE.players.get(roomId) || [];

        // upsert by device_id
        let player = playersList.find(p => p.device_id === deviceId.current);
        if (!player) {
          player = {
            id: generateUUID(),
            room_id: roomId,
            device_id: deviceId.current,
            pseudo,
            is_host: false,
            is_ready: false,
            joined_at: new Date().toISOString(),
            score: 0
          };
          playersList.push(player);
          LOCAL_STORE.players.set(roomId, playersList);
        } else {
          player.pseudo = pseudo;
          player.joined_at = new Date().toISOString();
        }

        roomIdRef.current = roomId;
        setRoom(roomEntry);
        setMyPlayer(player);
        await fetchPlayers(roomId);
        // no realtime subscribe for local

        return { room: roomEntry, player };
      } catch (err) {
        setError(err.message || 'Impossible de rejoindre la salle.');
        return null;
      } finally {
        setLoading(false);
      }
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
  }, [fetchPlayers, isLocalNetwork, requestLocal, subscribeToRoom]);

  // ── Marquer prêt / pas prêt ───────────────────────────────────────────────
  const setReady = useCallback(async (ready = true) => {
    if (!myPlayer) return;
    if (isLocalNetwork) {
      const result = await requestLocal('local:ready', ready);
      if (result.error) setError(result.error);
      return;
    }
    await supabase
      .from('game_room_players')
      .update({ is_ready: ready })
      .eq('id', myPlayer.id);
  }, [isLocalNetwork, myPlayer, requestLocal]);

  // ── Lancer la partie (hôte uniquement) ────────────────────────────────────
  const startGame = useCallback(async (gameState = {}) => {
    if (!roomIdRef.current) return;
    if (isLocalNetwork) {
      const result = await requestLocal('local:start', gameState);
      if (result.error) setError(result.error);
      return;
    }
    await supabase
      .from('game_rooms')
      .update({ status: 'playing', game_state: gameState })
      .eq('id', roomIdRef.current);
  }, [isLocalNetwork, requestLocal]);

  // ── Mettre à jour le game_state (hôte) ────────────────────────────────────
  const updateGameState = useCallback(async (patch) => {
    if (!roomIdRef.current) return;
    if (isLocalNetwork) {
      const result = await requestLocal('local:game-state', patch);
      if (result.error) setError(result.error);
      return;
    }
    const current = room?.game_state || {};
    await supabase
      .from('game_rooms')
      .update({ game_state: { ...current, ...patch } })
      .eq('id', roomIdRef.current);
  }, [isLocalNetwork, requestLocal, room]);

  // ── Mettre à jour le score d'un joueur ───────────────────────────────────
  const updateScore = useCallback(async (delta) => {
    if (!myPlayer) return;
    if (isLocalNetwork) {
      const result = await requestLocal('local:score', delta);
      if (result.error) setError(result.error);
      return;
    }
    await supabase
      .from('game_room_players')
      .update({ score: (myPlayer.score || 0) + delta })
      .eq('id', myPlayer.id);
  }, [isLocalNetwork, myPlayer, requestLocal]);

  // ── Terminer la partie (hôte) ─────────────────────────────────────────────
  const endGame = useCallback(async () => {
    if (!roomIdRef.current) return;
    if (isLocalNetwork) {
      const result = await requestLocal('local:end');
      if (result.error) setError(result.error);
      return;
    }
    await supabase
      .from('game_rooms')
      .update({ status: 'finished' })
      .eq('id', roomIdRef.current);
  }, [isLocalNetwork, requestLocal]);

  // ── Quitter la salle ──────────────────────────────────────────────────────
  const leaveRoom = useCallback(async () => {
    if (!myPlayer) return;

    if (isLocalNetwork) {
      await requestLocal('local:leave');
      roomIdRef.current = null;
      setRoom(null);
      setPlayers([]);
      setMyPlayer(null);
      return;
    }

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
  }, [isLocalNetwork, myPlayer, requestLocal, room]);

  // ── Nettoyage au démontage ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      localSocketRef.current?.disconnect();
    };
  }, []);

  return {
    room,
    players,
    myPlayer,
    loading,
    error,
    transportReady,
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
