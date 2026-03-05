import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { vehiclesApi } from "@/api/vehicles"

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: vehiclesApi.getAll,
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: vehiclesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  })
}

export function useUpdateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof vehiclesApi.update>[1]) =>
      vehiclesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: vehiclesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  })
}
