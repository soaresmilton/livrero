import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-64 h-full flex flex-col shadow-xl" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
            <button 
              className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md z-40 sticky top-0">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Source Serif 4, Georgia, serif', color: 'var(--color-on-surface)' }}>
            Livrero
          </h1>
          <button 
            className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
