import { Socket } from "socket.io";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { parse as parseCookies } from "cookie";
import { config } from "../config/env";
import { SocketData } from "../types/socket.types";
import { logger } from "../utils/logger";

type AuthPayload = {
  sub: string;
  username: string;
  email: string;
  tokenType: string;
  iat: number;
  exp: number;
};

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function verifyJwt(token: string): AuthPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, receivedSig] = parts;

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = createHmac("sha256", config.jwtSecret)
      .update(signingInput)
      .digest("base64url");

    const expBuf = Buffer.from(expectedSig);
    const recBuf = Buffer.from(receivedSig);

    if (expBuf.length !== recBuf.length) return null;
    if (!timingSafeEqual(expBuf, recBuf)) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthPayload;
    if (!payload.sub || !payload.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Socket.IO middleware: reads JWT from handshake.auth.token or cookie.
 * Attaches userId, username, isGuest to socket.data.
 * Allows guest connections with a generated ID prefix "guest:".
 */
export function socketAuthMiddleware(
  socket: Socket & { data: SocketData },
  next: (err?: Error) => void
) {
  // 1. Try bearer token from handshake.auth
  logger.debug(`Socket auth middleware: ${socket.id} | handshake.auth:`, socket.handshake.auth);
  const token = (socket.handshake.auth as Record<string, string>)?.token;

  if (token) {
    const payload = verifyJwt(token);
    if (payload) {
      socket.data = {
        userId: payload.sub,
        username: payload.username,
        isGuest: false,
      };
      return next();
    }
    return next(new Error("AUTH_ERROR: invalid or expired token"));
  }

  // 2. Try cookie
  const rawCookie = socket.handshake.headers.cookie;
  if (rawCookie) {
    const cookies = parseCookies(rawCookie);
    const cookieToken = cookies["access_token"];
    if (cookieToken) {
      const payload = verifyJwt(cookieToken);
      if (payload) {
        socket.data = {
          userId: payload.sub,
          username: payload.username,
          isGuest: false,
        };
        return next();
      }
    }
  }

  // 3. Guest access — allow with generated ID
  const guestId = `guest:${randomUUID()}`;
  const guestUsername =
    (socket.handshake.auth as Record<string, string>)?.guestName ||
    `Guest_${guestId.slice(6, 11)}`;

  socket.data = {
    userId: guestId,
    username: guestUsername,
    isGuest: true,
  };

  return next();
}
