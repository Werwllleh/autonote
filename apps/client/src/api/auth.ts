import { api } from "./client"

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface RegisterPayload {
  email: string
  password: string
  name?: string
}

interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthTokens>("/auth/register", data).then((r) => r.data),
  login: (data: LoginPayload) =>
    api.post<AuthTokens>("/auth/login", data).then((r) => r.data),
  me: () =>
    api.get<{ id: string; email: string; name: string | null; avatar: string | null }>("/auth/me").then((r) => r.data),
}
