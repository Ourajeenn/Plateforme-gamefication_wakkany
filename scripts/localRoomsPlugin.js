import { randomBytes, randomUUID } from 'node:crypto';
import { Server } from 'socket.io';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_TTL_MS = 60 * 60 * 1000;
const MAX_PLAYERS = 8;

function makeRoomCode(rooms) {
  let code;
  do {
    code = Array.from(randomBytes(6), (byte) => ROOM_CODE_CHARS[byte % ROOM_CODE_CHARS.length]).join('');
  } while ([...rooms.values()].some((room) => room.code === code));
  return code;
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function sendAck(ack, result) {
  if (typeof ack === 'function') ack(result);
}

function publicPlayer({ socket_id: socketId, ...player }) {
  void socketId;
  return player;
}

function publicRoom(room) {
  return { ...room, players: room.players.map(publicPlayer) };
}

export function localRoomsPlugin() {
  const rooms = new Map();
  let attached = false;

  function attach(httpServer) {
    if (!httpServer || attached) return;
    attached = true;

    const io = new Server(httpServer, {
      path: '/socket.io',
      serveClient: false,
      cors: { origin: true },
      maxHttpBufferSize: 16_384,
    });

    const publishPlayers = (room) => {
      io.to(room.id).emit('local:players', { roomId: room.id, players: room.players.map(publicPlayer) });
    };

    const publishRoom = (room) => {
      io.to(room.id).emit('local:room', publicRoom(room));
    };

    const removeSocketPlayer = (socket) => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      const room = rooms.get(roomId);
      socket.data.roomId = null;
      if (!room) return;

      room.players = room.players.filter((player) => player.socket_id !== socket.id);
      if (room.players.length === 0 || (room.status === 'lobby' && !room.players.some((player) => player.is_host))) {
        io.to(room.id).emit('local:closed', room.id);
        rooms.delete(room.id);
        return;
      }
      publishPlayers(room);
    };

    io.on('connection', (socket) => {
      socket.on('local:create', (input = {}, ack) => {
        const pseudo = cleanText(input.pseudo, 20);
        const deviceId = cleanText(input.deviceId, 64);
        if (!pseudo || !deviceId) {
          sendAck(ack, { error: 'Saisissez un pseudo valide.' });
          return;
        }

        const id = randomUUID();
        const room = {
          id,
          code: makeRoomCode(rooms),
          mode: input.mode === 'family' ? 'family' : 'bluff_royal',
          theme: cleanText(input.theme, 24) || 'rpg',
          status: 'lobby',
          game_state: {},
          host_id: deviceId,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + ROOM_TTL_MS).toISOString(),
          players: [],
        };
        const player = {
          id: randomUUID(),
          room_id: id,
          device_id: deviceId,
          pseudo,
          is_host: true,
          is_ready: true,
          joined_at: new Date().toISOString(),
          score: 0,
          socket_id: socket.id,
        };
        room.players.push(player);
        rooms.set(id, room);
        socket.data.roomId = id;
        socket.join(id);
        sendAck(ack, { room: publicRoom(room), player: publicPlayer(player), players: room.players.map(publicPlayer) });
        publishPlayers(room);
      });

      socket.on('local:join', (input = {}, ack) => {
        const code = cleanText(input.code, 6).toUpperCase();
        const pseudo = cleanText(input.pseudo, 20);
        const deviceId = cleanText(input.deviceId, 64);
        const room = [...rooms.values()].find((entry) => entry.code === code);
        if (!room || room.status !== 'lobby' || Date.parse(room.expires_at) <= Date.now()) {
          sendAck(ack, { error: 'Salon introuvable ou partie déjà commencée.' });
          return;
        }
        if (!pseudo || !deviceId) {
          sendAck(ack, { error: 'Saisissez un pseudo valide.' });
          return;
        }
        if (!room.players.some((player) => player.device_id === deviceId) && room.players.length >= MAX_PLAYERS) {
          sendAck(ack, { error: 'Ce salon est complet.' });
          return;
        }

        const player = room.players.find((entry) => entry.device_id === deviceId) || {
          id: randomUUID(),
          room_id: room.id,
          device_id: deviceId,
          is_host: false,
          is_ready: false,
          joined_at: new Date().toISOString(),
          score: 0,
        };
        player.pseudo = pseudo;
        player.socket_id = socket.id;
        if (!room.players.includes(player)) room.players.push(player);
        socket.data.roomId = room.id;
        socket.join(room.id);
        sendAck(ack, { room: publicRoom(room), player: publicPlayer(player), players: room.players.map(publicPlayer) });
        publishPlayers(room);
      });

      socket.on('local:ready', (ready, ack) => {
        const room = rooms.get(socket.data.roomId);
        const player = room?.players.find((entry) => entry.socket_id === socket.id);
        if (!player) return sendAck(ack, { error: 'Joueur introuvable.' });
        player.is_ready = Boolean(ready);
        sendAck(ack, { ok: true });
        publishPlayers(room);
      });

      socket.on('local:start', (gameState = {}, ack) => {
        const room = rooms.get(socket.data.roomId);
        const player = room?.players.find((entry) => entry.socket_id === socket.id);
        if (!room || !player?.is_host) return sendAck(ack, { error: 'Seul l’hôte peut lancer la partie.' });
        room.status = 'playing';
        room.game_state = gameState && typeof gameState === 'object' ? gameState : {};
        sendAck(ack, { ok: true });
        publishRoom(room);
      });

      socket.on('local:game-state', (patch = {}, ack) => {
        const room = rooms.get(socket.data.roomId);
        const player = room?.players.find((entry) => entry.socket_id === socket.id);
        if (!room || !player?.is_host || !patch || typeof patch !== 'object') {
          return sendAck(ack, { error: 'Mise à jour de partie refusée.' });
        }
        room.game_state = { ...room.game_state, ...patch };
        sendAck(ack, { ok: true });
        publishRoom(room);
      });

      socket.on('local:score', (delta, ack) => {
        const room = rooms.get(socket.data.roomId);
        const player = room?.players.find((entry) => entry.socket_id === socket.id);
        if (!room || !player || !Number.isFinite(delta)) return sendAck(ack, { error: 'Score invalide.' });
        player.score += Math.max(-100_000, Math.min(100_000, Math.trunc(delta)));
        sendAck(ack, { ok: true });
        publishPlayers(room);
      });

      socket.on('local:end', (payload, ack) => {
        const room = rooms.get(socket.data.roomId);
        const player = room?.players.find((entry) => entry.socket_id === socket.id);
        if (!room || !player?.is_host) return sendAck(ack, { error: 'Action réservée à l’hôte.' });
        room.status = 'finished';
        sendAck(ack, { ok: true });
        publishRoom(room);
      });

      socket.on('local:leave', (payload, ack) => {
        const room = rooms.get(socket.data.roomId);
        const player = room?.players.find((entry) => entry.socket_id === socket.id);
        if (room && player?.is_host && room.status === 'lobby') {
          io.to(room.id).emit('local:closed', room.id);
          rooms.delete(room.id);
          socket.data.roomId = null;
          socket.leave(room.id);
        } else {
          removeSocketPlayer(socket);
        }
        sendAck(ack, { ok: true });
      });

      socket.on('disconnect', () => removeSocketPlayer(socket));
    });
  }

  return {
    name: 'wakkany-local-rooms',
    configureServer(server) {
      attach(server.httpServer);
    },
    configurePreviewServer(server) {
      attach(server.httpServer);
    },
  };
}