import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAppStore } from '@/stores/useAppStore';
import type { Student } from '@/stores/useAppStore';
import {
  Users,
  Activity,
  Clock,
  Plus,
  Download,
  Search,
  MoreVertical,
  Calendar,
  CheckCircle2,
  CircleDashed,
  TrendingUp,
} from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { NovoAlunoModal } from '@/components/ui/NovoAlunoModal';

/* ── Tipagens ── */
type StatusType = 'Ativo' | 'Pendente' | 'Inativo';
type PlanType = 'Basic' | 'Pro' | 'Enterprise';

/* ── Badges padronizados ── */
const statusBadge: Record<StatusType, string> = {
  Ativo:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Pendente: 'bg-amber-50 text-amber-700 border border-amber-200',
  Inativo:  'bg-slate-100 text-slate-600 border border-slate-200',
};

const planBadge: Record<PlanType, string> = {
  Basic:      'bg-slate-100 text-slate-700',
  Pro:        'bg-blue-50 text-blue-700 border border-blue-100',
  Enterprise: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
};

/* ── Tooltip customizado ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-xl text-sm">
        <p className="font-semibold text-slate-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-6 mb-1 last:mb-0">
            <span className="text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-medium text-slate-900">
              R$ {entry.value.toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Componente Principal ── */
