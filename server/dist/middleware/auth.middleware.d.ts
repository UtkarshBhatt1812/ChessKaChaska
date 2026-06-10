import { Socket } from "socket.io";
import { SocketData } from "../types/socket.types";
/**
 * Socket.IO middleware: reads JWT from handshake.auth.token or cookie.
 * Attaches userId, username, isGuest to socket.data.
 * Allows guest connections with a generated ID prefix "guest:".
 */
export declare function socketAuthMiddleware(socket: Socket & {
    data: SocketData;
}, next: (err?: Error) => void): void;
//# sourceMappingURL=auth.middleware.d.ts.map