import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { partsApi } from "@/api/parts"

export function useParts(vehicleId?: string) {
  return useQuery({
    queryKey: ["parts", vehicleId],
    queryFn: () => partsApi.getAll(vehicleId!),
    enabled: !!vehicleId,
  })
}

export function useCreatePart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: partsApi.create,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["parts", data.vehicleId] })
    },
  })
}

export function useUpdatePart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; vehicleId: string; name?: string; article?: string; location?: string; quantity?: number; price?: number }) =>
      partsApi.update(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["parts", variables.vehicleId] })
    },
  })
}

export function useDeletePart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; vehicleId: string }) => partsApi.delete(id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["parts", variables.vehicleId] })
    },
  })
}
