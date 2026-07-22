import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Menu, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAppStore } from '@/stores/useAppStore';
import { SearchModal } from '@/components/ui/SearchModal';
import { NotificationsDropdown } from '@/components/ui/NotificationsDropdown';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';

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
  [ROUTES.financeiro]: {
    title: 'Financeiro',
    subtitle: 'Receitas, despesas e inadimplência',
    category: 'Gestão',
  },
  [ROUTES.relatorios]: {
    title: 'Relatórios',
    subtitle: 'Métricas e análise de performance',
    category: 'Análise',
  },
  [ROUTES.dietas]: {
    title: 'Planos Alimentares',
    subtitle: 'Gestão de dietas e metas nutricionais',
    category: 'Saúde',
  },
  [ROUTES.perfil]: {
    title: 'Meu Perfil',
    subtitle: 'Dados pessoais e preferências da conta',
    category: 'Conta',
  },
  [ROUTES.configuracoes]: {
    title: 'Configurações',
    subtitle: 'Preferências e configurações do sistema',
    category: 'Sistema',
  },
};

export function Header() {
  const location = useLocation();

  // Acesso tipado ao store (ajuste a propriedade de acordo com seu Zustand store)
  const setSidebarOpen = useAppStore((state) => state?.setSidebarOpen) ?? (() => {});

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [isMac, setIsMac] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.userAgent.toLowerCase().includes('mac'));
    }
  }, []);

  const page = useMemo<PageMeta>(() => {
    const currentPath = location.pathname;
    if (PAGE_META[currentPath]) return PAGE_META[currentPath];
    const matchedKey = Object.keys(PAGE_META).find(
      (route) => route !== '/' && currentPath.startsWith(route),
    );
    return matchedKey ? (PAGE_META[matchedKey] ?? DEFAULT_META) : DEFAULT_META;
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      if (isTyping) return;
      
      const key = e.key?.toLowerCase() ?? '';
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
        className="sticky top-0 z-40 h-16 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all"
      >
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 w-full">

          {/* Esquerda: Breadcrumbs e Título Inline */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Navegação Contextual Limpa */}
            <div className="flex items-center gap-2 min-w-0 text-sm">
              <span className="hidden sm:inline-block font-semibold text-slate-900 tracking-tight">
                ATLHON
              </span>
              
              {page.category && (
                <>
                  <ChevronRight size={14} className="hidden sm:inline-block text-slate-300 flex-shrink-0" />
                  <span className="hidden sm:inline-block text-slate-500 truncate">
                    {page.category}
                  </span>
                </>
              )}

              <ChevronRight size={14} className="hidden sm:inline-block text-slate-300 flex-shrink-0" />
              
              <h1 className="font-medium text-slate-900 truncate text-sm sm:text-base">
                {page.title}
              </h1>
            </div>
          </div>

          {/* Direita: Busca e Ações */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Input Trigger de Busca Desktop */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Abrir busca global"
              className="hidden md:flex h-9 items-center gap-2.5 px-3 md:w-56 lg:w-72 rounded-lg border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/80 hover:border-slate-300 transition-all text-left text-slate-500 focus:outline-none cursor-pointer"
            >
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <span className="text-xs font-normal text-slate-400 truncate pr-2">
                Buscar no sistema...
              </span>
              <kbd className="ml-auto flex-shrink-0 inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                {isMac ? '⌘K' : 'Ctrl K'}
              </kbd>
            </button>

            {/* Ícone de Busca Mobile */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>

            <div className="w-px h-4 bg-slate-200/80 hidden sm:block" />

            {/* Ações de Perfil e Notificações */}
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