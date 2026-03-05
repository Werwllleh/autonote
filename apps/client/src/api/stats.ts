import { api } from "./client"

export interface VehicleStats {
  total: number
  count: number
  byCategory: Record<string, number>
  byMonth: Record<string, number>
  avgFuelCostPer100km: number | null
}

export interface OverallStats {
  total: number
  count: number
  byCategory: Record<string, number>
  byMonth: Record<string, number>
  byVehicle: Record<string, { name: string; total: number }>
}

export const statsApi = {
  overall: () => api.get<OverallStats>("/stats").then((r) => r.data),
  vehicle: (id: string) =>
    api.get<VehicleStats>(`/stats/vehicles/${id}`).then((r) => r.data),
}
