"use client";

import {
  Bell,
  Check,
  ChevronDown,
  LayoutGrid,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { selectAuthUser } from "@/app/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectThemeMode, setTheme } from "@/app/store/themeSlice";

type SettingsTab =
  | "general"
  | "account"
  | "board"
  | "notifications"
  | "security";

type ThemeChoice = "light" | "dark";

const tabs: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "account", label: "Account", icon: UserRound },
  { id: "board", label: "Board Appearance", icon: LayoutGrid },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-8 w-16 items-center rounded-full p-1 transition ${
        enabled ? "bg-indigo-600" : "bg-[color:var(--settings-border)]"
      }`}
      aria-pressed={enabled}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm transition ${
          enabled
            ? "translate-x-8"
            : "translate-x-0 text-[color:var(--settings-text-muted)]"
        }`}
      >
        {enabled && <Check className="h-4 w-4" />}
      </span>
    </button>
  );
}

function SettingRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-[color:var(--settings-border)] py-8 last:border-b-0 md:flex-row md:items-center md:justify-between">
      <div className="max-w-2xl">
        <h3 className="text-2xl font-medium tracking-tight text-[color:var(--settings-text)]">
          {title}
        </h3>
        <p className="mt-2 text-lg leading-8 text-[color:var(--settings-text-soft)]">
          {description}
        </p>
      </div>
      <div className="md:shrink-0">{action}</div>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-serif text-5xl tracking-tight text-[color:var(--settings-text)] md:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-[color:var(--settings-text-soft)] md:text-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ThemeCard({
  label,
  active,
  mode,
  onClick,
}: {
  label: string;
  active: boolean;
  mode: ThemeChoice;
  onClick: () => void;
}) {
  const isLight = mode === "light";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[26px] border bg-[color:var(--settings-card)] p-4 text-left transition ${
        active
          ? "border-indigo-600 shadow-[0_0_0_3px_rgba(79,70,229,0.12)]"
          : "border-[color:var(--settings-border)] hover:border-[color:var(--accent)]"
      }`}
    >
      <div
        className={`rounded-[18px] border p-4 ${
          isLight
            ? "border-[#e7e3da] bg-[#fbfaf7]"
            : "border-[#1f2026] bg-[#16181d]"
        }`}
      >
        <div className="grid grid-cols-[82px,1fr] overflow-hidden rounded-[14px] border">
          <div
            className={`min-h-[168px] ${
              isLight ? "border-r border-[#e9e6de] bg-[#f3f1ea]" : "border-r border-[#30333a] bg-[#26282f]"
            }`}
          />
          <div className={`p-4 ${isLight ? "bg-white" : "bg-[#1e2026]"}`}>
            <div
              className={`h-8 rounded-xl ${
                isLight ? "bg-[#fbfaf7] shadow-sm" : "bg-[#2c2f34]"
              }`}
            />
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div
                className={`h-24 rounded-2xl ${
                  isLight ? "bg-[#f8f6f1] shadow-sm" : "bg-[#31343b]"
                }`}
              />
              <div
                className={`h-24 rounded-2xl ${
                  isLight ? "bg-[#faf8f2] shadow-sm" : "bg-[#31343b]"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[1.7rem] font-medium tracking-tight text-[color:var(--settings-text)]">
          {label}
        </span>
        <span
          className={`h-8 w-8 rounded-full border ${
            active
              ? "border-indigo-600 bg-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.14)]"
              : "border-[color:var(--settings-border)] bg-[color:var(--settings-card)]"
          }`}
        />
      </div>
    </button>
  );
}

