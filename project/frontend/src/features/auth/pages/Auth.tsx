import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/auth";
import { ROUTES } from "@/constants/routes";

type AuthMode = "login" | "register";
type FormStatus = "idle" | "loading" | "success";

interface FormValues {
  name: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface PasswordRequirements {
  length: boolean;
  casing: boolean;
  number: boolean;
  special: boolean;
}

interface PasswordMetrics {
  strength: string;
  score: number;
  color: string;
  requirements: PasswordRequirements;
}

const authCopy: Record<AuthMode, { title: string; subtitle: string; action: string }> = {
  login: {
    title: "Bem-vindo de volta",
    subtitle: "Acesse sua plataforma de gestão.",
    action: "Entrar na plataforma",
  },
  register: {
    title: "Comece gratuitamente",
    subtitle: "Crie sua conta e gerencie seus alunos.",
    action: "Criar minha conta",
  },
};

const baseInputClasses =
  "w-full py-2.5 sm:py-3 pl-10 pr-10 rounded-lg bg-white border text-sm font-normal placeholder-[#94a3b8] transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 text-[#0f172a]";

const icons = {
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  alert: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

function IconCheck({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full border text-[0.6rem] transition-all duration-200 ${
      active ? "bg-[#10b981] text-white border-[#10b981]" : "border-[#cbd5e1] text-[#94a3b8]"
    }`}>
      ✓
    </span>
  );
}

function getPasswordMetrics(password: string): PasswordMetrics {
  const tests: PasswordRequirements = {
    length: password.length >= 8,
    casing: /[A-Z]/.test(password) && /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(tests).filter(Boolean).length;
  const index = Math.min(score, 4);
  const levels = ["Curta demais", "Muito Fraca", "Fraca", "Boa", "Excelente"] as const;
  const colors = ["#64748b", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"] as const;

  return {
    strength: levels[index] ?? levels[0],
    color: colors[index] ?? colors[0],
    score,
    requirements: tests,
  };
}

function validateField(field: keyof FormErrors, value: string) {
  if (field === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "Informe um e-mail válido.";
  if (field === "password") return value.length >= 8 ? undefined : "Use ao menos 8 caracteres.";
  if (field === "name") return value.trim().length > 2 ? undefined : "Informe seu nome completo.";
  return undefined;
}

function InputField({
  id, label, type, value, placeholder, icon, error, touched, onChange, onBlur, onClear, shake,
}: {
  id: string; label: string; type: string; value: string; placeholder: string; icon: ReactNode;
  error?: string; touched?: boolean; onChange: (v: string) => void; onBlur: () => void;
  onClear?: () => void; shake?: boolean;
}) {
  return (
    <div className="flex flex-col mb-3 sm:mb-4">
      <label htmlFor={id} className="block text-[0.65rem] sm:text-[0.68rem] font-bold text-[#475569] mb-1.5 uppercase tracking-widest">
        {label}
      </label>
      <div className={`group/input relative flex items-center w-full ${shake ? "animate-elastic-shake" : ""}`}>
        <span className="absolute left-3.5 text-[#94a3b8] group-focus-within/input:text-[#2563eb] flex items-center pointer-events-none transition-colors duration-200 z-20">
          {icon}
        </span>
        <input
          id={id} type={type} value={value} placeholder={placeholder} autoComplete={id}
          onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          aria-invalid={!!(error && touched)} aria-describedby={error && touched ? `${id}-error` : undefined}
          className={`${baseInputClasses} ${
            error && touched
              ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,0.12)]"
              : "border-[#e2e8f0] focus:border-[#2563eb] focus:ring-[rgba(37,99,235,0.15)]"
          }`}
        />
        {onClear && value && (
          <button type="button" onClick={onClear}
            className="absolute right-3.5 text-[#94a3b8] hover:text-[#0f172a] active:scale-90 flex items-center justify-center transition-colors duration-200 cursor-pointer p-0 z-20 bg-transparent border-none"
            aria-label={`Limpar ${label.toLowerCase()}`}>
            {icons.close}
          </button>
        )}
      </div>
      {error && touched && (
        <span className="flex items-center gap-1 mt-1.5 text-[#ef4444] text-[0.72rem] font-semibold animate-fade-slide" id={`${id}-error`} role="alert">
          {icons.alert} {error}
        </span>
      )}
    </div>
  );
}

function PasswordField({
  value, placeholder, error, touched, showPassword, onToggle, onChange, onBlur, shake, metrics, showStrength = true,
}: {
  value: string; placeholder: string; error?: string; touched?: boolean; showPassword: boolean;
  onToggle: () => void; onChange: (v: string) => void; onBlur: () => void; shake?: boolean;
  metrics: PasswordMetrics; showStrength?: boolean;
}) {
  return (
    <div className="flex flex-col mb-3 sm:mb-4 relative z-0">
      <label htmlFor="password" className="block text-[0.65rem] sm:text-[0.68rem] font-bold text-[#475569] mb-1.5 uppercase tracking-widest">
        Senha
      </label>
      <div className={`group/input relative flex items-center w-full ${shake ? "animate-elastic-shake" : ""}`}>
        <span className="absolute left-3.5 text-[#94a3b8] group-focus-within/input:text-[#2563eb] flex items-center pointer-events-none transition-colors duration-200 z-20">
          {icons.lock}
        </span>
        <input
          id="password" type={showPassword ? "text" : "password"} value={value} placeholder={placeholder}
          autoComplete={showPassword ? "new-password" : "current-password"}
          onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          aria-invalid={!!(error && touched)} aria-describedby={error && touched ? "password-error" : undefined}
          className={`${baseInputClasses} ${error && touched ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,0.12)]" : "border-[#e2e8f0] focus:border-[#2563eb] focus:ring-[rgba(37,99,235,0.15)]"}`}
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3.5 text-[#94a3b8] hover:text-[#0f172a] active:scale-90 flex items-center justify-center transition-colors duration-200 cursor-pointer p-0 z-20 bg-transparent border-none"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
          {showPassword ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && touched && (
        <span className="flex items-center gap-1 mt-1.5 text-[#ef4444] text-[0.72rem] font-semibold animate-fade-slide" id="password-error" role="alert">
          {icons.alert} {error}
        </span>
      )}
      {showStrength && !showPassword && value && <PasswordStrengthPanel metrics={metrics} />}
    </div>
  );
}

function PasswordStrengthPanel({ metrics }: { metrics: PasswordMetrics }) {
  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[0.72rem] font-semibold tracking-wide transition-colors duration-300" style={{ color: metrics.color }}>
          Segurança: {metrics.strength}
        </span>
        <div className="flex gap-1 h-[5px] w-[45%]">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1 h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: metrics.score >= step ? metrics.color : "#e2e8f0" }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2.5 border-t border-[#0f172a]/5">
        <RequirementItem active={metrics.requirements.length} label="8+ Caracteres" />
        <RequirementItem active={metrics.requirements.casing} label="Maiúsculas/minúsculas" />
        <RequirementItem active={metrics.requirements.number} label="Pelo menos 1 número" />
        <RequirementItem active={metrics.requirements.special} label="Caractere especial" />
      </div>
    </div>
  );
}

