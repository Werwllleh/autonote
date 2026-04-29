import { useState, useEffect, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Mail } from "lucide-react"
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
    } catch (err: any) {
      const msg = err?.response?.data?.message
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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-sm border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
            <Car className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Вход в AutoNotes</CardTitle>
          <p className="text-sm text-muted-foreground">Учёт расходов на автомобиль</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {notVerified && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Email не подтверждён. Проверьте почту.</span>
                </div>
                {resent ? (
                  <p className="text-xs text-emerald-600">Письмо отправлено повторно!</p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    disabled={resending}
                    onClick={handleResend}
                  >
                    {resending ? "Отправка..." : "Отправить письмо повторно"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Вход..." : "Войти"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
