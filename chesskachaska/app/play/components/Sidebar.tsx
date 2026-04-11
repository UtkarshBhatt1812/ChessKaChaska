export default function Sidebar() {
  return (
    <div className="w-full max-w-[380px] flex flex-col gap-6">
      
      {/* Moves */}
      <div className="bg-white/5 rounded-xl p-6 h-[300px] overflow-y-auto">
        <h3 className="font-bold mb-4">Notation</h3>

        <div className="grid grid-cols-3 text-sm font-mono gap-y-2">
          <span className="text-gray-400">1.</span>
          <span>e4</span>
          <span>c5</span>
        </div>
      </div>

      {/* Chat */}
      <div className="bg-white/5 rounded-xl p-6 flex flex-col h-[250px]">
        <h4 className="text-xs uppercase text-gray-400 mb-4">
          Spectators (142)
        </h4>

        <div className="flex-1 overflow-y-auto text-sm space-y-3">
          <div>
            <span className="text-xs text-gray-400">GM</span>
            <p>Nice move!</p>
          </div>
        </div>

        <input
          placeholder="Type a message..."
          className="mt-3 px-3 py-2 rounded bg-black/40"
        />
      </div>
    </div>
  );
}