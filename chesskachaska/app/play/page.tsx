"use client";
import TopBar from "./components/TopBar";
import PlayArena from "./components/PlayArena";
import { useEffect } from "react";
import  { useRouter } from "next/navigation";
export default function PlayPage() {
  return (
    <main className="min-h-screen bg-surface text-foreground">
      <TopBar />
      <PlayArena />
    </main>
  );
}
