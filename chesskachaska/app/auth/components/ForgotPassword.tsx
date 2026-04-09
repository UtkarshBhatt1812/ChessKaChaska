"use client";

import Link from "next/link";

export default function ForgotPasswordPanel() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-secondary px-6">
      <div className="w-full max-w-md space-y-8">
        

        <div className="space-y-2">
          <h2 className="text-3xl italic tracking-wide text-foreground font-serif">
            Recover Access
          </h2>
          <p className="text-sm text-text-secondary font-mono">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        <div className="space-y-5 font-mono">
          <div className="space-y-1">
            <label className="text-xs tracking-widest text-text-secondary">
              EMAIL
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
            />
          </div>
        </div>

        <button className="w-full rounded-xl bg-gradient-btn py-3 font-mono font-medium text-foreground transition-all hover:opacity-90">
          Send Reset Link
        </button>

        <p className="text-center text-sm text-text-secondary flex justify-center items-center">
          Remember your password?
          <Link href="/auth/login">
            <span className="text-yellow-400 cursor-pointer hover:underline ml-2">
              Sign In
            </span>
          </Link>
        </p>

        <div className="flex justify-center gap-6 text-xs text-text-secondary pt-6">
          <span className="hover:text-foreground cursor-pointer">PRIVACY POLICY</span>
          <span>•</span>
          <span className="hover:text-foreground cursor-pointer">TERMS</span>
          <span>•</span>
          <span className="hover:text-foreground cursor-pointer">SECURITY</span>
        </div>

      </div>
    </div>
  );
}