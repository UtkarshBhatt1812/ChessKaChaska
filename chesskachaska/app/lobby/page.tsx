"use client";

import { useState } from "react";
import TopBar from "@/app/play/components/TopBar";
import CreateRoomModal from "./components/CreateRoomModal";
import JoinRoomModal from "./components/JoinRoomModal";
import { useSocket } from "@/app/hooks/useSocket";
import { useRoom } from "@/app/hooks/useRoom";
import { useAppSelector } from "@/app/store/hooks";
import { selectAuthUser } from "@/app/store/authSlice";
import { selectRoom, selectRoomError } from "@/app/store/roomSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Swords, Users, Share2, Clock, Zap, ArrowLeft } from "lucide-react";

export default function LobbyPage() {
  const currentUser = useAppSelector(selectAuthUser);
  const room = useAppSelector(selectRoom);
  const error = useAppSelector(selectRoomError);
  const router = useRouter();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useSocket(currentUser);
  const { createRoom, joinRoom } = useRoom();

  // When a room is created or joined, navigate to it
  useEffect(() => {
    if (room?.code) {
      router.push(`/room/${room.code}`);
    }
  }, [room?.code, router]);

  return (
    <main className="min-h-screen bg-surface text-foreground">
      <TopBar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back Link */}
        <div className="mb-8 text-center sm:text-left">
          <Link href="/play" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20">
            <ArrowLeft size={16} /> Back to Play Options
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-400 mb-4">
            Multiplayer
          </p>
          <h1 className="text-5xl font-serif italic text-white mb-4">
            Challenge a Friend
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create a private room, share the code, and play real-time chess —
            spectators welcome.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          <button
            onClick={() => setShowCreate(true)}
            className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 transition-all group-hover:bg-indigo-500/30">
              <Swords size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Create Room</h2>
              <p className="text-sm text-muted-foreground">
                Get a shareable 6-digit code and invite link instantly.
              </p>
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
          </button>

          <button
            onClick={() => setShowJoin(true)}
            className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 transition-all group-hover:bg-emerald-500/30">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Join Room</h2>
              <p className="text-sm text-muted-foreground">
                Enter a room code or paste an invite link to jump in.
              </p>
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
          </button>
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm mb-8">{error}</p>
        )}

        {/* Features strip */}
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { icon: Share2, label: "Shareable Links" },
            { icon: Clock, label: "Real-Time Timers" },
            { icon: Zap, label: "Instant Sync" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <Icon size={18} />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={createRoom}
        />
      )}
      {showJoin && (
        <JoinRoomModal
          onClose={() => setShowJoin(false)}
          onJoin={(code: string) => joinRoom(code.toUpperCase())}
        />
      )}
    </main>
  );
}
