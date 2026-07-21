import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Menu, ChevronRight, Command } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAppStore } from '@/stores/useAppStore';
import { SearchModal } from '@/components/ui/SearchModal';
import { NotificationsDropdown } from '@/components/ui/NotificationsDropdown';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';

/* ── Tipagens Estritas ── */
export interface PageMeta {
  title: string;
  subtitle: string;
  category?: string;
}

const DEFAULT_META: PageMeta = {
  title: 'Plataforma',
  subtitle: 'Visão geral do sistema',
  category: 'Sistema',
};

const PAGE_META: Record<string, PageMeta> = {
  [ROUTES.dashboard]: {
    title: 'Dashboard',
    subtitle: 'Visão geral da plataforma e métricas',
    category: 'Visão Geral',
  },
  [ROUTES.alunos]: {
    title: 'Alunos',
    subtitle: 'Gerencie alunos, matrículas e histórico',
    category: 'Gestão',
  },
  [ROUTES.agenda]: {
    title: 'Agenda',
    subtitle: 'Aulas e compromissos agendados',
    category: 'Organização',
  },
};

export function Header() {
  const location = useLocation();
  
  // Resolução segura de métodos da Store
  const store = useAppStore() as any;
  const setSidebarOpen = store?.setSidebarOpen ?? (() => {});

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isMac, setIsMac] = useState<boolean>(true);

  /* ==================== Detecção de OS e Scroll ==================== */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsMac(ua.includes('mac'));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ==================== Resolução Dinâmica de Rotas ==================== */
  const page = useMemo<PageMeta>(() => {
    const currentPath = location.pathname;

    if (PAGE_META[currentPath]) {
      return PAGE_META[currentPath];
    }

    const matchedKey = Object.keys(PAGE_META).find(
      (route) => route !== '/' && currentPath.startsWith(route)
    );

    return matchedKey ? (PAGE_META[matchedKey] ?? DEFAULT_META) : DEFAULT_META;
  }, [location.pathname]);

  /* ==================== Atalhos Globais de Teclado ==================== */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isTyping) return;

      const key = e.key ? e.key.toLowerCase() : '';
      if ((key === 'k' && (e.metaKey || e.ctrlKey)) || key === '/') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
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
        role="banner"
        className={`sticky top-0 z-40 h-16 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm'
            : 'bg-white/95 backdrop-blur-sm border-b border-slate-200/60'
        }`}
      >
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 w-full transition-all duration-300">

          {/* ===================== ESQUERDA: NAVEGAÇÃO & TÍTULO ===================== */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Botão Menu Hamburger (Mobile) */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu mobile"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              <Menu size={19} />
            </button>

            {/* Breadcrumb + Título */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
                <span className="font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                  ATL HON
                </span>
                <ChevronRight size={12} className="text-slate-300 flex-shrink-0" />
                {page.category && (
                  <>
                    <span className="text-slate-400 truncate">{page.category}</span>
                    <ChevronRight size={12} className="text-slate-300 flex-shrink-0" />
                  </>
                )}
                <span className="text-blue-600 font-semibold truncate">{page.title}</span>
              </div>

              <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate">
                {page.title}
              </h1>
            </div>
          </div>

          {/* ===================== DIREITA: BUSCA & AÇÕES ===================== */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Barra de Busca - Desktop */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex h-9 items-center gap-3 px-3.5 md:w-56 lg:w-72 xl:w-80 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              aria-label="Abrir busca global"
            >
              <Search size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 truncate pr-2">
                Buscar dados, alunos, rotas...
              </span>
              <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono font-medium px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-slate-400 shadow-sm">
                  {isMac ? <Command size={10} /> : 'Ctrl'} K
                </kbd>
                <kbd className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-slate-400 shadow-sm">
                  /
                </kbd>
              </div>
            </button>

            {/* Ícone de Busca - Mobile */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Abrir busca"
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              <Search size={19} />
            </button>

            {/* Separador Vertical */}
            <div className="w-px h-5 bg-slate-200/80 hidden sm:block mx-0.5" />

            {/* Notificações e Perfil */}
            <div className="flex items-center gap-1">
              <NotificationsDropdown />
              <ProfileDropdown />
            </div>
          </div>

        </div>
      </header>
    </>
  );
}