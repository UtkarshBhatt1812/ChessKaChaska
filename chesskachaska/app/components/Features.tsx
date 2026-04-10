import Image from "next/image";

export default function Features() {
  return (
    <section className="mx-auto max-w-6xl pt-20 py-20 sm:px-8 cursor-default " >
      <h2 className="mb-10 font-serif text-3xl text-foreground leading-normal ">
        Designed for <br /><span className="text-yellow-500 italic font-light">The Strategic Mind.</span>
      <div className="h-1 w-20 rounded-md bg-accent"></div>
      </h2>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-card border-border overflow-hidden rounded-xl border flex flex-col justify-center items-center">
          <Image
            alt="Chess board setup in the game room"
            src="/game-room.png"
            width={1200}
            height={720}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-60 w-[90%] object-fit"
          />
          <div className="p-6">
            <p className="text-accent text-xs uppercase tracking-[0.3em] ">
              Precision
            </p>
            <h3 className="mt-2 text-xl text-foreground">The Game Room</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Experience zero-latency play with customizable pieces and boards.
            </p>
            <button className="text-accent hover:text-accent-hover mt-4 transition-all hover:scale-105 duration-300 cursor-pointer">
              Enter Arena →
            </button>
          </div>
        </div>
        <div className="bg-card border-border flex flex-col justify-between rounded-xl border p-6">
          <div>
            <h3 className="text-xl text-foreground">Tactical Lab</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              50,000+ puzzles that adapt to your style.
            </p>
          </div>
          <Image
            alt="Chess puzzle analysis interface"
            src="/puzzle.png"
            width={960}
            height={720}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="mt-6 rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}
