import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  tiresApi,
  type CreateTirePayload,
  type UpdateTirePayload,
  type MountTirePayload,
} from "@/api/tires"

export function useTires(vehicleId?: string) {
  return useQuery({
    queryKey: ["tires", vehicleId],
    queryFn: () => tiresApi.getAll(vehicleId!),
    enabled: !!vehicleId,
  })
}

export function useCreateTire(vehicleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTirePayload) => tiresApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tires", vehicleId] })
      qc.invalidateQueries({ queryKey: ["vehicles", vehicleId] })
    },
  })
}

export function useUpdateTire(vehicleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTirePayload }) =>
      tiresApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tires", vehicleId] })
    },
  })
}

export function useDeleteTire(vehicleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tiresApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tires", vehicleId] })
    },
  })
}

export function useMountTire(vehicleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MountTirePayload }) =>
      tiresApi.mount(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tires", vehicleId] })
      qc.invalidateQueries({ queryKey: ["vehicles", vehicleId] })
      qc.invalidateQueries({ queryKey: ["expenses", vehicleId] })
      qc.invalidateQueries({ queryKey: ["stats", vehicleId] })
    },
  })
}
