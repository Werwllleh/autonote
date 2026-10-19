import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { authApi } from "@/api/auth"

export function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }
    setIsPending(true)
    try {
      await authApi.register({ email, password, name: name || undefined })
      setSent(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (msg === "Email already in use") {
        setError("Этот email уже зарегистрирован в системе")
      } else {
        setError("Ошибка регистрации. Попробуйте еще раз.")
      }
    } finally {
      setIsPending(false)
    }
  }

  // Success view (Email Sent)
  if (sent) {
    return (
      <div className="relative min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased flex flex-col justify-between p-4 sm:p-8 overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(226,232,240,0.8),transparent_100%)]" />

        <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2">
          <Link to="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white font-black text-xs shadow-sm">
              AN
            </div>
            <span className="font-extrabold tracking-tight text-slate-950 text-sm">AUTONOTES</span>
          </Link>
        </header>

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
              Мы отправили ссылку для активации аккаунта на <strong className="text-slate-950 font-semibold">{email}</strong>.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Если письмо не пришло в течение пары минут — проверьте папку «Спам».
            </p>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                to="/login"
                className="w-full h-12 rounded-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Перейти ко входу в гараж</span>
              </Link>
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
        <Link
          to="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-80"
        >
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
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/80 backdrop-blur-md transition-all shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>На главную</span>
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">
          
          {/* Card Meta & Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                [ 02 / РЕГИСТРАЦИЯ ]
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono text-emerald-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                БЕСПЛАТНО
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 pt-1">
              СОЗДАТЬ ГАРАЖ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Персональный AI-ассистент и бортовой журнал за 30 секунд
            </p>
          </div>

          {/* Ivanych Speech Bubble */}
          <div className="mt-5 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 flex items-start gap-3">
            <img
              src="/avatars/ivanych.webp"
              alt="Иваныч"
              className="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none"
              }}
            />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-950 block">Иваныч на связи:</span>
              Привет! Я помогу контролировать ТО твоего автомобиля, подбирать артикулы запчастей и вести учет трат без таблиц.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">
                Ваше имя <span className="text-slate-400 font-normal">(необязательно)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Алексей"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Мин. 6 знаков"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">
                  Повтор пароля
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Мин. 6 знаков"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors shadow-2xs"
                />
              </div>
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
              <span>{isPending ? "Создание..." : "Запустить гараж с Иванычем"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Уже есть гараж?{" "}
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
