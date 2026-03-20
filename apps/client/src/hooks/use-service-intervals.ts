import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { serviceIntervalsApi } from "@/api/service-intervals"

export function useServiceIntervals(vehicleId?: string) {
  return useQuery({
    queryKey: ["service-intervals", vehicleId],
    queryFn: () => serviceIntervalsApi.getAll(vehicleId!),
    enabled: !!vehicleId,
  })
}

export function useCreateServiceInterval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serviceIntervalsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-intervals"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}

export function useUpdateServiceInterval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; intervalKm?: number; intervalMonths?: number; lastServiceDate?: string; lastServiceMileage?: number }) =>
      serviceIntervalsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-intervals"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}

export function useDeleteServiceInterval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serviceIntervalsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-intervals"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}
