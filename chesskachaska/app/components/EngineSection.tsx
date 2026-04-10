import Image from "next/image";

export default function EngineSection() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 sm:px-8 md:grid-cols-2 ">
      <div className="bg-card border-border rounded-xl border p-6">
        <p className="text-accent text-xs uppercase tracking-[0.3em]">
          Insight
        </p>
        <h3 className="mt-2 text-xl text-foreground">Grandmaster Analytics</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          AI-powered analysis backed by Stockfish.
        </p>
        <div className="h-1 w-100 rounded-md bg-muted-foreground mt-4">
            <div className="h-1 w-92 rounded-md bg-accent"></div>
        </div>
        <div className="mt-4 text-sm text-foreground">Accuracy: 92.4%</div>
      </div>
      <div className="text-center md:text-left bg-card border-border rounded-xl border p-6  " >
        <Image
          alt="Illustration of the neural chess engine"
          src="/engine.png"
          width={940}
          height={640}
          className="mx-auto w-full md:mx-0"
        />
        <h3 className="mt-4 text-xl text-foreground ">Neural Engine v2</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Cloud-native infrastructure with grandmaster-level analysis.
        </p>
      </div>
    </section>
  );
}
