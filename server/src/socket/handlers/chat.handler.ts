import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { roomManager } from "../../managers/RoomManager";
import { isRateLimited } from "../../middleware/rateLimiter";
import ChatMessageModel from "../../models/ChatMessage";
import {
  ChatMessage,
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  SendMessagePayload,
  TypingPayload,
} from "../../types/socket.types";

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

// In-memory chat history per room (last 100 messages)
const chatHistories = new Map<string, ChatMessage[]>();

export function getChatHistory(roomCode: string): ChatMessage[] {
  return chatHistories.get(roomCode) ?? [];
}

function sanitize(text: string): string {
  return text
    .trim()
    .slice(0, 500)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function registerChatHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AppSocket
) {
  const { userId, username } = socket.data;

  // ── send_message ─────────────────────────────────────────────────────────────
  socket.on("send_message", async (payload: SendMessagePayload) => {
    if (isRateLimited(socket.id, "send_message")) {
      socket.emit("error", { event: "send_message", message: "Sending messages too fast." });
      return;
    }

    const { roomCode, message } = payload;

    // Must be in the room (player or spectator)
    const room = roomManager.get(roomCode);
    if (!room) {
      socket.emit("error", { event: "send_message", message: "Room not found." });
      return;
    }

    const cleanMsg = sanitize(message);
    if (!cleanMsg) return;

    const chatMsg: ChatMessage = {
      id: randomUUID(),
      roomCode,
      userId,
      username,
      message: cleanMsg,
      timestamp: Date.now(),
    };

    // Store in memory
    const history = chatHistories.get(roomCode) ?? [];
    history.push(chatMsg);
    if (history.length > 100) history.shift(); // cap at 100
    chatHistories.set(roomCode, history);

    // Persist to MongoDB (fire-and-forget)
    ChatMessageModel.create(chatMsg).catch(() => {/* non-critical */});

    // Broadcast to entire room
    io.to(roomCode).emit("receive_message", chatMsg);
  });


  socket.on("typing", (payload: TypingPayload) => {
    if (isRateLimited(socket.id, "typing")) return;

    socket.to(payload.roomCode).emit("typing", { username });
  });

  // Cleanup history when room is empty
  socket.on("leave_room", ({ roomCode }: { roomCode: string }) => {
    if (roomManager.isEmpty(roomCode)) {
      chatHistories.delete(roomCode);
    }
  });
}

/** Called on room destroy to free memory */
export function clearChatHistory(roomCode: string) {
  chatHistories.delete(roomCode);
}
