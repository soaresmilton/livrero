import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline"
          aria-label="Livrero home"
        >
          {/* Logo mark */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19.5A2.5 2.5 0 016.5 17H20"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{
              fontFamily: 'Source Serif 4, Georgia, serif',
              color: 'var(--color-on-surface)',
            }}
          >
            Livrero
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Page heading */}
          <div className="mb-8">
            <h1
              className="mb-2"
              style={{
                fontFamily: 'Source Serif 4, Georgia, serif',
                fontSize: '28px',
                fontWeight: 600,
                lineHeight: '36px',
                color: 'var(--color-on-surface)',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
