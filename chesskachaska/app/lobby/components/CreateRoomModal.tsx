import { useState } from "react";
import { X } from "lucide-react";
import type { TimeControl } from "@/app/store/roomSlice";

type Props = {
  onClose: () => void;
  onCreate: (timeControl: TimeControl, color?: "white" | "black") => void;
};

export default function CreateRoomModal({ onClose, onCreate }: Props) {
  const [mode, setMode] = useState<TimeControl["mode"]>("rapid");
  const [colorPref, setColorPref] = useState<"white" | "black" | "random">("random");

  const [customTime, setCustomTime] = useState(10);
  const [customInc, setCustomInc] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let initialSeconds = 600;
    let incrementSeconds = 0;

    if (mode === "bullet") { initialSeconds = 60; incrementSeconds = 0; }
    else if (mode === "blitz") { initialSeconds = 180; incrementSeconds = 2; }
    else if (mode === "rapid") { initialSeconds = 600; incrementSeconds = 0; }
    else if (mode === "classical") { initialSeconds = 1800; incrementSeconds = 0; }
    else if (mode === "custom") {
      initialSeconds = customTime * 60;
      incrementSeconds = customInc;
    }

    const timeControl: TimeControl = { mode, initialSeconds, incrementSeconds };
    const color = colorPref === "random" ? undefined : colorPref;

    onCreate(timeControl, color);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create Room</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Time Control</label>
            <div className="grid grid-cols-3 gap-2">
              {["bullet", "blitz", "rapid", "classical", "custom"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m as TimeControl["mode"])}
                  className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${
                    mode === m
                      ? "border-accent bg-accent/20 text-white"
                      : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {mode === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Minutes</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customTime}
                  onChange={(e) => setCustomTime(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Increment (s)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={customInc}
                  onChange={(e) => setCustomInc(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Play as</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setColorPref("white")}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  colorPref === "white"
                    ? "border-emerald-500 bg-emerald-500/20 text-white"
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setColorPref("random")}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  colorPref === "random"
                    ? "border-accent bg-accent/20 text-white"
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                Random
              </button>
              <button
                type="button"
                onClick={() => setColorPref("black")}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  colorPref === "black"
                    ? "border-indigo-500 bg-indigo-500/20 text-white"
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                Black
              </button>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-accent px-6 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
