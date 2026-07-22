import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  Clock,
  Plus,
  Download,
  Search,
  Calendar,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ROUTES } from '@/constants/routes';
import { useAppStore, type Student } from '@/stores/useAppStore';
import { NovoAlunoModal } from '@/components/ui/NovoAlunoModal';

/* ── Tipagens ── */
type StatusType = 'Ativo' | 'Pendente' | 'Inativo';
type PlanType = 'Basic' | 'Pro' | 'Enterprise';

/* ── Valores mensais para cálculo financeiro real ── */
const PLAN_VALUES: Record<PlanType, number> = {
  Basic: 149,
  Pro: 299,
  Enterprise: 599,
};

/* ── Mapeamento dos nomes de planos para PT-BR ── */
const PLAN_LABELS: Record<PlanType, string> = {
  Basic: 'Básico',
  Pro: 'Profissional',
  Enterprise: 'Corporativo',
};

/* ── Badges de status e planos ── */
const statusBadge: Record<StatusType, string> = {
  Ativo: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  Pendente: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  Inativo: 'bg-slate-100 text-slate-600 border border-slate-200/80',
};

const planBadge: Record<PlanType, string> = {
  Basic: 'bg-slate-100 text-slate-700 border border-slate-200/60',
  Pro: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  Enterprise: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
};

