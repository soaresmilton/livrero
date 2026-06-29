import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveSession } from '../features/sessions/hooks/useSessions';
import { Button } from '@/components/ui/Button';

export const SessionsIndexPage = () => {
  const navigate = useNavigate();
  const { data: activeSession, isLoading } = useActiveSession();

  useEffect(() => {
    // Se existir uma sessão ativa e já foi carregada, redireciona pra ela
    if (!isLoading && activeSession?.book_id) {
      navigate(`/sessions/${activeSession.book_id}`);
    }
  }, [activeSession, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Carregando...</div>;
  }

  // Se não tem sessão ativa, mostra um placeholder
  return (
    <div className="flex h-full flex-col items-center justify-center max-w-md mx-auto px-4 py-8 text-center">
      <div className="w-24 h-24 bg-[var(--color-surface-container-highest)] rounded-full flex items-center justify-center mb-6 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[var(--color-primary)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-2" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
        Nenhuma sessão ativa
      </h2>
      <p className="text-[var(--color-on-surface-variant)] mb-8">
        Para iniciar uma sessão de leitura, vá até a sua Biblioteca, escolha o livro que deseja ler e clique no ícone de Play (Iniciar Sessão).
      </p>
      <Button 
        onClick={() => navigate('/library')}
        className="px-8 bg-[var(--color-primary)] text-white hover:bg-[#5d7362] transition-colors rounded-full font-semibold border-none shadow-md"
      >
        Ir para Biblioteca
      </Button>
    </div>
  );
};
