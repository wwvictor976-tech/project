import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  AlertTriangle,
  Pill,
  CheckCircle2,
} from 'lucide-react';

/* ── Tipos Exportados Mantidos ── */
export type StatusType = 'Ativo' | 'Inativo' | 'Pendente';
export type PlanType = 'Basic' | 'Pro' | 'Enterprise';
export type TrainingLevelType = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Atleta';

export interface NewAlunoFormData {
  name: string;
  email: string;
  phone: string;
  age: string;
  height: string;
  weight: string;
  trainingLevel: TrainingLevelType;
  allergies: string;
  medications: string;
  observations: string;
  plan: PlanType;
  status: StatusType;
}

interface NovoAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewAlunoFormData) => void;
  initialData?: NewAlunoFormData;
  title?: string;
  description?: string;
  submitLabel?: string;
}

const initialFormState: NewAlunoFormData = {
  name: '',
  email: '',
  phone: '',
  age: '',
  height: '',
  weight: '',
  trainingLevel: 'Iniciante',
  allergies: '',
  medications: '',
  observations: '',
  plan: 'Basic',
  status: 'Ativo',
};

export function NovoAlunoModal({ isOpen, onClose, onSubmit, initialData, title, description, submitLabel }: NovoAlunoModalProps) {
  const buildInitialForm = (data?: NewAlunoFormData): NewAlunoFormData => (data ? { ...data } : { ...initialFormState });
  const [formData, setFormData] = useState<NewAlunoFormData>(() => buildInitialForm(initialData));

  /* Resetar formulário ao abrir */
  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialForm(initialData));
    }
  }, [isOpen, initialData]);

  /* Fechar modal ao pressionar ESC */
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  /* Travar rolagem do fundo quando aberto */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* Formatação em tempo real para Telefone */
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : '';
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleChange = (field: keyof NewAlunoFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'phone' ? formatPhone(value) : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(initialFormState);
    onClose();
  };

  const trainingLevels: TrainingLevelType[] = ['Iniciante', 'Intermediário', 'Avançado', 'Atleta'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          
          {/* Backdrop Translúcido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          {/* Diálogo Central */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200/90 rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* ── HEADER FIXO ── */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{title ?? 'Cadastrar Novo Aluno'}</h2>
                <p className="text-xs text-slate-500">{description ?? 'Preencha os dados cadastrais, de treino e de saúde do aluno'}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── CORPO DO FORMULÁRIO ── */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-fine">
              
              {/* SEÇÃO 1: Identificação & Contato */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  1. Identificação & Contato
                </span>

                <div>
                  <label className="form-label">Nome Completo *</label>
                  <div className="relative">
                    <User size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Nome completo"
                      className="form-input pl-8 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Endereço de E-mail *</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="mariana@email.com"
                        className="form-input pl-8 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Telefone / WhatsApp *</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(11) 99999-0000"
                        className="form-input pl-8 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: Avaliação Física & Nível de Treino */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  2. Avaliação Física & Experiência
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="form-label">Idade</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        placeholder="28"
                        className="form-input pr-10 font-mono"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">anos</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Peso</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => handleChange('weight', e.target.value)}
                        placeholder="68.5"
                        className="form-input pr-8 font-mono"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">kg</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Altura</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleChange('height', e.target.value)}
                        placeholder="172"
                        className="form-input pr-8 font-mono"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">cm</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Nível de Experiência</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {trainingLevels.map((lvl) => {
                      const isSelected = formData.trainingLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleChange('trainingLevel', lvl)}
                          className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-center ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                              : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: Saúde & Anamnese */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  3. Anamnese & Saúde
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Alergias / Restrições</label>
                    <div className="relative">
                      <AlertTriangle size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.allergies}
                        onChange={(e) => handleChange('allergies', e.target.value)}
                        placeholder="Informe restrições relevantes"
                        className="form-input pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Medicamentos Contínuos</label>
                    <div className="relative">
                      <Pill size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.medications}
                        onChange={(e) => handleChange('medications', e.target.value)}
                        placeholder="Informe medicamentos em uso"
                        className="form-input pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Observações / Objetivos do Aluno</label>
                  <textarea
                    rows={2}
                    value={formData.observations}
                    onChange={(e) => handleChange('observations', e.target.value)}
                    placeholder="Histórico de lesões, objetivos principais de treino ou nutrição..."
                    className="form-input resize-none"
                  />
                </div>
              </div>

              {/* SEÇÃO 4: Plano & Status */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                  4. Assinatura & Status
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Plano Contratado *</label>
                    <select
                      value={formData.plan}
                      onChange={(e) => handleChange('plan', e.target.value as PlanType)}
                      className="form-input cursor-pointer font-medium"
                    >
                      <option value="Basic">Plano Básico</option>
                      <option value="Pro">Plano Profissional</option>
                      <option value="Enterprise">Plano Corporativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Status Inicial *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value as StatusType)}
                      className="form-input cursor-pointer font-medium"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── FOOTER DO FORMULÁRIO ── */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-1.5 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 py-1.5 px-4 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 size={13} />
                  <span>{submitLabel ?? 'Concluir Cadastro'}</span>
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}