import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAppStore } from '@/stores/useAppStore';
import type { Student } from '@/stores/useAppStore';
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Users,
  UserCheck,
  UserX,
  Clock,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  XCircle
} from 'lucide-react';

import { NovoAlunoModal } from '../../../components/ui/NovoAlunoModal';
import type { NewAlunoFormData } from '../../../components/ui/NovoAlunoModal';

/* ── TIPAGENS ── */
type StatusType = 'Ativo' | 'Inativo' | 'Pendente';
type PlanType = 'Basic' | 'Pro' | 'Enterprise';
type TabType = 'Todos' | StatusType;

/* ── UI CONFIGS ── */
const statusBadge: Record<StatusType, { label: string; bg: string; text: string; dot: string }> = {
  Ativo:    { label: 'Ativo',    bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' },
  Pendente: { label: 'Pendente', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  Inativo:  { label: 'Inativo',  bg: 'bg-slate-100',  text: 'text-slate-600',   dot: 'bg-slate-400' },
};

const planBadge: Record<PlanType, string> = {
  Basic:      'text-slate-600 bg-slate-100 border border-slate-200/60',
  Pro:        'text-blue-700 bg-blue-50 border border-blue-200/60',
  Enterprise: 'text-indigo-700 bg-indigo-50 border border-indigo-200/60',
};

export default function Alunos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const students = useAppStore((state) => state.students);
  const addStudent = useAppStore((state) => state.addStudent);
  
  const getAlunoRoute = (id: number) => ROUTES.aluno.replace(':id', String(id));

  /* ── ESTADOS PRINCIPAIS ── */
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('Todos');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const menuRef = useRef<HTMLTableSectionElement | null>(null);

  /* ── ABA ATIVA (SINCRONIZADA COM URL) ── */
  const activeTab: TabType = useMemo(() => {
    const status = searchParams.get('status');
    if (status === 'Ativo')    return 'Ativo';
    if (status === 'Inativo')  return 'Inativo';
    if (status === 'Pendente') return 'Pendente';
    return 'Todos';
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setCurrentPage(1);
    if (tab === 'Todos') {
      setSearchParams({});
    } else {
      setSearchParams({ status: tab });
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedPlan('Todos');
    handleTabChange('Todos');
  };

  /* ── FECHAR MENU AO CLICAR FORA ── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ── UTILITÁRIOS ── */
  const formatTodayDate = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date()).replace(/ de /g, ' ');
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-rose-400',
      'from-violet-500 to-fuchsia-500',
      'from-cyan-400 to-blue-500'
    ];
    const charCode = name.charCodeAt(0) || 0;
    return gradients[charCode % gradients.length];
  };

  /* ── AÇÕES ── */
  const handleAddAluno = (data: NewAlunoFormData) => {
    const initials = data.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
    const newAluno: Student = {
      id: students.length > 0 ? Math.max(...students.map((a) => a.id)) + 1 : 1,
      name: data.name,
      email: data.email,
      phone: data.phone,
      plan: data.plan,
      status: data.status,
      since: formatTodayDate(),
      date: formatTodayDate(),
      avatar: initials || 'AL',
      color: '#2563eb',
      age: data.age,
      height: data.height,
      weight: data.weight,
      trainingLevel: data.trainingLevel,
      allergies: data.allergies,
      medications: data.medications,
      observations: data.observations,
      nextClass: 'Primeira avaliação a agendar • —',
      attendanceRate: '0%',
      financialSummary: 'R$ 0 este mês',
    };

    addStudent(newAluno);
    setCurrentPage(1);
    setIsModalOpen(false);
    navigate(getAlunoRoute(newAluno.id));
  };

  /* ── FILTROS E PAGINAÇÃO ── */
  const filteredAlunos = useMemo(() => {
    return students.filter((aluno) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        aluno.name.toLowerCase().includes(query) ||
        aluno.email.toLowerCase().includes(query) ||
        aluno.phone.includes(query);
      const matchesStatus = activeTab === 'Todos' || aluno.status === activeTab;
      const matchesPlan   = selectedPlan === 'Todos' || aluno.plan === selectedPlan;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [students, search, activeTab, selectedPlan]);

  const totalPages = Math.ceil(filteredAlunos.length / itemsPerPage) || 1;
  const paginatedAlunos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAlunos.slice(start, start + itemsPerPage);
  }, [filteredAlunos, currentPage]);

  const tabs: TabType[] = ['Todos', 'Ativo', 'Pendente', 'Inativo'];

  const counts: Record<TabType, number> = useMemo(() => ({
    Todos:    students.length,
    Ativo:    students.filter((a) => a.status === 'Ativo').length,
    Pendente: students.filter((a) => a.status === 'Pendente').length,
    Inativo:  students.filter((a) => a.status === 'Inativo').length,
  }), [students]);

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-slide">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Gestão de Alunos</h1>
          <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-2">
            <span className="font-medium text-slate-700">{counts.Todos} cadastros</span> no total 
            <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
            <span className="text-emerald-600 font-medium">{counts.Ativo} ativos</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => alert('Exportando...')}
            className="btn-outline flex items-center gap-2"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Novo Aluno</span>
          </button>
        </div>
      </header>

      {/* ── KPIs ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {[
          { label: 'Total de Alunos',        val: counts.Todos,    icon: Users,      color: 'blue' },
          { label: 'Alunos Ativos',          val: counts.Ativo,    icon: UserCheck,  color: 'emerald' },
          { label: 'Aguardando Aprovação',   val: counts.Pendente, icon: Clock,      color: 'amber' },
          { label: 'Inativos / Cancelados',  val: counts.Inativo,  icon: UserX,      color: 'slate' },
        ].map((kpi, i) => (
          <div
            key={i}
            className="panel-card-sm group cursor-default animate-card-enter"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">{kpi.val}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                kpi.color === 'blue'    ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' :
                kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' :
                kpi.color === 'amber'   ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' :
                'bg-slate-50 text-slate-500 group-hover:bg-slate-100'
              }`}>
                <kpi.icon size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── CONTEÚDO PRINCIPAL (TABELA E FILTROS) ── */}
      <main className="bg-white rounded-[24px] border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col animate-fade-slide" style={{ animationDelay: '0.2s' }}>
        
        {/* Toolbar de Filtros */}
        <div className="p-4 md:p-5 border-b border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4 bg-slate-50/50">
          
          <div className="flex w-full xl:w-auto overflow-x-auto hide-scroll p-1 bg-slate-100/80 rounded-lg border border-slate-200/50">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`relative px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap outline-none flex items-center gap-2 ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {tab === 'Pendente' ? 'Pendentes' : tab}
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  activeTab === tab ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/50 text-slate-500'
                }`}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar por nome, email..."
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <XCircle size={16} />
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-48 group">
              <select
                value={selectedPlan}
                onChange={(e) => { setSelectedPlan(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
              >
                <option value="Todos">Todos os Planos</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <Filter size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div className="overflow-x-auto min-h-[420px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contato</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Matrícula</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100" ref={menuRef}>
              {paginatedAlunos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center animate-fade-in">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
                        <Users size={28} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Nenhum aluno encontrado</h3>
                      <p className="text-sm text-slate-500 mt-1 max-w-sm">Não encontramos resultados para a sua busca ou filtros aplicados no momento.</p>
                      {(search || selectedPlan !== 'Todos' || activeTab !== 'Todos') && (
                        <button 
                          onClick={handleClearFilters}
                          className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                          Limpar todos os filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAlunos.map((aluno) => {
                  const status = statusBadge[aluno.status];
                  return (
                    <tr
                      key={aluno.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => navigate(getAlunoRoute(aluno.id))}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-gradient-to-br ${getAvatarGradient(aluno.name)} shadow-sm`}>
                            {aluno.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {aluno.name}
                            </p>
                            <p className="text-[12px] text-slate-500 md:hidden mt-0.5">{aluno.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-[13px] text-slate-600">
                            <Mail size={13} className="text-slate-400" />
                            <a 
                              href={`mailto:${aluno.email}`} 
                              onClick={(e) => e.stopPropagation()} 
                              className="hover:text-blue-600 hover:underline transition-colors"
                            >
                              {aluno.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-slate-500">
                            <Phone size={13} className="text-slate-400" />
                            <span>{aluno.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-md ${planBadge[aluno.plan]}`}>
                          {aluno.plan}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-500 font-medium">
                        {aluno.since}
                      </td>

                      <td className="px-6 py-4 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === aluno.id ? null : aluno.id); }}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-slate-300"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {menuOpen === aluno.id && (
                          <div className="absolute right-12 top-6 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 p-1.5 z-10 animate-fade-in text-left">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(getAlunoRoute(aluno.id)); setMenuOpen(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye size={16} className="text-blue-500" /> Ver perfil
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); alert(`Editar ${aluno.name}`); setMenuOpen(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mt-0.5"
                            >
                              <Edit3 size={16} className="text-slate-500" /> Editar aluno
                            </button>
                            <div className="my-1.5 border-t border-slate-100 mx-2" />
                            <button
                              onClick={(e) => { e.stopPropagation(); alert(`Desativar ${aluno.name}`); setMenuOpen(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <UserX size={16} className="text-rose-500" /> Desativar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Paginação */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500">
            Mostrando <span className="font-bold text-slate-900">{paginatedAlunos.length}</span> de{' '}
            <span className="font-bold text-slate-900">{filteredAlunos.length}</span> alunos
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-all outline-none focus:ring-2 focus:ring-slate-300"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-slate-700 px-4">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-all outline-none focus:ring-2 focus:ring-slate-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>

      <NovoAlunoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddAluno}
      />
    </div>
  );
}