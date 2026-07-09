import type { ReactNode } from 'react'
import { Marginalia } from '@/components/ui/Marginalia'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-5 py-4 transition-all motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-sm cursor-default">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold tracking-[0.16em] uppercase font-sans"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {label}
        </span>
        {icon && <span style={{ color: 'var(--color-primary)' }}>{icon}</span>}
      </div>
      <span className="text-4xl font-bold leading-none mt-1 font-serif" style={{ color: 'var(--color-ink)' }}>
        {value}
      </span>
      {hint && (
        <div className="mt-0.5">
          <Marginalia>{hint}</Marginalia>
        </div>
      )}
    </div>
  )
}
