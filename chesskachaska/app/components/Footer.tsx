function Footer() {
  return (
    <footer className="border-border mx-auto flex max-w-6xl flex-col gap-6 border-t px-6 py-10 text-sm sm:px-8 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-serif text-xl italic text-foreground">Onyx Gambit</p>
        <p className="text-muted-foreground mt-2 max-w-md">
          Precision play, editorial design, and a modern engine room built on
          your Tailwind theme tokens.
        </p>
      </div>

      <div className="text-muted-foreground flex gap-6">
        <a className="transition-colors hover:text-foreground" href="#">
          Privacy
        </a>
        <a className="transition-colors hover:text-foreground" href="#">
          Terms
        </a>
        <a className="transition-colors hover:text-foreground" href="#">
          Contact
        </a>
      </div>
    </footer>
  );
}

export default Footer;
