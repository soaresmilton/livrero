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
  }, [note, content]);

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
    return <div className="p-8 text-center text-[var(--color-on-surface-variant)]">Carregando notas...</div>;
  }

  if (!book) {
    return <div className="p-8 text-center text-[var(--color-on-surface-variant)]">Livro não encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{
          backgroundColor: 'var(--color-surface-container-high)',
          borderColor: 'var(--color-outline-variant)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full transition-colors cursor-pointer"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-highest)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif" style={{ color: 'var(--color-ink)' }}>{book.title}</h1>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Notas Principais</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm cursor-pointer" style={{ color: 'var(--color-on-surface-variant)' }}>
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
      <main className="flex flex-1 overflow-hidden px-6 py-5 gap-6 w-full">
        {/* Left Column: Book Details */}
        <aside className="w-68 flex-shrink-0 flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] hidden md:flex pb-6">
          {/* Book Info Card */}
          <div
            className="p-4 rounded-xl border flex flex-col"
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              borderColor: 'var(--color-outline-variant)',
            }}
          >
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full object-cover rounded shadow-sm mb-4" style={{ maxHeight: '220px' }} />
            ) : (
              <div
                className="w-full rounded shadow-sm mb-4 flex items-center justify-center text-3xl"
                style={{ height: '220px', backgroundColor: 'var(--color-surface-container-highest)' }}
              >
                📖
              </div>
            )}
            <h2 className="font-bold text-xl leading-tight mb-1 font-serif" style={{ color: 'var(--color-ink)' }}>{book.title}</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>{book.author}</p>

            <div className="flex items-center justify-between mt-1">
              <div className="flex flex-wrap gap-1">
                {book.genres && book.genres.length > 0 ? (
                  book.genres.map(g => (
                    <span
                      key={g}
                      className="px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: 'var(--color-primary-fixed)',
                        color: 'var(--color-on-primary-fixed)',
                      }}
                    >
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic" style={{ color: 'var(--color-on-surface-variant)' }}>Sem gêneros</span>
                )}
              </div>
              {book.rating && (
                <div className="flex items-center gap-1 text-sm font-medium ml-2" style={{ color: 'var(--color-on-surface)' }}>
                  <Star size={14} className="text-orange-500 fill-orange-500" />
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
                <div
                  className="mt-4 pt-4 border-t flex flex-col gap-2"
                  style={{ borderColor: 'var(--color-outline-variant)' }}
                >
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-highest)' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ backgroundColor: 'var(--color-reading-progress)', width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {current} / {book.total_pages} páginas ({Math.round(pct)}%)
                  </p>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {(book.total_reading_time || 0) > 0 && (
                      <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime((book.total_reading_time || 0))}
                      </p>
                    )}
                    {book.started_reading_at && (
                      <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--color-reading-date)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        Início: {formatDate(book.started_reading_at)}
                      </p>
                    )}
                    {book.status === 'READ' && book.finished_reading_at && (
                      <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--color-reading-date)' }}>
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
            className="w-full py-3 transition-colors rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <Clock size={18} />
            Iniciar Sessão
          </button>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full py-2 border transition-colors rounded-lg font-medium text-sm cursor-pointer flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--color-outline-variant)',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              <Edit2 size={16} />
              Editar Detalhes
            </button>
          </div>

          {sessionsWithNotes.length > 0 && (
            <div
              className="p-4 rounded-xl border flex flex-col gap-3"
              style={{
                backgroundColor: 'var(--color-surface-container-low)',
                borderColor: 'var(--color-outline-variant)',
              }}
            >
              <h3 className="text-lg font-bold font-serif" style={{ color: 'var(--color-ink)' }}>Notas das Sessões</h3>
              <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>Você tem {sessionsWithNotes.length} sessão(ões) com notas.</p>
              <button
                onClick={handleImportSessionNotes}
                className="w-full py-2 border transition-colors text-sm rounded font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface-container)',
                  borderColor: 'var(--color-outline-variant)',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                Importar para a Nota Principal
              </button>

              <div className="flex flex-col mt-1">
                {sessionsWithNotes.map((session, idx) => (
                  <div key={session.id}>
                    <div className="flex items-center justify-between py-2.5 gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: 'var(--color-on-surface)' }}>
                          {new Date(session.start_time).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                          {session.notes}
                        </p>
                      </div>
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
          {/* Hidden container for PDF generation — always light theme */}
          <div className="hidden">
            <div id="printable-notes" className="w-[800px] bg-white p-8 text-black">
              <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#4f604f' }}>{book.title} - Notas</h1>
              <div className="prose max-w-none font-sans">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          <div
            className="flex-1 flex flex-col relative rounded-xl overflow-hidden shadow-sm min-h-0 border"
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderColor: 'var(--color-outline-variant)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2 border-b"
              style={{
                backgroundColor: 'var(--color-surface-container-low)',
                borderColor: 'var(--color-outline-variant)',
              }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--color-on-surface-variant)' }}>
                {isPreviewMode ? 'Preview' : 'Editor Markdown'}
              </span>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="text-sm px-3 py-1 border rounded transition-colors cursor-pointer font-medium"
                style={{
                  backgroundColor: 'var(--color-surface-container)',
                  borderColor: 'var(--color-outline-variant)',
                  color: 'var(--color-on-surface)',
                }}
              >
                {isPreviewMode ? 'Editar' : 'Preview'}
              </button>
            </div>

            <div className="flex-1 p-0 flex flex-col overflow-hidden">
              {isPreviewMode ? (
                <div className="prose prose-sm md:prose-base max-w-none p-6 font-sans h-full overflow-y-auto" style={{ color: 'var(--color-on-surface)' }}>
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
