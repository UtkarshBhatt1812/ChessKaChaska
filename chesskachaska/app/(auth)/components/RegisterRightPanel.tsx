"use client";

import axios from "axios";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setUser, type AuthUser } from "@/app/store/authSlice";
import { useAppDispatch } from "@/app/store/hooks";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthResponse = {
  message?: string;
  user: AuthUser;
  token: string;
};

export default function RegisterRightPanel() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data } = await axios.post<AuthResponse>(
        "/api/v1/auth/register",
        formData,
        {
          withCredentials: true,
        }
      );

      dispatch(setUser(data.user));
      setSuccessMessage(data.message ?? "Account created successfully.");
      router.replace("/play");
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Unable to create your account."
        );
      } else {
        setErrorMessage("Unable to create your account right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-secondary px-6">
      <div className="w-full max-w-md space-y-8">
    
        <div className="space-y-2">
          <h2 className="text-3xl italic tracking-wide text-foreground font-serif">
            Join the Circle
          </h2>
          <p className="text-sm text-text-secondary font-mono">
            Create your account and begin your ascent.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5 font-mono">
            <div className="space-y-1">
              <label className="text-xs tracking-widest text-text-secondary">
                USERNAME
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(event) => updateField("username", event.target.value)}
                placeholder="grandmaster_vov"
                autoComplete="username"
                required
                minLength={3}
                maxLength={20}
                className="w-full rounded-xl border border-border bg-black/40 px-4 py-3 text-sm placeholder:text-gray-500 focus:ring-1 focus:ring-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs tracking-widest text-text-secondary">
                EMAIL
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-border bg-black/40 px-4 py-3 text-sm placeholder:text-gray-500 focus:ring-1 focus:ring-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs tracking-widest text-text-secondary">
                PASSWORD
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-border bg-black/40 px-4 py-3 text-sm focus:ring-1 focus:ring-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-text-secondary hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs tracking-widest text-text-secondary">
                CONFIRM PASSWORD
              </label>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-border bg-black/40 px-4 py-3 text-sm focus:ring-1 focus:ring-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-text-secondary hover:text-white"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {(errorMessage || successMessage) && (
            <p
              aria-live="polite"
              className={`text-sm font-mono ${
                errorMessage ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {errorMessage || successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-btn py-3 font-mono font-medium text-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>


        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <div className="flex-1 h-px bg-border" />
          OR CONTINUE WITH
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* GOOGLE */}
        <div className="flex gap-4">
          <button
            type="button"
            className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-lg bg-black/40 py-3 text-sm outline-[0.1px] outline-accent transition hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.68 1.22 9.17 3.6l6.86-6.86C35.88 2.06 30.39 0 24 0 14.62 0 6.51 5.38 2.69 13.22l7.99 6.2C12.43 13.12 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.63-.15-3.2-.43-4.72H24v9.02h12.67c-.55 2.97-2.19 5.48-4.68 7.18l7.2 5.59c4.2-3.87 6.61-9.57 6.61-16.07z"/>
              <path fill="#FBBC05" d="M10.68 28.42A14.44 14.44 0 019.5 24c0-1.54.27-3.03.75-4.42l-7.99-6.2A23.94 23.94 0 000 24c0 3.8.91 7.39 2.69 10.78l7.99-6.36z"/>
              <path fill="#34A853" d="M24 48c6.39 0 11.75-2.11 15.66-5.73l-7.2-5.59c-2 1.35-4.57 2.15-8.46 2.15-6.3 0-11.57-3.62-13.32-8.92l-7.99 6.36C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google
          </button>
        </div>


        <p className="text-center text-sm text-text-secondary flex justify-center items-center">
          Already have an account?
          <Link href="/login">
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
