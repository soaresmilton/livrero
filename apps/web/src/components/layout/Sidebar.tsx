import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { LayoutDashboard, Library, Clock, StickyNote, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Biblioteca', path: '/library', icon: Library },
  { label: 'Sessões', path: '/sessions', icon: Clock },
  { label: 'Anotações', path: '/notes', icon: StickyNote },
];

const activeLinkClass =
  'bg-[var(--color-surface-container)] text-[var(--color-primary)] font-semibold';
const inactiveLinkClass =
  'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <aside
      className="w-64 flex-shrink-0 hidden md:flex flex-col h-screen border-r border-[var(--color-surface-variant)]"
      style={{ backgroundColor: 'var(--color-surface-container-high)' }}
    >
      {/* Logo Area */}
      <div className="p-8">
        <h1 className="text-3xl lg:text-[2rem] font-bold tracking-tight font-serif" style={{ color: 'var(--color-primary)' }}>
          Livrero
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          Seu Santuário Digital
        </p>
      </div>

      {/* Navigation — nav has no left padding so the indicator can anchor at sidebar wall */}
      <nav className="flex-1 pr-3 space-y-0.5 mt-2" aria-label="Navegação principal">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <div key={item.path} className="relative">
              {isActive && (
                <span
                  className="absolute top-2.5 bottom-2.5 rounded-r-sm pointer-events-none"
                  style={{ left: 0, width: '3px', backgroundColor: 'var(--color-primary)' }}
                />
              )}
              <Link
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`mx-3 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                  isActive ? activeLinkClass : inactiveLinkClass
                }`}
              >
                <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-70'} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div
        className="p-4 border-t border-[var(--color-surface-variant)] flex items-center justify-between"
      >
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-lg"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
