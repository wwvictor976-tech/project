import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, CheckCircle2, User, CalendarRange, TrendingUp, ClipboardList } from 'lucide-react';

export type WorkoutStatus = 'Ativo' | 'Pausado' | 'Concluído';
export type GoalType = 'Hipertrofia' | 'Emagrecimento' | 'Condicionamento' | 'Reabilitação';

export interface NewWorkoutFormData {
  studentName: string;
  goal: GoalType;
  division: string;
  exercisesCount: number;
  weeklyFrequency: string;
  startDate: string;
  endDate: string;
  adherenceRate: number;
  status: WorkoutStatus;
  instructor: string;
}

interface NovoTreinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewWorkoutFormData) => void;
  initialData?: NewWorkoutFormData;
  title?: string;
  description?: string;
  submitLabel?: string;
}

const initialFormState: NewWorkoutFormData = {
  studentName: '',
  goal: 'Hipertrofia',
  division: '',
  exercisesCount: 0,
  weeklyFrequency: '',
  startDate: '',
  endDate: '',
  adherenceRate: 0,
  status: 'Ativo',
  instructor: '',
};

export function NovoTreinoModal({ isOpen, onClose, onSubmit, initialData, title, description, submitLabel }: NovoTreinoModalProps) {
  const buildInitialForm = (data?: NewWorkoutFormData): NewWorkoutFormData => {
    if (data) return { ...data };
    return {
      ...initialFormState,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    };
  };
  const [formData, setFormData] = useState<NewWorkoutFormData>(() => buildInitialForm(initialData));

  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialForm(initialData));
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleChange = (field: keyof NewWorkoutFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(initialFormState);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs" />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200/90 rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{title ?? 'Criar Nova Ficha de Treino'}</h2>
                <p className="text-xs text-slate-500">{description ?? 'Adicione uma prescrição para um aluno e ela vai aparecer na página de treinos.'}</p>
              </div>
              <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="space-y-2.5">
                <div>
                  <label className="form-label">Aluno *</label>
                  <div className="relative">
                    <User size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      required
                      value={formData.studentName}
                      onChange={(e) => handleChange('studentName', e.target.value)}
                      placeholder="Nome do aluno"
                      className="form-input pl-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Objetivo</label>
                    <select
                      value={formData.goal}
                      onChange={(e) => handleChange('goal', e.target.value)}
                      className="form-input cursor-pointer"
                    >
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Emagrecimento">Emagrecimento</option>
                      <option value="Condicionamento">Condicionamento</option>
                      <option value="Reabilitação">Reabilitação</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="form-input cursor-pointer">
                      <option value="Ativo">Ativo</option>
                      <option value="Pausado">Pausado</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Divisão / Prescrição</label>
                    <div className="relative">
                      <ClipboardList size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input value={formData.division} onChange={(e) => handleChange('division', e.target.value)} placeholder="Divisão do treino" className="form-input pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Personal / Instrutor</label>
                    <div className="relative">
                      <Dumbbell size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input value={formData.instructor} onChange={(e) => handleChange('instructor', e.target.value)} placeholder="Nome do instrutor" className="form-input pl-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="form-label">Exercícios</label>
                    <input type="number" min="1" value={formData.exercisesCount} onChange={(e) => handleChange('exercisesCount', Number(e.target.value))} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Frequência</label>
                    <input value={formData.weeklyFrequency} onChange={(e) => handleChange('weeklyFrequency', e.target.value)} placeholder="3x por semana" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Adesão (%)</label>
                    <div className="relative">
                      <TrendingUp size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="number" min="0" max="100" value={formData.adherenceRate} onChange={(e) => handleChange('adherenceRate', Number(e.target.value))} className="form-input pl-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Data de Início</label>
                    <div className="relative">
                      <CalendarRange size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="form-input pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Data de Término</label>
                    <div className="relative">
                      <CalendarRange size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className="form-input pl-8" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={onClose} className="py-1.5 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="inline-flex items-center gap-1.5 py-1.5 px-4 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs">
                  <CheckCircle2 size={13} />
                  <span>{submitLabel ?? 'Salvar Ficha'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
