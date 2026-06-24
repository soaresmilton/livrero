import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/features/auth/types/auth.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  theme: 'light' | 'dark'
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (token: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      theme: 'light',
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, theme: user.theme, isAuthenticated: true }),

      setAccessToken: (token) => set({ accessToken: token }),

      setTheme: (theme) => set({ theme }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'livrero-auth',
      // Only persist theme — access token stays in memory only
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
