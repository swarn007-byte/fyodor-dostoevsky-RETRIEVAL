import { useEffect, useRef } from "react";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { InputBar } from "../InputBar/InputBar";
import type { Chat } from "../../store/chatStore";

type ChatWindowProps = {
  chat: Chat;
  onSend: (text: string) => void;
  isSending: boolean;
  streamingMessageId?: string;
};

export function ChatWindow({ chat, onSend, isSending, streamingMessageId }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, isSending]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-[780px] flex-col gap-6">
          {chat.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={msg.id === streamingMessageId}
            />
          ))}
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

