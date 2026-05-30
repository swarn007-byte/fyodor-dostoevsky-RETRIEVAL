/**
 * Dostoevsky void — auth screen, roaming quotes, oil lamp, and void chat.
 * No photographic images or human portraits.
 */
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { authClient, useSession } from "../lib/auth-client";
import { AppShell } from "../components/layout/AppShell";

/* ─────────────────────────── Roaming quotes ─────────────────────────── */

const ROAMING_QUOTES = [
  { text: "Beauty will save the world", lang: "latin" as const, x: "12%", y: "20%", dur: 24 },
  { text: "Man is a mystery", lang: "latin" as const, x: "68%", y: "16%", dur: 28 },
  { text: "Notes from Underground", lang: "latin" as const, x: "42%", y: "72%", dur: 26 },
  { text: "Душа лечится", lang: "cyrillic" as const, x: "78%", y: "55%", dur: 22 },
  { text: "What for to live", lang: "latin" as const, x: "8%", y: "58%", dur: 30 },
  { text: "Everything is permitted", lang: "latin" as const, x: "55%", y: "38%", dur: 27 },
];

function RoamingQuotes() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {ROAMING_QUOTES.map((q, i) => (
        <motion.p
          key={i}
          className={`absolute max-w-[220px] font-serif text-sm leading-relaxed tracking-wide text-stone-400/20 md:text-base ${
            q.lang === "cyrillic" ? "italic" : ""
          }`}
          style={{ left: q.x, top: q.y }}
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{
            opacity: [0, 0.35, 0.25, 0.4, 0.1],
            y: [0, -18, -36, -54, -72],
            x: [0, 8, -6, 10, -4],
            filter: ["blur(8px)", "blur(0px)", "blur(2px)", "blur(0px)", "blur(6px)"],
          }}
          transition={{
            duration: q.dur,
            delay: i * 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {q.text}
        </motion.p>
      ))}
    </div>
  );
}

/* ─────────────────────────── CSS/SVG oil lamp ─────────────────────────── */

function OilLamp() {
  return (
    <div className="relative z-20 flex flex-col items-center" aria-hidden>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/3 rounded-full bg-amber-500/12 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/8 blur-2xl animate-pulse" />

      <svg
        viewBox="0 0 200 280"
        className="relative h-[min(42vh,320px)] w-auto drop-shadow-[0_0_60px_rgba(201,162,39,0.25)]"
        fill="none"
      >
        <defs>
          <radialGradient id="flameGlow" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#f0c878" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#c9a227" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b6914" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b5a45" />
            <stop offset="50%" stopColor="#4a3f32" />
            <stop offset="100%" stopColor="#2a231c" />
          </linearGradient>
        </defs>

        {/* Flame */}
        <ellipse cx="100" cy="52" rx="28" ry="38" fill="url(#flameGlow)" className="animate-[flicker_3s_ease-in-out_infinite]" />
        <path
          d="M100 20 Q115 45 100 70 Q85 45 100 20"
          fill="#e8c56a"
          opacity="0.85"
          className="animate-[flicker_2.5s_ease-in-out_infinite]"
        />

        {/* Glass chimney */}
        <path
          d="M72 75 Q100 65 128 75 L125 130 Q100 140 75 130 Z"
          stroke="#5a5048"
          strokeWidth="1"
          fill="rgba(30,25,20,0.4)"
        />

        {/* Burner & reservoir */}
        <ellipse cx="100" cy="135" rx="42" ry="12" fill="url(#brass)" />
        <path d="M58 135 L58 200 Q100 220 142 200 L142 135" fill="url(#brass)" stroke="#3d342a" strokeWidth="0.5" />
        <ellipse cx="100" cy="200" rx="44" ry="14" fill="#3d342a" />

        {/* Base */}
        <path d="M70 210 L130 210 L140 250 Q100 265 60 250 Z" fill="#2a231c" stroke="#4a3f32" strokeWidth="0.6" />
      </svg>

      {/* Wooden table surface */}
      <div className="void-desk-surface -mt-2 h-3 w-[min(90vw,420px)] rounded-t-sm" />
    </div>
  );
}

/* ─────────────────────────── Void backdrop (shared) ─────────────────────────── */

export function VoidBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="void-root relative flex min-h-screen flex-col overflow-hidden bg-[#030304] text-stone-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(201,162,39,0.06)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#030304] via-transparent to-[#030304]" />
      <RoamingQuotes />
      {children}
    </div>
  );
}

/* ─────────────────────────── Icons ─────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="opacity-70" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.7" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.55" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.65" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="opacity-70" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ─────────────────────────── Bottom auth drawer ─────────────────────────── */

type AuthMode = "sign-in" | "sign-up";

