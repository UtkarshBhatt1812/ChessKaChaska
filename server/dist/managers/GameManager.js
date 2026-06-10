"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameManager = exports.GameManager = exports.GameInstance = void 0;
const chess_js_1 = require("chess.js");
const PIECE_SYMBOLS = {
    p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚",
};
function extractCaptured(chess) {
    const board = chess.board();
    const remaining = { P: 8, N: 2, B: 2, R: 2, Q: 1, K: 1, p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    for (const row of board) {
        for (const sq of row) {
            if (!sq)
                continue;
            const key = sq.color === "w" ? sq.type.toUpperCase() : sq.type;
            remaining[key] = (remaining[key] || 0) - 1;
        }
    }
    const white = [];
    const black = [];
    for (const [key, count] of Object.entries(remaining)) {
        if (count <= 0)
            continue;
        const symbol = PIECE_SYMBOLS[key.toLowerCase()];
        const isWhitePiece = key === key.toUpperCase();
        // pieces captured BY white = black pieces missing, captured BY black = white pieces missing
        if (isWhitePiece) {
            for (let i = 0; i < count; i++)
                black.push(symbol);
        }
        else {
            for (let i = 0; i < count; i++)
                white.push(symbol);
        }
    }
    return { white, black };
}
class GameInstance {
    constructor(roomCode, initialSeconds) {
        this.history = [];
        this.drawOfferedBy = null;
        this.timerInterval = null;
        this.roomCode = roomCode;
        this.chess = new chess_js_1.Chess();
        this.timers = {
            white: initialSeconds * 1000,
            black: initialSeconds * 1000,
            lastTick: Date.now(),
            active: false,
        };
    }
    startTimers() {
        this.timers.active = true;
        this.timers.lastTick = Date.now();
        this.timerInterval = setInterval(() => this.tick(), 100);
    }
    tick() {
        if (!this.timers.active || this.chess.isGameOver()) {
            this.stopTimers();
            return;
        }
        const now = Date.now();
        const elapsed = now - this.timers.lastTick;
        this.timers.lastTick = now;
        if (this.chess.turn() === "w") {
            this.timers.white = Math.max(0, this.timers.white - elapsed);
        }
        else {
            this.timers.black = Math.max(0, this.timers.black - elapsed);
        }
    }
    stopTimers() {
        this.timers.active = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    getRemainingMs() {
        const { white, black, active, lastTick } = this.timers;
        if (!active)
            return { white, black };
        const elapsed = Date.now() - lastTick;
        return {
            white: this.chess.turn() === "w" ? Math.max(0, white - elapsed) : white,
            black: this.chess.turn() === "b" ? Math.max(0, black - elapsed) : black,
        };
    }
    isTimeout() {
        const { white, black } = this.getRemainingMs();
        if (white <= 0)
            return "white";
        if (black <= 0)
            return "black";
        return null;
    }
    getState() {
        const timers = this.getRemainingMs();
        const termination = this.detectTermination();
        return {
            fen: this.chess.fen(),
            pgn: this.chess.pgn(),
            history: this.history,
            turn: this.chess.turn(),
            capturedPieces: extractCaptured(this.chess),
            timers,
            isCheck: this.chess.isCheck(),
            isCheckmate: this.chess.isCheckmate(),
            isStalemate: this.chess.isStalemate(),
            isDraw: this.chess.isDraw(),
            isGameOver: this.chess.isGameOver() || !!this.isTimeout(),
            termination: termination ?? undefined,
            winner: this.getWinner(termination),
        };
    }
    detectTermination() {
        if (this.isTimeout())
            return "timeout";
        if (this.chess.isCheckmate())
            return "checkmate";
        if (this.chess.isStalemate())
            return "stalemate";
        if (this.chess.isThreefoldRepetition())
            return "repetition";
        if (this.chess.isInsufficientMaterial())
            return "insufficient_material";
        if (this.chess.isDraw())
            return "fifty_move_rule";
        return null;
    }
    getWinner(termination) {
        if (!termination)
            return null;
        if (["stalemate", "repetition", "insufficient_material", "fifty_move_rule", "draw_agreement"].includes(termination))
            return "draw";
        if (termination === "timeout") {
            const timedOut = this.isTimeout();
            return timedOut === "white" ? "black" : "white";
        }
        if (termination === "checkmate") {
            // The side whose turn it is is checkmated → they lose
            return this.chess.turn() === "w" ? "black" : "white";
        }
        if (termination === "resignation")
            return null; // caller must specify
        return null;
    }
}
exports.GameInstance = GameInstance;
class GameManager {
    constructor() {
        this.games = new Map();
    }
    create(roomCode, initialSeconds) {
        const game = new GameInstance(roomCode, initialSeconds);
        this.games.set(roomCode, game);
        return game;
    }
    get(roomCode) {
        return this.games.get(roomCode);
    }
    delete(roomCode) {
        const game = this.games.get(roomCode);
        if (game) {
            game.stopTimers();
            this.games.delete(roomCode);
        }
    }
    /**
     * Attempt a move. Returns the move record on success, null if illegal.
     */
    makeMove(roomCode, from, to, promotion) {
        const game = this.games.get(roomCode);
        if (!game || game.chess.isGameOver())
            return null;
        try {
            const result = game.chess.move({ from, to, promotion: promotion || "q" });
            if (!result)
                return null;
            const record = {
                ply: game.history.length + 1,
                san: result.san,
                uci: `${result.from}${result.to}${result.promotion || ""}`,
                fenAfter: game.chess.fen(),
                color: result.color === "w" ? "white" : "black",
                timestamp: Date.now(),
            };
            game.history.push(record);
            return record;
        }
        catch {
            return null;
        }
    }
    resign(roomCode, _color) {
        const game = this.games.get(roomCode);
        if (!game)
            return null;
        game.stopTimers();
        return game.getState();
    }
}
exports.GameManager = GameManager;
exports.gameManager = new GameManager();
//# sourceMappingURL=GameManager.js.map