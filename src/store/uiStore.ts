import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  privacyMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  togglePrivacyMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  isSidebarOpen: true,
  privacyMode: false,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),
}));
