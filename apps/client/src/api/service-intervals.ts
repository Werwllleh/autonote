import { api } from "./client"

export interface ServiceInterval {
  id: string
  name: string
  intervalKm: number | null
  intervalMonths: number | null
  lastServiceDate: string | null
  lastServiceMileage: number | null
  vehicleId: string
  createdAt: string
  updatedAt: string
}

interface CreatePayload {
  name: string
  intervalKm?: number
  intervalMonths?: number
  lastServiceDate?: string
  lastServiceMileage?: number
  vehicleId: string
}

interface UpdatePayload {
  name?: string
  intervalKm?: number
  intervalMonths?: number
  lastServiceDate?: string
  lastServiceMileage?: number
}

export const serviceIntervalsApi = {
  getAll: (vehicleId: string) =>
    api
      .get<ServiceInterval[]>("/service-intervals", { params: { vehicleId } })
      .then((r) => r.data),
  create: (data: CreatePayload) =>
    api.post<ServiceInterval>("/service-intervals", data).then((r) => r.data),
  update: (id: string, data: UpdatePayload) =>
    api.put<ServiceInterval>(`/service-intervals/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/service-intervals/${id}`),
}
