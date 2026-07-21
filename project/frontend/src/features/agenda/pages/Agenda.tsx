import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from 'lucide-react';

interface Evento {
  id: number; title: string; time: string; duration: string;
  instructor: string; location: string;
  type: 'aula' | 'avaliacao' | 'reuniao' | 'personal'; day: number;
}

const eventos: Evento[] = [
  { id:  1, title: 'Yoga Flow',             time: '07:00', duration: '1h',    instructor: 'Maria Clara',    location: 'Sala A',       type: 'aula',      day: 20 },
  { id:  2, title: 'Personal Training',     time: '09:00', duration: '1h',    instructor: 'Carlos Eduardo', location: 'Sala B',       type: 'personal',  day: 20 },
  { id:  3, title: 'Avaliação Física',      time: '10:30', duration: '45min', instructor: 'Fernanda Lima',  location: 'Sala C',       type: 'avaliacao', day: 20 },
  { id:  4, title: 'Pilates',               time: '15:00', duration: '1h',    instructor: 'Juliana Torres', location: 'Sala A',       type: 'aula',      day: 20 },
  { id:  5, title: 'Reunião de Equipe',     time: '17:00', duration: '30min', instructor: 'Admin',          location: 'Sala Reunião', type: 'reuniao',   day: 20 },
  { id:  6, title: 'Musculação Avançada',   time: '08:00', duration: '1h30',  instructor: 'Roberto Alves',  location: 'Sala B',       type: 'aula',      day: 21 },
  { id:  7, title: 'Yoga Flow',             time: '07:00', duration: '1h',    instructor: 'Maria Clara',    location: 'Sala A',       type: 'aula',      day: 22 },
  { id:  8, title: 'Personal Training',     time: '11:00', duration: '1h',    instructor: 'Carlos Eduardo', location: 'Sala B',       type: 'personal',  day: 22 },
  { id:  9, title: 'Avaliação Nutricional', time: '14:00', duration: '45min', instructor: 'Dra. Renata',    location: 'Sala C',       type: 'avaliacao', day: 23 },
  { id: 10, title: 'Pilates Iniciante',     time: '09:00', duration: '1h',    instructor: 'Juliana Torres', location: 'Sala A',       type: 'aula',      day: 24 },
  { id: 11, title: 'Yoga Flow',             time: '07:00', duration: '1h',    instructor: 'Maria Clara',    location: 'Sala A',       type: 'aula',      day: 25 },
  { id: 12, title: 'Reunião Comercial',     time: '16:00', duration: '1h',    instructor: 'Admin',          location: 'Sala Reunião', type: 'reuniao',   day: 25 },
];

const typeConfig = {
  aula:      { label: 'Aula',      bg: 'bg-[#dbeafe]', text: 'text-[#1d4ed8]', bar: '#2563eb', dot: 'bg-[#2563eb]'  },
  personal:  { label: 'Personal',  bg: 'bg-[#ede9fe]', text: 'text-[#6d28d9]', bar: '#7c3aed', dot: 'bg-violet-500' },
  avaliacao: { label: 'Avaliação', bg: 'bg-amber-50',  text: 'text-amber-700', bar: '#d97706', dot: 'bg-amber-400'  },
  reuniao:   { label: 'Reunião',   bg: 'bg-[#f1f5f9]', text: 'text-[#64748b]', bar: '#94a3b8', dot: 'bg-[#94a3b8]' },
};

const DAYS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Agenda() {
  const today = new Date();
  const [viewMonth,   setViewMonth]   = useState(today.getMonth());
  const [viewYear,    setViewYear]    = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const cells     = buildCalendar(viewYear, viewMonth);
  const eventDays = new Set(eventos.map(e => e.day));
  const dayEvents = eventos.filter(e => e.day === selectedDay).sort((a, b) => a.time.localeCompare(b.time));

  const prevMonth = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);
  const isToday   = (d: number) => d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[1.05rem] font-bold text-[#0f172a] tracking-tight">Agenda</h2>
          <p className="text-[#64748b] text-sm mt-0.5">
            {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''} em {selectedDay} de {MONTHS[viewMonth]}
          </p>
        </div>
        <button className="flex items-center gap-1.5 py-2 px-4 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.99] transition-all duration-200 border-none cursor-pointer shrink-0">
          <Plus size={14} /> Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden self-start">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f1f5f9]">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors cursor-pointer border-none bg-transparent">
              <ChevronLeft size={15} />
            </button>
            <p className="text-sm font-bold text-[#0f172a]">{MONTHS[viewMonth]} {viewYear}</p>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors cursor-pointer border-none bg-transparent">
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[0.62rem] font-bold text-[#94a3b8] uppercase tracking-wide py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
            {cells.map((day, i) => (
              <div key={i} className="aspect-square flex items-center justify-center">
                {day !== null && (
                  <button
                    onClick={() => setSelectedDay(day)}
                    className={`relative w-8 h-8 rounded-full text-xs font-medium flex flex-col items-center justify-center transition-all duration-150 cursor-pointer border-none ${
                      selectedDay === day
                        ? 'bg-[#2563eb] text-white font-bold'
                        : isToday(day)
                        ? 'font-bold text-[#2563eb] bg-transparent'
                        : 'text-[#334155] hover:bg-[#f1f5f9] bg-transparent'
                    }`}
                    style={isToday(day) && selectedDay !== day ? { boxShadow: '0 0 0 1.5px #2563eb' } : {}}
                  >
                    {day}
                    {eventDays.has(day) && selectedDay !== day && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2563eb] opacity-50" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-[#f1f5f9] flex flex-wrap gap-x-3 gap-y-1.5">
            {Object.entries(typeConfig).map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <span className="text-xs text-[#64748b]">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events list */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f1f5f9]">
            <p className="text-sm font-bold text-[#0f172a]">
              {isToday(selectedDay) && viewMonth === today.getMonth() ? 'Hoje' : `${selectedDay} de ${MONTHS[viewMonth]}`}
            </p>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              {dayEvents.length > 0 ? `${dayEvents.length} evento${dayEvents.length !== 1 ? 's' : ''} agendado${dayEvents.length !== 1 ? 's' : ''}` : 'Sem eventos agendados'}
            </p>
          </div>

          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-11 h-11 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center mb-3">
                <Clock size={18} className="text-[#cbd5e1]" />
              </div>
              <p className="text-sm font-semibold text-[#334155]">Nenhum evento</p>
              <p className="text-xs text-[#94a3b8] mt-1">Selecione outro dia ou adicione um evento.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f8fafc]">
              {dayEvents.map(ev => {
                const cfg = typeConfig[ev.type];
                return (
                  <div key={ev.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#f8fafc] transition-colors group cursor-pointer">
                    {/* Time */}
                    <div className="text-right shrink-0 pt-0.5 w-10">
                      <p className="text-sm font-bold text-[#0f172a]">{ev.time}</p>
                      <p className="text-xs text-[#94a3b8]">{ev.duration}</p>
                    </div>

                    {/* Color bar */}
                    <div className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: cfg.bar }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#0f172a]">{ev.title}</p>
                        <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-[#475569]">
                          <User size={10} className="text-[#94a3b8]" /> {ev.instructor}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                          <MapPin size={10} /> {ev.location}
                        </span>
                      </div>
                    </div>

                    {/* Edit */}
                    <button className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-[#64748b] hover:text-[#2563eb] transition-all cursor-pointer border-none bg-transparent pt-0.5 shrink-0">
                      Editar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
