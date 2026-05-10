"use client";

import Link from "next/link";
import type { AuthUser } from "@/app/store/authSlice";
import type { GameMode, LobbyStep } from "./PlayArena";

type SidebarProps = {
  authReady: boolean;
  currentUser: AuthUser | null;
  lobbyStep: LobbyStep;
  gameStarted: boolean;
  gameMode: GameMode | null;
  moveHistory: string[];
  statusText: string;
  onContinueAsGuest: () => void;
  onBackToIdentity: () => void;
  onStartGame: (mode: GameMode) => void;
  onResetMatch: () => void;
};

function renderNotationRows(moveHistory: string[]) {
  const rows = [];

  for (let index = 0; index < moveHistory.length; index += 2) {
    rows.push(
      <div key={index} className="grid grid-cols-[42px,1fr,1fr] text-sm font-mono gap-y-2 gap-x-3">
        <span className="text-gray-400">{Math.floor(index / 2) + 1}.</span>
        <span>{moveHistory[index]}</span>
        <span>{moveHistory[index + 1] ?? "..."}</span>
      </div>
    );
  }

  return rows;
}

export default function Sidebar({
  authReady,
  currentUser,
  lobbyStep,
  gameStarted,
  gameMode,
  moveHistory,
  statusText,
  onContinueAsGuest,
  onBackToIdentity,
  onStartGame,
  onResetMatch,
}: SidebarProps) {
  return (
    <div className="w-full max-w-[380px] flex flex-col gap-6">
      {/* Moves */}
      <div className="bg-white/5 rounded-xl p-6 h-[300px] overflow-y-auto">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold">Notation</h3>
            <p className="mt-1 text-xs text-gray-400">{statusText}</p>
          </div>

          {gameStarted && (
            <button
              type="button"
              onClick={onResetMatch}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-white/10"
            >
              New Match
            </button>
          )}
        </div>

        {!gameStarted && !authReady ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
            Checking whether you already have a saved session...
          </div>
        ) : !gameStarted ? (
          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-4 ${
                currentUser
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : lobbyStep === "identity"
                  ? "border-indigo-400/60 bg-indigo-500/10"
                  : "border-emerald-500/40 bg-emerald-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-sm font-semibold text-white">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">Enter the board</h4>
                    <p className="text-xs text-gray-400">
                      {currentUser
                        ? `Signed in as ${currentUser.displayName || currentUser.username}.`
                        : "Guest gets you in instantly. Account options stay one click away."}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.24em] text-gray-400">
                  {currentUser ? "Ready" : lobbyStep === "identity" ? "Active" : "Done"}
                </span>
              </div>

              {currentUser ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200">
                  Your account is active. Choose a mode below to begin.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="rounded-xl bg-gradient-btn px-4 py-3 text-sm font-medium text-foreground transition hover:opacity-90"
                  >
                    Play as Guest
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/register"
                      className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-gray-100 transition hover:bg-white/10"
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-gray-100 transition hover:bg-white/10"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                lobbyStep === "mode" || !!currentUser
                  ? "border-indigo-400/60 bg-indigo-500/10"
                  : "border-white/10 bg-black/20 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-sm font-semibold text-white">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-white">Choose a match</h4>
                  <p className="text-xs text-gray-400">
                    Once a mode starts, this panel switches into live notation.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => onStartGame("local")}
                  disabled={lobbyStep !== "mode" && !currentUser}
                  className="rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Play 1v1
                </button>
                <button
                  type="button"
                  onClick={() => onStartGame("computer")}
                  disabled={lobbyStep !== "mode" && !currentUser}
                  className="rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Play with Computer
                </button>
                <Link
                  href="/lobby"
                  className={`rounded-xl px-4 py-3 text-left text-sm text-white transition hover:bg-accent-hover ${
                    lobbyStep !== "mode" && !currentUser ? "pointer-events-none opacity-50 bg-accent/50" : "bg-accent"
                  }`}
                >
                  Play Online (Multiplayer)
                </Link>
                {lobbyStep === "mode" && !currentUser && (
                  <button
                    type="button"
                    onClick={onBackToIdentity}
                    className="rounded-xl px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10"
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : moveHistory.length > 0 ? (
          <div className="space-y-2">{renderNotationRows(moveHistory)}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-gray-300">
            {gameMode === "computer"
              ? "Game started. Make the first move and the notation list will fill in."
              : "Game started. White makes the first move and notation will appear here."}
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="bg-white/5 rounded-xl p-6 flex flex-col h-[250px]">
        <h4 className="text-xs uppercase text-gray-400 mb-4">
          {gameStarted ? "Spectators (142)" : "Match Room"}
        </h4>

        <div className="flex-1 overflow-y-auto text-sm space-y-3">
          {gameStarted ? (
            <div>
              <span className="text-xs text-gray-400">GM</span>
              <p>Nice move!</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-gray-300">
              Finish the setup cards above to open a live game room.
            </div>
          )}
        </div>

        <input
          placeholder={
            gameStarted ? "Type a message..." : "Chat unlocks when the game starts"
          }
          disabled={!gameStarted}
          className="mt-3 px-3 py-2 rounded bg-black/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}
