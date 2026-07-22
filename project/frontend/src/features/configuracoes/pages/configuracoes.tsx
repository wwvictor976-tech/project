import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Building2,
  Palette,
  Globe,
  Zap,
  Database,
  ShieldCheck,
  Save,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertTriangle,
  XCircle,
  CreditCard,
  Calendar,
  Layers,
} from 'lucide-react';

/* ── Contratos de Dados da API / Backend ── */
export type SettingsTab = 'geral' | 'aparencia' | 'integracoes' | 'planos' | 'avancado';

export interface SystemSettings {
  companyName: string;
  contactEmail: string;
  phone: string;
  timezone: string;
  currency: string;
  language: string;
  compactMode: boolean;
  animations: boolean;
  autoBackup: boolean;
  maintenanceMode: boolean;
  activityLogs: boolean;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  category: string;
}

export interface PlanDetails {
  name: string;
  status: string;
  renewalDate: string;
  maxStudents: number;
  maxUsers: string;
  supportLevel: string;
  nextBillingAmount: number;
  nextBillingDate: string;
  paymentMethod: string;
}

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

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'geral', label: 'Geral', icon: Settings },
  { id: 'aparencia', label: 'Aparência', icon: Palette },
  { id: 'integracoes', label: 'Integrações', icon: Zap },
  { id: 'planos', label: 'Plano & Fatura', icon: ShieldCheck },
  { id: 'avancado', label: 'Avançado', icon: Database },
];

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('geral');

  /* ── Estados da API / Backend ── */
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Estado das Configurações */
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: '',
    contactEmail: '',
    phone: '',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    compactMode: false,
    animations: true,
    autoBackup: true,
    maintenanceMode: false,
    activityLogs: true,
  });

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);

  /* ── Carregar Dados do Backend ── */
  useEffect(() => {
    async function fetchSettingsData() {
      setIsLoading(true);
      setError(null);

      try {
        /* TODO: Substituir por requisições reais da API
           const [settingsRes, integrationsRes, planRes] = await Promise.all([
             api.get('/settings'),
             api.get('/settings/integrations'),
             api.get('/settings/subscription')
           ]);
        */
        await new Promise((r) => setTimeout(r, 300)); // Simulação de latência
      } catch (err) {
        setError('Falha ao carregar as configurações do servidor.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettingsData();
  }, []);

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  /* ── Salvar Alterações na API ── */
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);

    try {
      /* TODO: Conectar ao Endpoint da API:
         await api.put('/settings', settings);
      */
      await new Promise((r) => setTimeout(r, 400));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError('Não foi possível salvar as alterações no momento.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleIntegration = async (id: string, currentStatus: boolean) => {
    try {
      /* TODO: Conectar ao Endpoint da API:
         await api.patch(`/settings/integrations/${id}`, { connected: !currentStatus });
      */
      setIntegrations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, connected: !currentStatus } : item))
      );
    } catch (err) {
      setError('Falha ao alterar estado da integração.');
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
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Configurações do Sistema</h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              Preferências Globais
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize parâmetros da empresa, regras de negócio e preferências da plataforma.
          </p>
        </div>
      </header>

      {/* ── MENSAGEM DE ERRO ── */}
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

      {/* ── SELETOR DE ABAS ── */}
      <motion.div variants={itemVariants} className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium max-w-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
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
        
        {/* TAB 1: GERAL */}
        {activeTab === 'geral' && (
          <motion.div
            key="geral"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 max-w-4xl"
          >
            {/* Informações da Empresa */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 size={15} className="text-slate-500" />
                  <span>Informações da Empresa</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Dados institucionais exibidos em relatórios e recibos.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-2">
                <div className="space-y-1">
                  <label htmlFor="companyName" className="form-label">Nome Fantasia / Empresa</label>
                  <input
                    id="companyName"
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="form-input font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contactEmail" className="form-label">E-mail de Contato Suporte</label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSetting('contactEmail', e.target.value)}
                    placeholder="contato@empresa.com"
                    className="form-input font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="form-label">Telefone / WhatsApp Comercial</label>
                  <input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="form-input font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="timezone" className="form-label">Fuso Horário Padrão</label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="form-input font-mono cursor-pointer"
                  >
                    <option value="America/Sao_Paulo">América/São Paulo (BRT -03:00)</option>
                    <option value="America/Manaus">América/Manaus (AMT -04:00)</option>
                    <option value="America/Fortaleza">América/Fortaleza (BRT -03:00)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Localização & Moeda */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Globe size={15} className="text-slate-500" />
                  <span>Localização e Formatação</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Definições regionais para exibição de valores e datas.</p>
              </div>

              <div className="divide-y divide-slate-100 text-xs pt-1">
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-medium text-slate-900">Idioma da Interface</p>
                    <p className="text-[11px] text-slate-400">Idioma utilizado na navegação</p>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-medium text-slate-900">Moeda Padrão</p>
                    <p className="text-[11px] text-slate-400">Símbolo monetário aplicado nos relatórios</p>
                  </div>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-slate-700 cursor-pointer"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ação de Salvar */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
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
                    <span>Configurações salvas!</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Salvar configurações</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: APARÊNCIA */}
        {activeTab === 'aparencia' && (
          <motion.div
            key="aparencia"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-4 max-w-4xl"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Palette size={15} className="text-slate-500" />
                <span>Preferências de Interface</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Ajuste a densidade visual e animações de navegação do painel.</p>
            </div>

            <div className="divide-y divide-slate-100 text-xs pt-1">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">Modo Compacto de Alta Densidade</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Reduz espaçamentos para exibir mais informações por tela.</p>
                </div>
                <Toggle
                  checked={settings.compactMode}
                  disabled={isSaving}
                  onChange={() => updateSetting('compactMode', !settings.compactMode)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">Animações & Microinterações</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ativa transições suaves de carregamento e navegação.</p>
                </div>
                <Toggle
                  checked={settings.animations}
                  disabled={isSaving}
                  onChange={() => updateSetting('animations', !settings.animations)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveSettings}
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
                    <span>Aparência atualizada!</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Salvar alterações</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 3: INTEGRAÇÕES */}
        {activeTab === 'integracoes' && (
          <motion.div
            key="integracoes"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-3 max-w-4xl"
          >
            {integrations.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200/80 rounded-xl shadow-2xs text-center text-xs text-slate-400">
                <Zap size={22} className="mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-slate-700">Nenhuma integração disponível</p>
                <p className="text-[11px] text-slate-400 mt-0.5">As integrações com ferramentas externas aparecerão aqui.</p>
              </div>
            ) : (
              integrations.map((integ) => (
                <div
                  key={integ.id}
                  className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 font-bold shrink-0">
                      <Zap size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{integ.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{integ.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {integ.connected ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Conectado
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleIntegration(integ.id, integ.connected)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleIntegration(integ.id, integ.connected)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <ExternalLink size={12} className="text-slate-400" />
                        <span>Conectar</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* TAB 4: PLANO & FATURA */}
        {activeTab === 'planos' && (
          <motion.div
            key="planos"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 max-w-4xl text-xs"
          >
            {/* Card do Plano Vigente */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    Assinatura do Sistema
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {planDetails?.name || 'Plano Corporativo'}
                  </h3>
                  <p className="text-slate-500 mt-0.5">
                    Renovação prevista em:{' '}
                    <strong className="font-mono text-slate-800">{planDetails?.renewalDate || '—'}</strong>
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-900 text-white shadow-2xs">
                  <ShieldCheck size={13} />
                  <span>{planDetails?.status || 'Ativo'}</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center font-mono">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{planDetails?.maxUsers || 'Ilimitado'}</p>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">Usuários na Conta</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{planDetails?.maxStudents ? `Até ${planDetails.maxStudents}` : 'Sem limite'}</p>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">Limite de Alunos</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{planDetails?.supportLevel || 'Prioritário'}</p>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">Suporte Técnico</p>
                </div>
              </div>
            </div>

            {/* Próxima Fatura */}
            <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">Próxima Fatura Agendada</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {planDetails?.nextBillingAmount ? `R$ ${planDetails.nextBillingAmount},00` : 'R$ 0,00'} • {planDetails?.nextBillingDate || '—'} via {planDetails?.paymentMethod || 'Cartão de Crédito'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert('Abrindo portal de faturamento Stripe...')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                Gerenciar Fatura
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 5: AVANÇADO */}
        {activeTab === 'avancado' && (
          <motion.div
            key="avancado"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 max-w-4xl text-xs"
          >
            {/* Parâmetros do Sistema */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Database size={15} className="text-slate-500" />
                  <span>Parâmetros de Banco & Sistema</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configurações técnicas para rotinas de manutenção de dados.</p>
              </div>

              <div className="divide-y divide-slate-100 pt-1">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">Backup Automático Diário</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Gera e salva cópias de segurança do banco de dados.</p>
                  </div>
                  <Toggle
                    checked={settings.autoBackup}
                    disabled={isSaving}
                    onChange={() => updateSetting('autoBackup', !settings.autoBackup)}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">Registro de Logs de Atividade</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Grava histórico de ações executadas pelos usuários.</p>
                  </div>
                  <Toggle
                    checked={settings.activityLogs}
                    disabled={isSaving}
                    onChange={() => updateSetting('activityLogs', !settings.activityLogs)}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">Modo de Manutenção do Painel</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Bloqueia o acesso temporário para usuários não administradores.</p>
                  </div>
                  <Toggle
                    checked={settings.maintenanceMode}
                    disabled={isSaving}
                    onChange={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                  />
                </div>
              </div>
            </div>

            {/* Manutenção de Cache */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <RefreshCw size={15} className="text-slate-500" />
                <span>Manutenção de Sistema</span>
              </h3>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => alert('Cache do servidor purgado com sucesso.')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw size={13} className="text-slate-400" />
                  <span>Limpar Cache do Servidor</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Download do arquivo de backup iniciado.')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 font-medium text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Database size={13} className="text-slate-400" />
                  <span>Exportar Cópia do Banco</span>
                </button>
              </div>
            </div>

            {/* Zona de Perigo */}
            <div className="p-5 bg-rose-50/50 border border-rose-200/80 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-rose-900">Zona de Perigo</h3>
                  <p className="text-[11px] text-rose-700/80 mt-0.5">
                    Ações irreversíveis que impactam todos os registros de alunos e histórico financeiro.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Esta ação requer autorização do proprietário da conta.')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
              >
                <Trash2 size={13} />
                <span>Excluir todos os dados da conta</span>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}