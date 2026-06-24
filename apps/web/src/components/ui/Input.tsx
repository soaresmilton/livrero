import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-semibold tracking-wide"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full rounded-lg px-4 py-3 text-sm outline-none transition-all duration-150
            border focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-error)]' : 'border-[var(--color-outline-variant)]'}
            ${className}`}
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            color: 'var(--color-on-surface)',
          }}
          {...props}
        />
        {error && (
          <span
            className="text-xs"
            style={{ color: 'var(--color-error)' }}
          >
            {error}
          </span>
        )}
        {hint && !error && (
          <span
            className="text-xs"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {hint}
          </span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
