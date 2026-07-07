import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { GoalsModal } from '@/features/goals/components/GoalsModal'
import { useDashboardSummary, useHeatmap } from '@/features/dashboard/hooks/useDashboard'
import { StatCard } from '@/features/dashboard/components/StatCard'
import { CurrentBookCard } from '@/features/dashboard/components/CurrentBookCard'
import { GoalsProgress } from '@/features/dashboard/components/GoalsProgress'
import { ReadingHeatmap } from '@/features/dashboard/components/ReadingHeatmap'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [isGoalsOpen, setIsGoalsOpen] = useState(false)

  const { data: summary, isLoading } = useDashboardSummary(year)
  const { data: heatmap } = useHeatmap(year)

  const hoursRead = summary ? Math.round(summary.minutes_read / 60) : 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-3xl font-semibold tracking-tight text-[var(--color-on-surface)]"
            style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}
          >
            Bem-vindo(a) de volta, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-2 text-[var(--color-on-surface-variant)]">
            Seu refúgio de leitura em {year}.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)]">
          Ano
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-3 py-2 text-sm text-[var(--color-on-surface)] outline-none focus:border-[var(--color-primary)]"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading || !summary ? (
        <div className="py-20 text-center text-[var(--color-on-surface-variant)]">
          Carregando seu painel…
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Livros concluídos"
              value={summary.completed_books_year}
              hint={`${summary.completed_books_total} no total`}
            />
            <StatCard label="Horas lidas" value={`${hoursRead}h`} />
            <StatCard label="Páginas lidas" value={summary.pages_read} />
            <StatCard
              label="Sequência atual"
              value={`${summary.current_streak} ${summary.current_streak === 1 ? 'dia' : 'dias'}`}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CurrentBookCard book={summary.current_book} />
            <GoalsProgress goals={summary.goals} onEdit={() => setIsGoalsOpen(true)} />
          </div>

          <ReadingHeatmap year={year} days={heatmap?.days ?? []} />
        </div>
      )}

      <GoalsModal isOpen={isGoalsOpen} onClose={() => setIsGoalsOpen(false)} year={year} />
    </div>
  )
}
