import { PlayerColor, PlayerInfo, RoomState, RoomStatus, SpectatorInfo, TimeControl } from "../types/socket.types";
export declare class RoomManager {
    private rooms;
    private cleanupInterval;
    constructor();
    create(code: string, host: Omit<PlayerInfo, "color">, preferredColor: PlayerColor | undefined, timeControl: TimeControl): RoomState;
    get(code: string): RoomState | undefined;
    has(code: string): boolean;
    hasCode(code: string): boolean;
    /**
     * Join a room as a player. Returns assigned color, or null if room is full.
     */
    joinAsPlayer(code: string, player: Omit<PlayerInfo, "color">): PlayerColor | null;
    joinAsSpectator(code: string, spectator: SpectatorInfo): boolean;
    setStatus(code: string, status: RoomStatus): void;
    setGameId(code: string, gameId: string): void;
    markDisconnected(code: string, userId: string): void;
    markReconnected(code: string, userId: string, newSocketId: string): void;
    removePlayer(code: string, userId: string): PlayerColor | null;
    removeSpectatorBySocket(socketId: string): string | null;
    getPlayerColor(code: string, userId: string): PlayerColor | null;
    isPlayerInRoom(code: string, userId: string): boolean;
    isEmpty(code: string): boolean;
    delete(code: string): void;
    getAllCodes(): string[];
    getRoomCount(): number;
    private cleanup;
    destroy(): void;
}
export declare const roomManager: RoomManager;
//# sourceMappingURL=RoomManager.d.ts.map