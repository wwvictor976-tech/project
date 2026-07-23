import { useCallback, useMemo, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, BarChart3, Copy, Pencil, RefreshCw, Trash2, Wallet } from 'lucide-react';
import { NovoFaturamentoModal, type NewTransactionFormData } from '@/components/ui/NovoFaturamentoModal';
import { StateView } from '@/components/feedback/StateView';
import { PageSkeleton } from '@/components/skeleton/PageSkeleton';
import { useResourceState } from '@/hooks/useResourceState';
import { financeService } from '@/services/resources.service';
import type { FinancialEntryInput, FinancialEntryStatus, FinancialSummary } from '@/types/domain';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const statusLabel: Record<FinancialEntryStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Atrasado',
  cancelled: 'Cancelado',
  draft: 'Rascunho',
};

function toInput(data: NewTransactionFormData): FinancialEntryInput {
  return {
    type: data.type === 'Receita' ? 'revenue' : 'expense',
    name: data.name,
    description: data.description,
    category: data.category,
    counterpartyName: data.counterpartyName,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    date: data.date,
    accrualMonth: data.accrualMonth,
    status: data.status,
    notes: data.notes,
    attachments: [],
    responsibleUserId: undefined,
  };
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Wallet }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><Icon size={18} className="text-slate-400" /></div><strong className="mt-3 block text-2xl font-semibold text-slate-950">{money.format(value)}</strong></article>;
}

export default function Financeiro() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'revenue' | 'expense'>('all');
  const loadEntries = useCallback(async () => (await financeService.list({ query, type: type === 'all' ? undefined : type })).data, [query, type]);
  const loadSummary = useCallback(async () => (await financeService.summary()).data, []);
  const entriesState = useResourceState(loadEntries, [], (items) => items.length === 0);
  const summaryState = useResourceState<FinancialSummary>(loadSummary, { totalRevenue: 0, totalExpense: 0, netProfit: 0, currentBalance: 0, cashFlow: { inflow: 0, outflow: 0, balance: 0 } }, () => false);
  const filteredEntries = useMemo(() => entriesState.data, [entriesState.data]);

  const handleSubmit = async (data: NewTransactionFormData) => {
    await financeService.create(toInput(data));
    entriesState.refetch();
    summaryState.refetch();
    setOpen(false);
  };

  return <main className="mx-auto max-w-[1600px] space-y-6 pb-8">
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div><h1 className="text-xl font-semibold text-slate-950">Financeiro</h1><p className="mt-1 text-sm text-slate-500">Módulo preparado para receitas, despesas, lucro, fluxo de caixa, CRUD, filtros e conciliação via backend.</p></div>
      <button type="button" onClick={() => setOpen(true)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Novo lançamento</button>
    </header>

    {summaryState.isLoading ? <PageSkeleton /> : <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Receita Total" value={summaryState.data.totalRevenue} icon={ArrowUpCircle} />
      <SummaryCard label="Despesa Total" value={summaryState.data.totalExpense} icon={ArrowDownCircle} />
      <SummaryCard label="Lucro Líquido" value={summaryState.data.netProfit} icon={BarChart3} />
      <SummaryCard label="Saldo Atual" value={summaryState.data.currentBalance} icon={Wallet} />
    </section>}

    <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="font-semibold text-slate-950">Receitas e despesas</h2><p className="text-xs text-slate-500">Busca, filtros, ordenação e paginação são enviados à camada de serviços.</p></div><div className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar lançamentos" className="rounded-xl border border-slate-200 px-3 py-2 text-xs" /><select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs"><option value="all">Todos</option><option value="revenue">Receitas</option><option value="expense">Despesas</option></select><button type="button" onClick={entriesState.refetch} className="rounded-xl border border-slate-200 p-2 text-slate-500"><RefreshCw size={15} /></button></div></div>
        {entriesState.isLoading ? <PageSkeleton /> : entriesState.status === 'success' ? <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Nome</th><th className="p-3">Categoria</th><th className="p-3">Valor</th><th className="p-3">Status</th><th className="p-3">Ações</th></tr></thead><tbody>{filteredEntries.map((entry) => <tr key={entry.id} className="border-t border-slate-100"><td className="p-3">{entry.name}</td><td className="p-3">{entry.category}</td><td className="p-3">{money.format(entry.amount)}</td><td className="p-3">{statusLabel[entry.status]}</td><td className="flex gap-2 p-3"><Pencil size={14} /><Copy size={14} /><Trash2 size={14} /></td></tr>)}</tbody></table></div> : <StateView status={entriesState.status} title="Nenhuma movimentação financeira" description="Quando a API retornar dados, esta tabela exibirá receitas e despesas com ações de editar, duplicar e excluir." actionLabel="Tentar novamente" onAction={entriesState.refetch} />}
      </div>
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="font-semibold text-slate-950">Fluxo de caixa</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt>Entradas</dt><dd>{money.format(summaryState.data.cashFlow.inflow)}</dd></div><div className="flex justify-between"><dt>Saídas</dt><dd>{money.format(summaryState.data.cashFlow.outflow)}</dd></div><div className="flex justify-between border-t border-slate-100 pt-3 font-semibold"><dt>Saldo</dt><dd>{money.format(summaryState.data.cashFlow.balance)}</dd></div></dl><p className="mt-4 text-xs text-slate-500">Resumo mensal, anual, gráficos e indicadores serão alimentados pelos endpoints financeiros reais.</p></aside>
    </section>
    <NovoFaturamentoModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
  </main>;
}
