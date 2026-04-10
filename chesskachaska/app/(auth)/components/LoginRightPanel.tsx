"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginRightPanel() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-bg-secondary flex h-full w-full items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h2 className="text-foreground font-serif text-3xl tracking-wide italic">Enter the Study</h2>
          <p className="text-text-secondary font-mono text-sm">Authenticate your presence to continue.</p>
        </div>
        <div className="space-y-5 font-mono">
          <div className="space-y-1">
            <label className="text-text-secondary text-xs tracking-widest">USERNAME OR EMAIL</label>
            <div className="relative">
              <input type="text" placeholder="grandmaster_vov" className="border-border focus:ring-accent w-full rounded-xl border bg-black/40 px-4 py-3 text-sm focus:ring-1 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-text-secondary flex justify-between text-xs">
              <label className="tracking-widest">PASSWORD</label>
              <Link href='/auth/forgot'>
              <p className="hover:text-accent cursor-pointer transition">FORGOT PASSWORD</p>
              </Link>
            </div>

            <div className="relative">
              <input type={showPassword ? "text" : "password"} className="border-border focus:ring-accent w-full rounded-xl border bg-black/40 px-4 py-3 text-sm focus:ring-1 focus:outline-none" />

              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-secondary absolute top-3 right-3 hover:text-white">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <button className="bg-gradient-btn text-foreground w-full cursor-pointer rounded-xl py-3 font-mono font-medium transition-all hover:opacity-90">Sign In</button>
        <div className="text-text-secondary flex items-center gap-4 text-xs">
          <div className="bg-border h-px flex-1" />
          OR CONTINUE WITH
          <div className="bg-border h-px flex-1" />
        </div>

        <div className="flex gap-4">
          <button className="outline-accent flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-lg bg-black/40 py-3 text-sm outline-[0.1px] transition hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
              {" "}
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.68 1.22 9.17 3.6l6.86-6.86C35.88 2.06 30.39 0 24 0 14.62 0 6.51 5.38 2.69 13.22l7.99 6.2C12.43 13.12 17.7 9.5 24 9.5z"></path> <path fill="#4285F4" d="M46.5 24.5c0-1.63-.15-3.2-.43-4.72H24v9.02h12.67c-.55 2.97-2.19 5.48-4.68 7.18l7.2 5.59c4.2-3.87 6.61-9.57 6.61-16.07z"></path> <path fill="#FBBC05" d="M10.68 28.42A14.44 14.44 0 019.5 24c0-1.54.27-3.03.75-4.42l-7.99-6.2A23.94 23.94 0 000 24c0 3.8.91 7.39 2.69 10.78l7.99-6.36z"></path> <path fill="#34A853" d="M24 48c6.39 0 11.75-2.11 15.66-5.73l-7.2-5.59c-2 1.35-4.57 2.15-8.46 2.15-6.3 0-11.57-3.62-13.32-8.92l-7.99 6.36C6.51 42.62 14.62 48 24 48z"></path>{" "}
            </svg>{" "}
            Google
          </button>
        </div>

        <span className="text-text-secondary flex items-center justify-center text-center text-sm">
          Don&apos;t have an account?
          <Link href="/auth/register">
            <p className="ml-2 cursor-pointer text-yellow-400 hover:underline">Register</p>
          </Link>
        </span>

        <div className="text-text-secondary flex justify-center gap-6 pt-6 text-xs">
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
