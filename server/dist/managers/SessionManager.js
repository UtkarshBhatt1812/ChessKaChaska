"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionManager = exports.SessionManager = void 0;
/**
 * In-memory session store: userId → Session
 * This allows reconnect: old socketId gone, new socket maps to same userId.
 */
class SessionManager {
    constructor() {
        this.byUser = new Map();
        this.bySocket = new Map(); // socketId → userId
    }
    register(userId, socketId, roomCode, color, username, isGuest) {
        const session = { socketId, roomCode, color, username, isGuest };
        this.byUser.set(userId, session);
        this.bySocket.set(socketId, userId);
    }
    unregisterSocket(socketId) {
        const userId = this.bySocket.get(socketId);
        if (userId) {
            // Don't remove byUser entry — keep for reconnect within grace period
            this.bySocket.delete(socketId);
        }
        return userId;
    }
    findBySocket(socketId) {
        const userId = this.bySocket.get(socketId);
        if (!userId)
            return null;
        const session = this.byUser.get(userId);
        if (!session)
            return null;
        return { userId, session };
    }
    findByUser(userId) {
        return this.byUser.get(userId) ?? null;
    }
    updateSocketId(userId, newSocketId) {
        const session = this.byUser.get(userId);
        if (!session)
            return;
        // Remove old mapping
        this.bySocket.delete(session.socketId);
        // Update
        session.socketId = newSocketId;
        this.bySocket.set(newSocketId, userId);
    }
    removeUser(userId) {
        const session = this.byUser.get(userId);
        if (session) {
            this.bySocket.delete(session.socketId);
            this.byUser.delete(userId);
        }
    }
}
exports.SessionManager = SessionManager;
exports.sessionManager = new SessionManager();
//# sourceMappingURL=SessionManager.js.map