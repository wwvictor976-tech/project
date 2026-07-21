import { useState } from 'react';
import { Search, Plus, MoreHorizontal, Mail, Phone, Users } from 'lucide-react';

interface Aluno {
  id: number; name: string; email: string; phone: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'Ativo' | 'Inativo' | 'Pendente';
  since: string; avatar: string; color: string;
}

const mockAlunos: Aluno[] = [
  { id:  1, name: 'Ana Souza',      email: 'ana@email.com',      phone: '(11) 99999-0001', plan: 'Pro',        status: 'Ativo',    since: '18 Jul 2026', avatar: 'AS', color: '#3b82f6' },
  { id:  2, name: 'Bruno Lima',     email: 'bruno@email.com',    phone: '(21) 98888-0002', plan: 'Basic',      status: 'Ativo',    since: '16 Jul 2026', avatar: 'BL', color: '#8b5cf6' },
  { id:  3, name: 'Carla Mendes',   email: 'carla@email.com',    phone: '(31) 97777-0003', plan: 'Enterprise', status: 'Ativo',    since: '14 Jul 2026', avatar: 'CM', color: '#10b981' },
  { id:  4, name: 'Diego Rocha',    email: 'diego@email.com',    phone: '(41) 96666-0004', plan: 'Basic',      status: 'Pendente', since: '12 Jul 2026', avatar: 'DR', color: '#f59e0b' },
  { id:  5, name: 'Elisa Ferreira', email: 'elisa@email.com',    phone: '(51) 95555-0005', plan: 'Pro',        status: 'Ativo',    since: '10 Jul 2026', avatar: 'EF', color: '#ef4444' },
  { id:  6, name: 'Felipe Santos',  email: 'felipe@email.com',   phone: '(61) 94444-0006', plan: 'Basic',      status: 'Inativo',  since: '05 Jul 2026', avatar: 'FS', color: '#06b6d4' },
  { id:  7, name: 'Gabriela Costa', email: 'gabi@email.com',     phone: '(71) 93333-0007', plan: 'Pro',        status: 'Ativo',    since: '02 Jul 2026', avatar: 'GC', color: '#ec4899' },
  { id:  8, name: 'Henrique Alves', email: 'henrique@email.com', phone: '(81) 92222-0008', plan: 'Enterprise', status: 'Ativo',    since: '28 Jun 2026', avatar: 'HA', color: '#2563eb' },
  { id:  9, name: 'Isabela Nunes',  email: 'isa@email.com',      phone: '(91) 91111-0009', plan: 'Basic',      status: 'Pendente', since: '24 Jun 2026', avatar: 'IN', color: '#7c3aed' },
  { id: 10, name: 'João Pereira',   email: 'joao@email.com',     phone: '(11) 90000-0010', plan: 'Pro',        status: 'Ativo',    since: '20 Jun 2026', avatar: 'JP', color: '#059669' },
  { id: 11, name: 'Karen Oliveira', email: 'karen@email.com',    phone: '(21) 99887-0011', plan: 'Enterprise', status: 'Ativo',    since: '15 Jun 2026', avatar: 'KO', color: '#d97706' },
  { id: 12, name: 'Lucas Martins',  email: 'lucas@email.com',    phone: '(31) 98776-0012', plan: 'Basic',      status: 'Inativo',  since: '10 Jun 2026', avatar: 'LM', color: '#64748b' },
];

const statusStyle: Record<string, string> = {
  Ativo:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Pendente: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Inativo:  'bg-[#f1f5f9] text-[#64748b] ring-1 ring-[#e2e8f0]',
};

const planStyle: Record<string, string> = {
  Basic:      'bg-[#f1f5f9] text-[#64748b]',
  Pro:        'bg-[#dbeafe] text-[#1d4ed8]',
  Enterprise: 'bg-[#ede9fe] text-[#6d28d9]',
};

type Tab = 'Todos' | 'Ativo' | 'Inativo' | 'Pendente';

