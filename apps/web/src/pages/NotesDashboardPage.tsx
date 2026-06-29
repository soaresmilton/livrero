import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Calendar, CheckCircle2, BookOpen, Clock,
  ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useRecentNotes } from '../hooks/useNotes';
import { useBooks } from '../features/books/hooks/useBooks';
import type { Book } from '../features/books/types';
import type { ReadingNote } from '../types/note';

const STATUS_LABEL: Record<Book['status'], { label: string; color: string; bg: string }> = {
  WANT_TO_READ: { label: 'Quero Ler',  color: '#854d0e', bg: '#fef9c3' },
  READING:      { label: 'Lendo',      color: '#065f46', bg: '#d1fae5' },
  READ:         { label: 'Lido',       color: '#1e3a5f', bg: '#dbeafe' },
  ABANDONED:    { label: 'Abandonado', color: '#7f1d1d', bg: '#fee2e2' },
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];
type SortField = 'updated_at' | 'title' | 'author' | 'started_reading_at';
type SortDir   = 'asc' | 'desc';

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'updated_at',         label: 'Data da Nota'      },
  { field: 'title',              label: 'Título'            },
  { field: 'author',             label: 'Autor'             },
  { field: 'started_reading_at', label: 'Início de Leitura' },
];

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

function matchesQuery(q: string, note: ReadingNote, book: Book): boolean {
  if (!q.trim()) return true;
  const lq = q.toLowerCase();
  return (
    book.title.toLowerCase().includes(lq)  ||
    book.author.toLowerCase().includes(lq) ||
    (note.content_markdown?.toLowerCase().includes(lq) ?? false) ||
    (fmtDate(note.updated_at)?.toLowerCase().includes(lq) ?? false)
  );
}

function sortItems(
  items: Array<{ note: ReadingNote; book: Book }>,
  field: SortField,
  dir: SortDir,
): Array<{ note: ReadingNote; book: Book }> {
  return [...items].sort((a, b) => {
    let va: string, vb: string;
    if (field === 'updated_at') {
      va = a.note.updated_at ?? '';
      vb = b.note.updated_at ?? '';
    } else if (field === 'started_reading_at') {
      va = a.book.started_reading_at ?? '';
      vb = b.book.started_reading_at ?? '';
    } else {
      va = (a.book[field] as string) ?? '';
      vb = (b.book[field] as string) ?? '';
    }
    const cmp = va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' });
    return dir === 'asc' ? cmp : -cmp;
  });
}

function PagBtn({
  onClick, disabled = false, active = false, title, children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors cursor-pointer border disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        backgroundColor: active ? 'var(--color-primary)'    : 'transparent',
        color:           active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
        borderColor:     active ? 'var(--color-primary)'    : 'var(--color-outline-variant)',
      }}
    >
      {children}
    </button>
  );
}

function buildPageRange(current: number, total: number): Array<number | '...'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | '...'> = [];
  const add = (n: number | '...') => { if (pages[pages.length - 1] !== n) pages.push(n); };
  add(1);
  if (current > 4) add('...');
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) add(i);
  if (current < total - 3) add('...');
  add(total);
  return pages;
}

