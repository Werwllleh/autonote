import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useVehicles } from "@/hooks/use-vehicles"
import { useExpenses } from "@/hooks/use-expenses"
import { useOverallStats } from "@/hooks/use-stats"
import { useReminders, useRecentExpenses } from "@/hooks/use-reminders"
import { useMe } from "@/hooks/use-auth"
import { VehicleCard } from "@/components/vehicle-card"
import { AddVehicleDialog } from "@/components/add-vehicle-dialog"
import { QuickAddExpense } from "@/components/quick-add-expense"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Car,
  Receipt,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Fuel,
  Wrench,
  Wallet,
  TrendingUp,
  Package,
} from "lucide-react"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  })
}

function formatAmount(amount: number) {
  return amount.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return "Доброй ночи"
  if (h < 12) return "Доброе утро"
  if (h < 18) return "Добрый день"
  return "Добрый вечер"
}

export function DashboardPage() {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: stats } = useOverallStats()
  const { data: reminders = [] } = useReminders()
  const { data: recentExpenses = [] } = useRecentExpenses(5)
  const { data: user } = useMe()

  const isLoading = vehiclesLoading || expensesLoading

  const vehicleStats = useMemo(() => {
    const map = new Map<string, { total: number; maxMileage: number; byCat: Map<string, number> }>()
    for (const exp of expenses) {
      let entry = map.get(exp.vehicleId)
      if (!entry) {
        entry = { total: 0, maxMileage: 0, byCat: new Map() }
        map.set(exp.vehicleId, entry)
      }
      entry.total += exp.amount
      if (exp.mileage && exp.mileage > entry.maxMileage) {
        entry.maxMileage = exp.mileage
      }
      entry.byCat.set(
        exp.category.name,
        (entry.byCat.get(exp.category.name) || 0) + exp.amount,
      )
    }
    return map
  }, [expenses])

  const sorted = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const totalA = vehicleStats.get(a.id)?.total || 0
      const totalB = vehicleStats.get(b.id)?.total || 0
      return totalB - totalA
    })
  }, [vehicles, vehicleStats])

  const getCostPerKm = (vehicleId: string, initialMileage: number) => {
    const s = vehicleStats.get(vehicleId)
    if (!s || !s.maxMileage) return null
    const driven = s.maxMileage - initialMileage
    return driven > 0 ? Math.round((s.total / driven) * 100) / 100 : null
  }

  const monthChange = stats && stats.prevMonthTotal > 0
    ? Math.round(((stats.currentMonthTotal - stats.prevMonthTotal) / stats.prevMonthTotal) * 100)
    : null

  // Empty state
  if (!isLoading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-cyan-500/20 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50">
            <Car className="h-10 w-10 text-primary/60" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {getGreeting()}{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Начните вести учёт расходов на автомобиль. Добавьте первый автомобиль, чтобы записывать траты и анализировать статистику.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <AddVehicleDialog />
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
      {/* Greeting + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vehicles.length} {vehicles.length === 1 ? "автомобиль" : vehicles.length < 5 ? "автомобиля" : "автомобилей"} в гараже
          </p>
        </div>
        <div className="flex items-center gap-2">
          {vehicles.length > 0 && (
            <QuickAddExpense vehicles={vehicles} />
          )}
          <AddVehicleDialog />
        </div>
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
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

      {/* Stats cards */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/10">
                  <Wallet className="h-3 w-3 text-blue-500" />
                </div>
                Всего потрачено
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{formatAmount(stats.total)}</p>
              {stats.stockValue > 0 ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.count} записей
                  <span className="inline-flex items-center gap-0.5 ml-1.5">
                    <Package className="h-3 w-3" />
                    склад {formatAmount(stats.stockValue)}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">{stats.count} записей</p>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10">
                  <Calendar className="h-3 w-3 text-emerald-500" />
                </div>
                В этом месяце
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{formatAmount(stats.currentMonthTotal)}</p>
              {monthChange !== null && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${monthChange > 0 ? "text-destructive" : "text-emerald-500"}`}>
                  {monthChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{Math.abs(monthChange)}% к пред.</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-violet-500/10">
                  <Car className="h-3 w-3 text-violet-500" />
                </div>
                Автомобилей
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{vehicles.length}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/10">
                  <TrendingUp className="h-3 w-3 text-amber-500" />
                </div>
                Среднее / мес.
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
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
      )}

      {/* Vehicles grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Загрузка...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              costPerKm={getCostPerKm(v.id, v.initialMileage)}
              view="grid"
            />
          ))}
        </div>
      )}

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Последние расходы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentExpenses.map((e) => (
              <Link
                key={e.id}
                to={`/vehicles/${e.vehicleId}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent"
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
    </div>
  )
}
