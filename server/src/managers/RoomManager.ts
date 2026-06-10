import { config } from "../config/env";
import {
  PlayerColor,
  PlayerInfo,
  RoomState,
  RoomStatus,
  SpectatorInfo,
  TimeControl,
} from "../types/socket.types";

export class RoomManager {
  private rooms = new Map<string, RoomState>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodically garbage-collect abandoned/expired rooms
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      config.roomCleanupIntervalMs
    );
  }

  create(
    code: string,
    host: Omit<PlayerInfo, "color">,
    preferredColor: PlayerColor | undefined,
    timeControl: TimeControl
  ): RoomState {
    const hostColor: PlayerColor =
      preferredColor || (Math.random() < 0.5 ? "white" : "black");

    const player: PlayerInfo = { ...host, color: hostColor, connected: true };
    const room: RoomState = {
      code,
      white: hostColor === "white" ? player : null,
      black: hostColor === "black" ? player : null,
      spectators: [],
      status: "waiting",
      gameId: null,
      createdAt: Date.now(),
      timeControl,
    };

    this.rooms.set(code, room);
    return room;
  }

  get(code: string): RoomState | undefined {
    return this.rooms.get(code);
  }

  has(code: string): boolean {
    return this.rooms.has(code);
  }

  hasCode(code: string): boolean {
    return this.rooms.has(code);
  }

  /**
   * Join a room as a player. Returns assigned color, or null if room is full.
   */
  joinAsPlayer(
    code: string,
    player: Omit<PlayerInfo, "color">
  ): PlayerColor | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    if (!room.white) {
      room.white = { ...player, color: "white", connected: true };
      if (room.black) room.status = "ready";
      return "white";
    }

    if (!room.black) {
      room.black = { ...player, color: "black", connected: true };
      if (room.white) room.status = "ready";
      return "black";
    }

    return null; // room full — join as spectator instead
  }

  joinAsSpectator(code: string, spectator: SpectatorInfo): boolean {
    const room = this.rooms.get(code);
    if (!room) return false;
    // Don't double-add
    if (room.spectators.some((s) => s.userId === spectator.userId)) {
      return false;
    }
    room.spectators.push(spectator);
    return true;
  }

  setStatus(code: string, status: RoomStatus) {
    const room = this.rooms.get(code);
    if (room) room.status = status;
  }

  setGameId(code: string, gameId: string) {
    const room = this.rooms.get(code);
    if (room) room.gameId = gameId;
  }

  markDisconnected(code: string, userId: string) {
    const room = this.rooms.get(code);
    if (!room) return;
    for (const side of ["white", "black"] as PlayerColor[]) {
      const player = room[side];
      if (player?.userId === userId) {
        player.connected = false;
        player.disconnectedAt = Date.now();
      }
    }
  }

  markReconnected(code: string, userId: string, newSocketId: string) {
    const room = this.rooms.get(code);
    if (!room) return;
    for (const side of ["white", "black"] as PlayerColor[]) {
      const player = room[side];
      if (player?.userId === userId) {
        player.connected = true;
        player.socketId = newSocketId;
        player.disconnectedAt = undefined;
      }
    }
  }

  removePlayer(code: string, userId: string): PlayerColor | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    for (const side of ["white", "black"] as PlayerColor[]) {
      if (room[side]?.userId === userId) {
        room[side] = null;
        return side;
      }
    }

    // Try spectators
    const idx = room.spectators.findIndex((s) => s.userId === userId);
    if (idx !== -1) room.spectators.splice(idx, 1);
    return null;
  }

  removeSpectatorBySocket(socketId: string): string | null {
    for (const [code, room] of this.rooms.entries()) {
      const idx = room.spectators.findIndex((s) => s.socketId === socketId);
      if (idx !== -1) {
        room.spectators.splice(idx, 1);
        return code;
      }
    }

    return null;
  }

  getPlayerColor(code: string, userId: string): PlayerColor | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    if (room.white?.userId === userId) return "white";
    if (room.black?.userId === userId) return "black";
    return null;
  }

  isPlayerInRoom(code: string, userId: string): boolean {
    return this.getPlayerColor(code, userId) !== null;
  }

  isEmpty(code: string): boolean {
    const room = this.rooms.get(code);
    if (!room) return true;
    return !room.white && !room.black && room.spectators.length === 0;
  }

  delete(code: string) {
    this.rooms.delete(code);
  }

  getAllCodes(): string[] {
    return Array.from(this.rooms.keys());
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  private cleanup() {
    const now = Date.now();
    const GRACE = config.roomDisconnectGracePeriodMs;
    const MAX_IDLE = 1000 * 60 * 60; // 1 hour

    for (const [code, room] of this.rooms.entries()) {
      // Remove rooms where both players have been disconnected beyond grace period
      if (
        (room.status === "waiting" || room.status === "abandoned") &&
        now - room.createdAt > MAX_IDLE
      ) {
        this.rooms.delete(code);
        continue;
      }

      const whiteGone =
        room.white?.connected === false &&
        room.white.disconnectedAt != null &&
        now - room.white.disconnectedAt > GRACE;
      const blackGone =
        room.black?.connected === false &&
        room.black.disconnectedAt != null &&
        now - room.black.disconnectedAt > GRACE;

      if (whiteGone && blackGone) {
        room.status = "abandoned";
        this.rooms.delete(code);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

export const roomManager = new RoomManager();
