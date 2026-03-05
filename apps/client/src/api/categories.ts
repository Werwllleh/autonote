import { api } from "./client"

export interface Category {
  id: string
  name: string
  slug: string
}

export const categoriesApi = {
  getAll: () => api.get<Category[]>("/categories").then((r) => r.data),
}
