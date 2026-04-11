export default function PlayerCard({
  name,
  elo,
  time,
  isPlayer,
}: {
  name: string;
  elo: string;
  time: string;
  isPlayer?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl" />
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-xs text-gray-400">ELO {elo}</div>
        </div>
      </div>

      <div
        className={`px-4 py-2 rounded-lg font-mono ${
          isPlayer ? "bg-indigo-600 text-white" : "bg-white/10"
        }`}
      >
        {time}
      </div>
    </div>
  );
}