import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import EngineSection from "./components/EngineSection";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <Features />
      <EngineSection />
      <CTA />
      <Footer />
    </main>
  );
}
