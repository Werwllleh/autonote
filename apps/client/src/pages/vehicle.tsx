import { useMemo, useState, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { vehiclesApi } from "@/api/vehicles"
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses"
import { useDeleteVehicle } from "@/hooks/use-vehicles"
import { useVehicleStats } from "@/hooks/use-stats"
import { useAuthStore } from "@/lib/auth-store"
import { ExpenseDialog } from "@/components/expense-dialog"
import { ImportDialog } from "@/components/import-dialog"
import { EditVehicleDialog } from "@/components/edit-vehicle-dialog"
import { PartsInventory } from "@/components/parts-inventory"
import { ServiceIntervals } from "@/components/service-intervals"
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
  ChevronDown,
  ChevronRight,
  Download,
  Fuel,
  Pencil,
  Receipt,
  Search,
  ArrowUpDown,
  Wrench,
  Camera,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Info,
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

function formatMonthHeader(key: string) {
  const [y, m] = key.split("-")
  const d = new Date(Number(y), Number(m) - 1)
  return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
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
  const [expensesOpen, setExpensesOpen] = useState(false)
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set())
  const [metaOpen, setMetaOpen] = useState(false)
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
  const qc = useQueryClient()
  const photoRef = useRef<HTMLInputElement>(null)

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

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups: { key: string; expenses: typeof filtered; total: number }[] = []
    const map = new Map<string, typeof filtered>()
    for (const e of filtered) {
      const key = e.date.slice(0, 7)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    for (const [key, exps] of map) {
      groups.push({ key, expenses: exps, total: exps.reduce((s, e) => s + e.amount, 0) })
    }
    return groups
  }, [filtered])

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0)

  const toggleMonth = (key: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleDeleteVehicle = () => {
    if (!confirm("Удалить автомобиль и все его расходы?")) return
    deleteVehicle.mutate(id!, { onSuccess: () => navigate("/dashboard") })
  }

  const handleExportCsv = () => {
    const url = `/api/expenses/export/csv?vehicleId=${id}`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const u = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = u
        a.download = "expenses.csv"
        a.click()
        URL.revokeObjectURL(u)
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

  const hasMeta = vehicle.vin || vehicle.licensePlate || vehicle.registrationNumber || vehicle.purchaseDate || vehicle.purchasePrice || vehicle.notes

  // Period comparison
  const monthChange = stats && stats.prevMonthTotal > 0
    ? Math.round(((stats.currentMonthTotal - stats.prevMonthTotal) / stats.prevMonthTotal) * 100)
    : null

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>
        <div className="flex items-center gap-2">
          <EditVehicleDialog vehicle={vehicle} />
          <Button variant="outline" size="icon" onClick={handleDeleteVehicle} className="h-8 w-8 sm:h-9 sm:w-9">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Vehicle info */}
      <div className="flex items-center gap-4">
        <div
          className="relative group flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden cursor-pointer"
          onClick={() => photoRef.current?.click()}
        >
          {vehicle.photo ? (
            <img src={`/api${vehicle.photo}`} alt="" className="h-full w-full object-cover" />
          ) : (
            <Car className="h-6 w-6 text-muted-foreground" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && id) {
                vehiclesApi.uploadPhoto(id, file).then(() => {
                  qc.invalidateQueries({ queryKey: ["vehicles", id] })
                })
              }
              e.target.value = ""
            }}
          />
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
            {vehicle.licensePlate && (
              <span className="font-mono text-xs">{vehicle.licensePlate}</span>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle metadata */}
      {hasMeta && (
        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMetaOpen(!metaOpen)}
          >
            <Info className="h-3.5 w-3.5" />
            <span>Информация об авто</span>
            {metaOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {metaOpen && (
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {vehicle.vin && (
                <div>
                  <span className="text-muted-foreground text-xs">VIN</span>
                  <p className="font-mono text-xs">{vehicle.vin}</p>
                </div>
              )}
              {vehicle.registrationNumber && (
                <div>
                  <span className="text-muted-foreground text-xs">СТС / ПТС</span>
                  <p>{vehicle.registrationNumber}</p>
                </div>
              )}
              {vehicle.purchaseDate && (
                <div>
                  <span className="text-muted-foreground text-xs">Дата покупки</span>
                  <p>{formatDate(vehicle.purchaseDate)}</p>
                </div>
              )}
              {vehicle.purchasePrice && (
                <div>
                  <span className="text-muted-foreground text-xs">Цена покупки</span>
                  <p>{formatAmount(vehicle.purchasePrice)}</p>
                </div>
              )}
              {vehicle.notes && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-muted-foreground text-xs">Заметки</span>
                  <p>{vehicle.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

        {/* This month vs last */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              В этом месяце
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatAmount(stats?.currentMonthTotal ?? 0)}</p>
            {monthChange !== null && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${monthChange > 0 ? "text-destructive" : "text-emerald-500"}`}>
                {monthChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{Math.abs(monthChange)}% к пред. месяцу</span>
              </div>
            )}
          </CardContent>
        </Card>

        {stats?.avgFuelCostPer100km != null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Fuel className="h-3 w-3" />
                Топливо / 100 км
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatAmount(stats.avgFuelCostPer100km)}</p>
              {stats.avgLitersPer100km != null && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  {stats.avgLitersPer100km} л / 100 км
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {stats?.costPerKm != null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                Стоимость км
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.costPerKm.toFixed(1)} ₽</p>
            </CardContent>
          </Card>
        )}

        {stats?.yearlyForecast != null && stats.yearlyForecast > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Прогноз / год
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatAmount(stats.yearlyForecast)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{formatAmount(stats.monthlyAvg)} / мес.
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

      {/* Service intervals */}
      <ServiceIntervals vehicleId={vehicle.id} currentMileage={vehicle.mileage} />

      {/* Parts inventory */}
      <PartsInventory vehicleId={vehicle.id} />

      <Separator />

      {/* Expenses collapsible section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={() => setExpensesOpen(!expensesOpen)}
          >
            {expensesOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Расходы</h2>
            {expenses.length > 0 && (
              <Badge variant="secondary">{expenses.length}</Badge>
            )}
            {!expensesOpen && expenses.length > 0 && (
              <span className="text-sm text-muted-foreground ml-1">
                {formatAmount(stats?.total ?? 0)}
              </span>
            )}
          </button>
          <div className="flex items-center gap-1 sm:gap-2">
            <ImportDialog vehicleId={vehicle.id} />
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportCsv} className="sm:hidden h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
            <ExpenseDialog vehicleId={vehicle.id} />
          </div>
        </div>

        {expensesOpen && (
          <>
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

            {/* Expense list grouped by month */}
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Нет расходов. Добавьте первый!
              </div>
            ) : (
              <div className="space-y-4">
                {groupedByMonth.map((group) => (
                  <div key={group.key}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => toggleMonth(group.key)}
                    >
                      <div className="flex items-center gap-2">
                        {collapsedMonths.has(group.key) ? (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="font-medium capitalize">{formatMonthHeader(group.key)}</span>
                        <Badge variant="secondary" className="text-xs">{group.expenses.length}</Badge>
                      </div>
                      <span className="font-semibold">{formatAmount(group.total)}</span>
                    </button>

                    {!collapsedMonths.has(group.key) && (
                      <div className="mt-1 space-y-1.5">
                        {group.expenses.map((expense) => (
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
                                    {expense.bonuses ? ` (-${expense.bonuses} бонусы)` : ""}
                                  </span>
                                )}
                                {expense.parts && expense.parts.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Wrench className="h-3 w-3" />
                                    {expense.parts.length} запч.
                                    {expense.laborCost ? ` + работа ${formatAmount(expense.laborCost)}` : ""}
                                  </span>
                                )}
                                {!expense.parts?.length && expense.laborCost && (
                                  <span className="flex items-center gap-1">
                                    <Wrench className="h-3 w-3" />
                                    работа {formatAmount(expense.laborCost)}
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
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
