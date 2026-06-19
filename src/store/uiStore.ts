import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isNotesListCollapsed: boolean;
  isAttachmentsOpen: boolean;
  privacyMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarCollapse: () => void;
  toggleNotesListCollapse: () => void;
  toggleAttachmentsPanel: () => void;
  togglePrivacyMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      isNotesListCollapsed: false,
      isAttachmentsOpen: true,
      privacyMode: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleNotesListCollapse: () => set((state) => ({ isNotesListCollapsed: !state.isNotesListCollapsed })),
      toggleAttachmentsPanel: () => set((state) => ({ isAttachmentsOpen: !state.isAttachmentsOpen })),
      togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),
    }),
    {
      name: 'notely-ui-storage',
    }
  )
);
