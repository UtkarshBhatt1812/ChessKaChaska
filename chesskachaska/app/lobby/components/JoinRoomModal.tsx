import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  onClose: () => void;
  onJoin: (code: string) => void;
};

export default function JoinRoomModal({ onClose, onJoin }: Props) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length >= 5) {
      onJoin(code.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Join Room</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Room Code</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. A1B2C3"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-lg font-mono tracking-widest text-white placeholder-white/20 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent uppercase text-center"
              maxLength={6}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={code.length < 5}
              className="rounded-xl bg-accent px-6 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
