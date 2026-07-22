import { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Dumbbell,
  Clock,
  Trophy,
  CheckCircle2,
} from 'lucide-react';

export default function Treinos() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  // Stats always zero since there's no data
  const counts = { total: 0, ativos: 0, pausados: 0, concluidos: 0 };

  return (
    <div className="space-y-6 text-slate-800">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 animate-fade-slide">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Fichas de Treino</h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              0 Fichas Ativas
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 animate-fade-slide" style={{ animationDelay: '0.1s' }}>
            Monte prescrições de treinos, monitore volume, divisão e frequência dos alunos
          </p>
        </div>

        <div className="flex items-center gap-3 animate-fade-slide" style={{ animationDelay: '0.2s' }}>
          <button type="button" className="btn-outline">
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => alert('Construtor de treinos em breve')}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Treino</span>
          </button>
        </div>
      </div>

      {/* ── KPI STATS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Treinos Ativos',  val: counts.ativos,    icon: Dumbbell,     color: 'emerald' },
          { label: 'Pausados',        val: counts.pausados,  icon: Clock,        color: 'amber' },
          { label: 'Concluídos',      val: counts.concluidos, icon: CheckCircle2, color: 'slate' },
          { label: 'Adesão Média',    val: '—',              icon: Trophy,       color: 'blue' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          const iconStyle =
            kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
            kpi.color === 'amber'   ? 'bg-amber-50 text-amber-600' :
            kpi.color === 'blue'    ? 'bg-blue-50 text-blue-600' :
            'bg-slate-100 text-slate-500';
          return (
            <div
              key={i}
              className="panel-card-sm animate-card-enter flex items-center justify-between"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.val}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconStyle}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CARD PRINCIPAL ── */}
      <div
        className="bg-white rounded-[24px] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden animate-fade-slide"
        style={{ animationDelay: '0.3s' }}
      >
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-white/50 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl text-xs font-medium w-full md:w-auto overflow-x-auto">
            {(['Todos', 'Ativo', 'Pausado', 'Concluído'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === s
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative flex-1 md:w-64 min-w-[200px]">
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar treino, aluno ou personal..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <Dumbbell size={28} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Nenhuma ficha de treino ainda</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
            Crie a primeira prescrição de treino para um aluno. As fichas aparecerão aqui organizadas com metas, divisão e taxa de adesão.
          </p>
          <button
            type="button"
            onClick={() => alert('Construtor de treinos em breve')}
            className="btn-primary mt-6"
          >
            <Plus size={16} />
            Criar Primeira Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
