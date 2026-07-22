import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Building2,
  Globe,
  Laptop,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  Inbox,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/app/auth';

/* ── Contratos de Dados da API / Backend ── */
export type ProfileTab = 'dados' | 'seguranca' | 'notificacoes';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  website: string;
  bio: string;
  avatarUrl?: string;
  verified: boolean;
}

export interface NotificationSettings {
  novaMatricula: boolean;
  pagamento: boolean;
  cancelamento: boolean;
  relatorioSemanal: boolean;
  marketingEmail: boolean;
  sms: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
  isMobile: boolean;
}

/* ── Configuração Tipada para Campos de Notificação ── */
const NOTIFICATION_FIELDS: Array<{
  key: keyof NotificationSettings;
  label: string;
  desc: string;
}> = [
  { key: 'novaMatricula', label: 'Nova Matrícula Realizada', desc: 'Alertas imediatos ao registrar um novo aluno.' },
  { key: 'pagamento', label: 'Confirmação de Pagamento', desc: 'Notificação de mensalidade ou plano liquidado.' },
  { key: 'cancelamento', label: 'Cancelamentos & Churn', desc: 'Alerta quando uma assinatura for encerrada.' },
  { key: 'relatorioSemanal', label: 'Relatório Semanal por E-mail', desc: 'Resumo em PDF entregue toda segunda-feira.' },
  { key: 'marketingEmail', label: 'Atualizações da Plataforma', desc: 'Avisos de novos recursos e melhorias do sistema.' },
  { key: 'sms', label: 'Alertas Urgentes via SMS', desc: 'Avisos críticos diretamente no seu telefone.' },
];

/* ── Componente de Alternador (Toggle Switch) ── */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-slate-900' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-2xs transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/* ── Animações ── */
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

