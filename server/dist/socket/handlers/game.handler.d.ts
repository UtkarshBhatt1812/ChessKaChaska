import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, SocketData } from "../../types/socket.types";
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
export declare function registerGameHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>, socket: AppSocket): void;
export {};
//# sourceMappingURL=game.handler.d.ts.map