function AuthDrawer() {
  const navigate = useNavigate();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "sign-up") {
        const { error: err } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (err) throw new Error(err.message ?? "Sign up failed");
      } else {
        const { error: err } = await authClient.signIn.email({
          email: email.trim(),
          password,
          rememberMe: true,
        });
        if (err) throw new Error(err.message ?? "Sign in failed");
      }
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: "google" | "twitter") => {
    setOauthProvider(provider);
    setError(null);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/chat`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} sign-in unavailable`);
      setOauthProvider(null);
    }
  };

  return (
    <div className="relative z-40 mt-auto w-full px-4 pb-6 sm:px-6 sm:pb-8">
      <motion.div
        ref={panelRef}
        layout
        className="mx-auto max-w-md overflow-hidden rounded-t-xl border border-stone-800/60 bg-[#0a0908]/90 shadow-[0_-24px_80px_rgba(0,0,0,0.7)] backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-2 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400 transition-colors hover:text-stone-200"
          aria-expanded={open}
        >
          <span className="text-amber-700/80">✦</span>
          Enter the study
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-stone-600">
            ▾
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-stone-800/50"
            >
              <div className="space-y-3 px-4 py-4 sm:px-5">
                <div className="flex justify-center gap-3 text-[10px] uppercase tracking-widest text-stone-600">
                  <button
                    type="button"
                    onClick={() => setMode("sign-in")}
                    className={mode === "sign-in" ? "text-stone-300" : "hover:text-stone-400"}
                  >
                    Sign in
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => setMode("sign-up")}
                    className={mode === "sign-up" ? "text-stone-300" : "hover:text-stone-400"}
                  >
                    Register
                  </button>
                </div>

                <form id={formId} onSubmit={handleEmail} className="space-y-2">
                  {mode === "sign-up" && (
                    <input
                      className="void-input"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  )}
                  <input
                    className="void-input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <input
                    className="void-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  />
                  {error && (
                    <p className="text-center text-xs text-red-400/90" role="alert">
                      {error}
                    </p>
                  )}
                  <button type="submit" disabled={loading} className="void-btn-primary w-full">
                    {loading ? "…" : mode === "sign-up" ? "Create account" : "Sign in with email"}
                  </button>
                </form>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!!oauthProvider}
                    onClick={() => handleSocial("google")}
                    className="void-btn-social"
                  >
                    <GoogleIcon />
                    <span>{oauthProvider === "google" ? "…" : "Google"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={!!oauthProvider}
                    onClick={() => handleSocial("twitter")}
                    className="void-btn-social"
                  >
                    <TwitterIcon />
                    <span>{oauthProvider === "twitter" ? "…" : "Twitter"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── Auth page (public) ─────────────────────────── */

export function AuthPage() {
  const { data: session, isPending } = useSession();

  if (!isPending && session?.user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <VoidBackdrop>
      <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-4 pt-16 pb-4">
        {isPending ? (
          <div className="h-8 w-8 animate-spin rounded-full border border-stone-700 border-t-amber-700/60" />
        ) : (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 text-center font-serif text-xs uppercase tracking-[0.35em] text-stone-600"
            >
              White Nights
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
            >
              <OilLamp />
            </motion.div>
          </>
        )}
      </main>
      <AuthDrawer />
    </VoidBackdrop>
  );
}

/* ─────────────────────────── Void chat (authenticated) ─────────────────────────── */

export function VoidChatPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  if (!isPending && !session?.user) {
    return <Navigate to="/" replace />;
  }

  return (
    <VoidBackdrop>
      {/* Compact lamp glow in corner */}
      <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2 opacity-40">
        <div className="h-24 w-24 rounded-full bg-amber-500/15 blur-3xl" />
      </div>

      <header className="relative z-30 flex shrink-0 items-center justify-between border-b border-stone-900/80 px-4 py-3 sm:px-6">
        <span className="font-serif text-xs uppercase tracking-[0.25em] text-stone-600">
          White Nights
        </span>
        <div className="flex items-center gap-3">
          {session?.user && (
            <span className="hidden max-w-[140px] truncate text-xs text-stone-500 sm:inline">
              {session.user.name ?? session.user.email}
            </span>
          )}
          <button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              navigate("/", { replace: true });
            }}
            className="text-[10px] uppercase tracking-widest text-stone-600 transition-colors hover:text-stone-400"
          >
            Leave
          </button>
        </div>
      </header>

      <div className="void-chat-shell relative z-20 min-h-0 flex-1">
        {isPending ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border border-stone-800 border-t-amber-800/50" />
          </div>
        ) : (
          <AppShell />
        )}
      </div>
    </VoidBackdrop>
  );
}

export default AuthPage;
