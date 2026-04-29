import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Mail, ArrowLeft } from "lucide-react"
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
    } catch (err: any) {
      const msg = err?.response?.data?.message
      if (msg === "Email already in use") {
        setError("Email уже используется")
      } else {
        setError("Ошибка регистрации")
      }
    } finally {
      setIsPending(false)
    }
  }

  if (sent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 blur-3xl" />
        </div>
        <Card className="relative w-full max-w-sm border-border/50 shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10">
              <Mail className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle className="text-xl">Проверьте почту</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Мы отправили письмо на <span className="font-medium text-foreground">{email}</span>.
              Перейдите по ссылке в письме, чтобы подтвердить регистрацию.
            </p>
            <p className="text-xs text-muted-foreground">
              Не получили письмо? Проверьте папку «Спам».
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Перейти к входу
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-amber-500/10 to-rose-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-sm border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
            <Car className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Регистрация</CardTitle>
          <p className="text-sm text-muted-foreground">Создайте аккаунт за 30 секунд</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Необязательно"
              />
            </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Создание..." : "Создать аккаунт"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Войти
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
