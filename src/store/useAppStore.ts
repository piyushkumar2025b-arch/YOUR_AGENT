import { create } from "zustand";

export interface GlobalNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
}

interface AppStoreState {
  activeAgentModal: string | null;
  setActiveAgentModal: (modalId: string | null) => void;
  
  notifications: GlobalNotification[];
  addNotification: (type: GlobalNotification["type"], title: string, message: string) => void;
  clearNotifications: () => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  theme: "dark" | "light";
  toggleTheme: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  activeAgentModal: null,
  setActiveAgentModal: (modalId) => set({ activeAgentModal: modalId }),

  notifications: [],
  addNotification: (type, title, message) =>
    set((state) => ({
      notifications: [
        {
          id: Math.random().toString(36).substring(2, 9),
          type,
          title,
          message,
          timestamp: new Date().toLocaleTimeString()
        },
        ...state.notifications.slice(0, 49)
      ]
    })),
  clearNotifications: () => set({ notifications: [] }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  theme: "dark",
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" }))
}));
