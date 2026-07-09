import { Link } from 'react-router-dom'
import { Marginalia } from '@/components/ui/Marginalia'
import type { CurrentBook } from '../types'

interface CurrentBookCardProps {
  book: CurrentBook | null | undefined
}

export function CurrentBookCard({ book }: CurrentBookCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-6 transition-all motion-safe:hover:shadow-sm">
      <h2 className="text-xl font-semibold text-[var(--color-on-surface)] font-serif">
        Lendo agora
      </h2>

      {!book ? (
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Você não está lendo nenhum livro no momento. Escolha um livro na sua biblioteca para
          começar.
        </p>
      ) : (
        <div className="flex gap-4">
          <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-container-high)]">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">📖</div>
            )}
          </div>

          <div className="flex flex-1 flex-col">
            <h3 className="font-semibold text-[var(--color-on-surface)]">{book.title}</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)]">{book.author}</p>

            {book.total_pages ? (
              <div className="mt-2 flex flex-col gap-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-container-high)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: 'var(--color-reading-progress)',
                      width: `${Math.min(100, Math.round((book.current_page / book.total_pages) * 100))}%`,
                    }}
                  />
                </div>
                <Marginalia>
                  Página {book.current_page} de {book.total_pages}
                </Marginalia>
              </div>
            ) : null}

            <Link
              to={`/library/${book.id}/notes`}
              className="mt-auto text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              Continuar lendo →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
