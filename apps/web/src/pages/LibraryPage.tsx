import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useBooks, useUpdateBook, useDeleteBook } from '@/features/books/hooks/useBooks'
import { BookCard } from '@/features/books/components/BookCard'
import { AddBookModal } from '@/features/books/components/AddBookModal'
import { PropertyVisibilityToggle, defaultVisibleProperties, VisibleProperties } from '@/features/books/components/PropertyVisibilityToggle'
import { DeleteConfirmationModal } from '@/features/books/components/DeleteConfirmationModal'
import type { BookStatus, Book } from '@/features/books/types'
import { useEffect } from 'react'

type TabValue = BookStatus | 'TODOS';

const tabs: { label: string; value: TabValue }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Quero Ler', value: 'WANT_TO_READ' },
  { label: 'Lendo', value: 'READING' },
  { label: 'Lido', value: 'READ' },
  { label: 'Abandonado', value: 'ABANDONED' },
];

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('TODOS')
  const [page, setPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const limit = 12

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  const [visibleProperties, setVisibleProperties] = useState<VisibleProperties>(() => {
    const saved = localStorage.getItem('livrero_visible_properties');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultVisibleProperties;
      }
    }
    return defaultVisibleProperties;
  });

  useEffect(() => {
    localStorage.setItem('livrero_visible_properties', JSON.stringify(visibleProperties));
  }, [visibleProperties]);

  const statusFilter = activeTab === 'TODOS' ? undefined : activeTab;
  
  const { data, isLoading } = useBooks(page, limit, statusFilter, debouncedQuery)
  const updateBookMutation = useUpdateBook()
  const deleteBookMutation = useDeleteBook()

  const handleEdit = (book: Book) => {
    setBookToEdit(book)
    setIsAddModalOpen(true)
  }

  const handleDelete = (book: Book) => {
    setBookToDelete(book)
  }

  const confirmDelete = () => {
    if (bookToDelete) {
      deleteBookMutation.mutate(bookToDelete.id, {
        onSuccess: () => {
          setBookToDelete(null)
        }
      })
    }
  }

  return (
    <div className="min-h-full">

      <main className="w-full px-8 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{
                fontFamily: 'Source Serif 4, Georgia, serif',
                color: 'var(--color-on-surface)',
              }}
            >
              Sua Biblioteca
            </h1>
            <p className="mt-2 text-[var(--color-on-surface-variant)] text-lg">
              Uma coleção curada da sua jornada de leitura.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar título, autor ou ISBN..."
                className="pl-9 pr-4 py-2 w-full sm:min-w-[300px] bg-[var(--color-surface-container-low)] border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-on-surface)]"
              />
            </div>
            <PropertyVisibilityToggle 
              visibleProperties={visibleProperties} 
              onChange={setVisibleProperties} 
            />
            <Button 
              onClick={() => {
                setBookToEdit(null)
                setIsAddModalOpen(true)
              }}
              className="shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Livro
            </Button>
          </div>
        </div>

        <div className="mb-8 border-b border-[var(--color-surface-variant)]">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value)
                  setPage(1)
                }}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
                  ${activeTab === tab.value
                    ? 'border-[var(--color-primary)] text-[var(--color-on-surface)]'
                    : 'border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:border-[var(--color-outline-variant)]'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
              {data.items.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onStatusChange={(id, newStatus) => updateBookMutation.mutate({ id, data: { status: newStatus } })}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  visibleProperties={visibleProperties}
                />
              ))}
              
              {/* Dashed Add New Book Card */}
              <div 
                onClick={() => {
                  setBookToEdit(null)
                  setIsAddModalOpen(true)
                }}
                className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[var(--color-outline-variant)] bg-transparent cursor-pointer transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] min-h-[250px]"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-tint)] text-white flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--color-on-surface)]">Adicionar Novo Livro</h3>
                <p className="text-xs mt-1 text-[var(--color-on-surface-variant)]">Importe ou pesquise</p>
              </div>
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-[var(--color-surface-variant)] pt-6">
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  Mostrando página {data.page} de {data.pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={page === data.pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center text-[var(--color-on-surface-variant)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-on-surface)]">Nenhum livro encontrado</h3>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)] max-w-sm">
              {activeTab === 'TODOS' 
                ? "Sua biblioteca está vazia. Comece adicionando seu primeiro livro!" 
                : "Você não tem livros com este status no momento."}
            </p>
            <Button className="mt-6" onClick={() => setIsAddModalOpen(true)}>
              Adicionar Primeiro Livro
            </Button>
          </div>
        )}
      </main>

      <AddBookModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false)
          setBookToEdit(null)
        }} 
        initialData={bookToEdit}
      />
      
      <DeleteConfirmationModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={confirmDelete}
        title={bookToDelete?.title || ''}
        isDeleting={deleteBookMutation.isPending}
      />
    </div>
  )
}
