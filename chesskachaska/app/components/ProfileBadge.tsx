"use client";

import axios from "axios";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearUser, type AuthUser } from "@/app/store/authSlice";
import { useAppDispatch } from "@/app/store/hooks";

type ProfileBadgeProps = {
  user: AuthUser;
  compact?: boolean;
};

export default function ProfileBadge({
  user,
  compact = false,
}: ProfileBadgeProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const label = user.displayName || user.username;
  const initial = label.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await axios.post(
        "/api/v1/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch {
      // We still clear local UI state even if the request fails.
    } finally {
      dispatch(clearUser());
      setIsMenuOpen(false);
      setIsLoggingOut(false);
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen((current) => !current)}
        className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 transition hover:bg-[color:var(--soft-panel)]"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-indigo-500 text-sm font-bold text-black shadow-lg shadow-indigo-500/20">
          {initial}
        </span>

        {!compact && (
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-foreground">
              {label}
            </span>
            <span className="block text-xs text-muted-foreground">
              @{user.username}
            </span>
          </span>
        )}

        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition ${
            isMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-[220px] rounded-2xl border border-border bg-card p-2 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
        >
          <div className="border-b border-border px-3 py-3">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              @{user.username}
            </p>
          </div>

          <div className="mt-2 grid gap-1">
            <Link
              href="/play"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition hover:bg-[color:var(--soft-panel)]"
            >
              <Swords className="h-4 w-4 text-accent" />
              Play Room
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition hover:bg-[color:var(--soft-panel)]"
            >
              <Settings className="h-4 w-4 text-accent" />
              Settings
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
