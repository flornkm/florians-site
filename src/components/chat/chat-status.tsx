import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";

export type ChatStatus = "ready" | "submitted" | "streaming" | string;
type Listener = (status: ChatStatus) => void;

export type ChatStatusEvents = {
  subscribe: (listener: Listener) => () => void;
  emit: (status: ChatStatus) => void;
  get: () => ChatStatus;
};

const ChatStatusContext = createContext<ChatStatusEvents | undefined>(undefined);
type ChatAction = string;
type ActionListener = (action: ChatAction) => void;
export type ChatActionEvents = {
  subscribe: (listener: ActionListener) => () => void;
  emit: (action: ChatAction) => void;
  get: () => ChatAction;
};
const ChatActionContext = createContext<ChatActionEvents | undefined>(undefined);

export function ChatStatusProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef<Set<Listener>>(new Set());
  const lastStatusRef = useRef<ChatStatus>("ready");
  const actionListenersRef = useRef<Set<ActionListener>>(new Set());
  const lastActionRef = useRef<ChatAction>("none");

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
  const actionApi: ChatActionEvents = useMemo(() => {
    const subscribe = (listener: ActionListener) => {
      actionListenersRef.current.add(listener);
      return () => actionListenersRef.current.delete(listener);
    };
    const emit = (action: ChatAction) => {
      lastActionRef.current = action;
      actionListenersRef.current.forEach((fn) => {
        try {
          fn(action);
        } catch (e) {
          console.error(e);
        }
      });
    };
    const get = () => lastActionRef.current;
    return { subscribe, emit, get };
  }, []);

  return (
    <ChatActionContext.Provider value={actionApi}>
      <ChatStatusContext.Provider value={statusApi}>{children}</ChatStatusContext.Provider>
    </ChatActionContext.Provider>
  );
}

export function useChatStatusEvents() {
  const ctx = useContext(ChatStatusContext);
  if (!ctx) throw new Error("useChatStatusEvents must be used within ChatStatusProvider");
  return ctx;
}

export function useChatActionEvents() {
  const ctx = useContext(ChatActionContext);
  if (!ctx) throw new Error("useChatActionEvents must be used within ChatStatusProvider");
  return ctx;
}
