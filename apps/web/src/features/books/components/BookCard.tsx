import React from 'react';
import type { Book } from '../types';
import type { VisibleProperties } from './PropertyVisibilityToggle';

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
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      {(!visibleProperties || visibleProperties.cover) && (
        <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
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
          
          {(!visibleProperties || visibleProperties.status) && (
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-md ${statusColors[book.status]}`}>
              {statusLabels[book.status]}
            </span>
          </div>
        )}

        {/* Menu de 3 pontinhos */}
        <div className="absolute top-3 right-3" ref={menuRef}>
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
            <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)] z-10 overflow-hidden">
              <div className="flex flex-col divide-y divide-[var(--color-outline-variant)]" role="menu" aria-orientation="vertical">
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
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 cursor-pointer"
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
        </div>
      )}
      
      <div className="flex flex-1 flex-col p-4">
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
        <div className="mt-2 flex flex-col gap-0.5">
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
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xs text-[var(--color-on-surface-variant)] opacity-0">
            {/* Espaço para alinhar */}
          </span>
          {onStatusChange && (!visibleProperties || visibleProperties.status) && (
            <select
              className="text-xs border border-[var(--color-outline-variant)] rounded-md bg-transparent text-[var(--color-on-surface-variant)] font-medium px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer hover:bg-[var(--color-surface-container-high)] transition-colors"
              value={book.status}
              onChange={(e) => onStatusChange(book.id, e.target.value as Book['status'])}
              onClick={(e) => e.stopPropagation()}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};
