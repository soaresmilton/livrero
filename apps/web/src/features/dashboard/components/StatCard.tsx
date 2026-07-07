import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-on-surface-variant)]">{label}</span>
        {icon && <span className="text-[var(--color-primary)]">{icon}</span>}
      </div>
      <span
        className="text-3xl font-semibold text-[var(--color-on-surface)]"
        style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-[var(--color-on-surface-variant)]">{hint}</span>}
    </div>
  )
}
