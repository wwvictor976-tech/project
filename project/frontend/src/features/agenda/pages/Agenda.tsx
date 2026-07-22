import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Search,
  Calendar as CalendarIcon,
  Sparkles,
  MoreHorizontal,
  Trash2,
  Eye,
  Activity,
  CheckCircle2,
  Users,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { NovoEventoModal } from '@/components/ui/NovoEventoModal';
import type { EventType, NovoEventoFormData } from '@/components/ui/NovoEventoModal';

/* ── Interfaces ── */
interface Evento {
  id: number;
  title: string;
  time: string;
  duration: string;
  instructor: string;
  location: string;
  type: EventType;
  day: number;
  month: number;
  year: number;
  studentsCount?: number;
  description?: string;
  color: string;
}

/* ── Config de Tipos ── */
type TypeConfigEntry = { label: string; bg: string; text: string; border: string; bar: string; dot: string };
type TypeConfigMap = Record<EventType, TypeConfigEntry>;

const typeConfig: TypeConfigMap = {
  aula: {
    label: 'Aula Coletiva',
    bg: 'bg-blue-50/80',
    text: 'text-blue-700',
    border: 'border-blue-200/60',
    bar: '#2563eb',
    dot: 'bg-blue-500 animate-pulse-glow',
  },
  personal: {
    label: 'Personal Training',
    bg: 'bg-violet-50/80',
    text: 'text-violet-700',
    border: 'border-violet-200/60',
    bar: '#7c3aed',
    dot: 'bg-violet-500',
  },
  avaliacao: {
    label: 'Avaliação Física',
    bg: 'bg-amber-50/80',
    text: 'text-amber-700',
    border: 'border-amber-200/60',
    bar: '#f59e0b',
    dot: 'bg-amber-500',
  },
  reuniao: {
    label: 'Reunião',
    bg: 'bg-slate-100/80',
    text: 'text-slate-600',
    border: 'border-slate-200',
    bar: '#64748b',
    dot: 'bg-slate-400',
  },
};

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS     = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

