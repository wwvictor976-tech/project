import { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Dumbbell,
  Star,
  Activity,
  Briefcase,
  FileText,
  CheckCircle2,
} from 'lucide-react';

/* ── Tipos ── */
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
}

/* ── Config de Tipos ── */
const typeOptions: {
  value: EventType;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  gradient: string;
  light: string;
  text: string;
  dot: string;
  defaultColor: string;
}[] = [
  {
    value: 'aula',
    label: 'Aula Coletiva',
    sublabel: 'Turma / grupo',
    icon: Users,
    gradient: 'from-blue-500 to-blue-700',
    light: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    defaultColor: '#2563eb',
  },
  {
    value: 'personal',
    label: 'Personal Training',
    sublabel: 'Sessão individual',
    icon: Dumbbell,
    gradient: 'from-violet-500 to-purple-700',
    light: 'bg-violet-50 border-violet-200',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    defaultColor: '#7c3aed',
  },
  {
    value: 'avaliacao',
    label: 'Avaliação Física',
    sublabel: 'Check-up / medição',
    icon: Activity,
    gradient: 'from-amber-400 to-orange-500',
    light: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    defaultColor: '#f59e0b',
  },
  {
    value: 'reuniao',
    label: 'Reunião',
    sublabel: 'Interno / equipe',
    icon: Briefcase,
    gradient: 'from-slate-500 to-slate-700',
    light: 'bg-slate-100 border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-500',
    defaultColor: '#64748b',
  },
];

const DURATION_PRESETS = ['30min', '45min', '1h', '1h30', '2h', '2h30', '3h'];