function RequirementItem({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`text-[0.62rem] font-semibold flex items-center gap-1.5 transition-colors duration-200 ${active ? "text-[#0f172a]" : "text-[#94a3b8]"}`}>
      <IconCheck active={active} /> {label}
    </div>
  );
}

const initialValues: FormValues = { name: "", email: "", password: "", rememberMe: false };

function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [values, setValues] = useState<FormValues>(initialValues);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormErrors, boolean>>>({});
  const [shake, setShake] = useState<Partial<Record<keyof FormErrors, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const timeouts = useRef<number[]>([]);

  const metrics = useMemo(() => getPasswordMetrics(values.password), [values.password]);
  const isLogin = mode === "login";
  const copy = authCopy[mode];

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);
  useEffect(() => {
    setErrors({}); setTouched({}); setShake({}); setStatus("idle");
    setValues((c) => ({ ...c, password: "" }));
  }, [mode]);

  const updateValue = (key: keyof FormValues, value: string | boolean) =>
    setValues((c) => ({ ...c, [key]: value }));

  const markTouched = (field: keyof FormErrors) =>
    setTouched((c) => ({ ...c, [field]: true }));

  const shakeField = (field: keyof FormErrors) => {
    setShake((c) => ({ ...c, [field]: true }));
    const id = window.setTimeout(() => {
      setShake((c) => ({ ...c, [field]: false }));
      timeouts.current = timeouts.current.filter((t) => t !== id);
    }, 500);
    timeouts.current.push(id);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: FormErrors = {
      email: validateField("email", values.email),
      password: validateField("password", values.password),
      name: isLogin ? undefined : validateField("name", values.name),
    };
    setErrors(nextErrors);
    setTouched({ email: true, password: true, name: !isLogin });
    if (nextErrors.email) shakeField("email");
    if (nextErrors.password) shakeField("password");
    if (nextErrors.name) shakeField("name");
    if (nextErrors.email || nextErrors.password || nextErrors.name) return;

    setStatus("success");
    login(`pending-backend-session-${Date.now()}`, {
      id: crypto.randomUUID(),
      name: values.name || values.email.split("@")[0] || "Usuário autenticado",
      email: values.email,
      role: "Administrador",
    });
    navigate(ROUTES.dashboard);
  };

  return (
    <main className="w-screen min-h-screen lg:h-screen bg-[#020617] lg:bg-[#030712] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] overflow-x-hidden relative">

      {/* ── Painel Esquerdo (Institucional) ── */}
      <section className="relative w-full p-6 py-12 sm:p-12 lg:p-20 flex flex-col justify-between overflow-hidden bg-[#020617] lg:h-full z-10">
        <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#2563eb] rounded-full blur-[120px] lg:blur-[160px] opacity-[0.15] lg:opacity-[0.12] top-[-50px] left-[-50px] pointer-events-none" />
        <div className="absolute w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] bg-[#1e3a8a] rounded-full blur-[140px] lg:blur-[180px] opacity-[0.15] bottom-[-60px] right-[-30px] pointer-events-none" />

        {/* Logo / Brand mark */}
        <div className="flex items-center gap-3 relative z-10 justify-center lg:justify-start">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center shadow-md shadow-blue-600/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-white/60 tracking-[0.25em] text-[0.7rem] font-bold uppercase">Atlhon Sales</span>
        </div>

        {/* Conteúdo Hero */}
        <div className="w-full max-w-xl relative z-10 mt-8 lg:mt-0 text-center lg:text-left mx-auto lg:mx-0">
          <h1 className="text-white font-bold text-3xl sm:text-4xl lg:text-[3.25rem] leading-[1.15] tracking-tight mb-4 lg:mb-6">
            Toda Sua <br className="hidden lg:block" />
            <span className="text-[#3b82f6]">Gestão Centralizada</span>
          </h1>
          <p className="text-[#94a3b8] text-sm sm:text-[0.95rem] font-normal leading-relaxed max-w-md mb-0 lg:mb-8 mx-auto lg:mx-0">
            Gerencie alunos, controle o pipeline de vendas e acompanhe resultados em um único lugar.
          </p>

          <hr className="hidden lg:block border-white/5 my-8 max-w-md" />

          {/* Lista de Features */}
          <ul className="hidden lg:block space-y-3 text-sm text-[#64748b] font-medium">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Gestão de alunos e matrículas
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Pipeline e funil de vendas
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Relatórios em tempo real
            </li>
          </ul>
        </div>

        {/* Footer Esquerdo */}
        <div className="relative z-10 text-center lg:text-left mt-6 lg:mt-0">
          <p className="text-white/20 text-[0.7rem] font-medium">
            © 2026 Atlhon Sales
          </p>
        </div>
      </section>

      {/* ── Painel Direito (Card Adaptativo) ── */}
      <section className="relative w-full flex items-end lg:items-center justify-center bg-[#f8fafc] lg:h-full z-20 rounded-t-[24px] lg:rounded-t-none border-t border-white/10 lg:border-t-none">
        <div className="w-full max-w-[440px] bg-white rounded-t-[24px] lg:rounded-2xl px-6 py-8 sm:px-10 sm:py-10 border-x border-t lg:border border-[#e2e8f0] text-[#0f172a] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] lg:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-y-auto max-h-[85vh] lg:max-h-[calc(100vh-4rem)] scrollbar-none">

          {/* Cabeçalho do Card */}
          <div className="hidden sm:flex items-center gap-3 mb-6 lg:mb-8">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#0f172a]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold text-[#94a3b8] tracking-[0.15em] uppercase leading-none mb-1">Atlhon Sales</p>
              <p className="text-[0.6rem] font-bold text-blue-600 tracking-widest uppercase leading-none">CRM Suite</p>
            </div>
          </div>

          {/* Alternador de Modo (Tabs) */}
          <div className="relative flex gap-1 mb-6 sm:mb-8 bg-[#f1f5f9] rounded-xl p-1" role="tablist">
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all duration-200 ease-out"
              style={{
                width: "calc(50% - 4px)",
                left: isLogin ? "4px" : "calc(50%)",
              }}
              aria-hidden="true"
            />
            <button type="button" role="tab" aria-selected={isLogin}
              className={`relative flex-1 z-10 rounded-lg py-2.5 text-xs font-semibold text-center transition-colors duration-200 bg-transparent border-none cursor-pointer ${isLogin ? "text-[#0f172a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
              onClick={() => setMode("login")}>
              Entrar
            </button>
            <button type="button" role="tab" aria-selected={!isLogin}
              className={`relative flex-1 z-10 rounded-lg py-2.5 text-xs font-semibold text-center transition-colors duration-200 bg-transparent border-none cursor-pointer ${!isLogin ? "text-[#0f172a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
              onClick={() => setMode("register")}>
              Criar conta
            </button>
          </div>

          {/* Textos Dinâmicos */}
          <div className="mb-5 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0f172a] mb-1">
              {copy.title}
            </h2>
            <p className="text-[#64748b] text-xs font-normal">
              {copy.subtitle}
            </p>
          </div>

          {/* Botão Google Potencializado com Microinteração (Seta Hover) */}
          <button
            className="group/google w-full flex items-center justify-center gap-2 mb-5 sm:mb-6 py-2.5 px-5 rounded-lg bg-white text-[#0f172a] border border-[#e2e8f0] font-semibold text-xs transition-all duration-200 hover:bg-[#f8fafc] hover:border-[#cbd5e1] active:scale-[0.99] cursor-pointer"
            type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span className="ml-1">Continuar com o Google</span>
            <svg className="w-0 opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover/google:w-[14px] group-hover/google:opacity-70 group-hover/google:translate-x-0.5 ml-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="flex-1 h-px bg-[#f1f5f9]" />
            <span className="text-[#94a3b8] text-[0.55rem] sm:text-[0.6rem] font-bold tracking-widest uppercase">ou por e-mail</span>
            <div className="flex-1 h-px bg-[#f1f5f9]" />
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <InputField id="name" label="Nome Completo" type="text" value={values.name}
                placeholder="Ex: João Silva" icon={icons.user} error={errors.name} touched={touched.name}
                onChange={(v) => updateValue("name", v)}
                onBlur={() => { markTouched("name"); setErrors((c) => ({ ...c, name: validateField("name", values.name) })); }}
                onClear={() => updateValue("name", "")} shake={shake.name} />
            )}

            <InputField id="email" label="E-mail" type="email" value={values.email}
              placeholder="nome@empresa.com" icon={icons.mail} error={errors.email} touched={touched.email}
              onChange={(v) => updateValue("email", v)}
              onBlur={() => { markTouched("email"); setErrors((c) => ({ ...c, email: validateField("email", values.email) })); }}
              onClear={() => updateValue("email", "")} shake={shake.email} />

            <PasswordField value={values.password} placeholder="Mín. 8 caracteres" error={errors.password}
              touched={touched.password} showPassword={showPassword} onToggle={() => setShowPassword((c) => !c)}
              onChange={(v) => updateValue("password", v)}
              onBlur={() => { markTouched("password"); setErrors((c) => ({ ...c, password: validateField("password", values.password) })); }}
              shake={shake.password} metrics={metrics} showStrength={!isLogin} />

            {isLogin && (
              <div className="flex items-center justify-between mt-1 mb-5 sm:mb-6">
                <label className="flex items-center gap-2 text-[#475569] text-xs font-normal cursor-pointer select-none">
                  <input type="checkbox" checked={values.rememberMe}
                    onChange={(e) => updateValue("rememberMe", e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#2563eb] rounded border-[#cbd5e1] cursor-pointer" />
                  Lembrar-me
                </label>
                <Link to={ROUTES.resetPassword}
                  className="text-[#475569] text-xs font-medium no-underline hover:text-[#2563eb] transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
            )}

            {/* Botão Principal Dinâmico com Efeito Hover na Seta */}
            <button type="submit"
              className={`w-full mt-2 py-2.5 sm:py-3 px-5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 relative overflow-hidden transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group/signin ${
                status === "success"
                  ? "bg-[#10b981] text-white pointer-events-none"
                  : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.99]"
              }`}
              disabled={status === "loading" || status === "success"} aria-busy={status === "loading"}>
              {status === "loading" ? (
                <svg className="animate-spinner-rotate absolute top-1/2 left-1/2 -mt-3 -ml-3 w-6 h-6 z-10" viewBox="0 0 50 50">
                  <circle className="stroke-white [stroke-linecap:round] animate-spinner-dash" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                </svg>
              ) : status === "success" ? (
                <>
                  <svg className="animate-pop-in" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Concluído</span>
                </>
              ) : (
                <>
                  <span>{copy.action}</span>
                  <svg className="transition-transform duration-200 ease-out group-hover/signin:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Avisos Legais */}
          <p className="mt-5 sm:mt-6 text-[#94a3b8] text-[0.7rem] text-center leading-relaxed">
            Ao continuar você concorda com os{" "}
            <Link to="/terms" className="text-[#64748b] font-medium underline hover:text-[#2563eb] transition-colors">Termos</Link>{" "}
            e a{" "}
            <Link to="/privacy" className="text-[#64748b] font-medium underline hover:text-[#2563eb] transition-colors">Privacidade</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Auth;