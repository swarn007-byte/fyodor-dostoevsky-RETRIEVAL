import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";
import { useChatStore } from "../../store/chatStore";
import { EmptyState } from "../EmptyState/EmptyState";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import { streamQuestion } from "../../api/chat"; // You can replace this import with your static API fetch if preferred

export function AppShell() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const {
    chats,
    activeChatId,
    sidebarOpen,
    isSending,
    setSidebarOpen,
    setHistoryLoading,
    setIsSending,
    setActiveChat,
    createChat,
    addMessage,
    setMessageContent,
    getChat,
  } = useChatStore();

  // Simulate initial history load from localStorage
  useEffect(() => {
    const t = setTimeout(() => setHistoryLoading(false), 400);
    return () => clearTimeout(t);
  }, [setHistoryLoading]);

  // Sync URL param with active chat
  useEffect(() => {
    if (id) {
      const exists = chats.some((c) => c.id === id);
      if (exists) setActiveChat(id);
    } else {
      setActiveChat(null);
    }
  }, [id, chats, setActiveChat]);

  const activeChat = activeChatId ? getChat(activeChatId) : undefined;
  const showEmpty = !activeChat || activeChat.messages.length === 0;

  // REMOVED STREAMING: Now handles full block updates
  const handleSend = async (text: string) => {
    let chatId = activeChatId;

    if (!chatId) {
      chatId = createChat();
      navigate(`/chat/${chatId}`, { replace: true });
    }

    // 1. Immediately append the user's message
    addMessage(chatId, { role: "user", content: text });
    
    // 2. Create a placeholder for the assistant message showing a loading state or blank
    const assistantId = addMessage(chatId, { role: "assistant", content: "Thinking..." });
    setIsSending(true);

    try {
      let fullResponse = "";

      // If your backend still sends stream chunks but you just want the UI to wait, 
      // accumulate the tokens silently without updating the component state on every character.
      await streamQuestion(text, {
        onToken: (token) => {
          fullResponse += token; 
        },
        onReplace: (answer) => {
          fullResponse = answer;
        },
        onError: (message) => {
          throw new Error(message);
        },
      });

      // 3. Update the UI exactly ONCE with the fully generated answer
      setMessageContent(chatId, assistantId, fullResponse);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setMessageContent(
        chatId,
        assistantId,
        `Sorry — ${message} Please try again.`,
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar activeChatId={activeChatId} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 md:hidden"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Sidebar
                activeChatId={activeChatId}
                onCloseMobile={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center gap-3 border-b border-border/50 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-text-muted hover:bg-elevated hover:text-text"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <span className="text-sm font-medium text-text">White Nights</span>
        </header>

        {showEmpty && !isSending ? (
          <EmptyState onSend={handleSend} disabled={isSending} />
        ) : activeChat ? (
          <ChatWindow
            chat={activeChat}
            onSend={handleSend}
            isSending={isSending}
            streamingMessageId={undefined} // Set to undefined since we are no longer rendering active streams
          />
        ) : (
          <EmptyState onSend={handleSend} disabled={isSending} />
        )}
      </main>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}