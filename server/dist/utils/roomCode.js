"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomCode = generateRoomCode;
const nanoid_1 = require("nanoid");
// 6-digit alphanumeric, uppercase only (9 chars from 36-char alphabet = millions of combos)
const generateCode = (0, nanoid_1.customAlphabet)("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
/**
 * Generates a unique 6-character room code.
 * Pass an `isUnique` predicate to avoid collisions with existing codes.
 */
async function generateRoomCode(isUnique, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        const code = generateCode();
        if (isUnique(code))
            return code;
    }
    throw new Error("Failed to generate a unique room code. Try again.");
}
//# sourceMappingURL=roomCode.js.map