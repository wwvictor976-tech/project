import type { ReactNode } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { PageSkeleton } from '@/components/skeleton/PageSkeleton';
import { StateView } from '@/components/feedback/StateView';
import type { ResourceStatus } from '@/types/domain';

interface ResourcePageProps { title: string; description: string; status: ResourceStatus; emptyTitle: string; emptyDescription: string; actionLabel?: string; onAction?: () => void; children?: ReactNode; }

export function ResourcePage({ title, description, status, emptyTitle, emptyDescription, actionLabel, onAction, children }: ResourcePageProps) {
  return (
    <main className="mx-auto max-w-[1600px] space-y-6 pb-8">
      <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
            <input aria-label={`Buscar em ${title}`} disabled placeholder="Busca disponível após integração" className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-500" />
          </label>
          <button type="button" disabled className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-400"><SlidersHorizontal size={14} /> Filtros</button>
          {actionLabel ? <button type="button" onClick={onAction} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"><Plus size={14} /> {actionLabel}</button> : null}
        </div>
      </header>
      {status === 'loading' ? <PageSkeleton /> : (
        <StateView status={status} title={status === 'empty' ? emptyTitle : 'Não foi possível carregar'} description={status === 'empty' ? emptyDescription : 'A camada de backend ainda não foi conectada. Tente novamente quando a integração estiver disponível.'} actionLabel={status === 'error' ? 'Tentar novamente' : undefined}>
          {children}
        </StateView>
      )}
    </main>
  );
}