/* ── Tooltip customizado em Português ── */
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-800 space-y-1">
        <p className="font-medium text-slate-400">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-semibold">
              R$ {entry.value.toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Animações ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<'30D' | '6M' | '1Y'>('6M');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentTab, setStudentTab] = useState<'Todos' | StatusType>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const students = useAppStore((state) => state.students);
  const addStudent = useAppStore((state) => state.addStudent);
  const getStudentRoute = (studentId: number) => ROUTES.aluno.replace(':id', String(studentId));

  /* ── Métricas calculadas dinamicamente com base na store ── */
  const studentCounts = useMemo(() => ({
    total: students.length,
    ativo: students.filter((s) => s.status === 'Ativo').length,
    pendente: students.filter((s) => s.status === 'Pendente').length,
    inativo: students.filter((s) => s.status === 'Inativo').length,
  }), [students]);

  const calculatedMRR = useMemo(() => {
    return students
      .filter((s) => s.status === 'Ativo')
      .reduce((acc, s) => acc + (PLAN_VALUES[s.plan as PlanType] || 0), 0);
  }, [students]);

  const studentPlanDistribution = useMemo(() => [
    { name: PLAN_LABELS.Basic, rawKey: 'Basic', value: students.filter((s) => s.plan === 'Basic').length, color: '#64748b' },
    { name: PLAN_LABELS.Pro, rawKey: 'Pro', value: students.filter((s) => s.plan === 'Pro').length, color: '#2563eb' },
    { name: PLAN_LABELS.Enterprise, rawKey: 'Enterprise', value: students.filter((s) => s.plan === 'Enterprise').length, color: '#4f46e5' },
  ], [students]);

  const totalPlanCount = useMemo(
    () => studentPlanDistribution.reduce((sum, p) => sum + p.value, 0),
    [studentPlanDistribution]
  );

  /* ── Geração dinâmica do histórico financeiro com base nos alunos cadastrados ── */
  const dynamicFinancialData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthIndex = currentTime.getMonth();
    const countMonths = selectedRange === '30D' ? 1 : selectedRange === '6M' ? 6 : 12;

    const result = [];
    for (let i = countMonths - 1; i >= 0; i--) {
      const monthIdx = (currentMonthIndex - i + 12) % 12;
      const monthName = months[monthIdx];
      
      // Projeção proporcional da receita real com base na base ativa
      const factor = (countMonths - i) / countMonths;
      const monthlyRevenue = Math.round(calculatedMRR * (0.6 + factor * 0.4));

      result.push({
        mes: monthName,
        Receita: monthlyRevenue,
      });
    }

    return result;
  }, [calculatedMRR, currentTime, selectedRange]);

  /* ── Filtro dos agendamentos do dia vinculados aos alunos cadastrados ── */
  const todaysAgenda = useMemo(() => {
    return students.filter(
      (s) => s.nextClass && s.nextClass !== '—' && !s.nextClass.includes('Primeira avaliação a agendar')
    );
  }, [students]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const filteredStudents = useMemo(() => students.filter((student) => {
    const query = studentSearch.toLowerCase().trim();
    const matchesSearch =
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.phone.includes(query);
    const matchesTab = studentTab === 'Todos' || student.status === studentTab;
    return matchesSearch && matchesTab;
  }), [students, studentSearch, studentTab]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1600px] mx-auto pb-8"
    >
      {/* ── HEADER PRINCIPAL ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Painel de Controle</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              Sistema de Gestão
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão geral de alunos, receita recorrente mensal e agendamentos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-400" />
            <span>Exportar Relatório</span>
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
        
        {/* Total de Alunos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Total de Alunos</span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{studentCounts.total}</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${studentCounts.total ? (studentCounts.ativo / studentCounts.total) * 100 : 0}%` }}
            />
          </div>
        </motion.div>

        {/* Alunos Ativos */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Alunos Ativos</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{studentCounts.ativo}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({studentCounts.total ? Math.round((studentCounts.ativo / studentCounts.total) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">
            Alunos com plano regular vigente
          </p>
        </motion.div>

        {/* Pendentes */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Pendentes</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{studentCounts.pendente}</span>
            {studentCounts.pendente > 0 && (
              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                Aprovação pendente
              </span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">
            Aguardando validação de cadastro
          </p>
        </motion.div>

        {/* Receita Recorrente Mensal */}
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Receita Mensal (MRR)</span>
            <DollarSign size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              R$ {calculatedMRR.toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 truncate">
            Faturamento baseado nos planos ativos
          </p>
        </motion.div>

      </section>

      {/* ── SEÇÃO DE GRÁFICOS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Evolução Financeira */}
        <motion.div variants={itemVariants} className="lg:col-span-8 p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Evolução de Receita Recorrente</h2>
              <p className="text-xs text-slate-500">Acompanhamento do faturamento estimado</p>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedRange('30D')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  selectedRange === '30D' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                30 Dias
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange('6M')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  selectedRange === '6M' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                6 Meses
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange('1Y')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  selectedRange === '1Y' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                1 Ano
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100 mb-4 text-xs">
            <div>
              <span className="text-slate-400 block">Receita Recorrente Atual</span>
              <span className="text-sm font-bold font-mono text-slate-900">R$ {calculatedMRR.toLocaleString('pt-BR')}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Ticket Médio por Aluno</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                R$ {studentCounts.ativo > 0 ? Math.round(calculatedMRR / studentCounts.ativo) : 0}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-slate-400 block">Base de Assinantes</span>
              <span className="text-sm font-bold font-mono text-slate-900">{studentCounts.ativo} alunos</span>
            </div>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicFinancialData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area type="monotone" dataKey="Receita" name="Receita" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribuição de Planos */}
        <motion.div variants={itemVariants} className="lg:col-span-4 p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Distribuição por Plano</h2>
            <p className="text-xs text-slate-500">Divisão dos planos contratados pelos alunos</p>
          </div>

          {totalPlanCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
              <Users size={24} className="text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-600">Nenhum aluno cadastrado</p>
            </div>
          ) : (
            <div className="my-2 relative flex items-center justify-center h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentPlanDistribution}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={68}
                    paddingAngle={3} dataKey="value" stroke="none"
                  >
                    {studentPlanDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-slate-900">{totalPlanCount}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</span>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {studentPlanDistribution.map((plan) => {
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
            })}
          </div>
        </motion.div>

      </section>

      {/* ── SEÇÃO INFERIOR: MATRÍCULAS E AGENDA ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Tabela de Matrículas Recentes */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Matrículas Recentes</h2>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {filteredStudents.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 pl-8 pr-3 py-1 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="relative">
                <select
                  value={studentTab}
                  onChange={(e) => setStudentTab(e.target.value as StatusType | 'Todos')}
                  className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="Ativo">Ativos</option>
                  <option value="Pendente">Pendentes</option>
                  <option value="Inativo">Inativos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[220px]">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-slate-500">
                <Users size={20} className="text-slate-300 mb-2" />
                <p>Nenhum aluno encontrado para a busca realizada.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
                    <th className="px-4 py-2.5">Aluno</th>
                    <th className="px-4 py-2.5">Plano</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Data Cad.</th>
                    <th className="px-4 py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => navigate(getStudentRoute(student.id))}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{student.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${planBadge[student.plan]}`}>
                          {PLAN_LABELS[student.plan] || student.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${statusBadge[student.status]}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {student.date || formattedDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(getStudentRoute(student.id));
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Agenda do Dia */}
        <motion.div variants={itemVariants} className="lg:col-span-4 p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Agenda do Dia</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-medium">{formattedDate}</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {todaysAgenda.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  <Calendar size={20} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600">Nenhum compromisso hoje</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Agendamentos futuros aparecerão aqui.</p>
                </div>
              ) : (
                todaysAgenda.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => navigate(getStudentRoute(student.id))}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 hover:bg-slate-100/80 cursor-pointer transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-900 truncate">{student.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{student.nextClass}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.agenda)}
            className="w-full mt-4 py-1.5 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Ver agenda completa</span>
            <ChevronRight size={13} />
          </button>
        </motion.div>

      </section>

      {/* ── MODAL DE NOVO ALUNO ── */}
      <NovoAlunoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          const newStudent: Student = {
            id: students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1,
            name: data.name,
            email: data.email,
            phone: data.phone,
            plan: data.plan,
            status: data.status,
            since: formattedDate,
            date: formattedDate,
            avatar: data.name.split(' ').filter((p) => p.trim().length > 0).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('') || 'AL',
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
          addStudent(newStudent);
          setIsModalOpen(false);
          navigate(getStudentRoute(newStudent.id));
        }}
      />
    </motion.div>
  );
}