import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Users,
  UserCheck,
  UserX,
  Clock,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Sparkles,
} from 'lucide-react';

/* ── Estilos CSS de Animação de Entrada ── */
const ANIMATIONS_CSS = `
  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes pulseGlow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .animate-card-enter { animation: cardEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .animate-fade-slide { animation: fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .animate-pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
`;

type StatusType = 'Ativo' | 'Inativo' | 'Pendente';
type PlanType = 'Basic' | 'Pro' | 'Enterprise';
type TabType = 'Todos' | StatusType;

interface Aluno {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: PlanType;
  status: StatusType;
  since: string;
  avatar: string;
  color: string;
}

const mockAlunos: Aluno[] = [
  { id: 1, name: 'Ana Souza', email: 'ana@email.com', phone: '(11) 99999-0001', plan: 'Pro', status: 'Ativo', since: '18 Jul 2026', avatar: 'AS', color: '#3b82f6' },
  { id: 2, name: 'Bruno Lima', email: 'bruno@email.com', phone: '(21) 98888-0002', plan: 'Basic', status: 'Ativo', since: '16 Jul 2026', avatar: 'BL', color: '#8b5cf6' },
  { id: 3, name: 'Carla Mendes', email: 'carla@email.com', phone: '(31) 97777-0003', plan: 'Enterprise', status: 'Ativo', since: '14 Jul 2026', avatar: 'CM', color: '#10b981' },
  { id: 4, name: 'Diego Rocha', email: 'diego@email.com', phone: '(41) 96666-0004', plan: 'Basic', status: 'Pendente', since: '12 Jul 2026', avatar: 'DR', color: '#f59e0b' },
  { id: 5, name: 'Elisa Ferreira', email: 'elisa@email.com', phone: '(51) 95555-0005', plan: 'Pro', status: 'Ativo', since: '10 Jul 2026', avatar: 'EF', color: '#ef4444' },
  { id: 6, name: 'Felipe Santos', email: 'felipe@email.com', phone: '(61) 94444-0006', plan: 'Basic', status: 'Inativo', since: '05 Jul 2026', avatar: 'FS', color: '#06b6d4' },
  { id: 7, name: 'Gabriela Costa', email: 'gabi@email.com', phone: '(71) 93333-0007', plan: 'Pro', status: 'Ativo', since: '02 Jul 2026', avatar: 'GC', color: '#ec4899' },
  { id: 8, name: 'Henrique Alves', email: 'henrique@email.com', phone: '(81) 92222-0008', plan: 'Enterprise', status: 'Ativo', since: '28 Jun 2026', avatar: 'HA', color: '#2563eb' },
  { id: 9, name: 'Isabela Nunes', email: 'isa@email.com', phone: '(91) 91111-0009', plan: 'Basic', status: 'Pendente', since: '24 Jun 2026', avatar: 'IN', color: '#7c3aed' },
  { id: 10, name: 'João Pereira', email: 'joao@email.com', phone: '(11) 90000-0010', plan: 'Pro', status: 'Ativo', since: '20 Jun 2026', avatar: 'JP', color: '#059669' },
  { id: 11, name: 'Karen Oliveira', email: 'karen@email.com', phone: '(21) 99887-0011', plan: 'Enterprise', status: 'Ativo', since: '15 Jun 2026', avatar: 'KO', color: '#d97706' },
  { id: 12, name: 'Lucas Martins', email: 'lucas@email.com', phone: '(31) 98776-0012', plan: 'Basic', status: 'Inativo', since: '10 Jun 2026', avatar: 'LM', color: '#64748b' },
];

