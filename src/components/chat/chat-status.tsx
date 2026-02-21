import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";

export type ChatStatus = "ready" | "submitted" | "streaming" | string;
type Listener = (status: ChatStatus) => void;

export type ChatStatusEvents = {
  subscribe: (listener: Listener) => () => void;
  emit: (status: ChatStatus) => void;
  get: () => ChatStatus;
};

const ChatStatusContext = createContext<ChatStatusEvents | undefined>(undefined);

export function ChatStatusProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef<Set<Listener>>(new Set());
  const lastStatusRef = useRef<ChatStatus>("ready");

  const statusApi: ChatStatusEvents = useMemo(() => {
    const subscribe = (listener: Listener) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    };
    const emit = (status: ChatStatus) => {
      lastStatusRef.current = status;
      listenersRef.current.forEach((fn) => {
        try {
          fn(status);
        } catch (e) {
          console.error(e);
        }
      });
    };
    const get = () => lastStatusRef.current;
    return { subscribe, emit, get };
  }, []);

  return <ChatStatusContext.Provider value={statusApi}>{children}</ChatStatusContext.Provider>;
}

export function useChatStatusEvents() {
  const ctx = useContext(ChatStatusContext);
  if (!ctx) throw new Error("useChatStatusEvents must be used within ChatStatusProvider");
  return ctx;
}
