"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGameHandlers = registerGameHandlers;
const RoomManager_1 = require("../../managers/RoomManager");
const GameManager_1 = require("../../managers/GameManager");
const logger_1 = require("../../utils/logger");
const rateLimiter_1 = require("../../middleware/rateLimiter");
function registerGameHandlers(io, socket) {
    const { userId, username } = socket.data;
    // ── make_move ────────────────────────────────────────────────────────────────
    socket.on("make_move", (payload) => {
        if ((0, rateLimiter_1.isRateLimited)(socket.id, "make_move")) {
            socket.emit("error", { event: "make_move", message: "Moving too fast." });
            return;
        }
        const { roomCode, from, to, promotion } = payload;
        const room = RoomManager_1.roomManager.get(roomCode);
        if (!room || room.status !== "active") {
            socket.emit("illegal_move", { from, to, reason: "Game is not active." });
            return;
        }
        // Validate it's the right player's turn
        const playerColor = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
        if (!playerColor) {
            socket.emit("illegal_move", { from, to, reason: "Spectators cannot make moves." });
            return;
        }
        const game = GameManager_1.gameManager.get(roomCode);
        if (!game) {
            socket.emit("illegal_move", { from, to, reason: "Game not found." });
            return;
        }
        const expectedColor = game.chess.turn() === "w" ? "white" : "black";
        if (playerColor !== expectedColor) {
            socket.emit("illegal_move", { from, to, reason: "Not your turn." });
            return;
        }
        const timedOut = game.isTimeout();
        if (timedOut) {
            finishGame(io, roomCode, "timeout", timedOut === "white" ? "black" : "white");
            return;
        }
        const moveRecord = GameManager_1.gameManager.makeMove(roomCode, from, to, promotion);
        if (!moveRecord) {
            socket.emit("illegal_move", { from, to, reason: "Illegal move." });
            return;
        }
        const gameState = game.getState();
        io.to(roomCode).emit("move_made", { move: moveRecord, gameState });
        // Check if game is over
        const termination = game.detectTermination();
        if (termination) {
            const winner = game.getWinner(termination);
            game.stopTimers();
            RoomManager_1.roomManager.setStatus(roomCode, "completed");
            io.to(roomCode).emit("game_over", { gameState, winner, termination });
            logger_1.logger.info(`Game over in ${roomCode}: ${termination}, winner: ${winner ?? "none"}`);
        }
    });
    // ── resign ───────────────────────────────────────────────────────────────────
    socket.on("resign", (payload) => {
        if ((0, rateLimiter_1.isRateLimited)(socket.id, "resign"))
            return;
        const { roomCode } = payload;
        const color = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
        if (!color)
            return;
        const winner = color === "white" ? "black" : "white";
        finishGame(io, roomCode, "resignation", winner);
        io.to(roomCode).emit("resign", { color });
        logger_1.logger.info(`${username} (${color}) resigned in room ${roomCode}`);
    });
    // ── draw_offer ───────────────────────────────────────────────────────────────
    socket.on("draw_offer", (payload) => {
        if ((0, rateLimiter_1.isRateLimited)(socket.id, "draw_offer")) {
            socket.emit("error", { event: "draw_offer", message: "Draw offer cooldown active." });
            return;
        }
        const { roomCode } = payload;
        const color = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
        if (!color)
            return;
        const game = GameManager_1.gameManager.get(roomCode);
        if (!game)
            return;
        game.drawOfferedBy = color;
        // Broadcast draw offer to opponent
        socket.to(roomCode).emit("draw_offer", { fromColor: color });
        logger_1.logger.info(`${username} offered draw in room ${roomCode}`);
    });
    // ── draw_response ─────────────────────────────────────────────────────────────
    socket.on("draw_response", (payload) => {
        const { roomCode, accepted } = payload;
        const color = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
        if (!color)
            return;
        const game = GameManager_1.gameManager.get(roomCode);
        if (!game || !game.drawOfferedBy || game.drawOfferedBy === color) {
            socket.emit("error", { event: "draw_response", message: "No pending draw offer for you." });
            return;
        }
        game.drawOfferedBy = null;
        if (accepted) {
            finishGame(io, roomCode, "draw_agreement", null);
            logger_1.logger.info(`Draw agreed in room ${roomCode}`);
        }
        else {
            // Notify the offering player that draw was declined
            socket.to(roomCode).emit("error", {
                event: "draw_offer",
                message: "Draw offer declined.",
            });
        }
    });
    // ── rematch_request ─────────────────────────────────────────────────────────
    socket.on("rematch_request", (payload) => {
        if ((0, rateLimiter_1.isRateLimited)(socket.id, "rematch_request"))
            return;
        const { roomCode } = payload;
        const room = RoomManager_1.roomManager.get(roomCode);
        if (!room || room.status !== "completed") {
            socket.emit("error", { event: "rematch_request", message: "Game is not completed." });
            return;
        }
        const color = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
        if (!color)
            return;
        const game = GameManager_1.gameManager.get(roomCode);
        if (!game)
            return;
        game.rematchRequestedBy = color;
        // Notify opponent
        socket.to(roomCode).emit("rematch_request", { fromColor: color });
        logger_1.logger.info(`${username} (${color}) requested rematch in room ${roomCode}`);
    });
    // ── rematch_response ────────────────────────────────────────────────────────
    socket.on("rematch_response", (payload) => {
        const { roomCode, accepted } = payload;
        const color = RoomManager_1.roomManager.getPlayerColor(roomCode, userId);
        if (!color)
            return;
        const game = GameManager_1.gameManager.get(roomCode);
        if (!game || !game.rematchRequestedBy || game.rematchRequestedBy === color) {
            socket.emit("error", { event: "rematch_response", message: "No pending rematch request." });
            return;
        }
        if (!accepted) {
            game.rematchRequestedBy = null;
            socket.to(roomCode).emit("error", {
                event: "rematch_request",
                message: "Rematch declined.",
            });
            return;
        }
        // Accepted: reset the game
        game.reset();
        RoomManager_1.roomManager.setStatus(roomCode, "active");
        const room = RoomManager_1.roomManager.get(roomCode);
        // Start timers for the new game
        game.startTimers((gameState) => {
            io.to(roomCode).emit("game_state", gameState);
        }, (timedOut) => {
            const gameState = game.getState();
            const winner = timedOut === "white" ? "black" : "white";
            RoomManager_1.roomManager.setStatus(roomCode, "completed");
            io.to(roomCode).emit("game_over", {
                gameState,
                winner,
                termination: "timeout",
            });
            logger_1.logger.info(`Game over in ${roomCode}: timeout, winner: ${winner}`);
        });
        const gameState = game.getState();
        io.to(roomCode).emit("game_restarted", { gameState, room });
        logger_1.logger.info(`Rematch started in room ${roomCode}`);
    });
}
// ── Shared finish helper ──────────────────────────────────────────────────────
function finishGame(io, roomCode, termination, winner) {
    const game = GameManager_1.gameManager.get(roomCode);
    if (!game)
        return;
    game.stopTimers();
    RoomManager_1.roomManager.setStatus(roomCode, "completed");
    const gameState = game.getState();
    io.to(roomCode).emit("game_over", { gameState, termination, winner });
}
//# sourceMappingURL=game.handler.js.map