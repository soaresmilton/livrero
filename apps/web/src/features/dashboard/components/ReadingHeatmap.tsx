import { useMemo } from 'react'
import type { HeatmapDay } from '../types'

interface ReadingHeatmapProps {
  year: number
  days: HeatmapDay[]
}

// Minutes-read thresholds -> intensity level (0 = none, 4 = most)
function levelFor(count: number): number {
  if (count <= 0) return 0
  if (count <= 30) return 1
  if (count <= 60) return 2
  if (count <= 120) return 3
  return 4
}

const LEVEL_OPACITY = [0, 0.25, 0.5, 0.75, 1]

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function ReadingHeatmap({ year, days }: ReadingHeatmapProps) {
  const { weeks, totalDays } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const day of days) counts.set(day.date, day.count)

    const start = new Date(Date.UTC(year, 0, 1))
    const end = new Date(Date.UTC(year, 11, 31))

    // Pad the first week so the grid aligns to weekday rows
    const cells: Array<{ key: string; count: number } | null> = []
    const leadingBlanks = start.getUTCDay()
    for (let i = 0; i < leadingBlanks; i++) cells.push(null)

    let active = 0
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = toKey(d)
      const count = counts.get(key) ?? 0
      if (count > 0) active++
      cells.push({ key, count })
    }

    const grouped: Array<Array<(typeof cells)[number]>> = []
    for (let i = 0; i < cells.length; i += 7) {
      grouped.push(cells.slice(i, i + 7))
    }
    return { weeks: grouped, totalDays: active }
  }, [year, days])

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-semibold text-[var(--color-on-surface)]"
          style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}
        >
          Hábito de leitura
        </h2>
        <span className="text-sm text-[var(--color-on-surface-variant)]">
          {totalDays} {totalDays === 1 ? 'dia' : 'dias'} de leitura em {year}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <div className="flex flex-col justify-between py-0.5 pr-1 text-[10px] text-[var(--color-on-surface-variant)]">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={label} className={i % 2 === 0 ? '' : 'opacity-0'}>
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => {
                if (!cell) {
                  return <div key={di} className="h-3 w-3" />
                }
                const level = levelFor(cell.count)
                return (
                  <div
                    key={cell.key}
                    title={`${cell.key}: ${cell.count} min`}
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor:
                        level === 0
                          ? 'var(--color-surface-container-high)'
                          : 'var(--color-primary)',
                      opacity: level === 0 ? 1 : LEVEL_OPACITY[level],
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end text-[10px] text-[var(--color-on-surface-variant)]">
        <span>Menos</span>
        {LEVEL_OPACITY.map((op, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor:
                i === 0 ? 'var(--color-surface-container-high)' : 'var(--color-primary)',
              opacity: i === 0 ? 1 : op,
            }}
          />
        ))}
        <span>Mais</span>
      </div>
    </div>
  )
}
