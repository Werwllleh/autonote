import { api } from "./client"
import type { Expense } from "./expenses"

export interface VehicleStats {
  total: number
  expensesTotal: number
  stockValue: number
  count: number
  byCategory: Record<string, number>
  byMonth: Record<string, number>
  avgFuelCostPer100km: number | null
  avgLitersPer100km: number | null
  currentMonthTotal: number
  prevMonthTotal: number
  monthlyAvg: number
  yearlyForecast: number
  costPerKm: number | null
}

export interface OverallStats {
  total: number
  expensesTotal: number
  stockValue: number
  count: number
  byCategory: Record<string, number>
  byMonth: Record<string, number>
  byVehicle: Record<string, { name: string; total: number }>
  currentMonthTotal: number
  prevMonthTotal: number
}

export interface Reminder {
  type: "insurance" | "service"
  title: string
  vehicleId: string
  vehicleName: string
  dueDate?: string
  dueKm?: number
  urgency: "info" | "warning" | "critical"
}

export const statsApi = {
  overall: () => api.get<OverallStats>("/stats").then((r) => r.data),
  vehicle: (id: string) =>
    api.get<VehicleStats>(`/stats/vehicles/${id}`).then((r) => r.data),
  recent: (limit = 5) =>
    api.get<Expense[]>(`/stats/recent?limit=${limit}`).then((r) => r.data),
  reminders: () =>
    api.get<Reminder[]>("/stats/reminders").then((r) => r.data),
}