const statusBadge: Record<StatusType, { label: string; style: string; dot: string }> = {
  Ativo: { label: 'Ativo', style: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500 animate-pulse-glow' },
  Pendente: { label: 'Pendente', style: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' },
  Inativo: { label: 'Inativo', style: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};

const planBadge: Record<PlanType, string> = {
  Basic: 'text-slate-600 bg-slate-100/80 border-slate-200',
  Pro: 'text-blue-700 bg-blue-50 border-blue-200/60',
  Enterprise: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
};

const STYLES = {
  card: "bg-white rounded-[24px] border border-slate-100/80 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300",
  btnPrimary: "flex items-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer",
  btnOutline: "flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors cursor-pointer",
};

export default function Alunos() {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('Todos');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const menuRef = useRef<HTMLTableCellElement | null>(null);

  /* ── CONEXÃO COM A URL DA SIDEBAR ── */
  const activeTab: TabType = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('/ativos')) return 'Ativo';
    if (path.endsWith('/inativos')) return 'Inativo';
    if (path.endsWith('/novos')) return 'Pendente'; // Trata "Novos Cadastros" como Pendentes
    return 'Todos';
  }, [location.pathname]);

  const handleTabChange = (tab: TabType) => {
    setCurrentPage(1);
    if (tab === 'Ativo') navigate('/alunos/ativos');
    else if (tab === 'Inativo') navigate('/alunos/inativos');
    else if (tab === 'Pendente') navigate('/alunos/novos');
    else navigate('/alunos');
  };

  /* Fechar menu ao clicar fora */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Filtro de Alunos */
  const filteredAlunos = useMemo(() => {
    return mockAlunos.filter((aluno) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        aluno.name.toLowerCase().includes(query) ||
        aluno.email.toLowerCase().includes(query) ||
        aluno.phone.includes(query);

      const matchesStatus = activeTab === 'Todos' || aluno.status === activeTab;
      const matchesPlan = selectedPlan === 'Todos' || aluno.plan === selectedPlan;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [search, activeTab, selectedPlan]);

  /* Paginação */
  const totalPages = Math.ceil(filteredAlunos.length / itemsPerPage) || 1;
  const paginatedAlunos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAlunos.slice(start, start + itemsPerPage);
  }, [filteredAlunos, currentPage]);

  const tabs: TabType[] = ['Todos', 'Ativo', 'Pendente', 'Inativo'];

  const counts: Record<TabType, number> = useMemo(() => {
    return {
      Todos: mockAlunos.length,
      Ativo: mockAlunos.filter((a) => a.status === 'Ativo').length,
      Pendente: mockAlunos.filter((a) => a.status === 'Pendente').length,
      Inativo: mockAlunos.filter((a) => a.status === 'Inativo').length,
    };
  }, []);

  return (
    <div className="space-y-6 text-slate-800">
      <style>{ANIMATIONS_CSS}</style>

      {/* ── HEADER DE PÁGINA & AÇÕES ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 animate-fade-slide">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              Gestão de Alunos
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              <Sparkles className="w-3 h-3 text-blue-500" /> Base Ativa
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 animate-fade-slide" style={{ animationDelay: '0.1s' }}>
            {counts.Todos} cadastros no total · {counts.Ativo} com assinatura ativa
          </p>
        </div>

        <div className="flex items-center gap-3 animate-fade-slide" style={{ animationDelay: '0.2s' }}>
          <button
            type="button"
            className={STYLES.btnOutline}
            onClick={() => alert('Exportando lista de alunos...')}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            className={STYLES.btnPrimary}
            onClick={() => alert('Abrir modal de Novo Aluno')}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Aluno</span>
          </button>
        </div>
      </div>

      {/* ── KPI STATS OVERVIEW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={`${STYLES.card} animate-card-enter flex items-center justify-between p-5`} style={{ animationDelay: '0.05s' }}>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total de Alunos</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{counts.Todos}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className={`${STYLES.card} animate-card-enter flex items-center justify-between p-5`} style={{ animationDelay: '0.1s' }}>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Alunos Ativos</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{counts.Ativo}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        <div className={`${STYLES.card} animate-card-enter flex items-center justify-between p-5`} style={{ animationDelay: '0.15s' }}>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Aguardando Aprovação</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{counts.Pendente}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className={`${STYLES.card} animate-card-enter flex items-center justify-between p-5`} style={{ animationDelay: '0.2s' }}>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Inativos / Cancelados</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{counts.Inativo}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <UserX size={20} />
          </div>
        </div>
      </div>

      {/* ── CARD PRINCIPAL COM TABELA & FILTROS ── */}
      <div className="bg-white rounded-[24px] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden animate-fade-slide" style={{ animationDelay: '0.3s' }}>

        {/* Toolbar de Controle */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50">
          
          {/* Tabs por Status (Conectadas com o Router) */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl text-xs font-medium w-full md:w-auto overflow-x-auto">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'Pendente' ? 'Novos / Pendentes' : tab}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
                }`}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Filtros de Busca e Plano */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por nome, e-mail ou telefone..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedPlan}
                onChange={(e) => {
                  setSelectedPlan(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-1.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="Todos">Todos os Planos</option>
                <option value="Basic">Plano Basic</option>
                <option value="Pro">Plano Pro</option>
                <option value="Enterprise">Plano Enterprise</option>
              </select>
              <Filter size={12} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tabela de Alunos */}
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Aluno</th>
                <th className="px-6 py-3.5 hidden md:table-cell">Contato</th>
                <th className="px-6 py-3.5">Plano</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 hidden lg:table-cell">Matrícula</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedAlunos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Nenhum aluno encontrado</p>
                    <p className="text-xs text-slate-400 mt-1">Tente ajustar seus termos de busca ou filtros.</p>
                  </td>
                </tr>
              ) : (
                paginatedAlunos.map((aluno, idx) => {
                  const status = statusBadge[aluno.status];
                  return (
                    <tr
                      key={aluno.id}
                      className="hover:bg-slate-50/60 transition-colors group animate-fade-slide"
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm"
                            style={{ backgroundColor: aluno.color }}
                          >
                            {aluno.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                              {aluno.name}
                            </p>
                            <p className="text-[11px] text-slate-400 md:hidden truncate">{aluno.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail size={12} className="text-slate-400" />
                            <a href={`mailto:${aluno.email}`} className="hover:underline">{aluno.email}</a>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Phone size={11} className="text-slate-400" />
                            <span>{aluno.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-block border px-2.5 py-1 text-[11px] font-medium rounded-lg ${planBadge[aluno.plan]}`}>
                          {aluno.plan}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-medium rounded-full ${status.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 hidden lg:table-cell text-xs text-slate-500 font-medium">
                        {aluno.since}
                      </td>

                      <td
                        className="px-6 py-4 text-right relative"
                        ref={menuOpen === aluno.id ? menuRef : null}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === aluno.id ? null : aluno.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuOpen === aluno.id && (
                          <div className="absolute right-6 top-12 z-30 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 w-40 text-left animate-pop-in">
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Visualizar perfil de ${aluno.name}`);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Eye size={14} className="text-slate-400" /> Ver perfil
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Editar cadastro de ${aluno.name}`);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Edit3 size={14} className="text-slate-400" /> Editar
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Status de ${aluno.name} alterado com sucesso!`);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-medium"
                            >
                              <UserX size={14} className="text-rose-500" /> Desativar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer com Paginação */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 gap-3">
          <p className="text-xs text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{paginatedAlunos.length}</span> de{' '}
            <span className="font-semibold text-slate-700">{filteredAlunos.length}</span> alunos encontrados
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-semibold text-slate-700 px-2">
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}