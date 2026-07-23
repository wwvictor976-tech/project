import { AlertTriangle, Lock, RefreshCw, WifiOff, Inbox, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ResourceStatus } from '@/types/domain';

interface StateViewProps { status: ResourceStatus; title: string; description: string; actionLabel?: string; onAction?: () => void; children?: ReactNode; }

const iconByStatus = { idle: Sparkles, loading: RefreshCw, success: Sparkles, empty: Inbox, error: AlertTriangle, offline: WifiOff, forbidden: Lock } satisfies Record<ResourceStatus, typeof Sparkles>;

export function StateView({ status, title, description, actionLabel, onAction, children }: StateViewProps) {
  if (status === 'success') return <>{children}</>;
  const Icon = iconByStatus[status];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm" aria-live="polite">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon className={status === 'loading' ? 'animate-spin' : ''} size={22} aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
