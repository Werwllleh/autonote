import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/lib/auth-store"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
