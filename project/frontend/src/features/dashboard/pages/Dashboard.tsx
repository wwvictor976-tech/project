import { Users, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/* ── Data ─────────────────────────────────── */
const stats = [
  {
    label: 'Total de Alunos',  value: '248',       change: '+12', changeLabel: 'este mês',
    up: true,  icon: Users,     iconBg: 'bg-blue-50',   iconColor: 'text-[#2563eb]',
  },
  {
    label: 'Alunos Ativos',   value: '186',       change: '+8',  changeLabel: 'este mês',
    up: true,  icon: Activity,  iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    label: 'Receita Mensal',  value: 'R$ 24.8k',  change: '+6,2%', changeLabel: 'vs. anterior',
    up: true,  icon: DollarSign,iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',
  },
  {
    label: 'Taxa de Retenção',value: '94%',        change: '-1,3%', changeLabel: 'vs. anterior',
    up: false, icon: TrendingUp,iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',
  },
];

const recentStudents = [
  { name: 'Ana Souza',     plan: 'Pro',        status: 'Ativo',    date: '18 Jul 2026', avatar: 'AS', color: '#3b82f6' },
  { name: 'Bruno Lima',    plan: 'Basic',      status: 'Ativo',    date: '16 Jul 2026', avatar: 'BL', color: '#8b5cf6' },
  { name: 'Carla Mendes',  plan: 'Enterprise', status: 'Ativo',    date: '14 Jul 2026', avatar: 'CM', color: '#10b981' },
  { name: 'Diego Rocha',   plan: 'Basic',      status: 'Pendente', date: '12 Jul 2026', avatar: 'DR', color: '#f59e0b' },
  { name: 'Elisa Ferreira',plan: 'Pro',        status: 'Ativo',    date: '10 Jul 2026', avatar: 'EF', color: '#ef4444' },
];

const activities = [
  { text: 'Nova matrícula: Ana Souza — Plano Pro',       time: 'há 2h',  dot: 'bg-[#2563eb]' },
  { text: 'Pagamento recebido: R$ 299,00 — Bruno Lima',  time: 'há 4h',  dot: 'bg-emerald-500' },
  { text: 'Aula cancelada: Personal Training 09h',        time: 'há 6h',  dot: 'bg-red-400' },
  { text: 'Renovação: Bruno Lima — Plano Pro',           time: 'ontem',  dot: 'bg-violet-500' },
  { text: 'Novo agendamento: Yoga — 21/07',              time: 'ontem',  dot: 'bg-amber-400' },
];

const statusStyle: Record<string, string> = {
  Ativo:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Pendente: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Inativo:  'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
};

const planStyle: Record<string, string> = {
  Basic:      'bg-[#f1f5f9] text-[#64748b]',
  Pro:        'bg-[#dbeafe] text-[#1d4ed8]',
  Enterprise: 'bg-[#ede9fe] text-[#6d28d9]',
};

/* ── Component ────────────────────────────── */
export default function Dashboard() {
  const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[1.05rem] font-bold text-[#0f172a] tracking-tight">Bom dia, Admin</h2>
          <p className="text-[#64748b] text-sm mt-0.5 capitalize">{date}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-[#64748b] font-medium">Plataforma ativa</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, changeLabel, up, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition-shadow duration-200 cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                <Icon size={16} />
              </span>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {change}
              </span>
            </div>
            <p className="text-[1.85rem] font-bold text-[#0f172a] leading-none tracking-tight">{value}</p>
            <p className="text-[0.77rem] font-semibold text-[#64748b] mt-1.5">{label}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{changeLabel}</p>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
            <div>
              <p className="text-sm font-bold text-[#0f172a]">Matrículas Recentes</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">Últimas 5 matrículas na plataforma</p>
            </div>
            <Link
              to={ROUTES.alunos}
              className="flex items-center gap-0.5 text-xs text-[#64748b] font-medium hover:text-[#2563eb] transition-colors no-underline"
            >
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[#f8fafc]">
            {recentStudents.map(({ name, plan, status, date, avatar, color }) => (
              <div key={name} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f8fafc] transition-colors group cursor-pointer">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[0.6rem] font-bold shrink-0"
                  style={{ background: color }}
                >
                  {avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0f172a] truncate">{name}</p>
                  <p className="text-xs text-[#94a3b8]">{date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${planStyle[plan]}`}>{plan}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[status]}`}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f1f5f9]">
            <p className="text-sm font-bold text-[#0f172a]">Atividade Recente</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">Últimas ações na plataforma</p>
          </div>
          <div className="px-5 py-4">
            <div className="relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#f1f5f9]" />
              <div className="space-y-4">
                {activities.map(({ text, time, dot }) => (
                  <div key={text} className="flex gap-3 pl-[18px] relative">
                    <span className={`absolute left-0 w-[11px] h-[11px] rounded-full mt-0.5 shrink-0 ${dot} ring-[3px] ring-white`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#334155] leading-snug">{text}</p>
                      <p className="text-xs text-[#94a3b8] mt-0.5">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
