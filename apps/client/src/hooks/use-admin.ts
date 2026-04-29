import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
  })
}

export function useAdminUsers(page = 1, search?: string) {
  return useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn: () => adminApi.getUsers(page, search),
  })
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: "USER" | "ADMIN" }) =>
      adminApi.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  })
}
