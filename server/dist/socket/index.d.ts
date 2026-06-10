import { Server } from "socket.io";
import http from "http";
import { ClientToServerEvents, ServerToClientEvents } from "../types/socket.types";
export declare function createSocketServer(httpServer: http.Server): Server<ClientToServerEvents, ServerToClientEvents>;
//# sourceMappingURL=index.d.ts.map