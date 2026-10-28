import { useState, useEffect, useRef, type FormEvent } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Loader2, KeyRound } from "lucide-react"
import { authApi } from "@/api/auth"

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get("token")
  const navigate = useNavigate()
  const { setTokens } = useAuthStore()

  const [tokenStatus, setTokenStatus] = useState<"checking" | "valid" | "invalid">(
    token ? "checking" : "invalid"
  )
  const [tokenError, setTokenError] = useState(
    token ? "" : "Ссылка для сброса пароля не содержит токена"
  )

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!token) return

    let cancelled = false
    authApi
      .validateResetToken(token)
      .then(() => {
        if (!cancelled) setTokenStatus("valid")
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Ссылка для сброса недействительна или срок её действия истёк"
          setTokenStatus("invalid")
          setTokenError(msg)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов")
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    if (!token) {
      setError("Отсутствует токен сброса пароля")
      return
    }

    setIsPending(true)
    try {
      const data = await authApi.resetPassword({ token, password })
      setTokens(data.accessToken, data.refreshToken)
      setSuccess(true)
      timerRef.current = setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Не удалось сбросить пароль. Возможно, ссылка устарела."
      setError(msg)
    } finally {
      setIsPending(false)
    }
  }

  // Success view
  if (success) {
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

            <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-1">
              [ УСПЕШНО ]
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">
              ПАРОЛЬ ОБНОВЛЁН
            </h1>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Новый пароль установлен. Сейчас перенаправим вас в гараж...
            </p>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (timerRef.current) clearTimeout(timerRef.current)
                  navigate("/dashboard")
                }}
                className="w-full h-12 rounded-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <span>Перейти в гараж</span>
                <ArrowRight className="h-4 w-4" />
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

  // Token checking view
  if (tokenStatus === "checking") {
    return (
      <div className="relative min-h-screen bg-[#F8F9FA] text-slate-900 flex items-center justify-center p-4">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 max-w-sm w-full text-center shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-900">Проверяем ссылку...</p>
        </div>
      </div>
    )
  }

  // Invalid token view
  if (tokenStatus === "invalid") {
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
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs">
              <XCircle className="h-7 w-7" />
            </div>

            <div className="font-mono text-xs uppercase tracking-widest text-rose-600 font-semibold mb-1">
              [ ОШИБКА ССЫЛКИ ]
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">
              ССЫЛКА УСТАРЕЛА
            </h1>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {tokenError || "Срок действия ссылки истёк или она уже была использована."}
            </p>

            <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
              <Link
                to="/forgot-password"
                className="w-full h-12 rounded-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <span>Запросить ссылку снова</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Вернуться ко входу
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
                [ НОВЫЙ ДОСТУП ]
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono text-slate-600 font-semibold">
                <KeyRound className="h-3 w-3" />
                NEW PASSWORD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 pt-1">
              НОВЫЙ ПАРОЛЬ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Придумайте новый надёжный пароль для входа
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
              Задай новый надёжный пароль от 6 символов, чтобы гараж оставался под защитой.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold"
              >
                Новый пароль
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold"
              >
                Повторите пароль
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите новый пароль"
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
              <span>{isPending ? "Сохранение..." : "Сохранить новый пароль"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Вспомнили старый пароль?{" "}
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
