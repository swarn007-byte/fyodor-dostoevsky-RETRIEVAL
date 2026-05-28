import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,158,255,0.06)_0%,transparent_70%)]" />

      <motion.div
        className="relative z-10 max-w-lg text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Literary AI</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight text-text md:text-5xl">
          White Nights
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">
          Explore Dostoevsky&apos;s novella with an AI assistant grounded in the text.
          Ask about characters, themes, and passages.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/chat"
            className="animate-pulse-glow rounded-xl bg-accent px-8 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Start chatting
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
