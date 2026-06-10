"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { getSocket } from "@/app/lib/socket";
import {
  roomCreated,
  playerJoined,
  spectatorJoined,
  gameStateUpdated,
  playerDisconnected,
  playerReconnected,
  reconnectSuccess,
  setError,
  setConnectionStatus,
  clearRoom,
} from "@/app/store/roomSlice";
import { messagesLoaded } from "@/app/store/chatSlice";
import type { GameState, PlayerColor, RoomState, SpectatorInfo, TimeControl } from "@/app/store/roomSlice";

type RoomCreatedPayload = {
  room: RoomState;
  myColor: PlayerColor;
};

type PlayerJoinedPayload = {
  room: RoomState;
  myColor?: PlayerColor;
};

type SpectatorJoinedPayload = {
  spectator: SpectatorInfo;
  spectatorCount: number;
  room?: RoomState;
  gameState?: GameState;
};

type ReconnectSuccessPayload = {
  room: RoomState;
  gameState: GameState;
  myColor: PlayerColor;
  chatHistory: Parameters<typeof messagesLoaded>[0];
};

export function useRoom() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = getSocket();

    const onRoomCreated = (payload: RoomCreatedPayload) => {
      dispatch(roomCreated({ room: payload.room, myColor: payload.myColor }));
    };

    const onPlayerJoined = (payload: PlayerJoinedPayload) => {
      dispatch(playerJoined({ room: payload.room, myColor: payload.myColor }));
    };

    const onSpectatorJoined = (payload: SpectatorJoinedPayload) => {
      dispatch(
        spectatorJoined({
          spectatorCount: payload.spectatorCount,
          room: payload.room,
          gameState: payload.gameState,
          joinedAsSpectator: payload.spectator.socketId === socket.id,
        })
      );
    };

    const onGameState = (gameState: GameState) => {
      dispatch(gameStateUpdated(gameState));
    };

    const onPlayerDisconnected = (payload: { color: PlayerColor }) => {
      dispatch(playerDisconnected(payload));
    };

    const onPlayerReconnected = (payload: { color: PlayerColor }) => {
      dispatch(playerReconnected(payload));
    };

    const onReconnectFailed = (payload: { reason: string }) => {
      dispatch(setError(payload.reason));
      dispatch(setConnectionStatus("disconnected"));
    };

    const onReconnectSuccess = (payload: ReconnectSuccessPayload) => {
      dispatch(
        reconnectSuccess({
          room: payload.room,
          gameState: payload.gameState,
          myColor: payload.myColor,
        })
      );
      dispatch(messagesLoaded(payload.chatHistory));
    };

    const onError = (payload: { message: string }) => {
      dispatch(setError(payload.message));
    };

    socket.on("room_created", onRoomCreated);
    socket.on("player_joined", onPlayerJoined);
    socket.on("spectator_joined", onSpectatorJoined);
    socket.on("game_state", onGameState);
    socket.on("player_disconnected", onPlayerDisconnected);
    socket.on("player_reconnected", onPlayerReconnected);
    socket.on("reconnect_failed", onReconnectFailed);
    socket.on("reconnect_success", onReconnectSuccess);
    socket.on("error", onError);

    return () => {
      socket.off("room_created", onRoomCreated);
      socket.off("player_joined", onPlayerJoined);
      socket.off("spectator_joined", onSpectatorJoined);
      socket.off("game_state", onGameState);
      socket.off("player_disconnected", onPlayerDisconnected);
      socket.off("player_reconnected", onPlayerReconnected);
      socket.off("reconnect_failed", onReconnectFailed);
      socket.off("reconnect_success", onReconnectSuccess);
      socket.off("error", onError);
    };
  }, [dispatch]);

  const createRoom = useCallback(
    (timeControl: TimeControl, color?: "white" | "black") => {
      const socket = getSocket();
      socket.emit("create_room", { timeControl, color });
    },
    []
  );

  const joinRoom = useCallback((roomCode: string) => {
    const socket = getSocket();
    socket.emit("join_room", { roomCode });
  }, []);

  const reconnectRoom = useCallback((roomCode: string) => {
    const socket = getSocket();
    socket.emit("reconnect_room", { roomCode });
  }, []);

  const leaveRoom = useCallback((roomCode: string) => {
    const socket = getSocket();
    socket.emit("leave_room", { roomCode });
    dispatch(clearRoom());
  }, [dispatch]);

  return { createRoom, joinRoom, reconnectRoom, leaveRoom };
}
