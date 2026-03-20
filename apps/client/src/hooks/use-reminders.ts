import { useQuery } from "@tanstack/react-query"
import { statsApi } from "@/api/stats"

export function useReminders() {
  return useQuery({
    queryKey: ["stats", "reminders"],
    queryFn: statsApi.reminders,
  })
}

export function useRecentExpenses(limit = 5) {
  return useQuery({
    queryKey: ["stats", "recent", limit],
    queryFn: () => statsApi.recent(limit),
  })
}
