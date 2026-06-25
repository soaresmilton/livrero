import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:
      'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90 active:scale-[0.98] focus-visible:ring-[var(--color-primary)]',
    secondary:
      'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-surface-container)] active:scale-[0.98]',
    ghost:
      'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] active:scale-[0.98]',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} px-5 py-2.5 ${className}`}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
