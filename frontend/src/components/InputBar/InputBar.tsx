import { useRef, useState, type KeyboardEvent } from "react";

type InputBarProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function InputBar({ onSend, disabled, autoFocus }: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-elevated px-3 py-2 transition-colors focus-within:border-accent/60">
        {/* Decorative icons */}
        <button
          type="button"
          disabled
          className="mb-2 shrink-0 p-1.5 text-text-muted/40"
          aria-label="Attach file (coming soon)"
        >
          <PaperclipIcon />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={onKeyDown}
          onInput={adjustHeight}
          rows={1}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder="Ask anything..."
          className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent py-2 text-sm text-text placeholder:text-text-muted/60 focus:outline-none disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="mb-1.5 shrink-0 rounded-xl p-2 text-text-muted transition-all hover:bg-accent/10 hover:text-accent hover:shadow-[0_0_12px_rgba(74,158,255,0.35)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-text-muted/50">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
