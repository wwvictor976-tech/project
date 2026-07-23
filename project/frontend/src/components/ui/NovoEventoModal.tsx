import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  User,
  Users,
  Dumbbell,
  Activity,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

/* ── Tipos Exportados ── */
export type EventType = 'aula' | 'personal' | 'avaliacao' | 'reuniao';

export interface NovoEventoFormData {
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  duration: string;
  instructor: string;
  location: string;
  studentsCount: string;
  description: string;
  color: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NovoEventoFormData) => void;
  defaultDate?: string; // "YYYY-MM-DD"
  defaultTime?: string; // "HH:MM"
  initialData?: NovoEventoFormData;
  title?: string;
  description?: string;
  submitLabel?: string;
}

/* ── Configuração dos Tipos de Evento ── */
const typeOptions: {
  value: EventType;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  defaultColor: string;
}[] = [
  {
    value: 'aula',
    label: 'Aula Coletiva',
    sublabel: 'Turmas / Grupos',
    icon: Users,
    defaultColor: '#2563eb',
  },
  {
    value: 'personal',
    label: 'Personal Training',
    sublabel: 'Sessão individual',
    icon: Dumbbell,
    defaultColor: '#4f46e5',
  },
  {
    value: 'avaliacao',
    label: 'Avaliação Física',
    sublabel: 'Check-up e medição',
    icon: Activity,
    defaultColor: '#d97706',
  },
  {
    value: 'reuniao',
    label: 'Reunião',
    sublabel: 'Alinhamento / Equipe',
    icon: Briefcase,
    defaultColor: '#64748b',
  },
];

const DURATION_PRESETS = ['30min', '45min', '1h', '1h30', '2h'];