function SettingsContent({
  activeTab,
  selectedLanguage,
  soundEffects,
  animations,
  themeChoice,
  setSelectedLanguage,
  setSoundEffects,
  setAnimations,
  setThemeChoice,
}: {
  activeTab: SettingsTab;
  selectedLanguage: string;
  soundEffects: boolean;
  animations: boolean;
  themeChoice: ThemeChoice;
  setSelectedLanguage: (value: string) => void;
  setSoundEffects: (value: boolean) => void;
  setAnimations: (value: boolean) => void;
  setThemeChoice: (value: ThemeChoice) => void;
}) {
  const user = useAppSelector(selectAuthUser);

  if (activeTab === "account") {
    return (
      <div className="space-y-12">
        <SectionHeading
          title="Account"
          subtitle="Shape the profile that appears around your games."
        />

        <div className="rounded-[32px] border border-[color:var(--settings-border)] bg-[color:var(--settings-card)] p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#f5d58d] via-[#ef9f5b] to-[#5a67ff] text-4xl font-bold text-black shadow-lg">
              {(user?.displayName || user?.username || "O").charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-4xl text-[color:var(--settings-text)]">
                {user?.displayName || "Onyx Strategist"}
              </h3>
              <p className="text-lg text-[color:var(--settings-text-soft)]">
                {user?.email || "Add an account to personalize your studio."}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-[color:var(--settings-muted-surface)] p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--settings-text-muted)]">
                Username
              </p>
              <p className="mt-3 text-2xl text-[color:var(--settings-text)]">
                {user?.username || "guest_player"}
              </p>
            </div>
            <div className="rounded-2xl bg-[color:var(--settings-muted-surface)] p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--settings-text-muted)]">
                Rapid Rating
              </p>
              <p className="mt-3 text-2xl text-[color:var(--settings-text)]">
                {user?.rating?.rapid ?? 1200}
              </p>
            </div>
            <div className="rounded-2xl bg-[color:var(--settings-muted-surface)] p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--settings-text-muted)]">
                Country
              </p>
              <p className="mt-3 text-2xl text-[color:var(--settings-text)]">
                {user?.country || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl bg-[color:var(--settings-muted-surface)] p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--settings-text-muted)]">
                Games Played
              </p>
              <p className="mt-3 text-2xl text-[color:var(--settings-text)]">
                {user?.stats?.gamesPlayed ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "board") {
    return (
      <div className="space-y-12">
        <SectionHeading
          title="Board Appearance"
          subtitle="Tune the studio to feel cinematic before the first move."
        />

        <div className="rounded-[32px] border border-[color:var(--settings-border)] bg-[color:var(--settings-card)] p-8 md:p-10">
          <SettingRow
            title="Piece Animations"
            description="Smooth transitions for drag, drop, and capture moments across the board."
            action={
              <Toggle
                enabled={animations}
                onToggle={() => setAnimations(!animations)}
              />
            }
          />
          <SettingRow
            title="Move Sounds"
            description="Subtle audio confirmation for movement, captures, checks, and match flow."
            action={
              <Toggle
                enabled={soundEffects}
                onToggle={() => setSoundEffects(!soundEffects)}
              />
            }
          />
          <SettingRow
            title="Board Mood"
            description="Choose whether the board room feels crisp and gallery-like or deep and nocturnal."
            action={
              <div className="inline-flex rounded-2xl bg-[color:var(--settings-muted-surface)] p-1">
                <button
                  type="button"
                  onClick={() => setThemeChoice("light")}
                  className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                    themeChoice === "light"
                      ? "bg-[color:var(--settings-card)] text-[color:var(--settings-text)] shadow-sm"
                      : "text-[color:var(--settings-text-muted)]"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setThemeChoice("dark")}
                  className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                    themeChoice === "dark"
                      ? "bg-[#1a1b1f] text-white"
                      : "text-[color:var(--settings-text-muted)]"
                  }`}
                >
                  Dark
                </button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  if (activeTab === "notifications") {
    return (
      <div className="space-y-12">
        <SectionHeading
          title="Notifications"
          subtitle="Decide which signals reach you between games."
        />

        <div className="rounded-[32px] border border-[color:var(--settings-border)] bg-[color:var(--settings-card)] p-8 md:p-10">
          <SettingRow
            title="Challenge Alerts"
            description="Get notified when a player invites you into a live match."
            action={<Toggle enabled onToggle={() => undefined} />}
          />
          <SettingRow
            title="Tournament Reminders"
            description="Reminders before your registered events begin and between rounds."
            action={<Toggle enabled onToggle={() => undefined} />}
          />
          <SettingRow
            title="Weekly Digest"
            description="A studio summary with recent games, rating shifts, and standout moments."
            action={<Toggle enabled={false} onToggle={() => undefined} />}
          />
        </div>
      </div>
    );
  }

  if (activeTab === "security") {
    return (
      <div className="space-y-12">
        <SectionHeading
          title="Security"
          subtitle="Keep your board room safe without breaking the rhythm."
        />

        <div className="rounded-[32px] border border-[color:var(--settings-border)] bg-[color:var(--settings-card)] p-8 md:p-10">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-[color:var(--settings-muted-surface)] p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--settings-text-muted)]">
                Session
              </p>
              <h3 className="mt-3 text-3xl font-medium text-[color:var(--settings-text)]">
                Protected
              </h3>
              <p className="mt-3 text-lg text-[color:var(--settings-text-soft)]">
                Your studio session is secured with an HTTP-only auth token.
              </p>
            </div>
            <div className="rounded-2xl bg-[color:var(--settings-muted-surface)] p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--settings-text-muted)]">
                Next Step
              </p>
              <h3 className="mt-3 text-3xl font-medium text-[color:var(--settings-text)]">
                Two-Factor Ready
              </h3>
              <p className="mt-3 text-lg text-[color:var(--settings-text-soft)]">
                This area is prepared for future device approvals and 2FA options.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <SectionHeading
        title="Preferences"
        subtitle="Manage your studio"
      />

      <section className="space-y-5">
        <h3 className="font-serif text-4xl text-[color:var(--settings-text)] md:text-[3.3rem]">
          General Settings
        </h3>
        <div className="h-px w-full bg-[color:var(--settings-border)]" />

        <div className="rounded-[32px] border border-[color:var(--settings-border)] bg-[color:var(--settings-card)] p-8 md:p-10">
          <SettingRow
            title="Language"
            description="Select your preferred interface language."
            action={
              <div className="relative min-w-[280px]">
                <select
                  value={selectedLanguage}
                  onChange={(event) => setSelectedLanguage(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[color:var(--settings-border)] bg-[color:var(--settings-muted-surface)] px-5 py-4 pr-14 text-xl text-[color:var(--settings-text)] outline-none transition focus:border-indigo-500"
                >
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--settings-text-muted)]" />
              </div>
            }
          />

          <SettingRow
            title="Sound Effects"
            description="Play sounds for moves, captures, and game events."
            action={
              <Toggle
                enabled={soundEffects}
                onToggle={() => setSoundEffects(!soundEffects)}
              />
            }
          />

          <SettingRow
            title="Animations"
            description="Enable piece movement animations and interface transitions."
            action={
              <Toggle
                enabled={animations}
                onToggle={() => setAnimations(!animations)}
              />
            }
          />
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="font-serif text-4xl text-[color:var(--settings-text)] md:text-[3.3rem]">
          Theme Selection
        </h3>
        <div className="h-px w-full bg-[color:var(--settings-border)]" />

        <div className="grid gap-6 xl:grid-cols-2">
          <ThemeCard
            label="Light Mode"
            mode="light"
            active={themeChoice === "light"}
            onClick={() => setThemeChoice("light")}
          />
          <ThemeCard
            label="Dark Mode"
            mode="dark"
            active={themeChoice === "dark"}
            onClick={() => setThemeChoice("dark")}
          />
        </div>
      </section>
    </div>
  );
}

export default function SettingsStudio() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");
  const [soundEffects, setSoundEffects] = useState(true);
  const [animations, setAnimations] = useState(true);
  const themeChoice = useAppSelector(selectThemeMode);
  const user = useAppSelector(selectAuthUser);

  return (
    <main className="min-h-screen bg-[color:var(--settings-page-bg)] text-[color:var(--settings-text)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="w-full border-b border-[color:var(--settings-border)] bg-[color:var(--settings-sidebar)] px-6 py-8 lg:w-[360px] lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
          <div className="flex items-center justify-between lg:block">
            <div>
              <Link
                href="/play"
                className="font-serif text-[2.1rem] italic tracking-tight text-[color:var(--settings-text)]"
              >
                ONYX GAMBIT
              </Link>
              <p className="mt-2 hidden text-sm uppercase tracking-[0.24em] text-[color:var(--settings-text-muted)] lg:block">
                Studio Controls
              </p>
            </div>
            <Link
              href="/play"
              className="rounded-full border border-[color:var(--settings-border)] px-4 py-2 text-sm text-[color:var(--settings-text-soft)] transition hover:bg-[color:var(--settings-card)] lg:hidden"
            >
              Back
            </Link>
          </div>

          <nav className="mt-8 grid gap-2 lg:mt-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-5 text-left transition ${
                    active
                      ? "bg-[color:var(--settings-card)] text-[color:var(--accent)] shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                      : "text-[color:var(--settings-text-muted)] hover:bg-[color:var(--settings-card)]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[1.05rem] font-medium uppercase tracking-[0.08em]">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[26px] border border-[color:var(--settings-border)] bg-[color:var(--settings-card)] p-5 backdrop-blur-sm lg:mt-auto lg:pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--settings-text-muted)]">
              Active Profile
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f5d58d] via-[#ef9f5b] to-[#5a67ff] text-xl font-bold text-black">
                {(user?.displayName || user?.username || "G").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-medium text-[color:var(--settings-text)]">
                  {user?.displayName || user?.username || "Guest"}
                </p>
                <p className="text-sm text-[color:var(--settings-text-soft)]">
                  {user?.email || "Offline studio mode"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 px-6 py-10 md:px-10 lg:px-16 lg:py-12 xl:px-20">
          <SettingsContent
            activeTab={activeTab}
            selectedLanguage={selectedLanguage}
            soundEffects={soundEffects}
            animations={animations}
            themeChoice={themeChoice}
            setSelectedLanguage={setSelectedLanguage}
            setSoundEffects={setSoundEffects}
            setAnimations={setAnimations}
            setThemeChoice={(mode) => dispatch(setTheme(mode))}
          />
        </section>
      </div>
    </main>
  );
}
