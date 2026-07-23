import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Receipt, DollarSign, User, CalendarRange, Tag } from 'lucide-react';

export type TransactionStatus = 'Pago' | 'Pendente' | 'Atrasado' | 'Cancelado';
export type TransactionType = 'Receita' | 'Despesa';
export type RevenueCategory = 'Planos & Mensalidades' | 'Personal Training' | 'Avaliação Física' | 'Taxa de Matrícula';
export type ExpenseCategory = 'Infraestrutura / Aluguel' | 'Equipamentos' | 'Equipe / Pessoal' | 'Sistemas & Software' | 'Marketing';

export interface NewTransactionFormData {
  description: string;
  category: RevenueCategory | ExpenseCategory;
  studentOrVendor: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  method: string;
}

interface NovoFaturamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTransactionFormData) => void;
  initialData?: NewTransactionFormData;
  title?: string;
  description?: string;
  submitLabel?: string;
}

const initialFormState: NewTransactionFormData = {
  description: '',
  category: 'Planos & Mensalidades',
  studentOrVendor: '',
  amount: 0,
  type: 'Receita',
  status: 'Pago',
  date: '',
  method: '',
};

export function NovoFaturamentoModal({ isOpen, onClose, onSubmit, initialData, title, description, submitLabel }: NovoFaturamentoModalProps) {
  const buildInitialForm = (data?: NewTransactionFormData): NewTransactionFormData => {
    if (data) return { ...data };
    return {
      ...initialFormState,
      date: new Date().toISOString().slice(0, 10),
    };
  };
  const [formData, setFormData] = useState<NewTransactionFormData>(() => buildInitialForm(initialData));

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

  const handleChange = (field: keyof NewTransactionFormData, value: string | number) => {
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
                <h2 className="text-sm font-semibold text-slate-900">{title ?? 'Registrar Novo Movimento'}</h2>
                <p className="text-xs text-slate-500">{description ?? 'Cadastre uma receita ou despesa e ela aparecerá imediatamente no financeiro.'}</p>
              </div>
              <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Descrição *</label>
                    <div className="relative">
                      <Receipt size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input required value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Descrição do lançamento" className="form-input pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Aluno / Fornecedor *</label>
                    <div className="relative">
                      <User size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input required value={formData.studentOrVendor} onChange={(e) => handleChange('studentOrVendor', e.target.value)} placeholder="Aluno ou fornecedor" className="form-input pl-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Tipo</label>
                    <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} className="form-input cursor-pointer">
                      <option value="Receita">Receita</option>
                      <option value="Despesa">Despesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="form-input cursor-pointer">
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Atrasado">Atrasado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Categoria</label>
                    <div className="relative">
                      <Tag size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} className="form-input pl-8 cursor-pointer">
                        {formData.type === 'Receita' ? (
                          <>
                            <option value="Planos & Mensalidades">Planos & Mensalidades</option>
                            <option value="Personal Training">Personal Training</option>
                            <option value="Avaliação Física">Avaliação Física</option>
                            <option value="Taxa de Matrícula">Taxa de Matrícula</option>
                          </>
                        ) : (
                          <>
                            <option value="Infraestrutura / Aluguel">Infraestrutura / Aluguel</option>
                            <option value="Equipamentos">Equipamentos</option>
                            <option value="Equipe / Pessoal">Equipe / Pessoal</option>
                            <option value="Sistemas & Software">Sistemas & Software</option>
                            <option value="Marketing">Marketing</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Forma de Pagamento</label>
                    <div className="relative">
                      <DollarSign size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input value={formData.method} onChange={(e) => handleChange('method', e.target.value)} placeholder="Pix, Cartão, Boleto" className="form-input pl-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Valor (R$)</label>
                    <input type="number" min="0" value={formData.amount} onChange={(e) => handleChange('amount', Number(e.target.value))} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Data</label>
                    <div className="relative">
                      <CalendarRange size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="form-input pl-8" />
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
                  <span>{submitLabel ?? 'Salvar Movimento'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
