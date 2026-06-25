import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook, useUpdateBook } from '../features/books/hooks/useBooks';
import { useActiveSession, useStartSession, useEndSession, useDiscardSession } from '../features/sessions/hooks/useSessions';
import { Button } from '@/components/ui/Button';

export const SessionPage = () => {
  const { id: bookId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: book, isLoading: isBookLoading } = useBook(bookId || '');
  const { data: activeSession, isLoading: isSessionLoading } = useActiveSession();
  
  const startSessionMutation = useStartSession();
  const endSessionMutation = useEndSession();
  const discardSessionMutation = useDiscardSession();

  // Timer state
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Form state for finishing
  const [currentPage, setCurrentPage] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Total pages modal state
  const [showTotalPagesModal, setShowTotalPagesModal] = useState(false);
  const [totalPagesInput, setTotalPagesInput] = useState<string>('');
  const updateBookMutation = useUpdateBook();

  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine if we have a session running for THIS book
  const isThisBookSession = activeSession && activeSession.book_id === bookId;

  useEffect(() => {
    if (isThisBookSession && activeSession.start_time) {
      // Calculate elapsed time from backend start_time
      const start = new Date(activeSession.start_time).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - start) / 1000);
      setSeconds(diff > 0 ? diff : 0);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      setSeconds(0);
    }
  }, [activeSession, isThisBookSession]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Pre-fill current page with book's current page when opening the finish modal
  useEffect(() => {
    if (isFinished && book) {
      const startP = book.current_page || 0;
      setCurrentPage(startP.toString());
    }
  }, [isFinished, book]);

  const handleStart = () => {
    if (!bookId || !book) return;
    if (activeSession && activeSession.book_id !== bookId) {
      alert("Você já possui uma sessão ativa para outro livro. Finalize-a primeiro.");
      return;
    }
    
    // Check if total_pages is missing
    if (!book.total_pages) {
      setShowTotalPagesModal(true);
      return;
    }

    startSessionMutation.mutate({ book_id: bookId });
  };

  const handleSaveTotalPages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) return;
    const pages = parseInt(totalPagesInput);
    if (!pages || pages <= 0) return;

    await updateBookMutation.mutateAsync({ id: bookId, data: { total_pages: pages } });
    setShowTotalPagesModal(false);
    startSessionMutation.mutate({ book_id: bookId });
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsFinished(true);
  };

  const handleFinishSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    
    try {
      await endSessionMutation.mutateAsync({ 
        sessionId: activeSession.id, 
        data: { 
          starting_page: null,
          ending_page: parseInt(currentPage) || 0,
          notes: sessionNotes.trim() || null,
        }
      });
      setIsFinished(false);
      navigate('/'); // Volta pra biblioteca ou dashboard
    } catch (error) {
      console.error("Failed to finish session:", error);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  if (isBookLoading || isSessionLoading) {
    return <div className="flex h-full items-center justify-center">Carregando...</div>;
  }

  if (!book) {
    return <div className="flex h-full items-center justify-center">Livro não encontrado.</div>;
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-start pt-12 pb-24 max-w-6xl w-full mx-auto px-4 relative">
      {/* Top Header info */}
      <div className="w-full flex justify-center items-center gap-6 mb-12 p-2 md:p-6">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-20 md:w-24 object-cover rounded shadow-md" />
        ) : (
          <div className="w-20 h-28 md:w-24 md:h-36 bg-[var(--color-surface-container-highest)] rounded shadow-md flex items-center justify-center text-3xl">
            📖
          </div>
        )}
        <div className="text-left">
          <p className="text-xs font-bold tracking-widest text-[var(--color-on-surface-variant)] uppercase mb-2">
            Currently Reading
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-[#6B7D6A]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {book.title}
          </h1>
          <p className="text-base md:text-lg text-[var(--color-on-surface-variant)] mt-1">
            {book.author}
          </p>
        </div>
      </div>

      {!isFinished && (
        <div className={`w-full flex flex-col md:flex-row gap-12 lg:gap-24 items-center md:items-start ${(!isThisBookSession) ? 'justify-center' : 'justify-center'}`}>
          {/* Left Column: Timer & Controls */}
          <div className="flex flex-col items-center flex-shrink-0 w-full md:w-auto max-w-md">
            {/* Timer Circle */}
            <div className="relative flex items-center justify-center mb-12">
        {/* Outer subtle ring */}
        <div className="absolute w-72 h-72 rounded-full border-[1.5px] border-[var(--color-outline-variant)] opacity-50"></div>
        <div className="absolute w-64 h-64 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-64 h-64">
          <span className="text-5xl font-bold text-[var(--color-primary)] tracking-tight font-serif">
            {formatTime(seconds)}
          </span>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-[var(--color-on-surface-variant)]">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#BA1A1A] animate-pulse' : 'bg-neutral-400'}`}></span>
            {isRunning ? 'Session Active' : (activeSession ? 'Session Paused' : 'Ready to Start')}
          </div>
        </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
          {!isThisBookSession && (
            <Button onClick={handleStart} size="lg" className="px-8 bg-[var(--color-primary)] text-white hover:bg-[#5d7362] transition-colors rounded-full font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
              Start Reading
            </Button>
          )}

          {isThisBookSession && (
            <>
              {isRunning ? (
                <Button onClick={() => setIsRunning(false)} size="lg" variant="secondary" className="px-8 rounded-full border border-[var(--color-outline)] text-[var(--color-on-surface)] bg-transparent hover:bg-[var(--color-surface-container-highest)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                  </svg>
                  Pause
                </Button>
              ) : (
                <Button onClick={() => setIsRunning(true)} size="lg" variant="secondary" className="px-8 rounded-full border border-[var(--color-outline)] text-[var(--color-on-surface)] bg-transparent hover:bg-[var(--color-surface-container-highest)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                  Resume
                </Button>
              )}

              <Button onClick={handleStop} size="lg" className="px-8 bg-[#1da073] text-white hover:bg-[#168a62] transition-colors rounded-full font-semibold border-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                </svg>
                Finalizar Leitura
              </Button>

              <Button onClick={() => setShowDiscardModal(true)} size="lg" variant="secondary" className="px-8 rounded-full border border-[var(--color-outline)] text-[var(--color-on-surface)] bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.442.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                </svg>
                Descartar
              </Button>
            </>
          )}
            </div>

            {book.total_pages && book.total_pages > 0 && (
              <div className="mt-12 text-center w-full">
                <p className="text-xs font-bold tracking-widest text-[var(--color-on-surface-variant)] uppercase mb-3">
                  Today's Progress
                </p>
                <div className="w-full h-1.5 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--color-primary)] transition-all duration-1000 ease-out" 
                    style={{ width: `${(book.current_page / book.total_pages) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2 font-medium">
                  {book.current_page} / {book.total_pages} pages
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Session Notes Area */}
          {isThisBookSession && (
            <div className="w-full flex-1 max-w-2xl animate-in fade-in slide-in-from-right-4">
              <label className="block text-sm font-bold tracking-widest text-[var(--color-on-surface-variant)] uppercase mb-4">
                Anotações da Sessão
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Escreva seus pensamentos, reflexões ou citações enquanto lê..."
                className="w-full h-[400px] bg-white border border-[var(--color-outline-variant)] rounded-2xl p-6 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none shadow-sm leading-relaxed"
              />
            </div>
          )}
        </div>
      )}

      {/* Finish Session Form */}
      {isFinished && (
        <div className="w-full max-w-md bg-[var(--color-surface-container-lowest)] rounded-2xl p-8 shadow-xl mt-4 animate-in fade-in slide-in-from-bottom-4 border border-[var(--color-outline-variant)]">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#1da073]/10 text-[#1da073] flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)]" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>Finalizar Sessão</h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">Em qual página você parou?</p>
          </div>

          <form onSubmit={handleFinishSession}>
            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl p-6 mb-8 text-center">
              <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-4 uppercase tracking-wide">
                Página atual
              </label>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  className="w-24 text-center bg-transparent border border-[var(--color-outline)] text-[var(--color-on-surface)] rounded-lg px-2 py-3 text-3xl font-bold focus:outline-none focus:border-[var(--color-primary)]"
                  required
                />
                <span className="text-lg text-[var(--color-on-surface-variant)] font-medium">/ {book.total_pages}</span>
              </div>
              
              {/* Fake progress bar purely visual for mockup matching */}
              <div className="mt-6 h-1.5 w-full bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#f8c12a] transition-all duration-300 ease-out" 
                  style={{ width: `${Math.min(100, Math.max(0, (parseInt(currentPage) || 0) / (book.total_pages || 1) * 100))}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                onClick={() => setIsFinished(false)}
                variant="secondary"
                className="flex-1 py-6 rounded-xl font-semibold bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                disabled={endSessionMutation.isPending}
                className="flex-[2] py-6 rounded-xl font-semibold bg-[#1da073] hover:bg-[#168a62] text-white transition-colors"
              >
                {endSessionMutation.isPending ? 'Salvando...' : '✓ Finalizar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Discard Session Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={!discardSessionMutation.isPending ? () => setShowDiscardModal(false) : undefined}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-xl border border-[var(--color-outline-variant)]">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-[#BA1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-[var(--color-primary)]">
                Descartar Sessão
              </h3>
              <p className="mt-2 text-sm text-center text-[var(--color-on-surface-variant)]">
                Tem certeza que deseja descartar esta sessão de leitura? Nenhum progresso ou tempo lido será salvo.
              </p>
            </div>
            
            <div className="bg-[var(--color-surface-container-low)] px-6 py-4 flex gap-3 justify-end border-t border-[var(--color-outline-variant)]">
              <Button 
                variant="secondary" 
                onClick={() => setShowDiscardModal(false)}
                disabled={discardSessionMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (!activeSession) return;
                  await discardSessionMutation.mutateAsync(activeSession.id);
                  setShowDiscardModal(false);
                  navigate('/');
                }}
                disabled={discardSessionMutation.isPending} 
                className="flex-1 sm:flex-none border-transparent text-white"
                style={{ backgroundColor: '#BA1A1A' }}
              >
                {discardSessionMutation.isPending ? 'Descartando...' : 'Descartar Sessão'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Total Pages Modal */}
      {showTotalPagesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={handleSaveTotalPages} className="bg-[var(--color-surface-container-lowest)] p-6 rounded-2xl shadow-xl w-full max-w-sm border border-[var(--color-outline-variant)]">
            <h3 className="text-xl font-bold mb-2 text-[var(--color-on-surface)]">Quase lá!</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
              Para acompanhar o progresso corretamente, informe o total de páginas do livro.
            </p>
            <input
              type="number"
              value={totalPagesInput}
              onChange={(e) => setTotalPagesInput(e.target.value)}
              placeholder="Total de páginas"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-[var(--color-primary)] mb-6"
              required
            />
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setShowTotalPagesModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={updateBookMutation.isPending} 
                className="flex-1 rounded-xl bg-[var(--color-primary)] text-white"
              >
                {updateBookMutation.isPending ? 'Salvando...' : 'Salvar e Iniciar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Bottom padding for form */}
      <div className="pb-12"></div>
    </div>
  );
};
