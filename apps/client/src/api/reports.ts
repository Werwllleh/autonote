import { api } from "./client"

export interface CreateReportResponse {
  token: string
  expiresAt: string
  url: string
}

export interface PublicReportExpense {
  date: string
  category: string
  categorySlug: string
  amount: number
  description: string | null
  mileage: number | null
  parts: { article?: string; name: string; quantity: number; price: number }[] | null
  laborCost: number | null
  liters: number | null
  pricePerLiter: number | null
  bonuses: number | null
  dateFrom: string | null
  dateTo: string | null
  createdAt: string
  updatedAt: string
}

export interface PublicReport {
  vehicle: {
    brand: string
    model: string
    year: number
    mileage: number
    initialMileage: number
    photo: string | null
    vin: string | null
    purchaseDate: string | null
  }
  expenses: PublicReportExpense[]
  totalSpent: number
  byCategory: Record<string, number>
  expenseCount: number
  inventoryParts: {
    name: string
    article: string | null
    quantity: number
    price: number
  }[]
  inventoryTotal: number
  expiresAt: string
}

export const reportsApi = {
  create: (vehicleId: string) =>
    api.post<CreateReportResponse>("/reports", { vehicleId }).then((r) => r.data),
  get: (token: string) =>
    api.get<PublicReport>(`/reports/${token}`).then((r) => r.data),
  revoke: (token: string) =>
    api.delete(`/reports/${token}`).then((r) => r.data),
}
