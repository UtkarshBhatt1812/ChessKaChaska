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
        <div className="h-12 w-12 rounded-xl bg-[color:var(--soft-panel)]" />
        <div>
          <div className="font-bold text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">ELO {elo}</div>
        </div>
      </div>

      <div
        className={`px-4 py-2 rounded-lg font-mono ${
          isPlayer
            ? "bg-accent text-white"
            : "bg-[color:var(--soft-panel)] text-foreground"
        }`}
      >
        {time}
      </div>
    </div>
  );
}