export default function Alunos() {
  const [search,    setSearch]    = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('Todos');
  const [menuOpen,  setMenuOpen]  = useState<number | null>(null);

  const filtered = mockAlunos.filter(a => {
    const q = search.toLowerCase();
    return (a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
      && (activeTab === 'Todos' || a.status === activeTab);
  });

  const tabs: Tab[]               = ['Todos', 'Ativo', 'Inativo', 'Pendente'];
  const counts: Record<Tab, number> = {
    Todos:   mockAlunos.length,
    Ativo:   mockAlunos.filter(a => a.status === 'Ativo').length,
    Inativo: mockAlunos.filter(a => a.status === 'Inativo').length,
    Pendente:mockAlunos.filter(a => a.status === 'Pendente').length,
  };

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[1.05rem] font-bold text-[#0f172a] tracking-tight">Alunos</h2>
          <p className="text-[#64748b] text-sm mt-0.5">
            {mockAlunos.length} cadastros · {counts.Ativo} ativos · {counts.Pendente} aguardando
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 py-2 px-4 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.99] transition-all duration-200 border-none cursor-pointer shrink-0"
        >
          <Plus size={14} />
          Novo Aluno
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#f1f5f9]">
          {/* Tabs — exact Auth pattern */}
          <div className="relative flex gap-1 bg-[#f1f5f9] p-1 rounded-xl" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border-none z-10 ${
                  activeTab === tab
                    ? 'bg-white text-[#0f172a] shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
                    : 'bg-transparent text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {tab}
                <span className={`text-[0.62rem] min-w-[16px] text-center font-bold ${activeTab === tab ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Search — exact Auth input style */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-[#94a3b8] pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nome ou e-mail..."
              className="pl-8 pr-4 py-2 text-sm rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] focus:bg-white transition-all w-52"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                <th className="px-5 py-3 text-[0.65rem] font-bold text-[#94a3b8] uppercase tracking-wider">Aluno</th>
                <th className="px-5 py-3 text-[0.65rem] font-bold text-[#94a3b8] uppercase tracking-wider hidden md:table-cell">Contato</th>
                <th className="px-5 py-3 text-[0.65rem] font-bold text-[#94a3b8] uppercase tracking-wider">Plano</th>
                <th className="px-5 py-3 text-[0.65rem] font-bold text-[#94a3b8] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[0.65rem] font-bold text-[#94a3b8] uppercase tracking-wider hidden lg:table-cell">Desde</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8fafc]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <Users size={28} className="text-[#e2e8f0] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#334155]">Nenhum aluno encontrado</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Tente outro termo de busca.</p>
                  </td>
                </tr>
              ) : filtered.map(aluno => (
                <tr key={aluno.id} className="hover:bg-[#f8fafc] transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[0.6rem] font-bold shrink-0"
                        style={{ background: aluno.color }}
                      >
                        {aluno.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">{aluno.name}</p>
                        <p className="text-xs text-[#94a3b8] md:hidden">{aluno.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                        <Mail size={11} className="text-[#94a3b8]" /> {aluno.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                        <Phone size={10} /> {aluno.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${planStyle[aluno.plan]}`}>
                      {aluno.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[aluno.status]}`}>
                      {aluno.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-[#64748b]">
                    {aluno.since}
                  </td>
                  <td className="px-5 py-3.5 relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === aluno.id ? null : aluno.id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none bg-transparent"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {menuOpen === aluno.id && (
                      <div className="absolute right-4 top-10 z-20 bg-white border border-[#e2e8f0] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] py-1 w-36">
                        {['Ver perfil', 'Editar', 'Desativar'].map(action => (
                          <button
                            key={action}
                            onClick={() => setMenuOpen(null)}
                            className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer border-none bg-transparent ${
                              action === 'Desativar' ? 'text-red-500 hover:bg-red-50' : 'text-[#334155] hover:bg-[#f8fafc]'
                            }`}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#f1f5f9] bg-[#f8fafc]">
          <p className="text-xs text-[#94a3b8]">
            Mostrando <span className="font-semibold text-[#475569]">{filtered.length}</span> de <span className="font-semibold text-[#475569]">{mockAlunos.length}</span> alunos
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer border-none ${
                p === 1 ? 'bg-[#2563eb] text-white' : 'bg-transparent text-[#64748b] hover:bg-[#f1f5f9]'
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
