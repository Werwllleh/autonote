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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}

interface UpdateExpensePayload {
  id: string
  amount: number
  date: string
  description?: string
  mileage?: number
  vehicleId: string
  categoryId: string
  liters?: number | null
  pricePerLiter?: number | null
  bonuses?: number | null
  parts?: { article?: string; name: string; quantity: number; price: number }[] | null
  laborCost?: number | null
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateExpensePayload) =>
      expensesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}