type ViewMode = 'day' | 'week';

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Returns the Mon–Sun date range for the week containing `date` */
function getWeekDates(date: Date): Date[] {
  const dow = date.getDay(); // 0=Sun
  const mon = new Date(date);
  mon.setDate(date.getDate() - ((dow + 6) % 7)); // roll back to Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function toISO(day: number, month: number, year: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/* ── Componente Principal ── */
export default function Agenda() {
  const today = useMemo(() => new Date(), []);

  const [viewMonth, setViewMonth]         = useState(today.getMonth());
  const [viewYear, setViewYear]           = useState(today.getFullYear());
  const [selectedDay, setSelectedDay]     = useState(today.getDate());
  const [viewMode, setViewMode]           = useState<ViewMode>('day');
  const [search, setSearch]               = useState('');
  const [filterType, setFilterType]       = useState<string>('Todos');
  const [menuOpen, setMenuOpen]           = useState<number | null>(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>();
  const [eventos, setEventos]             = useState<Evento[]>([]);
  const [detailEvent, setDetailEvent] = useState<Evento | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  /* Close menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Calendar nav */
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleResetToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const calendarCells = useMemo(() => buildCalendar(viewYear, viewMonth), [viewYear, viewMonth]);

  const daysWithEvents = useMemo(() => {
    const set = new Set<string>();
    eventos.forEach((ev) => set.add(`${ev.year}-${ev.month}-${ev.day}`));
    return set;
  }, [eventos]);

  /* Selected week dates */
  const weekDates = useMemo(() => {
    const sel = new Date(viewYear, viewMonth, selectedDay);
    return getWeekDates(sel);
  }, [viewYear, viewMonth, selectedDay]);

  /* Events for the selected day */
  const dayEvents = useMemo(() => {
    return eventos
      .filter((ev) => {
        const matchesDay    = ev.day === selectedDay && ev.month === viewMonth && ev.year === viewYear;
        const query         = search.toLowerCase().trim();
        const matchesSearch = !query ||
          ev.title.toLowerCase().includes(query) ||
          ev.instructor.toLowerCase().includes(query) ||
          ev.location.toLowerCase().includes(query);
        const matchesType   = filterType === 'Todos' || ev.type === filterType;
        return matchesDay && matchesSearch && matchesType;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [eventos, selectedDay, viewMonth, viewYear, search, filterType]);

  /* Events for the week view */
  const weekEvents = useMemo(() => {
    const byDay: Record<string, Evento[]> = {};
    weekDates.forEach((d) => {
      const key = d.toISOString().slice(0, 10);
      byDay[key] = eventos
        .filter((ev) => {
          const q = search.toLowerCase().trim();
          const matchSearch = !q ||
            ev.title.toLowerCase().includes(q) ||
            ev.instructor.toLowerCase().includes(q);
          const matchType = filterType === 'Todos' || ev.type === filterType;
          return (
            ev.year === d.getFullYear() &&
            ev.month === d.getMonth() &&
            ev.day === d.getDate() &&
            matchSearch && matchType
          );
        })
        .sort((a, b) => a.time.localeCompare(b.time));
    });
    return byDay;
  }, [eventos, weekDates, search, filterType]);

  /* KPIs for selected day */
  const kpiStats = useMemo(() => {
    const today_evs = eventos.filter(
      (ev) => ev.day === selectedDay && ev.month === viewMonth && ev.year === viewYear,
    );
    return {
      total:     today_evs.length,
      aulas:     today_evs.filter((e) => e.type === 'aula').length,
      personal:  today_evs.filter((e) => e.type === 'personal').length,
      avaliacao: today_evs.filter((e) => e.type === 'avaliacao').length,
    };
  }, [eventos, selectedDay, viewMonth, viewYear]);

  /* Delete event */
  const deleteEvent = (id: number) => {
    setEventos((evs) => evs.filter((e) => e.id !== id));
    setMenuOpen(null);
    if (detailEvent?.id === id) setDetailEvent(null);
  };

  /* Add event from modal */
  const handleCreateEvento = (data: NovoEventoFormData) => {
    const parts = data.date.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    const newEvento: Evento = {
      id:            Date.now(),
      title:         data.title.trim(),
      time:          data.startTime,
      duration:      data.duration,
      instructor:    data.instructor.trim(),
      location:      data.location.trim(),
      type:          data.type,
      day:           d,
      month:         m - 1,
      year:          y,
      studentsCount: data.studentsCount ? Number(data.studentsCount) : undefined,
      description:   data.description.trim() || undefined,
      color:         data.color,
    };
    setEventos((prev) => [...prev, newEvento]);
    // Navigate to the created event's day
    setViewYear(y);
    setViewMonth(m - 1);
    setSelectedDay(d);
    setViewMode('day');
  };

  const openModalForDate = (day: number, month: number, year: number) => {
    setModalDefaultDate(toISO(day, month, year));
    setModalOpen(true);
  };

  const isWeekToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  return (
    <div className="space-y-6 text-slate-800">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 animate-fade-slide">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Agenda & Grade de Aulas</h1>
            <span className="page-tag">
              <Sparkles className="w-3 h-3 text-blue-500" />
              {eventos.length > 0 ? `${eventos.length} evento(s)` : 'Nenhum evento'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 animate-fade-slide" style={{ animationDelay: '0.05s' }}>
            {selectedDay} de {MONTHS[viewMonth]} de {viewYear} · {kpiStats.total} compromisso(s) neste dia
          </p>
        </div>

        <div className="flex items-center gap-3 animate-fade-slide" style={{ animationDelay: '0.1s' }}>
          {/* View toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List size={14} /> Dia
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={14} /> Semana
            </button>
          </div>

          <button type="button" className="btn-outline" onClick={handleResetToday}>
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span>Hoje</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setModalDefaultDate(toISO(selectedDay, viewMonth, viewYear));
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Eventos no Dia',      val: kpiStats.total,     icon: CalendarIcon,  color: 'blue' },
          { label: 'Aulas Coletivas',     val: kpiStats.aulas,     icon: Users,         color: 'emerald' },
          { label: 'Personal Training',   val: kpiStats.personal,  icon: Activity,      color: 'violet' },
          { label: 'Avaliações',          val: kpiStats.avaliacao, icon: CheckCircle2,  color: 'amber' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          const iconStyle =
            kpi.color === 'blue'    ? 'bg-blue-50 text-blue-600' :
            kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
            kpi.color === 'violet'  ? 'bg-violet-50 text-violet-600' :
            'bg-amber-50 text-amber-600';
          return (
            <div
              key={i}
              className="panel-card-sm animate-card-enter flex items-center justify-between"
              style={{ animationDelay: `${0.05 + i * 0.05}s` }}
            >
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.val}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconStyle}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── GRID PRINCIPAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

        {/* ── CALENDÁRIO LATERAL ── */}
        <div
          className="bg-white border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden self-start animate-fade-slide"
          style={{ borderRadius: 24, animationDelay: '0.25s' }}
        >
          {/* Header do Mês */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white/50">
            <button type="button" onClick={prevMonth} className="btn-icon">
              <ChevronLeft size={18} />
            </button>
            <p className="text-sm font-semibold text-slate-800">
              {MONTHS[viewMonth]} <span className="text-slate-400 font-normal">{viewYear}</span>
            </p>
            <button type="button" onClick={nextMonth} className="btn-icon">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 px-4 pt-4 pb-1 text-center">
            {DAYS_SHORT.map((d) => (
              <span key={d} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{d}</span>
            ))}
          </div>

          {/* Grid de Dias */}
          <div className="grid grid-cols-7 px-4 pb-4 gap-y-1 text-center">
            {calendarCells.map((day, i) => (
              <div key={i} className="aspect-square flex items-center justify-center relative">
                {day !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`relative w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border-none ${
                      selectedDay === day && viewMode === 'day'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isToday(day)
                        ? 'bg-blue-50 text-blue-600 font-bold ring-1 ring-blue-200'
                        : 'text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    {day}
                    {daysWithEvents.has(`${viewYear}-${viewMonth}-${day}`) && !(selectedDay === day && viewMode === 'day') && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Legenda de Tipos */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Filtrar por tipo</p>
            <button
              type="button"
              onClick={() => setFilterType('Todos')}
              className={`w-full flex items-center justify-between text-xs p-2 rounded-lg transition-colors cursor-pointer ${
                filterType === 'Todos' ? 'bg-white shadow-sm font-semibold text-slate-800' : 'text-slate-500 hover:bg-slate-100/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300" /> Todos os tipos
              </span>
              {filterType === 'Todos' && <span className="text-[10px] text-blue-600 font-bold">Ativo</span>}
            </button>
            {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([key, cfg]) => (
              <button
                type="button"
                key={key}
                onClick={() => setFilterType(filterType === key ? 'Todos' : key)}
                className={`w-full flex items-center justify-between text-xs p-2 rounded-lg transition-colors cursor-pointer ${
                  filterType === key ? 'bg-white shadow-sm font-semibold text-slate-800' : 'text-slate-500 hover:bg-slate-100/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
                {filterType === key && <span className="text-[10px] text-blue-600 font-bold">Ativo</span>}
              </button>
            ))}
          </div>

          {/* Quick add button */}
          <div className="p-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => openModalForDate(selectedDay, viewMonth, viewYear)}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 py-2 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Plus size={14} /> Agendar neste dia
            </button>
          </div>
        </div>

        {/* ── CONTENT PANEL: DAY OR WEEK VIEW ── */}
        {viewMode === 'day' ? (
          <DayView
            selectedDay={selectedDay}
            viewMonth={viewMonth}
            viewYear={viewYear}
            isToday={isToday}
            dayEvents={dayEvents}
            search={search}
            setSearch={setSearch}
            filterType={filterType}
            setFilterType={setFilterType}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            menuRef={menuRef}
            typeConfig={typeConfig}
            onDelete={deleteEvent}
            onDetail={setDetailEvent}
            onNewEvent={() => openModalForDate(selectedDay, viewMonth, viewYear)}
            MONTHS={MONTHS}
          />
        ) : (
          <WeekView
            weekDates={weekDates}
            weekEvents={weekEvents}
            isWeekToday={isWeekToday}
            typeConfig={typeConfig}
            search={search}
            setSearch={setSearch}
            onDayClick={(d) => { setSelectedDay(d.getDate()); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); setViewMode('day'); }}
            onNewEvent={(d) => openModalForDate(d.getDate(), d.getMonth(), d.getFullYear())}
            onDetail={setDetailEvent}
          />
        )}
      </div>

      {/* ── DETAIL DRAWER ── */}
      {detailEvent && (
        <EventDetailDrawer event={detailEvent} typeConfig={typeConfig} onClose={() => setDetailEvent(null)} onDelete={deleteEvent} />
      )}

      {/* ── MODAL DE NOVO EVENTO ── */}
      <NovoEventoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateEvento}
        defaultDate={modalDefaultDate}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   DAY VIEW
══════════════════════════════════════════════════ */
function DayView({
  selectedDay, viewMonth, viewYear, isToday,
  dayEvents, search, setSearch, filterType, setFilterType,
  menuOpen, setMenuOpen, menuRef, typeConfig,
  onDelete, onDetail, onNewEvent, MONTHS,
}: {
  selectedDay: number;
  viewMonth: number;
  viewYear: number;
  isToday: (d: number) => boolean;
  dayEvents: Evento[];
  search: string;
  setSearch: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  menuOpen: number | null;
  setMenuOpen: (v: number | null) => void;
  menuRef: React.RefObject<HTMLDivElement>;
  typeConfig: TypeConfigMap;
  onDelete: (id: number) => void;
  onDetail: (ev: Evento) => void;
  onNewEvent: () => void;
  MONTHS: string[];
}) {
  return (
    <div
      className="bg-white border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col animate-fade-slide"
      style={{ borderRadius: 24, animationDelay: '0.35s' }}
    >
      {/* Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            {isToday(selectedDay) && viewMonth === new Date().getMonth() && viewYear === new Date().getFullYear()
              ? 'Compromissos de Hoje'
              : `Agenda de ${selectedDay} de ${MONTHS[viewMonth]}`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {dayEvents.length > 0 ? `${dayEvents.length} evento(s)` : 'Sem eventos neste dia'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar evento..."
              className="input-field pl-8 pr-8 py-2"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field pl-3 pr-8 py-2 appearance-none cursor-pointer w-auto"
          >
            <option value="Todos">Todos</option>
            <option value="aula">Aulas</option>
            <option value="personal">Personal</option>
            <option value="avaliacao">Avaliações</option>
            <option value="reuniao">Reuniões</option>
          </select>
        </div>
      </div>

      {/* Event list */}
      <div className="p-6 flex-1 min-h-[380px]">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <CalendarIcon size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {search || filterType !== 'Todos' ? 'Nenhum evento encontrado' : 'Agenda limpa nesta data'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {search || filterType !== 'Todos'
                ? 'Ajuste os filtros de busca para ver mais resultados.'
                : 'Selecione outro dia ou crie um novo evento para começar.'}
            </p>
            {!search && filterType === 'Todos' && (
              <button
                type="button"
                onClick={onNewEvent}
                className="mt-5 flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Plus size={15} /> Criar evento neste dia
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 relative">
            {dayEvents.map((ev, idx) => {
              const cfg = typeConfig[ev.type];
              return (
                <div
                  key={ev.id}
                  className="group relative flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 bg-white cursor-pointer animate-fade-slide overflow-hidden"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => onDetail(ev)}
                >
                  {/* Color bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: ev.color }}
                  />

                  {/* Time */}
                  <div className="pl-2 text-center shrink-0 min-w-[50px]">
                    <p className="text-sm font-black text-slate-800">{ev.time}</p>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 justify-center mt-0.5">
                      <Clock size={10} /> {ev.duration}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-10 bg-slate-100 shrink-0 hidden sm:block" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        {ev.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User size={11} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{ev.instructor}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        {ev.location}
                      </span>
                      {ev.studentsCount !== undefined && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Users size={11} /> {ev.studentsCount} participantes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="flex items-center gap-1 relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(menuOpen === ev.id ? null : ev.id)}
                      className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {menuOpen === ev.id && (
                      <div ref={menuRef} className="dropdown-menu absolute right-0 top-9 w-40 animate-pop-in z-20">
                        <button type="button" onClick={() => { onDetail(ev); setMenuOpen(null); }} className="dropdown-item">
                          <Eye size={14} className="text-slate-400" /> Detalhes
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => onDelete(ev.id)}
                          className="dropdown-item-danger"
                        >
                          <Trash2 size={14} className="text-rose-500" /> Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs text-slate-400">
        <span>
          <strong className="text-slate-700">{dayEvents.length}</strong> compromisso(s)
        </span>
        <button
          type="button"
          onClick={onNewEvent}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <Plus size={13} /> Novo evento
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   WEEK VIEW
══════════════════════════════════════════════════ */
function WeekView({
  weekDates, weekEvents, isWeekToday, typeConfig,
  search, setSearch,
  onDayClick, onNewEvent, onDetail,
}: {
  weekDates: Date[];
  weekEvents: Record<string, Evento[]>;
  isWeekToday: (d: Date) => boolean;
  typeConfig: TypeConfigMap;
  search: string;
  setSearch: (v: string) => void;
  onDayClick: (d: Date) => void;
  onNewEvent: (d: Date) => void;
  onDetail: (ev: Evento) => void;
}) {
  const weekStart = weekDates[0]!;
  const weekEnd   = weekDates[6]!;
  const fmtRange  = () => {
    const ms = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.getDate()}–${weekEnd.getDate()} ${ms[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
    }
    return `${weekStart.getDate()} ${ms[weekStart.getMonth()]} – ${weekEnd.getDate()} ${ms[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
  };

  const totalWeekEvents = weekDates.reduce((sum, d) => {
    return sum + (weekEvents[d.toISOString().slice(0, 10)]?.length ?? 0);
  }, 0);

  return (
    <div
      className="bg-white border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col animate-fade-slide"
      style={{ borderRadius: 24, animationDelay: '0.35s' }}
    >
      {/* Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Visão Semanal</h2>
          <p className="text-xs text-slate-400 mt-0.5">{fmtRange()} · {totalWeekEvents} evento(s)</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="input-field pl-8 pr-8 py-2"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Week grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px] divide-x divide-slate-100">
          {weekDates.map((d) => {
            const key = d.toISOString().slice(0, 10);
            const evs = weekEvents[key] ?? [];
            const todayDay = isWeekToday(d);
            return (
              <div key={key} className="flex flex-col min-h-[480px]">
                {/* Day header */}
                <button
                  type="button"
                  onClick={() => onDayClick(d)}
                  className={`p-3 text-center border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer w-full group ${
                    todayDay ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${todayDay ? 'text-blue-500' : 'text-slate-400'}`}>
                    {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]}
                  </p>
                  <div className={`w-7 h-7 rounded-full mx-auto mt-1 flex items-center justify-center text-sm font-bold transition-colors ${
                    todayDay ? 'bg-blue-600 text-white' : 'text-slate-700 group-hover:bg-slate-100'
                  }`}>
                    {d.getDate()}
                  </div>
                </button>

                {/* Events */}
                <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                  {evs.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => onNewEvent(d)}
                      className="w-full h-12 rounded-xl border border-dashed border-slate-200 text-slate-300 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-center text-xs gap-1 cursor-pointer mt-2"
                    >
                      <Plus size={14} />
                    </button>
                  ) : (
                    <>
                      {evs.map((ev) => {
                        const cfg = typeConfig[ev.type];
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => onDetail(ev)}
                            className={`w-full text-left rounded-xl p-2 border transition-all hover:shadow-sm cursor-pointer ${cfg.bg} ${cfg.border}`}
                            style={{ borderLeftColor: ev.color, borderLeftWidth: 3 }}
                          >
                            <p className={`text-[11px] font-bold truncate ${cfg.text}`}>{ev.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Clock size={9} /> {ev.time}
                            </p>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => onNewEvent(d)}
                        className="w-full h-8 rounded-lg border border-dashed border-slate-200 text-slate-300 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-center text-xs gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   EVENT DETAIL DRAWER (slide-in from right)
══════════════════════════════════════════════════ */
function EventDetailDrawer({
  event, typeConfig, onClose, onDelete,
}: {
  event: Evento;
  typeConfig: TypeConfigMap;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const cfg = typeConfig[event.type];
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed right-4 top-4 bottom-4 z-50 w-full max-w-sm bg-white rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col animate-card-enter border border-slate-100"
      >
        {/* Header with color bar */}
        <div
          className="p-6 relative"
          style={{ background: `linear-gradient(135deg, ${event.color}22, ${event.color}08)` }}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <button type="button" onClick={onClose} className="btn-icon">
              <X size={18} />
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 leading-snug">{event.title}</h2>

          <div
            className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
            style={{ backgroundColor: event.color }}
          />
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {[
            { icon: Clock,   label: 'Horário',  val: `${event.time} · ${event.duration}` },
            { icon: User,    label: 'Instrutor', val: event.instructor },
            { icon: MapPin,  label: 'Local',     val: event.location },
            ...(event.studentsCount !== undefined
              ? [{ icon: Users, label: 'Participantes', val: `${event.studentsCount} inscritos` }]
              : []),
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${event.color}18` }}>
                <Icon size={16} style={{ color: event.color }} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{val}</p>
              </div>
            </div>
          ))}

          {event.description && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Anotações</p>
              <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50/40">
          <button
            type="button"
            onClick={() => { onDelete(event.id); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors"
          >
            <Trash2 size={15} /> Cancelar Evento
          </button>
          <button type="button" onClick={onClose} className="btn-outline px-5">
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}
