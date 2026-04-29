import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { authApi } from "@/api/auth"

export function VerifyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setTokens } = useAuthStore()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  const token = params.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMsg("Отсутствует токен подтверждения")
      return
    }

    authApi
      .verify(token)
      .then((data) => {
        setTokens(data.accessToken, data.refreshToken)
        setStatus("success")
        setTimeout(() => navigate("/dashboard"), 2000)
      })
      .catch((err) => {
        setStatus("error")
        setErrorMsg(
          err?.response?.data?.message || "Неверная или просроченная ссылка",
        )
      })
  }, [token])

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-sm border-border/50 shadow-xl text-center">
        <CardHeader>
          {status === "loading" && (
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {status === "success" && (
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          )}
          {status === "error" && (
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          )}
          <CardTitle className="text-xl">
            {status === "loading" && "Подтверждение..."}
            {status === "success" && "Email подтверждён!"}
            {status === "error" && "Ошибка"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="text-sm text-muted-foreground">Проверяем ссылку...</p>
          )}
          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              Добро пожаловать в AutoNotes! Перенаправляем...
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          )}
        </CardContent>
        {status === "error" && (
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" asChild>
              <Link to="/login">Перейти к входу</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
