import { useMemo, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { vehiclesApi } from "@/api/vehicles"
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses"
import { useDeleteVehicle } from "@/hooks/use-vehicles"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Gauge, Trash2, Calendar, Car } from "lucide-react"

function formatAmount(amount: number) {
  return amount.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function VehiclePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [catFilter, setCatFilter] = useState("all")

  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehiclesApi.getOne(id!),
    enabled: !!id,
  })

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(id)
  const deleteVehicle = useDeleteVehicle()
  const deleteExpense = useDeleteExpense()

  const isLoading = vehicleLoading || expensesLoading

  const categories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string }>()
    expenses.forEach((e) => map.set(e.category.slug, e.category))
    return Array.from(map.values())
  }, [expenses])

  const filtered = useMemo(() => {
    if (catFilter === "all") return expenses
    return expenses.filter((e) => e.category.slug === catFilter)
  }, [expenses, catFilter])

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0)

  const handleDeleteVehicle = () => {
    if (!confirm("Удалить автомобиль и все его расходы?")) return
    deleteVehicle.mutate(id!, { onSuccess: () => navigate("/") })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Автомобиль не найден
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>
        <div className="flex items-center gap-2">
          <AddExpenseDialog vehicleId={vehicle.id} />
          <Button variant="outline" size="icon" onClick={handleDeleteVehicle}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Vehicle info */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Car className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {vehicle.brand} {vehicle.model}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{vehicle.year}</span>
            <span className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {vehicle.mileage.toLocaleString("ru-RU")} км
            </span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего расходов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatAmount(totalFiltered)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Записей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Expense list */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Нет расходов. Добавьте первый!
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 rounded-lg border px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{expense.category.name}</Badge>
                  {expense.description && (
                    <span className="text-sm text-muted-foreground truncate">
                      {expense.description}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(expense.date)}
                  </span>
                  {expense.mileage && (
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {expense.mileage.toLocaleString("ru-RU")} км
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {formatAmount(expense.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (confirm("Удалить расход?")) {
                      deleteExpense.mutate(expense.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
