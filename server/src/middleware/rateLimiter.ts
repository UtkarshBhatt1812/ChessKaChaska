/**
 * Per-socket, per-event rate limiter using a sliding window.
 * Returns true if the call is allowed, false if it should be dropped.
 */

type Window = {
  count: number;
  resetAt: number;
};

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  make_move:    { max: 5,  windowMs: 1_000 },
  send_message: { max: 3,  windowMs: 2_000 },
  typing:       { max: 5,  windowMs: 3_000 },
  create_room:  { max: 3,  windowMs: 10_000 },
  join_room:    { max: 5,  windowMs: 10_000 },
  draw_offer:   { max: 2,  windowMs: 30_000 },
  resign:       { max: 1,  windowMs: 60_000 },
};

const windows = new Map<string, Window>();

function buildKey(socketId: string, event: string) {
  return `${socketId}:${event}`;
}

export function isRateLimited(socketId: string, event: string): boolean {
  const limit = LIMITS[event];
  if (!limit) return false; // no limit for this event

  const key = buildKey(socketId, event);
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now > existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + limit.windowMs });
    return false;
  }

  if (existing.count >= limit.max) return true;

  existing.count++;
  return false;
}

/** Call this on socket disconnect to free memory */
export function clearSocketLimits(socketId: string) {
  for (const key of windows.keys()) {
    if (key.startsWith(`${socketId}:`)) windows.delete(key);
  }
}
