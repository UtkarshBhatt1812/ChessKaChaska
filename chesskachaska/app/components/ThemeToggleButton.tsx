"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { selectThemeMode, toggleTheme } from "@/app/store/themeSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";

export default function ThemeToggleButton() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const isDark = themeMode === "dark";

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-sm text-foreground shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:scale-[1.02] hover:bg-[color:var(--soft-panel)]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-indigo-500/25">
        {isDark ? (
          <SunMedium className="h-4 w-4" />
        ) : (
          <MoonStar className="h-4 w-4" />
        )}
      </span>
      <span className="hidden sm:block">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
