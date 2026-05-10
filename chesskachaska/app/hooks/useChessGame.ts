"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { getSocket } from "@/app/lib/socket";
import {
  moveMade,
  gameOver,
  setDrawOffer,
  selectMyColor,
  selectIsSpectator,
  selectGameState,
} from "@/app/store/roomSlice";
import { setError } from "@/app/store/roomSlice";

export function useChessGame(roomCode: string | null) {
  const dispatch = useAppDispatch();
  const myColor = useAppSelector(selectMyColor);
  const isSpectator = useAppSelector(selectIsSpectator);
  const gameState = useAppSelector(selectGameState);

  useEffect(() => {
    if (!roomCode) return;

    const socket = getSocket();

    // ✅ FIX 1: Socket had autoConnect:false but was never manually connected.
    // Connect here if not already connected.
    if (!socket.connected) {
      socket.connect();
    }

    // ✅ FIX 2: Use named handler references so socket.off() only removes
    // THIS effect's listeners, not every listener on the event.
    const onMoveMade = (payload: Parameters<typeof moveMade>[0]) => {
      dispatch(moveMade(payload));
    };

    const onGameOver = (payload: Parameters<typeof gameOver>[0]) => {
      dispatch(gameOver(payload));
    };

    const onIllegalMove = (payload: { from: string; to: string; reason: string }) => {
      console.warn("Illegal move rejected:", payload);
      if (payload?.reason) {
        dispatch(setError(payload.reason));
        // Clear after a short delay so UI doesn't stay cluttered
        setTimeout(() => dispatch(setError(null)), 3000);
      }
    };

    const onDrawOffer = (payload: { fromColor: "white" | "black" }) => {
      dispatch(setDrawOffer(payload.fromColor));
    };

    socket.on("move_made", onMoveMade);
    socket.on("game_over", onGameOver);
    socket.on("illegal_move", onIllegalMove);
    socket.on("draw_offer", onDrawOffer);

    return () => {
      // ✅ FIX 2 (continued): Remove only the specific handlers registered above.
      socket.off("move_made", onMoveMade);
      socket.off("game_over", onGameOver);
      socket.off("illegal_move", onIllegalMove);
      socket.off("draw_offer", onDrawOffer);
    };
  }, [dispatch, roomCode]);

  const sendMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!roomCode || isSpectator || !myColor) return false;

      // ✅ FIX 3: Guard against sending a move when it's not your turn.
      // Without this, both players could emit moves and the server
      // rejects the out-of-turn one — but the local board may still update.
      const expectedTurn = myColor === "white" ? "w" : "b";
      if (gameState && gameState.turn !== expectedTurn) {
        console.debug("sendMove blocked: not your turn", { expectedTurn, current: gameState.turn });
        return false;
      }

      const socket = getSocket();

      if (!socket.connected) {
        console.warn("sendMove blocked: socket not connected");
        return false;
      }

      console.debug("sending move", { roomCode, from, to, promotion });
      socket.emit("make_move", { roomCode, from, to, promotion });
      return true;
    },
    [roomCode, isSpectator, myColor, gameState]
  );

  const resign = useCallback(() => {
    if (!roomCode || isSpectator) return;
    const socket = getSocket();
    socket.emit("resign", { roomCode });
  }, [roomCode, isSpectator]);

  const offerDraw = useCallback(() => {
    if (!roomCode || isSpectator) return;
    const socket = getSocket();
    socket.emit("draw_offer", { roomCode });
  }, [roomCode, isSpectator]);

  const respondToDraw = useCallback(
    (accepted: boolean) => {
      if (!roomCode || isSpectator) return;
      const socket = getSocket();
      socket.emit("draw_response", { roomCode, accepted });
      dispatch(setDrawOffer(null));
    },
    [roomCode, isSpectator, dispatch]
  );

  return { myColor, isSpectator, sendMove, resign, offerDraw, respondToDraw };
}
