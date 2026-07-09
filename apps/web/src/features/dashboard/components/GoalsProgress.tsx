import { Button } from '@/components/ui/Button'
import type { DashboardGoals } from '../types'

interface GoalsProgressProps {
  goals: DashboardGoals
  onEdit: () => void
}

interface BarProps {
  label: string
  current: number
  target: number
  percent: number
  unit?: string
}

function ProgressBar({ label, current, target, percent, unit }: BarProps) {
  const width = Math.min(100, percent)
  const suffix = unit ? ` ${unit}` : ''
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--color-on-surface)]">{label}</span>
        <span className="text-[var(--color-on-surface-variant)]">
          {target > 0 ? `${current} / ${target}${suffix}` : 'Sem meta'}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-container-high)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ backgroundColor: 'var(--color-reading-progress)', width: `${target > 0 ? width : 0}%` }}
        />
      </div>
    </div>
  )
}

export function GoalsProgress({ goals, onEdit }: GoalsProgressProps) {
  const hoursCurrent = Math.round(goals.minutes.current / 60)
  const hoursTarget = Math.round(goals.minutes.target / 60)

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-6 transition-all motion-safe:hover:shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--color-on-surface)] font-serif">
          Metas do ano
        </h2>
        <Button variant="ghost" onClick={onEdit} className="px-3 py-1.5">
          Definir metas
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <ProgressBar
          label="Livros"
          current={goals.books.current}
          target={goals.books.target}
          percent={goals.books.percent}
        />
        <ProgressBar
          label="Páginas"
          current={goals.pages.current}
          target={goals.pages.target}
          percent={goals.pages.percent}
        />
        <ProgressBar
          label="Horas"
          current={hoursCurrent}
          target={hoursTarget}
          percent={goals.minutes.percent}
          unit="h"
        />
      </div>
    </div>
  )
}
