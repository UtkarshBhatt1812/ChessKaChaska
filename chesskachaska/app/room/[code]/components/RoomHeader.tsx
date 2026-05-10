"use client";

import { Copy, Users, WifiOff, Wifi, LogOut } from "lucide-react";
import { useAppSelector } from "@/app/store/hooks";
import { selectRoom, selectConnectionStatus } from "@/app/store/roomSlice";
import { useRouter } from "next/navigation";
import { useRoom } from "@/app/hooks/useRoom";

export default function RoomHeader() {
  const room = useAppSelector(selectRoom);
  const status = useAppSelector(selectConnectionStatus);
  const router = useRouter();
  const { leaveRoom } = useRoom();

  if (!room) return null;

  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave the room?")) {
      leaveRoom(room.code);
      router.push("/lobby");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/room/${room.code}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-6 py-4">
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs uppercase text-gray-400">Room Code</p>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-mono font-bold tracking-widest text-white">
              {room.code}
            </h2>
            <button
              onClick={copyCode}
              title="Copy Code"
              className="text-gray-400 hover:text-white transition"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <button
          onClick={copyLink}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition"
        >
          Copy Invite Link
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-gray-400" title="Spectators">
          <Users size={16} />
          <span>{room.spectators?.length || 0}</span>
        </div>

        {status === "connected" ? (
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 border border-emerald-500/20">
            <Wifi size={14} /> Connected
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400 border border-red-500/20">
            <WifiOff size={14} /> Reconnecting...
          </div>
        )}

        <div className="h-8 w-px bg-white/10" />

        <button
          onClick={handleLeave}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition px-2 py-1 rounded"
        >
          <LogOut size={16} /> Leave Room
        </button>
      </div>
    </div>
  );
}
