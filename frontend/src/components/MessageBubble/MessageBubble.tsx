import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import type { Message } from "../../store/chatStore";

type MessageBubbleProps = {
  message: Message;
  isStreaming?: boolean;
};

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated text-xs text-accent">
          AI
        </div>
      )}

      {isUser ? (
        <div className="max-w-[80%] rounded-2xl bg-panel px-4 py-2.5 text-sm leading-relaxed text-text">
          {message.content}
        </div>
      ) : message.content ? (
        <div className="max-w-[85%] text-sm leading-relaxed text-text/90 prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 list-decimal pl-5">{children}</ol>,
              code: ({ className, children, ...props }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <CodeBlock code={String(children).replace(/\n$/, "")} />
                  );
                }
                return (
                  <code
                    className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-text"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <>{children}</>,
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-amber-600/80 align-middle" />
          )}
        </div>
      ) : isStreaming ? (
        <div className="flex items-center gap-2 py-2 text-sm text-text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-700/60" />
          <span className="text-xs">Thinking…</span>
        </div>
      ) : null}
    </motion.div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-border bg-canvas">
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 rounded-md bg-elevated/80 px-2 py-1 text-[11px] text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-text/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
