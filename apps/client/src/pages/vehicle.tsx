import { useMemo, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { vehiclesApi } from "@/api/vehicles"
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses"
import { useDeleteVehicle } from "@/hooks/use-vehicles"
import { useVehicleStats } from "@/hooks/use-stats"
import { useAuthStore } from "@/lib/auth-store"
import { ExpenseDialog } from "@/components/expense-dialog"
import { CategoryPieChart } from "@/components/charts/category-pie-chart"
import { MonthlyLineChart } from "@/components/charts/monthly-line-chart"
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
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Gauge,
  Trash2,
  Calendar,
  Car,
  Download,
  Fuel,
  Pencil,
  Search,
  ArrowUpDown,
} from "lucide-react"

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

type SortField = "date" | "amount"
type SortDir = "asc" | "desc"

export function VehiclePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [catFilter, setCatFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const token = useAuthStore((s) => s.accessToken)

  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehiclesApi.getOne(id!),
    enabled: !!id,
  })

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(id)
  const { data: stats } = useVehicleStats(id!)
  const deleteVehicle = useDeleteVehicle()
  const deleteExpense = useDeleteExpense()

  const isLoading = vehicleLoading || expensesLoading

  const categories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string }>()
    expenses.forEach((e) => map.set(e.category.slug, e.category))
    return Array.from(map.values())
  }, [expenses])

  const filtered = useMemo(() => {
    let list = expenses

    if (catFilter !== "all") {
      list = list.filter((e) => e.category.slug === catFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.category.name.toLowerCase().includes(q),
      )
    }

    list = [...list].sort((a, b) => {
      if (sortField === "amount") {
        return sortDir === "desc" ? b.amount - a.amount : a.amount - b.amount
      }
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return sortDir === "desc" ? db - da : da - db
    })

    return list
  }, [expenses, catFilter, search, sortField, sortDir])

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0)

  const handleDeleteVehicle = () => {
    if (!confirm("Удалить автомобиль и все его расходы?")) return
    deleteVehicle.mutate(id!, { onSuccess: () => navigate("/") })
  }

  const handleExportCsv = () => {
    const url = `/api/expenses/export/csv?vehicleId=${id}`
    const a = document.createElement("a")
    a.href = url
    a.download = "expenses.csv"
    // Add auth header via fetch
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        a.href = url
        a.click()
        URL.revokeObjectURL(url)
      })
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
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportCsv} className="sm:hidden h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <ExpenseDialog vehicleId={vehicle.id} />
          <Button variant="outline" size="icon" onClick={handleDeleteVehicle} className="h-8 w-8 sm:h-9 sm:w-9">
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего расходов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatAmount(stats?.total ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Записей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Категорий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Object.keys(stats?.byCategory ?? {}).length}
            </p>
          </CardContent>
        </Card>
        {stats?.avgFuelCostPer100km !== null &&
          stats?.avgFuelCostPer100km !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Fuel className="h-3 w-3" />
                  Топливо / 100 км
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatAmount(stats.avgFuelCostPer100km)}
                </p>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Charts */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">По категориям</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={stats.byCategory} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Динамика расходов</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyLineChart data={stats.byMonth} />
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      {/* Expense list toolbar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[180px] sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[180px]">
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
        <Select
          value={`${sortField}-${sortDir}`}
          onValueChange={(v) => {
            const [f, d] = v.split("-") as [SortField, SortDir]
            setSortField(f)
            setSortDir(d)
          }}
        >
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[200px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Дата: новые</SelectItem>
            <SelectItem value="date-asc">Дата: старые</SelectItem>
            <SelectItem value="amount-desc">Сумма: больше</SelectItem>
            <SelectItem value="amount-asc">Сумма: меньше</SelectItem>
          </SelectContent>
        </Select>
        {catFilter !== "all" && (
          <p className="text-sm text-muted-foreground">
            Итого: {formatAmount(totalFiltered)}
          </p>
        )}
      </div>

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
              className="flex items-center gap-3 sm:gap-4 rounded-lg border px-3 sm:px-4 py-3"
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
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
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
                  {expense.liters && expense.pricePerLiter && (
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      {expense.liters} л × {expense.pricePerLiter} руб.
                      {expense.bonuses ? ` (−${expense.bonuses} бонусы)` : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="font-semibold text-sm sm:text-base">
                  {formatAmount(expense.amount)}
                </span>
                <ExpenseDialog
                  vehicleId={vehicle.id}
                  expense={expense}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  }
                />
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
