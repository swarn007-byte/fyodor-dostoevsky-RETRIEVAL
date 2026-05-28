import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";

export function Settings() {
  const { user, signOut } = useAuthStore();
  const { chats } = useChatStore();
  const [theme, setTheme] = useState(() => localStorage.getItem("wn-theme") ?? "dark");

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-lg px-6 py-10">
        <Link to="/chat" className="text-xs text-text-muted hover:text-text">
          ← Back to chat
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h1 className="text-2xl font-medium text-text">Settings</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your account and preferences</p>

          <section className="mt-8 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-medium text-text">Account</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-text-muted">Email</dt>
                  <dd className="mt-0.5 text-text">{user?.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">User ID</dt>
                  <dd className="mt-0.5 truncate font-mono text-xs text-text/80">
                    {user?.id ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-muted">Local chats</dt>
                  <dd className="mt-0.5 text-text">{chats.length}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-medium text-text">Appearance</h2>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-text-muted">Theme</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = theme === "dark" ? "light" : "dark";
                    localStorage.setItem("wn-theme", next);
                    setTheme(next);
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted capitalize"
                >
                  {theme} (placeholder)
                </button>
              </div>
              <p className="mt-2 text-[11px] text-text-muted/70">
                Light theme support coming soon. Dark is the default.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-lg border border-red-500/30 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              Sign out
            </button>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
