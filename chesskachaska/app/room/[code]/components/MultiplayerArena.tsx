"use client";

import { Chess } from "chess.js";
import { useAppSelector } from "@/app/store/hooks";
import { selectRoom, selectGameState, selectDrawOffer, selectRematchRequest, selectRoomError } from "@/app/store/roomSlice";
import { useChessGame } from "@/app/hooks/useChessGame";
import { useRouter } from "next/navigation";
import { useRoom } from "@/app/hooks/useRoom";
import ChessBoard from "@/app/play/components/ChessBoard";
import PlayerCard from "@/app/play/components/PlayerCard";
import ChatSidebar from "./ChatSidebar";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function getKingSquare(game: Chess): string | null {
  if (!game.isCheck())
     return null;

  const board = game.board();
  const turn = game.turn();
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === "k" && piece.color === turn) {
        return piece.square;
      }
    }
  }
  return null;
}

type Props = {
  roomCode: string;
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function MultiplayerArena({ roomCode }: Props) {
  const router = useRouter();
  const { leaveRoom } = useRoom();
  const room = useAppSelector(selectRoom);
  const gameState = useAppSelector(selectGameState);
  const error = useAppSelector(selectRoomError);
  const drawOffer = useAppSelector(selectDrawOffer);
  const rematchRequest = useAppSelector(selectRematchRequest);
  const { myColor, isSpectator, sendMove, resign, offerDraw, respondToDraw, requestRematch, respondToRematch } =
    useChessGame(roomCode);

  if (!room) return null;

  const isGameActive = room.status === "active";

  // ✅ FIX 4: Board orientation — flip board for black player.
  // topColor is the opponent (shown at the top), bottomColor is the local player.
  const bottomColor = isSpectator ? "white" : (myColor ?? "white");
  const topColor = bottomColor === "white" ? "black" : "white";

  const topPlayer = room[topColor];
  const bottomPlayer = room[bottomColor];

  const topTimeMs =
    gameState?.timers[topColor] ?? room.timeControl.initialSeconds * 1000;
  const bottomTimeMs =
    gameState?.timers[bottomColor] ?? room.timeControl.initialSeconds * 1000;

  const topTimeStr = formatTime(topTimeMs);
  const bottomTimeStr = formatTime(bottomTimeMs);

  const topName = topPlayer ? topPlayer.username : "Waiting...";
  const bottomName = bottomPlayer ? bottomPlayer.username : "Waiting...";

  const handleMove = (from: string, to: string | null) => {
    if (!to) return false;
    return sendMove(from, to, "q");
  };

  let statusText = "Waiting for game to start...";
  if (isGameActive && gameState) {
    statusText = gameState.turn === "w" ? "White to move" : "Black to move";
    if (gameState.isCheck) statusText += " (Check!)";
  } else if (room.status === "completed" && gameState?.termination) {
    statusText = `Game Over: ${gameState.termination}`;
  }

  // Derive board polish states
  const localGame = gameState ? new Chess(gameState.fen) : null;
  const kingSquare = localGame ? getKingSquare(localGame) : null;
  
  const lastMoveRecord = gameState?.history?.[gameState.history.length - 1];
  const lastMove = lastMoveRecord 
    ? { from: lastMoveRecord.uci.slice(0, 2), to: lastMoveRecord.uci.slice(2, 4) } 
    : null;

  const isGameOver = room.status === "completed" || !!gameState?.termination;

  const gameOverResult = isGameOver
    ? {
        winner: gameState?.winner === "draw" || !gameState?.winner 
          ? null 
          : (gameState.winner === "white" ? "White" : "Black"),
        termination: gameState?.termination || "Game Over",
      }
    : null;

  const handleRematch = () => {
    if (rematchRequest === (myColor === "white" ? "black" : "white")) {
      respondToRematch(true);
    } else {
      requestRematch();
    }
  };

  const handleNewGame = () => {
    leaveRoom(roomCode);
    router.push("/lobby");
  };

  // Is there an incoming draw offer for the local player to respond to?
  const hasIncomingDrawOffer =
    drawOffer !== null && drawOffer !== myColor && !isSpectator;

  return (
    <div className="flex h-full flex-col lg:flex-row gap-8 items-center lg:items-stretch justify-center">
      <div className="flex flex-col gap-6 w-full max-w-[640px] flex-1">
        {error && (
          <div className="mb-2 px-3 py-2 bg-red-600/10 border border-red-600/30 rounded text-sm text-red-300">
            {error}
          </div>
        )}
        <PlayerCard name={topName} elo="----" time={topTimeStr} />

        
        <ChessBoard
          position={gameState?.fen || STARTING_FEN}
          gameStarted={isGameActive}
          gameMode="multiplayer"
          currentTurn={gameState?.turn ?? "w"}
          statusText={statusText}
          onMove={handleMove}
          boardOrientation={bottomColor}
          game={localGame}
          lastMove={lastMove}
          isCheck={gameState?.isCheck}
          kingSquare={kingSquare}
          isGameOver={isGameOver}
          gameOverResult={gameOverResult}
          onRematch={handleRematch}
          onNewGame={handleNewGame}
        />

        <PlayerCard
          name={bottomName}
          elo="----"
          time={bottomTimeStr}
          isPlayer={true}
        />

        {/* Game Controls */}
        {isGameActive && !isSpectator && (
          <div className="flex flex-col gap-3 p-4 mt-4 bg-white/5 rounded-xl">
            <div className="flex gap-4">
              <button
                onClick={() => resign()}
                className="flex-1 py-2 text-sm text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition"
              >
                Resign
              </button>
              <button
                onClick={() => offerDraw()}
                disabled={drawOffer === myColor}
                className="flex-1 py-2 text-sm text-emerald-400 bg-emerald-400/10 rounded-lg hover:bg-emerald-400/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {drawOffer === myColor ? "Draw Offered…" : "Offer Draw"}
              </button>
            </div>

            {/* ✅ FIX 5: Show draw offer accept/decline when opponent offers a draw */}
            {hasIncomingDrawOffer && (
              <div className="flex items-center gap-3 px-3 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                <span className="flex-1 text-sm text-yellow-300">
                  Opponent offers a draw
                </span>
                <button
                  onClick={() => respondToDraw(true)}
                  className="px-3 py-1 text-xs text-emerald-400 bg-emerald-400/10 rounded hover:bg-emerald-400/20 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToDraw(false)}
                  className="px-3 py-1 text-xs text-red-400 bg-red-400/10 rounded hover:bg-red-400/20 transition"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rematch Incoming Request */}
        {!isGameActive && isGameOver && rematchRequest && rematchRequest !== myColor && !isSpectator && (
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mt-4">
            <span className="flex-1 text-sm text-indigo-300 font-medium">
              Opponent requested a rematch
            </span>
            <button
              onClick={() => respondToRematch(true)}
              className="px-4 py-1.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition shadow-lg"
            >
              Accept
            </button>
            <button
              onClick={() => respondToRematch(false)}
              className="px-4 py-1.5 text-sm text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition"
            >
              Decline
            </button>
          </div>
        )}
        
        {/* Rematch Outgoing Request */}
        {!isGameActive && isGameOver && rematchRequest === myColor && !isSpectator && (
          <div className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl mt-4">
            <span className="text-sm text-gray-400">
              Waiting for opponent to accept rematch...
            </span>
          </div>
        )}
      </div>

      {/* Sidebar Column */}
      <ChatSidebar roomCode={roomCode} moveHistory={gameState?.history || []} />
    </div>
  );
}
