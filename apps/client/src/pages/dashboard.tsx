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
  Sparkles,
  ChevronRight,
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

  const monthChange =
    stats && stats.prevMonthTotal > 0
      ? Math.round(((stats.currentMonthTotal - stats.prevMonthTotal) / stats.prevMonthTotal) * 100)
      : null

  // Empty state
  if (!isLoading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center space-y-8 max-w-2xl mx-auto">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <Car className="h-10 w-10 text-slate-700 dark:text-slate-300" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1 text-xs font-mono text-slate-500 font-semibold shadow-2xs">
            [ 01 / СТАРТ ГАРАЖА ]
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
            {getGreeting()}{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto font-normal leading-relaxed">
            В вашем цифровом гараже пока пусто. Добавьте первый автомобиль, чтобы Иваныч считал регламент ТО, 
            находил проверенные запчасти и вел учет расходов.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 pt-2">
          <AddVehicleDialog />

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-500 pt-2">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-amber-500" />
              <span>Топливный трекинг</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <span>Регламент ТО и запчасти</span>
            </div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <span>Аналитика и чеки</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* 01 / Header Telemetry Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
              [ 01 / МОЙ ГАРАЖ ]
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              РЕГЛАМЕНТ АКТИВЕН
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
            ГАРАЖ И БОРТОВОЙ ЖУРНАЛ
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {getGreeting()}{user?.name ? `, ${user.name}` : ""} • {vehicles.length}{" "}
            {vehicles.length === 1 ? "автомобиль" : vehicles.length < 5 ? "автомобиля" : "автомобилей"} на контроле
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {vehicles.length > 0 && <QuickAddExpense vehicles={vehicles} />}
          <AddVehicleDialog />
        </div>
      </div>

      {/* 02 / Cockpit HUD: Ivanych Online Presence Banner */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <img
                src="/avatars/ivanych.webp"
                alt="Иваныч"
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none"
                }}
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500 font-bold">
                  AI-МЕХАНИК ИВАНЫЧ
                </span>
                <span className="text-[10px] font-mono text-slate-400">• ОНЛАЙН 24/7</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white mt-0.5">
                Помню регламенты и историю всех ваших автомобилей
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Напишите в диалог в правом нижнем углу: «Заправился на 2500р», «Какие свечи взять?» или «Что делать на ТО?» — Иваныч сразу внесет расход или сформирует смету с артикулами Автодока.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>База OEM подключена</span>
            </span>
          </div>
        </div>
      </div>

      {/* 03 / Critical Reminders Banner */}
      {reminders.length > 0 && (
        <div className="rounded-3xl border border-amber-300/80 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/20 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-300/60 dark:border-amber-700 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
                ТРЕБУЕТ ВНИМАНИЯ ПО РЕГЛАМЕНТУ:
              </div>
              <div className="space-y-1.5">
                {reminders.map((r, i) => (
                  <Link
                    key={i}
                    to={`/vehicles/${r.vehicleId}`}
                    className="flex items-center justify-between text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-amber-900 dark:hover:text-amber-300 py-1 border-b border-amber-200/60 dark:border-amber-900/60 last:border-0 transition-colors"
                  >
                    <span className={r.urgency === "critical" ? "text-rose-600 dark:text-rose-400 font-bold" : "font-medium"}>
                      • {r.title}
                    </span>
                    <span className="text-xs font-mono text-amber-700 dark:text-amber-400 shrink-0 ml-3">
                      {r.vehicleName} ↗
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 04 / Telemetry Stats Grid (Exact Landing Scale) */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Total Spent */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              <span>ВСЕГО ПОТРАЧЕНО</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Wallet className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-950 dark:text-white mt-3">
              {formatAmount(stats.total)}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-2 flex items-center gap-1.5">
              <span>{stats.count} записей</span>
              {stats.stockValue > 0 && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                    <Package className="h-3 w-3" />
                    склад {formatAmount(stats.stockValue)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Current Month */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              <span>В ЭТОМ МЕСЯЦЕ</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-950 dark:text-white mt-3">
              {formatAmount(stats.currentMonthTotal)}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-2">
              {monthChange !== null ? (
                <span
                  className={`inline-flex items-center gap-1 font-bold ${
                    monthChange > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {monthChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(monthChange)}% к прошлому месяцу
                </span>
              ) : (
                "Первый месяц учета"
              )}
            </div>
          </div>

          {/* Card 3: Vehicles Count */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              <span>АВТОМОБИЛЕЙ</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Car className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-950 dark:text-white mt-3">
              {vehicles.length}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-2">
              В гаражном реестре
            </div>
          </div>

          {/* Card 4: Average Monthly */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              <span>СРЕДНЕЕ / МЕСЯЦ</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-950 dark:text-white mt-3">
              {formatAmount(
                Object.keys(stats.byMonth).length > 0
                  ? stats.total / Object.keys(stats.byMonth).length
                  : 0,
              )}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-2">
              Базовые расходы
            </div>
          </div>

        </div>
      )}

      {/* 05 / Vehicles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
              [ 02 / АВТОМОБИЛИ ]
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
              ({sorted.length})
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-xs font-mono text-slate-400">
            Загрузка телеметрии гаража...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {/* 06 / Recent Expenses List */}
      {recentExpenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                [ 03 / ПОСЛЕДНИЕ РАСХОДЫ ]
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="space-y-3">
              {recentExpenses.map((e) => (
                <Link
                  key={e.id}
                  to={`/vehicles/${e.vehicleId}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200/70 dark:hover:border-slate-700/70 gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono text-slate-400 w-14 shrink-0 font-medium">
                      {formatDate(e.date)}
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold shrink-0">
                      {e.category.name}
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {e.description || `${e.vehicle.brand} ${e.vehicle.model}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-16 sm:pl-0">
                    <span className="text-sm font-bold font-mono text-slate-950 dark:text-white">
                      {formatAmount(e.amount)}
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-950 transition-colors">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
