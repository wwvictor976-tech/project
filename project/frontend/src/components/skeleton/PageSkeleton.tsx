export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-label="Carregando conteúdo">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}
