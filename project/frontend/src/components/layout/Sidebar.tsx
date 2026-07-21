import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
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

/* ── Mapeamento Principal de Navegação (Subpáginas de Alunos Conectadas) ── */
const MAIN_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: 'Alunos',
    path: ROUTES.alunos,
    icon: Users,
    badge: '42',
    submenu: [
      { label: 'Todos os Alunos', path: ROUTES.alunos },
      { label: 'Novos Cadastros', path: '/alunos/novos' },
      { label: 'Ativos', path: '/alunos/ativos' },
      { label: 'Inativos', path: '/alunos/inativos' },
    ],
  },
  {
    label: 'Agenda',
    path: ROUTES.agenda,
    icon: Calendar,
    badge: '3',
  },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Configurações', path: '/settings', icon: Settings },
  { label: 'Ajuda & Suporte', path: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  
  // Resolução segura de estados da store
  const store = useAppStore() as any;
  const sidebarOpen = store?.sidebarOpen ?? false;
  const setSidebarOpen = store?.setSidebarOpen ?? (() => {});
  const sidebarCollapsed = store?.sidebarCollapsed ?? false;
  const setSidebarCollapsed = store?.setSidebarCollapsed ?? (() => {});

  const [searchTerm, setSearchTerm] = useState('');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('Alunos');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const col = sidebarCollapsed;

  /* ==================== Verificação de Rota Ativa ==================== */
  const isPathActive = useCallback(
    (path: string) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname === path;
    },
    [location.pathname]
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

  /* ==================== Efeitos de Sincronização ==================== */
  // Auto-expande o submenu pai se a URL atual for uma subpágina dele
  useEffect(() => {
    const matchedItem = MAIN_NAV.find((item) =>
      item.submenu?.some((sub) => isPathActive(sub.path))
    );
    if (matchedItem) {
      setOpenSubmenu(matchedItem.label);
    }
  }, [location.pathname, isPathActive]);

  // Fecha sidebar no mobile ao mudar de rota
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  // Fecha o dropdown de perfil ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ==================== Busca de Menu ==================== */
  const filteredMainNav = useMemo(() => {
    if (!searchTerm.trim()) return MAIN_NAV;
    const term = searchTerm.toLowerCase().trim();

    return MAIN_NAV.filter((item) => {
      const matchesLabel = item.label.toLowerCase().includes(term);
      const matchesSubmenu = item.submenu?.some((sub) =>
        sub.label.toLowerCase().includes(term)
      );
      return matchesLabel || matchesSubmenu;
    });
  }, [searchTerm]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  return (
    <>
      {/* Backdrop Mobile com fade */}
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

      {/* Container da Sidebar */}
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
        <div className="h-16 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
          <Link to={ROUTES.dashboard} className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl tracking-tighter">A</span>
            </div>

            {!col && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white text-base tracking-tight truncate leading-tight">
                  Atlhon Sales
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400/90">
                  CRM • Gestão
                </span>
              </div>
            )}
          </Link>

          {/* Botão Fechar no Mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input de Busca */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          {!col ? (
            <div className="relative group">
              <Search
                size={16}
                className="absolute left-3.5 top-3 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Buscar subpáginas, alunos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800/80 pl-9 pr-8 py-2 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
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
              <Search size={18} />
            </button>
          )}
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-3 py-4 space-y-6">
          
          {/* Seção Principal */}
          <div>
            {!col && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Principal
              </p>
            )}

            <ul className="space-y-1">
              {filteredMainNav.map((item) => {
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
                    <Link
                      to={hasSubmenu && !col ? '#' : item.path}
                      onClick={(e) => {
                        if (hasSubmenu && !col) {
                          e.preventDefault();
                          toggleSubmenu(item.label);
                        } else if (col) {
                          setSidebarCollapsed(false);
                          if (hasSubmenu) setOpenSubmenu(item.label);
                        }
                      }}
                      className={`
                        relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group
                        ${col ? 'justify-center' : ''}
                        ${
                          active
                            ? 'bg-blue-600/10 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }
                      `}
                    >
                      {/* Barramento Neon Ativo */}
                      {active && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                        />
                      )}

                      <item.icon
                        size={18}
                        className={`shrink-0 transition-colors ${
                          active ? 'text-blue-500' : 'group-hover:text-slate-200'
                        }`}
                      />

                      {!col && <span className="truncate flex-1">{item.label}</span>}

                      {/* Badge e Chevron */}
                      {!col && (
                        <div className="flex items-center gap-1.5 ml-auto shrink-0">
                          {item.badge && (
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {hasSubmenu && (
                            <ChevronDown
                              size={15}
                              className={`text-slate-500 transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-slate-300' : ''
                              }`}
                            />
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Popover no Hover (Sidebar Recolhida) */}
                    {col && hoveredNav === item.label && (
                      <div className="absolute left-full top-0 ml-3 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-3 w-48 animate-fade-slide">
                        <div className="flex items-center justify-between font-semibold text-xs text-white pb-2 mb-2 border-b border-slate-800">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="bg-blue-500/10 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {hasSubmenu ? (
                          <div className="space-y-1">
                            {item.submenu!.map((sub) => (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                className={`block px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                                  isPathActive(sub.path)
                                    ? 'text-blue-400 bg-blue-500/10 font-semibold'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">Clique para navegar</p>
                        )}
                      </div>
                    )}

                    {/* Submenu Expandido (Modo Padrão) */}
                    <AnimatePresence>
                      {hasSubmenu && isOpen && !col && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="pl-8 pr-2 mt-1 space-y-0.5 border-l border-slate-800/80 ml-5 overflow-hidden"
                        >
                          {item.submenu!.map((sub) => {
                            const subActive = isPathActive(sub.path);
                            return (
                              <li key={sub.path}>
                                <Link
                                  to={sub.path}
                                  className={`block px-3 py-1.5 text-xs rounded-lg transition-colors truncate ${
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

          {/* Seção Sistema */}
          <div>
            {!col && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Sistema
              </p>
            )}
            <ul className="space-y-1">
              {SECONDARY_NAV.map((item) => {
                const active = isPathActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={col ? item.label : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors
                        ${col ? 'justify-center' : ''}
                        ${
                          active
                            ? 'bg-blue-600/10 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }
                      `}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!col && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Card do Perfil do Usuário */}
        <div className="border-t border-slate-800/80 p-3 shrink-0 relative" ref={profileRef}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`
              flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900 cursor-pointer group transition-colors relative
              ${col ? 'justify-center' : ''}
            `}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white text-xs font-semibold">
                AD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#030712] rounded-full" />
            </div>

            {!col && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Admin Demo</p>
                <p className="text-[10px] text-slate-500 truncate">admin@atlhon.com</p>
              </div>
            )}

            {!col && (
              <ChevronRight
                size={16}
                className={`text-slate-500 group-hover:text-slate-300 transition-transform ${
                  showProfileMenu ? 'rotate-90' : ''
                }`}
              />
            )}
          </div>

          {/* Menu Flutuante de Perfil */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`
                  absolute bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50
                  ${col ? 'bottom-3 left-20 w-48' : 'bottom-16 left-3 right-3'}
                `}
              >
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-xs font-medium cursor-pointer"
                >
                  <LogOut size={16} className="shrink-0" />
                  <span>Sair da conta</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botão de Expandir/Recolher no Desktop */}
        <div className="hidden lg:block p-3 border-t border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!col)}
            title={col ? 'Expandir menu' : 'Recolher menu'}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
          >
            {col ? (
              <PanelLeftOpen size={18} />
            ) : (
              <>
                <PanelLeftClose size={18} />
                <span>Recolher menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}