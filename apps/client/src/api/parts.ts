import { api } from "./client"

export interface Part {
  id: string
  name: string
  article: string | null
  quantity: number
  price: number
  vehicleId: string
  createdAt: string
  updatedAt: string
}

interface CreatePartPayload {
  name: string
  article?: string
  quantity: number
  price: number
  vehicleId: string
}

interface UpdatePartPayload {
  name?: string
  article?: string
  quantity?: number
  price?: number
}

export const partsApi = {
  getAll: (vehicleId: string) =>
    api.get<Part[]>("/parts", { params: { vehicleId } }).then((r) => r.data),
  create: (data: CreatePartPayload) =>
    api.post<Part>("/parts", data).then((r) => r.data),
  update: (id: string, data: UpdatePartPayload) =>
    api.put<Part>(`/parts/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/parts/${id}`),
}
