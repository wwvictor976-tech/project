import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Search,
  Calendar as CalendarIcon,
  Trash2,
  Eye,
  Activity,
  CheckCircle2,
  Users,
  LayoutGrid,
  List,
  X,
  Filter,
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

type ViewMode = 'day' | 'week';

/* ── Configuração de Tipos de Eventos ── */
type TypeConfigEntry = { label: string; bg: string; text: string; border: string; bar: string };
type TypeConfigMap = Record<EventType, TypeConfigEntry>;

const typeConfig: TypeConfigMap = {
  aula: {
    label: 'Aula Coletiva',
    bg: 'bg-blue-50/80',
    text: 'text-blue-700',
    border: 'border-blue-200/60',
    bar: '#2563eb',
  },
  personal: {
    label: 'Personal Training',
    bg: 'bg-indigo-50/80',
    text: 'text-indigo-700',
    border: 'border-indigo-200/60',
    bar: '#4f46e5',
  },
  avaliacao: {
    label: 'Avaliação Física',
    bg: 'bg-amber-50/80',
    text: 'text-amber-700',
    border: 'border-amber-200/60',
    bar: '#d97706',
  },
  reuniao: {
    label: 'Reunião',
    bg: 'bg-slate-100/80',
    text: 'text-slate-700',
    border: 'border-slate-200/80',
    bar: '#64748b',
  },
};

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/* ── Animações Framer Motion ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

/* ── Funções Auxiliares ── */
function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getWeekDates(date: Date): Date[] {
  const dow = date.getDay();
  const mon = new Date(date);
  mon.setDate(date.getDate() - ((dow + 6) % 7));
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

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [detailEvent, setDetailEvent] = useState<Evento | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
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

  const weekDates = useMemo(() => {
    const sel = new Date(viewYear, viewMonth, selectedDay);
    return getWeekDates(sel);
  }, [viewYear, viewMonth, selectedDay]);

  const dayEvents = useMemo(() => {
    return eventos
      .filter((ev) => {
        const matchesDay = ev.day === selectedDay && ev.month === viewMonth && ev.year === viewYear;
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          ev.title.toLowerCase().includes(query) ||
          ev.instructor.toLowerCase().includes(query) ||
          ev.location.toLowerCase().includes(query);
        const matchesType = filterType === 'Todos' || ev.type === filterType;
        return matchesDay && matchesSearch && matchesType;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [eventos, selectedDay, viewMonth, viewYear, search, filterType]);

  const weekEvents = useMemo(() => {
    const byDay: Record<string, Evento[]> = {};
    weekDates.forEach((d) => {
      const key = d.toISOString().slice(0, 10);
      byDay[key] = eventos
        .filter((ev) => {
          const q = search.toLowerCase().trim();
          const matchSearch =
            !q ||
            ev.title.toLowerCase().includes(q) ||
            ev.instructor.toLowerCase().includes(q);
          const matchType = filterType === 'Todos' || ev.type === filterType;
          return (
            ev.year === d.getFullYear() &&
            ev.month === d.getMonth() &&
            ev.day === d.getDate() &&
            matchSearch &&
            matchType
          );
        })
        .sort((a, b) => a.time.localeCompare(b.time));
    });
    return byDay;
  }, [eventos, weekDates, search, filterType]);

  const kpiStats = useMemo(() => {
    const today_evs = eventos.filter(
      (ev) => ev.day === selectedDay && ev.month === viewMonth && ev.year === viewYear,
    );
    return {
      total: today_evs.length,
      aulas: today_evs.filter((e) => e.type === 'aula').length,
      personal: today_evs.filter((e) => e.type === 'personal').length,
      avaliacao: today_evs.filter((e) => e.type === 'avaliacao').length,
    };
  }, [eventos, selectedDay, viewMonth, viewYear]);

  const deleteEvent = (id: number) => {
    setEventos((evs) => evs.filter((e) => e.id !== id));
    setMenuOpen(null);
    if (detailEvent?.id === id) setDetailEvent(null);
  };

  const handleCreateEvento = (data: NovoEventoFormData) => {
    const parts = data.date.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    const newEvento: Evento = {
      id: Date.now(),
      title: data.title.trim(),
      time: data.startTime,
      duration: data.duration,
      instructor: data.instructor.trim(),
      location: data.location.trim(),
      type: data.type,
      day: d,
      month: m - 1,
      year: y,
      studentsCount: data.studentsCount ? Number(data.studentsCount) : undefined,
      description: data.description.trim() || undefined,
      color: data.color,
    };
    setEventos((prev) => [...prev, newEvento]);
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1600px] mx-auto pb-8"
    >
      {/* ── HEADER PRINCIPAL ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Agenda & Grade de Aulas</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              {eventos.length} agendamentos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedDay} de {MONTHS[viewMonth]} de {viewYear} · {kpiStats.total} compromissos no dia selecionado
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Alternador de Visão */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'day' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List size={13} /> Dia
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={13} /> Semana
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            onClick={handleResetToday}
          >
            <CalendarIcon size={14} className="text-slate-400" />
            <span>Hoje</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            onClick={() => {
              setModalDefaultDate(toISO(selectedDay, viewMonth, viewYear));
              setModalOpen(true);
            }}
          >
            <Plus size={14} />
            <span>Novo Evento</span>
          </button>
        </div>
      </header>

      {/* ── KPIs DE RESUMO ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Compromissos do Dia</span>
            <CalendarIcon size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{kpiStats.total}</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Aulas Coletivas</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{kpiStats.aulas}</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Personal Training</span>
            <Activity size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{kpiStats.personal}</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <div className="flex justify-between items-start text-xs text-slate-500 font-medium">
            <span>Avaliações Físicas</span>
            <CheckCircle2 size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{kpiStats.avaliacao}</div>
        </motion.div>
      </section>

      {/* ── PAINEL PRINCIPAL: CALENDÁRIO E VISÃO DE AGENDA ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* CALENDÁRIO LATERAL E FILTROS */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs p-4 flex flex-col justify-between self-start space-y-4">
          
          {/* Header do Mês */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-900">
              {MONTHS[viewMonth]} <span className="font-mono text-slate-400 font-normal">{viewYear}</span>
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={prevMonth} className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={nextMonth} className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 text-center">
            {DAYS_SHORT.map((d) => (
              <span key={d} className="text-[10px] font-mono font-medium text-slate-400 uppercase">{d}</span>
            ))}
          </div>

          {/* Grid de Dias */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarCells.map((day, i) => (
              <div key={i} className="aspect-square flex items-center justify-center relative">
                {day !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`relative w-7 h-7 rounded-md text-xs font-mono font-medium flex items-center justify-center transition-colors cursor-pointer ${
                      selectedDay === day && viewMode === 'day'
                        ? 'bg-slate-900 text-white font-semibold'
                        : isToday(day)
                        ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200/80'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                    {daysWithEvents.has(`${viewYear}-${viewMonth}-${day}`) && !(selectedDay === day && viewMode === 'day') && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Filtro de Categoria */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-2">
              <Filter size={12} />
              <span>Filtrar por tipo</span>
            </div>

            <button
              type="button"
              onClick={() => setFilterType('Todos')}
              className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'Todos' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Todos os tipos</span>
              </span>
              {filterType === 'Todos' && <span className="text-[10px] font-mono text-slate-400">Ativo</span>}
            </button>

            {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([key, cfg]) => (
              <button
                type="button"
                key={key}
                onClick={() => setFilterType(filterType === key ? 'Todos' : key)}
                className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === key ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.bar }} />
                  <span>{cfg.label}</span>
                </span>
                {filterType === key && <span className="text-[10px] font-mono text-slate-400">Ativo</span>}
              </button>
            ))}
          </div>

          {/* Ação rápida de agendamento */}
          <button
            type="button"
            onClick={() => openModalForDate(selectedDay, viewMonth, viewYear)}
            className="w-full py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Agendar na data selecionada</span>
          </button>
        </motion.div>

        {/* VISÃO DE CONTEÚDO (DIA OU SEMANA) */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col min-h-[460px]">
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
              onDayClick={(d) => {
                setSelectedDay(d.getDate());
                setViewMonth(d.getMonth());
                setViewYear(d.getFullYear());
                setViewMode('day');
              }}
              onNewEvent={(d) => openModalForDate(d.getDate(), d.getMonth(), d.getFullYear())}
              onDetail={setDetailEvent}
            />
          )}
        </motion.div>

      </section>

      {/* ── PAINEL LATERAL DE DETALHES (DRAWER) ── */}
      <AnimatePresence>
        {detailEvent && (
          <EventDetailDrawer
            event={detailEvent}
            typeConfig={typeConfig}
            onClose={() => setDetailEvent(null)}
            onDelete={deleteEvent}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL NOVO EVENTO ── */}
      <NovoEventoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateEvento}
        defaultDate={modalDefaultDate}
      />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   VISÃO DE DIA (DAY VIEW)
══════════════════════════════════════════════════ */
function DayView({
  selectedDay,
  viewMonth,
  viewYear,
  isToday,
  dayEvents,
  search,
  setSearch,
  filterType,
  setFilterType,
  typeConfig,
  onDelete,
  onDetail,
  onNewEvent,
  MONTHS,
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
    <div className="flex flex-col h-full">
      {/* Barra de Ferramentas da Visão */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {isToday(selectedDay) && viewMonth === new Date().getMonth() && viewYear === new Date().getFullYear()
              ? 'Agenda de Hoje'
              : `Agenda de ${selectedDay} de ${MONTHS[viewMonth]}`}
          </h2>
          <p className="text-xs text-slate-500">
            {dayEvents.length > 0 ? `${dayEvents.length} evento(s) listado(s)` : 'Nenhum agendamento cadastrado'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar agendamento..."
              className="w-full bg-slate-50 border border-slate-200/80 pl-8 pr-7 py-1 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos os tipos</option>
            <option value="aula">Aulas</option>
            <option value="personal">Personal</option>
            <option value="avaliacao">Avaliações</option>
            <option value="reuniao">Reuniões</option>
          </select>
        </div>
      </div>

      {/* Lista de Eventos */}
      <div className="p-4 flex-1">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center text-xs text-slate-500">
            <CalendarIcon size={22} className="text-slate-300 mb-2" />
            <p className="font-medium text-slate-700">
              {search || filterType !== 'Todos' ? 'Nenhum evento encontrado para estes filtros' : 'Nenhum compromisso nesta data'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              {search || filterType !== 'Todos'
                ? 'Tente ajustar os parâmetros de pesquisa.'
                : 'Selecione outra data no calendário ao lado ou adicione um novo evento.'}
            </p>
            {!search && filterType === 'Todos' && (
              <button
                type="button"
                onClick={onNewEvent}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus size={13} />
                <span>Adicionar evento</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {dayEvents.map((ev) => {
              const cfg = typeConfig[ev.type];
              return (
                <div
                  key={ev.id}
                  onClick={() => onDetail(ev)}
                  className="group relative flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  {/* Borda lateral de acento de cor */}
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                    style={{ backgroundColor: ev.color || cfg.bar }}
                  />

                  <div className="flex items-center gap-3 pl-2 min-w-0 flex-1">
                    <div className="text-left shrink-0">
                      <span className="text-xs font-mono font-semibold text-slate-900 block">{ev.time}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{ev.duration}</span>
                    </div>

                    <div className="w-px h-7 bg-slate-200/60 shrink-0 hidden sm:block" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {ev.title}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 truncate">
                        <span className="flex items-center gap-1 shrink-0">
                          <User size={11} className="text-slate-400" />
                          <span>{ev.instructor}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{ev.location}</span>
                        </span>
                        {ev.studentsCount !== undefined && (
                          <span className="flex items-center gap-1 shrink-0 text-slate-400">
                            <Users size={11} />
                            <span>{ev.studentsCount} inscritos</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onDetail(ev)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(ev.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Cancelar evento"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   VISÃO DE SEMANA (WEEK VIEW)
══════════════════════════════════════════════════ */
function WeekView({
  weekDates,
  weekEvents,
  isWeekToday,
  typeConfig,
  search,
  setSearch,
  onDayClick,
  onNewEvent,
  onDetail,
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
  const weekEnd = weekDates[6]!;

  const fmtRange = () => {
    const ms = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.getDate()} a ${weekEnd.getDate()} de ${ms[weekStart.getMonth()]}`;
    }
    return `${weekStart.getDate()} ${ms[weekStart.getMonth()]} - ${weekEnd.getDate()} ${ms[weekEnd.getMonth()]}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Grade Semanal</h2>
          <p className="text-xs text-slate-500">{fmtRange()}</p>
        </div>

        <div className="relative w-48">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar semana..."
            className="w-full bg-slate-50 border border-slate-200/80 pl-8 pr-3 py-1 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px] divide-x divide-slate-100 h-full">
          {weekDates.map((d) => {
            const key = d.toISOString().slice(0, 10);
            const evs = weekEvents[key] ?? [];
            const todayDay = isWeekToday(d);

            return (
              <div key={key} className="flex flex-col min-h-[400px]">
                <button
                  type="button"
                  onClick={() => onDayClick(d)}
                  className={`p-2 text-center border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer w-full ${
                    todayDay ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <span className="text-[10px] font-mono font-medium text-slate-400 uppercase block">
                    {DAYS_SHORT[d.getDay()]}
                  </span>
                  <span className={`text-xs font-mono font-semibold inline-block px-1.5 py-0.2 rounded mt-0.5 ${
                    todayDay ? 'bg-slate-900 text-white' : 'text-slate-800'
                  }`}>
                    {d.getDate()}
                  </span>
                </button>

                <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
                  {evs.map((ev) => {
                    const cfg = typeConfig[ev.type];
                    return (
                      <div
                        key={ev.id}
                        onClick={() => onDetail(ev)}
                        className="p-1.5 rounded border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors cursor-pointer text-left"
                        style={{ borderLeft: `3px solid ${ev.color || cfg.bar}` }}
                      >
                        <p className="text-[11px] font-medium text-slate-900 truncate">{ev.title}</p>
                        <p className="text-[10px] font-mono text-slate-500">{ev.time}</p>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => onNewEvent(d)}
                    className="w-full py-1 rounded border border-dashed border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer mt-1"
                  >
                    <Plus size={10} /> Novo
                  </button>
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
   PAINEL LATERAL DE DETALHES (DRAWER SLIDE-OVER)
══════════════════════════════════════════════════ */
function EventDetailDrawer({
  event,
  typeConfig,
  onClose,
  onDelete,
}: {
  event: Evento;
  typeConfig: TypeConfigMap;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const cfg = typeConfig[event.type];

  return (
    <>
      {/* Backdrop de Fundo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs"
      />

      {/* Painel Deslizante */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200/90 shadow-xl flex flex-col"
      >
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {cfg.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo dos Detalhes */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{event.title}</h2>
            <p className="text-slate-500 mt-0.5">
              Data: <span className="font-mono text-slate-800">{event.day}/{event.month + 1}/{event.year}</span>
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Clock size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Horário</span>
                <span className="font-mono font-medium">{event.time} ({event.duration})</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <User size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Instrutor Responsável</span>
                <span className="font-medium">{event.instructor}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Localização</span>
                <span className="font-medium">{event.location}</span>
              </div>
            </div>

            {event.studentsCount !== undefined && (
              <div className="flex items-center gap-2.5 text-slate-700">
                <Users size={14} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Participantes</span>
                  <span className="font-medium">{event.studentsCount} inscritos</span>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-slate-400 block text-[10px] mb-1">Anotações & Observações</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              onDelete(event.id);
              onClose();
            }}
            className="flex-1 py-1.5 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Cancelar Evento</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.aside>
    </>
  );
}