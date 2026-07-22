import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  Send,
  Users,
  DollarSign,
  BarChart2,
  Award,
  Video,
  X,
  Paperclip,
  Play,
  Check,
  Inbox,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

/* ── Contratos de Dados da API / Backend ── */
export type FaqCategory = 'Todos' | 'Geral' | 'Alunos' | 'Treinos & Dietas' | 'Financeiro';
export type TicketStatus = 'Em Atendimento' | 'Aguardando Aluno' | 'Resolvido';
export type TicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface FaqItem {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
  tags?: string[];
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'agent';
  senderName: string;
  avatar?: string;
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface VideoChapter {
  time: string;
  title: string;
}

export interface VideoTutorial {
  id: number;
  title: string;
  duration: string;
  category: string;
  views: string;
  description: string;
  chapters?: VideoChapter[];
}

export interface SystemServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: string;
}

/* ── Mapeamento de Badges de Status ── */
const ticketStatusConfig: Record<TicketStatus, { label: string; style: string; dot: string }> = {
  'Em Atendimento': { label: 'Em Atendimento', style: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-600' },
  'Aguardando Aluno': { label: 'Aguardando Resposta', style: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-600' },
  'Resolvido': { label: 'Resolvido', style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-600' },
};

const ticketPriorityConfig: Record<TicketPriority, string> = {
  Baixa: 'text-slate-500',
  Média: 'text-blue-600',
  Alta: 'text-amber-600',
  Urgente: 'text-rose-600',
};

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

const REPORT_TYPES: { id: FaqCategory; label: string; icon: React.ElementType }[] = [
  { id: 'Todos', label: 'Tudo', icon: BarChart2 },
  { id: 'Geral', label: 'Geral', icon: HelpCircle },
  { id: 'Alunos', label: 'Alunos', icon: Users },
  { id: 'Treinos & Dietas', label: 'Prescrição', icon: Award },
  { id: 'Financeiro', label: 'Financeiro', icon: DollarSign },
];

export default function Help() {
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'videos'>('faq');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('Todos');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [faqFeedback, setFaqFeedback] = useState<Record<number, 'yes' | 'no'>>({});

  /* ── Estados para Conexão com API (Zerados por Padrão) ── */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [ticketsList, setTicketsList] = useState<Ticket[]>([]);
  const [videoList, setVideoList] = useState<VideoTutorial[]>([]);
  const [systemServices, setSystemServices] = useState<SystemServiceStatus[]>([]);

  // Modais e Drawers
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newReplyMessage, setNewReplyMessage] = useState('');

  // Form de novo chamado
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Dúvida de Uso');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('Média');
  const [ticketMessage, setTicketMessage] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Atalho de Teclado '/' */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (e.key === '/' && activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ── Buscar Dados do Backend ── */
  useEffect(() => {
    async function fetchHelpData() {
      setIsLoading(true);
      setError(null);

      try {
        /* TODO: Conectar com suas rotas do Backend:
           const [faqsRes, ticketsRes, videosRes, servicesRes] = await Promise.all([
             api.get('/support/faqs'),
             api.get('/support/tickets'),
             api.get('/support/videos'),
             api.get('/support/system-status')
           ]);
        */
        await new Promise((r) => setTimeout(r, 300)); // Simulação de Latência
      } catch (err) {
        setError('Falha ao carregar a central de ajuda.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHelpData();
  }, []);

  /* Filtro de Perguntas Frequentes */
  const filteredFaqs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return faqList.filter((faq) => {
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.tags?.some((tag) => tag.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'Todos' || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [faqList, search, selectedCategory]);

  /* Filtro de Vídeos */
  const filteredVideos = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return videoList;
    return videoList.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  }, [videoList, search]);

  /* Handler para Criar Chamado via API */
  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      /* TODO: Conectar ao Endpoint da API:
         await api.post('/support/tickets', {
           subject: ticketSubject,
           category: ticketCategory,
           priority: ticketPriority,
           message: ticketMessage
         });
      */
      await new Promise((r) => setTimeout(r, 400));

      const newTicket: Ticket = {
        id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: ticketSubject,
        category: ticketCategory,
        status: 'Em Atendimento',
        priority: ticketPriority,
        updatedAt: 'Agora mesmo',
        messages: [
          {
            id: `m-${Date.now()}`,
            sender: 'user',
            senderName: 'Você',
            message: ticketMessage,
            timestamp: 'Agora mesmo',
          },
        ],
      };

      setTicketsList([newTicket, ...ticketsList]);
      setIsTicketModalOpen(false);
      setTicketSubject('');
      setTicketMessage('');
      setActiveTab('tickets');
    } catch (err) {
      setError('Erro ao enviar o chamado de suporte.');
    } finally {
      setIsSaving(false);
    }
  };

  /* Handler para Responder Chamado */
  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyMessage.trim() || !selectedTicket) return;

    setIsSaving(true);

    try {
      /* TODO: Conectar ao Endpoint da API:
         await api.post(`/support/tickets/${selectedTicket.id}/messages`, {
           message: newReplyMessage
         });
      */
      await new Promise((r) => setTimeout(r, 300));

      const newMsg: TicketMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        senderName: 'Você',
        message: newReplyMessage,
        timestamp: 'Agora mesmo',
      };

      const updated = ticketsList.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: 'Em Atendimento' as TicketStatus,
            updatedAt: 'Agora mesmo',
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      });

      setTicketsList(updated);
      setSelectedTicket({
        ...selectedTicket,
        status: 'Em Atendimento',
        updatedAt: 'Agora mesmo',
        messages: [...selectedTicket.messages, newMsg],
      });
      setNewReplyMessage('');
    } catch (err) {
      setError('Falha ao enviar resposta.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1600px] mx-auto pb-8"
    >
      {/* ── HEADER SUPERIOR ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Central de Ajuda & Suporte</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              SLA Médio ~15min
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Base de conhecimento, vídeos instrutivos e abertura de chamados técnicos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsStatusModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Status da Plataforma</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTicketModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Abrir Chamado</span>
          </button>
        </div>
      </header>

      {/* ── MENSAGEM DE ERRO NA API ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 bg-rose-50 border border-rose-200/80 rounded-lg text-xs text-rose-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-800 cursor-pointer"
            >
              <XCircle size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BARRA DE BUSCA RÁPIDA ── */}
      <motion.div variants={itemVariants} className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite termos de busca para pesquisar artigos ou tutoriais... (pressione '/')"
            className="w-full bg-slate-50 border border-slate-200/80 pl-9 pr-20 py-2 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-medium"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200/80 rounded shadow-2xs pointer-events-none">
            /
          </kbd>
        </div>
      </motion.div>

      {/* ── SELETOR DE ABAS DA CENTRAL ── */}
      <motion.div variants={itemVariants} className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer ${
            activeTab === 'faq' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Base de Conhecimento
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'tickets' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Meus Chamados</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200/60">
            {ticketsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer ${
            activeTab === 'videos' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vídeo-Aulas
        </button>
      </motion.div>

      {/* ── CONTEÚDO DAS ABAS ── */}
      <AnimatePresence mode="wait">
        
        {/* ABA 1: BASE DE CONHECIMENTO & FAQ */}
        {activeTab === 'faq' && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-slate-200/80 rounded-xl shadow-2xs p-5 space-y-4"
          >
            {/* Header e Categorias */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Perguntas Frequentes (FAQ)</h2>
                <p className="text-xs text-slate-500">Respostas diretas e tutoriais passo a passo</p>
              </div>

              {/* Categorias */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-xs font-medium self-start sm:self-auto overflow-x-auto">
                {REPORT_TYPES.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedCategory(id)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap text-xs ${
                      selectedCategory === id
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Accordion */}
            <div className="space-y-2 pt-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-xs text-slate-400 gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Carregando perguntas frequentes...</span>
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-slate-400">
                  <Inbox size={22} className="text-slate-300 mb-1.5" />
                  <p className="font-medium text-slate-600">Nenhum artigo encontrado</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tente utilizar outros termos de busca.</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  const feedback = faqFeedback[faq.id];

                  return (
                    <div
                      key={faq.id}
                      className="border border-slate-200/80 rounded-lg overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-900"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle size={14} className="text-slate-400 shrink-0" />
                          <span>{faq.question}</span>
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="p-3 pt-2 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2">
                          <p>{faq.answer}</p>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Este artigo ajudou você?</span>
                            <div className="flex items-center gap-2">
                              {feedback ? (
                                <span className="text-emerald-700 font-medium flex items-center gap-1">
                                  <Check size={12} /> Obrigado pelo feedback!
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setFaqFeedback((p) => ({ ...p, [faq.id]: 'yes' }))}
                                    className="hover:text-slate-800 transition-colors cursor-pointer"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFaqFeedback((p) => ({ ...p, [faq.id]: 'no' }))}
                                    className="hover:text-slate-800 transition-colors cursor-pointer"
                                  >
                                    Não
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ABA 2: MEUS CHAMADOS */}
        {activeTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Seus Chamados de Suporte</h2>
                <p className="text-xs text-slate-500">Histórico e tratativa direta com os especialistas</p>
              </div>

              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus size={13} />
                <span>Novo Chamado</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Carregando seus chamados...</span>
                </div>
              ) : ticketsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <Inbox size={22} className="text-slate-300 mb-1.5" />
                  <p className="font-medium text-slate-700">Nenhum chamado aberto</p>
                  <p className="text-[11px] mt-0.5">Caso precise de auxílio técnico, clique no botão acima.</p>
                </div>
              ) : (
                ticketsList.map((ticket) => {
                  const status = ticketStatusConfig[ticket.status];
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-3 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-slate-500">{ticket.id}</span>
                          <span className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {ticket.subject}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {ticket.category} • Atualizado: {ticket.updatedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono font-medium ${ticketPriorityConfig[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${status.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* ABA 3: VÍDEO-AULAS */}
        {activeTab === 'videos' && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Buscando vídeos...</span>
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="col-span-full py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                  <Video size={22} className="text-slate-300 mb-1.5" />
                  <p className="font-medium text-slate-700">Nenhum vídeo-tutorial encontrado</p>
                  <p className="text-[11px] mt-0.5">Tente buscar por outras palavras-chave.</p>
                </div>
              ) : (
                filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-2xs cursor-pointer flex flex-col justify-between space-y-2 group"
                  >
                    <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
                      <Play size={24} className="group-hover:scale-110 transition-transform text-white fill-white" />
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono font-medium text-slate-200">
                        {video.duration}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono text-slate-400 block">{video.category}</span>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{video.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── DRAWER SLIDE-OVER DE CHAT DO TICKET ── */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200/90 shadow-xl flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900">{selectedTicket.id}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 truncate mt-0.5">{selectedTicket.subject}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Histórico de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 text-xs">
                {selectedTicket.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-mono text-slate-400 mb-1">{msg.senderName} • {msg.timestamp}</span>
                      <div className={`p-2.5 rounded-lg max-w-[85%] leading-relaxed ${
                        isUser ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form de Resposta */}
              <form onSubmit={handleAddReply} className="p-3 border-t border-slate-100 bg-white space-y-2">
                <textarea
                  rows={2}
                  value={newReplyMessage}
                  onChange={(e) => setNewReplyMessage(e.target.value)}
                  placeholder="Escreva sua resposta para o suporte..."
                  className="form-input resize-none"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => alert('Anexo selecionado')}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Paperclip size={14} />
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !newReplyMessage.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <Send size={13} />
                    <span>Enviar</span>
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MODAL NOVO CHAMADO ── */}
      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTicketModalOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="relative z-10 w-full max-w-md bg-white border border-slate-200/90 rounded-xl shadow-xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Abrir Novo Chamado</h2>
                  <p className="text-xs text-slate-500">A equipe responderá em breve</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSendTicket} className="p-4 space-y-3.5 text-xs">
                <div>
                  <label className="form-label">Assunto do Chamado *</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Descreva resumidamente o motivo..."
                    className="form-input font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Categoria *</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="form-input cursor-pointer"
                    >
                      <option value="Dúvida de Uso">Dúvida de Uso</option>
                      <option value="Problema Técnico">Problema Técnico</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Sugestão">Sugestão</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Prioridade *</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as TicketPriority)}
                      className="form-input font-mono cursor-pointer"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Descrição Detalhada *</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Especifique o que ocorreu ou qual ajuda você precisa..."
                    className="form-input resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="py-1.5 px-3 font-medium text-slate-700 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 py-1.5 px-4 font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    {isSaving ? <span>Enviando...</span> : <span>Enviar Chamado</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL STATUS DO SISTEMA ── */}
      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStatusModalOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="relative z-10 w-full max-w-md bg-white border border-slate-200/90 rounded-xl shadow-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-semibold text-slate-900">Saúde dos Serviços</h3>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {systemServices.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-4">Nenhum serviço monitorado.</p>
                ) : (
                  systemServices.map((srv) => (
                    <div key={srv.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-800">{srv.name}</span>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-slate-400">{srv.latency}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                          Operacional
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL PLAYER DE VÍDEO ── */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative z-10 w-full max-w-2xl bg-white border border-slate-200/90 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="aspect-video bg-slate-950 flex items-center justify-center relative text-white">
                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black rounded text-white transition-colors cursor-pointer z-10"
                >
                  <X size={16} />
                </button>
                <div className="text-center space-y-2">
                  <Play size={40} className="mx-auto text-blue-500 fill-blue-500/20" />
                  <p className="text-xs font-mono text-slate-300">Reproduzindo: {selectedVideo.title}</p>
                </div>
              </div>

              <div className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                  <span>{selectedVideo.category}</span>
                  <span>{selectedVideo.duration}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{selectedVideo.title}</h3>
                <p className="text-slate-600 leading-relaxed">{selectedVideo.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}