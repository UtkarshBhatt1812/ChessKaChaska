import { PlayerColor } from "../types/socket.types";

type Session = {
  socketId: string;
  roomCode: string;
  color: PlayerColor;
  username: string;
  isGuest: boolean;
};

/**
 * In-memory session store: userId → Session
 * This allows reconnect: old socketId gone, new socket maps to same userId.
 */
export class SessionManager {
  private byUser = new Map<string, Session>();
  private bySocket = new Map<string, string>(); // socketId → userId

  register(
    userId: string,
    socketId: string,
    roomCode: string,
    color: PlayerColor,
    username: string,
    isGuest: boolean
  ) {
    const session: Session = { socketId, roomCode, color, username, isGuest };
    this.byUser.set(userId, session);
    this.bySocket.set(socketId, userId);
  }

  unregisterSocket(socketId: string) {
    const userId = this.bySocket.get(socketId);
    if (userId) {
      // Don't remove byUser entry — keep for reconnect within grace period
      this.bySocket.delete(socketId);
    }
    return userId;
  }

  findBySocket(socketId: string): { userId: string; session: Session } | null {
    const userId = this.bySocket.get(socketId);
    if (!userId) return null;
    const session = this.byUser.get(userId);
    if (!session) return null;
    return { userId, session };
  }

  findByUser(userId: string): Session | null {
    return this.byUser.get(userId) ?? null;
  }

  updateSocketId(userId: string, newSocketId: string) {
    const session = this.byUser.get(userId);
    if (!session) return;
    // Remove old mapping
    this.bySocket.delete(session.socketId);
    // Update
    session.socketId = newSocketId;
    this.bySocket.set(newSocketId, userId);
  }

  removeUser(userId: string) {
    const session = this.byUser.get(userId);
    if (session) {
      this.bySocket.delete(session.socketId);
      this.byUser.delete(userId);
    }
  }
}

export const sessionManager = new SessionManager();