export const NotesDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [query,     setQuery]     = useState('');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');
  const [pageSize,  setPageSize]  = useState<PageSize>(10);
  const [page,      setPage]      = useState(1);

  const { data: recentNotes, isLoading: isLoadingNotes } = useRecentNotes(500);
  const { data: booksData,   isLoading: isLoadingBooks  } = useBooks(1, 500);

  const booksMap = useMemo(
    () => new Map((booksData?.items ?? []).map((b) => [b.id, b])),
    [booksData],
  );

  const paired = useMemo(() => {
    if (!recentNotes) return [];
    return recentNotes.flatMap((note) => {
      const book = booksMap.get(note.book_id);
      return book ? [{ note, book }] : [];
    });
  }, [recentNotes, booksMap]);

  const filtered = useMemo(
    () => paired.filter(({ note, book }) => matchesQuery(query, note, book)),
    [paired, query],
  );

  const sorted = useMemo(
    () => sortItems(filtered, sortField, sortDir),
    [filtered, sortField, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleQuery    = (v: string)    => { setQuery(v);    setPage(1); };
  const handlePageSize = (s: PageSize)  => { setPageSize(s); setPage(1); };
  const handleSort     = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  if (isLoadingNotes || isLoadingBooks) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-[var(--color-on-surface-variant)]">Carregando notas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <main className="w-full px-8 py-8 md:py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'Source Serif 4, Georgia, serif', color: 'var(--color-on-surface)' }}
            >
              Minhas Anotações
            </h1>
            <p className="mt-2 text-[var(--color-on-surface-variant)] text-lg">
              Suas anotações e reflexões de leitura.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80 flex-shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-on-surface-variant)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Título, autor, conteúdo, data..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm border transition-colors outline-none"
              style={{ backgroundColor: 'var(--color-surface-container-low)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={(e)  => (e.currentTarget.style.borderColor = 'var(--color-outline-variant)')}
            />
            {query && (
              <button onClick={() => handleQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <X size={14} style={{ color: 'var(--color-on-surface-variant)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold mr-auto" style={{ fontFamily: 'Source Serif 4, Georgia, serif', color: 'var(--color-on-surface)' }}>
            {query ? 'Resultados da busca' : 'Atualizadas Recentemente'}
            {sorted.length > 0 && (
              <span className="ml-2 text-sm font-normal align-middle" style={{ color: 'var(--color-on-surface-variant)' }}>
                ({sorted.length} {sorted.length === 1 ? 'nota' : 'notas'})
              </span>
            )}
          </h2>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ArrowUpDown size={14} style={{ color: 'var(--color-on-surface-variant)' }} />
            <span className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>Ordenar:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {SORT_OPTIONS.map(({ field, label }) => {
                const active = field === sortField;
                return (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border"
                    style={{
                      backgroundColor: active ? 'var(--color-primary)'    : 'transparent',
                      color:           active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                      borderColor:     active ? 'var(--color-primary)'    : 'var(--color-outline-variant)',
                    }}
                  >
                    {label}
                    {active && <span className="ml-0.5 text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page size */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>Por página:</span>
            <div className="flex gap-1">
              {PAGE_SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handlePageSize(s)}
                  className="px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border"
                  style={{
                    backgroundColor: pageSize === s ? 'var(--color-primary)'    : 'transparent',
                    color:           pageSize === s ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                    borderColor:     pageSize === s ? 'var(--color-primary)'    : 'var(--color-outline-variant)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
          {paginated.map(({ note, book }) => {
            const status     = STATUS_LABEL[book.status] ?? STATUS_LABEL.WANT_TO_READ;
            const startDate  = fmtDate(book.started_reading_at);
            const finishDate = book.status === 'READ' ? fmtDate(book.finished_reading_at) : null;
            const lastUpdate = fmtDate(note.updated_at);
            const hasProgress = book.total_pages && book.total_pages > 0 && (book.status === 'READING' || book.status === 'READ');
            const progress = hasProgress ? Math.round(((book.current_page ?? 0) / book.total_pages!) * 100) : null;

            return (
              <div
                key={note.id}
                onClick={() => navigate(`/library/${book.id}/notes`)}
                className="flex flex-col rounded-2xl border bg-white hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5 overflow-hidden"
                style={{ borderColor: 'var(--color-outline-variant)' }}
              >
                <div className="flex items-start gap-4 p-4 pb-3">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-14 h-20 object-cover rounded-lg shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-20 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0 text-2xl" style={{ backgroundColor: 'var(--color-surface-container)' }}>
                      📖
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                    <h3 className="font-semibold text-base leading-snug line-clamp-2" style={{ color: 'var(--color-primary)', fontFamily: 'Source Serif 4, Georgia, serif' }}>
                      {book.title}
                    </h3>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-on-surface-variant)' }}>{book.author}</p>
                  </div>
                </div>

                {progress !== null && (
                  <div className="px-4 pb-2">
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-highest)' }}>
                      <div className="h-full bg-[#f8c12a] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {book.current_page ?? 0} / {book.total_pages} páginas ({progress}%)
                    </p>
                  </div>
                )}

                {(startDate || finishDate || lastUpdate) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-2 border-t" style={{ borderColor: 'var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)' }}>
                    {startDate  && <span className="flex items-center gap-1 text-[11px]" style={{ color: '#1da073' }}><Calendar size={11} /> Início: {startDate}</span>}
                    {finishDate && <span className="flex items-center gap-1 text-[11px]" style={{ color: '#1da073' }}><CheckCircle2 size={11} /> Fim: {finishDate}</span>}
                    {lastUpdate && <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}><Clock size={11} /> Nota: {lastUpdate}</span>}
                  </div>
                )}

                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BookOpen size={12} style={{ color: 'var(--color-on-surface-variant)' }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-on-surface-variant)' }}>Anotação</span>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--color-on-surface)' }}>
                    {note.content_markdown || 'Nenhuma anotação ainda...'}
                  </p>
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="col-span-full flex flex-col items-start gap-2 py-12">
              <p className="text-base font-medium" style={{ color: 'var(--color-on-surface)' }}>
                {query ? 'Nenhum resultado encontrado.' : 'Você ainda não possui anotações.'}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                {query ? 'Tente outros termos de busca.' : 'Comece a ler um livro para criar suas primeiras anotações!'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Exibindo {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} de {sorted.length}
            </p>
            <div className="flex items-center gap-1">
              <PagBtn onClick={() => setPage(1)}                                    disabled={safePage === 1}          title="Primeira"><ChevronsLeft  size={16} /></PagBtn>
              <PagBtn onClick={() => setPage((p) => Math.max(1, p - 1))}            disabled={safePage === 1}          title="Anterior"><ChevronLeft   size={16} /></PagBtn>
              {buildPageRange(safePage, totalPages).map((item, i) =>
                item === '...' ? (
                  <span key={`ell-${i}`} className="px-2 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>…</span>
                ) : (
                  <PagBtn key={item} onClick={() => setPage(item as number)} active={item === safePage}>{item}</PagBtn>
                )
              )}
              <PagBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))}  disabled={safePage === totalPages} title="Próxima"><ChevronRight  size={16} /></PagBtn>
              <PagBtn onClick={() => setPage(totalPages)}                           disabled={safePage === totalPages} title="Última"><ChevronsRight size={16} /></PagBtn>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
