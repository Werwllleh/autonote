import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { authApi } from "@/api/auth"
import { useAuthStore } from "@/lib/auth-store"

export function useMe() {
  const { accessToken } = useAuthStore()
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: !!accessToken,
    retry: false,
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return () => {
    logout()
    qc.clear()
    navigate("/login")
  }
}
