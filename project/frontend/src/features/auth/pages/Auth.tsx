import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
  "w-full py-3 px-10 rounded-lg bg-white border text-sm font-medium placeholder-[#94a3b8] transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none focus:bg-white focus:ring-2";

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
    <div className="flex flex-col mb-4">
      <label htmlFor={id} className="block text-[0.68rem] font-semibold text-[#475569] mb-1.5 uppercase tracking-[0.06em]">
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
              : "border-[#e2e8f0] focus:border-[#3b82f6] focus:ring-[rgba(37,99,235,0.15)]"
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
    <div className="flex flex-col mb-4 relative z-0">
      <label htmlFor="password" className="block text-[0.68rem] font-semibold text-[#475569] mb-1.5 uppercase tracking-[0.06em]">
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
          className={`${baseInputClasses} ${error && touched ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,0.12)]" : "border-[#e2e8f0] focus:border-[#3b82f6] focus:ring-[rgba(37,99,235,0.15)]"}`}
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

function StatCard({ value, label, icon }: { value: string; label: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <span className="text-blue-400/80">{icon}</span>
      <div>
        <p className="text-white font-bold text-sm leading-none">{value}</p>
        <p className="text-white/40 text-[0.65rem] font-medium mt-0.5 leading-none">{label}</p>
      </div>
    </div>
  );
}

const initialValues: FormValues = { name: "", email: "", password: "", rememberMe: false };

