import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook } from '../features/books/hooks/useBooks';
import { useBookSessions } from '../features/sessions/hooks/useSessions';
import { useBookNote, useSaveBookNote } from '../hooks/useNotes';
import { MarkdownEditor } from '../features/notes/components/MarkdownEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ExportMenu } from '../features/notes/components/ExportMenu';
import { AddBookModal } from '../features/books/components/AddBookModal';
import { ArrowLeft, Clock, Edit2, Star } from 'lucide-react';

export const BookNotesPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const { data: book, isLoading: isLoadingBook } = useBook(bookId!);
  const { data: note, isLoading: isLoadingNote } = useBookNote(bookId!);
  const { data: sessionsData } = useBookSessions(bookId!, 1, 50);
  const saveNoteMutation = useSaveBookNote();

  const [content, setContent] = useState('');
  const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    <div className="flex flex-col min-h-screen bg-livrero-background">
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
      <main className="flex flex-1 px-8 py-6 gap-8 w-full">
        {/* Left Column: Book Details */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-4 hidden md:flex">
          {/* Book Info Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full aspect-[2/3] object-cover rounded shadow-sm mb-4" />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-100 rounded shadow-sm mb-4 flex items-center justify-center">
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
              
              <div className="flex flex-col gap-2 mt-2 max-h-64 overflow-y-auto pr-1">
                {sessionsWithNotes.map(session => (
                  <div key={session.id} className="p-2 border border-gray-100 rounded bg-gray-50 text-xs flex flex-col group relative">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-600">
                        {new Date(session.start_time).toLocaleDateString('pt-BR')}
                      </p>
                      <button 
                        onClick={() => handleImportSingleSessionNote(session)}
                        className="text-livrero-primary hover:text-livrero-secondary p-0.5 rounded hover:bg-gray-200 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Importar esta nota"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-500 line-clamp-3">{session.notes}</p>
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
          
          <div className="flex-1 flex flex-col relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[600px]">
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
            
            <div className="flex-1 p-0 flex flex-col">
              {isPreviewMode ? (
                <div className="prose prose-sm md:prose-base prose-headings:text-livrero-primary prose-a:text-livrero-primary max-w-none p-6 font-sans">
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
    </div>
  );
};
