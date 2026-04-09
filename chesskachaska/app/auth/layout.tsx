
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden w-1/2 overflow-hidden md:flex">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/background.png')" }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 lg:p-16">
          <h1 className="text-3xl italic font-serif text-accent-hover">
            Onyx Gambit
          </h1>

          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl leading-snug text-foreground font-montserrat font-light">
                The mind is a battlefield.
                <br />
                Design your victory.
              </h2>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Join the elite inner circle of grandmasters where every move is
                calculated and every match is a masterpiece of strategy.
              </p>
            </div>

            <div className="flex gap-10 pt-10 text-sm">
              <div>
                <p className="text-xl font-semibold text-yellow-400">2,450+</p>
                <p className="text-muted-foreground">ACTIVE GMS</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-accent">10M+</p>
                <p className="text-muted-foreground">GAMES ANALYZED</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-bg-secondary p-6 md:w-1/2">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
