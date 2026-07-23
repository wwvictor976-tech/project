import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  Utensils,
  Settings,
  DollarSign,
  BarChart2,
  User,
  HelpCircle,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ChevronDown,
  X,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/auth';
import { useAppStore } from '@/stores/useAppStore';
import { ROUTES } from '@/constants/routes';

/* ── Custom Scrollbar ── */
const SIDEBAR_SCROLLBAR_CSS = `
  .sidebar-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
  }
  .sidebar-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .sidebar-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 9999px;
  }
  .sidebar-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
  }
`;

interface SubMenuItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  submenu?: SubMenuItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Visão Geral',
    items: [
      { label: 'Dashboard', path: ROUTES.dashboard, icon: LayoutDashboard },
      { label: 'Agenda', path: ROUTES.agenda, icon: Calendar },
    ],
  },
  {
    title: 'Gestão & Prescrição',
    items: [
      {
        label: 'Alunos',
        path: ROUTES.alunos,
        icon: Users,
        submenu: [
          { label: 'Todos os Alunos', path: ROUTES.alunos },
          { label: 'Novos Cadastros', path: `${ROUTES.alunos}?status=Pendente` },
          { label: 'Ativos', path: `${ROUTES.alunos}?status=Ativo` },
          { label: 'Inativos', path: `${ROUTES.alunos}?status=Inativo` },
        ],
      },
      {
        label: 'Treinos',
        path: ROUTES.treinos,
        icon: Dumbbell,
        submenu: [
          { label: 'Todas as Fichas', path: ROUTES.treinos },
          { label: 'Treinos Ativos', path: `${ROUTES.treinos}?status=Ativo` },
          { label: 'Pausados', path: `${ROUTES.treinos}?status=Pausado` },
          { label: 'Concluídos', path: `${ROUTES.treinos}?status=Concluído` },
        ],
      },
      {
        label: 'Dietas',
        path: ROUTES.dietas,
        icon: Utensils,
        submenu: [
          { label: 'Todos os Planos', path: ROUTES.dietas },
          { label: 'Planos Ativos', path: `${ROUTES.dietas}?status=Ativa` },
          { label: 'Pausadas', path: `${ROUTES.dietas}?status=Pausada` },
        ],
      },
    ],
  },
  {
    title: 'Financeiro & Dados',
    items: [
      { label: 'Financeiro', path: ROUTES.financeiro, icon: DollarSign },
      { label: 'Relatórios', path: ROUTES.relatorios, icon: BarChart2 },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Planos', path: ROUTES.planos, icon: Sparkles },
      { label: 'Perfil', path: ROUTES.perfil, icon: User },
      { label: 'Configurações', path: ROUTES.configuracoes, icon: Settings },
      { label: 'Ajuda & Suporte', path: ROUTES.ajuda, icon: HelpCircle },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const sidebarOpen = useAppStore((state) => state?.sidebarOpen) ?? false;
  const setSidebarOpen = useAppStore((state) => state?.setSidebarOpen) ?? (() => {});
  const sidebarCollapsed = useAppStore((state) => state?.sidebarCollapsed) ?? false;
  const setSidebarCollapsed = useAppStore((state) => state?.setSidebarCollapsed) ?? (() => {});

  const [searchTerm, setSearchTerm] = useState('');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const col = sidebarCollapsed;

  const isPathActive = useCallback(
    (path: string) => {
      const [targetPath, targetQuery] = path.split('?');
      const currentPath = location.pathname;

      if (currentPath !== targetPath) return false;

      const currentQuery = decodeURIComponent(location.search);

      if (targetQuery) {
        return currentQuery.includes(decodeURIComponent(targetQuery));
      }

      return !currentQuery.includes('status=');
    },
    [location.pathname, location.search]
  );

  const isParentActive = useCallback(
    (item: NavItem) => {
      if (isPathActive(item.path)) return true;
      if (item.submenu) {
        return item.submenu.some((sub) => isPathActive(sub.path));
      }
      return false;
    },
    [isPathActive]
  );

  useEffect(() => {
    let activeParentLabel: string | null = null;

    NAV_SECTIONS.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.submenu?.some((sub) => isPathActive(sub.path)) || item.path === location.pathname) {
          if (item.submenu) activeParentLabel = item.label;
        }
      });
    });

    if (activeParentLabel) {
      setOpenSubmenu(activeParentLabel);
    }
  }, [location.pathname, location.search, isPathActive]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.search, setSidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return NAV_SECTIONS;
    const term = searchTerm.toLowerCase().trim();

    return NAV_SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => {
        const matchesLabel = item.label.toLowerCase().includes(term);
        const matchesSubmenu = item.submenu?.some((sub) =>
          sub.label.toLowerCase().includes(term)
        );
        return matchesLabel || matchesSubmenu;
      }),
    })).filter((sec) => sec.items.length > 0);
  }, [searchTerm]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  return (
    <>
      <style>{SIDEBAR_SCROLLBAR_CSS}</style>

      {/* Backdrop Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 lg:hidden bg-slate-950/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Container Principal da Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          lg:relative lg:z-auto
          bg-[#030712] border-r border-slate-800/80 text-slate-400
          transition-all duration-300 ease-in-out select-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${col ? 'w-20' : 'w-72'}
        `}
      >
        {/* Header da Logo */}
        <div className="h-16 border-b border-slate-800/80 px-4.5 flex items-center justify-between shrink-0">
          <Link
            to={ROUTES.dashboard}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg tracking-tighter">A</span>
            </div>

            {!col && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white text-base tracking-tight truncate leading-none">
                  Atlhon Sales
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mt-1">
                  CRM • Gestão
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input de Busca */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          {!col ? (
            <div className="relative group">
              <Search
                size={15}
                className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Buscar no sistema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800/80 pl-8.5 pr-7 py-1.5 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-600/80 focus:ring-1 focus:ring-blue-600/30 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              title="Buscar no sistema"
              className="w-full flex justify-center py-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              <Search size={17} />
            </button>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto sidebar-scrollbar px-3.5 py-2 space-y-3.5">
          {filteredSections.map((section, secIdx) => (
            <div key={section.title}>
              {!col ? (
                <p className="px-2.5 mb-1 mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500/90">
                  {section.title}
                </p>
              ) : (
                secIdx > 0 && <div className="my-2 mx-1 border-t border-slate-800/80" />
              )}

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const hasSubmenu = !!item.submenu?.length;
                  const isOpen = openSubmenu === item.label;
                  const active = isParentActive(item);

                  return (
                    <li
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => col && setHoveredNav(item.label)}
                      onMouseLeave={() => col && setHoveredNav(null)}
                    >
                      {hasSubmenu && !col ? (
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(item.label)}
                          className={`
                            w-full relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group text-left cursor-pointer
                            ${
                              active
                                ? 'bg-blue-600/10 text-white font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }
                          `}
                        >
                          {active && (
                            <motion.div
                              layoutId="activePill"
                              className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                            />
                          )}

                          <item.icon
                            size={18}
                            className={`shrink-0 transition-colors ${
                              active ? 'text-blue-500' : 'group-hover:text-slate-200'
                            }`}
                          />

                          <span className="truncate flex-1">{item.label}</span>

                          <div className="flex items-center gap-1.5 ml-auto shrink-0">
                            {item.badge && (
                              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            <ChevronDown
                              size={14}
                              className={`text-slate-500 transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-slate-300' : ''
                              }`}
                            />
                          </div>
                        </button>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={() => {
                            if (col) {
                              setSidebarCollapsed(false);
                              if (hasSubmenu) setOpenSubmenu(item.label);
                            }
                          }}
                          className={`
                            relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group
                            ${col ? 'justify-center' : ''}
                            ${
                              active
                                ? 'bg-blue-600/10 text-white font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }
                          `}
                        >
                          {active && (
                            <motion.div
                              layoutId="activePill"
                              className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                            />
                          )}

                          <item.icon
                            size={18}
                            className={`shrink-0 transition-colors ${
                              active ? 'text-blue-500' : 'group-hover:text-slate-200'
                            }`}
                          />

                          {!col && <span className="truncate flex-1">{item.label}</span>}

                          {!col && item.badge && (
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}

                      {/* Popover em Modo Colapsado */}
                      {col && hoveredNav === item.label && (
                        <div className="absolute left-full top-0 ml-2 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2.5 w-48">
                          <div className="flex items-center justify-between font-semibold text-xs text-white pb-1.5 mb-1.5 border-b border-slate-800">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="bg-blue-500/10 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full border border-blue-500/20">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {hasSubmenu ? (
                            <div className="space-y-0.5">
                              {item.submenu!.map((sub) => {
                                const subActivePopover = isPathActive(sub.path);
                                return (
                                  <Link
                                    key={sub.path}
                                    to={sub.path}
                                    className={`block px-2 py-1 text-xs rounded-lg transition-colors ${
                                      subActivePopover
                                        ? 'text-blue-400 bg-blue-500/10 font-semibold'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                  >
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-500">Clique para navegar</p>
                          )}
                        </div>
                      )}

                      {/* Submenu Expandido */}
                      <AnimatePresence>
                        {hasSubmenu && isOpen && !col && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: 'easeInOut' }}
                            className="pl-6 pr-1 mt-1 space-y-0.5 border-l border-slate-800/80 ml-4.5 overflow-hidden"
                          >
                            {item.submenu!.map((sub) => {
                              const subActive = isPathActive(sub.path);
                              return (
                                <li key={sub.path}>
                                  <Link
                                    to={sub.path}
                                    className={`block px-2.5 py-1 text-xs rounded-lg transition-colors truncate ${
                                      subActive
                                        ? 'text-blue-400 font-semibold bg-blue-500/10'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                    }`}
                                  >
                                    {sub.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Card do Perfil */}
        <div className="border-t border-slate-800/80 p-3 shrink-0 relative" ref={profileRef}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`
              flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-900 cursor-pointer group transition-colors relative
              ${col ? 'justify-center' : ''}
            `}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white text-xs font-semibold">
                AD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-[#030712] rounded-full" />
            </div>

            {!col && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">Perfil</p>
                <p className="text-[10px] text-slate-500 truncate">Dados da conta</p>
              </div>
            )}

            {!col && (
              <ChevronRight
                size={15}
                className={`text-slate-500 group-hover:text-slate-300 transition-transform ${
                  showProfileMenu ? 'rotate-90' : ''
                }`}
              />
            )}
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={`
                  absolute bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50
                  ${col ? 'bottom-2 left-20 w-48' : 'bottom-14 left-3 right-3'}
                `}
              >
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-xs font-medium cursor-pointer"
                >
                  <LogOut size={15} className="shrink-0" />
                  <span>Sair da conta</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botão Expandir / Recolher */}
        <div className="hidden lg:block p-2.5 border-t border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!col)}
            title={col ? 'Expandir menu' : 'Recolher menu'}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
          >
            {col ? (
              <PanelLeftOpen size={17} />
            ) : (
              <>
                <PanelLeftClose size={17} />
                <span>Recolher menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}