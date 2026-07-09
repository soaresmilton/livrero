import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function MainLayout() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile header: logo + theme toggle. Navigation handled by BottomNav. */}
        <header
          className="md:hidden flex items-center justify-between px-4 h-14 shrink-0 border-b sticky top-0 z-30 backdrop-blur-md"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-surface-container-high) 92%, transparent)',
            borderColor: 'var(--color-outline-variant)',
          }}
        >
          <span
            className="text-xl font-bold font-serif tracking-tight"
            style={{ color: 'var(--color-primary)' }}
          >
            Livrero
          </span>
          <ThemeToggle />
        </header>

        {/* Page content — extra bottom padding on mobile for BottomNav */}
        <main className="flex-1 overflow-y-auto w-full relative pb-14 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