function Auth() {
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

    setStatus("loading");
    const id = window.setTimeout(() => {
      setStatus("success");
      const rid = window.setTimeout(() => {
        setStatus("idle");
        timeouts.current = timeouts.current.filter((t) => t !== rid);
      }, 1200);
      timeouts.current.push(rid);
      timeouts.current = timeouts.current.filter((t) => t !== id);
    }, 900);
    timeouts.current.push(id);
  };

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#030712] grid grid-cols-[1.1fr_0.9fr] max-[1024px]:grid-cols-[1fr_1fr] max-[840px]:block max-[840px]:relative">

      {/* ── Left panel ── */}
      <section className="relative w-full h-full p-16 max-[1024px]:p-10 flex flex-col justify-between overflow-hidden bg-[#030712] max-[840px]:absolute max-[840px]:inset-0 max-[840px]:p-8 max-[840px]:justify-start max-[840px]:items-center z-10">
        {/* Orbs */}
        <div className="absolute w-[500px] h-[500px] bg-[#2563eb] rounded-full blur-[150px] opacity-[0.18] top-[-120px] left-[-120px] pointer-events-none animate-orb-float" />
        <div className="absolute w-[600px] h-[600px] bg-[#1e3a8a] rounded-full blur-[150px] opacity-[0.18] bottom-[-180px] right-[-80px] pointer-events-none animate-orb-float [animation-delay:-5s]" />

        {/* Brand mark */}
        <div className="flex items-center gap-3 relative z-10 max-[840px]:hidden">
          <div className="w-7 h-7 rounded-md bg-[#2563eb] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-white/50 tracking-[0.3em] text-xs font-semibold uppercase">Atlhon Sales</span>
        </div>

        {/* Hero */}
        <div className="w-full max-w-lg relative z-10 max-[840px]:mt-10 max-[840px]:text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-5 max-[840px]:hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-300/80 text-[0.65rem] font-semibold tracking-widest uppercase">Plataforma CRM</span>
          </div>
          <h1 className="text-white font-bold text-[3.5rem] max-[1024px]:text-4xl max-[840px]:text-3xl leading-[1.08] tracking-tight mb-5 max-[840px]:mb-3">
            Toda Sua <br />
            <em className="hero-gradient-text hero-elastic-text not-italic">Gestão Centralizada</em>
          </h1>
          <p className="text-white/50 text-[0.92rem] leading-relaxed max-w-md max-[840px]:mx-auto max-[480px]:hidden">
            A Elite de seus atletas começa por aqui. Gerencie seus alunos, aumente a eficiência e escale seus resultados.
          </p>

          {/* Stat cards */}
          <div className="flex gap-2.5 flex-wrap mt-8 max-[840px]:hidden">
            <StatCard
              value="2.4k+"
              label="Alunos gerenciados"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <StatCard
              value="98%"
              label="Satisfação dos clientes"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
            />
            <StatCard
              value="3×"
              label="Mais produtivo"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 max-[840px]:hidden">
          <p className="text-white/20 text-[0.65rem] tracking-[0.15em] font-medium uppercase">
            Workspace privado · Alta eficiência · Gestão melhorada
          </p>
        </div>
      </section>

      {/* ── Right panel (card) ── */}
      <section className="relative w-full h-full flex items-center justify-center bg-[#f8fafc] p-8 overflow-hidden max-[840px]:absolute max-[840px]:bottom-0 max-[840px]:left-0 max-[840px]:h-[68%] max-[480px]:h-[78%] max-[840px]:bg-transparent max-[840px]:p-6 max-[480px]:p-0 max-[840px]:items-end z-20">
        <div className="w-full max-w-[420px] max-[840px]:max-w-[460px] max-[840px]:rounded-b-none max-[840px]:rounded-t-[24px] max-[480px]:rounded-t-[20px] max-h-[calc(100vh-4rem)] max-[840px]:max-h-full overflow-y-auto bg-white rounded-2xl px-9 py-8 max-[840px]:px-7 max-[840px]:py-7 max-[480px]:px-5 max-[480px]:py-6 border border-[#e2e8f0] max-[840px]:border-white/25 text-[#0f172a] shadow-[0_10px_40px_-8px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)] max-[840px]:shadow-[0_-12px_40px_rgba(0,0,0,0.28)] max-[840px]:backdrop-blur-[16px] max-[840px]:bg-white/96 animate-card-enter scrollbar-fine">

          {/* Card header */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#0f172a]" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <p className="text-[0.62rem] font-bold text-[#94a3b8] tracking-[0.15em] uppercase leading-none mb-0.5">Atlhon Sales</p>
              <p className="text-[0.6rem] font-semibold text-blue-600 tracking-widest uppercase leading-none">CRM Suite</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="relative flex gap-1 mb-7 bg-[#f1f5f9] rounded-xl p-1" role="tablist" aria-label="Alternar entre entrar e criar conta">
            {/* Sliding pill */}
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-white shadow-[0_1px_4px_rgba(15,23,42,0.1)] transition-all duration-250 ease-out"
              style={{
                width: "calc(50% - 4px)",
                left: isLogin ? "4px" : "calc(50%)",
              }}
              aria-hidden="true"
            />
            <button type="button" role="tab" aria-selected={isLogin}
              className={`relative flex-1 z-10 rounded-md py-2.5 text-xs font-semibold text-center transition-colors duration-200 bg-transparent border-none cursor-pointer ${isLogin ? "text-[#0f172a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
              onClick={() => setMode("login")}>
              Entrar
            </button>
            <button type="button" role="tab" aria-selected={!isLogin}
              className={`relative flex-1 z-10 rounded-md py-2.5 text-xs font-semibold text-center transition-colors duration-200 bg-transparent border-none cursor-pointer ${!isLogin ? "text-[#0f172a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
              onClick={() => setMode("register")}>
              Criar conta
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-[1.4rem] max-[840px]:text-xl font-bold tracking-tight text-[#0f172a] leading-snug animate-fade-slide">
              {copy.title}
            </h2>
            <p className="mt-1 text-[#64748b] text-sm font-normal animate-fade-slide [animation-delay:0.03s]">
              {copy.subtitle}
            </p>
          </div>

          {/* Google */}
          <button
            className="group/google w-full flex items-center justify-center gap-2.5 mb-5 py-[11px] px-5 rounded-xl bg-white text-[#0f172a] border border-[#e2e8f0] font-semibold text-sm transition-all duration-200 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:bg-[#f8fafc] hover:border-[#0f172a]/12 hover:shadow-[0_3px_8px_rgba(15,23,42,0.07)] hover:-translate-y-px active:scale-[0.985] cursor-pointer"
            type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Continuar com o Google</span>
            <svg className="w-0 opacity-0 -translate-x-1 transition-all duration-200 group-hover/google:w-[14px] group-hover/google:opacity-60 group-hover/google:translate-x-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#f1f5f9]" />
            <span className="text-[#94a3b8] text-[0.62rem] font-bold tracking-[0.12em] uppercase">ou por e-mail</span>
            <div className="flex-1 h-px bg-[#f1f5f9]" />
          </div>

          {/* Form */}
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
              <div className="flex items-center justify-between mt-0 mb-5">
                <label className="flex items-center gap-2 text-[#475569] text-xs font-medium cursor-pointer select-none">
                  <input type="checkbox" checked={values.rememberMe}
                    onChange={(e) => updateValue("rememberMe", e.target.checked)}
                    className="w-[14px] h-[14px] accent-[#2563eb] rounded cursor-pointer" />
                  Lembrar-me
                </label>
                <Link to={ROUTES.resetPassword}
                  className="text-[#475569] text-xs font-semibold no-underline transition-colors duration-200 hover:text-[#2563eb]">
                  Esqueci minha senha
                </Link>
              </div>
            )}

            <button type="submit"
              className={`group/signin w-full mt-2 py-[13px] px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 relative overflow-hidden transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
                status === "success"
                  ? "bg-[#10b981] text-white pointer-events-none"
                  : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:shadow-[0_4px_14px_rgba(37,99,235,0.35)] active:scale-[0.985]"
              }`}
              disabled={status === "loading" || status === "success"} aria-busy={status === "loading"}>
              {status === "loading" ? (
                <svg className="animate-spinner-rotate absolute top-1/2 left-1/2 -mt-3 -ml-3 w-6 h-6 z-10" viewBox="0 0 50 50">
                  <circle className="stroke-white [stroke-linecap:round] animate-spinner-dash" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                </svg>
              ) : status === "success" ? (
                <>
                  <svg className="animate-pop-in" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Concluído</span>
                </>
              ) : (
                <>
                  <span>{copy.action}</span>
                  <svg className="transition-transform duration-200 group-hover/signin:translate-x-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-[#94a3b8] text-[0.72rem] text-center leading-relaxed">
            Ao continuar, você concorda com os{" "}
            <Link to="/terms" className="text-[#64748b] font-medium underline hover:text-[#2563eb] transition-colors">Termos de Serviço</Link>{" "}
            e{" "}
            <Link to="/privacy" className="text-[#64748b] font-medium underline hover:text-[#2563eb] transition-colors">Política de Privacidade</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Auth;
