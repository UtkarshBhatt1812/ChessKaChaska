"use client";

import { useEffect, useRef, useCallback } from "react";

export function useStockfishBot() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker("/stockfish.js");

    worker.postMessage("uci");
    worker.postMessage("isready");

    workerRef.current = worker;

    return () => worker.terminate();
  }, []);

  const getBestMove = useCallback(
    (fen: string): Promise<string> => {
      return new Promise((resolve) => {
        const worker = workerRef.current;

        if (!worker) {
          resolve("");
          return;
        }

        const handler = (e: MessageEvent) => {
          const line = String(e.data);

          if (line.startsWith("bestmove")) {
            worker.removeEventListener("message", handler);

            const move = line.split(" ")[1];
            resolve(move);
          }
        };

        worker.addEventListener("message", handler);

        worker.postMessage("stop");
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage("go movetime 700");
      });
    },
    []
  );

  return { getBestMove };
}