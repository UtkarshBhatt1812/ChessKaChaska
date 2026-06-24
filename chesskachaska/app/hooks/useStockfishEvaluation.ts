"use client";

import { useEffect, useRef, useState } from "react";

export function useStockfishEvaluation(fen: string) {
  const workerRef = useRef<Worker | null>(null);

  const [evalScore, setEvalScore] = useState(0);
  const [mate, setMate] = useState<number | null>(null);

  useEffect(() => {
    const worker = new Worker("/stockfish.js");

    worker.postMessage("uci");
    worker.postMessage("isready");

    worker.onmessage = (e) => {
      const line = String(e.data);

      const cpMatch = line.match(/score cp (-?\d+)/);
      if (cpMatch) {
        setMate(null);
        setEvalScore(Number(cpMatch[1]));
      }

      const mateMatch = line.match(/score mate (-?\d+)/);
      if (mateMatch) {
        setMate(Number(mateMatch[1]));
      }
    };

    workerRef.current = worker;

    return () => worker.terminate();
  }, []);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    worker.postMessage("stop");
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage("go depth 12");
  }, [fen]);

  return { evalScore, mate };
}