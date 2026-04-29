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
    api.post<{ message: string }>("/auth/register", data).then((r) => r.data),
  login: (data: LoginPayload) =>
    api.post<AuthTokens>("/auth/login", data).then((r) => r.data),
  verify: (token: string) =>
    api.get<AuthTokens>("/auth/verify", { params: { token } }).then((r) => r.data),
  resendVerification: (email: string) =>
    api.post<{ message: string }>("/auth/resend-verification", { email }).then((r) => r.data),
  me: () =>
    api.get<{ id: string; email: string; name: string | null; avatar: string | null; role: string }>("/auth/me").then((r) => r.data),
}
