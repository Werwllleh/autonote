import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react"
import { authApi } from "@/api/auth"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsPending(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || "Не удалось отправить запрос. Попробуйте снова.")
    } finally {
      setIsPending(false)
    }
  }

  if (sent) {
    return (
      <div className="relative min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased flex flex-col justify-between p-4 sm:p-8 overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(226,232,240,0.8),transparent_100%)]" />

        {/* Top Header Bar */}
        <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2">
          <Link to="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white font-black text-xs shadow-sm">
              AN
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-slate-950 text-sm">AUTONOTES</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                ЦИФРОВОЙ ГАРАЖ
              </span>
            </div>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/80 backdrop-blur-md transition-all shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ко входу</span>
          </Link>
        </header>

        {/* Center Card */}
        <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-2xs">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
              [ ПИСЬМО ОТПРАВЛЕНО ]
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">
              ПРОВЕРЬТЕ ПОЧТУ
            </h1>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Если аккаунт с адресом <strong className="text-slate-950 font-semibold">{email}</strong> зарегистрирован,
              мы отправили на него ссылку для сброса пароля.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Ссылка действует в течение 1 часа. Не забудьте проверить папку «Спам».
            </p>

            <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
              <Link
                to="/login"
                className="w-full h-12 rounded-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Вернуться ко входу</span>
              </Link>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Указать другой email
              </button>
            </div>
          </div>
        </main>

        <footer className="relative z-10 w-full max-w-5xl mx-auto py-2 text-center text-[11px] font-mono text-slate-400">
          AUTONOTES PLATFORM • 2026 • AI-МЕХАНИК ИВАНЫЧ
        </footer>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased flex flex-col justify-between p-4 sm:p-8 overflow-hidden">
      {/* Soft Ambient Radial Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(226,232,240,0.8),transparent_100%)]" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <Link to="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white font-black text-xs shadow-sm">
            AN
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-slate-950 text-sm">AUTONOTES</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              ЦИФРОВОЙ ГАРАЖ
            </span>
          </div>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/80 backdrop-blur-md transition-all shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Ко входу</span>
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">
          {/* Card Meta & Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                [ ВОССТАНОВЛЕНИЕ ДОСТУПА ]
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono text-slate-600 font-semibold">
                <Mail className="h-3 w-3" />
                EMAIL RESET
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 pt-1">
              СБРОС ПАРОЛЯ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Отправим ссылку для создания нового пароля
            </p>
          </div>

          {/* Ivanych Speech Bubble */}
          <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 flex items-start gap-3">
            <img
              src="/avatars/ivanych.webp"
              alt="Иваныч"
              className="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
              onError={(e) => {
                ;(e.currentTarget as HTMLElement).style.display = "none"
              }}
            />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-950 block">Иваныч на связи:</span>
              Забыл пароль от гаража? Бывает! Введи адрес электронной почты, я пришлю ссылку на сброс.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold"
              >
                Email учетной записи
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors shadow-2xs"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isPending ? "Отправка..." : "Получить ссылку для сброса"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Вспомнили пароль?{" "}
              <Link to="/login" className="font-bold text-slate-950 hover:underline">
                Войти в аккаунт
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer Telemetry */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto py-2 text-center text-[11px] font-mono text-slate-400">
        AUTONOTES PLATFORM • 2026 • AI-МЕХАНИК ИВАНЫЧ
      </footer>
    </div>
  )
}
