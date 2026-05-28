import { useEffect, useRef } from "react";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { InputBar } from "../InputBar/InputBar";
import type { Chat } from "../../store/chatStore";

type ChatWindowProps = {
  chat: Chat;
  onSend: (text: string) => void;
  isSending: boolean;
};

export function ChatWindow({ chat, onSend, isSending }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, isSending]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-[780px] flex-col gap-6">
          {chat.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isSending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border/50 bg-canvas px-4 py-4 md:px-8">
        <div className="mx-auto max-w-[780px]">
          <InputBar onSend={onSend} disabled={isSending} />
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated text-xs text-accent">
        AI
      </div>
      <div className="flex gap-1 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-text-muted/60"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
