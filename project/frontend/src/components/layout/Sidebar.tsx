import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar,
  LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/app/auth';
import { useAppStore } from '@/stores/useAppStore';
import { ROUTES } from '@/constants/routes';

const NAV = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Alunos',    path: ROUTES.alunos,    icon: Users },
  { label: 'Agenda',    path: ROUTES.agenda,    icon: Calendar },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const {
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
  } = useAppStore();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname, setSidebarOpen]);

  const col = sidebarCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={() => setSidebarOpen(false)}
        className={[
          'fixed inset-0 z-40 lg:hidden',
          'bg-black/50 backdrop-blur-sm',
          'transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── Sidebar shell ── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col shrink-0',
          'lg:relative lg:inset-auto lg:z-auto',
          'w-[220px]',
          col ? 'lg:w-[62px]' : 'lg:w-[220px]',
          'transition-[width,transform] duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'overflow-hidden',
        ].join(' ')}
        style={{
          background:           'rgba(2,6,23,0.88)',
          backdropFilter:       'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderRight:          '1px solid rgba(255,255,255,0.06)',
          boxShadow:            '4px 0 32px rgba(0,0,0,0.25)',
        }}
      >
        {/* Blue orb — top left, same as login */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full"
          style={{ background: '#2563eb', filter: 'blur(80px)', opacity: 0.12 }}
        />
        {/* Blue orb — bottom right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-8 w-40 h-40 rounded-full"
          style={{ background: '#1e3a8a', filter: 'blur(70px)', opacity: 0.15 }}
        />

        {/* ── Logo ── */}
        <div
          className="relative z-10 flex items-center gap-[10px] h-[60px] px-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0"
            style={{ background: '#2563eb', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>

          <div className={[
            'overflow-hidden leading-none',
            'transition-[opacity,max-width] duration-300',
            col ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[160px] opacity-100',
          ].join(' ')}>
            <p className="text-[0.83rem] font-bold whitespace-nowrap tracking-tight"
              style={{ color: 'rgba(255,255,255,0.88)' }}>
              Atlhon Sales
            </p>
            <p className="text-[0.6rem] font-semibold whitespace-nowrap mt-[3px]"
              style={{ color: 'rgba(96,165,250,0.75)', letterSpacing: '0.05em' }}>
              Sales CRM
            </p>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="relative z-10 flex-1 flex flex-col px-[9px] py-3 overflow-y-auto overflow-x-hidden">
          <ul className="flex-1 space-y-[2px]" role="list">
            {NAV.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <li key={path}>
                  <Link
                    to={path}
                    title={col ? label : undefined}
                    className={[
                      'group flex items-center rounded-[9px] border-l-[1.5px] outline-none select-none',
                      'transition-all duration-200 ease-out',
                      col
                        ? 'lg:justify-center lg:px-0 lg:py-[10px] gap-[9px] px-3 py-[10px]'
                        : 'gap-[9px] px-3 py-[10px]',
                      active
                        ? 'border-[#2563eb]/60 bg-[#2563eb]/[0.1] text-white/90'
                        : 'border-transparent hover:bg-white/[0.05] hover:text-white/75',
                    ].join(' ')}
                    style={{ color: active ? undefined : 'rgba(255,255,255,0.38)' }}
                  >
                    <Icon
                      size={15}
                      className="shrink-0 transition-colors duration-200"
                      style={{ color: active ? '#93c5fd' : undefined, opacity: active ? 1 : 0.5 }}
                    />
                    <span className={[
                      'text-[0.82rem] font-medium whitespace-nowrap',
                      'transition-all duration-300 overflow-hidden',
                      col ? 'lg:max-w-0 lg:opacity-0' : 'max-w-full opacity-100',
                      !active ? 'group-hover:translate-x-px' : '',
                    ].filter(Boolean).join(' ')}>
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Collapse toggle — always visible at bottom of nav ── */}
          <div
            className="mt-3 pt-2.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              onClick={() => setSidebarCollapsed(!col)}
              title={col ? 'Expandir' : 'Recolher'}
              className={[
                'w-full flex items-center rounded-[9px]',
                'hover:bg-white/[0.05]',
                'transition-all duration-200 border-none bg-transparent cursor-pointer',
                col
                  ? 'lg:justify-center lg:px-0 lg:py-[10px] gap-[9px] px-3 py-[10px]'
                  : 'gap-[9px] px-3 py-[10px]',
              ].join(' ')}
              style={{ color: 'rgba(255,255,255,0.28)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
            >
              {col
                ? <PanelLeftOpen size={15} />
                : (
                  <>
                    <PanelLeftClose size={15} />
                    <span className="text-[0.8rem] font-medium">Recolher</span>
                  </>
                )
              }
            </button>
          </div>
        </nav>

        {/* ── User area ── */}
        <div
          className="relative z-10 px-[9px] pb-3 pt-2.5 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className={[
            'group flex items-center rounded-[9px]',
            'hover:bg-white/[0.04] transition-colors duration-200',
            col
              ? 'lg:justify-center lg:px-0 lg:py-[10px] gap-[10px] px-3 py-[9px]'
              : 'gap-[10px] px-3 py-[9px]',
          ].join(' ')}>
            <div className="relative shrink-0">
              <div
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[0.62rem] font-bold select-none"
                style={{ background: '#1e3a8a', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                AD
              </div>
              <span
                className="absolute bottom-0 right-0 w-[8px] h-[8px] rounded-full bg-emerald-400"
                style={{ border: '1.5px solid rgb(2,6,23)' }}
              />
            </div>

            <div className={[
              'flex-1 min-w-0 overflow-hidden leading-none',
              'transition-[opacity,max-width] duration-300',
              col ? 'lg:max-w-0 lg:opacity-0' : 'max-w-full opacity-100',
            ].join(' ')}>
              <p className="text-[0.8rem] font-semibold truncate"
                style={{ color: 'rgba(255,255,255,0.72)' }}>
                Admin Demo
              </p>
              <p className="text-[0.64rem] truncate mt-[3px]"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                admin@atlhon.com
              </p>
            </div>

            {!col && (
              <button
                onClick={logout}
                title="Sair da conta"
                className={[
                  'shrink-0 w-[28px] h-[28px] rounded-[7px] flex items-center justify-center',
                  'border-none bg-transparent cursor-pointer',
                  'opacity-0 group-hover:opacity-100',
                  'hover:bg-red-500/[0.15] hover:!text-red-400',
                  'transition-all duration-200',
                ].join(' ')}
                style={{ color: 'rgba(255,255,255,0.28)' }}
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
