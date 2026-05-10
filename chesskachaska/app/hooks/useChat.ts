"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { getSocket } from "@/app/lib/socket";
import {
  messageReceived,
  typingStarted,
  typingStopped,
  typingTimers,
} from "@/app/store/chatSlice";

const TYPING_DEBOUNCE_MS = 1500;

export function useChat(roomCode: string | null) {
  const dispatch = useAppDispatch();
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    const socket = getSocket();

    socket.on("receive_message", (msg) => {
      dispatch(messageReceived(msg));
    });

    socket.on("typing", ({ username }) => {
      dispatch(typingStarted(username));

      // Auto-clear after 3s if no follow-up
      const existing = typingTimers.get(username);
      if (existing) clearTimeout(existing);

      const t = setTimeout(() => {
        dispatch(typingStopped(username));
        typingTimers.delete(username);
      }, 3000);

      typingTimers.set(username, t);
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
    };
  }, [dispatch, roomCode]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!roomCode || !message.trim()) return;
      const socket = getSocket();
      socket.emit("send_message", { roomCode, message });
    },
    [roomCode]
  );

  const sendTyping = useCallback(() => {
    if (!roomCode) return;

    // Debounce: only emit once per TYPING_DEBOUNCE_MS
    if (typingDebounceRef.current) return;

    const socket = getSocket();
    socket.emit("typing", { roomCode });

    typingDebounceRef.current = setTimeout(() => {
      typingDebounceRef.current = null;
    }, TYPING_DEBOUNCE_MS);
  }, [roomCode]);

  return { sendMessage, sendTyping };
}
