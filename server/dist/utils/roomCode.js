"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomCode = generateRoomCode;
const crypto_1 = require("crypto");
// 6-digit alphanumeric, uppercase only (9 chars from 36-char alphabet = millions of combos)
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 6;
function generateCode() {
    let code = "";
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
        code += ROOM_CODE_ALPHABET[(0, crypto_1.randomInt)(ROOM_CODE_ALPHABET.length)];
    }
    return code;
}
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