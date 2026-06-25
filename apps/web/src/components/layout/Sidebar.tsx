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
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col h-screen border-r border-[var(--color-surface-variant)]" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
      {/* Logo Area */}
      <div className="p-8">
        <h1
          className="text-3xl lg:text-[2rem] font-bold tracking-tight"
          style={{ fontFamily: 'Source Serif 4, Georgia, serif', color: 'var(--color-primary)' }}
        >
          Livrero
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          Seu Santuário Digital
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-sm'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]'
              }`}
            >
              <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-70'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-[var(--color-surface-variant)] flex items-center justify-between">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
