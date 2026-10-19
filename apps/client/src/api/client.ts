import axios from "axios"
import { useAuthStore } from "@/lib/auth-store"

export const api = axios.create({
  baseURL: "/api",
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Shared promise for concurrent 401 handling (Single-Flight Pattern)
let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login")
    ) {
      original._retry = true
      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post<{ accessToken: string; refreshToken: string }>("/api/auth/refresh", {
              refreshToken,
            })
            .then(({ data }) => {
              useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
              return data.accessToken
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        const newAccessToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return api(original)
      } catch (refreshErr) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  },
)
