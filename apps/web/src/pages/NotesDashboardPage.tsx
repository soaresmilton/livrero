import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentNotes } from '../hooks/useNotes';
import { useBooks } from '../features/books/hooks/useBooks';

export const NotesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: recentNotes, isLoading: isLoadingNotes } = useRecentNotes(10);
  const { data: booksData, isLoading: isLoadingBooks } = useBooks(1, 100);

  if (isLoadingNotes || isLoadingBooks) {
    return <div className="p-8">Carregando notas...</div>;
  }

  const booksMap = new Map(booksData?.items.map((b) => [b.id, b]) || []);

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-serif text-livrero-primary">Minhas Notas</h1>
        <p className="text-livrero-secondary mt-2">Suas anotações e reflexões de leitura.</p>
      </header>

      <section>
        <h2 className="text-xl font-serif text-livrero-primary mb-4">Atualizadas Recentemente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentNotes?.map((note) => {
            const book = booksMap.get(note.book_id);
            if (!book) return null;

            return (
              <div
                key={note.id}
                onClick={() => navigate(`/library/${book.id}/notes`)}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow cursor-pointer"
              >
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-16 h-24 object-cover rounded shadow-sm" />
                ) : (
                  <div className="w-16 h-24 bg-gray-100 rounded shadow-sm flex items-center justify-center">
                    📖
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-livrero-primary truncate">{book.title}</h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">{book.author}</p>
                  <p className="text-sm text-livrero-secondary line-clamp-3">
                    {note.content_markdown || 'Nenhuma anotação ainda...'}
                  </p>
                </div>
              </div>
            );
          })}
          {recentNotes?.length === 0 && (
            <p className="text-gray-500 text-sm">Você ainda não possui anotações. Comece a ler um livro para anotar!</p>
          )}
        </div>
      </section>
    </div>
  );
};
