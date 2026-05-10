"use client";

import ProfileBadge from "@/app/components/ProfileBadge";
import { selectAuthReady, selectAuthUser } from "@/app/store/authSlice";
import { useAppSelector } from "@/app/store/hooks";
import Link from "next/link";
import { useState } from "react";

export default function TopBar() {
  const user = useAppSelector(selectAuthUser);
  const authReady = useAppSelector(selectAuthReady);
  const links = ["Puzzles", "Learn", "Community"];
  const [active, setActive] = useState("Puzzles");
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-8 py-2 backdrop-blur-xl">
      <div className="flex items-center gap-8">
        <h1 className="text-accent relative cursor-default text-lg font-semibold tracking-wide group italic font-serif">
          Onyx Gambit
          <span className="bg-accent absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full" />
        </h1>
        <nav className="text-muted-foreground hidden gap-8 text-sm md:flex ">
          {links.map((item) => (
            <Link href={'/play'}
              key={item}
              onClick={() => setActive(item)}
              className="relative group transition cursor-pointer "
            >
              {item}
              <span className="bg-yellow-500 absolute inset-0 rounded-md opacity-0 blur-lg transition group-hover:opacity-3" />
              <span
                className={`bg-yellow-500 absolute -bottom-1 left-0 h-[2px] transition-all duration-300 
                ${active === item ? "w-full" : "w-0 group-hover:w-full"}`}
              />
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        {!user && (
          <Link
            href="/settings"
            className="rounded-lg bg-[color:var(--soft-panel)] px-4 py-2 text-foreground transition hover:bg-card"
          >
            Settings
          </Link>
        )}
        {  user ? (
          <ProfileBadge user={user} compact />
        ) : authReady ? (
          <>
            <Link
              href="/login"
              className="rounded-lg bg-[color:var(--soft-panel)] px-4 py-2 text-sm text-foreground transition hover:bg-card"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-accent px-6 py-2 text-sm text-white transition hover:bg-accent-hover"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <div className="h-10 w-10 animate-pulse rounded-full bg-[color:var(--soft-panel)]" />
        )}
      </div>
    </header>
  );
}
