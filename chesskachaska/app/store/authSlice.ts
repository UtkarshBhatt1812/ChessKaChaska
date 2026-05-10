import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  country: string;
  rating: {
    bullet: number;
    blitz: number;
    rapid: number;
    classical: number;
  };
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };
  status: string;
  createdAt: string;
};

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
};

const initialState: AuthState = {
  user: null,
  ready: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.ready = true;
    },
    clearUser(state) {
      state.user = null;
      state.ready = true;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthReady = (state: RootState) => state.auth.ready;

export default authSlice.reducer;
