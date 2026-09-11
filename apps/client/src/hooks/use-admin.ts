import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
  })
}

export function useAdminUsers(page = 1, search?: string, unverifiedOnly?: boolean) {
  return useQuery({
    queryKey: ["admin", "users", page, search, unverifiedOnly],
    queryFn: () => adminApi.getUsers(page, search, unverifiedOnly),
  })
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  })
}

export function useAdminVehicleCard(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "vehicles", id],
    queryFn: () => adminApi.getVehicleCard(id!),
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
