"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Pill, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

function LoginPageInner() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");

  return (
    <div className="relative mx-auto h-[560px] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="grid h-full grid-cols-1 md:grid-cols-2">
        <AuthForm mode="signin" active={!isSignUp} onSwitch={() => setIsSignUp(true)} />
        <AuthForm mode="signup" active={isSignUp} onSwitch={() => setIsSignUp(false)} />
      </div>

      <motion.div
        className="absolute top-0 z-10 hidden h-full w-1/2 flex-col items-center justify-center bg-blue-600 px-10 text-center text-white md:flex"
        animate={{ left: isSignUp ? "0%" : "50%" }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <Pill className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-semibold">
          {isSignUp ? "Already have an account?" : "New to HPK Pharmacy?"}
        </h2>
        <p className="mt-3 text-sm text-blue-100">
          {isSignUp
            ? "Sign in to get back to your dashboard."
            : "Create an account to start managing your pharmacy."}
        </p>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-6 rounded-full border border-white/60 px-8 py-2.5 text-sm font-medium transition-colors hover:bg-white hover:text-blue-600"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </motion.div>
    </div>
  );
}

function AuthForm({ mode, active, onSwitch }: { mode: "signin" | "signup"; active: boolean; onSwitch: () => void }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      mode === "signin" ? await login(email, password) : await register(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flex-col justify-center px-8 md:px-14", active ? "flex" : "hidden md:flex")}>
      <div className="mb-2 flex items-center gap-2 md:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Pill className="h-5 w-5" />
        </div>
        <span className="font-semibold">PharmaCare</span>
      </div>

      <h1 className="text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Create an account"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "signin" ? "Sign in to your pharmacy dashboard" : "Set up access to your dashboard"}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@pharmacy.com"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Toggle password visibility">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
          {submitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground md:hidden">
        {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button onClick={onSwitch} className="font-medium text-blue-600">
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}