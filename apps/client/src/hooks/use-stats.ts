import { useQuery } from "@tanstack/react-query"
import { statsApi } from "@/api/stats"

export function useOverallStats() {
  return useQuery({
    queryKey: ["stats", "overall"],
    queryFn: statsApi.overall,
  })
}

export function useVehicleStats(vehicleId: string) {
  return useQuery({
    queryKey: ["stats", "vehicle", vehicleId],
    queryFn: () => statsApi.vehicle(vehicleId),
    enabled: !!vehicleId,
  })
}
