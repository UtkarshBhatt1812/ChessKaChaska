import { randomInt } from "crypto";

// 6-digit alphanumeric, uppercase only (9 chars from 36-char alphabet = millions of combos)
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 6;

function generateCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Generates a unique 6-character room code.
 * Pass an `isUnique` predicate to avoid collisions with existing codes.
 */
export async function generateRoomCode(
  isUnique: (code: string) => boolean,
  maxAttempts = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateCode();
    if (isUnique(code)) return code;
  }
  throw new Error("Failed to generate a unique room code. Try again.");
}