const COLOR_SWATCHES = [
  { hex: '#2563eb', name: 'Azul' },
  { hex: '#7c3aed', name: 'Violeta' },
  { hex: '#059669', name: 'Esmeralda' },
  { hex: '#f59e0b', name: 'Âmbar' },
  { hex: '#e11d48', name: 'Rosa' },
  { hex: '#0891b2', name: 'Ciano' },
  { hex: '#64748b', name: 'Ardósia' },
  { hex: '#9333ea', name: 'Púrpura' },
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

function fmtDate(iso: string) {
  if (!iso) return '—';
  const [y, m, day] = iso.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${Number(day)} ${months[Number(m) - 1]} ${y}`;
}

/* ── Componente Principal ── */
export function NovoEventoModal({ isOpen, onClose, onSubmit, defaultDate, defaultTime }: Props) {
  const [form, setForm] = useState<NovoEventoFormData>({
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
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NovoEventoFormData, string>>>({});
  const [customDuration, setCustomDuration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  /* Sync color when type changes (if user hasn't manually picked a color) */
  const [colorManuallySet, setColorManuallySet] = useState(false);
  const activeType = typeOptions.find((t) => t.value === form.type)!;

  useEffect(() => {
    if (!colorManuallySet) {
      setForm((f) => ({ ...f, color: activeType.defaultColor }));
    }
  }, [form.type, colorManuallySet]);

  /* Reset on open */
  useEffect(() => {
    if (isOpen) {
      setForm({
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
      });
      setErrors({});
      setColorManuallySet(false);
      setCustomDuration(false);
      setIsSubmitting(false);
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [isOpen, defaultDate, defaultTime]);

  /* Close on ESC */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function setField<K extends keyof NovoEventoFormData>(key: K, value: NovoEventoFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Título obrigatório';
    if (!form.date) e.date = 'Data obrigatória';
    if (!form.startTime) e.startTime = 'Horário obrigatório';
    if (!form.instructor.trim()) e.instructor = 'Instrutor obrigatório';
    if (!form.location.trim()) e.location = 'Local obrigatório';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    onSubmit(form);
    setIsSubmitting(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.22)] border border-white/20 animate-card-enter">

        {/* ── LEFT: Preview Panel ── */}
        <div
          className="hidden lg:flex w-80 shrink-0 flex-col justify-between p-7 relative overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${form.color}f0, ${form.color}90)` }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20" style={{ background: form.color }} />
          <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: 'white' }} />

          <div className="relative z-10 space-y-5">
            {/* Type badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">
              <activeType.icon size={12} />
              {activeType.label}
            </div>

            {/* Title preview */}
            <div>
              <p className="text-[11px] text-white/60 uppercase tracking-wider font-semibold mb-1">Evento</p>
              <h3 className="text-2xl font-bold text-white leading-snug break-words">
                {form.title.trim() || <span className="italic opacity-50">Sem título</span>}
              </h3>
            </div>

            {/* Details */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-white" />
                </div>
                <span className="font-medium">{fmtDate(form.date)}</span>
              </div>

              <div className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-white" />
                </div>
                <span className="font-medium">
                  {form.startTime || '--:--'}{' '}
                  {form.duration && <span className="text-white/60">· {form.duration}</span>}
                </span>
              </div>

              {form.instructor && (
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="font-medium truncate">{form.instructor}</span>
                </div>
              )}

              {form.location && (
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-white" />
                  </div>
                  <span className="font-medium truncate">{form.location}</span>
                </div>
              )}

              {form.studentsCount && (
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Users size={14} className="text-white" />
                  </div>
                  <span className="font-medium">{form.studentsCount} participante(s)</span>
                </div>
              )}
            </div>
          </div>

          {/* Color Picker */}
          <div className="relative z-10 mt-6">
            <p className="text-[11px] text-white/60 uppercase tracking-wider font-semibold mb-3">Cor do evento</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  title={swatch.name}
                  onClick={() => {
                    setColorManuallySet(true);
                    setField('color', swatch.hex);
                  }}
                  className="w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: swatch.hex,
                    borderColor: form.color === swatch.hex ? 'white' : 'transparent',
                    boxShadow: form.color === swatch.hex ? '0 0 0 2px rgba(255,255,255,0.4)' : 'none',
                    transform: form.color === swatch.hex ? 'scale(1.18)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col bg-white overflow-hidden"
        >
          {/* Form Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Criar Novo Evento</h2>
              <p className="text-sm text-slate-400 mt-0.5">Preencha as informações abaixo</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-7">

            {/* ── SECTION: Identidade ── */}
            <section className="space-y-4">
              <SectionLabel icon={Star} label="Identidade do Evento" />

              {/* Title */}
              <div>
                <label className="form-label">Título do evento *</label>
                <input
                  ref={titleRef}
                  type="text"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="Ex: Yoga Flow, Personal Training, Reunião de Equipe..."
                  className={`form-input ${errors.title ? 'border-rose-400 focus:ring-rose-500/20' : ''}`}
                  maxLength={80}
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              {/* Type selector */}
              <div>
                <label className="form-label">Tipo de evento *</label>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = form.type === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setField('type', opt.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                          isSelected
                            ? `${opt.light} border-current ${opt.text} shadow-sm`
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-current/10' : 'bg-slate-100'
                        }`}>
                          <Icon size={16} className={isSelected ? 'opacity-90' : 'text-slate-500'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold leading-tight truncate">{opt.label}</p>
                          <p className="text-[11px] opacity-60 leading-tight">{opt.sublabel}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="ml-auto shrink-0 opacity-80" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── SECTION: Data e Horário ── */}
            <section className="space-y-4">
              <SectionLabel icon={Clock} label="Data & Horário" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Data *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setField('date', e.target.value)}
                    className={`form-input ${errors.date ? 'border-rose-400' : ''}`}
                  />
                  {errors.date && <p className="form-error">{errors.date}</p>}
                </div>

                <div>
                  <label className="form-label">Horário de início *</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setField('startTime', e.target.value)}
                    className={`form-input ${errors.startTime ? 'border-rose-400' : ''}`}
                  />
                  {errors.startTime && <p className="form-error">{errors.startTime}</p>}
                </div>
              </div>

              {/* Duration presets */}
              <div>
                <label className="form-label">Duração</label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setCustomDuration(false);
                        setField('duration', d);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                        !customDuration && form.duration === d
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomDuration(true)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                      customDuration
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Personalizar
                  </button>
                </div>
                {customDuration && (
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setField('duration', e.target.value)}
                    placeholder="Ex: 1h45min"
                    className="form-input mt-2"
                    autoFocus
                  />
                )}
              </div>
            </section>

            {/* ── SECTION: Onde & Quem ── */}
            <section className="space-y-4">
              <SectionLabel icon={MapPin} label="Onde & Quem" />

              <div>
                <label className="form-label">Instrutor / Responsável *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.instructor}
                    onChange={(e) => setField('instructor', e.target.value)}
                    placeholder="Nome do instrutor ou responsável"
                    className={`form-input pl-9 ${errors.instructor ? 'border-rose-400' : ''}`}
                  />
                </div>
                {errors.instructor && <p className="form-error">{errors.instructor}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Local *</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setField('location', e.target.value)}
                      placeholder="Ex: Studio A, Sala 02..."
                      className={`form-input pl-9 ${errors.location ? 'border-rose-400' : ''}`}
                    />
                  </div>
                  {errors.location && <p className="form-error">{errors.location}</p>}
                </div>

                <div>
                  <label className="form-label">Máx. participantes</label>
                  <div className="relative">
                    <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={form.studentsCount}
                      onChange={(e) => setField('studentsCount', e.target.value)}
                      placeholder="Ilimitado"
                      className="form-input pl-9"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION: Descrição ── */}
            <section className="space-y-3">
              <SectionLabel icon={FileText} label="Anotações" optional />
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Observações, material necessário, link de acesso..."
                className="form-input resize-none"
              />
            </section>

            {/* Mobile: color picker */}
            <section className="lg:hidden space-y-3">
              <SectionLabel icon={Star} label="Cor do Evento" optional />
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    title={swatch.name}
                    onClick={() => {
                      setColorManuallySet(true);
                      setField('color', swatch.hex);
                    }}
                    className="w-8 h-8 rounded-full border-4 transition-all duration-150 hover:scale-110"
                    style={{
                      backgroundColor: swatch.hex,
                      borderColor: form.color === swatch.hex ? '#1e293b' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Form Footer */}
          <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0 gap-3">
            <p className="text-xs text-slate-400 hidden sm:block">
              Campos com <span className="text-rose-500">*</span> são obrigatórios
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary min-w-[140px] justify-center"
                style={!isSubmitting ? { backgroundColor: form.color, borderColor: form.color } : undefined}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Criar Evento
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Sub-componentes ── */
function SectionLabel({
  icon: Icon,
  label,
  optional,
}: {
  icon: React.ElementType;
  label: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
        <Icon size={13} className="text-slate-500" />
      </div>
      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      {optional && (
        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Opcional</span>
      )}
    </div>
  );
}
