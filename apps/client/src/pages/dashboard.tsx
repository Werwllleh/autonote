import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useVehicles } from "@/hooks/use-vehicles"
import { useExpenses } from "@/hooks/use-expenses"
import { useCategories } from "@/hooks/use-categories"
import { useOverallStats } from "@/hooks/use-stats"
import { useReminders, useRecentExpenses } from "@/hooks/use-reminders"
import { VehicleCard } from "@/components/vehicle-card"
import { AddVehicleDialog } from "@/components/add-vehicle-dialog"
import { QuickAddExpense } from "@/components/quick-add-expense"
import { CategoryPieChart } from "@/components/charts/category-pie-chart"
import { MonthlyLineChart } from "@/components/charts/monthly-line-chart"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Car,
  Receipt,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Fuel,
  Wrench,
} from "lucide-react"

type ViewMode = "grid" | "list"
type SortOrder = "desc" | "asc" | "name"

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
  })
}

export function DashboardPage() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: categories = [] } = useCategories()
  const { data: stats } = useOverallStats()
  const { data: reminders = [] } = useReminders()
  const { data: recentExpenses = [] } = useRecentExpenses(5)

  const isLoading = vehiclesLoading || expensesLoading

  const vehicleStats = useMemo(() => {
    const map = new Map<string, { total: number; byCat: Map<string, number> }>()
    for (const exp of expenses) {
      let entry = map.get(exp.vehicleId)
      if (!entry) {
        entry = { total: 0, byCat: new Map() }
        map.set(exp.vehicleId, entry)
      }
      entry.total += exp.amount
      entry.byCat.set(
        exp.category.name,
        (entry.byCat.get(exp.category.name) || 0) + exp.amount,
      )
    }
    return map
  }, [expenses])

  const activeCategories = useMemo(() => {
    const slugs = new Set(expenses.map((e) => e.category.slug))
    return categories.filter((c) => slugs.has(c.slug))
  }, [expenses, categories])

  const filtered = useMemo(() => {
    let list = vehicles

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (v) =>
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q),
      )
    }

    if (categoryFilter !== "all") {
      const catName = categories.find((c) => c.slug === categoryFilter)?.name
      if (catName) {
        list = list.filter((v) => {
          const s = vehicleStats.get(v.id)
          return s?.byCat.has(catName)
        })
      }
    }

    list = [...list].sort((a, b) => {
      if (sortOrder === "name") {
        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
      }
      const totalA = vehicleStats.get(a.id)?.total || 0
      const totalB = vehicleStats.get(b.id)?.total || 0
      return sortOrder === "desc" ? totalB - totalA : totalA - totalB
    })

    return list
  }, [vehicles, search, categoryFilter, sortOrder, vehicleStats, categories])

  // Cost per km for each vehicle
  const getCostPerKm = (vehicleId: string, mileage: number) => {
    const total = vehicleStats.get(vehicleId)?.total || 0
    return mileage > 0 ? Math.round((total / mileage) * 100) / 100 : null
  }

  // Month comparison
  const monthChange = stats && stats.prevMonthTotal > 0
    ? Math.round(((stats.currentMonthTotal - stats.prevMonthTotal) / stats.prevMonthTotal) * 100)
    : null

  // Empty state — onboarding
  if (!isLoading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Car className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Добро пожаловать в AutoNotes</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Начните вести учёт расходов на автомобиль. Добавьте первый автомобиль, чтобы записывать траты и анализировать статистику.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <AddVehicleDialog />
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              <span>Учёт топлива</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span>Ремонт и ТО</span>
            </div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>Аналитика</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои автомобили</h1>
        <div className="flex items-center gap-2">
          {vehicles.length > 0 && (
            <QuickAddExpense vehicles={vehicles} />
          )}
          <AddVehicleDialog />
        </div>
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                {reminders.map((r, i) => (
                  <Link
                    key={i}
                    to={`/vehicles/${r.vehicleId}`}
                    className="flex items-center justify-between text-sm hover:underline"
                  >
                    <span className={r.urgency === "critical" ? "text-destructive font-medium" : ""}>
                      {r.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {r.vehicleName}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall stats */}
      {stats && stats.count > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Receipt className="h-3 w-3" />
                  Всего расходов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatAmount(stats.total)}</p>
                <p className="text-xs text-muted-foreground">{stats.count} записей</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  В этом месяце
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatAmount(stats.currentMonthTotal)}</p>
                {monthChange !== null && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${monthChange > 0 ? "text-destructive" : "text-emerald-500"}`}>
                    {monthChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    <span>{Math.abs(monthChange)}% к пред.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  Автомобилей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Среднее / месяц
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatAmount(
                    Object.keys(stats.byMonth).length > 0
                      ? stats.total / Object.keys(stats.byMonth).length
                      : 0,
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

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

          {/* Recent expenses feed */}
          {recentExpenses.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Последние расходы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentExpenses.map((e) => (
                  <Link
                    key={e.id}
                    to={`/vehicles/${e.vehicleId}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="text-xs text-muted-foreground w-14 shrink-0">
                      {formatDate(e.date)}
                    </span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {e.category.name}
                    </Badge>
                    <span className="text-muted-foreground truncate text-xs flex-1">
                      {e.description || `${e.vehicle.brand} ${e.vehicle.model}`}
                    </span>
                    <span className="font-medium shrink-0">{formatAmount(e.amount)}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          <Separator />
        </>
      )}

      {/* Toolbar */}
      {vehicles.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[200px] sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[180px]">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {activeCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
            <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[200px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Расходы: больше</SelectItem>
              <SelectItem value="asc">Расходы: меньше</SelectItem>
              <SelectItem value="name">По названию</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Загрузка...
        </div>
      ) : filtered.length === 0 && vehicles.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">Ничего не найдено</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              costPerKm={getCostPerKm(v.id, v.mileage)}
              view="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              costPerKm={getCostPerKm(v.id, v.mileage)}
              view="list"
            />
          ))}
        </div>
      )}
    </div>
  )
}
