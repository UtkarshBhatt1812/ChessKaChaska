import { Server, Socket } from "socket.io";
import { roomManager } from "../../managers/RoomManager";
import { gameManager } from "../../managers/GameManager";
import { logger } from "../../utils/logger";
import { isRateLimited } from "../../middleware/rateLimiter";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  MakeMovePayload,
  ResignPayload,
  DrawOfferPayload,
  DrawResponsePayload,
  PlayerColor,
  GameTermination,
} from "../../types/socket.types";

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

export function registerGameHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AppSocket
) {
  const { userId, username } = socket.data;

  // ── make_move ────────────────────────────────────────────────────────────────
  socket.on("make_move", (payload: MakeMovePayload) => {
    if (isRateLimited(socket.id, "make_move")) {
      socket.emit("error", { event: "make_move", message: "Moving too fast." });
      return;
    }

    const { roomCode, from, to, promotion } = payload;
    const room = roomManager.get(roomCode);

    if (!room || room.status !== "active") {
      socket.emit("illegal_move", { from, to, reason: "Game is not active." });
      return;
    }

    // Validate it's the right player's turn
    const playerColor = roomManager.getPlayerColor(roomCode, userId);
    if (!playerColor) {
      socket.emit("illegal_move", { from, to, reason: "Spectators cannot make moves." });
      return;
    }

    const game = gameManager.get(roomCode);
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
    const moveRecord = gameManager.makeMove(roomCode, from, to, promotion);
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
      roomManager.setStatus(roomCode, "completed");
      io.to(roomCode).emit("game_over", { gameState, winner, termination });
      logger.info(`Game over in ${roomCode}: ${termination}, winner: ${winner ?? "none"}`);
    }
  });

  // ── resign ───────────────────────────────────────────────────────────────────
  socket.on("resign", (payload: ResignPayload) => {
    if (isRateLimited(socket.id, "resign")) return;

    const { roomCode } = payload;
    const color = roomManager.getPlayerColor(roomCode, userId);
    if (!color) return;

    const winner: PlayerColor = color === "white" ? "black" : "white";
    finishGame(io, roomCode, "resignation", winner);
    io.to(roomCode).emit("resign", { color });
    logger.info(`${username} (${color}) resigned in room ${roomCode}`);
  });

  // ── draw_offer ───────────────────────────────────────────────────────────────
  socket.on("draw_offer", (payload: DrawOfferPayload) => {
    if (isRateLimited(socket.id, "draw_offer")) {
      socket.emit("error", { event: "draw_offer", message: "Draw offer cooldown active." });
      return;
    }

    const { roomCode } = payload;
    const color = roomManager.getPlayerColor(roomCode, userId);
    if (!color) return;

    const game = gameManager.get(roomCode);
    if (!game) return;
    game.drawOfferedBy = color;

    // Broadcast draw offer to opponent
    socket.to(roomCode).emit("draw_offer", { fromColor: color });
    logger.info(`${username} offered draw in room ${roomCode}`);
  });

  // ── draw_response ─────────────────────────────────────────────────────────────
  socket.on("draw_response", (payload: DrawResponsePayload) => {
    const { roomCode, accepted } = payload;
    const color = roomManager.getPlayerColor(roomCode, userId);
    if (!color) return;

    const game = gameManager.get(roomCode);
    if (!game || !game.drawOfferedBy || game.drawOfferedBy === color) {
      socket.emit("error", { event: "draw_response", message: "No pending draw offer for you." });
      return;
    }

    game.drawOfferedBy = null;

    if (accepted) {
      finishGame(io, roomCode, "draw_agreement", null);
      logger.info(`Draw agreed in room ${roomCode}`);
    } else {
      // Notify the offering player that draw was declined
      socket.to(roomCode).emit("error", {
        event: "draw_offer",
        message: "Draw offer declined.",
      });
    }
  });
}

// ── Shared finish helper ──────────────────────────────────────────────────────
function finishGame(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  roomCode: string,
  termination: GameTermination,
  winner: PlayerColor | "draw" | null
) {
  const game = gameManager.get(roomCode);
  if (!game) return;

  game.stopTimers();
  roomManager.setStatus(roomCode, "completed");

  const gameState = game.getState();
  io.to(roomCode).emit("game_over", { gameState, termination, winner });
}
