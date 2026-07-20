import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { useAppStore } from '@/stores/useAppStore';
import { ROUTES } from '@/constants/routes';

const NAV = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Alunos',    path: ROUTES.alunos,    icon: Users },
  { label: 'Agenda',    path: ROUTES.agenda,    icon: Calendar },
];

/* ─── Sidebar ──────────────────────────────────────────────── */
export function Sidebar() {
  const location  = useLocation();
  const { logout }= useAuth();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  /* Close drawer on navigation */
  useEffect(() => { setSidebarOpen(false); }, [location.pathname, setSidebarOpen]);

  const col = sidebarCollapsed; // shorthand

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={[
          'fixed inset-0 z-40 lg:hidden',
          'bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden
      />

      {/* ── Sidebar shell ── */}
      <aside
        className={[
          /* positioning */
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          'lg:relative lg:inset-auto lg:z-auto',
          /* size – mobile always 215 px, desktop toggles */
          'w-[215px]',
          col ? 'lg:w-[58px]' : 'lg:w-[215px]',
          /* motion */
          'transition-[width,transform] duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          /* glass */
          'backdrop-blur-2xl',
          /* overflow */
          'overflow-hidden',
        ].join(' ')}
        style={{
          background: 'rgba(9,9,13,0.86)',
          borderRight: '1px solid rgba(255,255,255,0.055)',
        }}
      >

        {/* ── Logo row ──────────────────────────── */}
        <div
          className="flex items-center h-[58px] shrink-0 px-[14px] gap-[10px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Brand mark */}
          <div
            className={[
              'flex items-center justify-center rounded-[7px] shrink-0',
              'transition-all duration-300',
              col ? 'lg:mx-auto' : '',
              'w-[26px] h-[26px]',
            ].join(' ')}
            style={{ background: '#2563eb' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>

          {/* Wordmark */}
          <div
            className={[
              'flex-1 leading-none overflow-hidden',
              'transition-[opacity,max-width] duration-300',
              col ? 'lg:max-w-0 lg:opacity-0' : 'max-w-full opacity-100',
            ].join(' ')}
          >
            <span className="block text-[0.8rem] font-semibold tracking-tight whitespace-nowrap"
              style={{ color: 'rgba(255,255,255,0.88)' }}>
              Atlhon
            </span>
            <span className="block text-[0.58rem] font-medium mt-[3px] whitespace-nowrap"
              style={{ color: 'rgba(96,165,250,0.7)', letterSpacing: '0.05em' }}>
              Sales CRM
            </span>
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!col)}
            title={col ? 'Expandir' : 'Recolher'}
            className={[
              'hidden lg:flex items-center justify-center shrink-0',
              'w-[22px] h-[22px] rounded-[6px]',
              'text-white/20 hover:text-white/60',
              'transition-colors duration-200',
              'border-none bg-transparent cursor-pointer',
              col ? 'lg:absolute lg:right-[18px]' : '',
            ].join(' ')}
          >
            {col ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
          </button>
        </div>

        {/* ── Navigation ────────────────────────── */}
        <nav className="flex-1 px-[7px] py-3 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-[2px]" role="list">
            {NAV.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <li key={path}>
                  <Link
                    to={path}
                    title={col ? label : undefined}
                    className={[
                      'group relative flex items-center rounded-[8px]',
                      'border-l-[1.5px] outline-none select-none',
                      'transition-all duration-200 ease-out',
                      /* layout – collapsed centers icon */
                      col ? 'lg:justify-center lg:px-0 lg:py-[10px] lg:gap-0 gap-[10px] px-[10px] py-[10px]'
                           : 'gap-[10px] px-[10px] py-[10px]',
                      /* colour states */
                      active
                        ? 'border-[#2563eb]/60 bg-[#2563eb]/[0.09] text-white/90'
                        : 'border-transparent text-white/38 hover:bg-white/[0.04] hover:text-white/72',
                    ].join(' ')}
                  >
                    {/* Icon */}
                    <Icon
                      size={14}
                      className="shrink-0 transition-all duration-200"
                      style={{
                        color:   active ? '#93c5fd' : undefined,
                        opacity: active ? 1 : 0.5,
                      }}
                    />

                    {/* Label */}
                    <span
                      className={[
                        'text-[0.815rem] font-medium whitespace-nowrap',
                        'transition-all duration-300 overflow-hidden',
                        col ? 'lg:max-w-0 lg:opacity-0' : 'max-w-full opacity-100',
                        !active ? 'group-hover:translate-x-px' : '',
                        'transition-transform duration-200',
                      ].filter(Boolean).join(' ')}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── User area ─────────────────────────── */}
        <div
          className="px-[7px] pb-[10px] pt-[8px] shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div
            className={[
              'group flex items-center rounded-[8px]',
              'hover:bg-white/[0.035] transition-colors duration-200',
              col ? 'lg:justify-center lg:px-0 lg:py-[10px] lg:gap-0 gap-[10px] px-[10px] py-[10px]'
                  : 'gap-[10px] px-[10px] py-[10px]',
            ].join(' ')}
          >
            {/* Avatar + presence dot */}
            <div className="relative shrink-0">
              <div
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[0.6rem] font-semibold"
                style={{
                  background: '#131320',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                AD
              </div>
              <span
                className="absolute bottom-0 right-0 w-[7px] h-[7px] rounded-full bg-emerald-400"
                style={{ border: '1.5px solid rgb(9,9,13)' }}
              />
            </div>

            {/* Name + email */}
            <div
              className={[
                'flex-1 min-w-0 leading-none overflow-hidden',
                'transition-[opacity,max-width] duration-300',
                col ? 'lg:max-w-0 lg:opacity-0' : 'max-w-full opacity-100',
              ].join(' ')}
            >
              <p className="text-[0.775rem] font-medium truncate"
                style={{ color: 'rgba(255,255,255,0.7)' }}>
                Admin Demo
              </p>
              <p className="text-[0.635rem] truncate mt-[3px]"
                style={{ color: 'rgba(255,255,255,0.22)' }}>
                admin@atlhon.com
              </p>
            </div>

            {/* Logout — fades in on row hover, hidden when collapsed */}
            {!col && (
              <button
                onClick={logout}
                title="Sair da conta"
                className={[
                  'shrink-0 w-[26px] h-[26px] rounded-[6px]',
                  'flex items-center justify-center',
                  'border-none bg-transparent cursor-pointer',
                  'text-white/22 hover:text-red-400 hover:bg-red-500/[0.1]',
                  'opacity-0 group-hover:opacity-100',
                  'transition-all duration-200',
                  '-translate-x-0.5 group-hover:translate-x-0',
                ].join(' ')}
              >
                <LogOut size={12} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
