"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = socketAuthMiddleware;
const crypto_1 = require("crypto");
const cookie_1 = require("cookie");
const env_1 = require("../config/env");
function base64UrlDecode(value) {
    return Buffer.from(value, "base64url").toString("utf-8");
}
function verifyJwt(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3)
            return null;
        const [encodedHeader, encodedPayload, receivedSig] = parts;
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        const expectedSig = (0, crypto_1.createHmac)("sha256", env_1.config.jwtSecret)
            .update(signingInput)
            .digest("base64url");
        const expBuf = Buffer.from(expectedSig);
        const recBuf = Buffer.from(receivedSig);
        if (expBuf.length !== recBuf.length)
            return null;
        if (!(0, crypto_1.timingSafeEqual)(expBuf, recBuf))
            return null;
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        if (!payload.sub || !payload.exp)
            return null;
        if (payload.exp <= Math.floor(Date.now() / 1000))
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
/**
 * Socket.IO middleware: reads JWT from handshake.auth.token or cookie.
 * Attaches userId, username, isGuest to socket.data.
 * Allows guest connections with a generated ID prefix "guest:".
 */
function socketAuthMiddleware(socket, next) {
    // 1. Try bearer token from handshake.auth
    const token = socket.handshake.auth?.token;
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
        const cookies = (0, cookie_1.parse)(rawCookie);
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
    const guestId = `guest:${(0, crypto_1.randomUUID)()}`;
    const guestUsername = socket.handshake.auth?.guestName ||
        `Guest_${guestId.slice(6, 11)}`;
    socket.data = {
        userId: guestId,
        username: guestUsername,
        isGuest: true,
    };
    return next();
}
//# sourceMappingURL=auth.middleware.js.map