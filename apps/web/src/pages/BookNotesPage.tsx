import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook } from '../features/books/hooks/useBooks';
import { useBookSessions, useUpdateSessionNotes } from '../features/sessions/hooks/useSessions';
import { useBookNote, useSaveBookNote } from '../hooks/useNotes';
import { MarkdownEditor } from '../features/notes/components/MarkdownEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ExportMenu } from '../features/notes/components/ExportMenu';
import { AddBookModal } from '../features/books/components/AddBookModal';
import { SessionNoteModal } from '../features/notes/components/SessionNoteModal';
import { ArrowLeft, Clock, Edit2, Star } from 'lucide-react';

export const BookNotesPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const { data: book, isLoading: isLoadingBook } = useBook(bookId!);
  const { data: note, isLoading: isLoadingNote } = useBookNote(bookId!);
  const { data: sessionsData } = useBookSessions(bookId!, 1, 50);
  const saveNoteMutation = useSaveBookNote();
  const updateSessionNotesMutation = useUpdateSessionNotes(bookId!);

  const [content, setContent] = useState('');
  const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<typeof sessionsWithNotes[0] | null>(null);

  useEffect(() => {
    if (note && content === '') {
      setContent(note.content_markdown || '');
    }
  }, [note]);

  const handleChange = (val: string) => {
    setContent(val);

    if (saveTimeout) clearTimeout(saveTimeout);

    setIsSaving(true);
    const timeout = setTimeout(() => {
      saveNoteMutation.mutate(
        { bookId: bookId!, data: { content_markdown: val } },
        {
          onSuccess: () => setIsSaving(false),
          onError: () => setIsSaving(false),
        }
      );
    }, 1000);

    setSaveTimeout(timeout);
  };

  // Filter sessions that actually have notes
  const sessionsWithNotes = sessionsData?.items.filter(s => s.notes && s.notes.trim().length > 0) || [];

  const handleImportSessionNotes = () => {
    if (sessionsWithNotes.length === 0) return;

    let importedText = '\n\n---\n\n## Notas Importadas das Sessões\n\n';
    sessionsWithNotes.forEach(session => {
      const date = new Date(session.start_time).toLocaleDateString('pt-BR');
      importedText += `### Sessão de ${date}\n${session.notes}\n\n`;
    });

    handleChange(content + importedText);
  };

  const handleImportSingleSessionNote = (session: typeof sessionsWithNotes[0]) => {
    const date = new Date(session.start_time).toLocaleDateString('pt-BR');
    const importedText = `\n\n---\n\n## Notas da Sessão (${date})\n\n${session.notes}\n\n`;
    handleChange(content + importedText);
  };

  if (isLoadingBook || isLoadingNote) {
    return <div className="p-8 text-center text-gray-500">Carregando notas...</div>;
  }

  if (!book) {
    return <div className="p-8 text-center text-gray-500">Livro não encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-livrero-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-livrero-secondary cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#6B7D6A]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{book.title}</h1>
            <p className="text-sm text-gray-500">Notas Principais</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 cursor-pointer">
            {isSaving ? 'Salvando...' : 'Salvo'}
          </span>
          <div className="cursor-pointer">
            <ExportMenu
              title={book.title}
              markdownContent={content}
              elementIdToPrint="printable-notes"
            />
          </div>
        </div>
      </header>

      {/* Main Content Split */}
      <main className="flex flex-1 overflow-hidden px-8 py-6 gap-8 w-full">
        {/* Left Column: Book Details */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] hidden md:flex pb-6">
          {/* Book Info Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full object-cover rounded shadow-sm mb-4" style={{ maxHeight: '220px' }} />
            ) : (
              <div className="w-full bg-gray-100 rounded shadow-sm mb-4 flex items-center justify-center" style={{ height: '220px' }}>
                📖
              </div>
            )}
            <h2 className="font-bold text-xl text-livrero-primary leading-tight mb-1" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{book.title}</h2>
            <p className="text-sm text-gray-500 mb-3">{book.author}</p>

            <div className="flex items-center justify-between mt-1">
              <div className="flex flex-wrap gap-1">
                {book.genres && book.genres.length > 0 ? (
                  book.genres.map(g => (
                    <span key={g} className="px-2 py-0.5 bg-[#d4e8d1] text-[#1e311e] text-xs rounded-full">
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">Sem gêneros</span>
                )}
              </div>
              {book.rating && (
                <div className="flex items-center gap-1 text-sm font-medium text-gray-800 ml-2">
                  <Star size={14} className="text-orange-600 fill-orange-600" />
                  {book.rating.toFixed(1)}
                </div>
              )}
            </div>

            {/* Reading Progress */}
            {(book.status === 'READING' || book.status === 'READ') && book.total_pages && book.total_pages > 0 && (() => {
              const current = book.current_page || 0;
              const pct = Math.min(Math.max((current / book.total_pages) * 100, 0), 100);
              const formatTime = (min: number) => {
                if (!min) return '0min';
                const h = Math.floor(min / 60);
                const m = Math.floor(min % 60);
                return h > 0 ? `${h}h ${m}min` : `${m}min`;
              };
              const formatDate = (d: string) =>
                new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

              return (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f8c12a] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-gray-500">
                    {current} / {book.total_pages} páginas ({Math.round(pct)}%)
                  </p>

                  {/* Metrics row */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {book.total_reading_time > 0 && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(book.total_reading_time)}
                      </p>
                    )}
                    {book.started_reading_at && (
                      <p className="text-[11px] font-medium text-[#1da073] flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        Início: {formatDate(book.started_reading_at)}
                      </p>
                    )}
                    {book.status === 'READ' && book.finished_reading_at && (
                      <p className="text-[11px] font-medium text-[#1da073] flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Fim: {formatDate(book.finished_reading_at)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          <button
            onClick={() => navigate(`/sessions/${book.id}`)}
            className="w-full py-3 bg-[#516351] text-white hover:bg-[#435343] transition-colors rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Clock size={18} />
            Iniciar Sessão
          </button>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg font-medium text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit2 size={16} />
              Editar Detalhes
            </button>
          </div>

          {sessionsWithNotes.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <h3 className="text-lg font-bold text-livrero-primary" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Notas das Sessões</h3>
              <p className="text-xs text-gray-500">Você tem {sessionsWithNotes.length} sessão(ões) com notas.</p>
              <button
                onClick={handleImportSessionNotes}
                className="w-full py-2 bg-livrero-surface text-livrero-secondary hover:bg-gray-200 transition-colors text-sm rounded font-medium cursor-pointer"
              >
                Importar para a Nota Principal
              </button>

              <div className="flex flex-col mt-1">
                {sessionsWithNotes.map((session, idx) => (
                  <div key={session.id}>
                    <div className="flex items-center justify-between py-2.5 gap-2">
                      {/* Date + truncated note */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[var(--color-on-surface)]">
                          {new Date(session.start_time).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-[var(--color-on-surface-variant)] truncate mt-0.5">
                          {session.notes}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border"
                          style={{
                            color: 'var(--color-on-surface-variant)',
                            borderColor: 'var(--color-outline-variant)',
                            backgroundColor: 'transparent',
                          }}
                          title="Ver nota completa"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleImportSingleSessionNote(session)}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
                          style={{
                            backgroundColor: 'var(--color-primary-fixed)',
                            color: 'var(--color-on-primary-fixed)',
                          }}
                          title="Inserir no texto"
                        >
                          + Inserir
                        </button>
                      </div>
                    </div>
                    {idx < sessionsWithNotes.length - 1 && (
                      <div className="border-t" style={{ borderColor: 'var(--color-outline-variant)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Column: Editor */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Hidden container for PDF generation - ExportMenu will clone it */}
          <div className="hidden">
            <div id="printable-notes" className="w-[800px] bg-white p-8 text-black">
              <h1 className="text-3xl font-bold mb-8 text-[#6B7D6A]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{book.title} - Notas</h1>
              <div className="prose max-w-none font-sans">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-0">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-600">
                {isPreviewMode ? 'Preview' : 'Editor Markdown'}
              </span>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="text-sm px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer text-gray-700 font-medium"
              >
                {isPreviewMode ? 'Editar' : 'Preview'}
              </button>
            </div>

            <div className="flex-1 p-0 flex flex-col overflow-hidden">
              {isPreviewMode ? (
                <div className="prose prose-sm md:prose-base prose-headings:text-livrero-primary prose-a:text-livrero-primary max-w-none p-6 font-sans h-full overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <MarkdownEditor value={content} onChange={handleChange} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Book Modal */}
      <AddBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={book}
      />

      {/* Session Note Modal */}
      {selectedSession && (
        <SessionNoteModal
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          date={new Date(selectedSession.start_time).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          initialNotes={selectedSession.notes || ''}
          onSave={(notes) => updateSessionNotesMutation.mutate({ sessionId: selectedSession.id, notes })}
          onInsert={(notes) => {
            const date = new Date(selectedSession.start_time).toLocaleDateString('pt-BR');
            const importedText = `\n\n---\n\n## Notas da Sessão (${date})\n\n${notes}\n\n`;
            handleChange(content + importedText);
          }}
        />
      )}
    </div>
  );
};
