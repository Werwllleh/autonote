import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoriesApi } from "@/api/categories"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => categoriesApi.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  })
}
