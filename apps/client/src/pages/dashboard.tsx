import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useVehicles } from "@/hooks/use-vehicles"
import { useExpenses } from "@/hooks/use-expenses"
import { useOverallStats } from "@/hooks/use-stats"
import { useReminders, useRecentExpenses } from "@/hooks/use-reminders"
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

export function DashboardPage() {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: stats } = useOverallStats()
  const { data: reminders = [] } = useReminders()
  const { data: recentExpenses = [] } = useRecentExpenses(5)

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

  // Cost per km for each vehicle (from initial mileage to last expense with mileage)
  const getCostPerKm = (vehicleId: string, initialMileage: number) => {
    const s = vehicleStats.get(vehicleId)
    if (!s || !s.maxMileage) return null
    const driven = s.maxMileage - initialMileage
    return driven > 0 ? Math.round((s.total / driven) * 100) / 100 : null
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        </>
      )}

      {/* Content */}
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
    </div>
  )
}
