import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAppStore } from '@/stores/useAppStore';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  [ROUTES.dashboard]: { title: 'Dashboard',   subtitle: 'Visão geral da plataforma' },
  [ROUTES.alunos]:    { title: 'Alunos',       subtitle: 'Gerencie seus alunos e matrículas' },
  [ROUTES.agenda]:    { title: 'Agenda',        subtitle: 'Aulas e compromissos agendados' },
};

export function Header() {
  const location = useLocation();
  const { setSidebarOpen } = useAppStore();
  const page = pageTitles[location.pathname] ?? { title: 'Plataforma', subtitle: '' };

  return (
    <header className="h-[58px] shrink-0 bg-white border-b border-[#e2e8f0] flex items-center gap-3 px-4 sm:px-6">

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors border-none bg-transparent cursor-pointer shrink-0"
        aria-label="Abrir menu"
      >
        <Menu size={17} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[0.92rem] font-bold text-[#0f172a] leading-none truncate">
          {page.title}
        </h1>
        <p className="text-[#94a3b8] text-[0.7rem] mt-[3px] hidden sm:block">
          {page.subtitle}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={12} className="absolute left-3 text-[#94a3b8] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-8 pr-4 py-[7px] text-[0.78rem] rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 focus:border-[#2563eb] transition-all w-44"
          />
        </div>

        {/* Bell */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors border-none bg-transparent cursor-pointer">
          <Bell size={15} />
          <span className="absolute top-[7px] right-[7px] w-[5px] h-[5px] rounded-full bg-[#2563eb]" />
        </button>

        {/* Avatar */}
        <div
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[0.6rem] font-bold ml-0.5"
          style={{ background: '#1e3a8a' }}
        >
          AD
        </div>
      </div>
    </header>
  );
}
