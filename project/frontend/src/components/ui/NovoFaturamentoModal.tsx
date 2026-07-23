import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Receipt, DollarSign, User, CalendarRange, Tag } from 'lucide-react';

export type TransactionStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'draft';
export type TransactionType = 'Receita' | 'Despesa';
export type RevenueCategory = 'Mensalidades' | 'Serviços' | 'Matrículas' | 'Produtos' | 'Outras receitas';
export type ExpenseCategory = 'Infraestrutura' | 'Equipamentos' | 'Equipe' | 'Sistemas' | 'Marketing' | 'Outras despesas';

export interface NewTransactionFormData {
  name: string;
  description: string;
  category: RevenueCategory | ExpenseCategory;
  counterpartyName: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  accrualMonth: string;
  paymentMethod: string;
  notes: string;
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
  name: '',
  description: '',
  category: 'Mensalidades',
  counterpartyName: '',
  amount: 0,
  type: 'Receita',
  status: 'paid',
  date: '',
  accrualMonth: '',
  paymentMethod: '',
  notes: '',
};

export function NovoFaturamentoModal({ isOpen, onClose, onSubmit, initialData, title, description, submitLabel }: NovoFaturamentoModalProps) {
  const buildInitialForm = (data?: NewTransactionFormData): NewTransactionFormData => {
    if (data) return { ...data };
    return {
      ...initialFormState,
      date: new Date().toISOString().slice(0, 10),
      accrualMonth: new Date().toISOString().slice(0, 7),
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
                      <input required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Nome do lançamento" className="form-input pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Aluno / Fornecedor *</label>
                    <div className="relative">
                      <User size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input required value={formData.counterpartyName} onChange={(e) => handleChange('counterpartyName', e.target.value)} placeholder="Aluno ou fornecedor" className="form-input pl-8" />
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
                      <option value="paid">Pago</option>
                      <option value="pending">Pendente</option>
                      <option value="overdue">Atrasado</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="draft">Rascunho</option>
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
                            <option value="Mensalidades">Mensalidades</option>
                            <option value="Serviços">Serviços</option>
                            <option value="Matrículas">Matrículas</option>
                            <option value="Produtos">Produtos</option>
                            <option value="Outras receitas">Outras receitas</option>
                          </>
                        ) : (
                          <>
                            <option value="Infraestrutura">Infraestrutura</option>
                            <option value="Equipamentos">Equipamentos</option>
                            <option value="Equipe">Equipe</option>
                            <option value="Sistemas">Sistemas</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Outras despesas">Outras despesas</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Forma de Pagamento</label>
                    <div className="relative">
                      <DollarSign size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      <input value={formData.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)} placeholder="Pix, Cartão, Boleto" className="form-input pl-8" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="form-label">Competência</label><input type="month" value={formData.accrualMonth} onChange={(e) => handleChange('accrualMonth', e.target.value)} className="form-input" /></div><div><label className="form-label">Observações</label><input value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Observações e preparação para anexos" className="form-input" /></div></div>
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
