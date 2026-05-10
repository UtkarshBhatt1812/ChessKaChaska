"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
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

const Chessboard = dynamic<ReactChessboardProps>(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
);

type ChessBoardProps = {
  position: string;
  gameStarted: boolean;
  gameMode: GameMode | null;
  currentTurn: "w" | "b";
  statusText: string;
  onMove: (sourceSquare: string, targetSquare: string) => boolean;
  boardOrientation?: "white" | "black";
};

export default function ChessBoard({
  position,
  gameStarted,
  gameMode,
  currentTurn,
  statusText,
  onMove,
  boardOrientation = "white",
}: ChessBoardProps) {
  const boardStateKey = `${position}:${currentTurn}:${gameStarted ? "1" : "0"}`;
  const [selectionState, setSelectionState] = useState<{
    boardStateKey: string;
    square: string | null;
  }>({
    boardStateKey,
    square: null,
  });
  const selectedSquare =
    selectionState.boardStateKey === boardStateKey ? selectionState.square : null;
  const myTurn = boardOrientation === "white" ? "w" : "b";
  const allowWhiteMoves = gameMode !== "multiplayer" || myTurn === "w";
  const allowBlackMoves = gameMode === "multiplayer" && myTurn === "b";

  const setSelectedSquare = useCallback(
    (square: string | null) => {
      setSelectionState({ boardStateKey, square });
    },
    [boardStateKey]
  );

  const canControlPiece = useCallback(
    (pieceType?: string | null) => {
      if (!gameStarted || !pieceType) return false;

      const pieceColor = pieceType.startsWith("w") ? "w" : "b";
      if (pieceColor !== currentTurn) return false;

      if (pieceColor === "w") return allowWhiteMoves;
      return allowBlackMoves;
    },
    [allowBlackMoves, allowWhiteMoves, currentTurn, gameStarted]
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
      if (!gameStarted) return;

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
    [canControlPiece, gameStarted, onMove, selectedSquare, setSelectedSquare]
  );

  const options = useMemo<ChessboardOptions>(
    () => ({
      position,
      boardOrientation,
      allowDragging: gameStarted,
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
      squareStyles: selectedSquare
        ? {
            [selectedSquare]: {
              boxShadow: "inset 0 0 0 4px rgba(79, 70, 229, 0.75)",
            },
          }
        : {},
      darkSquareStyle: { backgroundColor: "#B58863" },
      lightSquareStyle: { backgroundColor: "#F0D9B5" },
      allowDrawingArrows: true,
    }),
    [
      boardOrientation,
      canDragPiece,
      gameStarted,
      handlePieceDrop,
      handleSquareClick,
      position,
      selectedSquare,
    ]
  );

  return (
    <div className="relative w-full max-w-[640px] aspect-square rounded-xl overflow-hidden shadow-2xl">
      <Chessboard options={options} />

      {!gameStarted && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
          <div className="max-w-sm rounded-2xl border border-white/10 bg-black/65 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">
              Board Locked
            </p>
            <p className="mt-2 text-sm text-gray-300">{statusText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
