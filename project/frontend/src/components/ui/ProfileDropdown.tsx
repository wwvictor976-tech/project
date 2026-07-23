import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  User,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/app/auth';

export function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  /* Fechar ao clicar fora */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = useCallback(() => {
    setOpen(false);
    logout();
    navigate(ROUTES.root);
  }, [logout, navigate]);

  const menuItems = [
    {
      icon: User,
      label: 'Meu perfil',
      action: () => {
        setOpen(false);
        navigate(ROUTES.perfil);
      },
    },
    {
      icon: Settings,
      label: 'Configurações',
      action: () => {
        setOpen(false);
        navigate(ROUTES.configuracoes);
      },
    },
    {
      icon: Shield,
      label: 'Segurança',
      action: () => {
        setOpen(false);
        navigate(`${ROUTES.configuracoes}#seguranca`);
      },
    },
    {
      icon: ExternalLink,
      label: 'Central de Suporte',
      action: () => {
        setOpen(false);
        navigate(ROUTES.ajuda);
      },
    },
  ];

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      
      {/* ── BOTÃO TRIGGER ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none
          ${open ? 'bg-slate-100' : 'hover:bg-slate-100/80'}
        `}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar Sóbrio */}
        <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-100 text-[11px] font-mono font-semibold shrink-0">
          AD
        </div>

        <div className="hidden sm:block text-left leading-tight">
          <p className="text-xs font-medium text-slate-900">Perfil</p>
          <p className="text-[10px] text-slate-500 font-mono">Administrador</p>
        </div>

        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-slate-700' : ''}`}
        />
      </button>

      {/* ── DROPDOWN FLUTUANTE ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-[calc(100%+6px)] w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden z-50 flex flex-col text-xs"
          >
            {/* ── DADOS DO USUÁRIO & PLANO ── */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-xs font-mono font-semibold shrink-0">
                  AD
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">Perfil</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono">Dados da conta</p>
                </div>
              </div>

              {/* Tag do Plano Atual */}
              <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-lg p-2 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Shield size={13} className="text-indigo-600" />
                  <span className="font-medium text-slate-800">Plano Corporativo</span>
                </div>
                <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                  Ativo
                </span>
              </div>
            </div>

            {/* ── LINKS DO MENU ── */}
            <div className="p-1 space-y-0.5">
              {menuItems.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 rounded-md transition-colors cursor-pointer"
                >
                  <Icon size={14} className="text-slate-400 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* ── LOGOUT ── */}
            <div className="p-1 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              >
                <LogOut size={14} className="shrink-0" />
                <span>Sair da conta</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}