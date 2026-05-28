import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isDirectEntryEmail } from "../constants/auth";
import { useAuthStore } from "../store/authStore";

type AuthMode = "magic" | "password";

export function Login() {
  const { session, signInWithOtp, signInWithPassword, signUpWithPassword, signInDirectEntry } =
    useAuthStore();
  const [mode, setMode] = useState<AuthMode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (session) {
    return <Navigate to="/chat" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isDirectEntryEmail(email)) {
        await signInDirectEntry(email);
        return;
      }

      if (mode === "magic") {
        await signInWithOtp(email);
        setMessage("Check your email for the magic link.");
      } else if (isSignUp) {
        await signUpWithPassword(email, password);
        setMessage("Account created. Check your email to confirm, or sign in.");
      } else {
        await signInWithPassword(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-8"
      >
        <Link to="/" className="text-xs text-text-muted hover:text-text">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-medium text-text">Welcome back</h1>
        <p className="mt-1 text-sm text-text-muted">Sign in to continue chatting</p>

        {/* Mode tabs */}
        <div className="mt-6 flex rounded-lg bg-elevated p-1">
          {(["magic", "password"] as AuthMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md py-1.5 text-xs capitalize transition-colors ${
                mode === m ? "bg-panel text-text" : "text-text-muted hover:text-text"
              }`}
            >
              {m === "magic" ? "Magic link" : "Password"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs text-text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/60 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          {mode === "password" && (
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs text-text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent/60 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-accent">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Please wait…"
              : mode === "magic"
                ? "Send magic link"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
          </button>
        </form>

        {mode === "password" && (
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-4 w-full text-center text-xs text-text-muted hover:text-text"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        )}
      </motion.div>
    </div>
  );
}
