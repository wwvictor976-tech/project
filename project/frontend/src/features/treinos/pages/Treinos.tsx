import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Plus,
  Search,
  Download,
  Clock,
  Trophy,
  CheckCircle2,
  MoreVertical,
  Eye,
  Edit3,
  PauseCircle,
  PlayCircle,
  X,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

/* ── Tipagens ── */
type WorkoutStatus = 'Ativo' | 'Pausado' | 'Concluído';
type GoalType = 'Hipertrofia' | 'Emagrecimento' | 'Condicionamento' | 'Reabilitação';

export interface FichaTreino {
  id: number;
  studentId: number;
  studentName: string;
  avatar: string;
  goal: GoalType;
  division: string;
  exercisesCount: number;
  weeklyFrequency: string;
  startDate: string;
  endDate: string;
  adherenceRate: number;
  status: WorkoutStatus;
  instructor: string;
}

/* ── Base Zerada ── */
const INITIAL_WORKOUTS: FichaTreino[] = [];

/* ── Badges de Status & Objetivos ── */
const statusConfig: Record<WorkoutStatus, { label: string; style: string; dot: string }> = {
  Ativo: { label: 'Ativo', style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-600' },
  Pausado: { label: 'Pausado', style: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-600' },
  Concluído: { label: 'Concluído', style: 'bg-slate-100 text-slate-600 border-slate-200/80', dot: 'bg-slate-400' },
};

const goalBadgeStyle: Record<GoalType, string> = {
  Hipertrofia: 'bg-blue-50 text-blue-700 border-blue-200/60',
  Emagrecimento: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  Condicionamento: 'bg-amber-50 text-amber-700 border-amber-200/60',
  Reabilitação: 'bg-teal-50 text-teal-700 border-teal-200/60',
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

export default function Treinos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workouts, setWorkouts] = useState<FichaTreino[]>(INITIAL_WORKOUTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterGoal, setFilterGoal] = useState<string>('Todos');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextStatus = params.get('status') ?? 'Todos';

    if (nextStatus !== filterStatus) {
      setFilterStatus(nextStatus);
      setCurrentPage(1);
    }
  }, [location.search, filterStatus]);

  /* Fechar menu de ações ao clicar fora */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ── Métricas e KPIs Calculados ── */
  const counts = useMemo(() => {
    const total = workouts.length;
    const ativos = workouts.filter((w) => w.status === 'Ativo').length;
    const pausados = workouts.filter((w) => w.status === 'Pausado').length;
    const concluidos = workouts.filter((w) => w.status === 'Concluído').length;
    
    const activeWorkouts = workouts.filter((w) => w.status === 'Ativo');
    const avgAdherence = activeWorkouts.length
      ? Math.round(activeWorkouts.reduce((acc, curr) => acc + curr.adherenceRate, 0) / activeWorkouts.length)
      : 0;

    return { total, ativos, pausados, concluidos, avgAdherence };
  }, [workouts]);

  /* ── Filtros e Paginação ── */
  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        w.studentName.toLowerCase().includes(q) ||
        w.division.toLowerCase().includes(q) ||
        w.instructor.toLowerCase().includes(q);

      const matchesStatus = filterStatus === 'Todos' || w.status === filterStatus;
      const matchesGoal = filterGoal === 'Todos' || w.goal === filterGoal;

      return matchesSearch && matchesStatus && matchesGoal;
    });
  }, [workouts, search, filterStatus, filterGoal]);

  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage) || 1;
  const paginatedWorkouts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWorkouts.slice(start, start + itemsPerPage);
  }, [filteredWorkouts, currentPage]);

  const handleToggleStatus = (id: number) => {
    setWorkouts((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextStatus: WorkoutStatus = w.status === 'Ativo' ? 'Pausado' : 'Ativo';
          return { ...w, status: nextStatus };
        }
        return w;
      })
    );
    setMenuOpen(null);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);

    if (status === 'Todos') {
      navigate(ROUTES.treinos, { replace: true });
    } else {
      navigate(`${ROUTES.treinos}?status=${encodeURIComponent(status)}`, { replace: true });
    }
  };

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
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Prescrição de Treinos</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              {counts.ativos} Fichas Ativas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de rotinas de exercícios, divisões de treino, metas e acompanhamento de adesão.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => alert('Exportando relatório de treinos...')}
            disabled={workouts.length === 0}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-400" />
            <span>Exportar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Abrindo construtor de treinos...')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Nova Ficha</span>
          </button>
        </div>
      </header>

      {/* ── KPIs DE RESUMO DE PERFORMANCE ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Ativos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Treinos em Execução</span>
            <Dumbbell size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.ativos}</div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Fichas vigentes e ativas</p>
        </motion.div>

        {/* KPI 2: Pausados */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Aguardando / Pausados</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.pausados}</div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Em reavaliação ou férias</p>
        </motion.div>

        {/* KPI 3: Concluídos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Fichas Concluídas</span>
            <CheckCircle2 size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.concluidos}</div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Ciclos de treino finalizados</p>
        </motion.div>

        {/* KPI 4: Adesão Média */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Adesão Média da Base</span>
            <Trophy size={16} className="text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {counts.avgAdherence > 0 ? `${counts.avgAdherence}%` : '—'}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${counts.avgAdherence}%` }} />
          </div>
        </motion.div>

      </section>

      {/* ── TABELA E PAINEL DE FILTROS ── */}
      <motion.section variants={itemVariants} className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        
        {/* Toolbar de Pesquisa e Filtro */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
          
          {/* Abas por Status */}
          <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium self-start lg:self-auto">
            {(['Todos', 'Ativo', 'Pausado', 'Concluído'] as const).map((s) => {
              const countVal = s === 'Todos' ? counts.total : s === 'Ativo' ? counts.ativos : s === 'Pausado' ? counts.pausados : counts.concluidos;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                    filterStatus === s
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{s}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded border border-slate-200/60">
                    {countVal}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Campo de Busca e Filtro de Objetivo */}
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
                placeholder="Buscar por aluno, divisão ou personal..."
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
                value={filterGoal}
                onChange={(e) => {
                  setFilterGoal(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Objetivos</option>
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Emagrecimento">Emagrecimento</option>
                <option value="Condicionamento">Condicionamento</option>
                <option value="Reabilitação">Reabilitação</option>
              </select>
            </div>
          </div>

        </div>

        {/* Tabela de Prescrições */}
        <div className="flex-1 overflow-x-auto min-h-[380px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
                <th className="px-4 py-2.5">Aluno</th>
                <th className="px-4 py-2.5">Divisão / Prescrição</th>
                <th className="px-4 py-2.5 hidden md:table-cell">Objetivo</th>
                <th className="px-4 py-2.5 hidden lg:table-cell">Adesão do Aluno</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedWorkouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-xs text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Dumbbell size={22} className="text-slate-300 mb-2" />
                      <p className="font-medium text-slate-700">
                        {workouts.length === 0 ? 'Nenhuma ficha de treino cadastrada' : 'Nenhuma ficha de treino encontrada'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {workouts.length === 0
                          ? 'Crie a primeira prescrição de treino para um aluno no botão acima.'
                          : 'Tente ajustar os parâmetros de pesquisa ou filtros selecionados.'}
                      </p>
                      {(search || filterStatus !== 'Todos' || filterGoal !== 'Todos') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setFilterStatus('Todos');
                            setFilterGoal('Todos');
                          }}
                          className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          Limpar todos os filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedWorkouts.map((w) => {
                  const status = statusConfig[w.status];
                  return (
                    <tr
                      key={w.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => alert(`Visualizando ficha de ${w.studentName}`)}
                    >
                      {/* Aluno */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-[10px] font-mono font-semibold shrink-0">
                            {w.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                              {w.studentName}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <User size={10} className="text-slate-400" />
                              <span>{w.instructor}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Divisão & Frequência */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{w.division}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {w.exercisesCount} exercícios • {w.weeklyFrequency}
                          </p>
                        </div>
                      </td>

                      {/* Objetivo */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${goalBadgeStyle[w.goal]}`}>
                          {w.goal}
                        </span>
                      </td>

                      {/* Taxa de Adesão */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500">Frequência</span>
                            <span className="font-semibold text-slate-900">{w.adherenceRate}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                w.adherenceRate >= 80
                                  ? 'bg-emerald-500'
                                  : w.adherenceRate >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${w.adherenceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${status.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === w.id ? null : w.id);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>

                        {/* Menu Popover */}
                        <AnimatePresence>
                          {menuOpen === w.id && (
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
                                  alert(`Ver ficha de ${w.studentName}`);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              >
                                <Eye size={13} className="text-slate-400" />
                                <span>Ver ficha completa</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Editar ficha de ${w.studentName}`);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              >
                                <Edit3 size={13} className="text-slate-400" />
                                <span>Editar exercícios</span>
                              </button>

                              <div className="my-1 border-t border-slate-800" />

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(w.id);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              >
                                {w.status === 'Ativo' ? (
                                  <>
                                    <PauseCircle size={13} className="text-amber-400" />
                                    <span>Pausar ficha</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle size={13} className="text-emerald-400" />
                                    <span>Reativar ficha</span>
                                  </>
                                )}
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
            Exibindo <span className="font-mono font-semibold text-slate-800">{paginatedWorkouts.length}</span> de{' '}
            <span className="font-mono font-semibold text-slate-800">{filteredWorkouts.length}</span> prescrições
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
    </motion.div>
  );
}