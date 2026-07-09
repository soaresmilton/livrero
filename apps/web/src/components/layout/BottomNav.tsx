import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Library, Clock, StickyNote } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Biblioteca', path: '/library', icon: Library },
  { label: 'Sessões', path: '/sessions', icon: Clock },
  { label: 'Anotações', path: '/notes', icon: StickyNote },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t"
      style={{
        backgroundColor: 'var(--color-surface-container-high)',
        borderColor: 'var(--color-outline-variant)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Navegação principal"
    >
      <div className="flex h-14 items-stretch">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
              style={{
                color: isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-on-surface-variant)',
              }}
            >
              {/* Ex-libris indicator: thin line at top of active tab */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/4 right-1/4 h-[2px] rounded-b-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
