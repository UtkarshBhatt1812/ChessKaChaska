"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { selectAuthUser } from "@/app/store/authSlice";
import { selectRoom, selectRoomError } from "@/app/store/roomSlice";
import { useSocket } from "@/app/hooks/useSocket";
import { useRoom } from "@/app/hooks/useRoom";
import TopBar from "@/app/play/components/TopBar";
import RoomHeader from "./components/RoomHeader";
import MultiplayerArena from "./components/MultiplayerArena";

export default function GameRoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();

  const currentUser = useAppSelector(selectAuthUser);
  const room = useAppSelector(selectRoom);
  const error = useAppSelector(selectRoomError);

  const { status } = useSocket(currentUser);
  const { joinRoom, reconnectRoom } = useRoom();

  useEffect(() => {

    if (status === "connected" && room?.code !== code) {
      joinRoom(code);
    }
  }, [status, room, code, joinRoom]);


  useEffect(() => {
    if (status === "reconnecting") {
      // Re-trigger auth + game state restore via reconnect
      reconnectRoom(code);
    }
  }, [status, code, reconnectRoom]);

  // Intentionally omitting auto-clearRoom on unmount.
  // Room is explicitly cleared when user clicks 'Leave Room' in RoomHeader.
  // This prevents React StrictMode from destroying connection state locally during development routing.

  if (error === "Room not found.") {
    return (
      <main className="min-h-screen bg-surface">
        <TopBar />
        <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
          <h2 className="text-2xl font-bold text-white">Room not found</h2>
          <button onClick={() => router.push("/lobby")} className="text-accent underline">
            Back to Lobby
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface text-foreground flex flex-col">
      <TopBar />
      <div className="flex-1 flex flex-col p-6 gap-6 max-w-[1400px] w-full mx-auto">
        <RoomHeader />
        
        {!room ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
             Connecting to room {code}...
          </div>
        ) : (
          <MultiplayerArena roomCode={code} />
        )}
      </div>
    </main>
  );
}