export default function Perfil() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('dados');

  /* ── Estados de Controle da API ── */
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Formulários e Dados do Usuário (Iniciam Zerados) ── */
  const [profile, setProfile] = useState<UserProfileData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    location: '',
    website: '',
    bio: '',
    verified: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    novaMatricula: false,
    pagamento: false,
    cancelamento: false,
    relatorioSemanal: false,
    marketingEmail: false,
    sms: false,
  });

  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  /* ── Efeito para Carregar Dados do Backend ── */
  useEffect(() => {
    async function fetchProfileData() {
      setIsLoading(true);
      setError(null);

      try {
        await new Promise((r) => setTimeout(r, 300)); // Simulação de Latência

        if (user) {
          const u = user as Record<string, any>;
          setProfile((prev) => ({
            ...prev,
            id: u.id || '',
            name: u.name || '',
            email: u.email || '',
            role: u.role || 'Usuário',
          }));
        }
      } catch (err) {
        setError('Não foi possível carregar as informações do perfil.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [user]);

  /* ── Handlers de Submissão de Formulários ── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError('Falha ao atualizar dados do perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError('Falha ao alterar senha. Verifique a senha atual.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 300));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError('Falha ao salvar preferências de notificação.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      setError('Falha ao encerrar a sessão selecionada.');
    }
  };

  /* Gerador de Iniciais Limpo */
  const userInitials = profile.name
    ? profile.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'US';

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: 'dados', label: 'Dados Pessoais', icon: User },
    { id: 'seguranca', label: 'Segurança & Acessos', icon: Shield },
    { id: 'notificacoes', label: 'Notificações & Preferências', icon: Bell },
  ];

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
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Meu Perfil</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              {profile.role || 'Conta de Usuário'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie suas informações pessoais, credenciais de acesso e preferências da conta.
          </p>
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

      {/* ── CARD RESUMO DO PERFIL ── */}
      <motion.section variants={itemVariants} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          
          {/* Avatar do Usuário */}
          <div className="relative shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-14 h-14 rounded-lg object-cover border border-slate-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-mono font-bold text-lg">
                {userInitials}
              </div>
            )}
            <button
              type="button"
              title="Alterar foto de perfil"
              onClick={() => alert('Selecione um arquivo de imagem')}
              className="absolute -bottom-1 -right-1 p-1 bg-white border border-slate-200/90 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Camera size={12} />
            </button>
          </div>

          {/* Informações Básicas */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">
              {isLoading ? 'Carregando perfil...' : profile.name || 'Nome não informado'}
            </h2>
            <p className="text-xs text-slate-500 font-mono truncate">{profile.email || 'email@dominio.com'}</p>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                <Shield size={11} className="text-slate-500" /> {profile.role || 'Usuário'}
              </span>
              {profile.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 size={11} /> Conta Verificada
                </span>
              )}
            </div>
          </div>

        </div>
      </motion.section>

      {/* ── SELETOR DE ABAS ── */}
      <motion.div variants={itemVariants} className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium max-w-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── CONTEÚDO DAS ABAS ── */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: DADOS PESSOAIS */}
        {activeTab === 'dados' && (
          <motion.form
            key="dados"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSaveProfile}
            className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-4 max-w-4xl"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Informações Cadastrais</h3>
              <p className="text-xs text-slate-500">Atualize seus dados pessoais e dados de contato do sistema.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2">
              <div className="space-y-1">
                <label htmlFor="nome" className="form-label">Nome Completo</label>
                <div className="relative">
                  <User size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="nome"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="form-input pl-8 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="form-label">Endereço de E-mail</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    placeholder="seu@email.com"
                    className="form-input pl-8 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="telefone" className="form-label">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="telefone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="form-input pl-8 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="cargo" className="form-label">Cargo / Função</label>
                <div className="relative">
                  <Building2 size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="cargo"
                    type="text"
                    value={profile.role}
                    onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
                    placeholder="Ex: Gestor, Nutricionista..."
                    className="form-input pl-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="cidade" className="form-label">Cidade / Estado</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="cidade"
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Ex: São Paulo, SP"
                    className="form-input pl-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="site" className="form-label">Website / Link Público</label>
                <div className="relative">
                  <Globe size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    id="site"
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://suaempresa.com"
                    className="form-input pl-8 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="form-label">Biografia / Resumo do Perfil</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Breve apresentação sobre você ou seu perfil profissional..."
                className="form-input resize-none"
              />
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs ${
                  saveSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Alterações salvas!</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Salvar alterações</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* TAB 2: SEGURANÇA */}
        {activeTab === 'seguranca' && (
          <motion.div
            key="seguranca"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 max-w-4xl"
          >
            {/* Form de Senha */}
            <form onSubmit={handleUpdatePassword} className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Segurança da Senha</h3>
                <p className="text-xs text-slate-500">Utilize senhas fortes com no mínimo 8 caracteres, números e símbolos.</p>
              </div>

              <div className="space-y-3 text-xs max-w-md pt-2">
                <div className="space-y-1">
                  <label htmlFor="curr" className="form-label">Senha Atual *</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      id="curr"
                      type={showCurrentPass ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="form-input pl-8 pr-8 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass((v) => !v)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="new" className="form-label">Nova Senha *</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      id="new"
                      type={showNewPass ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="form-input pl-8 pr-8 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass((v) => !v)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="conf" className="form-label">Confirmar Nova Senha *</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      id="conf"
                      type={showNewPass ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="form-input pl-8 pr-8 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs ${
                    saveSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Atualizando...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Senha atualizada!</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Atualizar senha</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sessões Ativas */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Sessões Ativas</h3>
                <p className="text-xs text-slate-500">Dispositivos autorizados conectados à sua conta.</p>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                {sessions.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    <Inbox size={20} className="mx-auto mb-1 text-slate-300" />
                    <p className="font-medium text-slate-600">Nenhuma outra sessão ativa encontrada</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        {session.isMobile ? (
                          <Smartphone size={15} className="text-slate-400 shrink-0" />
                        ) : (
                          <Laptop size={15} className="text-slate-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{session.device} • {session.browser}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{session.location} • {session.lastActive}</p>
                        </div>
                      </div>
                      {session.current ? (
                        <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
                          Sessão Atual
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-[11px] font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Encerrar
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 3: NOTIFICAÇÕES */}
        {activeTab === 'notificacoes' && (
          <motion.div
            key="notificacoes"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-4 max-w-4xl"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Preferências de Notificação</h3>
              <p className="text-xs text-slate-500">Escolha os alertas e relatórios automáticos que deseja receber.</p>
            </div>

            <div className="divide-y divide-slate-100 text-xs pt-1">
              {NOTIFICATION_FIELDS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="font-medium text-slate-900">{label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <Toggle
                    checked={notifications[key]}
                    disabled={isSaving}
                    onChange={() =>
                      setNotifications((n) => ({
                        ...n,
                        [key]: !n[key],
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs ${
                  saveSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Preferências salvas!</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Salvar preferências</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}