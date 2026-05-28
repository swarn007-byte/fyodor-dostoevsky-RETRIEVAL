import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  createdAt: string;
};

type ChatState = {
  chats: Chat[];
  activeChatId: string | null;
  sidebarOpen: boolean;
  historyLoading: boolean;
  isSending: boolean;
  setSidebarOpen: (open: boolean) => void;
  setHistoryLoading: (loading: boolean) => void;
  setIsSending: (sending: boolean) => void;
  setActiveChat: (id: string | null) => void;
  createChat: () => string;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, "id" | "createdAt">) => void;
  getChat: (id: string) => Chat | undefined;
};

function generateTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "New chat";
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      sidebarOpen: false,
      historyLoading: true,
      isSending: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setHistoryLoading: (loading) => set({ historyLoading: loading }),
      setIsSending: (sending) => set({ isSending: sending }),
      setActiveChat: (id) => set({ activeChatId: id }),

      createChat: () => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const chat: Chat = {
          id,
          title: "New chat",
          messages: [],
          updatedAt: now,
          createdAt: now,
        };
        set((state) => ({
          chats: [chat, ...state.chats],
          activeChatId: id,
        }));
        return id;
      },

      deleteChat: (id) =>
        set((state) => {
          const chats = state.chats.filter((c) => c.id !== id);
          const activeChatId =
            state.activeChatId === id ? (chats[0]?.id ?? null) : state.activeChatId;
          return { chats, activeChatId };
        }),

      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id !== chatId) return chat;
            const isFirstUser =
              message.role === "user" && chat.messages.length === 0;
            const newMessage: Message = {
              ...message,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            };
            return {
              ...chat,
              title: isFirstUser ? generateTitle(message.content) : chat.title,
              messages: [...chat.messages, newMessage],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      getChat: (id) => get().chats.find((c) => c.id === id),
    }),
    { name: "white-nights-chats" },
  ),
);
