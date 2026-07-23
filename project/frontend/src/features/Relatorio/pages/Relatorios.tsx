import { useCallback } from 'react';
import { Download, Filter } from 'lucide-react';
import { StateView } from '@/components/feedback/StateView';
import { PageSkeleton } from '@/components/skeleton/PageSkeleton';
import { reportsService } from '@/services/resources.service';
import { useResourceState } from '@/hooks/useResourceState';

export default function Relatorios() {
  const load = useCallback(async () => (await reportsService.list()).data, []);
  const state = useResourceState(load, [], (items) => items.length === 0);
  return <main className="mx-auto max-w-[1600px] space-y-6 pb-8"><header className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-xl font-semibold text-slate-950">Relatórios</h1><p className="mt-1 text-sm text-slate-500">Catálogo de relatórios preparado para filtros avançados e exportação em PDF, Excel e CSV.</p></div><button type="button" disabled className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400"><Filter size={15} /> Filtros avançados</button></header>{state.isLoading ? <PageSkeleton /> : state.status === 'success' ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{state.data.map((report) => <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-950">{report.title}</h2><p className="mt-2 text-sm text-slate-500">{report.description}</p><p className="mt-3 rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-500">Endpoint: {report.endpoint}</p><div className="mt-4 flex flex-wrap gap-2">{report.exportFormats.map((format) => <button key={format} type="button" disabled className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium uppercase text-slate-400"><Download size={12} /> {format}</button>)}</div></article>)}</section> : <StateView status={state.status} title="Nenhum relatório disponível" description="Os relatórios reais serão renderizados quando houver dados analíticos vindos do backend." actionLabel="Tentar novamente" onAction={state.refetch} />}</main>;
}
