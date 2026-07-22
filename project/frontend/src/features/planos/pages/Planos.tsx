import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Crown } from 'lucide-react';
import { planosMock } from '@/features/planos/models/planos';

export default function Planos() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto flex max-w-7xl flex-col gap-6 pb-8"
    >
      <header className="flex flex-col gap-2 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Planos</h1>
          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            Modelo de assinatura
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Visualize os planos disponíveis e as principais funcionalidades de cada opção.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {planosMock.map((plano) => (
          <motion.article
            key={plano.id}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`rounded-2xl border bg-white p-6 shadow-sm ${
              plano.highlight ? 'border-blue-200 ring-2 ring-blue-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{plano.name}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{plano.description}</h2>
              </div>
              {plano.highlight ? (
                <span className="rounded-full bg-blue-50 p-2 text-blue-600">
                  <Crown size={16} />
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 p-2 text-slate-600">
                  <Sparkles size={16} />
                </span>
              )}
            </div>

            <div className="mt-6 flex items-end gap-1">
              <span className="text-4xl font-semibold text-slate-900">R$ {plano.price}</span>
              <span className="pb-1 text-sm text-slate-500">{plano.billingCycle}</span>
            </div>

            <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {plano.status}
            </div>

            <ul className="mt-6 space-y-3">
              {plano.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`mt-6 w-full rounded-xl px-4 py-2 text-sm font-medium transition ${
                plano.highlight
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Escolher plano
            </button>
          </motion.article>
        ))}
      </section>
    </motion.div>
  );
}
