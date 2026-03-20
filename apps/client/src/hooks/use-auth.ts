import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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

export function useLogin() {
  const { setTokens } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      qc.invalidateQueries({ queryKey: ["auth"] })
      navigate("/dashboard")
    },
  })
}

export function useRegister() {
  const { setTokens } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      qc.invalidateQueries({ queryKey: ["auth"] })
      navigate("/dashboard")
    },
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
