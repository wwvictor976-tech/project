import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Flame,
  Beef,
  Droplets,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  X,
  User,
  Utensils,
} from 'lucide-react';

/* ── Tipagens ── */
export type DietGoal = 'Emagrecimento' | 'Hipertrofia' | 'Manutenção' | 'Saúde';
export type DietStatus = 'Ativa' | 'Pausada' | 'Concluída';

export interface DietPlan {
  id: number;
  name: string;
  student: string;
  studentAvatar: string;
  goal: DietGoal;
  status: DietStatus;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  startDate: string;
  nutritionist: string;
  adherence: number;
}

/* ── Base Zerada para Produção ── */
const INITIAL_DIETS: DietPlan[] = [];

/* ── Configurações de Status e Objetivos ── */
const goalConfig: Record<DietGoal, { style: string; icon: React.ElementType }> = {
  Emagrecimento: { style: 'bg-rose-50 text-rose-700 border-rose-200/60', icon: Flame },
  Hipertrofia: { style: 'bg-blue-50 text-blue-700 border-blue-200/60', icon: Beef },
  Manutenção: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', icon: Leaf },
  Saúde: { style: 'bg-purple-50 text-purple-700 border-purple-200/60', icon: Droplets },
};

const statusConfig: Record<DietStatus, { label: string; style: string; dot: string }> = {
  Ativa: { label: 'Ativa', style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-600' },
  Pausada: { label: 'Pausada', style: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-600' },
  Concluída: { label: 'Concluída', style: 'bg-slate-100 text-slate-600 border-slate-200/80', dot: 'bg-slate-400' },
};

/* ── Componente da Barra de Macronutrientes ── */
function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-mono font-semibold text-slate-900">{value}g</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

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

export default function Dietas() {
  const [diets, setDiets] = useState<DietPlan[]>(INITIAL_DIETS);
  const [search, setSearch] = useState('');
  const [filterGoal, setFilterGoal] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  /* Sincronizar filtro de status da URL */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status') ?? 'Todos';
    if (status !== filterStatus) {
      setFilterStatus(status);
      setCurrentPage(1);
    }
  }, [location.search]);

  /* ── Métricas Calculadas ── */
  const counts = useMemo(() => {
    const total = diets.length;
    const ativas = diets.filter((d) => d.status === 'Ativa').length;
    const pausadas = diets.filter((d) => d.status === 'Pausada').length;
    const concluidas = diets.filter((d) => d.status === 'Concluída').length;

    const activeDiets = diets.filter((d) => d.status === 'Ativa');
    const avgAdherence = activeDiets.length
      ? Math.round(activeDiets.reduce((acc, curr) => acc + curr.adherence, 0) / activeDiets.length)
      : 0;

    return { total, ativas, pausadas, concluidas, avgAdherence };
  }, [diets]);

  /* ── Filtros e Paginação ── */
  const filteredDiets = useMemo(() => {
    return diets.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.student.toLowerCase().includes(q) ||
        d.nutritionist.toLowerCase().includes(q);

      const matchGoal = filterGoal === 'Todos' || d.goal === filterGoal;
      const matchStatus = filterStatus === 'Todos' || d.status === filterStatus;

      return matchSearch && matchGoal && matchStatus;
    });
  }, [diets, search, filterGoal, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredDiets.length / itemsPerPage));
  const paginated = filteredDiets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleToggleStatus = (id: number) => {
    setDiets((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus: DietStatus = d.status === 'Ativa' ? 'Pausada' : 'Ativa';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
    setMenuOpen(null);
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterGoal('Todos');
    setFilterStatus('Todos');
    setCurrentPage(1);
    navigate(ROUTES.dietas, { replace: true });
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
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Planos Alimentares</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              {counts.ativas} Planos Ativos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de dietas, metas nutricionais, macronutrientes e acompanhamento de adesão.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => alert('Exportando relatórios de dietas...')}
            disabled={diets.length === 0}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-400" />
            <span>Exportar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Abrindo formulário de novo plano alimentar...')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Novo Plano</span>
          </button>
        </div>
      </header>

      {/* ── KPIs DE RESUMO ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Ativos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Planos em Vigência</span>
            <Leaf size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.ativas}</div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Prescrições ativas da base</p>
        </motion.div>

        {/* KPI 2: Pausados */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Aguardando / Pausados</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.pausadas}</div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Planos temporariamente suspensos</p>
        </motion.div>

        {/* KPI 3: Concluídos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Ciclos Concluídos</span>
            <Utensils size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{counts.concluidas}</div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Estratégias nutricionais finalizadas</p>
        </motion.div>

        {/* KPI 4: Adesão Média */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Adesão Média Nutricional</span>
            <Beef size={16} className="text-blue-600" />
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

      {/* ── PAINEL PRINCIPAL & FILTROS ── */}
      <motion.section variants={itemVariants} className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        
        {/* Toolbar de Pesquisa e Abas */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
          
          {/* Abas por Status */}
          <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium self-start lg:self-auto">
            {(['Todos', 'Ativa', 'Pausada', 'Concluída'] as const).map((s) => {
              const countVal =
                s === 'Todos'
                  ? counts.total
                  : s === 'Ativa'
                  ? counts.ativas
                  : s === 'Pausada'
                  ? counts.pausadas
                  : counts.concluidas;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setFilterStatus(s);
                    setCurrentPage(1);
                    if (s === 'Todos') {
                      navigate(ROUTES.dietas, { replace: true });
                    } else {
                      navigate(`${ROUTES.dietas}?status=${encodeURIComponent(s)}`, { replace: true });
                    }
                  }}
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
                placeholder="Buscar aluno, plano ou nutricionista..."
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
                <option value="Emagrecimento">Emagrecimento</option>
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Saúde">Saúde</option>
              </select>
            </div>
          </div>

        </div>

        {/* Grid de Cards de Dietas */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 min-h-[360px] relative">
          {paginated.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-xs text-slate-500">
              <Utensils size={22} className="text-slate-300 mb-2" />
              <p className="font-medium text-slate-700">
                {diets.length === 0 ? 'Nenhum plano alimentar cadastrado' : 'Nenhum plano encontrado'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                {diets.length === 0
                  ? 'Cadastre a primeira prescrição nutricional para um aluno no botão acima.'
                  : 'Tente ajustar os parâmetros de pesquisa ou selecione outro objetivo.'}
              </p>
              {(search || filterGoal !== 'Todos' || filterStatus !== 'Todos') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          ) : (
            paginated.map((diet) => {
              const goal = goalConfig[diet.goal];
              const status = statusConfig[diet.status];
              const GoalIcon = goal.icon;

              return (
                <div
                  key={diet.id}
                  className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300/90 transition-all shadow-2xs flex flex-col justify-between gap-3 text-xs"
                >
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-[10px] font-mono font-semibold shrink-0">
                        {diet.studentAvatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{diet.student}</p>
                        <p className="text-[11px] text-slate-500 truncate">{diet.name}</p>
                      </div>
                    </div>

                    {/* Status & Menu */}
                    <div className="flex items-center gap-1 shrink-0 relative">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${status.style}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>

                      <button
                        type="button"
                        onClick={() => setMenuOpen(menuOpen === diet.id ? null : diet.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {/* Menu Popover */}
                      <AnimatePresence>
                        {menuOpen === diet.id && (
                          <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-7 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-1 z-30 text-left"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Ver plano de ${diet.student}`);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Eye size={13} className="text-slate-400" />
                              <span>Ver detalhes</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                alert(`Editar plano de ${diet.student}`);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Edit3 size={13} className="text-slate-400" />
                              <span>Editar plano</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(diet.id)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              {diet.status === 'Ativa' ? (
                                <>
                                  <PauseCircle size={13} className="text-amber-400" />
                                  <span>Pausar plano</span>
                                </>
                              ) : (
                                <>
                                  <PlayCircle size={13} className="text-emerald-400" />
                                  <span>Reativar plano</span>
                                </>
                              )}
                            </button>

                            <div className="my-1 border-t border-slate-800" />

                            <button
                              type="button"
                              onClick={() => {
                                setDiets((prev) => prev.filter((d) => d.id !== diet.id));
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                              <span>Excluir</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Objetivo & Total Calorias */}
                  <div className="flex items-center justify-between py-1 border-y border-slate-100">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${goal.style}`}>
                      <GoalIcon size={12} />
                      {diet.goal}
                    </span>
                    <div className="flex items-center gap-1 font-mono text-slate-900 font-semibold">
                      <Flame size={13} className="text-amber-500" />
                      <span>{diet.calories.toLocaleString('pt-BR')}</span>
                      <span className="text-[10px] font-normal text-slate-400">kcal/dia</span>
                    </div>
                  </div>

                  {/* Barras de Macronutrientes */}
                  <div className="space-y-2 pt-1">
                    <MacroBar label="Proteínas" value={diet.protein} max={250} color="#2563eb" />
                    <MacroBar label="Carboidratos" value={diet.carbs} max={400} color="#d97706" />
                    <MacroBar label="Gorduras" value={diet.fat} max={150} color="#e11d48" />
                  </div>

                  {/* Rodapé do Card */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-mono">
                      Adesão:{' '}
                      <strong
                        className={
                          diet.adherence >= 85
                            ? 'text-emerald-600'
                            : diet.adherence >= 70
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }
                      >
                        {diet.adherence}%
                      </strong>
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <User size={11} className="text-slate-400" />
                      <span>{diet.nutritionist}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé e Paginação */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Exibindo <span className="font-mono font-semibold text-slate-800">{paginated.length}</span> de{' '}
            <span className="font-mono font-semibold text-slate-800">{filteredDiets.length}</span> planos
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