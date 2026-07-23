import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Leaf, Flame, Beef, Droplets, CalendarRange, TrendingUp } from 'lucide-react';

export type DietGoal = 'Emagrecimento' | 'Hipertrofia' | 'Manutenção' | 'Saúde';
export type DietStatus = 'Ativa' | 'Pausada' | 'Concluída';

export interface NewDietFormData {
  name: string;
  student: string;
  goal: DietGoal;
  status: DietStatus;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  startDate: string;
  nutritionist: string;
  adherence: number;
}

interface NovaDietaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewDietFormData) => void;
  initialData?: NewDietFormData;
  title?: string;
  description?: string;
  submitLabel?: string;
}

const initialFormState: NewDietFormData = {
  name: '',
  student: '',
  goal: 'Manutenção',
  status: 'Ativa',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  startDate: '',
  nutritionist: '',
  adherence: 0,
};

export function NovaDietaModal({ isOpen, onClose, onSubmit, initialData, title, description, submitLabel }: NovaDietaModalProps) {
  const buildInitialForm = (data?: NewDietFormData): NewDietFormData => {
    if (data) return { ...data };
    return {
      ...initialFormState,
      startDate: new Date().toISOString().slice(0, 10),
    };
  };
  const [formData, setFormData] = useState<NewDietFormData>(() => buildInitialForm(initialData));

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

  const handleChange = (field: keyof NewDietFormData, value: string | number) => {
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
                <h2 className="text-sm font-semibold text-slate-900">{title ?? 'Criar Novo Plano Alimentar'}</h2>
                <p className="text-xs text-slate-500">{description ?? 'Cadastre um plano nutricional e ele aparecerá imediatamente na página de dietas.'}</p>
              </div>
              <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Nome do Plano *</label>
                    <div className="relative">
                      <Leaf size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Nome do plano" className="form-input pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Aluno *</label>
                    <div className="relative">
                      <User size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input required value={formData.student} onChange={(e) => handleChange('student', e.target.value)} placeholder="Nome do aluno" className="form-input pl-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Objetivo</label>
                    <select value={formData.goal} onChange={(e) => handleChange('goal', e.target.value)} className="form-input cursor-pointer">
                      <option value="Emagrecimento">Emagrecimento</option>
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Saúde">Saúde</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="form-input cursor-pointer">
                      <option value="Ativa">Ativa</option>
                      <option value="Pausada">Pausada</option>
                      <option value="Concluída">Concluída</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Nutricionista</label>
                    <div className="relative">
                      <Leaf size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input value={formData.nutritionist} onChange={(e) => handleChange('nutritionist', e.target.value)} placeholder="Nome do nutricionista" className="form-input pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Adesão (%)</label>
                    <div className="relative">
                      <TrendingUp size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="number" min="0" max="100" value={formData.adherence} onChange={(e) => handleChange('adherence', Number(e.target.value))} className="form-input pl-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Calorias Diárias</label>
                    <input type="number" min="0" value={formData.calories} onChange={(e) => handleChange('calories', Number(e.target.value))} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Data de Início</label>
                    <div className="relative">
                      <CalendarRange size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="form-input pl-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="form-label">Proteína (g)</label>
                    <div className="relative">
                      <Beef size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="number" min="0" value={formData.protein} onChange={(e) => handleChange('protein', Number(e.target.value))} className="form-input pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Carboidratos (g)</label>
                    <div className="relative">
                      <Flame size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="number" min="0" value={formData.carbs} onChange={(e) => handleChange('carbs', Number(e.target.value))} className="form-input pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Gordura (g)</label>
                    <div className="relative">
                      <Droplets size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="number" min="0" value={formData.fat} onChange={(e) => handleChange('fat', Number(e.target.value))} className="form-input pl-8" />
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
                  <span>{submitLabel ?? 'Salvar Plano'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
