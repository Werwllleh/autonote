import { useState, useEffect, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useLogin } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "lucide-react"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const login = useLogin()
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (accessToken) navigate("/dashboard", { replace: true })
  }, [accessToken, navigate])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Вход в AutoNotes</CardTitle>
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
            {login.error && (
              <p className="text-sm text-destructive">
                Неверный email или пароль
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Вход..." : "Войти"}
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
