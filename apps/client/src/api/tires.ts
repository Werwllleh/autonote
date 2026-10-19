import { api } from "./client"

export type TireSeason = "summer" | "winter_stud" | "winter_friction" | "all_season"

export interface TireSet {
  id: string
  name: string
  season: TireSeason
  size: string | null
  productionYear: number | null
  treadDepth: number | null
  isMounted: boolean
  storageLocation: string | null
  installedMileage: number | null
  installedDate: string | null
  totalMileage: number
  notes: string | null
  vehicleId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTirePayload {
  name: string
  season: TireSeason
  size?: string
  productionYear?: number
  treadDepth?: number
  isMounted?: boolean
  storageLocation?: string
  installedMileage?: number
  totalMileage?: number
  notes?: string
  vehicleId: string
}

export interface UpdateTirePayload {
  name?: string
  season?: TireSeason
  size?: string
  productionYear?: number
  treadDepth?: number
  storageLocation?: string
  totalMileage?: number
  notes?: string
}

export interface MountTirePayload {
  mileage: number
  date?: string
  treadDepth?: number
  createExpense?: boolean
  expenseAmount?: number
  notes?: string
}

export const tiresApi = {
  getAll: (vehicleId: string) =>
    api.get<TireSet[]>(`/vehicles/${vehicleId}/tires`).then((r) => r.data),

  create: (data: CreateTirePayload) =>
    api.post<TireSet>("/tires", data).then((r) => r.data),

  update: (id: string, data: UpdateTirePayload) =>
    api.put<TireSet>(`/tires/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/tires/${id}`).then((r) => r.data),

  mount: (id: string, data: MountTirePayload) =>
    api.post<TireSet>(`/tires/${id}/mount`, data).then((r) => r.data),
}
