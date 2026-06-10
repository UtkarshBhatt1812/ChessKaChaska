"use strict";
/**
 * Per-socket, per-event rate limiter using a sliding window.
 * Returns true if the call is allowed, false if it should be dropped.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRateLimited = isRateLimited;
exports.clearSocketLimits = clearSocketLimits;
const LIMITS = {
    make_move: { max: 5, windowMs: 1000 },
    send_message: { max: 3, windowMs: 2000 },
    typing: { max: 5, windowMs: 3000 },
    create_room: { max: 3, windowMs: 10000 },
    join_room: { max: 5, windowMs: 10000 },
    draw_offer: { max: 2, windowMs: 30000 },
    resign: { max: 1, windowMs: 60000 },
};
const windows = new Map();
function buildKey(socketId, event) {
    return `${socketId}:${event}`;
}
function isRateLimited(socketId, event) {
    const limit = LIMITS[event];
    if (!limit)
        return false; // no limit for this event
    const key = buildKey(socketId, event);
    const now = Date.now();
    const existing = windows.get(key);
    if (!existing || now > existing.resetAt) {
        windows.set(key, { count: 1, resetAt: now + limit.windowMs });
        return false;
    }
    if (existing.count >= limit.max)
        return true;
    existing.count++;
    return false;
}
/** Call this on socket disconnect to free memory */
function clearSocketLimits(socketId) {
    for (const key of windows.keys()) {
        if (key.startsWith(`${socketId}:`))
            windows.delete(key);
    }
}
//# sourceMappingURL=rateLimiter.js.map