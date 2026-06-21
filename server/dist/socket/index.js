"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocketServer = createSocketServer;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const SessionManager_1 = require("../managers/SessionManager");
const RoomManager_1 = require("../managers/RoomManager");
const room_handler_1 = require("./handlers/room.handler");
const game_handler_1 = require("./handlers/game.handler");
const chat_handler_1 = require("./handlers/chat.handler");
function createSocketServer(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.config.corsOrigin,
            methods: ["GET", "POST"],
            credentials: true,
        },
        // Redis adapter can be plugged in here:
        // adapter: createAdapter(pubClient, subClient),
        pingTimeout: 20000,
        pingInterval: 10000,
        connectionStateRecovery: {
            maxDisconnectionDuration: env_1.config.roomDisconnectGracePeriodMs,
            skipMiddlewares: true,
        },
    });
    // ── Middleware ────────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    io.use(auth_middleware_1.socketAuthMiddleware);
    // ── Connection ────────────────────────────────────────────────────────────────
    io.on("connection", (socket) => {
        const { userId, username, isGuest } = socket.data;
        logger_1.logger.debug(`Socket connected: ${socket.id} | ${username} (${isGuest ? "guest" : "auth"})`);
        // Register all handlers
        (0, room_handler_1.registerRoomHandlers)(io, socket);
        (0, game_handler_1.registerGameHandlers)(io, socket);
        (0, chat_handler_1.registerChatHandlers)(io, socket);
        // ── Disconnect ──────────────────────────────────────────────────────────────
        socket.on("disconnect", (reason) => {
            logger_1.logger.debug(`Socket disconnected: ${socket.id} | ${username} | reason: ${reason}`);
            // Find which room this socket was in
            const session = SessionManager_1.sessionManager.findBySocket(socket.id);
            if (session) {
                const { roomCode, color } = session.session;
                RoomManager_1.roomManager.markDisconnected(roomCode, userId);
                socket.to(roomCode).emit("player_disconnected", { color, username });
            }
            else {
                const roomCode = RoomManager_1.roomManager.removeSpectatorBySocket(socket.id);
                if (roomCode) {
                    const room = RoomManager_1.roomManager.get(roomCode);
                    if (room) {
                        socket.to(roomCode).emit("spectator_joined", {
                            spectator: { userId, username, socketId: socket.id },
                            spectatorCount: room.spectators.length,
                            room,
                        });
                    }
                }
            }
            SessionManager_1.sessionManager.unregisterSocket(socket.id);
            (0, rateLimiter_1.clearSocketLimits)(socket.id);
        });
    });
    logger_1.logger.info(`Socket.IO server initialised. CORS origins: ${env_1.config.corsOrigin.join(", ")}`);
    return io;
}
//# sourceMappingURL=index.js.map