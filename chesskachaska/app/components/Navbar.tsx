"use client";

import ProfileBadge from "@/app/components/ProfileBadge";
import { selectAuthReady, selectAuthUser } from "@/app/store/authSlice";
import { useAppSelector } from "@/app/store/hooks";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("Puzzles");
  const user = useAppSelector(selectAuthUser);
  const authReady = useAppSelector(selectAuthReady);

  const links = [
    { label: "Puzzles", href: "/study" },
    { label: "Game Room", href: "/lobby" },
    { label: "Learn", href: "/study" },
    { label: "Grandmasters", href: "/study" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-4">
      <div className="border-border bg-card flex items-center justify-between rounded-2xl border px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <h1 className="text-accent relative cursor-default text-lg font-semibold tracking-wide group italic font-serif">
          Onyx Gambit
          <span className="bg-accent absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full" />
        </h1>
        <nav className="text-muted-foreground hidden gap-8 text-sm md:flex ">
          {links.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              onClick={() => setActive(item.label)}
              className="relative group transition cursor-pointer "
            >
              {item.label}
              <span className="bg-yellow-500 absolute inset-0 rounded-md opacity-0 blur-lg transition group-hover:opacity-3" />
              <span
                className={`bg-yellow-500 absolute -bottom-1 left-0 h-[2px] transition-all duration-300 
                ${active === item.label ? "w-full" : "w-0 group-hover:w-full"}`}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <ProfileBadge user={user} />
          ) : authReady ? (
            <>
              <Link href="/login" className="text-muted-foreground hover:text-foreground text-sm transition cursor-pointer">
                Login
              </Link>

              <Link href="/register" className="bg-accent-hover text-foreground relative overflow-hidden rounded-lg px-4 py-2 text-sm font-medium transition-opacity cursor-pointer  hover:opacity-90">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          )}
        </div>
      </div>
    </header>
  );
}
