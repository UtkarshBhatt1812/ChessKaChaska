"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomManager = exports.RoomManager = void 0;
const env_1 = require("../config/env");
class RoomManager {
    constructor() {
        this.rooms = new Map();
        // Periodically garbage-collect abandoned/expired rooms
        this.cleanupInterval = setInterval(() => this.cleanup(), env_1.config.roomCleanupIntervalMs);
    }
    create(code, host, preferredColor, timeControl) {
        const hostColor = preferredColor || (Math.random() < 0.5 ? "white" : "black");
        const player = { ...host, color: hostColor, connected: true };
        const room = {
            code,
            white: hostColor === "white" ? player : null,
            black: hostColor === "black" ? player : null,
            spectators: [],
            status: "waiting",
            gameId: null,
            createdAt: Date.now(),
            timeControl,
        };
        this.rooms.set(code, room);
        return room;
    }
    get(code) {
        return this.rooms.get(code);
    }
    has(code) {
        return this.rooms.has(code);
    }
    hasCode(code) {
        return this.rooms.has(code);
    }
    /**
     * Join a room as a player. Returns assigned color, or null if room is full.
     */
    joinAsPlayer(code, player) {
        const room = this.rooms.get(code);
        if (!room)
            return null;
        if (!room.white) {
            room.white = { ...player, color: "white", connected: true };
            if (room.black)
                room.status = "ready";
            return "white";
        }
        if (!room.black) {
            room.black = { ...player, color: "black", connected: true };
            if (room.white)
                room.status = "ready";
            return "black";
        }
        return null; // room full — join as spectator instead
    }
    joinAsSpectator(code, spectator) {
        const room = this.rooms.get(code);
        if (!room)
            return false;
        // Don't double-add
        if (room.spectators.some((s) => s.userId === spectator.userId)) {
            return false;
        }
        room.spectators.push(spectator);
        return true;
    }
    setStatus(code, status) {
        const room = this.rooms.get(code);
        if (room)
            room.status = status;
    }
    setGameId(code, gameId) {
        const room = this.rooms.get(code);
        if (room)
            room.gameId = gameId;
    }
    markDisconnected(code, userId) {
        const room = this.rooms.get(code);
        if (!room)
            return;
        for (const side of ["white", "black"]) {
            const player = room[side];
            if (player?.userId === userId) {
                player.connected = false;
                player.disconnectedAt = Date.now();
            }
        }
    }
    markReconnected(code, userId, newSocketId) {
        const room = this.rooms.get(code);
        if (!room)
            return;
        for (const side of ["white", "black"]) {
            const player = room[side];
            if (player?.userId === userId) {
                player.connected = true;
                player.socketId = newSocketId;
                player.disconnectedAt = undefined;
            }
        }
    }
    removePlayer(code, userId) {
        const room = this.rooms.get(code);
        if (!room)
            return null;
        for (const side of ["white", "black"]) {
            if (room[side]?.userId === userId) {
                room[side] = null;
                return side;
            }
        }
        // Try spectators
        const idx = room.spectators.findIndex((s) => s.userId === userId);
        if (idx !== -1)
            room.spectators.splice(idx, 1);
        return null;
    }
    removeSpectatorBySocket(socketId) {
        for (const [code, room] of this.rooms.entries()) {
            const idx = room.spectators.findIndex((s) => s.socketId === socketId);
            if (idx !== -1) {
                room.spectators.splice(idx, 1);
                return code;
            }
        }
        return null;
    }
    getPlayerColor(code, userId) {
        const room = this.rooms.get(code);
        if (!room)
            return null;
        if (room.white?.userId === userId)
            return "white";
        if (room.black?.userId === userId)
            return "black";
        return null;
    }
    isPlayerInRoom(code, userId) {
        return this.getPlayerColor(code, userId) !== null;
    }
    isEmpty(code) {
        const room = this.rooms.get(code);
        if (!room)
            return true;
        return !room.white && !room.black && room.spectators.length === 0;
    }
    delete(code) {
        this.rooms.delete(code);
    }
    getAllCodes() {
        return Array.from(this.rooms.keys());
    }
    getRoomCount() {
        return this.rooms.size;
    }
    cleanup() {
        const now = Date.now();
        const GRACE = env_1.config.roomDisconnectGracePeriodMs;
        const MAX_IDLE = 1000 * 60 * 60; // 1 hour
        for (const [code, room] of this.rooms.entries()) {
            // Remove rooms where both players have been disconnected beyond grace period
            if ((room.status === "waiting" || room.status === "abandoned") &&
                now - room.createdAt > MAX_IDLE) {
                this.rooms.delete(code);
                continue;
            }
            const whiteGone = room.white?.connected === false &&
                room.white.disconnectedAt != null &&
                now - room.white.disconnectedAt > GRACE;
            const blackGone = room.black?.connected === false &&
                room.black.disconnectedAt != null &&
                now - room.black.disconnectedAt > GRACE;
            if (whiteGone && blackGone) {
                room.status = "abandoned";
                this.rooms.delete(code);
            }
        }
    }
    destroy() {
        clearInterval(this.cleanupInterval);
    }
}
exports.RoomManager = RoomManager;
exports.roomManager = new RoomManager();
//# sourceMappingURL=RoomManager.js.map