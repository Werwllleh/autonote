import { api } from "./client"

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: string
}

export const userApi = {
  getProfile: () =>
    api.get<UserProfile>("/user/profile").then((r) => r.data),

  updateEmail: (data: { email: string; currentPassword: string }) =>
    api.put<UserProfile>("/user/email", data).then((r) => r.data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/user/password", data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const fd = new FormData()
    fd.append("file", file)
    return api.put<UserProfile>("/user/avatar", fd).then((r) => r.data)
  },

  removeAvatar: () =>
    api.delete<UserProfile>("/user/avatar").then((r) => r.data),

  deleteAccount: (password: string) =>
    api.delete("/user/account", { data: { password } }).then((r) => r.data),
}
