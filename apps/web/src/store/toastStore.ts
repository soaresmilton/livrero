import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  label: string
  isExiting: boolean
}

interface ToastStore {
  toasts: ToastItem[]
  add: (toast: Omit<ToastItem, 'id' | 'isExiting'>) => void
  startExit: (id: string) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (item) =>
    set((state) => ({
      // cap at 3 toasts; discard oldest when full
      toasts: [
        ...state.toasts.slice(-2),
        { ...item, id: crypto.randomUUID(), isExiting: false },
      ],
    })),
  startExit: (id) =>
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, isExiting: true } : t)),
    })),
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

// Singleton — safe to call from React Query mutation callbacks (not hook context)
export const toast = {
  success: (message: string, label = 'SAVED') =>
    useToastStore.getState().add({ message, variant: 'success', label }),
  error: (message: string, label = 'ERROR') =>
    useToastStore.getState().add({ message, variant: 'error', label }),
  info: (message: string, label = 'NOTE') =>
    useToastStore.getState().add({ message, variant: 'info', label }),
}
