export default function TopBar() {
  return (
    <header className="flex justify-between items-center px-8 py-4 border-b border-white/10 backdrop-blur-xl bg-black/40">
      
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-serif italic">Onyx Gambit</h1>
        <nav className="hidden md:flex gap-6 text-sm text-gray-400">
          <a className="hover:text-indigo-400" href="#">Puzzles</a>
          <a className="text-indigo-400 border-b border-indigo-400 pb-1" href="#">Game Room</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-white/10 px-4 py-2 rounded-lg">Settings</button>
        <button className="bg-indigo-600 px-6 py-2 rounded-lg">Quick Play</button>
      </div>
    </header>
  );
}