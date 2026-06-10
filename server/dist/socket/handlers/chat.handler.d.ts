import { Server, Socket } from "socket.io";
import { ChatMessage, ClientToServerEvents, ServerToClientEvents, SocketData } from "../../types/socket.types";
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
export declare function getChatHistory(roomCode: string): ChatMessage[];
export declare function registerChatHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>, socket: AppSocket): void;
/** Called on room destroy to free memory */
export declare function clearChatHistory(roomCode: string): void;
export {};
//# sourceMappingURL=chat.handler.d.ts.map