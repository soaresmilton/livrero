import { useAuthStore } from '@/store/authStore'
import { authService } from '@/features/auth/services/authService'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <header
        className="flex items-center justify-between px-8 py-4 border-b"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>
          <span
            className="text-lg font-semibold"
            style={{ fontFamily: 'Source Serif 4, Georgia, serif', color: 'var(--color-on-surface)' }}
          >
            Livrero
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <div className="text-center max-w-md">
          <h1
            className="mb-3"
            style={{
              fontFamily: 'Source Serif 4, Georgia, serif',
              fontSize: '32px',
              fontWeight: 600,
              color: 'var(--color-on-surface)',
            }}
          >
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p
            className="mb-8"
            style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', lineHeight: '24px' }}
          >
            Your reading sanctuary is ready. The dashboard is coming in Milestone 5 — for now, your authentication is working perfectly!
          </p>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-surface-container)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
              Milestone 1 — Authentication ✓
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
