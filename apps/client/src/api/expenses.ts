import { api } from "./client"

export interface Part {
  article?: string
  name: string
  quantity: number
  price: number
}

export interface Expense {
  id: string
  amount: number
  date: string
  description: string | null
  mileage: number | null
  liters: number | null
  pricePerLiter: number | null
  bonuses: number | null
  parts: Part[] | null
  laborCost: number | null
  vehicleId: string
  categoryId: string
  createdAt: string
  updatedAt: string
  category: { id: string; name: string; slug: string }
  vehicle: { id: string; brand: string; model: string; year: number }
}

interface CreateExpensePayload {
  amount: number
  date: string
  description?: string
  mileage?: number
  vehicleId: string
  categoryId: string
  liters?: number
  pricePerLiter?: number
  bonuses?: number
  parts?: Part[]
  laborCost?: number
}

export const expensesApi = {
  getAll: (vehicleId?: string) =>
    api
      .get<Expense[]>("/expenses", { params: vehicleId ? { vehicleId } : {} })
      .then((r) => r.data),
  getOne: (id: string) => api.get<Expense>(`/expenses/${id}`).then((r) => r.data),
  create: (data: CreateExpensePayload) =>
    api.post<Expense>("/expenses", data).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<Expense>(`/expenses/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
}
