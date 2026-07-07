import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useGoal, useUpsertGoal } from '../hooks/useGoals'

const schema = z.object({
  books_goal: z.coerce.number().int().min(0),
  pages_goal: z.coerce.number().int().min(0),
  hours_goal: z.coerce.number().int().min(0),
})

type GoalsFormInput = z.input<typeof schema>
type GoalsFormOutput = z.output<typeof schema>

interface GoalsModalProps {
  isOpen: boolean
  onClose: () => void
  year: number
}

export function GoalsModal({ isOpen, onClose, year }: GoalsModalProps) {
  const { data: goal } = useGoal(year)
  const upsert = useUpsertGoal()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalsFormInput, unknown, GoalsFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { books_goal: 0, pages_goal: 0, hours_goal: 0 },
  })

  useEffect(() => {
    if (goal) {
      reset({
        books_goal: goal.books_goal,
        pages_goal: goal.pages_goal,
        hours_goal: Math.round((goal.minutes_goal ?? 0) / 60),
      })
    }
  }, [goal, reset])

  if (!isOpen) return null

  const onSubmit = handleSubmit(async (values) => {
    await upsert.mutateAsync({
      year,
      data: {
        books_goal: values.books_goal,
        pages_goal: values.pages_goal,
        minutes_goal: values.hours_goal * 60,
      },
    })
    onClose()
  })

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!upsert.isPending ? onClose : undefined}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-xl border border-[var(--color-outline-variant)]">
        <form onSubmit={onSubmit}>
          <div className="p-6">
            <h3
              className="text-xl font-semibold text-[var(--color-on-surface)]"
              style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}
            >
              Metas de {year}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              Defina seus objetivos anuais de leitura. Use 0 para não definir uma meta.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <Input
                id="books_goal"
                type="number"
                min={0}
                label="Meta de livros"
                error={errors.books_goal?.message}
                {...register('books_goal')}
              />
              <Input
                id="pages_goal"
                type="number"
                min={0}
                label="Meta de páginas"
                error={errors.pages_goal?.message}
                {...register('pages_goal')}
              />
              <Input
                id="hours_goal"
                type="number"
                min={0}
                label="Meta de horas"
                error={errors.hours_goal?.message}
                {...register('hours_goal')}
              />
            </div>
          </div>

          <div className="bg-[var(--color-surface-container-low)] px-6 py-4 flex gap-3 justify-end border-t border-[var(--color-outline-variant)]">
            <Button type="button" variant="secondary" onClick={onClose} disabled={upsert.isPending}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={upsert.isPending}>
              Salvar metas
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
