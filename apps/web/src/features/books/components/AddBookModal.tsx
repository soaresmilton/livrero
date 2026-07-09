import React, { useState, useRef, useEffect } from 'react';
import { useBookSearch } from '../hooks/useBookSearch';
import { useAddBook, useUpdateBook } from '../hooks/useBooks';
import { Button } from '@/components/ui/Button';
import type { Book, BookStatus, BookSearchResult } from '../types';

const DEFAULT_GENRES = [
  'Romance', 'Ficção Científica', 'Fantasia', 'Mistério', 'Thriller',
  'Terror', 'Biografia', 'História', 'Filosofia', 'Autoajuda',
  'Negócios', 'Poesia', 'Infantil', 'Jovem Adulto', 'Religião',
  'Ciência', 'Psicologia', 'Arte', 'Arquitetura', 'Tecnologia'
];

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Book | null;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, initialData }) => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'SEARCH'>('MANUAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isbn, setIsbn] = useState('');
  const [status, setStatus] = useState<BookStatus>('WANT_TO_READ');
  const [genres, setGenres] = useState<string[]>([]);
  const [rating, setRating] = useState<number | ''>('');

  const { data: searchResults, isLoading: isSearchLoading } = useBookSearch(searchQuery);
  const addBookMutation = useAddBook();
  const updateBookMutation = useUpdateBook();

  const searchRef = useRef<HTMLDivElement>(null);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setPublisher(initialData.publisher || '');
      setPublishedYear(initialData.published_year?.toString() || '');
      setTotalPages(initialData.total_pages?.toString() || '');
      setCoverUrl(initialData.cover_url || '');
      setIsbn(initialData.isbn || '');
      setStatus(initialData.status || 'WANT_TO_READ');
      setGenres(initialData.genres || []);
      setRating(initialData.rating ?? '');
      setActiveTab('MANUAL');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setPublisher('');
    setPublishedYear('');
    setTotalPages('');
    setCoverUrl('');
    setIsbn('');
    setStatus('WANT_TO_READ');
    setGenres([]);
    setRating('');
    setSearchQuery('');
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSelectBook = (book: BookSearchResult) => {
    setTitle(book.title);
    setAuthor(book.author || '');
    setPublisher(book.publisher || '');
    setPublishedYear(book.first_publish_year ? book.first_publish_year.toString() : '');
    setTotalPages('');
    setIsbn(book.isbn || '');
    
    if (book.cover_url) {
      setCoverUrl(book.cover_url);
    } else {
      setCoverUrl('');
    }
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    const bookData = {
      title,
      author,
      publisher: publisher || null,
      published_year: publishedYear ? parseInt(publishedYear) : null,
      total_pages: totalPages ? parseInt(totalPages) : null,
      cover_url: coverUrl || null,
      isbn: isbn || null,
      status,
      genres,
      rating: rating !== '' ? Number(rating) : null,
    };

    if (initialData) {
      updateBookMutation.mutate(
        { id: initialData.id, data: bookData },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      addBookMutation.mutate(bookData, {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl shadow-xl border flex flex-col max-h-[90dvh]" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-outline-variant)' }}>
        <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)] px-6 py-4">
          <h2 className="text-xl font-semibold text-[var(--color-on-surface)]" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
            {initialData ? 'Editar Livro' : 'Adicionar Novo Livro'}
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--color-outline)' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-on-surface)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-outline)')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!initialData && (
          <div className="border-b border-[var(--color-outline-variant)] px-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('MANUAL')}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'MANUAL'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-on-surface-variant)] hover:border-[var(--color-outline-variant)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                Preenchimento Manual
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SEARCH')}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'SEARCH'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-on-surface-variant)] hover:border-[var(--color-outline-variant)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                Buscar Automaticamente
              </button>
            </nav>
          </div>
        )}

        <form onSubmit={handleSubmit} id="add-book-form" className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'SEARCH' && !initialData && (
              <div className="mb-6 relative" ref={searchRef}>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Buscar na Open Library
                </label>
                <input
                  type="text"
                  placeholder="Digite o título, autor ou ISBN..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearching(true);
                  }}
                  onFocus={() => setIsSearching(true)}
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: 'var(--color-surface-container-lowest)',
                    borderColor: 'var(--color-outline-variant)',
                    color: 'var(--color-on-surface)',
                  }}
                />
                
                {isSearching && searchQuery.length > 2 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg border max-h-60 overflow-auto" style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)' }}>
                    {isSearchLoading ? (
                      <div className="p-4 text-sm text-center" style={{ color: 'var(--color-on-surface-variant)' }}>Buscando...</div>
                    ) : searchResults && searchResults.length > 0 ? (
                      <ul className="py-1">
                        {searchResults.map((book, idx) => (
                          <li
                            key={idx}
                            onClick={() => handleSelectBook(book)}
                            className="px-4 py-2 cursor-pointer flex items-center gap-3 transition-colors"
                            style={{ color: 'var(--color-on-surface)' }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {book.cover_url ? (
                              <img 
                                src={book.cover_url} 
                                alt="" 
                                className="w-8 h-12 object-cover rounded shadow-sm"
                              />
                            ) : (
                              <div className="w-8 h-12 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                                <span className="text-[10px]" style={{ color: 'var(--color-on-surface-variant)' }}>Sem capa</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{book.title}</p>
                              <p className="text-xs truncate" style={{ color: 'var(--color-on-surface-variant)' }}>
                                {book.author}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-sm text-center" style={{ color: 'var(--color-on-surface-variant)' }}>Nenhum livro encontrado.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Título *</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Autor *</label>
                <input
                  required
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Editora (Opcional)</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                    style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Ano (Opcional)</label>
                  <input
                    type="number"
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(e.target.value)}
                    className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                    style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Páginas (Opcional)</label>
                  <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                    style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>ISBN (Opcional)</label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1 mb-3"
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                  placeholder="Ex: 9788532511010"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookStatus)}
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                >
                  <option value="WANT_TO_READ">Quero Ler</option>
                  <option value="READING">Lendo</option>
                  <option value="READ">Lido</option>
                  <option value="ABANDONED">Abandonado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>Avaliação (0 a 5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Gêneros / Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {genres.map(g => (
                    <span key={g} className="px-2 py-1 bg-[#d4e8d1] text-[#1e311e] text-xs rounded-full flex items-center gap-1 border border-[#b8ccb6]">
                      {g}
                      <button type="button" onClick={() => setGenres(genres.filter(x => x !== g))} className="text-red-600 hover:text-red-800 ml-1">×</button>
                    </span>
                  ))}
                </div>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !genres.includes(val)) {
                      setGenres([...genres, val]);
                    }
                  }}
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1 mb-2"
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                >
                  <option value="" disabled>Selecione um gênero da lista...</option>
                  {DEFAULT_GENRES.filter(g => !genres.includes(g)).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ou digite um novo gênero e pressione Enter"
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val && !genres.includes(val)) {
                        setGenres([...genres, val]);
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>URL da Capa</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-1 mb-3"
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                />
                {coverUrl && (
                  <div className="w-24 h-36 rounded-md overflow-hidden border shadow-sm" style={{ borderColor: 'var(--color-outline-variant)' }}>
                    <img src={coverUrl} alt="Preview da capa" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 rounded-b-2xl bg-[var(--color-surface-container-low)] px-6 py-4 border-t border-[var(--color-outline-variant)]">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={addBookMutation.isPending || updateBookMutation.isPending || (activeTab === 'MANUAL' && (!title || !author))}
            >
              {(addBookMutation.isPending || updateBookMutation.isPending) ? 'Salvando...' : 'Salvar Livro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
