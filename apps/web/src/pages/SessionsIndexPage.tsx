import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveSession } from '../features/sessions/hooks/useSessions';
import { RunningHead } from '@/components/ui/RunningHead';
import { Button } from '@/components/ui/Button';

export const SessionsIndexPage = () => {
  const navigate = useNavigate();
  const { data: activeSession, isLoading } = useActiveSession();

  useEffect(() => {
    if (!isLoading && activeSession?.book_id) {
      navigate(`/sessions/${activeSession.book_id}`);
    }
  }, [activeSession, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3" style={{ color: 'var(--color-on-surface-variant)' }}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--color-primary)' }} />
          <span className="text-sm">Verificando sessão...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full text-center">
        <RunningHead section="Sessões" />

        {/* Ilustração: relógio aberto como livro */}
        <div
          className="mx-auto mb-8 w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-surface-container-high)' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.2}
            stroke="currentColor"
            className="w-10 h-10"
            style={{ color: 'var(--color-primary)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-3 font-serif" style={{ color: 'var(--color-ink)' }}>
          Nenhuma sessão ativa
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--color-on-surface-variant)' }}>
          Escolha um livro na Biblioteca e toque em <strong style={{ color: 'var(--color-on-surface)' }}>Iniciar Sessão</strong> para começar a cronometrar sua leitura.
        </p>

        <Button
          onClick={() => navigate('/library')}
          className="w-full"
        >
          Ir para a Biblioteca
        </Button>

        <p className="mt-4 text-xs" style={{ color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>
          O tempo de leitura e as páginas lidas são registrados automaticamente.
        </p>
      </div>
    </div>
  );
};
