export default function Hero() {
  return (
    <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden px-6 text-center sm:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('/chess-hero.png')",
        }}
      />

      <div className="from-background/30 via-background/75 absolute inset-0 bg-gradient-to-b to-background" />
      <div className="relative z-10 max-w-2xl">
        <p className="font-robomono text-yellow-500 text-xs uppercase tracking-[0.35em]">
          Editorial Chess Experience
        </p>

        <h1 className="mt-6 font-serif text-5xl leading-tight text-foreground md:text-6xl">
          Elevate Your <span className="text-accent italic">Endgame</span>
        </h1>

        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          Experience the surgical precision of the world&apos;s most advanced chess
          engine wrapped in a timeless editorial interface.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button className="bg-gradient-btn cursor-pointer rounded-lg px-6 py-3 text-foreground transition-transform hover:scale-105 duration-300">
            Play Now
          </button>
          <button className="text-muted-foreground cursor-pointer transition-colors hover:text-foreground">
            Explore Study →
          </button>
        </div>
      </div>
    </section>
  );
}
