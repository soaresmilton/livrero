import { useToastStore } from '@/store/toastStore'
import { Toast } from './Toast'

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 z-[9999] flex flex-col gap-2 left-4 right-4 items-stretch sm:left-auto sm:right-6 sm:items-end"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  )
}
