"use client";

import { useEffect, useRef, useState } from "react";

export function useStockfish(fen: string) {
  const workerRef = useRef<Worker | null>(null);
  const [evalScore, setEvalScore] = useState(0);
  const [mate, setMate] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    workerRef.current = new Worker("/stockfish.js");
    const worker = workerRef.current;

    worker.onmessage = (event) => {
      const line = event.data;

      if (line.includes("score cp")) {
        const match = line.match(/score cp (-?\d+)/);
        if (match) {
          setMate(null);
          setEvalScore(parseInt(match[1], 10));
        }
      }

      if (line.includes("score mate")) {
        const match = line.match(/score mate (-?\d+)/);
        if (match) {
          setMate(parseInt(match[1], 10));
        }
      }
    };

    worker.postMessage("uci");
    worker.postMessage("isready");

    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;

    const worker = workerRef.current;

    worker.postMessage("stop"); // IMPORTANT
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage("go depth 12");
  }, [fen]);

  return { evalScore, mate };
}