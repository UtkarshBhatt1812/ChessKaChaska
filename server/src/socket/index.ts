import { Server } from "socket.io";
import http from "http";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { socketAuthMiddleware } from "../middleware/auth.middleware";
import { clearSocketLimits } from "../middleware/rateLimiter";
import { sessionManager } from "../managers/SessionManager";
import { roomManager } from "../managers/RoomManager";
import { gameManager } from "../managers/GameManager";
import { registerRoomHandlers, handleLeave } from "./handlers/room.handler";
import { registerGameHandlers } from "./handlers/game.handler";
import { registerChatHandlers } from "./handlers/chat.handler";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket.types";

export function createSocketServer(
  httpServer: http.Server
): Server<ClientToServerEvents, ServerToClientEvents> {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>(
    httpServer,
    {
      cors: {
        origin: config.corsOrigin,
        methods: ["GET", "POST"],
        credentials: true,
      },
      // Redis adapter can be plugged in here:
      // adapter: createAdapter(pubClient, subClient),
      pingTimeout: 20000,
      pingInterval: 10000,
      connectionStateRecovery: {
        maxDisconnectionDuration: config.roomDisconnectGracePeriodMs,
        skipMiddlewares: true,
      },
    }
  );

  // ── Middleware ────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  io.use(socketAuthMiddleware as any);

  // ── Connection ────────────────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const { userId, username, isGuest } = socket.data;
    logger.debug(`Socket connected: ${socket.id} | ${username} (${isGuest ? "guest" : "auth"})`);

    // Register all handlers
    registerRoomHandlers(io, socket as Parameters<typeof registerRoomHandlers>[1]);
    registerGameHandlers(io, socket as Parameters<typeof registerGameHandlers>[1]);
    registerChatHandlers(io, socket as Parameters<typeof registerChatHandlers>[1]);

    // ── Disconnect ──────────────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} | ${username} | reason: ${reason}`);

      // Find which room this socket was in
      const session = sessionManager.findBySocket(socket.id);
      if (session) {
        const { roomCode, color } = session.session;
        roomManager.markDisconnected(roomCode, userId);
        socket.to(roomCode).emit("player_disconnected", { color, username });
      } else {
        const roomCode = roomManager.removeSpectatorBySocket(socket.id);
        if (roomCode) {
          const room = roomManager.get(roomCode);
          if (room) {
            socket.to(roomCode).emit("spectator_joined", {
              spectator: { userId, username, socketId: socket.id },
              spectatorCount: room.spectators.length,
              room,
            });
          }
        }
      }

      sessionManager.unregisterSocket(socket.id);
      clearSocketLimits(socket.id);
    });
  });

  logger.info(
    `Socket.IO server initialised. CORS origins: ${config.corsOrigin.join(", ")}`
  );

  return io;
}
