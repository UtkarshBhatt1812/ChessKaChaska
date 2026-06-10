/**
 * Generates a unique 6-character room code.
 * Pass an `isUnique` predicate to avoid collisions with existing codes.
 */
export declare function generateRoomCode(isUnique: (code: string) => boolean, maxAttempts?: number): Promise<string>;
//# sourceMappingURL=roomCode.d.ts.map