import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, SocketData } from "../../types/socket.types";
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
export declare function registerRoomHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>, socket: AppSocket): void;
export declare function handleLeave(io: Server<ClientToServerEvents, ServerToClientEvents>, socket: AppSocket, roomCode: string): void;
export {};
//# sourceMappingURL=room.handler.d.ts.map