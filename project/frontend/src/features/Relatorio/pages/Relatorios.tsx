import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  BarChart2,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Star,
  UserCheck,
  UserX,
  Target,
  Inbox,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

/* ── Contratoes de Dados da API / Backend ── */
export type ReportCategory = 'geral' | 'alunos' | 'financeiro' | 'instrutores';

export interface RetentionMetric {
  month: string;
  retencao: number;
}

export interface EnrollmentMetric {
  month: string;
  novas: number;
  cancelamentos: number;
}

export interface PlanDistributionMetric {
  name: string;
  value: number;
  color: string;
}

export interface InstructorMetric {
  id: number;
  name: string;
  avatar: string;
  classesCount: number;
  studentsCount: number;
  rating: number;
}

export interface ReportsSummary {
  retentionRate: number;
  retentionChange: number;
  newEnrollments: number;
  enrollmentsChange: number;
  cancellations: number;
  cancellationsChange: number;
  averageTicket: number;
  ticketChange: number;
}

/* ── Custom Tooltip do Recharts ── */
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-800 space-y-1">
        <p className="font-medium text-slate-400">{label}</p>
        {payload.map((p: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}:
            </span>
            <span className="font-semibold">
              {typeof p.value === 'number' && p.name?.includes('%') ? `${p.value}%` : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
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

const REPORT_TYPES: { id: ReportCategory; label: string; icon: React.ElementType }[] = [
  { id: 'geral', label: 'Visão Geral', icon: BarChart2 },
  { id: 'alunos', label: 'Alunos & Retenção', icon: Users },
  { id: 'financeiro', label: 'Métricas Financeiras', icon: DollarSign },
  { id: 'instrutores', label: 'Desempenho da Equipe', icon: Award },
];

const PERIODS = ['Últimos 7 dias', 'Este mês', 'Últimos 3 meses', 'Este ano'];

export default function Relatorios() {
  const [activeReport, setActiveReport] = useState<ReportCategory>('geral');
  const [period, setPeriod] = useState('Este mês');

  /* ── Estados para Conexão com API ── */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* Dados vindos do Backend (Iniciam Zerados) */
  const [summary, setSummary] = useState<ReportsSummary>({
    retentionRate: 0,
    retentionChange: 0,
    newEnrollments: 0,
    enrollmentsChange: 0,
    cancellations: 0,
    cancellationsChange: 0,
    averageTicket: 0,
    ticketChange: 0,
  });

  const [enrollmentsData, setEnrollmentsData] = useState<EnrollmentMetric[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistributionMetric[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionMetric[]>([]);
  const [instructors, setInstructors] = useState<InstructorMetric[]>([]);

  /* ── Efeito de Busca no Backend ── */
  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true);
      setError(null);

      try {
        /* TODO: Substituir por chamada real da API
           Exemplo:
           const response = await api.get(`/reports?type=${activeReport}&period=${encodeURIComponent(period)}`);
           setSummary(response.data.summary);
           setEnrollmentsData(response.data.enrollments);
           ...
        */
        await new Promise((resolve) => setTimeout(resolve, 300)); // Simulação de latency
      } catch (err) {
        setError('Falha ao carregar métricas do servidor.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, [activeReport, period]);

  /* Totalizador seguro contra divisão por zero */
  const totalPlanCount = useMemo(
    () => planDistribution.reduce((acc, curr) => acc + curr.value, 0),
    [planDistribution]
  );

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
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Relatórios & Analytics</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              Desempenho Global
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise consolidada de retenção, aquisição de alunos, receitas e produtividade.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => alert('Exportando relatório consolidado...')}
            disabled={isLoading || (enrollmentsData.length === 0 && instructors.length === 0)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-400" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </header>

      {/* ── SELETOR DE MÓDULO DE RELATÓRIO ── */}
      <motion.div variants={itemVariants} className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium max-w-xl">
        {REPORT_TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveReport(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeReport === id
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── MENSAGEM DE ERRO NA API ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 bg-rose-50 border border-rose-200/80 rounded-lg text-xs text-rose-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveReport(activeReport)}
              className="font-medium underline hover:text-rose-800 cursor-pointer"
            >
              Tentar novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPIS DE RESUMO EXECUTIVO ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Retenção */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Taxa de Retenção</span>
            <Target size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {isLoading ? '—' : `${summary.retentionRate}%`}
            </span>
            {summary.retentionChange !== 0 && (
              <span className={`text-xs font-mono font-medium flex items-center ${summary.retentionChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {summary.retentionChange > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {summary.retentionChange}%
              </span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Média de permanência da base</p>
        </motion.div>

        {/* KPI 2: Novas Matrículas */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Novas Matrículas</span>
            <UserCheck size={16} className="text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {isLoading ? '—' : summary.newEnrollments}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Novos contratos no período</p>
        </motion.div>

        {/* KPI 3: Cancelamentos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Cancelamentos (Churn)</span>
            <UserX size={16} className="text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {isLoading ? '—' : summary.cancellations}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Saídas registradas no período</p>
        </motion.div>

        {/* KPI 4: Ticket Médio */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Ticket Médio</span>
            <DollarSign size={16} className="text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {isLoading ? '—' : `R$ ${summary.averageTicket}`}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">Valor médio por assinatura</p>
        </motion.div>

      </section>

      {/* ── PAINEL DE GRÁFICOS PRINCIPAIS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Gráfico 1: Aquisição vs. Evasão */}
        <motion.div variants={itemVariants} className="lg:col-span-8 p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Aquisição vs. Evasão de Alunos</h2>
              <p className="text-xs text-slate-500">Fluxo mensal de entradas e cancelamentos</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Novas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-400" /> Cancelamentos
              </span>
            </div>
          </div>

          <div className="h-[230px] w-full relative flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw size={14} className="animate-spin" />
                <span>Carregando dados...</span>
              </div>
            ) : enrollmentsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-xs text-slate-400">
                <Inbox size={22} className="text-slate-300 mb-1.5" />
                <p className="font-medium text-slate-600">Sem dados históricos</p>
                <p className="text-[11px] mt-0.5">As movimentações de alunos aparecerão aqui.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="novas" name="Novas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelamentos" name="Cancelamentos" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Gráfico 2: Distribuição de Planos */}
        <motion.div variants={itemVariants} className="lg:col-span-4 p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Distribuição por Plano</h2>
            <p className="text-xs text-slate-500">Proporção dos contratos ativos no sistema</p>
          </div>

          <div className="my-2 relative flex items-center justify-center h-[160px]">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw size={14} className="animate-spin" />
              </div>
            ) : totalPlanCount === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-xs text-slate-400">
                <Inbox size={20} className="text-slate-300 mb-1" />
                <p className="text-[11px]">Nenhum plano ativo</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={68}
                      paddingAngle={3} dataKey="value" stroke="none"
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold font-mono text-slate-900">{totalPlanCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Ativos</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {planDistribution.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-2">Sem registros de plano</p>
            ) : (
              planDistribution.map((plan) => {
                const percentage = totalPlanCount > 0 ? Math.round((plan.value / totalPlanCount) * 100) : 0;
                return (
                  <div key={plan.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                      <span className="font-medium text-slate-700">{plan.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-900 font-semibold">{plan.value}</span>
                      <span className="text-slate-400 text-[11px]">({percentage}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

      </section>

      {/* ── RETENÇÃO & ESTRUTURA DA EQUIPE ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Curva de Retenção */}
        <motion.div variants={itemVariants} className="lg:col-span-6 p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Evolução da Taxa de Retenção</h2>
            <p className="text-xs text-slate-500">Histórico de permanência dos alunos (%)</p>
          </div>

          <div className="h-[200px] w-full relative flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw size={14} className="animate-spin" />
              </div>
            ) : retentionData.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-xs text-slate-400">
                <Inbox size={20} className="text-slate-300 mb-1" />
                <p className="text-[11px]">Nenhum histórico de retenção</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={retentionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRetencao" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area type="monotone" dataKey="retencao" name="Retenção (%)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRetencao)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Desempenho da Equipe */}
        <motion.div variants={itemVariants} className="lg:col-span-6 p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Desempenho da Equipe</h2>
              <p className="text-xs text-slate-500">Ranking por volume de aulas e notas de alunos</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Abrindo relatório da equipe...')}
              disabled={instructors.length === 0}
              className="text-xs text-blue-600 font-medium hover:text-blue-700 disabled:opacity-40 disabled:hover:text-blue-600 flex items-center gap-1 cursor-pointer"
            >
              <FileText size={13} />
              <span>Ver completo</span>
            </button>
          </div>

          <div className="space-y-2.5 min-h-[180px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full py-12 text-xs text-slate-400 gap-2">
                <RefreshCw size={14} className="animate-spin" />
                <span>Buscando instrutores...</span>
              </div>
            ) : instructors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-slate-400">
                <Inbox size={20} className="text-slate-300 mb-1" />
                <p className="font-medium text-slate-600">Nenhum instrutor avaliado</p>
                <p className="text-[11px] mt-0.5">Os dados da equipe serão listados aqui.</p>
              </div>
            ) : (
              instructors.map((inst, index) => (
                <div
                  key={inst.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{inst.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {inst.classesCount} aulas • {inst.studentsCount} alunos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 shrink-0">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    <span>{inst.rating}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </section>
    </motion.div>
  );
}