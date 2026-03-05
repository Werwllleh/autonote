import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { expensesApi } from "@/api/expenses"

export function useExpenses(vehicleId?: string) {
  return useQuery({
    queryKey: ["expenses", vehicleId],
    queryFn: () => expensesApi.getAll(vehicleId),
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  })
}
