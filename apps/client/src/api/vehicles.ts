import { api } from "./client"

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  createdAt: string
  updatedAt: string
}

export interface VehicleWithExpenses extends Vehicle {
  totalExpenses?: number
}

interface CreateVehiclePayload {
  brand: string
  model: string
  year: number
  mileage?: number
}

export const vehiclesApi = {
  getAll: () => api.get<Vehicle[]>("/vehicles").then((r) => r.data),
  getOne: (id: string) => api.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),
  create: (data: CreateVehiclePayload) =>
    api.post<Vehicle>("/vehicles", data).then((r) => r.data),
  update: (id: string, data: Partial<CreateVehiclePayload>) =>
    api.put<Vehicle>(`/vehicles/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
}