export default function Dashboard() {
  const [currentTime, setCurrentTime]     = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<'30D' | '6M' | '1Y'>('6M');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentTab, setStudentTab]       = useState<'Todos' | StatusType>('Todos');
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const navigate = useNavigate();

  const students   = useAppStore((state) => state.students);
  const addStudent = useAppStore((state) => state.addStudent);
  const getStudentRoute = (studentId: number) => ROUTES.aluno.replace(':id', String(studentId));

  const studentCounts = useMemo(() => ({
    total:    students.length,
    ativo:    students.filter((s) => s.status === 'Ativo').length,
    pendente: students.filter((s) => s.status === 'Pendente').length,
    inativo:  students.filter((s) => s.status === 'Inativo').length,
  }), [students]);

  const studentPlanDistribution = useMemo(() => [
    { name: 'Basic',      value: students.filter((s) => s.plan === 'Basic').length,      color: '#64748b' },
    { name: 'Pro',        value: students.filter((s) => s.plan === 'Pro').length,        color: '#2563eb' },
    { name: 'Enterprise', value: students.filter((s) => s.plan === 'Enterprise').length, color: '#312e81' },
  ], [students]);

  const totalPlanCount = useMemo(
    () => studentPlanDistribution.reduce((sum, p) => sum + p.value, 0),
    [studentPlanDistribution],
  );

  const statsData = useMemo(() => [
    { label: 'Total de Alunos',       value: String(studentCounts.total),    icon: Users,        color: 'blue' },
    { label: 'Alunos Ativos',         value: String(studentCounts.ativo),    icon: Activity,     color: 'emerald' },
    { label: 'Aguardando Aprovação',  value: String(studentCounts.pendente), icon: Clock,        color: 'amber' },
    { label: 'Inativos / Cancelados', value: String(studentCounts.inativo),  icon: CircleDashed, color: 'slate' },
  ], [studentCounts]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 animate-fade-slide">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral financeira e operacional</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Clock size={15} className="text-slate-400" />
            <span className="font-medium">{formattedDate} · {formattedTime}</span>
          </div>
          <button type="button" className="btn-outline">
            <Download size={16} />
            <span className="hidden sm:inline">Exportar Relatório</span>
          </button>
          <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            <span>Novo Aluno</span>
          </button>
        </div>
      </header>

      {/* ── MÉTRICAS (KPIs) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          const iconStyle =
            stat.color === 'blue'    ? 'bg-blue-50 text-blue-600' :
            stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
            stat.color === 'amber'   ? 'bg-amber-50 text-amber-600' :
            'bg-slate-50 text-slate-500';

          return (
            <div
              key={index}
              className="panel-card-sm group flex flex-col justify-between cursor-default animate-card-enter"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex justify-between items-start mb-5">
                <span className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${iconStyle}`}>
                  <Icon size={18} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              <div className="mt-4 text-xs font-medium text-slate-400">
                {studentCounts.total === 0 ? 'Nenhum cadastro ainda' : 'Base atual'}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── CHARTS ── */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-5">

        {/* Gráfico de Área - Evolução Financeira */}
        <div className="xl:col-span-8 panel-card flex flex-col animate-fade-slide" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Evolução Financeira</h2>
              <p className="text-sm text-slate-400 mt-0.5">Receitas e Despesas do período</p>
            </div>
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
              {(['30D', '6M', '1Y'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    selectedRange === range
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {range === '30D' ? '30 dias' : range === '6M' ? '6 meses' : '1 ano'}
                </button>
              ))}
            </div>
          </div>

          {/* Empty state for chart */}
          <div className="w-full h-[320px] flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <TrendingUp size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Sem dados financeiros ainda</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Os gráficos de receita e despesas aparecerão aqui assim que houver movimentação.
            </p>
          </div>
        </div>

        {/* Gráfico Donut - Distribuição por Plano */}
        <div className="xl:col-span-4 panel-card flex flex-col animate-fade-slide" style={{ animationDelay: '0.38s' }}>
          <h2 className="text-base font-semibold text-slate-800 mb-0.5">Assinaturas Ativas</h2>
          <p className="text-sm text-slate-400 mb-5">Distribuição da base de alunos</p>

          {totalPlanCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <Users size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Nenhum aluno cadastrado</p>
              <p className="text-xs text-slate-400 mt-1">Adicione alunos para ver a distribuição</p>
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center h-[200px] mb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentPlanDistribution}
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={88}
                      paddingAngle={3} dataKey="value" stroke="none"
                      isAnimationActive animationDuration={1100}
                    >
                      {studentPlanDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-800">{totalPlanCount}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>

              <div className="mt-auto space-y-2.5 pt-4 border-t border-slate-100">
                {studentPlanDistribution.map((plan) => {
                  const percentage = totalPlanCount > 0 ? ((plan.value / totalPlanCount) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={plan.name} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-xl transition-colors">
                      <span className="text-slate-600 font-medium flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                        {plan.name}
                      </span>
                      <span className="text-slate-800 font-semibold">
                        {plan.value} <span className="text-slate-400 font-normal ml-1">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── TABELA E AGENDA ── */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-5">

        {/* Tabela de Matrículas */}
        <div
          className="xl:col-span-7 bg-white rounded-[24px] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col animate-fade-slide overflow-hidden"
          style={{ animationDelay: '0.45s' }}
        >
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-slate-800">Matrículas Recentes</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="input-field w-full sm:w-52 pl-8 pr-3 py-1.5"
                />
              </div>
              <div className="relative">
                <select
                  value={studentTab}
                  onChange={(e) => setStudentTab(e.target.value as StatusType | 'Todos')}
                  className="input-field w-full sm:w-auto pl-3 pr-7 py-1.5 appearance-none cursor-pointer font-medium text-slate-600"
                >
                  <option value="Todos">Todos</option>
                  <option value="Ativo">Ativos</option>
                  <option value="Pendente">Pendentes</option>
                  <option value="Inativo">Inativos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[280px]">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-14 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                  <Users size={20} className="text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Nenhum aluno cadastrado</p>
                <p className="text-xs text-slate-400 mt-1">Clique em "Novo Aluno" para começar</p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={14} /> Adicionar primeiro aluno
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aluno</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Plano</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cadastro</th>
                    <th className="px-5 py-3.5 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => navigate(getStudentRoute(student.id))}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{student.name}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{student.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${planBadge[student.plan]}`}>
                          {student.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${statusBadge[student.status]}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs font-medium">{student.date}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Agenda do Dia */}
        <div className="xl:col-span-5 panel-card flex flex-col animate-fade-slide" style={{ animationDelay: '0.52s' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Agenda do Dia
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">Próximas aulas e compromissos</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg uppercase tracking-wider">Hoje</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <CheckCircle2 size={20} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Agenda limpa para hoje</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Crie eventos na Agenda para vê-los aqui.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.agenda)}
            className="btn-outline w-full justify-center mt-5"
          >
            Abrir Calendário Completo
          </button>
        </div>
      </section>

      {/* ── MODAL NOVO ALUNO ── */}
      <NovoAlunoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          const newStudent: Student = {
            id:               students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1,
            name:             data.name,
            email:            data.email,
            phone:            data.phone,
            plan:             data.plan,
            status:           data.status,
            since:            formattedDate,
            date:             formattedDate,
            avatar:           data.name.split(' ').filter((p) => p.trim().length > 0).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('') || 'AL',
            color:            '#2563eb',
            age:              data.age,
            height:           data.height,
            weight:           data.weight,
            trainingLevel:    data.trainingLevel,
            allergies:        data.allergies,
            medications:      data.medications,
            observations:     data.observations,
            nextClass:        'Primeira avaliação a agendar • —',
            attendanceRate:   '0%',
            financialSummary: 'R$ 0 este mês',
          };
          addStudent(newStudent);
          setIsModalOpen(false);
          navigate(getStudentRoute(newStudent.id));
        }}
      />
    </div>
  );
}
