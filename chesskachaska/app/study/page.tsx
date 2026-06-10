"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  Clock3,
  Filter,
  Flame,
  GraduationCap,
  Library,
  Search,
  Shield,
  Swords,
  Target,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";

type StudyCategory = "All" | "Openings" | "Tactics" | "Endgames" | "Strategy";

type StudyItem = {
  title: string;
  category: Exclude<StudyCategory, "All">;
  level: string;
  minutes: number;
  progress: number;
  focus: string;
  accent: string;
};

const categories: StudyCategory[] = [
  "All",
  "Openings",
  "Tactics",
  "Endgames",
  "Strategy",
];

const studyItems: StudyItem[] = [
  {
    title: "Queen's Gambit Structures",
    category: "Openings",
    level: "Intermediate",
    minutes: 18,
    progress: 68,
    focus: "Minor-piece plans after cxd5",
    accent: "bg-indigo-500",
  },
  {
    title: "Back Rank Motifs",
    category: "Tactics",
    level: "Sharp",
    minutes: 12,
    progress: 42,
    focus: "Deflection, luft, overloaded rooks",
    accent: "bg-rose-500",
  },
  {
    title: "Rook vs Pawn Races",
    category: "Endgames",
    level: "Essential",
    minutes: 16,
    progress: 81,
    focus: "Cutoff files and checking distance",
    accent: "bg-emerald-500",
  },
  {
    title: "Good Knight, Bad Bishop",
    category: "Strategy",
    level: "Advanced",
    minutes: 22,
    progress: 35,
    focus: "Outposts, fixed pawns, color complexes",
    accent: "bg-amber-500",
  },
  {
    title: "Sicilian Anti-Pins",
    category: "Openings",
    level: "Advanced",
    minutes: 20,
    progress: 24,
    focus: "Be2, h3, and central breaks",
    accent: "bg-cyan-500",
  },
  {
    title: "Quiet Move Combinations",
    category: "Tactics",
    level: "Mastery",
    minutes: 14,
    progress: 57,
    focus: "Threat building before forcing lines",
    accent: "bg-fuchsia-500",
  },
];

const drillQueue = [
  { label: "Tactical vision", count: "12", icon: Target },
  { label: "Endgame recall", count: "6", icon: Shield },
  { label: "Opening repair", count: "8", icon: BookOpen },
];

const board = [
  ["", "", "bk", "", "", "br", "", ""],
  ["bp", "bp", "", "", "", "bp", "bp", "bp"],
  ["", "", "bn", "", "", "", "", ""],
  ["", "", "", "wp", "bp", "", "", ""],
  ["", "", "", "", "wP", "", "", ""],
  ["", "", "wN", "", "", "wQ", "", ""],
  ["wP", "wP", "", "", "", "wP", "wP", "wP"],
  ["", "", "", "", "wK", "", "", ""],
];

const pieces: Record<string, string> = {
  bk: "♚",
  br: "♜",
  bn: "♞",
  bp: "♟",
  wK: "♔",
  wQ: "♕",
  wN: "♘",
  wP: "♙",
};

function getCategoryIcon(category: StudyItem["category"]) {
  if (category === "Openings") return Library;
  if (category === "Tactics") return Swords;
  if (category === "Endgames") return GraduationCap;
  return Brain;
}

export default function StudyPage() {
  const [activeCategory, setActiveCategory] = useState<StudyCategory>("All");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return studyItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.category, item.level, item.focus]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground transition hover:border-white/20 hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
            <Flame size={16} className="text-amber-400" />
            <span>7 day streak</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
          <aside className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div>
              <p className="font-robomono text-xs uppercase tracking-[0.28em] text-yellow-500">
                Study
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-tight text-white">
                Explore your next edge
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-2xl font-semibold text-white">64%</p>
                <p className="text-xs text-muted-foreground">Course depth</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-2xl font-semibold text-white">18</p>
                <p className="text-xs text-muted-foreground">Lines saved</p>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="space-y-3">
              {drillQueue.map(({ label, count, icon: Icon }) => (
                <button
                  key={label}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:border-accent/50 hover:bg-accent/10"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={17} className="text-accent" />
                    <span className="text-sm text-white">{label}</span>
                  </span>
                  <span className="rounded-md bg-black/30 px-2 py-1 text-xs text-muted-foreground">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Study library
                </p>
                <h2 className="font-serif text-3xl text-white">
                  Lessons and drills
                </h2>
              </div>

              <label className="flex min-h-11 items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-muted-foreground xl:w-80">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search themes"
                  className="h-11 min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm transition ${
                    activeCategory === category
                      ? "border-accent bg-accent text-white"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Filter size={15} />
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              {filteredItems.map((item) => {
                const Icon = getCategoryIcon(item.category);

                return (
                  <article
                    key={item.title}
                    className="grid gap-4 rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-accent/40 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.accent}`}
                        />
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          <Icon size={14} />
                          {item.category}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.focus}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <BarChart3 size={14} />
                          {item.level}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {item.minutes} min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:justify-end">
                      <div className="w-24">
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-right text-xs text-muted-foreground">
                          {item.progress}%
                        </p>
                      </div>
                      <button
                        aria-label={`Open ${item.title}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:border-accent/50 hover:bg-accent/20"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current motif</p>
                  <h2 className="font-serif text-2xl text-white">
                    Break the pin
                  </h2>
                </div>
                <Target className="text-accent" size={22} />
              </div>

              <div className="mt-4 aspect-square overflow-hidden rounded-lg border border-white/10">
                <div className="grid h-full w-full grid-cols-8 grid-rows-8">
                  {board.flatMap((row, rowIndex) =>
                    row.map((piece, columnIndex) => {
                      const isLight = (rowIndex + columnIndex) % 2 === 0;

                      return (
                        <div
                          key={`${rowIndex}-${columnIndex}`}
                          className={`flex items-center justify-center text-[clamp(1.35rem,6vw,2.4rem)] ${
                            isLight ? "bg-[#e6d3a6]" : "bg-[#7d945d]"
                          }`}
                        >
                          <span
                            className={
                              piece.startsWith("w")
                                ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                                : "text-zinc-950"
                            }
                          >
                            {pieces[piece]}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="min-h-10 rounded-lg bg-accent px-3 text-sm font-medium text-white transition hover:bg-accent-hover">
                  Start
                </button>
                <button className="min-h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-muted-foreground transition hover:text-white">
                  Save
                </button>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
              <Image
                src="/puzzle.png"
                alt="Chess puzzle study preview"
                width={900}
                height={520}
                className="h-36 w-full object-cover object-top"
              />
              <div className="p-4">
                <p className="text-sm text-muted-foreground">Review set</p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Missed tactics
                </h2>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-yellow-500" />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
