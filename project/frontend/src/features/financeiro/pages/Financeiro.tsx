import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Receipt,
  X,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Tag,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ── Tipagens ── */
export type TransactionStatus = 'Pago' | 'Pendente' | 'Atrasado' | 'Cancelado';
export type TransactionType = 'Receita' | 'Despesa';
export type ViewTab = 'Consolidado' | 'Faturamento' | 'Despesas';

/* Categorias dedicadas para controle */
export type RevenueCategory = 'Planos & Mensalidades' | 'Personal Training' | 'Avaliação Física' | 'Taxa de Matrícula';
export type ExpenseCategory = 'Infraestrutura / Aluguel' | 'Equipamentos' | 'Equipe / Pessoal' | 'Sistemas & Software' | 'Marketing';

export interface Transaction {
  id: number;
  description: string;
  category: RevenueCategory | ExpenseCategory;
  studentOrVendor: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  method: string;
}

/* ── Estado Inicial Zerado ── */
const INITIAL_TRANSACTIONS: Transaction[] = [];

/* ── Badges de Status ── */
const statusConfig: Record<TransactionStatus, { label: string; style: string; dot: string }> = {
  Pago: { label: 'Pago / Recebido', style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-600' },
  Pendente: { label: 'Pendente', style: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-600' },
  Atrasado: { label: 'Atrasado', style: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-600' },
  Cancelado: { label: 'Cancelado', style: 'bg-slate-100 text-slate-600 border-slate-200/80', dot: 'bg-slate-400' },
};

/* ── Tooltip do Recharts ── */
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
              R$ {(p.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function Financeiro() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [viewTab, setViewTab] = useState<ViewTab>('Consolidado');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  /* ── Métricas e DRE Calculadas ── */
  const metrics = useMemo(() => {
    const totalFaturamento = transactions
      .filter((t) => t.type === 'Receita' && t.status === 'Pago')
      .reduce((acc, t) => acc + t.amount, 0);

    const faturamentoPendente = transactions
      .filter((t) => t.type === 'Receita' && (t.status === 'Pendente' || t.status === 'Atrasado'))
      .reduce((acc, t) => acc + t.amount, 0);

    const totalDespesas = transactions
      .filter((t) => t.type === 'Despesa' && t.status === 'Pago')
      .reduce((acc, t) => acc + t.amount, 0);

    const despesasPendentes = transactions
      .filter((t) => t.type === 'Despesa' && (t.status === 'Pendente' || t.status === 'Atrasado'))
      .reduce((acc, t) => acc + t.amount, 0);

    const resultadoLiquido = totalFaturamento - totalDespesas;
    const margemLucro = totalFaturamento > 0 ? Math.round((resultadoLiquido / totalFaturamento) * 100) : 0;

    return {
      totalFaturamento,
      faturamentoPendente,
      totalDespesas,
      despesasPendentes,
      resultadoLiquido,
      margemLucro,
    };
  }, [transactions]);

  /* ── Lista de Categorias Disponíveis com Base na Visão ── */
  const categoryOptions = useMemo(() => {
    if (viewTab === 'Faturamento') {
      return ['Todas', 'Planos & Mensalidades', 'Personal Training', 'Avaliação Física', 'Taxa de Matrícula'];
    }
    if (viewTab === 'Despesas') {
      return ['Todas', 'Infraestrutura / Aluguel', 'Equipamentos', 'Equipe / Pessoal', 'Sistemas & Software', 'Marketing'];
    }
    return ['Todas'];
  }, [viewTab]);

  /* ── Filtragem de Transações ── */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.description.toLowerCase().includes(q) ||
        t.studentOrVendor.toLowerCase().includes(q);

      const matchView =
        viewTab === 'Consolidado' ||
        (viewTab === 'Faturamento' && t.type === 'Receita') ||
        (viewTab === 'Despesas' && t.type === 'Despesa');

      const matchCategory = selectedCategory === 'Todas' || t.category === selectedCategory;
      const matchStatus = filterStatus === 'Todos' || t.status === filterStatus;

      return matchSearch && matchView && matchCategory && matchStatus;
    });
  }, [transactions, search, viewTab, selectedCategory, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginated = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('Todas');
    setFilterStatus('Todos');
    setCurrentPage(1);
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
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Controle Financeiro & Faturamento</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              DRE Operacional
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento separado de entradas de faturamento, saídas de despesas e resultado líquido.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => alert('Exportando balanço...')}
            disabled={transactions.length === 0}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-400" />
            <span>Exportar Relatório</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Registrar nova despesa')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowDownRight size={14} />
            <span>Nova Despesa</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Registrar novo faturamento')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Novo Faturamento</span>
          </button>
        </div>
      </header>

      {/* ── ALTERNADOR DE VISÃO (SEPARADOR DE MÓDULO) ── */}
      <motion.div variants={itemVariants} className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium max-w-md">
        {(['Consolidado', 'Faturamento', 'Despesas'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setViewTab(tab);
              setSelectedCategory('Todas');
              setCurrentPage(1);
            }}
            className={`flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer ${
              viewTab === tab
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'Faturamento' ? 'Faturamento (Entradas)' : tab === 'Despesas' ? 'Despesas (Saídas)' : 'Visão Consolidada'}
          </button>
        ))}
      </motion.div>

      {/* ── KPIS DINÂMICOS CONFORME A VISÃO SELECIONADA ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {viewTab === 'Faturamento' ? (
          <>
            <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
                <span>Faturamento Liquidado</span>
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{fmt(metrics.totalFaturamento)}</div>
              <p className="mt-3 text-[11px] text-slate-500 truncate">Receitas efetivamente recebidas</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
                <span>Faturamento a Receber</span>
                <AlertCircle size={16} className="text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{fmt(metrics.faturamentoPendente)}</div>
              <p className="mt-3 text-[11px] text-slate-500 truncate">Mensalidades pendentes / atrasadas</p>
            </motion.div>
          </>
        ) : viewTab === 'Despesas' ? (
          <>
            <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
                <span>Total de Despesas Saídas</span>
                <TrendingDown size={16} className="text-rose-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{fmt(metrics.totalDespesas)}</div>
              <p className="mt-3 text-[11px] text-slate-500 truncate">Custos liquidados no período</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
                <span>Contas a Pagar</span>
                <AlertCircle size={16} className="text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{fmt(metrics.despesasPendentes)}</div>
              <p className="mt-3 text-[11px] text-slate-500 truncate">Despesas agendadas / pendentes</p>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
                <span>Faturamento Bruto</span>
                <DollarSign size={16} className="text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{fmt(metrics.totalFaturamento)}</div>
              <p className="mt-3 text-[11px] text-slate-500 truncate">Total de receitas confirmadas</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
                <span>Total de Despesas</span>
                <TrendingDown size={16} className="text-rose-600" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{fmt(metrics.totalDespesas)}</div>
              <p className="mt-3 text-[11px] text-slate-500 truncate">Custos operacionais liquidados</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
                <span>Resultado Líquido</span>
                <TrendingUp size={16} className="text-blue-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">{fmt(metrics.resultadoLiquido)}</span>
                {metrics.margemLucro > 0 && (
                  <span className="text-xs font-mono text-emerald-600 font-medium">({metrics.margemLucro}%)</span>
                )}
              </div>
              <p className="mt-3 text-[11px] text-slate-500 truncate">Saldo real em caixa</p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
                <span>Valores Pendentes</span>
                <AlertCircle size={16} className="text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">{fmt(metrics.faturamentoPendente)}</div>
              <p className="mt-3 text-[11px] text-slate-500 truncate">Aguardando quitação</p>
            </motion.div>
          </>
        )}

      </section>

      {/* ── TABELA E PAINEL DE CONTROLE DE LANÇAMENTOS ── */}
      <motion.section variants={itemVariants} className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        
        {/* Toolbar de Filtros */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por descrição, aluno ou fornecedor..."
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

            {/* Filtro por Categoria Específica */}
            {categoryOptions.length > 1 && (
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 focus:outline-none cursor-pointer"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'Todas' ? 'Todas as Categorias' : cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Pago">Pago / Recebido</option>
                <option value="Pendente">Pendente</option>
                <option value="Atrasado">Atrasado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            {filteredTransactions.length} lançamentos encontrados
          </span>

        </div>

        {/* Tabela de Lançamentos */}
        <div className="flex-1 overflow-x-auto min-h-[380px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
                <th className="px-4 py-2.5">Descrição</th>
                <th className="px-4 py-2.5">Categoria</th>
                <th className="px-4 py-2.5 hidden md:table-cell">Aluno / Fornecedor</th>
                <th className="px-4 py-2.5 hidden md:table-cell">Forma de Pgto.</th>
                <th className="px-4 py-2.5">Valor (R$)</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 hidden lg:table-cell">Data</th>
                <th className="px-4 py-2.5 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-xs text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt size={22} className="text-slate-300 mb-2" />
                      <p className="font-medium text-slate-700">
                        {transactions.length === 0 ? 'Nenhum lançamento financeiro cadastrado' : 'Nenhum lançamento encontrado'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                        {transactions.length === 0
                          ? 'Cadastre uma nova receita ou despesa nos botões do topo para iniciar o controle.'
                          : 'Tente alterar os termos de busca ou selecionar outro status.'}
                      </p>
                      {(search || selectedCategory !== 'Todas' || filterStatus !== 'Todos') && (
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
                paginated.map((t) => {
                  const status = statusConfig[t.status];
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => alert(`Detalhes da transação: ${t.description}`)}
                    >
                      {/* Descrição & Tipo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${
                            t.type === 'Receita' ? 'bg-blue-50 text-blue-600 border-blue-200/60' : 'bg-rose-50 text-rose-600 border-rose-200/60'
                          }`}>
                            {t.type === 'Receita' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                              {t.description}
                            </p>
                            <p className="text-[10px] text-slate-400 md:hidden">{t.studentOrVendor}</p>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                          <Tag size={10} className="text-slate-400" />
                          <span>{t.category}</span>
                        </span>
                      </td>

                      {/* Origem */}
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                        {t.studentOrVendor || '—'}
                      </td>

                      {/* Forma de Pagamento */}
                      <td className="px-4 py-3 hidden md:table-cell font-mono text-[11px] text-slate-500">
                        {t.method}
                      </td>

                      {/* Valor */}
                      <td className="px-4 py-3 font-mono font-semibold text-xs">
                        <span className={t.type === 'Receita' ? 'text-slate-900' : 'text-rose-600'}>
                          {t.type === 'Despesa' ? '- ' : ''}{fmt(t.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${status.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>

                      {/* Data */}
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500 font-mono text-[11px]">
                        {t.date}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === t.id ? null : t.id);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>

                        {/* Popover */}
                        <AnimatePresence>
                          {menuOpen === t.id && (
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
                                  alert(`Ver comprovante de ${t.description}`);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              >
                                <Eye size={13} className="text-slate-400" />
                                <span>Ver recibo</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTransactions((prev) =>
                                    prev.map((item) =>
                                      item.id === t.id ? { ...item, status: 'Pago' as TransactionStatus } : item
                                    )
                                  );
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors cursor-pointer"
                              >
                                <CheckCircle2 size={13} />
                                <span>Marcar como pago</span>
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
            Exibindo <span className="font-mono font-semibold text-slate-800">{paginated.length}</span> de{' '}
            <span className="font-mono font-semibold text-slate-800">{filteredTransactions.length}</span> lançamentos
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