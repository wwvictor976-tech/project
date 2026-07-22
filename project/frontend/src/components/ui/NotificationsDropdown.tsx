import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  UserPlus, 
  DollarSign, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  X, 
  ChevronRight,
  Trash2,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type NotificationType = 'enrollment' | 'payment' | 'alert' | 'renewal' | 'system';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'enrollment', title: 'Nova matrícula', desc: 'Ana Souza se matriculou no Plano Profissional', time: 'há 5 min', read: false },
  { id: 2, type: 'payment', title: 'Pagamento recebido', desc: 'R$ 299,00 confirmado — Bruno Lima', time: 'há 2h', read: false },
  { id: 3, type: 'alert', title: 'Aula cancelada', desc: 'Personal Training das 09h foi cancelado', time: 'há 4h', read: false },
  { id: 4, type: 'renewal', title: 'Renovação aprovada', desc: 'Carla Mendes renovou o Plano Corporativo', time: 'ontem', read: true },
  { id: 5, type: 'system', title: 'Atualização do sistema', desc: 'Versão 2.1.0 disponível para o seu painel', time: '2 dias', read: true },
];

/* ── Mapeamento Estrito de Estilos e Ícones Sóbrios ── */
const TYPE_CONFIG: Record<
  NotificationType, 
  { icon: React.ElementType; badgeBg: string; dotBg: string; actionText: string }
> = {
  enrollment: {
    icon: UserPlus,
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/70',
    dotBg: 'bg-blue-600',
    actionText: 'Ver Aluno',
  },
  payment: {
    icon: DollarSign,
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    dotBg: 'bg-emerald-600',
    actionText: 'Ver Comprovante',
  },
  alert: {
    icon: AlertCircle,
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/70',
    dotBg: 'bg-rose-600',
    actionText: 'Ver Agenda',
  },
  renewal: {
    icon: RefreshCw,
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    dotBg: 'bg-indigo-600',
    actionText: 'Ver Contrato',
  },
  system: {
    icon: Zap,
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/70',
    dotBg: 'bg-amber-600',
    actionText: 'Detalhes',
  },
};

interface Props {
  onCountChange?: (count: number) => void;
}

export function NotificationsDropdown({ onCountChange }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    onCountChange?.(unreadCount);
  }, [unreadCount, onCountChange]);

  /* Fechar ao clicar fora */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const dismiss = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      
      {/* ── BOTÃO TRIGGER ── */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`
          relative p-1.5 rounded-lg text-slate-500 transition-colors cursor-pointer focus:outline-none
          ${open ? 'bg-slate-100 text-slate-900' : 'hover:text-slate-900 hover:bg-slate-100/80'}
        `}
        aria-label={`Notificações (${unreadCount} não lidas)`}
        aria-expanded={open}
      >
        <Bell size={18} />

        {/* Badge de Alerta Não Lido */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 ring-2 ring-white" />
          </span>
        )}
      </button>

      {/* ── DROPDOWN FLUTUANTE ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-[calc(100%+6px)] w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50 flex flex-col"
          >
            {/* ── CABEÇALHO ── */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-xs">Notificações</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200/60 rounded">
                      {unreadCount} novas
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100"
                    >
                      <CheckCheck size={13} className="text-slate-400" />
                      <span>Marcar lidas</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      title="Limpar tudo"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── SELETOR DE ABAS ── */}
              <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-1 rounded text-center transition-all cursor-pointer text-[11px] ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('unread')}
                  className={`flex-1 py-1 rounded text-center transition-all cursor-pointer text-[11px] ${
                    activeTab === 'unread'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Não lidas ({unreadCount})
                </button>
              </div>
            </div>

            {/* ── LISTA DE NOTIFICAÇÕES ── */}
            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 scrollbar-fine">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <Inbox size={20} className="text-slate-300 mb-1.5" />
                  <p className="text-xs font-medium text-slate-700">Nenhuma notificação</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeTab === 'unread' 
                      ? 'Você leu todos os avisos recentes.' 
                      : 'Sua caixa de entrada está limpa.'}
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((item) => {
                    const config = TYPE_CONFIG[item.type];
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => markAsRead(item.id)}
                        className={`
                          group relative flex items-start gap-3 p-3 transition-colors cursor-pointer text-xs
                          ${!item.read ? 'bg-slate-50/90' : 'bg-white hover:bg-slate-50/50'}
                        `}
                      >
                        {/* Ícone Indicador */}
                        <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${config.badgeBg} mt-0.5`}>
                          <Icon size={14} />
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-xs font-medium truncate ${item.read ? 'text-slate-700' : 'text-slate-900 font-semibold'}`}>
                              {item.title}
                            </p>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                              {!item.read && (
                                <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg}`} />
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                            {item.desc}
                          </p>

                          {/* Link / Ação Contextual */}
                          <div className="mt-1.5 flex items-center gap-0.5 text-[10px] font-medium text-blue-600 hover:text-blue-700">
                            <span>{config.actionText}</span>
                            <ChevronRight size={11} />
                          </div>
                        </div>

                        {/* Botão Dispensar */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 rounded transition-opacity shrink-0"
                          aria-label="Remover notificação"
                        >
                          <X size={13} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* ── RODAPÉ ── */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Fechar avisos
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}