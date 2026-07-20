import type { FormEvent, KeyboardEvent, ClipboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

// ─── Types ───────────────────────────────────────────────────────────────────

type ResetStep = "email" | "code" | "password" | "success";
type FieldStatus = "idle" | "loading" | "success" | "error";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPasswordMetrics(password: string): PasswordMetrics {
  const req: PasswordRequirements = {
    length: password.length >= 8,
    casing: /[A-Z]/.test(password) && /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(req).filter(Boolean).length;
  const idx = Math.min(score, 4);
  const levels = ["Curta demais", "Muito Fraca", "Fraca", "Boa", "Excelente"] as const;
  const colors = ["#64748b", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"] as const;
  return { strength: levels[idx] ?? levels[0], color: colors[idx] ?? colors[0], score, requirements: req };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepDots({ current }: { current: ResetStep }) {
  const steps: ResetStep[] = ["email", "code", "password", "success"];
  const idx = steps.indexOf(current);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Passo ${idx + 1} de 4`}>
      {steps.map((s, i) => (
        <div
          key={s}
          className={`rounded-full transition-all duration-300 ${
            i < idx
              ? "w-4 h-1.5 bg-[#10b981]"
              : i === idx
              ? "w-6 h-1.5 bg-[#2563eb]"
              : "w-1.5 h-1.5 bg-[#e2e8f0]"
          }`}
        />
      ))}
    </div>
  );
}

function IconCheck({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full border text-[0.6rem] transition-all duration-200 ${
      active ? "bg-[#10b981] text-white border-[#10b981]" : "border-[#cbd5e1] text-[#94a3b8]"
    }`}>
      ✓
    </span>
  );
}

function RequirementItem({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`text-[0.62rem] font-semibold flex items-center gap-1.5 transition-colors duration-200 ${active ? "text-[#0f172a]" : "text-[#94a3b8]"}`}>
      <IconCheck active={active} /> {label}
    </div>
  );
}

function PasswordStrengthBar({ metrics }: { metrics: PasswordMetrics }) {
  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[0.72rem] font-semibold transition-colors duration-300" style={{ color: metrics.color }}>
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

// ─── OTP Input ───────────────────────────────────────────────────────────────

const OTP_LENGTH = 6;

function OtpInput({
  value,
  onChange,
  shake,
}: {
  value: string;
  onChange: (v: string) => void;
  shake: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(OTP_LENGTH, "").split("").slice(0, OTP_LENGTH);

  const focusAt = (i: number) => refs.current[i]?.focus();

  const handleChange = (i: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("").trimEnd();
    onChange(next);
    if (char && i < OTP_LENGTH - 1) focusAt(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = digits.map((d, idx) => (idx === i ? "" : d)).join("").trimEnd();
        onChange(next);
      } else if (i > 0) {
        focusAt(i - 1);
        const next = digits.map((d, idx) => (idx === i - 1 ? "" : d)).join("").trimEnd();
        onChange(next);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(pasted);
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    focusAt(nextFocus);
  };

  return (
    <div className={`flex gap-2 justify-between ${shake ? "animate-elastic-shake" : ""}`}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-full aspect-square max-w-[52px] text-center text-lg font-bold rounded-xl border-2 bg-white transition-all duration-150 focus:outline-none focus:ring-0 ${
            digits[i]
              ? "border-[#2563eb] text-[#0f172a] bg-blue-50/50"
              : "border-[#e2e8f0] text-[#94a3b8] focus:border-[#3b82f6]"
          }`}
          aria-label={`Dígito ${i + 1} de ${OTP_LENGTH}`}
        />
      ))}
    </div>
  );
}

// ─── Resend timer ─────────────────────────────────────────────────────────────

function useResendTimer(initialSeconds = 30) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    setSeconds(initialSeconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    start();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return { seconds, canResend: seconds === 0, resend: start };
}

// ─── Main component ───────────────────────────────────────────────────────────

function ResetPassword() {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailShake, setEmailShake] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpShake, setOtpShake] = useState(false);
  const [otpError, setOtpError] = useState<string | undefined>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [pwTouched, setPwTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [pwShake, setPwShake] = useState(false);

  const [status, setStatus] = useState<FieldStatus>("idle");

  const metrics = useMemo(() => getPasswordMetrics(newPassword), [newPassword]);
  const timeouts = useRef<number[]>([]);

  const { seconds, canResend, resend } = useResendTimer(30);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const shake = (setter: (v: boolean) => void) => {
    setter(true);
    const id = window.setTimeout(() => { setter(false); timeouts.current = timeouts.current.filter((t) => t !== id); }, 500);
    timeouts.current.push(id);
  };

  const simulate = (onDone: () => void) => {
    setStatus("loading");
    const id = window.setTimeout(() => {
      setStatus("idle");
      onDone();
      timeouts.current = timeouts.current.filter((t) => t !== id);
    }, 850);
    timeouts.current.push(id);
  };

  // ── Step 1: Email ───────────────────────────────────────────────────────────
  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Informe um e-mail válido.";
    setEmailError(err);
    setEmailTouched(true);
    if (err) { shake(setEmailShake); return; }
    simulate(() => setStep("code"));
  };

  // ── Step 2: OTP ─────────────────────────────────────────────────────────────
  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) {
      setOtpError("Insira o código de 6 dígitos.");
      shake(setOtpShake);
      return;
    }
    setOtpError(undefined);
    simulate(() => setStep("password"));
  };

  // ── Step 3: New password ────────────────────────────────────────────────────
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err1 = newPassword.length >= 8 ? undefined : "Use ao menos 8 caracteres.";
    const err2 = newPassword === confirmPassword ? undefined : "As senhas não coincidem.";
    setPwError(err1);
    setConfirmError(err2);
    setPwTouched(true);
    setConfirmTouched(true);
    if (err1 || err2) { shake(setPwShake); return; }
    simulate(() => setStep("success"));
  };

  // ─── Hero content per step ─────────────────────────────────────────────────
  const heroContent: Record<ResetStep, { headline: string; sub: string }> = {
    email: { headline: "Recupere seu acesso com segurança", sub: "Enviaremos um código de verificação para o seu e-mail cadastrado." },
    code: { headline: "Verifique seu e-mail", sub: `Um código de 6 dígitos foi enviado para ${email || "seu e-mail"}.` },
    password: { headline: "Crie uma nova senha", sub: "Escolha uma senha forte para manter sua conta segura." },
    success: { headline: "Senha redefinida com sucesso", sub: "Você já pode acessar sua conta com a nova senha." },
  };

  const hero = heroContent[step];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#030712] grid grid-cols-[1.1fr_0.9fr] max-[1024px]:grid-cols-[1fr_1fr] max-[840px]:block max-[840px]:relative">

      {/* ── Left panel ── */}
      <section className="relative w-full h-full p-16 max-[1024px]:p-10 flex flex-col justify-between overflow-hidden bg-[#030712] max-[840px]:absolute max-[840px]:inset-0 max-[840px]:p-8 z-10">
        <div className="absolute w-[500px] h-[500px] bg-[#2563eb] rounded-full blur-[150px] opacity-[0.15] top-[-120px] left-[-120px] pointer-events-none animate-orb-float" />
        <div className="absolute w-[600px] h-[600px] bg-[#1e3a8a] rounded-full blur-[150px] opacity-[0.15] bottom-[-180px] right-[-80px] pointer-events-none animate-orb-float [animation-delay:-7s]" />

        <div className="flex items-center gap-3 relative z-10 max-[840px]:hidden">
          <div className="w-7 h-7 rounded-md bg-[#2563eb] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-white/50 tracking-[0.3em] text-xs font-semibold uppercase">Atlhon Sales</span>
        </div>

        <div className="w-full max-w-lg relative z-10 max-[840px]:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-blue-300/80 text-[0.65rem] font-semibold tracking-widest uppercase">Recuperação de acesso</span>
          </div>

          <h1 className="text-white font-bold text-[3rem] max-[1024px]:text-4xl leading-[1.1] tracking-tight mb-5">
            <em className="hero-gradient-text hero-elastic-text not-italic">{hero.headline}</em>
          </h1>
          <p className="text-white/45 text-[0.9rem] leading-relaxed max-w-md">
            {hero.sub}
          </p>

          {/* Security note */}
          <div className="mt-10 flex items-start gap-3 p-4 rounded-xl bg-white/4 border border-white/8">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <p className="text-white/70 text-[0.75rem] font-semibold mb-0.5">Conexão segura</p>
              <p className="text-white/35 text-[0.68rem] leading-relaxed">
                Seus dados são protegidos com criptografia de ponta a ponta. Nunca compartilhamos suas informações.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-[0.65rem] tracking-[0.15em] font-medium uppercase max-[840px]:hidden">
          Workspace privado · Conexão segura · TLS 1.3
        </p>
      </section>

      {/* ── Right panel (card) ── */}
      <section className="relative w-full h-full flex items-center justify-center bg-[#f8fafc] p-8 overflow-hidden max-[840px]:absolute max-[840px]:bottom-0 max-[840px]:left-0 max-[840px]:h-[72%] max-[480px]:h-[82%] max-[840px]:bg-transparent max-[840px]:p-6 max-[480px]:p-0 max-[840px]:items-end z-20">
        <div className="w-full max-w-[420px] max-[840px]:max-w-[460px] max-[840px]:rounded-b-none max-[840px]:rounded-t-[24px] max-h-[calc(100vh-4rem)] max-[840px]:max-h-full overflow-y-auto bg-white rounded-2xl px-9 py-8 max-[840px]:px-7 max-[840px]:py-7 max-[480px]:px-5 max-[480px]:py-6 border border-[#e2e8f0] max-[840px]:border-white/25 text-[#0f172a] shadow-[0_10px_40px_-8px_rgba(0,0,0,0.08)] max-[840px]:shadow-[0_-12px_40px_rgba(0,0,0,0.28)] max-[840px]:backdrop-blur-[16px] max-[840px]:bg-white/96 animate-card-enter scrollbar-fine">

          {/* Card header */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
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
            {step !== "success" && (
              <Link
                to={ROUTES.root}
                className="flex items-center gap-1.5 text-[#64748b] hover:text-[#2563eb] text-xs font-semibold transition-colors duration-200 group/back no-underline">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover/back:-translate-x-0.5">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Voltar
              </Link>
            )}
          </div>

          {/* Step dots */}
          {step !== "success" && (
            <div className="mb-6">
              <StepDots current={step} />
            </div>
          )}

          {/* ── Step 1: Email ─────────────────────────────────── */}
          {step === "email" && (
            <div className="animate-card-enter">
              <h2 className="text-[1.35rem] font-bold tracking-tight text-[#0f172a] leading-snug mb-1">
                Recuperar acesso
              </h2>
              <p className="text-[#64748b] text-sm mb-7">
                Informe seu e-mail para receber o código de verificação.
              </p>

              <form onSubmit={handleEmailSubmit} noValidate>
                <div className="flex flex-col mb-5">
                  <label htmlFor="reset-email" className="block text-[0.68rem] font-semibold text-[#475569] mb-1.5 uppercase tracking-[0.06em]">
                    E-mail
                  </label>
                  <div className={`group/input relative flex items-center w-full ${emailShake ? "animate-elastic-shake" : ""}`}>
                    <span className="absolute left-3.5 text-[#94a3b8] group-focus-within/input:text-[#2563eb] flex items-center pointer-events-none transition-colors duration-200 z-10">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" /><path d="M22 6l-10 7L2 6" />
                      </svg>
                    </span>
                    <input
                      id="reset-email" type="email" value={email} placeholder="nome@empresa.com"
                      autoComplete="email"
                      onChange={(e) => { setEmail(e.target.value); if (emailTouched) setEmailError(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) ? undefined : "Informe um e-mail válido."); }}
                      onBlur={() => { setEmailTouched(true); setEmailError(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Informe um e-mail válido."); }}
                      aria-invalid={!!(emailError && emailTouched)}
                      className={`w-full py-3 pl-10 pr-4 rounded-lg bg-white border text-sm font-medium placeholder-[#94a3b8] transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 ${
                        emailError && emailTouched
                          ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,0.12)]"
                          : "border-[#e2e8f0] focus:border-[#3b82f6] focus:ring-[rgba(37,99,235,0.15)]"
                      }`}
                    />
                  </div>
                  {emailError && emailTouched && (
                    <span className="flex items-center gap-1 mt-1.5 text-[#ef4444] text-[0.72rem] font-semibold animate-fade-slide" role="alert">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {emailError}
                    </span>
                  )}
                </div>

                <button type="submit"
                  className="group/btn w-full py-[13px] px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:shadow-[0_4px_14px_rgba(37,99,235,0.35)] active:scale-[0.985] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
                  disabled={status === "loading"} aria-busy={status === "loading"}>
                  {status === "loading" ? (
                    <svg className="animate-spinner-rotate w-5 h-5" viewBox="0 0 50 50">
                      <circle className="stroke-white [stroke-linecap:round] animate-spinner-dash" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                    </svg>
                  ) : (
                    <>
                      <span>Enviar código de verificação</span>
                      <svg className="transition-transform duration-200 group-hover/btn:translate-x-0.5 opacity-70" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── Step 2: OTP ───────────────────────────────────── */}
          {step === "code" && (
            <div className="animate-card-enter">
              <h2 className="text-[1.35rem] font-bold tracking-tight text-[#0f172a] leading-snug mb-1">
                Digite o código
              </h2>
              <p className="text-[#64748b] text-sm mb-1.5">
                Código enviado para{" "}
                <span className="font-semibold text-[#0f172a]">{email}</span>
              </p>
              <button type="button" onClick={() => setStep("email")} className="text-[0.72rem] text-[#3b82f6] font-medium hover:text-[#2563eb] transition-colors mb-7 bg-transparent border-none p-0 cursor-pointer">
                Trocar e-mail
              </button>

              <form onSubmit={handleOtpSubmit} noValidate>
                <div className="mb-2">
                  <OtpInput value={otp} onChange={setOtp} shake={otpShake} />
                  {otpError && (
                    <p className="flex items-center gap-1 mt-2 text-[#ef4444] text-[0.72rem] font-semibold animate-fade-slide" role="alert">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {otpError}
                    </p>
                  )}
                </div>

                {/* Resend */}
                <div className="flex items-center justify-between mb-7 mt-3">
                  <span className="text-[#94a3b8] text-xs">Não recebeu?</span>
                  {canResend ? (
                    <button type="button" onClick={() => { resend(); setOtp(""); }}
                      className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors bg-transparent border-none p-0 cursor-pointer">
                      Reenviar código
                    </button>
                  ) : (
                    <span className="text-xs text-[#94a3b8] font-medium tabular-nums">
                      Reenviar em {seconds}s
                    </span>
                  )}
                </div>

                <button type="submit"
                  className="group/btn w-full py-[13px] px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:shadow-[0_4px_14px_rgba(37,99,235,0.35)] active:scale-[0.985] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={status === "loading"} aria-busy={status === "loading"}>
                  {status === "loading" ? (
                    <svg className="animate-spinner-rotate w-5 h-5" viewBox="0 0 50 50">
                      <circle className="stroke-white [stroke-linecap:round] animate-spinner-dash" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                    </svg>
                  ) : (
                    <>
                      <span>Verificar código</span>
                      <svg className="transition-transform duration-200 group-hover/btn:translate-x-0.5 opacity-70" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── Step 3: New password ─────────────────────────── */}
          {step === "password" && (
            <div className="animate-card-enter">
              <h2 className="text-[1.35rem] font-bold tracking-tight text-[#0f172a] leading-snug mb-1">
                Criar nova senha
              </h2>
              <p className="text-[#64748b] text-sm mb-7">
                Escolha uma senha segura para proteger sua conta.
              </p>

              <form onSubmit={handlePasswordSubmit} noValidate>
                {/* New password */}
                <div className={`flex flex-col mb-4 ${pwShake ? "animate-elastic-shake" : ""}`}>
                  <label htmlFor="new-password" className="block text-[0.68rem] font-semibold text-[#475569] mb-1.5 uppercase tracking-[0.06em]">
                    Nova Senha
                  </label>
                  <div className="group/input relative flex items-center w-full">
                    <span className="absolute left-3.5 text-[#94a3b8] group-focus-within/input:text-[#2563eb] flex items-center pointer-events-none transition-colors duration-200 z-10">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <input id="new-password" type={showNew ? "text" : "password"} value={newPassword}
                      placeholder="Mín. 8 caracteres" autoComplete="new-password"
                      onChange={(e) => { setNewPassword(e.target.value); if (pwTouched) setPwError(e.target.value.length >= 8 ? undefined : "Use ao menos 8 caracteres."); }}
                      onBlur={() => { setPwTouched(true); setPwError(newPassword.length >= 8 ? undefined : "Use ao menos 8 caracteres."); }}
                      className={`w-full py-3 pl-10 pr-11 rounded-lg bg-white border text-sm font-medium placeholder-[#94a3b8] transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 ${pwError && pwTouched ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,0.12)]" : "border-[#e2e8f0] focus:border-[#3b82f6] focus:ring-[rgba(37,99,235,0.15)]"}`}
                    />
                    <button type="button" onClick={() => setShowNew((c) => !c)}
                      className="absolute right-3.5 text-[#94a3b8] hover:text-[#0f172a] transition-colors cursor-pointer p-0 z-10 bg-transparent border-none"
                      aria-label={showNew ? "Ocultar" : "Mostrar"}>
                      {showNew ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                  {pwError && pwTouched && (
                    <span className="flex items-center gap-1 mt-1.5 text-[#ef4444] text-[0.72rem] font-semibold animate-fade-slide" role="alert">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {pwError}
                    </span>
                  )}
                  {!showNew && newPassword && <PasswordStrengthBar metrics={metrics} />}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col mb-6">
                  <label htmlFor="confirm-password" className="block text-[0.68rem] font-semibold text-[#475569] mb-1.5 uppercase tracking-[0.06em]">
                    Confirmar Senha
                  </label>
                  <div className="group/input relative flex items-center w-full">
                    <span className="absolute left-3.5 text-[#94a3b8] group-focus-within/input:text-[#2563eb] flex items-center pointer-events-none transition-colors duration-200 z-10">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <input id="confirm-password" type={showConfirm ? "text" : "password"} value={confirmPassword}
                      placeholder="Repita a senha" autoComplete="new-password"
                      onChange={(e) => { setConfirmPassword(e.target.value); if (confirmTouched) setConfirmError(e.target.value === newPassword ? undefined : "As senhas não coincidem."); }}
                      onBlur={() => { setConfirmTouched(true); setConfirmError(confirmPassword === newPassword ? undefined : "As senhas não coincidem."); }}
                      className={`w-full py-3 pl-10 pr-11 rounded-lg bg-white border text-sm font-medium placeholder-[#94a3b8] transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 ${confirmError && confirmTouched ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,0.12)]" : "border-[#e2e8f0] focus:border-[#3b82f6] focus:ring-[rgba(37,99,235,0.15)]"}`}
                    />
                    <button type="button" onClick={() => setShowConfirm((c) => !c)}
                      className="absolute right-3.5 text-[#94a3b8] hover:text-[#0f172a] transition-colors cursor-pointer p-0 z-10 bg-transparent border-none"
                      aria-label={showConfirm ? "Ocultar" : "Mostrar"}>
                      {showConfirm ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                  {confirmError && confirmTouched && (
                    <span className="flex items-center gap-1 mt-1.5 text-[#ef4444] text-[0.72rem] font-semibold animate-fade-slide" role="alert">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {confirmError}
                    </span>
                  )}
                </div>

                <button type="submit"
                  className="group/btn w-full py-[13px] px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:shadow-[0_4px_14px_rgba(37,99,235,0.35)] active:scale-[0.985] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={status === "loading"} aria-busy={status === "loading"}>
                  {status === "loading" ? (
                    <svg className="animate-spinner-rotate w-5 h-5" viewBox="0 0 50 50">
                      <circle className="stroke-white [stroke-linecap:round] animate-spinner-dash" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                    </svg>
                  ) : (
                    <>
                      <span>Redefinir senha</span>
                      <svg className="transition-transform duration-200 group-hover/btn:translate-x-0.5 opacity-70" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── Step 4: Success ──────────────────────────────── */}
          {step === "success" && (
            <div className="animate-card-enter flex flex-col items-center text-center py-4">
              {/* Success icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-[#10b981]/10 flex items-center justify-center animate-pop-in">
                  <div className="w-14 h-14 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                {/* Ripple */}
                <div className="absolute inset-0 rounded-full bg-[#10b981]/10 animate-ping opacity-60" style={{ animationDuration: "1.5s", animationIterationCount: "3" }} />
              </div>

              <h2 className="text-[1.5rem] font-bold text-[#0f172a] tracking-tight mb-2">
                Senha redefinida!
              </h2>
              <p className="text-[#64748b] text-sm leading-relaxed max-w-[280px] mb-8">
                Sua senha foi alterada com sucesso. Você já pode entrar com sua nova senha.
              </p>

              <Link to={ROUTES.root}
                className="group/btn w-full py-[13px] px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#0f172a] text-white hover:bg-[#1e293b] hover:shadow-[0_4px_14px_rgba(15,23,42,0.2)] active:scale-[0.985] transition-all duration-200 no-underline">
                <span>Ir para o login</span>
                <svg className="transition-transform duration-200 group-hover/btn:translate-x-0.5 opacity-60" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;
