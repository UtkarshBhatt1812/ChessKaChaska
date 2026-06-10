/**
 * Per-socket, per-event rate limiter using a sliding window.
 * Returns true if the call is allowed, false if it should be dropped.
 */
export declare function isRateLimited(socketId: string, event: string): boolean;
/** Call this on socket disconnect to free memory */
export declare function clearSocketLimits(socketId: string): void;
//# sourceMappingURL=rateLimiter.d.ts.map