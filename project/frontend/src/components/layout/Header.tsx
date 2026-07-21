import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAppStore } from '@/stores/useAppStore';
import { SearchModal } from '@/components/ui/SearchModal';
import { NotificationsDropdown } from '@/components/ui/NotificationsDropdown';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  [ROUTES.dashboard]: { title: 'Dashboard', subtitle: 'Visão geral da plataforma'      },
  [ROUTES.alunos]:    { title: 'Alunos',    subtitle: 'Gerencie alunos e matrículas'   },
  [ROUTES.agenda]:    { title: 'Agenda',    subtitle: 'Aulas e compromissos agendados' },
};

export function Header() {
  const location           = useLocation();
  const { setSidebarOpen } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const page = PAGE_META[location.pathname] ?? { title: 'Plataforma', subtitle: '' };

  /* Global `/` opens search */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <SearchModal open={searchOpen} onClose={closeSearch} />

      <header
        className="relative z-50 h-[60px] shrink-0 flex items-center gap-3 px-4 sm:px-6 bg-white"
        style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
      >
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors border-none bg-transparent cursor-pointer shrink-0"
        >
          <Menu size={17} />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-[#0f172a] leading-none truncate">{page.title}</h1>
          <p className="text-xs text-[#94a3b8] mt-[3px] hidden sm:block truncate">{page.subtitle}</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 h-8 pl-3 pr-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#cbd5e1] hover:shadow-sm transition-all duration-200 cursor-pointer group"
          >
            <Search size={12} className="text-[#94a3b8] group-hover:text-[#0f172a] transition-colors shrink-0" />
            <span className="text-xs text-[#94a3b8] pr-1 hidden lg:block">Buscar...</span>
            <kbd className="text-[0.58rem] font-semibold text-[#94a3b8] bg-white border border-[#e2e8f0] rounded px-[5px] py-[2px] leading-none">
              /
            </kbd>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-[#e2e8f0] hidden sm:block mx-0.5" />

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Profile */}
          <ProfileDropdown />
        </div>
      </header>
    </>
  );
}
