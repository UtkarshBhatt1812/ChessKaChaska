"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatHistory = getChatHistory;
exports.registerChatHandlers = registerChatHandlers;
exports.clearChatHistory = clearChatHistory;
const uuid_1 = require("uuid");
const RoomManager_1 = require("../../managers/RoomManager");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const ChatMessage_1 = __importDefault(require("../../models/ChatMessage"));
// In-memory chat history per room (last 100 messages)
const chatHistories = new Map();
function getChatHistory(roomCode) {
    return chatHistories.get(roomCode) ?? [];
}
function sanitize(text) {
    return text
        .trim()
        .slice(0, 500)
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function registerChatHandlers(io, socket) {
    const { userId, username } = socket.data;
    // ── send_message ─────────────────────────────────────────────────────────────
    socket.on("send_message", async (payload) => {
        if ((0, rateLimiter_1.isRateLimited)(socket.id, "send_message")) {
            socket.emit("error", { event: "send_message", message: "Sending messages too fast." });
            return;
        }
        const { roomCode, message } = payload;
        // Must be in the room (player or spectator)
        const room = RoomManager_1.roomManager.get(roomCode);
        if (!room) {
            socket.emit("error", { event: "send_message", message: "Room not found." });
            return;
        }
        const cleanMsg = sanitize(message);
        if (!cleanMsg)
            return;
        const chatMsg = {
            id: (0, uuid_1.v4)(),
            roomCode,
            userId,
            username,
            message: cleanMsg,
            timestamp: Date.now(),
        };
        // Store in memory
        const history = chatHistories.get(roomCode) ?? [];
        history.push(chatMsg);
        if (history.length > 100)
            history.shift(); // cap at 100
        chatHistories.set(roomCode, history);
        // Persist to MongoDB (fire-and-forget)
        ChatMessage_1.default.create(chatMsg).catch(() => { });
        // Broadcast to entire room
        io.to(roomCode).emit("receive_message", chatMsg);
    });
    socket.on("typing", (payload) => {
        if ((0, rateLimiter_1.isRateLimited)(socket.id, "typing"))
            return;
        socket.to(payload.roomCode).emit("typing", { username });
    });
    // Cleanup history when room is empty
    socket.on("leave_room", ({ roomCode }) => {
        if (RoomManager_1.roomManager.isEmpty(roomCode)) {
            chatHistories.delete(roomCode);
        }
    });
}
/** Called on room destroy to free memory */
function clearChatHistory(roomCode) {
    chatHistories.delete(roomCode);
}
//# sourceMappingURL=chat.handler.js.map