import { useEffect, useRef } from 'react'
import { useToastStore, type ToastItem } from '@/store/toastStore'

const variantRule: Record<ToastItem['variant'], string> = {
  success: 'var(--color-primary)',
  error: 'var(--color-error)',
  info: 'var(--color-outline)',
}

const variantEyebrow: Record<ToastItem['variant'], string> = {
  success: 'var(--color-primary)',
  error: 'var(--color-error)',
  info: 'var(--color-on-surface-variant)',
}

export function Toast({ id, message, variant, label, isExiting }: ToastItem) {
  const startExit = useToastStore((s) => s.startExit)
  const remove = useToastStore((s) => s.remove)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-dismiss timer
  useEffect(() => {
    const delay = variant === 'error' ? 6000 : 4000
    timerRef.current = setTimeout(() => startExit(id), delay)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [id, variant, startExit])

  // When reduced-motion is on, animationend never fires — remove directly
  useEffect(() => {
    if (!isExiting) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) remove(id)
  }, [isExiting, id, remove])

  function handleAnimationEnd(e: React.AnimationEvent) {
    if (e.animationName === 'toast-exit') remove(id)
  }

  return (
    <div
      className={`w-full sm:w-80 ${isExiting ? 'toast-exit' : 'toast-enter'}`}
      onAnimationEnd={handleAnimationEnd}
      role="status"
      aria-live="polite"
      style={{
        position: 'relative',
        backgroundColor: 'var(--color-surface-container-low)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        padding: '12px 40px 12px 20px',
      }}
    >
      {/* Left accent rule */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          backgroundColor: variantRule[variant],
        }}
      />

      {/* Eyebrow — mirrors RunningHead identity component */}
      <div
        style={{
          fontSize: '10px',
          fontFamily: 'var(--font-sans)',
          fontVariantCaps: 'small-caps',
          letterSpacing: '0.1em',
          fontWeight: 600,
          color: variantEyebrow[variant],
          marginBottom: '3px',
          lineHeight: 1,
        }}
      >
        {label}
      </div>

      {/* Message */}
      <p
        style={{
          fontSize: '14px',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-on-surface)',
          lineHeight: 1.45,
          margin: 0,
        }}
      >
        {message}
      </p>

      {/* Close button */}
      <button
        onClick={() => startExit(id)}
        aria-label="Dismiss"
        style={{
          position: 'absolute',
          top: '8px',
          right: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-on-surface-variant)',
          fontSize: '18px',
          lineHeight: 1,
          padding: '4px',
          borderRadius: '4px',
          opacity: 0.5,
          transition: 'opacity 150ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.5')}
      >
        ×
      </button>
    </div>
  )
}
