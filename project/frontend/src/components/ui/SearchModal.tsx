import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  Utensils,
  DollarSign,
  BarChart2,
  User,
  Settings,
  X,
  Plus,
  CornerDownLeft,
  Inbox,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface Props {
  open: boolean;
  onClose: () => void;
}

type CategoryType = 'all' | 'pages' | 'students' | 'actions';

interface SearchItem {
  id: string;
  type: CategoryType;
  title: string;
  subtitle?: string;
  path?: string;
  icon: React.ElementType;
  badge?: string;
  action?: () => void;
  avatarInitials?: string;
}

/* ── Mapeamento Base do Sistema ── */
const PAGES = [
  { title: 'Dashboard', subtitle: 'Visão geral da plataforma e métricas', path: ROUTES.dashboard, icon: LayoutDashboard },
  { title: 'Alunos', subtitle: 'Gestão de matrículas e cadastros', path: ROUTES.alunos, icon: Users },
  { title: 'Treinos', subtitle: 'Fichas e prescrições de treinos', path: ROUTES.treinos, icon: Dumbbell },
  { title: 'Dietas', subtitle: 'Planos alimentares e metas nutricionais', path: ROUTES.dietas, icon: Utensils },
  { title: 'Agenda', subtitle: 'Aulas e compromissos agendados', path: ROUTES.agenda, icon: Calendar },
  { title: 'Financeiro', subtitle: 'Faturamento, receitas e despesas', path: ROUTES.financeiro, icon: DollarSign },
  { title: 'Relatórios', subtitle: 'Métricas e análise de performance', path: ROUTES.relatorios, icon: BarChart2 },
  { title: 'Meu Perfil', subtitle: 'Dados pessoais e preferências', path: ROUTES.perfil, icon: User },
  { title: 'Configurações', subtitle: 'Ajustes e preferências do sistema', path: ROUTES.configuracoes, icon: Settings },
];

const STUDENTS = [
  { title: 'Ana Souza', subtitle: 'ana@email.com • Plano Profissional', initials: 'AS', plan: 'Profissional' },
  { title: 'Bruno Lima', subtitle: 'bruno@email.com • Plano Básico', initials: 'BL', plan: 'Básico' },
  { title: 'Carla Mendes', subtitle: 'carla@email.com • Plano Corporativo', initials: 'CM', plan: 'Corporativo' },
  { title: 'Diego Rocha', subtitle: 'diego@email.com • Plano Básico', initials: 'DR', plan: 'Básico' },
  { title: 'Elisa Ferreira', subtitle: 'elisa@email.com • Plano Profissional', initials: 'EF', plan: 'Profissional' },
];

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  /* Focus Instantâneo ao Abrir */
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /* Executar ação selecionada */
  const handleSelect = useCallback((item: SearchItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
    onClose();
  }, [navigate, onClose]);

  /* Lista de Ações Rápidas estáticas */
  const QUICK_ACTIONS: SearchItem[] = useMemo(() => [
    {
      id: 'act-1',
      type: 'actions',
      title: 'Cadastrar Novo Aluno',
      subtitle: 'Abrir formulário de cadastro',
      icon: Plus,
      badge: 'Atalho',
      action: () => alert('Modal de Novo Aluno')
    },
    {
      id: 'act-2',
      type: 'actions',
      title: 'Criar Ficha de Treino',
      subtitle: 'Prescrever exercícios e séries',
      icon: Dumbbell,
      badge: 'Treinos',
      action: () => alert('Construtor de Treino')
    },
    {
      id: 'act-3',
      type: 'actions',
      title: 'Nova Dieta',
      subtitle: 'Definir plano alimentar e macronutrientes',
      icon: Utensils,
      badge: 'Nutrição',
      action: () => alert('Formulário de Dieta')
    }
  ], []);

  /* Cálculo Otimizado de Resultados (Limitado a no máximo 8 itens) */
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items: SearchItem[] = [];

    // Páginas
    if (selectedCategory === 'all' || selectedCategory === 'pages') {
      PAGES.forEach(p => {
        if (!q || p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)) {
          items.push({
            id: `p-${p.path}`,
            type: 'pages',
            title: p.title,
            subtitle: p.subtitle,
            path: p.path,
            icon: p.icon,
            badge: 'Página'
          });
        }
      });
    }

    // Alunos
    if (selectedCategory === 'all' || selectedCategory === 'students') {
      STUDENTS.forEach(s => {
        if (!q || s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q)) {
          items.push({
            id: `s-${s.title}`,
            type: 'students',
            title: s.title,
            subtitle: s.subtitle,
            path: `${ROUTES.alunos}?search=${encodeURIComponent(s.title)}`,
            icon: Users,
            avatarInitials: s.initials,
            badge: s.plan
          });
        }
      });
    }

    // Ações
    if (selectedCategory === 'all' || selectedCategory === 'actions') {
      QUICK_ACTIONS.forEach(a => {
        if (!q || a.title.toLowerCase().includes(q)) {
          items.push(a);
        }
      });
    }

    return items.slice(0, 8);
  }, [query, selectedCategory, QUICK_ACTIONS]);

  /* Reset do índice ao alterar buscas */
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  /* Atalhos Teclado */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (results.length ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (results.length ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, results, selectedIndex, handleSelect]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
          />

          {/* Dialog Principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 flex flex-col"
          >
            {/* Campo de Entrada de Busca */}
            <div className="p-3 border-b border-slate-100 flex items-center gap-2.5 bg-white">
              <Search size={16} className="text-slate-400 shrink-0 ml-1" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por páginas, alunos ou ações..."
                className="w-full bg-transparent text-slate-900 text-xs sm:text-sm outline-none placeholder:text-slate-400 font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Abas Rápidas de Filtro */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50/70 border-b border-slate-100">
              {[
                { key: 'all', label: 'Tudo' },
                { key: 'pages', label: 'Páginas' },
                { key: 'students', label: 'Alunos' },
                { key: 'actions', label: 'Ações' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key as CategoryType)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.key
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista de Resultados */}
            <div className="p-1.5 space-y-0.5 max-h-[320px] overflow-y-auto scrollbar-fine">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-slate-400">
                  <Inbox size={20} className="text-slate-300 mb-1.5" />
                  <p className="font-medium text-slate-600">Nenhum resultado encontrado</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Verifique os termos digitados e tente novamente.</p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`
                        flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-left text-xs
                        ${isSelected ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50/80 text-slate-700'}
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.avatarInitials ? (
                          <div className="w-7 h-7 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-[10px] font-mono font-semibold shrink-0">
                            {item.avatarInitials}
                          </div>
                        ) : (
                          <div className={`w-7 h-7 rounded border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-100 border-slate-200/80 text-slate-500'
                          }`}>
                            <Icon size={14} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className={`font-medium truncate ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-800'}`}>
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-[11px] text-slate-400 truncate leading-none mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[10px] font-mono font-medium rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                            {item.badge}
                          </span>
                        )}
                        <CornerDownLeft
                          size={12}
                          className={`transition-opacity ${isSelected ? 'text-slate-700 opacity-100' : 'opacity-0'}`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé de Atalhos */}
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded text-[10px] text-slate-500 shadow-2xs">↑↓</kbd>
                  <span>Navegar</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded text-[10px] text-slate-500 shadow-2xs">↵</kbd>
                  <span>Selecionar</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded text-[10px] text-slate-500 shadow-2xs">ESC</kbd>
                <span>Fechar</span>
              </span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}