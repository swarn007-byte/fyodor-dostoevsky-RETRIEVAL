import { motion } from "framer-motion";
import { ParticlesBackground } from "./ParticlesBackground";
import { InputBar } from "../InputBar/InputBar";

type EmptyStateProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function EmptyState({ onSend, disabled }: EmptyStateProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4">
      <ParticlesBackground />

      <motion.div
        className="relative z-10 flex w-full max-w-[780px] flex-col items-center gap-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-medium tracking-tight text-text md:text-4xl">
            What&apos;s on your mind?
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            Your literary companion for Dostoevsky&apos;s{" "}
            <em className="text-text/80">White Nights</em>
          </p>
        </div>

        <div className="w-full">
          <InputBar onSend={onSend} disabled={disabled} autoFocus />
        </div>
      </motion.div>
    </div>
  );
}
