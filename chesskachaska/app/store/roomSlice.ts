import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type PlayerColor = "white" | "black";
export type RoomStatus = "waiting" | "ready" | "active" | "completed" | "abandoned";

export type PlayerInfo = {
  userId: string;
  username: string;
  socketId: string;
  color: PlayerColor;
  connected: boolean;
};

export type SpectatorInfo = {
  userId: string;
  username: string;
  socketId: string;
};

export type TimeControl = {
  initialSeconds: number;
  incrementSeconds: number;
  mode: "bullet" | "blitz" | "rapid" | "classical" | "custom";
};

export type RoomState = {
  code: string;
  white: PlayerInfo | null;
  black: PlayerInfo | null;
  spectators: SpectatorInfo[];
  status: RoomStatus;
  gameId: string | null;
  createdAt: number;
  timeControl: TimeControl;
};

export type MoveRecord = {
  ply: number;
  san: string;
  uci: string;
  fenAfter: string;
  color: PlayerColor;
  timestamp: number;
};

export type CapturedPieces = { white: string[]; black: string[] };

export type GameState = {
  fen: string;
  pgn: string;
  history: MoveRecord[];
  turn: "w" | "b";
  capturedPieces: CapturedPieces;
  timers: { white: number; black: number };
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  termination?: string;
  winner?: PlayerColor | "draw" | null;
};

type RoomSliceState = {
  room: RoomState | null;
  gameState: GameState | null;
  myColor: PlayerColor | null;
  isSpectator: boolean;
  connectionStatus: "disconnected" | "connecting" | "connected" | "reconnecting";
  drawOfferedBy: PlayerColor | null;
  error: string | null;
};

const initialState: RoomSliceState = {
  room: null,
  gameState: null,
  myColor: null,
  isSpectator: false,
  connectionStatus: "disconnected",
  drawOfferedBy: null,
  error: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setConnectionStatus(
      state,
      action: PayloadAction<RoomSliceState["connectionStatus"]>
    ) {
      state.connectionStatus = action.payload;
    },
    roomCreated(
      state,
      action: PayloadAction<{ room: RoomState; myColor: PlayerColor }>
    ) {
      state.room = action.payload.room;
      state.myColor = action.payload.myColor;
      state.isSpectator = false;
      state.error = null;
    },
    playerJoined(state, action: PayloadAction<{ room: RoomState }>) {
      state.room = action.payload.room;
    },
    spectatorJoined(
      state,
      action: PayloadAction<{ spectatorCount: number }>
    ) {
      if (state.room) {
        state.room.spectators = state.room.spectators ?? [];
      }
    },
    gameStateUpdated(state, action: PayloadAction<GameState>) {
      state.gameState = action.payload;
    },
    moveMade(
      state,
      action: PayloadAction<{ move: MoveRecord; gameState: GameState }>
    ) {
      state.gameState = action.payload.gameState;
    },
    gameOver(
      state,
      action: PayloadAction<{
        gameState: GameState;
        winner: PlayerColor | "draw" | null;
        termination: string;
      }>
    ) {
      state.gameState = action.payload.gameState;
      if (state.room) state.room.status = "completed";
    },
    playerDisconnected(
      state,
      action: PayloadAction<{ color: PlayerColor }>
    ) {
      const { color } = action.payload;
      if (state.room?.[color]) state.room[color]!.connected = false;
    },
    playerReconnected(
      state,
      action: PayloadAction<{ color: PlayerColor }>
    ) {
      const { color } = action.payload;
      if (state.room?.[color]) state.room[color]!.connected = true;
    },
    reconnectSuccess(
      state,
      action: PayloadAction<{
        room: RoomState;
        gameState: GameState;
        myColor: PlayerColor;
      }>
    ) {
      state.room = action.payload.room;
      state.gameState = action.payload.gameState;
      state.myColor = action.payload.myColor;
      state.isSpectator = false;
      state.connectionStatus = "connected";
    },
    setJoinedAsSpectator(state, action: PayloadAction<GameState>) {
      state.isSpectator = true;
      state.myColor = null;
      state.gameState = action.payload;
    },
    setDrawOffer(state, action: PayloadAction<PlayerColor | null>) {
      state.drawOfferedBy = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearRoom() {
      return initialState;
    },
  },
});

export const {
  setConnectionStatus,
  roomCreated,
  playerJoined,
  spectatorJoined,
  gameStateUpdated,
  moveMade,
  gameOver,
  playerDisconnected,
  playerReconnected,
  reconnectSuccess,
  setJoinedAsSpectator,
  setDrawOffer,
  setError,
  clearRoom,
} = roomSlice.actions;

export const selectRoom = (s: RootState) => s.room.room;
export const selectGameState = (s: RootState) => s.room.gameState;
export const selectMyColor = (s: RootState) => s.room.myColor;
export const selectIsSpectator = (s: RootState) => s.room.isSpectator;
export const selectConnectionStatus = (s: RootState) => s.room.connectionStatus;
export const selectDrawOffer = (s: RootState) => s.room.drawOfferedBy;
export const selectRoomError = (s: RootState) => s.room.error;

export default roomSlice.reducer;
