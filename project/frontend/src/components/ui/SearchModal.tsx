import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, Calendar, ArrowRight, Clock, X } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAGES = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: LayoutDashboard, subtitle: 'Visão geral da plataforma' },
  { label: 'Alunos',    path: ROUTES.alunos,    icon: Users,            subtitle: 'Gerenciar alunos e matrículas' },
  { label: 'Agenda',    path: ROUTES.agenda,    icon: Calendar,         subtitle: 'Aulas e compromissos' },
];

const STUDENTS = [
  { name: 'Ana Souza',      email: 'ana@email.com',      plan: 'Pro',        initials: 'AS' },
  { name: 'Bruno Lima',     email: 'bruno@email.com',    plan: 'Basic',      initials: 'BL' },
  { name: 'Carla Mendes',   email: 'carla@email.com',    plan: 'Enterprise', initials: 'CM' },
  { name: 'Diego Rocha',    email: 'diego@email.com',    plan: 'Basic',      initials: 'DR' },
  { name: 'Elisa Ferreira', email: 'elisa@email.com',    plan: 'Pro',        initials: 'EF' },
];

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  /* Focus input */
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => prev + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Lógica de navegação será tratada abaixo
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const q = query.toLowerCase().trim();

  const filteredPages = useMemo(() => 
    PAGES.filter(p => 
      p.label.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
    ), [q]);

  const filteredStudents = useMemo(() => 
    STUDENTS.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.email.toLowerCase().includes(q) || 
      s.plan.toLowerCase().includes(q)
    ), [q]);

  const allResults = useMemo(() => {
    const results: Array<{ type: 'page' | 'student'; item: any; index: number }> = [];
    
    filteredPages.forEach((page, i) => results.push({ type: 'page', item: page, index: i }));
    filteredStudents.forEach((student, i) => results.push({ type: 'student', item: student, index: i }));

    return results;
  }, [filteredPages, filteredStudents]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allResults.length]);

  const goTo = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-slate-950/60 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Search Input */}
        <div className="relative border-b border-slate-100">
          <div className="flex items-center px-5 py-4">
            <Search size={20} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar páginas, alunos, matrículas..."
              className="flex-1 ml-3 bg-transparent text-base outline-none placeholder:text-slate-400 text-slate-900"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto py-2">
          {allResults.length > 0 ? (
            <>
              {/* Pages Section */}
              {filteredPages.length > 0 && (
                <div className="mb-2">
                  <div className="px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Páginas
                  </div>
                  {filteredPages.map((page) => {
                    const globalIndex = allResults.findIndex(r => r.type === 'page' && r.item === page);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={page.path}
                        onClick={() => goTo(page.path)}
                        className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <div className="w-9 h-9 bg-blue-50 rounded-2xl flex items-center justify-center">
                          <page.icon size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900">{page.label}</p>
                          <p className="text-sm text-slate-500">{page.subtitle}</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-300" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Students Section */}
              {filteredStudents.length > 0 && (
                <div>
                  <div className="px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Alunos
                  </div>
                  {(q ? filteredStudents : filteredStudents.slice(0, 5)).map((student, index) => {
                    const globalIndex = allResults.findIndex(r => r.type === 'student' && r.item === student);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={student.email}
                        onClick={() => goTo(ROUTES.alunos)}
                        className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <div
                          className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                        >
                          {student.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{student.name}</p>
                          <p className="text-sm text-slate-500 truncate">{student.email}</p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-xl">
                          {student.plan}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock size={42} className="text-slate-200 mb-4" />
              <p className="font-semibold text-slate-700">Nenhum resultado encontrado</p>
              <p className="text-slate-500 mt-1 text-sm">Tente buscar por outro termo</p>
            </div>
          )}
        </div>

        {/* Keyboard Hints */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white border border-slate-200 rounded">↑↓</kbd>
              <span>Navegar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white border border-slate-200 rounded">↵</kbd>
              <span>Selecionar</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded">Esc</kbd>
            <span>Fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
}