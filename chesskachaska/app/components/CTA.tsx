export default function CTA() {
  return (
    <section className="px-6 py-20 sm:px-8">
      <div className="bg-card border-border rounded-2xl border p-12 text-center">
        <h2 className="text-foreground font-serif text-3xl italic">The board is set.</h2>
        <p className="text-muted-foreground mt-4">Join the elite community of players who value aesthetics as much as accuracy.</p>

        <button className="bg-gradient-btn text-foreground mt-6 cursor-pointer rounded-lg px-6 py-3 transition-all duration-300 hover:scale-105 hover:opacity-90">Join the Gambit</button>
      </div>
    </section>
  );
}
