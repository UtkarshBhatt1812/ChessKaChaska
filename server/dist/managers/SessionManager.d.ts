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
export declare class SessionManager {
    private byUser;
    private bySocket;
    register(userId: string, socketId: string, roomCode: string, color: PlayerColor, username: string, isGuest: boolean): void;
    unregisterSocket(socketId: string): string | undefined;
    findBySocket(socketId: string): {
        userId: string;
        session: Session;
    } | null;
    findByUser(userId: string): Session | null;
    updateSocketId(userId: string, newSocketId: string): void;
    removeUser(userId: string): void;
}
export declare const sessionManager: SessionManager;
export {};
//# sourceMappingURL=SessionManager.d.ts.map