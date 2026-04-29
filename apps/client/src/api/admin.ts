import { api } from "./client"

export interface AdminStats {
  userCount: number
  vehicleCount: number
  expenseCount: number
  totalAmount: number
  recentUsers: { id: string; email: string; name: string | null; createdAt: string }[]
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: "USER" | "ADMIN"
  createdAt: string
  updatedAt: string
  vehicleCount: number
  expenseCount: number
  expenseTotal: number
}

export interface AdminUserDetail {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: "USER" | "ADMIN"
  createdAt: string
  updatedAt: string
  vehicles: {
    id: string
    brand: string
    model: string
    year: number
    mileage: number
    _count: { expenses: number }
  }[]
}

export interface UsersResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}

export const adminApi = {
  getStats: () => api.get<AdminStats>("/admin/stats").then((r) => r.data),
  getUsers: (page = 1, search?: string) =>
    api.get<UsersResponse>("/admin/users", { params: { page, search } }).then((r) => r.data),
  getUser: (id: string) => api.get<AdminUserDetail>(`/admin/users/${id}`).then((r) => r.data),
  updateRole: (id: string, role: "USER" | "ADMIN") =>
    api.put(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`).then((r) => r.data),
}
