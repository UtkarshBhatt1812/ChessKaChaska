import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { roomManager } from "../../managers/RoomManager";
import { gameManager } from "../../managers/GameManager";
import { sessionManager } from "../../managers/SessionManager";
import { generateRoomCode } from "../../utils/roomCode";
import { logger } from "../../utils/logger";
import { isRateLimited } from "../../middleware/rateLimiter";
import { getChatHistory } from "./chat.handler";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  CreateRoomPayload,
  JoinRoomPayload,
  ReconnectRoomPayload,
  PlayerColor,
} from "../../types/socket.types";

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AppSocket
) {
  const { userId, username } = socket.data;

  // ── create_room ─────────────────────────────────────────────────────────────
  socket.on("create_room", async (payload: CreateRoomPayload) => {
    if (isRateLimited(socket.id, "create_room")) {
      socket.emit("error", { event: "create_room", message: "Too many rooms created. Please wait." });
      return;
    }

    try {
      const code = await generateRoomCode((c) => !roomManager.hasCode(c));

      const room = roomManager.create(
        code,
        { userId, username, socketId: socket.id, connected: true },
        payload.color,
        payload.timeControl
      );

      const myColor = room.white?.userId === userId ? "white" : "black";

      // Join the Socket.IO room
      await socket.join(code);

      // Track session
      sessionManager.register(userId, socket.id, code, myColor, username, socket.data.isGuest);

      // Start the game instance (not ticking yet — waiting for opponent)
      gameManager.create(code, payload.timeControl.initialSeconds);

      socket.emit("room_created", { room, myColor });
      logger.info(`Room ${code} created by ${username}`);
    } catch (err) {
      logger.error("create_room error", err);
      socket.emit("error", { event: "create_room", message: "Failed to create room." });
    }
  });

  // ── join_room ────────────────────────────────────────────────────────────────
  socket.on("join_room", async (payload: JoinRoomPayload) => {
    if (isRateLimited(socket.id, "join_room")) {
      socket.emit("error", { event: "join_room", message: "Too many join attempts." });
      return;
    }

    const { roomCode } = payload;
    const room = roomManager.get(roomCode);

    if (!room) {
      socket.emit("error", { event: "join_room", message: "Room not found." });
      return;
    }

    // Check if user is already a player (reconnect path)
    const existingColor = roomManager.getPlayerColor(roomCode, userId);
    if (existingColor) {
      // Treat as reconnect
      return handleReconnect(io, socket, { roomCode });
    }

    // Try joining as player
    const color = roomManager.joinAsPlayer(roomCode, {
      userId,
      username,
      socketId: socket.id,
      connected: true,
    });

    await socket.join(roomCode);

    if (color) {
      // Joined as player
      sessionManager.register(userId, socket.id, roomCode, color, username, socket.data.isGuest);

      const updatedRoom = roomManager.get(roomCode)!;

      // Both players present → start the game + timers
      if (updatedRoom.white && updatedRoom.black) {
        roomManager.setStatus(roomCode, "active");
        const game = gameManager.get(roomCode);
        if (game) {
          game.startTimers(
            (gameState) => {
              io.to(roomCode).emit("game_state", gameState);
            },
            (timedOut) => {
              const gameState = game.getState();
              const winner = timedOut === "white" ? "black" : "white";

              roomManager.setStatus(roomCode, "completed");
              io.to(roomCode).emit("game_over", {
                gameState,
                winner,
                termination: "timeout",
              });
              logger.info(`Game over in ${roomCode}: timeout, winner: ${winner}`);
            }
          );
        }

        // Notify the joining player with their assigned color
        socket.emit("player_joined", {
          player: { userId, username, socketId: socket.id, color, connected: true },
          room: updatedRoom,
          myColor: color,
        });

        // Notify the other player(s) in the room (no myColor for them)
        socket.to(roomCode).emit("player_joined", {
          player: { userId, username, socketId: socket.id, color, connected: true },
          room: updatedRoom,
        });

        // Broadcast initial game state to all in room
        io.to(roomCode).emit("game_state", gameManager.get(roomCode)!.getState());
      } else {
        socket.emit("player_joined", {
          player: { userId, username, socketId: socket.id, color, connected: true },
          room: updatedRoom,
          myColor: color,
        });
      }

      logger.info(`${username} joined room ${roomCode} as ${color}`);
    } else {
      // Room is full → join as spectator
      const joined = roomManager.joinAsSpectator(roomCode, {
        userId,
        username,
        socketId: socket.id,
      });

      if (!joined) {
        socket.emit("error", { event: "join_room", message: "Already in this room." });
        return;
      }

      const updatedRoom = roomManager.get(roomCode)!;

      const gameState = gameManager.get(roomCode)!.getState();

      io.to(roomCode).emit("spectator_joined", {
        spectator: { userId, username, socketId: socket.id },
        spectatorCount: updatedRoom.spectators.length,
        room: updatedRoom,
        gameState,
      });

      logger.info(`${username} joined room ${roomCode} as spectator`);
    }
  });

  // ── reconnect_room ───────────────────────────────────────────────────────────
  socket.on("reconnect_room", (payload: ReconnectRoomPayload) => {
    handleReconnect(io, socket, payload);
  });

  // ── leave_room ───────────────────────────────────────────────────────────────
  socket.on("leave_room", (payload: { roomCode: string }) => {
    const { roomCode } = payload;
    handleLeave(io, socket, roomCode);
  });
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function handleReconnect(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AppSocket,
  payload: ReconnectRoomPayload
) {
  const { roomCode } = payload;
  const { userId, username } = socket.data;

  const room = roomManager.get(roomCode);
  if (!room) {
    socket.emit("reconnect_failed", { reason: "Room no longer exists." });
    return;
  }

  const color = roomManager.getPlayerColor(roomCode, userId);
  if (!color) {
    socket.emit("reconnect_failed", { reason: "You are not a player in this room." });
    return;
  }

  // Update socket ID in room and session
  roomManager.markReconnected(roomCode, userId, socket.id);
  sessionManager.updateSocketId(userId, socket.id);

  socket.join(roomCode);

  const game = gameManager.get(roomCode);
  const gameState = game ? game.getState() : null;
  const chatHistory = getChatHistory(roomCode);

  if (!gameState) {
    socket.emit("reconnect_failed", { reason: "Game state not found." });
    return;
  }

  socket.emit("reconnect_success", {
    room,
    gameState,
    myColor: color,
    chatHistory,
  });

  // Notify others
  socket.to(roomCode).emit("player_reconnected", { color, username });
  logger.info(`${username} reconnected to room ${roomCode}`);
}

export function handleLeave(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AppSocket,
  roomCode: string
) {
  const { userId } = socket.data;

  const color = roomManager.getPlayerColor(roomCode, userId);
  roomManager.removePlayer(roomCode, userId);
  socket.leave(roomCode);
  sessionManager.unregisterSocket(socket.id);

  if (color) {
    socket.to(roomCode).emit("player_disconnected", {
      color,
      username: socket.data.username,
    });
  }

  if (roomManager.isEmpty(roomCode)) {
    gameManager.delete(roomCode);
    roomManager.delete(roomCode);
    logger.info(`Room ${roomCode} cleaned up (empty)`);
  }
}
