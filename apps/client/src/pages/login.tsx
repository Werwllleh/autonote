import { useState, useEffect, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { authApi } from "@/api/auth"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")
  const [notVerified, setNotVerified] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const navigate = useNavigate()
  const { accessToken, setTokens } = useAuthStore()

  useEffect(() => {
    if (accessToken) navigate("/dashboard", { replace: true })
  }, [accessToken, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setNotVerified(false)
    setIsPending(true)
    try {
      const data = await authApi.login({ email, password })
      setTokens(data.accessToken, data.refreshToken)
      navigate("/dashboard")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (msg === "EMAIL_NOT_VERIFIED") {
        setNotVerified(true)
      } else {
        setError("Неверный email или пароль")
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authApi.resendVerification(email)
      setResent(true)
    } catch {
      // ignore
    } finally {
      setResending(false)
    }
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
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">
          
          {/* Card Meta & Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                [ 01 / АВТОРИЗАЦИЯ ]
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono text-emerald-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI LIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 pt-1">
              ВХОД В ГАРАЖ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Бортовой журнал, регламент ТО и смета запчастей
            </p>
          </div>

          {/* Ivanych Speech Bubble */}
          <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 flex items-start gap-3">
            <img
              src="/avatars/ivanych.webp"
              alt="Иваныч"
              className="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
              onError={(e) => {
                // Fallback to stylized icon if avatar image not accessible
                (e.currentTarget as HTMLElement).style.display = "none"
              }}
            />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-950 block">Иваныч на связи:</span>
              Введи данные аккаунта, чтобы открыть автомобиль и бортовую историю трат.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors shadow-2xs"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {notVerified && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
                  <Mail className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Email не подтверждён. Проверьте почтовый ящик.</span>
                </div>
                {resent ? (
                  <p className="text-xs text-emerald-700 font-semibold">Письмо отправлено повторно!</p>
                ) : (
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResend}
                    className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
                  >
                    {resending ? "Отправка..." : "Отправить письмо повторно →"}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isPending ? "Вход..." : "Войти в гараж"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Впервые в AutoNotes?{" "}
              <Link to="/register" className="font-bold text-slate-950 hover:underline">
                Создать гараж бесплатно
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
