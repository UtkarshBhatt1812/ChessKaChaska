import { Chess } from "chess.js";
import { GameState, MoveRecord, GameTermination, PlayerColor } from "../types/socket.types";
type TimerState = {
    white: number;
    black: number;
    lastTick: number;
    active: boolean;
};
export declare class GameInstance {
    readonly roomCode: string;
    chess: Chess;
    history: MoveRecord[];
    timers: TimerState;
    drawOfferedBy: PlayerColor | null;
    private timerInterval;
    constructor(roomCode: string, initialSeconds: number);
    startTimers(): void;
    private tick;
    stopTimers(): void;
    getRemainingMs(): {
        white: number;
        black: number;
    };
    isTimeout(): PlayerColor | null;
    getState(): GameState;
    detectTermination(): GameTermination | null;
    getWinner(termination: GameTermination | null): PlayerColor | "draw" | null;
}
export declare class GameManager {
    private games;
    create(roomCode: string, initialSeconds: number): GameInstance;
    get(roomCode: string): GameInstance | undefined;
    delete(roomCode: string): void;
    /**
     * Attempt a move. Returns the move record on success, null if illegal.
     */
    makeMove(roomCode: string, from: string, to: string, promotion?: string): MoveRecord | null;
    resign(roomCode: string, _color: PlayerColor): GameState | null;
}
export declare const gameManager: GameManager;
export {};
//# sourceMappingURL=GameManager.d.ts.map