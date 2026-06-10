"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoomHandlers = registerRoomHandlers;
exports.handleLeave = handleLeave;
const RoomManager_1 = require("../../managers/RoomManager");
const GameManager_1 = require("../../managers/GameManager");
const SessionManager_1 = require("../../managers/SessionManager");
const roomCode_1 = require("../../utils/roomCode");
const logger_1 = require("../../utils/logger");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const chat_handler_1 = require("./chat.handler");
function registerRoomHandlers(io, socket) {
    const { userId, username } = socket.data;
    // ── create_room ─────────────────────────────────────────────────────────────
    socket.on("create_room", async (payload) => {
        if ((0, rateLimiter_1.isRateLimited)(socket.id, "create_room")) {
            socket.emit("error", { event: "create_room", message: "Too many rooms created. Please wait." });
            return;
        }
        try {
            const code = await (0, roomCode_1.generateRoomCode)((c) => !RoomManager_1.roomManager.hasCode(c));
            const room = RoomManager_1.roomManager.create(code, { userId, username, socketId: socket.id, connected: true }, payload.color, payload.timeControl);
            const myColor = room.white?.userId === userId ? "white" : "black";
            // Join the Socket.IO room
            await socket.join(code);
            // Track session
            SessionManager_1.sessionManager.register(userId, socket.id, code, myColor, username, socket.data.isGuest);
            // Start the game instance (not ticking yet — waiting for opponent)
            GameManager_1.gameManager.create(code, payload.timeControl.initialSeconds);
            socket.emit("room_created", { room, myColor });
            logger_1.logger.info(`Room ${code} created by ${username}`);
        }
        catch (err) {
            logger_1.logger.error("create_room error", err);
            socket.emit("error", { event: "create_room", message: "Failed to create room." });
        }
    });
    // ── join_room ────────────────────────────────────────────────────────────────
    socket.on("join_room", async (payload) => {
        if ((0, rateLimiter_1.isRateLimited)(socket.id, "join_room")) {
            socket.emit("error", { event: "join_room", message: "Too many join attempts." });
            return;
        }
        const { roomCode } = payload;
        const room = RoomManager_1.roomManager.get(roomCode);
        if (!room) {
            socket.emit("error", { event: "join_room", message: "Room not found." });
            return;
        }
        // Check if user is already a player (reconnect path)
        const existingColor = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
        if (existingColor) {
            // Treat as reconnect
            return handleReconnect(io, socket, { roomCode });
        }
        // Try joining as player
        const color = RoomManager_1.roomManager.joinAsPlayer(roomCode, {
            userId,
            username,
            socketId: socket.id,
            connected: true,
        });
        await socket.join(roomCode);
        if (color) {
            // Joined as player
            SessionManager_1.sessionManager.register(userId, socket.id, roomCode, color, username, socket.data.isGuest);
            const updatedRoom = RoomManager_1.roomManager.get(roomCode);
            // Both players present → start the game + timers
            if (updatedRoom.white && updatedRoom.black) {
                RoomManager_1.roomManager.setStatus(roomCode, "active");
                const game = GameManager_1.gameManager.get(roomCode);
                if (game)
                    game.startTimers();
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
                io.to(roomCode).emit("game_state", GameManager_1.gameManager.get(roomCode).getState());
            }
            else {
                socket.emit("player_joined", {
                    player: { userId, username, socketId: socket.id, color, connected: true },
                    room: updatedRoom,
                    myColor: color,
                });
            }
            logger_1.logger.info(`${username} joined room ${roomCode} as ${color}`);
        }
        else {
            // Room is full → join as spectator
            const joined = RoomManager_1.roomManager.joinAsSpectator(roomCode, {
                userId,
                username,
                socketId: socket.id,
            });
            if (!joined) {
                socket.emit("error", { event: "join_room", message: "Already in this room." });
                return;
            }
            const updatedRoom = RoomManager_1.roomManager.get(roomCode);
            socket.emit("game_state", GameManager_1.gameManager.get(roomCode).getState());
            io.to(roomCode).emit("spectator_joined", {
                spectator: { userId, username, socketId: socket.id },
                spectatorCount: updatedRoom.spectators.length,
            });
            logger_1.logger.info(`${username} joined room ${roomCode} as spectator`);
        }
    });
    // ── reconnect_room ───────────────────────────────────────────────────────────
    socket.on("reconnect_room", (payload) => {
        handleReconnect(io, socket, payload);
    });
    // ── leave_room ───────────────────────────────────────────────────────────────
    socket.on("leave_room", (payload) => {
        const { roomCode } = payload;
        handleLeave(io, socket, roomCode);
    });
}
// ── Shared helpers ─────────────────────────────────────────────────────────────
function handleReconnect(io, socket, payload) {
    const { roomCode } = payload;
    const { userId, username } = socket.data;
    const room = RoomManager_1.roomManager.get(roomCode);
    if (!room) {
        socket.emit("reconnect_failed", { reason: "Room no longer exists." });
        return;
    }
    const color = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
    if (!color) {
        socket.emit("reconnect_failed", { reason: "You are not a player in this room." });
        return;
    }
    // Update socket ID in room and session
    RoomManager_1.roomManager.markReconnected(roomCode, userId, socket.id);
    SessionManager_1.sessionManager.updateSocketId(userId, socket.id);
    socket.join(roomCode);
    const game = GameManager_1.gameManager.get(roomCode);
    const gameState = game ? game.getState() : null;
    const chatHistory = (0, chat_handler_1.getChatHistory)(roomCode);
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
    logger_1.logger.info(`${username} reconnected to room ${roomCode}`);
}
function handleLeave(io, socket, roomCode) {
    const { userId } = socket.data;
    const color = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
    RoomManager_1.roomManager.removePlayer(roomCode, userId);
    socket.leave(roomCode);
    SessionManager_1.sessionManager.unregisterSocket(socket.id);
    if (color) {
        socket.to(roomCode).emit("player_disconnected", {
            color,
            username: socket.data.username,
        });
    }
    if (RoomManager_1.roomManager.isEmpty(roomCode)) {
        GameManager_1.gameManager.delete(roomCode);
        RoomManager_1.roomManager.delete(roomCode);
        logger_1.logger.info(`Room ${roomCode} cleaned up (empty)`);
    }
}
//# sourceMappingURL=room.handler.js.map