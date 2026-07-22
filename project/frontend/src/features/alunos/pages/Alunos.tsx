import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Users,
  UserCheck,
  UserX,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  X,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { useAppStore, type Student } from '@/stores/useAppStore';
import { NovoAlunoModal } from '@/components/ui/NovoAlunoModal';
import type { NewAlunoFormData } from '@/components/ui/NovoAlunoModal';

/* ── Tipagens ── */
type StatusType = 'Ativo' | 'Inativo' | 'Pendente';
type PlanType = 'Basic' | 'Pro' | 'Enterprise';
type TabType = 'Todos' | StatusType;

/* ── Mapeamento em Português para Planos ── */
const PLAN_LABELS: Record<PlanType, string> = {
  Basic: 'Básico',
  Pro: 'Profissional',
  Enterprise: 'Corporativo',
};

/* ── UI Badges Padronizados ── */
const statusBadge: Record<StatusType, { label: string; style: string; dot: string }> = {
  Ativo: { label: 'Ativo', style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-600' },
  Pendente: { label: 'Pendente', style: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-600' },
  Inativo: { label: 'Inativo', style: 'bg-slate-100 text-slate-600 border-slate-200/80', dot: 'bg-slate-400' },
};

const planBadge: Record<PlanType, string> = {
  Basic: 'text-slate-700 bg-slate-100 border-slate-200/60',
  Pro: 'text-blue-700 bg-blue-50 border-blue-200/60',
  Enterprise: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
};

/* ── Animações Framer Motion ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function Alunos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const students = useAppStore((state) => state.students);
  const addStudent = useAppStore((state) => state.addStudent);

  const getAlunoRoute = (id: number) => ROUTES.aluno.replace(':id', String(id));

  /* ── Estados Principais ── */
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('Todos');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const menuRef = useRef<HTMLDivElement | null>(null);

  /* ── Sincronização da Aba Ativa com URL ── */
  const activeTab: TabType = useMemo(() => {
    const status = searchParams.get('status');
    if (status === 'Ativo') return 'Ativo';
    if (status === 'Inativo') return 'Inativo';
    if (status === 'Pendente') return 'Pendente';
    return 'Todos';
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setCurrentPage(1);
    if (tab === 'Todos') {
      setSearchParams({});
    } else {
      setSearchParams({ status: tab });
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedPlan('Todos');
    handleTabChange('Todos');
  };

  /* ── Fechar Menu ao Clicar Fora ── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTodayDate = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date()).replace(/ de /g, ' ');
  };

  /* ── Adicionar Aluno via Modal ── */
  const handleAddAluno = (data: NewAlunoFormData) => {
    const initials = data.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
    const newAluno: Student = {
      id: students.length > 0 ? Math.max(...students.map((a) => a.id)) + 1 : 1,
      name: data.name,
      email: data.email,
      phone: data.phone,
      plan: data.plan,
      status: data.status,
      since: formatTodayDate(),
      date: formatTodayDate(),
      avatar: initials || 'AL',
      color: '#2563eb',
      age: data.age,
      height: data.height,
      weight: data.weight,
      trainingLevel: data.trainingLevel,
      allergies: data.allergies,
      medications: data.medications,
      observations: data.observations,
      nextClass: 'Primeira avaliação a agendar • —',
      attendanceRate: '0%',
      financialSummary: 'R$ 0 este mês',
    };

    addStudent(newAluno);
    setCurrentPage(1);
    setIsModalOpen(false);
    navigate(getAlunoRoute(newAluno.id));
  };

  /* ── Filtros e Paginação ── */
  const filteredAlunos = useMemo(() => {
    return students.filter((aluno) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        aluno.name.toLowerCase().includes(query) ||
        aluno.email.toLowerCase().includes(query) ||
        aluno.phone.includes(query);
      const matchesStatus = activeTab === 'Todos' || aluno.status === activeTab;
      const matchesPlan = selectedPlan === 'Todos' || aluno.plan === selectedPlan;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [students, search, activeTab, selectedPlan]);

  const totalPages = Math.ceil(filteredAlunos.length / itemsPerPage) || 1;
  const paginatedAlunos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAlunos.slice(start, start + itemsPerPage);
  }, [filteredAlunos, currentPage]);

  const tabs: TabType[] = ['Todos', 'Ativo', 'Pendente', 'Inativo'];

  const counts: Record<TabType, number> = useMemo(() => ({
    Todos: students.length,
    Ativo: students.filter((a) => a.status === 'Ativo').length,
    Pendente: students.filter((a) => a.status === 'Pendente').length,
    Inativo: students.filter((a) => a.status === 'Inativo').length,
  }), [students]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1600px] mx-auto pb-8"
    >
      {/* ── HEADER SUPERIOR ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Gestão de Alunos</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              {counts.Todos} cadastros
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle de matrículas, dados de contato e planos ativos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => alert('Exportando relatório CSV...')}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Novo Aluno</span>
          </button>
        </div>
      </header>

      {/* ── MÉTRICAS CHAVE (KPIs) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Total */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Base de Cadastros</span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.Todos}</div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Alunos registrados no sistema</p>
        </motion.div>

        {/* KPI 2: Ativos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Matrículas Ativas</span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.Ativo}</span>
            <span className="text-xs font-mono text-slate-400">
              ({counts.Todos ? Math.round((counts.Ativo / counts.Todos) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Com acesso regular e adimplentes</p>
        </motion.div>

        {/* KPI 3: Pendentes */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Aprovação Pendente</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.Pendente}</span>
            {counts.Pendente > 0 && (
              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                Ação necessária
              </span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Aguardando validação inicial</p>
        </motion.div>

        {/* KPI 4: Inativos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Inativos / Cancelados</span>
            <UserX size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.Inativo}</div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Sem contrato ativo no momento</p>
        </motion.div>

      </section>

      {/* ── TABELA E FILTROS PRINCIPAIS ── */}
      <motion.section variants={itemVariants} className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        
        {/* Barra de Ferramentas e Filtros */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
          
          {/* Abas por Status */}
          <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium self-start lg:self-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab === 'Pendente' ? 'Pendentes' : tab}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded border border-slate-200/60">
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Campo de Busca e Filtro por Plano */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-60">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por nome, e-mail..."
                className="w-full bg-white border border-slate-200/80 pl-8 pr-7 py-1 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
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
                className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Planos</option>
                <option value="Basic">Plano Básico</option>
                <option value="Pro">Plano Profissional</option>
                <option value="Enterprise">Plano Corporativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Alunos */}
        <div className="flex-1 overflow-x-auto min-h-[380px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
                <th className="px-4 py-2.5">Aluno</th>
                <th className="px-4 py-2.5 hidden md:table-cell">Contato</th>
                <th className="px-4 py-2.5">Plano</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 hidden lg:table-cell">Data Matrícula</th>
                <th className="px-4 py-2.5 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedAlunos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-xs text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={22} className="text-slate-300 mb-2" />
                      <p className="font-medium text-slate-700">Nenhum aluno encontrado</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Tente alterar os termos da busca ou ajustar os filtros.</p>
                      {(search || selectedPlan !== 'Todos' || activeTab !== 'Todos') && (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          Limpar todos os filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAlunos.map((aluno) => {
                  const status = statusBadge[aluno.status];
                  return (
                    <tr
                      key={aluno.id}
                      onClick={() => navigate(getAlunoRoute(aluno.id))}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Aluno & Avatar Sóbrio */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-[10px] font-mono font-semibold shrink-0">
                            {aluno.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                              {aluno.name}
                            </p>
                            <p className="text-[11px] text-slate-400 md:hidden">{aluno.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contato */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{aluno.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>{aluno.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Plano */}
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${planBadge[aluno.plan]}`}>
                          {PLAN_LABELS[aluno.plan] || aluno.plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${status.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>

                      {/* Data de Matrícula */}
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500 font-mono text-[11px]">
                        {aluno.since}
                      </td>

                      {/* Botão de Ações */}
                      <td className="px-4 py-3 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === aluno.id ? null : aluno.id);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>

                        {/* Menu Popover */}
                        <AnimatePresence>
                          {menuOpen === aluno.id && (
                            <motion.div
                              ref={menuRef}
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-4 top-10 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-1 z-30 text-left"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(getAlunoRoute(aluno.id));
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              >
                                <Eye size={13} className="text-slate-400" />
                                <span>Ver perfil</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Editar cadastro de ${aluno.name}`);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              >
                                <Edit3 size={13} className="text-slate-400" />
                                <span>Editar dados</span>
                              </button>

                              <div className="my-1 border-t border-slate-800" />

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Desativar aluno ${aluno.name}`);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                              >
                                <UserX size={13} />
                                <span>Desativar</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé e Paginação */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Exibindo <span className="font-mono font-semibold text-slate-800">{paginatedAlunos.length}</span> de{' '}
            <span className="font-mono font-semibold text-slate-800">{filteredAlunos.length}</span> cadastros
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] font-mono font-medium text-slate-700 px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </motion.section>

      {/* Modal de Cadastro de Aluno */}
      <NovoAlunoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddAluno}
      />
    </motion.div>
  );
}