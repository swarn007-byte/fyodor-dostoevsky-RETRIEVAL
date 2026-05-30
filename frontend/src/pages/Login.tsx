import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isDirectEntryEmail } from "../constants/auth";
import { useAuthStore } from "../store/authStore";
import { signIn } from "../lib/auth-client"; // Import the Better Auth signIn helper

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

  // Google OAuth click handler via Better Auth
  // Google OAuth click handler via Better Auth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/chat",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed");
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

        {/* --- GOOGLE OAUTH SECTION --- */}
        <div className="mt-6">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute w-full border-t border-border/60"></div>
            <span className="relative bg-surface px-3 text-xs text-text-muted">Or continue with</span>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-elevated py-2.5 text-sm font-medium text-text transition-colors hover:bg-panel disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.3-4.53z"
              />
            </svg>
            Google
          </button>
        </div>
        {/* ----------------------------- */}
      </motion.div>
    </div>
  );
}