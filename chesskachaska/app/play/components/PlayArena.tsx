"use client";

import { useEffect, useState,useRef } from "react";
import { Chess } from "chess.js";
import { selectAuthReady, selectAuthUser } from "@/app/store/authSlice";
import { useAppSelector } from "@/app/store/hooks";
import ChessBoard from "./ChessBoard";
import Sidebar from "./Sidebar";
import EvaluationBar from "./EvaluationBar";
import PlayerCard from "./PlayerCard";
import { useStockfishBot } from "@/app/hooks/useStockfishBot";
import { useStockfishEvaluation } from "@/app/hooks/useStockfishEvaluation";

export type LobbyStep = "identity" | "mode";
export type GameMode = "local" | "computer" | "multiplayer";

function getKingSquare(game: Chess): string | null {
  if (!game.isCheck()) return null;
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

function getGameStatus(
  game: Chess,
  gameStarted: boolean,
  lobbyStep: LobbyStep,
  gameMode: GameMode | null
) {
  if (!gameStarted) {
    return lobbyStep === "identity"
      ? "Step 1 of 2: choose guest access, sign up, or sign in."
      : "Step 2 of 2: pick a mode to unlock the board.";
  }

  if (game.isCheckmate()) {
    return `${game.turn() === "w" ? "Black" : "White"} wins by checkmate.`;
  }

  if (game.isStalemate()) {
    return "Game drawn by stalemate.";
  }

  if (game.isThreefoldRepetition()) {
    return "Game drawn by repetition.";
  }

  if (game.isInsufficientMaterial()) {
    return "Game drawn by insufficient material.";
  }

  if (game.isDraw()) {
    return "Game drawn.";
  }

  if (gameMode === "computer") {
    return game.turn() === "w"
      ? game.isCheck()
        ? "Your king is in check. Find a move."
        : "Your move."
      : "Computer is thinking...";
  }

  if (game.isCheck()) {
    return `${game.turn() === "w" ? "White" : "Black"} to move and in check.`;
  }

  return `${game.turn() === "w" ? "White" : "Black"} to move.`;
}

function getGameOverResult(game: Chess) {
  if (!game.isGameOver()) return null;
  if (game.isCheckmate()) {
    return { winner: game.turn() === "w" ? "Black" : "White", termination: "Checkmate" };
  }
  if (game.isStalemate()) return { winner: null, termination: "Stalemate" };
  if (game.isThreefoldRepetition()) return { winner: null, termination: "Repetition" };
  if (game.isInsufficientMaterial()) return { winner: null, termination: "Insufficient Material" };
  return { winner: null, termination: "Draw" };
}

export default function PlayArena() {
  const currentUser = useAppSelector(selectAuthUser);
  const authReady = useAppSelector(selectAuthReady);
  const [lobbyStep, setLobbyStep] = useState<LobbyStep>("identity");
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [game, setGame] = useState(() => new Chess());

  const position = game.fen();
  const moveHistory = game.history();
  const currentTurn = game.turn();
  const isGameOver = game.isGameOver();
  const { evalScore, mate } = useStockfishEvaluation(position);
  
  const history = game.history({ verbose: true });
  const lastMoveObj = history.length > 0 ? history[history.length - 1] : null;
  const lastMove = lastMoveObj ? { from: lastMoveObj.from, to: lastMoveObj.to } : null;
  const kingSquare = getKingSquare(game);
  const gameOverResult = getGameOverResult(game);

  const effectiveLobbyStep =
    currentUser && !gameStarted ? ("mode" as LobbyStep) : lobbyStep;
  const statusText =
    !authReady && !gameStarted
      ? "Restoring your session at the board."
      : getGameStatus(game, gameStarted, effectiveLobbyStep, gameMode);
const stockfishRef = useRef<Worker | null>(null);


const { getBestMove } = useStockfishBot();

useEffect(() => {
  if (
    !gameStarted ||
    gameMode !== "computer" ||
    currentTurn !== "b" ||
    isGameOver
  ) {
    return;
  }

  let cancelled = false;

  const playMove = async () => {
    const bestMove = await getBestMove(game.fen());

    if (cancelled || !bestMove) return;

    const nextGame = new Chess(game.fen());

    nextGame.move({
      from: bestMove.slice(0, 2),
      to: bestMove.slice(2, 4),
      promotion:
        bestMove.length > 4
          ? (bestMove[4] as "q" | "r" | "b" | "n")
          : undefined,
    });

    setGame(nextGame);
  };

  playMove();

  return () => {
    cancelled = true;
  };
}, [currentTurn, game, gameMode, gameStarted, isGameOver, getBestMove]);

  const handleContinueAsGuest = () => {
    setGame(new Chess());
    setGameStarted(false);
    setGameMode(null);
    setLobbyStep("mode");
  };

  const handleBackToIdentity = () => {
    if (currentUser) {
      setLobbyStep("mode");
      return;
    }

    setGame(new Chess());
    setGameStarted(false);
    setGameMode(null);
    setLobbyStep("identity");
  };

  const handleStartGame = (mode: GameMode) => {
    setGame(new Chess());
    setGameMode(mode);
    setGameStarted(true);
  };

  const handleResetMatch = () => {
    setGame(new Chess());
    setGameStarted(false);
    setGameMode(null);
    setLobbyStep("mode");
  };

  const handleMove = (sourceSquare: string, targetSquare: string | null) => {
    if (!gameStarted || isGameOver || !targetSquare) {
      return false;
    }

    const nextGame = new Chess(game.fen());
    const move = nextGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) {
      return false;
    }

    setGame(nextGame);
    return true;
  };

  const topPlayerName =
    gameMode === "computer"
      ? "Onyx Engine"
      : gameStarted
        ? "Black Side"
        : "Awaiting Rival";
  const topPlayerElo =
    gameMode === "computer" ? "BOT" : gameStarted ? "LOCAL" : "----";
  const topPlayerTime = !gameStarted
    ? "Lobby"
    : isGameOver
      ? "Final"
      : currentTurn === "b"
        ? "Turn"
        : "Wait";

  const bottomPlayerName = !gameStarted
    ? currentUser?.displayName || currentUser?.username || "You"
    : gameMode === "computer"
      ? currentUser?.displayName || currentUser?.username || "Guest"
      : "White Side";
  const bottomPlayerElo =
    currentUser?.rating?.rapid
      ? String(currentUser.rating.rapid)
      : gameMode === "computer"
        ? "GUEST"
        : gameStarted
          ? "LOCAL"
          : "GUEST";
  const bottomPlayerTime = !gameStarted
    ? "Ready"
    : isGameOver
      ? "Final"
      : currentTurn === "w"
        ? "Turn"
        : "Wait";

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      

      <section className="flex-1 flex flex-col md:flex-row p-8 gap-12 items-center justify-center">
        <EvaluationBar evalScore={evalScore} mate={mate} />

        <div className="flex flex-col gap-6 w-full max-w-[640px]">
          <PlayerCard
            name={topPlayerName}
            elo={topPlayerElo}
            time={topPlayerTime}
          />

          <ChessBoard
            position={position}
            gameStarted={gameStarted}
            gameMode={gameMode}
            currentTurn={currentTurn}
            statusText={statusText}
            onMove={handleMove}
            game={game}
            lastMove={lastMove}
            isCheck={game.isCheck()}
            kingSquare={kingSquare}
            isGameOver={isGameOver}
            gameOverResult={gameOverResult}
            onRematch={handleResetMatch}
            onNewGame={handleBackToIdentity}
          />

          <PlayerCard
            name={bottomPlayerName}
            elo={bottomPlayerElo}
            time={bottomPlayerTime}
            isPlayer
          />
        </div>

        <Sidebar
          authReady={authReady}
          currentUser={currentUser}
          lobbyStep={effectiveLobbyStep}
          gameStarted={gameStarted}
          gameMode={gameMode}
          moveHistory={moveHistory}
          statusText={statusText}
          onContinueAsGuest={handleContinueAsGuest}
          onBackToIdentity={handleBackToIdentity}
          onStartGame={handleStartGame}
          onResetMatch={handleResetMatch}
        />
      </section>
    </div>
  );
}
