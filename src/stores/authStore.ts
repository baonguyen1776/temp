import { create } from 'zustand'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setIsLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const mockUser: User = {
  id: 'user-1',
  name: 'Minh Nguyễn',
  email: 'minh@recall.ai',
  avatar: undefined,
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Default to unauthenticated so users see Landing Page & Login first
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setIsLoading: (loading) =>
    set({ isLoading: loading }),

  login: async (email?: string, _password?: string) => {
    set({ isLoading: true })
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 400))
    const userEmail = email && email.trim() ? email : 'demo@recall.ai'
    set({
      user: { ...mockUser, email: userEmail },
      isAuthenticated: true,
      isLoading: false,
    })
    return true
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}))
