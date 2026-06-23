"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Chessboard as ReactChessboard } from "react-chessboard";
import { Chess, Move } from "chess.js";
import type {
  ChessboardOptions,
  PieceDropHandlerArgs,
  PieceHandlerArgs,
  SquareHandlerArgs,
} from "react-chessboard";
import type { GameMode } from "./PlayArena";

type ReactChessboardProps = {
  options?: ChessboardOptions;
};

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function normalizeBoardPosition(position: string) {
  return position === "start" ? STARTING_FEN : position;
}

const Chessboard = (props: ReactChessboardProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ReactChessboard options={props.options} />;
};

type ChessBoardProps = {
  position: string;
  gameStarted: boolean;
  gameMode: GameMode | null;
  currentTurn: "w" | "b";
  statusText: string;
  onMove: (sourceSquare: string, targetSquare: string) => boolean;
  boardOrientation?: "white" | "black";
  game?: Chess | null;
  lastMove?: { from: string; to: string } | null;
  isCheck?: boolean;
  kingSquare?: string | null;
  isGameOver?: boolean;
  gameOverResult?: { winner: string | null; termination: string } | null;
  onRematch?: () => void;
  onNewGame?: () => void;
};

export default function ChessBoard({
  position,
  gameStarted,
  gameMode,
  currentTurn,
  statusText,
  onMove,
  boardOrientation = "white",
  game,
  lastMove,
  isCheck,
  kingSquare,
  isGameOver,
  gameOverResult,
  onRematch,
  onNewGame,
}: ChessBoardProps) {
  const boardStateKey = `${position}:${currentTurn}:${gameStarted ? "1" : "0"}`;
  const [selectionState, setSelectionState] = useState<{
    boardStateKey: string;
    square: string | null;
  }>({
    boardStateKey,
    square: null,
  });
  const [pulseSquare, setPulseSquare] = useState<string | null>(null);

  const selectedSquare =
    selectionState.boardStateKey === boardStateKey ? selectionState.square : null;
  const myTurn = boardOrientation === "white" ? "w" : "b";
  const allowWhiteMoves = gameMode !== "multiplayer" || myTurn === "w";
  const allowBlackMoves = (gameMode === "multiplayer" && myTurn === "b" ) || gameMode === "local";

  // Compute legal moves for the selected square
  const legalMoves = useMemo<Move[]>(() => {
    if (!selectedSquare || !game) return [];
    try {
      return game.moves({ square: selectedSquare as any, verbose: true });
    } catch {
      return [];
    }
  }, [selectedSquare, game]);

  // Capture pulse animation trigger
  useEffect(() => {
    if (lastMove && game) {
      const history = game.history({ verbose: true });
      const lastMoveObj = history[history.length - 1];
      if (lastMoveObj && lastMoveObj.flags.includes("c")) {
        setPulseSquare(lastMoveObj.to);
        const timer = setTimeout(() => setPulseSquare(null), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [lastMove, game]);

  const setSelectedSquare = useCallback(
    (square: string | null) => {
      setSelectionState({ boardStateKey, square });
    },
    [boardStateKey]
  );

  const canControlPiece = useCallback(
    (pieceType?: string | null) => {
      if (!gameStarted || !pieceType || isGameOver) return false;

      const pieceColor = pieceType.startsWith("w") ? "w" : "b";
      if (pieceColor !== currentTurn) return false;

      if (pieceColor === "w") return allowWhiteMoves;
      return allowBlackMoves;
    },
    [allowBlackMoves, allowWhiteMoves, currentTurn, gameStarted, isGameOver]
  );

  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs) => canControlPiece(piece.pieceType),
    [canControlPiece]
  );

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      setSelectedSquare(null);

      if (!targetSquare) return false;
      return onMove(sourceSquare, targetSquare);
    },
    [onMove, setSelectedSquare]
  );

  const handleSquareClick = useCallback(
    ({ piece, square }: SquareHandlerArgs) => {
      if (!gameStarted || isGameOver) return;

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          return;
        }

        if (onMove(selectedSquare, square)) {
          setSelectedSquare(null);
          return;
        }
      }

      setSelectedSquare(canControlPiece(piece?.pieceType) ? square : null);
    },
    [canControlPiece, gameStarted, isGameOver, onMove, selectedSquare, setSelectedSquare]
  );

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(245, 158, 11, 0.5)" };
      styles[lastMove.to] = { backgroundColor: "rgba(245, 158, 11, 0.5)" };
    }
    if (selectedSquare) {
      styles[selectedSquare] = {
        ...(styles[selectedSquare] || {}),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
      };
    }

    // 3. Legal moves
    legalMoves.forEach((move) => {
      const isCapture = move.flags.includes("c") || move.flags.includes("e");
      styles[move.to] = {
        ...(styles[move.to] || {}),
        backgroundImage: isCapture
          ? "radial-gradient(transparent 0%, transparent 79%, rgba(0,0,0,0.3) 80%)"
          : "radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 26%)",
        animation: "dot-appear 150ms ease-out both",
      };
    });

    // 4. Check highlight
    if (isCheck && kingSquare) {
      styles[kingSquare] = {
        ...(styles[kingSquare] || {}),
        backgroundImage:
          "radial-gradient(ellipse at center, rgba(239, 68, 68, 1) 0%, rgba(239, 68, 68, 0) 70%)",
        animation: "check-pulse 2s infinite ease-in-out",
      };
    }

    // 5. Capture pulse
    if (pulseSquare) {
      styles[pulseSquare] = {
        ...(styles[pulseSquare] || {}),
        animation: "capture-pulse 300ms ease-out",
        zIndex: 10,
      };
    }

    return styles;
  }, [lastMove, isCheck, kingSquare, selectedSquare, legalMoves, pulseSquare]);

  const options = useMemo<ChessboardOptions>(
    () => ({
      position: normalizeBoardPosition(position),
      boardOrientation,
      showAnimations: true,
      animationDurationInMs: 200,
      allowDragging: gameStarted && !isGameOver,
      allowDragOffBoard: false,
      canDragPiece,
      onPieceDrop: handlePieceDrop,
      onSquareClick: handleSquareClick,
      boardStyle: {
        width: "100%",
        height: "100%",
        touchAction: "none",
      },
      squareStyle: {
        touchAction: "none",
      },
      squareStyles: customSquareStyles,
      darkSquareStyle: { backgroundColor: "#B58863" },
      lightSquareStyle: { backgroundColor: "#F0D9B5" },
      allowDrawingArrows: true,
    }),
    [
      boardOrientation,
      canDragPiece,
      gameStarted,
      isGameOver,
      handlePieceDrop,
      handleSquareClick,
      position,
      customSquareStyles,
    ]
  );

  return (
    <div className="relative w-full max-w-[640px] aspect-square rounded-xl overflow-hidden shadow-2xl">
      <Chessboard options={options} />

      {!gameStarted && !isGameOver && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
          <div className="max-w-sm rounded-2xl border border-white/10 bg-black/65 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">
              Board Locked
            </p>
            <p className="mt-2 text-sm text-gray-300">{statusText}</p>
          </div>
        </div>
      )}

      {isGameOver && gameOverResult && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-6 text-center animate-game-over-fade-in z-20">
          <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/80 px-6 py-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">
              {gameOverResult.winner ? `${gameOverResult.winner} Wins!` : "Draw"}
            </h3>
            <p className="text-sm text-gray-300 mb-6">{gameOverResult.termination}</p>

            <div className="flex gap-3">
              {onRematch && (
                <button
                  onClick={onRematch}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition"
                >
                  Rematch
                </button>
              )}
              {onNewGame && (
                <button
                  onClick={onNewGame}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition"
                >
                  New Game
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
