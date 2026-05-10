"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setConnectionStatus,
  selectConnectionStatus,
} from "@/app/store/roomSlice";
import { getSocket } from "@/app/lib/socket";
import type { AuthUser } from "@/app/store/authSlice";

/**
 * Manages the Socket.IO connection lifecycle.
 * Call this once near the top of the app (e.g. in the room layout) to
 * maintain a single shared connection.
 */
export function useSocket(currentUser: AuthUser | null) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectConnectionStatus);

  useEffect(() => {
    const socket = getSocket();

    // Attach auth token if user is logged in
    if (currentUser) {
      // The JWT was validated server-side already; pass it via handshake
      const token =
        typeof document !== "undefined"
          ? document.cookie
              .split("; ")
              .find((c) => c.startsWith("access_token="))
              ?.split("=")[1]
          : undefined;
      if (token) {
        socket.auth = { token };
      }
    }

    if (!socket.connected) {
      dispatch(setConnectionStatus("connecting"));
      socket.connect();
    }

    socket.on("connect", () => {
      dispatch(setConnectionStatus("connected"));
    });

    socket.on("disconnect", () => {
      dispatch(setConnectionStatus("disconnected"));
    });

    socket.on("connect_error", () => {
      dispatch(setConnectionStatus("disconnected"));
    });

    socket.io.on("reconnect_attempt", () => {
      dispatch(setConnectionStatus("reconnecting"));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.io.off("reconnect_attempt");
    };
  }, [dispatch, currentUser]);

  return { status };
}
