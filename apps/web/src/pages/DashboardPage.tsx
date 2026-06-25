import { useAuthStore } from '@/store/authStore';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <h1
        className="text-4xl font-semibold tracking-tight"
        style={{
          fontFamily: 'Source Serif 4, Georgia, serif',
          color: 'var(--color-on-surface)',
        }}
      >
        Bem-vindo(a) de volta, {user?.name?.split(' ')[0]} 👋
      </h1>
      <p className="mt-4 text-lg text-neutral-500 dark:text-neutral-400 max-w-lg">
        Seu refúgio de leitura está pronto. O painel completo com estatísticas chegará no Milestone 5!
      </p>
      
      <div className="mt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-full">
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <span className="text-sm font-medium text-[var(--color-on-surface-variant)]">
            Milestone 2.5 — UI Layout
          </span>
        </div>
      </div>
    </div>
  );
}
