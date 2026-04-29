import { Navigate } from "react-router-dom"
import { useMe } from "@/hooks/use-auth"

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
