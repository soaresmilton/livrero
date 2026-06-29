import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Book } from '../types';
import type { VisibleProperties } from './PropertyVisibilityToggle';
import { MarkAsReadModal } from './MarkAsReadModal';
import { AbandonModal } from './AbandonModal';

interface BookCardProps {
  book: Book;
  onStatusChange?: (id: string, newStatus: Book['status']) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  visibleProperties?: VisibleProperties;
}

const statusColors: Record<Book['status'], string> = {
  WANT_TO_READ: 'bg-blue-100 text-blue-800 border-blue-200',
  READING: 'bg-amber-100 text-amber-800 border-amber-200',
  READ: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ABANDONED: 'bg-rose-100 text-rose-800 border-rose-200',
};

const statusLabels: Record<Book['status'], string> = {
  WANT_TO_READ: 'Quero Ler',
  READING: 'Lendo',
  READ: 'Lido',
  ABANDONED: 'Abandonado',
};

export const BookCard: React.FC<BookCardProps> = ({ book, onStatusChange, onEdit, onDelete, visibleProperties }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showMarkAsReadModal, setShowMarkAsReadModal] = React.useState(false);
  const [showAbandonModal, setShowAbandonModal] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const progressPercentage = React.useMemo(() => {
    if (!book.total_pages || book.total_pages <= 0) return 0;
    const current = book.current_page || 0;
    const raw = (current / book.total_pages) * 100;
    return Math.min(Math.max(raw, 0), 100);
  }, [book.current_page, book.total_pages]);

  const canPlay = book.status !== 'READ' && book.status !== 'ABANDONED';

  const formatReadingTime = (minutes: number) => {
    if (!minutes) return '0min';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  const formatStartDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  return (
    <div 
      className="group relative flex flex-col rounded-xl border border-[var(--color-outline-variant)] bg-[#ffffff] shadow-sm transition-all hover:shadow-md hover:-translate-y-1 h-full cursor-pointer"
      onClick={() => navigate(`/library/${book.id}/notes`)}
    >
      {(!visibleProperties || visibleProperties.cover) && (
        <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative rounded-t-[11px]">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={`Capa de ${book.title}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>
      )}
          
      {(!visibleProperties || visibleProperties.status) && (
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-md ${statusColors[book.status]}`}>
            {statusLabels[book.status]}
          </span>
        </div>
      )}

      {/* Menu de 3 pontinhos */}
      <div className="absolute top-3 right-3 z-20" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-1 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors shadow-sm cursor-pointer"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-[#FFFFFF] border border-[var(--color-outline-variant)] z-10 overflow-hidden">
              <div className="flex flex-col divide-y divide-[var(--color-outline-variant)]" role="menu" aria-orientation="vertical">
                {onStatusChange && book.status === 'ABANDONED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onStatusChange(book.id, 'WANT_TO_READ');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Marcar como Quero Ler
                  </button>
                )}
                {onStatusChange && (book.status === 'WANT_TO_READ' || book.status === 'ABANDONED') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onStatusChange(book.id, 'READING');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Marcar como Lendo
                  </button>
                )}
                {onStatusChange && (book.status === 'WANT_TO_READ' || book.status === 'READING' || book.status === 'ABANDONED') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      setShowMarkAsReadModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Marcar como Lido
                  </button>
                )}
                {onStatusChange && (book.status === 'WANT_TO_READ' || book.status === 'READING') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      setShowAbandonModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Abandonar
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    if (onEdit) onEdit(book);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    if (onDelete) onDelete(book);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#BA1A1A] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Excluir
                </button>
              </div>
            </div>
          )}
        </div>
      
      <div className="flex flex-1 flex-col p-4 pb-5 rounded-b-xl bg-[#ffffff]">
        {(!visibleProperties || visibleProperties.title) && (
          <h3 className="line-clamp-2 text-lg font-semibold text-[var(--color-primary)]" title={book.title}>
            {book.title}
          </h3>
        )}
        
        {(!visibleProperties || visibleProperties.author) && (
          <p className="mt-1 line-clamp-1 text-sm text-[var(--color-on-surface-variant)] font-medium" title={book.author}>
            {book.author}
          </p>
        )}

        {/* Informações Extras (Editora, Ano, Páginas) */}
        <div className="mt-2 flex flex-col gap-1">
          {visibleProperties?.genres && book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 mb-1">
              {book.genres.map(g => (
                <span key={g} className="px-1.5 py-0.5 bg-[#d4e8d1] text-[#1e311e] text-[10px] rounded-full">
                  {g}
                </span>
              ))}
            </div>
          )}
          {visibleProperties?.rating && book.rating && (
            <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1 font-medium">
              <Star size={12} className="text-orange-500 fill-orange-500" />
              {book.rating.toFixed(1)}
            </p>
          )}
          {visibleProperties?.publisher && book.publisher && (
            <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {book.publisher}
            </p>
          )}
          {visibleProperties?.published_year && book.published_year && (
            <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {book.published_year}
            </p>
          )}
          {visibleProperties?.total_pages && book.total_pages && (
            <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {book.total_pages} págs
            </p>
          )}
          {visibleProperties?.isbn && book.isbn && (
            <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {book.isbn}
            </p>
          )}
        </div>
        {/* Reading Progress and Metrics */}
        {(book.status === 'READING' || book.status === 'READ') && book.total_pages && book.total_pages > 0 ? (
          <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)] flex flex-col gap-2">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#f8c12a] transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <p className="text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              {book.current_page || 0} / {book.total_pages} páginas ({Math.round(progressPercentage)}%)
            </p>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-[11px] text-[var(--color-on-surface-variant)] flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatReadingTime((book.total_reading_time || 0))}
              </p>
              <p className="text-[11px] text-[var(--color-on-surface-variant)] flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                {book.total_pages} pág.
              </p>
            </div>

            {book.started_reading_at && (
              <p className="text-[11px] font-medium text-[#1da073] flex items-center gap-1 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Início: {formatStartDate(book.started_reading_at)}
              </p>
            )}
            
            {book.status === 'READ' && book.finished_reading_at && (
              <p className="text-[11px] font-medium text-[#1da073] flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fim: {formatStartDate(book.finished_reading_at)}
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canPlay && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/sessions/${book.id}`);
                }}
                title="Iniciar Sessão de Leitura"
                className="bg-[var(--color-primary)] text-white hover:bg-[#5d7362] p-1.5 rounded-md shadow-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <MarkAsReadModal
        isOpen={showMarkAsReadModal}
        title={book.title}
        onClose={() => setShowMarkAsReadModal(false)}
        onConfirm={() => {
          /* istanbul ignore next */
          if (onStatusChange) {
            onStatusChange(book.id, 'READ');
          }
          setShowMarkAsReadModal(false);
        }}
      />

      <AbandonModal
        isOpen={showAbandonModal}
        title={book.title}
        onClose={() => setShowAbandonModal(false)}
        onConfirm={() => {
          /* istanbul ignore next */
          if (onStatusChange) {
            onStatusChange(book.id, 'ABANDONED');
          }
          setShowAbandonModal(false);
        }}
      />


    </div>
  );
};
