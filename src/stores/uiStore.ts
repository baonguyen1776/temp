import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  darkMode: boolean
  setSidebarOpen: (open: boolean) => void
  setDarkMode: (dark: boolean) => void
  toggleSidebar: () => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDarkMode: (dark) => set({ darkMode: dark }),
  
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleDarkMode: () =>
    set((state) => ({ darkMode: !state.darkMode })),
}))
