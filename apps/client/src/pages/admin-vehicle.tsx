import { useParams, Link } from "react-router-dom"
import { useAdminVehicleCard } from "@/hooks/use-admin"
import { ExpenseDetailDialog } from "@/components/expense-detail-dialog"
import { CategoryPieChart } from "@/components/charts/category-pie-chart"
import { MonthlyLineChart } from "@/components/charts/monthly-line-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Gauge,
  Calendar,
  Car,
  Receipt,
  Fuel,
  BarChart3,
  Wrench,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Info,
  Package,
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

export function AdminVehiclePage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useAdminVehicleCard(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Автомобиль не найден
      </div>
    )
  }

  const { vehicle, owner, stats, expenses, parts } = data
  const hasMeta = vehicle.vin || vehicle.licensePlate || vehicle.registrationNumber || vehicle.purchaseDate || vehicle.purchasePrice || vehicle.notes
  const monthChange = stats.prevMonthTotal > 0
    ? Math.round(((stats.currentMonthTotal - stats.prevMonthTotal) / stats.prevMonthTotal) * 100)
    : null

  return (
    <div className="space-y-6">
      <Link
        to={`/admin`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад в админку
      </Link>

      {/* Vehicle info */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden">
          {vehicle.photo ? (
            <img src={`/api${vehicle.photo}`} alt="" className="h-full w-full object-cover" />
          ) : (
            <Car className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {vehicle.brand} {vehicle.model}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span>{vehicle.year}</span>
            <span className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {vehicle.mileage.toLocaleString("ru-RU")} км
            </span>
            {vehicle.licensePlate && (
              <span className="font-mono text-xs">{vehicle.licensePlate}</span>
            )}
            <span>
              Владелец: {owner.name || owner.email}
              {owner.name && <span className="text-xs"> ({owner.email})</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle metadata */}
      {hasMeta && (
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Info className="h-3.5 w-3.5" />
            <span>Информация об авто</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
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
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5" />
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/10">
                <Receipt className="h-3 w-3 text-blue-500" />
              </div>
              Всего потрачено
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-2xl font-bold">{formatAmount(stats.total)}</p>
            {stats.stockValue > 0 && (
              <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Расходы:</span>
                  <span>{formatAmount(stats.expensesTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" />Склад:</span>
                  <span>{formatAmount(stats.stockValue)}</span>
                </div>
              </div>
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
                <span>{Math.abs(monthChange)}% к пред. месяцу</span>
              </div>
            )}
          </CardContent>
        </Card>

        {stats.avgFuelCostPer100km != null && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/10">
                  <Fuel className="h-3 w-3 text-amber-500" />
                </div>
                Топливо / 100 км
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
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

        {stats.costPerKm != null && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-violet-500/10">
                  <Gauge className="h-3 w-3 text-violet-500" />
                </div>
                Стоимость км
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{stats.costPerKm.toFixed(1)} ₽</p>
            </CardContent>
          </Card>
        )}

        {stats.yearlyForecast != null && stats.yearlyForecast > 0 && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-rose-500/10">
                  <TrendingUp className="h-3 w-3 text-rose-500" />
                </div>
                Прогноз / год
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{formatAmount(stats.yearlyForecast)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{formatAmount(stats.monthlyAvg)} / мес.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Аналитика</h2>
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
        </div>
      )}

      {/* Parts inventory (read-only) */}
      {parts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Склад запчастей</h2>
            <Badge variant="secondary">{parts.length}</Badge>
          </div>
          <div className="space-y-2">
            {parts.map((part) => (
              <div key={part.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{part.name}</span>
                    {part.article && (
                      <span className="text-xs text-muted-foreground">{part.article}</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{part.quantity} шт. × {formatAmount(part.price)}</span>
                    <span className="font-medium text-foreground">
                      = {formatAmount(part.quantity * part.price)}
                    </span>
                  </div>
                </div>
                <Badge variant={part.quantity > 0 ? "secondary" : "destructive"} className="text-xs shrink-0">
                  {part.quantity} шт.
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses (read-only) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Расходы</h2>
          {expenses.length > 0 && <Badge variant="secondary">{expenses.length}</Badge>}
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Нет расходов</div>
        ) : (
          <div className="space-y-1.5">
            {expenses.map((expense) => (
              <ExpenseDetailDialog key={expense.id} expense={expense}>
                <div className="flex items-center gap-3 sm:gap-4 rounded-lg border px-3 sm:px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
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
                      {expense.laborCost != null && expense.laborCost > 0 && (
                        <span className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          работа {formatAmount(expense.laborCost)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-sm sm:text-base shrink-0">
                    {formatAmount(expense.amount)}
                  </span>
                </div>
              </ExpenseDetailDialog>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
