import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { ChatListItem } from "./ChatListItem";

type SidebarProps = {
  activeChatId: string | null;
  onCloseMobile?: () => void;
};

export function Sidebar({ activeChatId, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { chats, historyLoading, createChat, deleteChat, setActiveChat } = useChatStore();

  const handleNewChat = () => {
    const id = createChat();
    setActiveChat(id);
    navigate(`/chat/${id}`);
    onCloseMobile?.();
  };

  const handleSelect = (id: string) => {
    setActiveChat(id);
    navigate(`/chat/${id}`);
    onCloseMobile?.();
  };

  const handleDelete = (id: string) => {
    deleteChat(id);
    const remaining = useChatStore.getState().chats;
    const nextId = useChatStore.getState().activeChatId;
    if (id === activeChatId) {
      if (nextId) navigate(`/chat/${nextId}`);
      else navigate("/chat");
    }
    if (remaining.length === 0) navigate("/chat");
  };

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Guest";

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex h-full w-[260px] shrink-0 flex-col bg-surface"
    >
      {/* Header */}
      <div className="border-b border-border/50 px-4 py-5">
        <h1 className="text-sm font-medium tracking-wide text-text">White Nights</h1>
        <p className="mt-0.5 text-[11px] text-text-muted">Literary AI</p>
      </div>

      {/* New chat */}
      <div className="px-3 py-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text transition-colors hover:border-accent/50 hover:bg-elevated/50"
        >
          + New Chat
        </button>
      </div>

      {/* Chat history */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2">
        {historyLoading ? (
          <div className="space-y-2 px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-elevated/60" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-text-muted">No chats yet</p>
        ) : (
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={() => handleSelect(chat.id)}
                onDelete={() => handleDelete(chat.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User profile */}
      <div className="border-t border-border/50 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-medium text-accent">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-text">{displayName}</p>
            <p className="truncate text-[11px] text-text-muted">{user?.email}</p>
          </div>
          <Link
            to="/settings"
            onClick={onCloseMobile}
            className="shrink-0 rounded p-1.5 text-text-muted transition-colors hover:bg-elevated hover:text-text"
            aria-label="Settings"
          >
            <SettingsIcon />
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
