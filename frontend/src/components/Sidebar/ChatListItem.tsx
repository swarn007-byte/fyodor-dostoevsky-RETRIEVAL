import { formatDistanceToNow } from "date-fns";
import type { Chat } from "../../store/chatStore";

type ChatListItemProps = {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export function ChatListItem({ chat, isActive, onSelect, onDelete }: ChatListItemProps) {
  const relativeTime = formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`group relative flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-elevated/80 ${
        isActive ? "border-l-2 border-accent bg-elevated/50 pl-[10px]" : "border-l-2 border-transparent"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text">{chat.title}</p>
        <p className="mt-0.5 text-[11px] text-text-muted">{relativeTime}</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 rounded p-1 text-text-muted opacity-0 transition-opacity hover:bg-panel hover:text-red-400 group-hover:opacity-100"
        aria-label="Delete chat"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}
