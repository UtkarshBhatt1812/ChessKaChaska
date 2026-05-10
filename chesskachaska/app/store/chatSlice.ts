import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type ChatMessage = {
  id: string;
  roomCode: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
};

type ChatState = {
  messages: ChatMessage[];
  typingUsers: string[]; // usernames currently typing
};

const initialState: ChatState = {
  messages: [],
  typingUsers: [],
};

const TYPING_CLEAR_DELAY = 3000;
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    messageReceived(state, action: PayloadAction<ChatMessage>) {
      // Deduplicate by id
      if (!state.messages.find((m) => m.id === action.payload.id)) {
        state.messages.push(action.payload);
        if (state.messages.length > 100) state.messages.shift();
      }
    },
    messagesLoaded(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
    typingStarted(state, action: PayloadAction<string>) {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    typingStopped(state, action: PayloadAction<string>) {
      state.typingUsers = state.typingUsers.filter((u) => u !== action.payload);
    },
    clearChat() {
      // Clear timers
      typingTimers.forEach((t) => clearTimeout(t));
      typingTimers.clear();
      return initialState;
    },
  },
});

export const {
  messageReceived,
  messagesLoaded,
  typingStarted,
  typingStopped,
  clearChat,
} = chatSlice.actions;

export const selectMessages = (s: RootState) => s.chat.messages;
export const selectTypingUsers = (s: RootState) => s.chat.typingUsers;

export default chatSlice.reducer;

/** Exported for use in useChat hook to auto-clear typing indicator */
export { typingTimers };