const COLOR_SWATCHES = [
  { hex: '#2563eb', name: 'Azul' },
  { hex: '#4f46e5', name: 'Índigo' },
  { hex: '#059669', name: 'Esmeralda' },
  { hex: '#d97706', name: 'Âmbar' },
  { hex: '#e11d48', name: 'Rosa' },
  { hex: '#0891b2', name: 'Ciano' },
  { hex: '#64748b', name: 'Grafite' },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nowHHMM() {
  const d = new Date();
  const h = Math.ceil(d.getHours() + (d.getMinutes() > 0 ? 1 : 0)) % 24;
  return `${String(h).padStart(2, '0')}:00`;
}

export function NovoEventoModal({ isOpen, onClose, onSubmit, defaultDate, defaultTime, initialData, title, description, submitLabel }: Props) {
  const buildInitialForm = (data?: NovoEventoFormData): NovoEventoFormData => {
    if (data) return { ...data };
    return {
      title: '',
      type: 'aula',
      date: defaultDate ?? todayISO(),
      startTime: defaultTime ?? nowHHMM(),
      duration: '1h',
      instructor: '',
      location: '',
      studentsCount: '',
      description: '',
      color: '#2563eb',
    };
  };

  const [form, setForm] = useState<NovoEventoFormData>(() => buildInitialForm(initialData));

  const [errors, setErrors] = useState<Partial<Record<keyof NovoEventoFormData, string>>>({});
  const [customDuration, setCustomDuration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colorManuallySet, setColorManuallySet] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const activeType = typeOptions.find((t) => t.value === form.type)!;

  useEffect(() => {
    if (!colorManuallySet) {
      setForm((f) => ({ ...f, color: activeType.defaultColor }));
    }
  }, [form.type, colorManuallySet, activeType]);

  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialForm(initialData));
      setErrors({});
      setColorManuallySet(false);
      setCustomDuration(false);
      setIsSubmitting(false);
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [isOpen, defaultDate, defaultTime, initialData]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  function setField<K extends keyof NovoEventoFormData>(key: K, value: NovoEventoFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Campo obrigatório';
    if (!form.date) e.date = 'Campo obrigatório';
    if (!form.startTime) e.startTime = 'Campo obrigatório';
    if (!form.instructor.trim()) e.instructor = 'Campo obrigatório';
    if (!form.location.trim()) e.location = 'Campo obrigatório';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 200));
    onSubmit(form);
    setIsSubmitting(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
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
            className="relative z-10 w-full max-w-xl max-h-[90vh] bg-white border border-slate-200/90 rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{title ?? 'Agendar Novo Evento'}</h2>
                <p className="text-xs text-slate-500">{description ?? 'Preencha os dados do compromisso'}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulário com Scroll */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              
              {/* Título do Evento */}
              <div>
                <label className="form-label">Título do Evento *</label>
                <input
                  ref={titleRef}
                  type="text"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="Título do evento"
                  className={`form-input ${errors.title ? 'border-rose-500' : ''}`}
                  maxLength={80}
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              {/* Tipo de Evento */}
              <div>
                <label className="form-label">Tipo de Compromisso *</label>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = form.type === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setField('type', opt.value)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-white' : 'text-slate-400'} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs truncate leading-tight">{opt.label}</p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {opt.sublabel}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Data *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setField('date', e.target.value)}
                    className={`form-input font-mono ${errors.date ? 'border-rose-500' : ''}`}
                  />
                  {errors.date && <p className="form-error">{errors.date}</p>}
                </div>

                <div>
                  <label className="form-label">Horário de Início *</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setField('startTime', e.target.value)}
                    className={`form-input font-mono ${errors.startTime ? 'border-rose-500' : ''}`}
                  />
                  {errors.startTime && <p className="form-error">{errors.startTime}</p>}
                </div>
              </div>

              {/* Duração */}
              <div>
                <label className="form-label">Duração Estimada</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setCustomDuration(false);
                        setField('duration', d);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                        !customDuration && form.duration === d
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomDuration(true)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                      customDuration
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
                {customDuration && (
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setField('duration', e.target.value)}
                    placeholder="Duração personalizada"
                    className="form-input mt-2"
                    autoFocus
                  />
                )}
              </div>

              {/* Instrutor e Local */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Instrutor Responsável *</label>
                  <div className="relative">
                    <User size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.instructor}
                      onChange={(e) => setField('instructor', e.target.value)}
                      placeholder="Nome do instrutor"
                      className={`form-input pl-8 ${errors.instructor ? 'border-rose-500' : ''}`}
                    />
                  </div>
                  {errors.instructor && <p className="form-error">{errors.instructor}</p>}
                </div>

                <div>
                  <label className="form-label">Localização *</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setField('location', e.target.value)}
                      placeholder="Local do evento"
                      className={`form-input pl-8 ${errors.location ? 'border-rose-500' : ''}`}
                    />
                  </div>
                  {errors.location && <p className="form-error">{errors.location}</p>}
                </div>
              </div>

              {/* Limite de Participantes e Cor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Máx. Participantes</label>
                  <div className="relative">
                    <Users size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={form.studentsCount}
                      onChange={(e) => setField('studentsCount', e.target.value)}
                      placeholder="Ilimitado"
                      className="form-input pl-8 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Cor de Destaque</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        title={swatch.name}
                        onClick={() => {
                          setColorManuallySet(true);
                          setField('color', swatch.hex);
                        }}
                        className="w-5 h-5 rounded-full transition-transform cursor-pointer hover:scale-110 flex items-center justify-center"
                        style={{ backgroundColor: swatch.hex }}
                      >
                        {form.color === swatch.hex && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-2xs" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Anotações */}
              <div>
                <label className="form-label">Anotações / Observações</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Informações adicionais para os alunos ou equipe..."
                  className="form-input resize-none"
                />
              </div>

              {/* Rodapé de Ações */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="py-1.5 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 py-1.5 px-4 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                >
                  {isSubmitting ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      <span>{submitLabel ?? 'Confirmar Agendamento'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}