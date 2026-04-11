import TopBar from "./components/TopBar";
import ChessBoard from "./components/ChessBoard";
import Sidebar from "./components/Sidebar";
import EvaluationBar from "./components/EvaluationBar";
import PlayerCard from "./components/PlayerCard";
import { connectDB } from "../lib/db";

export default function PlayPage() {
    connectDB();
  return (
    <main className="bg-surface text-on-surface min-h-screen">
    
      <TopBar />
      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        <aside className="w-20 bg-surface-container-low flex flex-col items-center py-8 gap-8">
          <span className="material-symbols-outlined text-primary">grid_view</span>
          <span className="material-symbols-outlined text-on-surface-variant">person</span>
          <span className="material-symbols-outlined text-on-surface-variant">extension</span>
        </aside>

        <section className="flex-1 flex flex-col md:flex-row p-8 gap-12 items-center justify-center">
          
          <EvaluationBar />

          <div className="flex flex-col gap-6 w-full max-w-[640px]">
            <PlayerCard name="Onyx_Reaper" elo="2840" time="09:42" />
            <ChessBoard />
            <PlayerCard name="GM Magnus" elo="2885" time="14:05" isPlayer />
          </div>

          <Sidebar />
        </section>
      </div>
    </main>
  );
}